"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
# Debug message without emoji to avoid encoding issues on Windows consoles
print("ROUTES.PY CARGADO - Servidor iniciado correctamente")
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Usuario, Venta, Gasto, FacturaAlbaran, Proveedor, MargenObjetivo, Restaurante, AuditLog, Empresa
from api.audit_service import AuditService
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select, func, extract, desc, text
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, decode_token
from werkzeug.security import generate_password_hash, check_password_hash
from api.mail.mailer import send_reset_email
import json
import traceback
from api.email_utils import send_email
from datetime import datetime, timedelta, date
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import random
import unicodedata
from calendar import monthrange


api = Blueprint('api', __name__)


def send_email(to_email, subject, html_content):
    """
    Envía un correo utilizando SendGrid.
    - Usa EMAIL_SENDER como remitente desde .env
    - Usa SENDGRID_API_KEY para autenticación
    """

    try:
        message = Mail(
            from_email=os.getenv(
                "EMAIL_SENDER", "OhMyChef <ohmychefapp@gmail.com>"),
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )

        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sg.send(message)

        print(f"✅ Correo enviado a {to_email}")
        return True

    except Exception as e:
        print("❌ Error al enviar correo:", str(e))
        return False


@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        if not email:
            return jsonify({'success': False, 'msg': 'Correo requerido'}), 400
        user = Usuario.query.filter_by(email=email).first()
        if not user:
            return jsonify({'success': False, 'msg': 'Correo no registrado'}), 404
        token = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=30))
        result = send_reset_email(email, token)
        if result['success']:
            return jsonify({'success': True, 'msg': 'Revisa tu correo electrónico', 'token': token}), 200
        else:
            return jsonify({'success': False, 'msg': result['msg']}), 500
    except Exception as e:
        print(":x: Error en forgot-password:", str(e))
        return jsonify({'success': False, 'msg': str(e)}), 500


@api.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get("token")
        new_password = data.get("new_password")
        if not token or not new_password:
            return jsonify({"msg": "Faltan datos"}), 400
        # Verificamos el contenido del token
        try:
            decoded = decode_token(token)
            user_id = decoded["sub"]
        except Exception as e:
            return jsonify({"msg": "Token inválido o expirado"}), 401
        user = db.session.get(Usuario, user_id)
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404
        user.password = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"success": True, "msg": "Contraseña actualizada correctamente"}), 200
    except Exception as e:
        print("ERROR GENERAL:", str(e))
        return jsonify({"msg": "Error al cambiar contraseña", "error": str(e)}), 500


@api.route('/usuarios', methods=['GET'])
@jwt_required()
def get_usuarios():
    current_user = _get_current_user()

    if not current_user:
        return jsonify({"error": "No autenticado"}), 401

    # Filtrado por empresa/rol:
    # - super_admin: ve todos los usuarios (frontend ya limita a admins)
    # - admin/director: solo usuarios de su empresa
    # - otros: solo se usan en contextos específicos, devolvemos todos por ahora
    if _user_is_super_admin(current_user):
        usuarios = Usuario.query.all()
    elif _user_is_admin(current_user) or _user_is_director(current_user):
        if current_user.empresa_id:
            usuarios = Usuario.query.filter_by(empresa_id=current_user.empresa_id).all()
        else:
            usuarios = [current_user]
    else:
        usuarios = Usuario.query.all()

    resultados = []
    for u in usuarios:
        resultados.append({
            "id": u.id,
            "nombre": u.nombre,
            "email": u.email,
            "rol": u.rol,
            "status": u.status,
            "empresa_id": u.empresa_id,
            "empresa_nombre": u.empresa.nombre if getattr(u, "empresa", None) else None,
            "restaurante_id": u.restaurante_id,
            "restaurante_nombre": u.restaurante.nombre if u.restaurante else None
        })

    return jsonify(resultados), 200


def _get_current_user():
    """
    Helper sencillo para obtener el usuario actual o None.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return None
        return db.session.get(Usuario, int(current_user_id))
    except Exception:
        return None


def _user_is_super_admin(user: Usuario) -> bool:
    return bool(user and user.rol == "super_admin")


def _user_is_admin(user: Usuario) -> bool:
    return bool(user and user.rol == "admin")


def _user_is_director(user: Usuario) -> bool:
    return bool(user and user.rol == "director")


def _user_is_staff(user: Usuario) -> bool:
    """
    Cualquier rol operativo (admin, director, encargado, chef).
    """
    return bool(user and user.rol in ["admin", "director", "encargado", "chef"])


@api.route("/register", methods=["POST"])
@jwt_required(optional=True)
def register():
    print("🚀 LLAMANDO register() para crear usuario")  # Debug
    try:
        data = request.json or {}

        if not data.get("email") or not data.get("password") or not data.get("rol") or not data.get("nombre"):
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        # Normalizar email a minúsculas y sin espacios
        data["email"] = data["email"].strip().lower()

        total_users = db.session.scalar(select(func.count()).select_from(Usuario))
        current_user = _get_current_user()

        requested_role = data["rol"]

        # 1) Primer usuario del sistema -> siempre super_admin
        if total_users == 0:
            requested_role = "super_admin"
        else:
            # A partir del segundo usuario siempre debe estar autenticado
            if not current_user:
                return jsonify({"error": "No autorizado"}), 403

            # super_admin: solo crea admins (según especificación)
            if _user_is_super_admin(current_user):
                if requested_role != "admin":
                    return jsonify({"error": "El super admin solo puede crear usuarios con rol 'admin'"}), 403

            # admin: crea directores / encargados / chefs
            elif _user_is_admin(current_user):
                if requested_role not in ["director", "encargado", "chef"]:
                    return jsonify({"error": "El admin solo puede crear directores, encargados o chefs"}), 403

            # director: crea encargados / chefs
            elif _user_is_director(current_user):
                if requested_role not in ["encargado", "chef"]:
                    return jsonify({"error": "El director solo puede crear encargados o chefs"}), 403

            # otros roles no pueden crear usuarios
            else:
                return jsonify({"error": "No autorizado para crear usuarios"}), 403

        if requested_role in ["chef", "encargado"] and not data.get("restaurante_id"):
            return jsonify({"error": "Chef o encargado debe tener restaurante asignado"}), 400

        existing_user = db.session.scalar(select(Usuario).where(Usuario.email == data["email"]))
        if existing_user:
            return jsonify({"error": "Email ya registrado"}), 409

        # Guardar contraseña para el correo
        raw_password = data["password"]
        hashed_password = generate_password_hash(raw_password)
        status = data.get("status", "active")

        # Normalizar empresa_id y restaurante_id desde el payload
        raw_empresa_id = data.get("empresa_id")
        empresa_id = int(raw_empresa_id) if raw_empresa_id not in (None, "", "null") else None

        raw_restaurante_id = data.get("restaurante_id")
        restaurante_id = int(raw_restaurante_id) if raw_restaurante_id not in (None, "", "null") else None

        # Si crea un super_admin no asociamos empresa/restaurante
        if requested_role == "super_admin":
            empresa_id = None
            restaurante_id = None
        else:
            # Si no viene empresa_id y el creador tiene empresa, la heredamos
            # (pero nunca heredamos desde super_admin, cada admin tiene su propia empresa)
            if (
                not empresa_id
                and current_user
                and current_user.empresa_id
                and not _user_is_super_admin(current_user)
            ):
                empresa_id = current_user.empresa_id

            # Si el super_admin crea un admin y no se especifica empresa,
            # se crea una Empresa propia para ese admin (su "mundo" aislado).
            # En este caso, el nombre de la empresa es obligatorio.
            if _user_is_super_admin(current_user) and requested_role == "admin" and not empresa_id:
                empresa_nombre = (data.get("empresa_nombre") or "").strip()
                if not empresa_nombre:
                    return jsonify({"error": "El nombre de la empresa es obligatorio para crear un admin"}), 400
                nueva_empresa = Empresa(nombre=empresa_nombre, activo=True)
                db.session.add(nueva_empresa)
                db.session.flush()
                empresa_id = nueva_empresa.id

        new_user = Usuario(
            nombre=data["nombre"],
            email=data["email"],
            password=hashed_password,
            rol=requested_role,
            status=status,
            empresa_id=empresa_id,
            restaurante_id=restaurante_id
        )
        db.session.add(new_user)
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            restaurante = Restaurante.query.get(new_user.restaurante_id) if new_user.restaurante_id else None
            AuditService.log_create(
                table_name="usuarios",
                record_id=new_user.id,
                new_values={
                    "nombre": new_user.nombre,
                    "email": new_user.email,
                    "rol": new_user.rol,
                    "status": new_user.status,
                    "empresa_id": new_user.empresa_id,
                    "restaurante_id": new_user.restaurante_id,
                    "restaurante": restaurante.nombre if restaurante else None
                },
                description=f"Usuario creado: {new_user.nombre} ({new_user.email}) - Rol {new_user.rol}"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de creación de usuario: {log_error}")

        # 📬 Enviar correo con SendGrid (solo si no es super_admin inicial)
        try:
            from api.email_utils import send_email

            subject = "Bienvenido a OhMyChef!"
            html_content = f"""
            <h3>Hola {data['nombre']},</h3>

            <p>Tu cuenta en <strong>OhMyChef!</strong> ha sido creada exitosamente. Aquí tienes tus datos de acceso:</p>

            <ul>
              <li><strong>Rol:</strong> {requested_role}</li>
              <li><strong>Email:</strong> {data['email']}</li>
              <li><strong>Contraseña:</strong> {raw_password}</li>
            </ul>

            <p>Por seguridad, te recomendamos cambiar esta contraseña tras el primer ingreso.</p>

            <p><strong>Equipo OhMyChef</strong></p>
            <p style="font-size:0.8em;color:gray;"><em>Este mensaje ha sido generado automáticamente. No respondas a este correo.</em></p>
            """

            send_email(to_email=data["email"], subject=subject, html_content=html_content)
        except Exception as e:
            print("⚠️ Error enviando correo de bienvenida:", e)

        return jsonify({"msg": "Usuario creado correctamente"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al registrar", "detalle": str(e)}), 500


@api.route('/usuarios/<int:id>', methods=['GET'])
@jwt_required()
def obtener_usuario(id):
    usuario = Usuario.query.get(id)

    if usuario is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    resultado = {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol,
        "status": usuario.status,  # ✅ Añadido
        "empresa_id": usuario.empresa_id,
        "restaurante_id": usuario.restaurante_id,
        "restaurante_nombre": usuario.restaurante.nombre if usuario.restaurante else None  # ✅ Añadido
    }

    return jsonify(resultado), 200


@api.route('/usuarios/<int:id>', methods=['PUT'])
@jwt_required()
def editar_usuario(id):
    print(f"🚀 INICIANDO editar_usuario para ID: {id}")  # Debug
    try:
        data = request.json
        print(f"🔍 Datos recibidos: {data}")  # Debug
        current_user = _get_current_user()

        if not current_user:
            return jsonify({"error": "No autenticado"}), 401

        user_to_update = db.session.get(Usuario, id)
        if not user_to_update:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Reglas de quién puede editar a quién
        # super_admin: solo admins
        if _user_is_super_admin(current_user):
            if user_to_update.rol != "admin":
                return jsonify({"error": "El super admin solo puede editar admins"}), 403
        # admin: solo roles inferiores (director/encargado/chef)
        elif _user_is_admin(current_user):
            if user_to_update.rol not in ["director", "encargado", "chef"]:
                return jsonify({"error": "El admin solo puede editar directores, encargados o chefs"}), 403
        # director: solo roles inferiores (encargado/chef)
        elif _user_is_director(current_user):
            if user_to_update.rol not in ["encargado", "chef"]:
                return jsonify({"error": "El director solo puede editar encargados o chefs"}), 403
        else:
            return jsonify({"error": "No autorizado para editar usuarios"}), 403

        old_values = {
            "nombre": user_to_update.nombre,
            "email": user_to_update.email,
            "rol": user_to_update.rol,
            "status": user_to_update.status,
            "restaurante_id": user_to_update.restaurante_id,
            "restaurante": user_to_update.restaurante.nombre if user_to_update.restaurante else None
        }
        print(f"🔍 Valores anteriores: {old_values}")  # Debug

        user_to_update.nombre = data.get("nombre", user_to_update.nombre)
        incoming_email = data.get("email")
        if incoming_email:
            normalized_email = incoming_email.strip().lower()
            user_to_update.email = normalized_email
        else:
            user_to_update.email = user_to_update.email

        if data.get("password"):
            user_to_update.password = generate_password_hash(data["password"])

        new_rol = data.get("rol", user_to_update.rol)

        # Permitir actualizar el nombre de la empresa cuando el super_admin edita un admin
        empresa_nombre = data.get("empresa_nombre")
        if _user_is_super_admin(current_user) and user_to_update.rol == "admin" and empresa_nombre:
            empresa_nombre = empresa_nombre.strip()
            if user_to_update.empresa_id:
                empresa = db.session.get(Empresa, user_to_update.empresa_id)
                if empresa:
                    empresa.nombre = empresa_nombre
            else:
                nueva_empresa = Empresa(nombre=empresa_nombre, activo=True)
                db.session.add(nueva_empresa)
                db.session.flush()
                user_to_update.empresa_id = nueva_empresa.id

        # Control de cambios de rol según quién edita
        if _user_is_super_admin(current_user):
            # super_admin solo gestiona admins: permite cambiar status/datos, no convertir otros roles
            if user_to_update.rol == "admin":
                if new_rol != "admin":
                    return jsonify({"error": "El super admin no puede cambiar el rol del admin a otro distinto de 'admin'"}), 403
        elif _user_is_admin(current_user):
            # admin gestiona directores/encargados/chefs, sin poder subirlos a admin/super_admin
            if new_rol not in ["director", "encargado", "chef"]:
                return jsonify({"error": "El admin solo puede asignar roles director, encargado o chef"}), 403
        elif _user_is_director(current_user):
            # director gestiona encargados/chefs, sin poder subirlos a director/admin/super_admin
            if new_rol not in ["encargado", "chef"]:
                return jsonify({"error": "El director solo puede asignar roles encargado o chef"}), 403

        user_to_update.rol = new_rol

        if user_to_update.rol in ["chef", "encargado"] and not data.get("restaurante_id") and not user_to_update.restaurante_id:
            return jsonify({"error": "Chef o encargado debe tener restaurante asignado"}), 400

        # admins/directores no van ligados a un restaurante concreto
        if user_to_update.rol in ["admin", "director"]:
            user_to_update.restaurante_id = None
        else:
            user_to_update.restaurante_id = data.get(
                "restaurante_id", user_to_update.restaurante_id)

        user_to_update.status = data.get("status", user_to_update.status)

        # 🔍 Logging de auditoría detallado (ANTES del commit)
        print("🎯 INICIANDO proceso de logging...")  # Debug
        try:
            restaurante = Restaurante.query.get(user_to_update.restaurante_id) if user_to_update.restaurante_id else None
            new_values = {
                "nombre": user_to_update.nombre,
                "email": user_to_update.email,
                "rol": user_to_update.rol,
                "status": user_to_update.status,
                "restaurante_id": user_to_update.restaurante_id,
                "restaurante": restaurante.nombre if restaurante else None
            }
            print(f"🔍 Valores nuevos: {new_values}")  # Debug

            changes = []
            # Detectar cambios específicos
            if old_values["nombre"] != new_values["nombre"]:
                changes.append(f"nombre: '{old_values['nombre']}' → '{new_values['nombre']}'")
            if old_values["email"] != new_values["email"]:
                changes.append(f"email: '{old_values['email']}' → '{new_values['email']}'")
            if old_values["rol"] != new_values["rol"]:
                changes.append(f"rol: '{old_values['rol']}' → '{new_values['rol']}'")
            if old_values["status"] != new_values["status"]:
                changes.append(f"status: '{old_values['status']}' → '{new_values['status']}'")
            if old_values["restaurante"] != new_values["restaurante"]:
                changes.append(f"restaurante: '{old_values['restaurante']}' → '{new_values['restaurante']}'")
            if data.get("password"):
                changes.append("contraseña actualizada")

            if changes:
                description = f"Usuario '{user_to_update.nombre}' actualizado: {', '.join(changes)}"
            else:
                description = f"Usuario '{user_to_update.nombre}' modificado (sin cambios detectados)"

            # Log ANTES del commit para asegurar que se ejecute
            AuditService.log_update(
                table_name='usuarios',
                record_id=user_to_update.id,
                old_values=old_values,
                new_values=new_values,
                description=description
            )
            print(f"🔍 Log de auditoría guardado: {description}")  # Debug
        except Exception as log_error:
            print(f"⚠️ Error en logging de actualización de usuario: {log_error}")
            import traceback
            print(f"💥 Traceback completo: {traceback.format_exc()}")

        db.session.commit()
        response_data = user_to_update.serialize()

        return jsonify(response_data), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar usuario", "detalle": str(e)}), 500


@api.route('/usuarios/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_usuario(id):
    try:
        current_user = _get_current_user()

        if not current_user:
            return jsonify({"error": "No autenticado"}), 401

        user_to_delete = db.session.get(
            Usuario, id)
        if not user_to_delete:
            return jsonify({"error": "Usuario no encontrado"}), 404

        old_values = {
            "nombre": user_to_delete.nombre,
            "email": user_to_delete.email,
            "rol": user_to_delete.rol,
            "status": user_to_delete.status,
            "restaurante_id": user_to_delete.restaurante_id,
            "restaurante": user_to_delete.restaurante.nombre if user_to_delete.restaurante else None
        }

        # No se pueden eliminar admins (por los datos asociados)
        if user_to_delete.rol == "admin":
            return jsonify({"error": "No se permite eliminar usuarios con rol admin"}), 400

        # super_admin tampoco se elimina nunca
        if user_to_delete.rol == "super_admin":
            return jsonify({"error": "No se permite eliminar el super admin"}), 400

        # El usuario no puede eliminarse a sí mismo
        if user_to_delete.id == current_user.id:
            return jsonify({"error": "No puedes eliminar tu propia cuenta"}), 400

        # Reglas de quién puede eliminar
        if _user_is_super_admin(current_user):
            # super_admin solo toca admins, y ya hemos bloqueado su borrado
            return jsonify({"error": "El super admin no puede eliminar usuarios"}), 403
        elif _user_is_admin(current_user):
            # admin puede eliminar roles inferiores (director/encargado/chef)
            if user_to_delete.rol not in ["director", "encargado", "chef"]:
                return jsonify({"error": "El admin solo puede eliminar directores, encargados o chefs"}), 403
        elif _user_is_director(current_user):
            # director puede eliminar roles inferiores (encargado/chef)
            if user_to_delete.rol not in ["encargado", "chef"]:
                return jsonify({"error": "El director solo puede eliminar encargados o chefs"}), 403
        else:
            return jsonify({"error": "No autorizado para eliminar usuarios"}), 403

        # Verificar si el usuario tiene gastos asociados
        gastos_count = db.session.query(Gasto).filter_by(usuario_id=id).count()
        if gastos_count > 0:
            return jsonify({"error": f"No se puede eliminar el usuario. Tiene {gastos_count} gastos asociados"}), 400

        db.session.delete(user_to_delete)
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            AuditService.log_delete(
                table_name="usuarios",
                record_id=id,
                old_values=old_values,
                description=f"Usuario eliminado: {old_values.get('nombre')} ({old_values.get('email')})"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de eliminación de usuario: {log_error}")

        return jsonify({"msg": "Usuario eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar usuario", "detalle": str(e)}), 500


@api.route('/ventas', methods=['GET'])
@jwt_required()
def get_ventas():
    """
    Lista de ventas filtrada por rol/empresa:
    - super_admin: no consume esta vista desde la UI, devolvemos lista vacía.
    - admin/director: ventas solo de restaurantes de su empresa.
    - encargado/chef: ventas solo de su restaurante.
    """
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # super_admin no debe trabajar con datos operativos en la UI
    if _user_is_super_admin(current_user):
        return jsonify([]), 200

    query = Venta.query.join(Restaurante, Venta.restaurante_id == Restaurante.id)

    if _user_is_admin(current_user) or _user_is_director(current_user):
        # Admin/director -> por empresa
        if not current_user.empresa_id:
            return jsonify([]), 200
        query = query.filter(Restaurante.empresa_id == current_user.empresa_id)
    else:
        # Encargado/chef -> solo su restaurante
        if not current_user.restaurante_id:
            return jsonify([]), 200
        query = query.filter(Venta.restaurante_id == current_user.restaurante_id)

    ventas = query.all()

    resultados = []
    for v in ventas:
        resultados.append({
            "id": v.id,
            "fecha": v.fecha.isoformat(),
            "monto": v.monto,
            "turno": v.turno,
            "restaurante_id": v.restaurante_id
        })

    return jsonify(resultados), 200

    # AUTENTCACION JWT - AUTENTCACION JWT - AUTENTCACION JWT- AUTENTCACION JWT - AUTENTCACION JWT - AUTENTCACION JWT
    # - AUTENTCACION JWT - AUTENTCACION JWT - AUTENTCACION JWT - AUTENTCACION JWT


@api.route("/login", methods=["POST"])
def login():
    try:
        data = request.json

        if not data.get("email") or not data.get("password"):
            return jsonify({"error": "Faltan datos"}), 400

        email_normalized = data["email"].strip().lower()
        stm = select(Usuario).where(Usuario.email == email_normalized)
        user = db.session.execute(stm).scalar()

        if not user:
            # 🔍 Logging de intento de login con email inexistente
            try:
                AuditService.log_action(
                    action_type="LOGIN_FAILED",
                    table_name="usuarios",
                    description=f"Intento de login fallido - email no encontrado: {data['email']}"
                )
            except Exception as log_error:
                print(f"⚠️ Error en logging de login fallido (email inexistente): {log_error}")

            return jsonify({"error": "Email no encontrado"}), 404

        if user.status != "active":
            return jsonify({"success": False, "msg": "Usuario inactivo, por favor contacte con el administrador."}), 403

        if not check_password_hash(user.password, data["password"]):
            # 🔍 Logging de login fallido
            try:
                AuditService.log_login(user.id, success=False)
            except Exception as log_error:
                print(f"⚠️ Error en logging de login fallido: {log_error}")

            return jsonify({"success": False, "msg": "Email o contraseña incorrectos"}), 401

        token = create_access_token(identity=str(user.id))

        # 🔍 Logging de login exitoso
        try:
            AuditService.log_login(user.id, success=True)
        except Exception as log_error:
            print(f"⚠️ Error en logging de login exitoso: {log_error}")

        data = user.serialize()

        if user.restaurante_id:
            restaurante = db.session.get(Restaurante, user.restaurante_id)
            if restaurante:
                data["restaurante_nombre"] = restaurante.nombre

        return jsonify({
            "access_token": token,
            "user": data
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/ventas', methods=['POST'])
@jwt_required()
def crear_venta():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe crear ventas
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede crear ventas"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    fecha = data.get("fecha")
    monto = data.get("monto")
    turno = data.get("turno")
    restaurante_id = data.get("restaurante_id")

    if not fecha or not monto or not restaurante_id:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    # Normalizar restaurante_id
    try:
        restaurante_id = int(restaurante_id)
    except (TypeError, ValueError):
        return jsonify({"msg": "restaurante_id inválido"}), 400

    # Validar que el restaurante existe
    restaurante = Restaurante.query.get(restaurante_id)
    if not restaurante:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    # Reglas de pertenencia:
    # - admin/director: solo restaurantes de su empresa
    # - encargado/chef: solo su restaurante
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para crear ventas en este restaurante"}), 403
    else:
        # encargado / chef u otros
        if current_user.restaurante_id != restaurante_id:
            return jsonify({"msg": "Solo puedes crear ventas en tu propio restaurante"}), 403

    try:
        # Validar duplicados por fecha, turno y restaurante
        venta_existente = db.session.query(Venta).filter_by(
            fecha=fecha,
            turno=turno,
            restaurante_id=restaurante_id
        ).first()

        if venta_existente:
            return jsonify({"msg": "Ya existe una venta para este día y turno"}), 409

        nueva_venta = Venta(
            fecha=fecha,
            monto=monto,
            turno=turno,
            restaurante_id=restaurante_id
        )
        db.session.add(nueva_venta)
        db.session.flush()  # Para obtener el ID

        # 🔍 Logging de auditoría
        try:
            restaurante = Restaurante.query.get(restaurante_id)
            AuditService.log_create(
                table_name="ventas",
                record_id=nueva_venta.id,
                new_values={
                    "monto": float(monto),
                    "fecha": fecha,
                    "turno": turno,
                    "restaurante": restaurante.nombre if restaurante else "Desconocido"
                },
                description=f"Venta creada: {restaurante.nombre if restaurante else 'Sin restaurante'} - €{monto} ({turno})"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de venta: {log_error}")

        db.session.commit()

        # 📨 Notificación protegida
        try:
            restaurante = Restaurante.query.get(restaurante_id)
            usuario = Usuario.query.get(get_jwt_identity())

            print("✅ Venta registrada correctamente:")
            print("  Restaurante:",
                  restaurante.nombre if restaurante else "Desconocido")
            print("  Usuario:", usuario.nombre if usuario else "Sistema")

            notificar_admin_sobre_evento("venta", {
                "restaurante": restaurante.nombre if restaurante else "Desconocido",
                "monto": monto,
                "turno": turno,
                "fecha": fecha,
                "usuario": usuario.nombre if usuario else "Sistema"
            })
        except Exception as e:
            print("⚠️ Error al notificar al admin:", str(e))

        return jsonify({"msg": "Venta creada correctamente"}), 201

    except Exception as e:
        db.session.rollback()
        print("❌ ERROR en /ventas:", str(e))
        return jsonify({"msg": "Error al crear la venta", "error": str(e)}), 500


@api.route('/ventas/<int:id>', methods=['GET'])
@jwt_required()
def obtener_venta(id):
    venta = Venta.query.get(id)

    if venta is None:
        return jsonify({"msg": "Venta no encontrada"}), 404

    resultado = {
        "id": venta.id,
        "fecha": venta.fecha.isoformat(),
        "monto": venta.monto,
        "turno": venta.turno,
        "restaurante_id": venta.restaurante_id
    }

    return jsonify(resultado), 200


@api.route('/ventas/<int:id>', methods=['PUT'])
@jwt_required()
def editar_venta(id):
    venta = Venta.query.get(id)

    if venta is None:
        return jsonify({"msg": "Venta no encontrada"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    # 🔍 Guardar valores anteriores para el log
    old_values = {
        "monto": float(venta.monto) if venta.monto else 0,
        "fecha": venta.fecha.isoformat() if venta.fecha else None,
        "turno": venta.turno,
        "restaurante_id": venta.restaurante_id
    }

    venta.fecha = data.get("fecha", venta.fecha)
    venta.monto = data.get("monto", venta.monto)
    venta.turno = data.get("turno", venta.turno)
    venta.restaurante_id = data.get("restaurante_id", venta.restaurante_id)

    # 🔍 Valores nuevos para el log
    new_values = {
        "monto": float(data.get("monto", venta.monto)) if data.get("monto") else float(venta.monto) if venta.monto else 0,
        "fecha": data.get("fecha", venta.fecha.isoformat() if venta.fecha else None),
        "turno": data.get("turno", venta.turno),
        "restaurante_id": data.get("restaurante_id", venta.restaurante_id)
    }

    try:
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            restaurante = Restaurante.query.get(venta.restaurante_id)
            changes = []

            # Detectar cambios específicos
            if old_values["monto"] != new_values["monto"]:
                changes.append(f"monto: €{old_values['monto']} → €{new_values['monto']}")
            if old_values["turno"] != new_values["turno"]:
                changes.append(f"turno: {old_values['turno']} → {new_values['turno']}")
            if old_values["fecha"] != new_values["fecha"]:
                changes.append(f"fecha: {old_values['fecha']} → {new_values['fecha']}")
            if old_values["restaurante_id"] != new_values["restaurante_id"]:
                old_rest = Restaurante.query.get(old_values["restaurante_id"])
                new_rest = Restaurante.query.get(new_values["restaurante_id"])
                changes.append(f"restaurante: {old_rest.nombre if old_rest else 'N/A'} → {new_rest.nombre if new_rest else 'N/A'}")

            changes_str = ", ".join(changes) if changes else "sin cambios detectados"

            AuditService.log_update(
                table_name="ventas",
                record_id=venta.id,
                old_values=old_values,
                new_values=new_values,
                description=f"Venta editada: {restaurante.nombre if restaurante else 'Sin restaurante'} - {changes_str}"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de edición de venta: {log_error}")

        return jsonify({"msg": "Venta actualizada"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar la venta", "error": str(e)}), 500


@api.route('/ventas/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_venta(id):
    venta = Venta.query.get(id)

    if venta is None:
        return jsonify({"msg": "Venta no encontrada"}), 404

    # 🔍 Guardar datos para el log antes de eliminar
    try:
        restaurante = Restaurante.query.get(venta.restaurante_id)
        old_values = {
            "monto": float(venta.monto) if venta.monto else 0,
            "fecha": venta.fecha.isoformat() if venta.fecha else None,
            "turno": venta.turno,
            "restaurante": restaurante.nombre if restaurante else "Desconocido"
        }
    except Exception as e:
        old_values = {"error": f"No se pudieron obtener los datos: {str(e)}"}

    try:
        db.session.delete(venta)
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            AuditService.log_delete(
                table_name="ventas",
                record_id=id,
                old_values=old_values,
                description=f"Venta eliminada: {old_values.get('restaurante', 'Sin restaurante')} - €{old_values.get('monto', 0)} ({old_values.get('turno', 'Sin turno')})"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de eliminación de venta: {log_error}")

        return jsonify({"msg": "Venta eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar la venta", "error": str(e)}), 500


@api.route('/gastos', methods=['GET'])
@jwt_required()
def get_gastos():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    query = Gasto.query

    if _user_is_admin(current_user) or _user_is_director(current_user):
        if current_user.empresa_id:
            query = query.join(Restaurante).filter(Restaurante.empresa_id == current_user.empresa_id)
        else:
            query = query.filter(False)
    elif _user_is_staff(current_user):
        if current_user.restaurante_id:
            query = query.filter(Gasto.restaurante_id == current_user.restaurante_id)
        else:
            query = query.filter(False)
    # super_admin ve todos

    gastos = query.all()

    resultados = []
    for g in gastos:
        resultados.append({
            "id": g.id,
            "fecha": g.fecha.isoformat(),
            "monto": g.monto,
            "categoria": g.categoria,
            "proveedor_id": g.proveedor_id,
            "usuario_id": g.usuario_id,
            "restaurante_id": g.restaurante_id,
            "nota": g.nota,
            "archivo_adjunto": g.archivo_adjunto
        })

    return jsonify(resultados), 200


@api.route('/gastos', methods=['POST'])
@jwt_required()
def crear_gasto():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no crea gastos
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede crear gastos"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    if isinstance(data, list):
        try:
            total_gastos = 0
            gastos_creados = []

            for g in data:
                if not g.get("fecha") or not g.get("monto") or not g.get("proveedor_id") or not g.get("usuario_id") or not g.get("restaurante_id"):
                    return jsonify({"msg": "Faltan campos obligatorios en uno de los gastos"}), 400

                try:
                    restaurante_id = int(g["restaurante_id"])
                    usuario_id = int(g["usuario_id"])
                except (TypeError, ValueError):
                    return jsonify({"msg": "IDs inválidos en uno de los gastos"}), 400

                restaurante = Restaurante.query.get(restaurante_id)
                usuario = Usuario.query.get(usuario_id)
                if not restaurante or not usuario:
                    return jsonify({"msg": "Restaurante o usuario no encontrado en uno de los gastos"}), 404

                if _user_is_admin(current_user) or _user_is_director(current_user):
                    if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
                        return jsonify({"msg": "No autorizado para registrar gastos en este restaurante"}), 403
                else:
                    if current_user.restaurante_id != restaurante_id:
                        return jsonify({"msg": "Solo puedes registrar gastos en tu propio restaurante"}), 403

                nuevo_gasto = Gasto(
                    fecha=g["fecha"],
                    monto=g["monto"],
                    categoria=g.get("categoria"),
                    proveedor_id=g["proveedor_id"],
                    usuario_id=usuario_id,
                    restaurante_id=restaurante_id,
                    nota=g.get("nota"),
                    archivo_adjunto=g.get("archivo_adjunto")
                )
                db.session.add(nuevo_gasto)
                total_gastos += float(g["monto"])
                gastos_creados.append(nuevo_gasto)

                # 📨 Notificación individual
                try:
                    restaurante = Restaurante.query.get(restaurante_id)
                    usuario = Usuario.query.get(usuario_id)
                    proveedor = Proveedor.query.get(g["proveedor_id"])

                    print("📤 Gasto lote:", g["monto"], "→", restaurante.nombre)

                    notificar_admin_sobre_evento("gasto", {
                        "restaurante": restaurante.nombre if restaurante else "Desconocido",
                        "proveedor": proveedor.nombre if proveedor else "Sin proveedor",
                        "categoria": g.get("categoria"),
                        "monto": g["monto"],
                        "fecha": g["fecha"],
                        "usuario": usuario.nombre if usuario else "Sistema"
                    })
                except Exception as error_envio:
                    print("❌ Error al enviar notificación del gasto (lote):", str(
                        error_envio))

            db.session.commit()

            # 🔍 Logging de auditoría para el lote completo
            try:
                AuditService.log_create(
                    table_name="gastos",
                    record_id=None,  # No hay un ID específico para el lote
                    new_values={
                        "cantidad_gastos": len(gastos_creados),
                        "total_monto": total_gastos,
                        "fecha_registro": gastos_creados[0].fecha.isoformat() if gastos_creados else None
                    },
                    description=f"Registro de gastos: {len(gastos_creados)} gasto(s) por un total de €{total_gastos:.2f}"
                )
            except Exception as log_error:
                print(f"⚠️ Error en logging de lote de gastos: {log_error}")

            return jsonify({"msg": "Gastos registrados correctamente"}), 201

        except Exception as e:
            db.session.rollback()
            print("❌ ERROR en gastos (lote):", str(e))
            return jsonify({"msg": "Error al registrar gastos", "error": str(e)}), 500

    else:
        fecha = data.get("fecha")
        monto = data.get("monto")
        categoria = data.get("categoria")
        proveedor_id = data.get("proveedor_id")
        usuario_id = data.get("usuario_id")
        restaurante_id = data.get("restaurante_id")
        nota = data.get("nota")
        archivo_adjunto = data.get("archivo_adjunto")

        if not fecha or not monto or not proveedor_id or not usuario_id or not restaurante_id:
            return jsonify({"msg": "Faltan campos obligatorios"}), 400

        try:
            restaurante_id = int(restaurante_id)
            usuario_id = int(usuario_id)
        except (TypeError, ValueError):
            return jsonify({"msg": "IDs inválidos"}), 400

        restaurante = Restaurante.query.get(restaurante_id)
        usuario = Usuario.query.get(usuario_id)
        if not restaurante or not usuario:
            return jsonify({"msg": "Restaurante o usuario no encontrado"}), 404

        if _user_is_admin(current_user) or _user_is_director(current_user):
            if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
                return jsonify({"msg": "No autorizado para registrar gastos en este restaurante"}), 403
        else:
            if current_user.restaurante_id != restaurante_id:
                return jsonify({"msg": "Solo puedes registrar gastos en tu propio restaurante"}), 403

        try:
            nuevo_gasto = Gasto(
                fecha=fecha,
                monto=monto,
                categoria=categoria,
                proveedor_id=proveedor_id,
                usuario_id=usuario_id,
                restaurante_id=restaurante_id,
                nota=nota,
                archivo_adjunto=archivo_adjunto
            )
            db.session.add(nuevo_gasto)
            db.session.commit()

            # 📨 Notificación individual
            try:
                restaurante = Restaurante.query.get(restaurante_id)
                usuario = Usuario.query.get(usuario_id)
                proveedor = Proveedor.query.get(proveedor_id)

                print("📤 Gasto individual:", monto, "→", restaurante.nombre)
                print("✅ Gasto registrado como:",
                      usuario.nombre if usuario else "Sistema")

                notificar_admin_sobre_evento("gasto", {
                    "restaurante": restaurante.nombre if restaurante else "Desconocido",
                    "proveedor": proveedor.nombre if proveedor else "Sin proveedor",
                    "categoria": categoria,
                    "monto": monto,
                    "fecha": fecha,
                    "usuario": usuario.nombre if usuario else "Sistema"
                })
            except Exception as error_envio:
                print("❌ Error al enviar notificación del gasto:", str(error_envio))

            return jsonify({"msg": "Gasto registrado correctamente"}), 201

        except Exception as e:
            db.session.rollback()
            print("❌ ERROR en gasto individual:", str(e))
            return jsonify({"msg": "Error al registrar el gasto", "error": str(e)}), 500


@api.route('/gastos/<int:id>', methods=['GET'])
@jwt_required()
def obtener_gasto(id):
    gasto = Gasto.query.get(id)

    if gasto is None:
        return jsonify({"msg": "Gasto no encontrado"}), 404

    resultado = {
        "id": gasto.id,
        "fecha": gasto.fecha.isoformat(),
        "monto": gasto.monto,
        "categoria": gasto.categoria,
        "proveedor_id": gasto.proveedor_id,
        "usuario_id": gasto.usuario_id,
        "restaurante_id": gasto.restaurante_id,
        "nota": gasto.nota,
        "archivo_adjunto": gasto.archivo_adjunto
    }

    return jsonify(resultado), 200


@api.route('/gastos/<int:id>', methods=['PUT'])
@jwt_required()
def editar_gasto(id):
    gasto = Gasto.query.get(id)

    if gasto is None:
        return jsonify({"msg": "Gasto no encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    print("🛠️ Recibiendo para editar gasto:", data)

    # 🔍 Guardar valores anteriores para el log
    old_values = {
        "monto": float(gasto.monto) if gasto.monto else 0,
        "categoria": gasto.categoria,
        "proveedor_id": gasto.proveedor_id,
        "fecha": gasto.fecha.isoformat() if gasto.fecha else None,
        "nota": gasto.nota
    }

    fecha_nueva = data.get("fecha")
    if fecha_nueva is not None:
        try:
            gasto.fecha = datetime.fromisoformat(fecha_nueva).date()
        except ValueError:
            return jsonify({"msg": "Formato de fecha inválido"}), 400

    monto_nuevo = data.get("monto")
    if monto_nuevo is not None:
        try:
            gasto.monto = float(monto_nuevo)
        except (TypeError, ValueError):
            return jsonify({"msg": "Monto inválido"}), 400

    gasto.categoria = data.get("categoria", gasto.categoria)
    gasto.proveedor_id = data.get("proveedor_id", gasto.proveedor_id)
    gasto.usuario_id = data.get("usuario_id", gasto.usuario_id)
    gasto.restaurante_id = data.get("restaurante_id", gasto.restaurante_id)
    gasto.nota = data.get("nota", gasto.nota)
    gasto.archivo_adjunto = data.get("archivo_adjunto", gasto.archivo_adjunto)

    # 🔍 Valores nuevos para el log
    new_values = {
        "monto": float(gasto.monto) if gasto.monto else 0,
        "categoria": gasto.categoria,
        "proveedor_id": gasto.proveedor_id,
        "fecha": gasto.fecha.isoformat() if gasto.fecha else None,
        "nota": gasto.nota
    }

    try:
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            proveedor = Proveedor.query.get(gasto.proveedor_id)
            changes = []

            # Detectar cambios específicos
            if old_values["monto"] != new_values["monto"]:
                changes.append(f"monto: €{old_values['monto']} → €{new_values['monto']}")
            if old_values["categoria"] != new_values["categoria"]:
                changes.append(f"categoría: {old_values['categoria']} → {new_values['categoria']}")
            if old_values["proveedor_id"] != new_values["proveedor_id"]:
                old_prov = Proveedor.query.get(old_values["proveedor_id"])
                new_prov = Proveedor.query.get(new_values["proveedor_id"])
                changes.append(f"proveedor: {old_prov.nombre if old_prov else 'N/A'} → {new_prov.nombre if new_prov else 'N/A'}")

            changes_str = ", ".join(changes) if changes else "sin cambios detectados"

            AuditService.log_update(
                table_name="gastos",
                record_id=gasto.id,
                old_values=old_values,
                new_values=new_values,
                description=f"Gasto editado: {proveedor.nombre if proveedor else 'Sin proveedor'} - {changes_str}"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de edición de gasto: {log_error}")

        print("✅ Gasto actualizado correctamente.")
        return jsonify({"msg": "Gasto actualizado"}), 200
    except Exception as e:
        db.session.rollback()
        print("❌ Error al actualizar gasto:", str(e))
        return jsonify({"msg": "Error al actualizar el gasto", "error": str(e)}), 500


@api.route('/gastos/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_gasto(id):
    gasto = Gasto.query.get(id)
    if not gasto:
        return jsonify({"msg": "Gasto no encontrado"}), 404

    # 🔍 Guardar datos para el log antes de eliminar
    try:
        proveedor = Proveedor.query.get(gasto.proveedor_id)
        old_values = {
            "monto": float(gasto.monto) if gasto.monto else 0,
            "categoria": gasto.categoria,
            "proveedor": proveedor.nombre if proveedor else "Desconocido",
            "fecha": gasto.fecha.isoformat() if gasto.fecha else None,
            "nota": gasto.nota
        }
    except Exception as e:
        old_values = {"error": f"No se pudieron obtener los datos: {str(e)}"}

    try:
        db.session.delete(gasto)
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            AuditService.log_delete(
                table_name="gastos",
                record_id=id,
                old_values=old_values,
                description=f"Gasto eliminado: {old_values.get('proveedor', 'Sin proveedor')} - €{old_values.get('monto', 0)} ({old_values.get('categoria', 'Sin categoría')})"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de eliminación de gasto: {log_error}")

        return jsonify({"msg": "Gasto eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        print("❌ Error al eliminar gasto:", str(e))
        return jsonify({"msg": "Error al eliminar gasto", "error": str(e)}), 500


@api.route('/gastos/usuario/<int:usuario_id>', methods=['DELETE'])
@jwt_required()
def eliminar_gastos_por_usuario(usuario_id):
    try:
        gastos = Gasto.query.filter_by(usuario_id=usuario_id).all()

        if not gastos:
            return jsonify({"msg": "No hay gastos asociados a este usuario"}), 404

        for gasto in gastos:
            db.session.delete(gasto)

        db.session.commit()
        return jsonify({"msg": f"{len(gastos)} gastos eliminados para el usuario {usuario_id}"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar los gastos", "error": str(e)}), 500


@api.route('/facturas', methods=['GET'])
@jwt_required()
def get_facturas():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    query = FacturaAlbaran.query.join(
        Restaurante, FacturaAlbaran.restaurante_id == Restaurante.id
    )

    if _user_is_super_admin(current_user):
        # super_admin no usa esta vista desde la UI, pero puede ver todas
        facturas = query.all()
    elif _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id:
            facturas = []
        else:
            facturas = query.filter(
                Restaurante.empresa_id == current_user.empresa_id
            ).all()
    else:
        if not current_user.restaurante_id:
            facturas = []
        else:
            facturas = query.filter(
                FacturaAlbaran.restaurante_id == current_user.restaurante_id
            ).all()

    resultados = []
    for f in facturas:
        resultados.append({
            "id": f.id,
            "proveedor_id": f.proveedor_id,
            "restaurante_id": f.restaurante_id,
            "fecha": f.fecha.isoformat(),
            "monto": f.monto,
            "descripcion": f.descripcion
        })

    return jsonify(resultados), 200


@api.route('/facturas', methods=['POST'])
@jwt_required()
def crear_factura():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe crear facturas
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede crear facturas"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    proveedor_id = data.get("proveedor_id")
    restaurante_id = data.get("restaurante_id")
    fecha = data.get("fecha")
    monto = data.get("monto")
    descripcion = data.get("descripcion")

    if not proveedor_id or not restaurante_id or not fecha or not monto:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    # Validar restaurante
    try:
        restaurante_id = int(restaurante_id)
    except (TypeError, ValueError):
        return jsonify({"msg": "restaurante_id inválido"}), 400

    restaurante = Restaurante.query.get(restaurante_id)
    if not restaurante:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para crear facturas en este restaurante"}), 403
    else:
        if current_user.restaurante_id != restaurante_id:
            return jsonify({"msg": "Solo puedes crear facturas en tu restaurante"}), 403

    try:
        nueva_factura = FacturaAlbaran(
            proveedor_id=proveedor_id,
            restaurante_id=restaurante_id,
            fecha=fecha,
            monto=monto,
            descripcion=descripcion
        )
        db.session.add(nueva_factura)
        db.session.commit()
        return jsonify({"msg": "Factura/Albarán registrado correctamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al registrar la factura", "error": str(e)}), 500


@api.route('/facturas/<int:id>', methods=['GET'])
@jwt_required()
def obtener_factura(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    factura = FacturaAlbaran.query.get(id)

    if factura is None:
        return jsonify({"msg": "Factura no encontrada"}), 404

    restaurante = Restaurante.query.get(factura.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para ver esta factura"}), 403
    elif not _user_is_super_admin(current_user):
        if current_user.restaurante_id != factura.restaurante_id:
            return jsonify({"msg": "No autorizado para ver esta factura"}), 403

    resultado = {
        "id": factura.id,
        "proveedor_id": factura.proveedor_id,
        "restaurante_id": factura.restaurante_id,
        "fecha": factura.fecha.isoformat(),
        "monto": factura.monto,
        "descripcion": factura.descripcion
    }

    return jsonify(resultado), 200


@api.route('/facturas/<int:id>', methods=['PUT'])
@jwt_required()
def editar_factura(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe editar facturas
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede editar facturas"}), 403

    factura = FacturaAlbaran.query.get(id)

    if factura is None:
        return jsonify({"msg": "Factura no encontrada"}), 404

    restaurante_actual = Restaurante.query.get(factura.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante_actual or restaurante_actual.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para editar esta factura"}), 403
    else:
        if current_user.restaurante_id != factura.restaurante_id:
            return jsonify({"msg": "Solo puedes editar facturas de tu restaurante"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    factura.proveedor_id = data.get("proveedor_id", factura.proveedor_id)
    nuevo_restaurante_id = data.get("restaurante_id", factura.restaurante_id)
    if nuevo_restaurante_id != factura.restaurante_id:
        try:
            nuevo_restaurante_id = int(nuevo_restaurante_id)
        except (TypeError, ValueError):
            return jsonify({"msg": "restaurante_id inválido"}), 400

        nuevo_restaurante = Restaurante.query.get(nuevo_restaurante_id)
        if not nuevo_restaurante:
            return jsonify({"msg": "Nuevo restaurante no encontrado"}), 404

        if _user_is_admin(current_user) or _user_is_director(current_user):
            if not current_user.empresa_id or nuevo_restaurante.empresa_id != current_user.empresa_id:
                return jsonify({"msg": "No autorizado para mover la factura a este restaurante"}), 403
        else:
            if current_user.restaurante_id != nuevo_restaurante_id:
                return jsonify({"msg": "Solo puedes mover facturas dentro de tu restaurante"}), 403

        factura.restaurante_id = nuevo_restaurante_id
    else:
        factura.restaurante_id = nuevo_restaurante_id
    factura.fecha = data.get("fecha", factura.fecha)
    factura.monto = data.get("monto", factura.monto)
    factura.descripcion = data.get("descripcion", factura.descripcion)

    try:
        db.session.commit()
        return jsonify({"msg": "Factura actualizada"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar factura", "error": str(e)}), 500


@api.route('/facturas/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_factura(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe eliminar facturas
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede eliminar facturas"}), 403

    factura = FacturaAlbaran.query.get(id)

    if factura is None:
        return jsonify({"msg": "Factura no encontrada"}), 404

    restaurante = Restaurante.query.get(factura.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para eliminar esta factura"}), 403
    else:
        if current_user.restaurante_id != factura.restaurante_id:
            return jsonify({"msg": "Solo puedes eliminar facturas de tu restaurante"}), 403

    try:
        db.session.delete(factura)
        db.session.commit()
        return jsonify({"msg": "Factura eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar factura", "error": str(e)}), 500


@api.route('/proveedores', methods=['GET'])
@jwt_required()
def get_proveedores():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    restaurante_id = request.args.get("restaurante_id", type=int)

    # super_admin -> sin uso en la UI, pero puede ver todos o filtrar por restaurante
    if _user_is_super_admin(current_user):
        if restaurante_id:
            proveedores = Proveedor.query.filter_by(restaurante_id=restaurante_id).all()
        else:
            proveedores = Proveedor.query.all()
    elif _user_is_admin(current_user) or _user_is_director(current_user):
        # Admin / director: solo proveedores de restaurantes de su empresa
        if not current_user.empresa_id:
            proveedores = []
        else:
            query = Proveedor.query.join(
                Restaurante, Proveedor.restaurante_id == Restaurante.id
            ).filter(Restaurante.empresa_id == current_user.empresa_id)
            if restaurante_id:
                query = query.filter(Proveedor.restaurante_id == restaurante_id)
            proveedores = query.all()
    else:
        # Encargado / chef: solo proveedores de su restaurante
        if not current_user.restaurante_id:
            proveedores = []
        else:
            if restaurante_id and restaurante_id != current_user.restaurante_id:
                return jsonify({"msg": "No autorizado para ver proveedores de este restaurante"}), 403
            proveedores = Proveedor.query.filter_by(
                restaurante_id=current_user.restaurante_id
            ).all()

    resultados = [
        {
            "id": p.id,
            "nombre": p.nombre,
            "categoria": p.categoria,
            "restaurante_id": p.restaurante_id,
            "telefono": p.telefono,
            "direccion": p.direccion,
            "email_contacto": p.email_contacto
        }
        for p in proveedores
    ]
    return jsonify(resultados), 200


@api.route('/proveedores', methods=['POST'])
@jwt_required()
def crear_proveedor():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe crear proveedores
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede crear proveedores"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    nombre = data.get("nombre")
    categoria = data.get("categoria")
    restaurante_id = data.get("restaurante_id")
    telefono = data.get("telefono")
    direccion = data.get("direccion")
    email_contacto = data.get("email_contacto")

    if not nombre or not restaurante_id:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    # Normalizar y validar restaurante
    try:
        restaurante_id = int(restaurante_id)
    except (TypeError, ValueError):
        return jsonify({"msg": "restaurante_id inválido"}), 400

    restaurante = Restaurante.query.get(restaurante_id)
    if not restaurante:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    # Reglas de pertenencia
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para crear proveedores en este restaurante"}), 403
    else:
        # encargado/chef
        if current_user.restaurante_id != restaurante_id:
            return jsonify({"msg": "Solo puedes crear proveedores en tu propio restaurante"}), 403

    try:
        nuevo_proveedor = Proveedor(
            nombre=nombre,
            categoria=categoria,
            restaurante_id=restaurante_id,
            telefono=telefono,
            direccion=direccion,
            email_contacto=email_contacto,
        )
        db.session.add(nuevo_proveedor)
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            restaurante = Restaurante.query.get(nuevo_proveedor.restaurante_id) if nuevo_proveedor.restaurante_id else None
            AuditService.log_create(
                table_name="proveedores",
                record_id=nuevo_proveedor.id,
                new_values={
                    "nombre": nuevo_proveedor.nombre,
                    "categoria": nuevo_proveedor.categoria,
                    "restaurante_id": nuevo_proveedor.restaurante_id,
                    "restaurante": restaurante.nombre if restaurante else None,
                    "telefono": nuevo_proveedor.telefono,
                    "direccion": nuevo_proveedor.direccion,
                    "email_contacto": nuevo_proveedor.email_contacto
                },
                description=f"Proveedor creado: {nuevo_proveedor.nombre}"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de creación de proveedor: {log_error}")

        return jsonify({"msg": "Proveedor creado correctamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al crear proveedor", "error": str(e)}), 500


@api.route('/proveedores/<int:id>', methods=['GET'])
@jwt_required()
def obtener_proveedor(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    proveedor = Proveedor.query.get(id)

    if proveedor is None:
        return jsonify({"msg": "Proveedor no encontrado"}), 404

    # Control de acceso por empresa/restaurante
    restaurante = Restaurante.query.get(proveedor.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para ver este proveedor"}), 403
    elif not _user_is_super_admin(current_user):
        # Encargado/chef
        if current_user.restaurante_id != proveedor.restaurante_id:
            return jsonify({"msg": "No autorizado para ver este proveedor"}), 403

    resultado = {
        "id": proveedor.id,
        "nombre": proveedor.nombre,
        "categoria": proveedor.categoria,
        "restaurante_id": proveedor.restaurante_id,
        "telefono": proveedor.telefono,
        "direccion": proveedor.direccion,
        "email_contacto": proveedor.email_contacto
    }

    return jsonify(resultado), 200


@api.route('/proveedores/<int:id>', methods=['PUT'])
@jwt_required()
def editar_proveedor(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe editar proveedores
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede editar proveedores"}), 403

    proveedor = Proveedor.query.get(id)

    if proveedor is None:
        return jsonify({"msg": "Proveedor no encontrado"}), 404

    restaurante_actual = Restaurante.query.get(proveedor.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante_actual or restaurante_actual.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para editar este proveedor"}), 403
    else:
        if current_user.restaurante_id != proveedor.restaurante_id:
            return jsonify({"msg": "Solo puedes editar proveedores de tu restaurante"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    old_values = {
        "nombre": proveedor.nombre,
        "categoria": proveedor.categoria,
        "restaurante_id": proveedor.restaurante_id,
        "telefono": proveedor.telefono,
        "direccion": proveedor.direccion,
        "email_contacto": proveedor.email_contacto
    }

    proveedor.nombre = data.get("nombre", proveedor.nombre)
    proveedor.categoria = data.get("categoria", proveedor.categoria)

    nuevo_restaurante_id = data.get("restaurante_id", proveedor.restaurante_id)
    # Validar posible cambio de restaurante
    if nuevo_restaurante_id != proveedor.restaurante_id:
        try:
            nuevo_restaurante_id = int(nuevo_restaurante_id)
        except (TypeError, ValueError):
            return jsonify({"msg": "restaurante_id inválido"}), 400

        nuevo_restaurante = Restaurante.query.get(nuevo_restaurante_id)
        if not nuevo_restaurante:
            return jsonify({"msg": "Nuevo restaurante no encontrado"}), 404

        if _user_is_admin(current_user) or _user_is_director(current_user):
            if not current_user.empresa_id or nuevo_restaurante.empresa_id != current_user.empresa_id:
                return jsonify({"msg": "No autorizado para mover el proveedor a este restaurante"}), 403
        else:
            if current_user.restaurante_id != nuevo_restaurante_id:
                return jsonify({"msg": "Solo puedes mover proveedores dentro de tu restaurante"}), 403

        proveedor.restaurante_id = nuevo_restaurante_id
    else:
        proveedor.restaurante_id = nuevo_restaurante_id
    proveedor.telefono = data.get("telefono", proveedor.telefono)
    proveedor.direccion = data.get("direccion", proveedor.direccion)
    proveedor.email_contacto = data.get("email_contacto", proveedor.email_contacto)

    try:
        db.session.commit()

        # 🔍 Logging de auditoría detallado
        try:
            restaurante = Restaurante.query.get(proveedor.restaurante_id) if proveedor.restaurante_id else None
            old_restaurante = Restaurante.query.get(old_values["restaurante_id"]) if old_values["restaurante_id"] else None

            new_values = {
                "nombre": proveedor.nombre,
                "categoria": proveedor.categoria,
                "restaurante_id": proveedor.restaurante_id,
                "restaurante": restaurante.nombre if restaurante else None,
                "telefono": proveedor.telefono,
                "direccion": proveedor.direccion,
                "email_contacto": proveedor.email_contacto
            }

            old_values["restaurante"] = old_restaurante.nombre if old_restaurante else None

            changes = []
            # Detectar cambios específicos
            if old_values["nombre"] != new_values["nombre"]:
                changes.append(f"nombre: '{old_values['nombre']}' → '{new_values['nombre']}'")
            if old_values["categoria"] != new_values["categoria"]:
                changes.append(f"categoría: '{old_values['categoria']}' → '{new_values['categoria']}'")
            if old_values["restaurante"] != new_values["restaurante"]:
                changes.append(f"restaurante: '{old_values['restaurante']}' → '{new_values['restaurante']}'")
            if old_values["telefono"] != new_values["telefono"]:
                changes.append(f"teléfono: '{old_values['telefono']}' → '{new_values['telefono']}'")
            if old_values["direccion"] != new_values["direccion"]:
                changes.append(f"dirección: '{old_values['direccion']}' → '{new_values['direccion']}'")
            if old_values["email_contacto"] != new_values["email_contacto"]:
                changes.append(f"email: '{old_values['email_contacto']}' → '{new_values['email_contacto']}'")

            if changes:
                description = f"Proveedor '{proveedor.nombre}' actualizado: {', '.join(changes)}"
            else:
                description = f"Proveedor '{proveedor.nombre}' modificado (sin cambios detectados)"

            current_user_id = get_jwt_identity()
            AuditService.log_update(
                table_name='proveedores',
                record_id=proveedor.id,
                old_values=old_values,
                new_values=new_values,
                description=description
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de actualización de proveedor: {log_error}")

        return jsonify({"msg": "Proveedor actualizado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar proveedor", "error": str(e)}), 500


@api.route('/proveedores/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_proveedor(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe eliminar proveedores
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede eliminar proveedores"}), 403

    proveedor = Proveedor.query.get(id)

    if proveedor is None:
        return jsonify({"msg": "Proveedor no encontrado"}), 404

    restaurante = Restaurante.query.get(proveedor.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para eliminar este proveedor"}), 403
    else:
        if current_user.restaurante_id != proveedor.restaurante_id:
            return jsonify({"msg": "Solo puedes eliminar proveedores de tu restaurante"}), 403

    old_values = {
        "nombre": proveedor.nombre,
        "categoria": proveedor.categoria,
        "restaurante_id": proveedor.restaurante_id,
        "telefono": proveedor.telefono,
        "direccion": proveedor.direccion,
        "email_contacto": proveedor.email_contacto
    }

    try:
        db.session.delete(proveedor)
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            AuditService.log_delete(
                table_name="proveedores",
                record_id=id,
                old_values=old_values,
                description=f"Proveedor eliminado: {old_values.get('nombre')}"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de eliminación de proveedor: {log_error}")

        return jsonify({"msg": "Proveedor eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar proveedor", "error": str(e)}), 500


@api.route('/margen', methods=['GET'])
@jwt_required()
def get_margen():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # Filtrado por rol/empresa/restaurante
    if _user_is_super_admin(current_user):
        margenes = MargenObjetivo.query.all()
    elif _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id:
            margenes = []
        else:
            margenes = (
                MargenObjetivo.query
                .join(Restaurante, MargenObjetivo.restaurante_id == Restaurante.id)
                .filter(Restaurante.empresa_id == current_user.empresa_id)
                .all()
            )
    else:
        if not current_user.restaurante_id:
            margenes = []
        else:
            margenes = MargenObjetivo.query.filter_by(
                restaurante_id=current_user.restaurante_id
            ).all()

    resultados = []
    for m in margenes:
        resultados.append({
            "id": m.id,
            "restaurante_id": m.restaurante_id,
            "porcentaje_min": m.porcentaje_min,
            "porcentaje_max": m.porcentaje_max
        })

    return jsonify(resultados), 200


@api.route('/margen', methods=['POST'])
@jwt_required()
def crear_margen():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe crear márgenes operativos
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede crear márgenes"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    restaurante_id = data.get("restaurante_id")
    porcentaje_min = data.get("porcentaje_min")
    porcentaje_max = data.get("porcentaje_max")

    if not restaurante_id or porcentaje_min is None or porcentaje_max is None:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    # Validar restaurante
    try:
        restaurante_id = int(restaurante_id)
    except (TypeError, ValueError):
        return jsonify({"msg": "restaurante_id inválido"}), 400

    restaurante = Restaurante.query.get(restaurante_id)
    if not restaurante:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para crear margen en este restaurante"}), 403
    else:
        if current_user.restaurante_id != restaurante_id:
            return jsonify({"msg": "Solo puedes crear margen para tu restaurante"}), 403

    try:
        nuevo_margen = MargenObjetivo(
            restaurante_id=restaurante_id,
            porcentaje_min=porcentaje_min,
            porcentaje_max=porcentaje_max
        )
        db.session.add(nuevo_margen)
        db.session.commit()
        return jsonify({"msg": "Margen creado correctamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al crear el margen", "error": str(e)}), 500


@api.route('/margen/<int:id>', methods=['GET'])
@jwt_required()
def obtener_margen(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    margen = MargenObjetivo.query.get(id)

    if margen is None:
        return jsonify({"msg": "Margen no encontrado"}), 404

    restaurante = Restaurante.query.get(margen.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para ver este margen"}), 403
    elif not _user_is_super_admin(current_user):
        if current_user.restaurante_id != margen.restaurante_id:
            return jsonify({"msg": "No autorizado para ver este margen"}), 403

    resultado = {
        "id": margen.id,
        "restaurante_id": margen.restaurante_id,
        "porcentaje_min": margen.porcentaje_min,
        "porcentaje_max": margen.porcentaje_max
    }

    return jsonify(resultado), 200


@api.route('/margen/<int:id>', methods=['PUT'])
@jwt_required()
def editar_margen(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe editar márgenes
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede editar márgenes"}), 403

    margen = MargenObjetivo.query.get(id)

    if margen is None:
        return jsonify({"msg": "Margen no encontrado"}), 404

    restaurante_actual = Restaurante.query.get(margen.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante_actual or restaurante_actual.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para editar este margen"}), 403
    else:
        if current_user.restaurante_id != margen.restaurante_id:
            return jsonify({"msg": "Solo puedes editar márgenes de tu restaurante"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    nuevo_restaurante_id = data.get("restaurante_id", margen.restaurante_id)
    if nuevo_restaurante_id != margen.restaurante_id:
        try:
            nuevo_restaurante_id = int(nuevo_restaurante_id)
        except (TypeError, ValueError):
            return jsonify({"msg": "restaurante_id inválido"}), 400

        nuevo_restaurante = Restaurante.query.get(nuevo_restaurante_id)
        if not nuevo_restaurante:
            return jsonify({"msg": "Nuevo restaurante no encontrado"}), 404

        if _user_is_admin(current_user) or _user_is_director(current_user):
            if not current_user.empresa_id or nuevo_restaurante.empresa_id != current_user.empresa_id:
                return jsonify({"msg": "No autorizado para mover el margen a este restaurante"}), 403
        else:
            if current_user.restaurante_id != nuevo_restaurante_id:
                return jsonify({"msg": "Solo puedes mover márgenes dentro de tu restaurante"}), 403

        margen.restaurante_id = nuevo_restaurante_id
    else:
        margen.restaurante_id = nuevo_restaurante_id
    margen.porcentaje_min = data.get("porcentaje_min", margen.porcentaje_min)
    margen.porcentaje_max = data.get("porcentaje_max", margen.porcentaje_max)

    try:
        db.session.commit()
        return jsonify({"msg": "Margen actualizado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar margen", "error": str(e)}), 500


@api.route('/margen/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_margen(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    # El super_admin no debe eliminar márgenes
    if _user_is_super_admin(current_user):
        return jsonify({"msg": "El super admin no puede eliminar márgenes"}), 403

    margen = MargenObjetivo.query.get(id)

    if margen is None:
        return jsonify({"msg": "Margen no encontrado"}), 404

    restaurante = Restaurante.query.get(margen.restaurante_id)
    if _user_is_admin(current_user) or _user_is_director(current_user):
        if not current_user.empresa_id or not restaurante or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"msg": "No autorizado para eliminar este margen"}), 403
    else:
        if current_user.restaurante_id != margen.restaurante_id:
            return jsonify({"msg": "Solo puedes eliminar márgenes de tu restaurante"}), 403

    try:
        db.session.delete(margen)
        db.session.commit()
        return jsonify({"msg": "Margen eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar margen", "error": str(e)}), 500


@api.route('/restaurantes', methods=['GET'])
@jwt_required()
def get_restaurantes():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"error": "No autenticado"}), 401

    # Filtrado según rol
    if _user_is_super_admin(current_user):
        restaurantes = Restaurante.query.all()
    elif _user_is_admin(current_user) or _user_is_director(current_user):
        # Admin / director ven solo restaurantes de su empresa.
        # Si no tienen empresa asociada aún, no ven restaurantes.
        if current_user.empresa_id:
            restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
        else:
            restaurantes = []
    else:
        # Otros roles: solo su restaurante, si tienen
        if current_user.restaurante_id:
            restaurantes = Restaurante.query.filter_by(id=current_user.restaurante_id).all()
        else:
            restaurantes = []

    resultados = []
    for r in restaurantes:
        margen = None
        if hasattr(r, "margen_objetivo") and r.margen_objetivo:
            # margen_objetivo es una lista (backref), tomamos el primero
            margen_obj = r.margen_objetivo[0] if isinstance(r.margen_objetivo, list) else r.margen_objetivo
            if margen_obj:
                margen = {
                    "porcentaje_min": margen_obj.porcentaje_min,
                    "porcentaje_max": margen_obj.porcentaje_max
                }
        resultados.append({
            "id": r.id,
            "nombre": r.nombre,
            "direccion": r.direccion,
            "email_contacto": r.email_contacto,
            "telefono": r.telefono,
            "usuarios": [{
                "nombre": u.nombre,
                "id": u.id,
                "rol": u.rol
            }
                for u in r.usuarios
            ],
            "porcentaje_min": margen["porcentaje_min"] if margen else None,
            "porcentaje_max": margen["porcentaje_max"] if margen else None
        })

    return jsonify(resultados), 200


@api.route('/restaurantes', methods=['POST'])
@jwt_required()
def crear_restaurante():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"error": "No autenticado"}), 401

    # Solo admin puede crear restaurantes (no directores ni otros roles)
    if not _user_is_admin(current_user):
        return jsonify({"error": "Solo el admin puede crear restaurantes; directores y otros roles no pueden"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    nombre = data.get("nombre")
    direccion = data.get("direccion")
    email_contacto = data.get("email_contacto")
    telefono = data.get("telefono")
    porcentaje_min = data.get("porcentaje_min")
    porcentaje_max = data.get("porcentaje_max")

    if not nombre:
        return jsonify({"msg": "El campo 'nombre' es obligatorio"}), 400

    # Validar márgenes requeridos
    try:
        porcentaje_min = float(porcentaje_min)
        porcentaje_max = float(porcentaje_max)
    except (TypeError, ValueError):
        return jsonify({"msg": "Los porcentajes de margen deben ser numéricos"}), 400

    if porcentaje_min < 0 or porcentaje_max < 0 or porcentaje_min > 100 or porcentaje_max > 100:
        return jsonify({"msg": "Los porcentajes deben estar entre 0 y 100"}), 400
    if porcentaje_min > porcentaje_max:
        return jsonify({"msg": "El margen mínimo no puede ser mayor que el máximo"}), 400

    try:
        # Asociar el restaurante a la empresa del admin (si la tiene)
        empresa_id = current_user.empresa_id

        nuevo = Restaurante(
            nombre=nombre,
            direccion=direccion,
            email_contacto=email_contacto,
            telefono=telefono,
            empresa_id=empresa_id
        )
        db.session.add(nuevo)

        # Crear margen objetivo vinculado al restaurante
        margen = MargenObjetivo(
            restaurante=nuevo,
            porcentaje_min=porcentaje_min,
            porcentaje_max=porcentaje_max
        )
        db.session.add(margen)
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            AuditService.log_create(
                table_name="restaurantes",
                record_id=nuevo.id,
                new_values={
                    "nombre": nuevo.nombre,
                    "direccion": nuevo.direccion,
                    "telefono": nuevo.telefono,
                    "email_contacto": nuevo.email_contacto
                },
                description=f"Restaurante creado: {nuevo.nombre}"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de creación de restaurante: {log_error}")

        return jsonify({
            "msg": "Restaurante creado correctamente",
            "nuevo": nuevo.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al crear el restaurante", "error": str(e)}), 500


@api.route('/restaurantes/<int:id>', methods=['GET'])
@jwt_required()
def obtener_restaurante(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"error": "No autenticado"}), 401

    restaurante = Restaurante.query.get(id)

    if restaurante is None:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    # Reglas de acceso: super_admin ve todos; admin/director solo su empresa; otros solo su restaurante
    if _user_is_super_admin(current_user):
        pass
    elif _user_is_admin(current_user) or _user_is_director(current_user):
        # Admin/director solo pueden ver restaurantes de su empresa, y solo si tienen empresa asignada
        if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"error": "No autorizado para ver este restaurante"}), 403
    else:
        if current_user.restaurante_id != restaurante.id:
            return jsonify({"error": "No autorizado para ver este restaurante"}), 403

    resultado = {
        "id": restaurante.id,
        "nombre": restaurante.nombre,
        "direccion": restaurante.direccion,
        "email_contacto": restaurante.email_contacto
    }

    # Incluir margen objetivo si existe
    margen = None
    if hasattr(restaurante, "margen_objetivo") and restaurante.margen_objetivo:
        margen_obj = restaurante.margen_objetivo[0] if isinstance(restaurante.margen_objetivo, list) else restaurante.margen_objetivo
        if margen_obj:
            margen = {
                "porcentaje_min": margen_obj.porcentaje_min,
                "porcentaje_max": margen_obj.porcentaje_max
            }
    resultado["porcentaje_min"] = margen["porcentaje_min"] if margen else None
    resultado["porcentaje_max"] = margen["porcentaje_max"] if margen else None

    return jsonify(resultado), 200


@api.route('/restaurantes/<int:id>', methods=['PUT'])
@jwt_required()
def editar_restaurante(id):
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"error": "No autenticado"}), 401

    # Solo admin o director pueden editar restaurantes
    if not (_user_is_admin(current_user) or _user_is_director(current_user)):
        return jsonify({"error": "Solo admin o director pueden editar restaurantes"}), 403

    restaurante = Restaurante.query.get(id)

    if restaurante is None:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    # Restringir por empresa para admin/director: deben tener empresa y coincidir
    if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
        return jsonify({"error": "No autorizado para editar este restaurante"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Datos no recibidos"}), 400

    old_values = {
        "nombre": restaurante.nombre,
        "direccion": restaurante.direccion,
        "email_contacto": restaurante.email_contacto,
        "telefono": restaurante.telefono
    }

    # Márgenes (opcionales en edición, pero si se envían, validar)
    porcentaje_min = data.get("porcentaje_min")
    porcentaje_max = data.get("porcentaje_max")
    if porcentaje_min is not None or porcentaje_max is not None:
        try:
            porcentaje_min = float(porcentaje_min)
            porcentaje_max = float(porcentaje_max)
        except (TypeError, ValueError):
            return jsonify({"msg": "Los porcentajes de margen deben ser numéricos"}), 400
        if porcentaje_min < 0 or porcentaje_max < 0 or porcentaje_min > 100 or porcentaje_max > 100:
            return jsonify({"msg": "Los porcentajes deben estar entre 0 y 100"}), 400
        if porcentaje_min > porcentaje_max:
            return jsonify({"msg": "El margen mínimo no puede ser mayor que el máximo"}), 400
    else:
        porcentaje_min = None
        porcentaje_max = None

    restaurante.nombre = data.get("nombre", restaurante.nombre)
    restaurante.direccion = data.get("direccion", restaurante.direccion)
    restaurante.email_contacto = data.get(
        "email_contacto", restaurante.email_contacto)
    restaurante.telefono = data.get("telefono", restaurante.telefono)

    # Actualizar/crear margen antes del commit
    if porcentaje_min is not None and porcentaje_max is not None:
        margen = MargenObjetivo.query.filter_by(restaurante_id=restaurante.id).first()
        if margen:
            margen.porcentaje_min = porcentaje_min
            margen.porcentaje_max = porcentaje_max
        else:
            nuevo_margen = MargenObjetivo(
                restaurante_id=restaurante.id,
                porcentaje_min=porcentaje_min,
                porcentaje_max=porcentaje_max
            )
            db.session.add(nuevo_margen)

    try:
        db.session.commit()

        # 🔍 Logging de auditoría
        try:
            new_values = {
                "nombre": restaurante.nombre,
                "direccion": restaurante.direccion,
                "email_contacto": restaurante.email_contacto,
                "telefono": restaurante.telefono
            }
            if porcentaje_min is not None and porcentaje_max is not None:
                new_values["porcentaje_min"] = porcentaje_min
                new_values["porcentaje_max"] = porcentaje_max

            AuditService.log_update(
                table_name="restaurantes",
                record_id=restaurante.id,
                old_values=old_values,
                new_values=new_values,
                description=f"Restaurante actualizado: {restaurante.nombre}"
            )
        except Exception as log_error:
            print(f"⚠️ Error en logging de actualización de restaurante: {log_error}")

        return jsonify({"msg": "Restaurante actualizado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar restaurante", "error": str(e)}), 500


@api.route('/restaurantes/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_restaurante(id):
    try:
        # Autenticación y rol
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"error": "No autenticado"}), 401

        # Solo admin puede eliminar restaurantes (no super_admin, no director)
        if not _user_is_admin(current_user):
            return jsonify({"error": "Solo el admin puede eliminar restaurantes"}), 403

        # Obtener password desde cabecera o JSON o query
        data = request.get_json(silent=True) or {}
        admin_password = (
            request.headers.get("X-Admin-Password")
            or data.get("adminPassword")
            or request.args.get("adminPassword")
        )
        if not admin_password:
            return jsonify({"error": "Falta adminPassword"}), 400

        if not current_user.password:
            return jsonify({"error": "Password del admin no configurada"}), 500

        if not check_password_hash(current_user.password, admin_password):
            return jsonify({"error": "Contraseña del administrador incorrecta"}), 401

        # Restaurante
        restaurante = db.session.get(Restaurante, id)
        if not restaurante:
            return jsonify({"error": "Restaurante no encontrado"}), 404

        # Restringir por empresa: el admin solo puede eliminar restaurantes de su empresa
        if not current_user.empresa_id or restaurante.empresa_id != current_user.empresa_id:
            return jsonify({"error": "No autorizado para eliminar este restaurante"}), 403

        old_values = {
            "nombre": restaurante.nombre,
            "direccion": restaurante.direccion,
            "email_contacto": restaurante.email_contacto,
            "telefono": restaurante.telefono
        }

        # Conteos (evita 500 accediendo a relaciones lazy)
        ventas = Venta.query.filter_by(restaurante_id=id).count()
        gastos = Gasto.query.filter_by(restaurante_id=id).count()
        proveedores = Proveedor.query.filter_by(restaurante_id=id).count()
        usuarios = Usuario.query.filter_by(restaurante_id=id).count()

        if ventas > 0 or gastos > 0 or proveedores > 0 or usuarios > 0:
            return jsonify({
                "error": "Este restaurante tiene datos asociados y no puede ser eliminado.",
                "conteos": {
                    "ventas": ventas, "gastos": gastos,
                    "proveedores": proveedores, "usuarios": usuarios
                }
            }), 409

        # Borrado definitivo
        try:
            db.session.delete(restaurante)
            db.session.commit()

            # 🔍 Logging de auditoría
            try:
                AuditService.log_delete(
                    table_name="restaurantes",
                    record_id=id,
                    old_values=old_values,
                    description=f"Restaurante eliminado: {old_values.get('nombre')}"
                )
            except Exception as log_error:
                print(f"⚠️ Error en logging de eliminación de restaurante: {log_error}")

            return jsonify({"msg": "Restaurante eliminado correctamente"}), 200
        except IntegrityError as e:
            db.session.rollback()
            return jsonify({
                "error": "No se pudo eliminar por restricciones de integridad.",
                "detalle": str(e)
            }), 409

    except Exception as e:
        db.session.rollback()
        # Log útil para ver el motivo real del 500 en consola
        print("ERROR eliminar_restaurante:", repr(e))
        return jsonify({
            "error": "Error inesperado al eliminar el restaurante",
            "detalle": str(e)
        }), 500



@api.route("/gastos/resumen-mensual", methods=["GET"])
@jwt_required()
def resumen_gastos_mensual():
    try:
        user_id = int(get_jwt_identity())
        usuario = db.session.query(Usuario).get(user_id)

        if not usuario:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        restaurante_id = usuario.restaurante_id

        mes = int(request.args.get("mes", 0))
        anio = int(request.args.get("ano", 0))

        if not mes or not anio:
            return jsonify({"msg": "Mes y año son requeridos"}), 400

        gastos = db.session.query(
            Proveedor.nombre.label("proveedor"),
            extract("day", Gasto.fecha).label("dia"),
            func.sum(Gasto.monto).label("total")
        ).join(Proveedor).filter(
            Gasto.restaurante_id == restaurante_id,
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio
        ).group_by(Proveedor.nombre, extract("day", Gasto.fecha)).all()

        # Organizar datos en formato tipo tabla
        resumen = {}
        totales = {}
        proveedores = set()
        dias = set()

        for fila in gastos:
            proveedor = fila.proveedor
            dia = int(fila.dia)
            monto = float(fila.total)

            proveedores.add(proveedor)
            dias.add(dia)

            if proveedor not in resumen:
                resumen[proveedor] = {}
            resumen[proveedor][dia] = monto

            totales[proveedor] = totales.get(proveedor, 0) + monto

        return jsonify({
            "proveedores": sorted(proveedores),
            "dias": sorted(dias),
            "datos": resumen,
            "totales": totales
        }), 200

    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route('/cambiar-password', methods=['PUT'])
@jwt_required()
def cambiar_password():
    data = request.get_json()
    actual = data.get("actual")
    nueva = data.get("nueva")

    if not actual or not nueva:
        return jsonify({"msg": "Faltan datos"}), 400

    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if not check_password_hash(user.password, actual):
        return jsonify({"msg": "Contraseña actual incorrecta"}), 401

    user.password = generate_password_hash(nueva)
    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada correctamente"}), 200


@api.route("/gastos/porcentaje-mensual", methods=["GET"])
@jwt_required()
def porcentaje_gasto_mensual():
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)
        if not usuario or not usuario.restaurante_id:
            return jsonify({"msg": "Usuario no válido"}), 404

        restaurante_id = usuario.restaurante_id
        mes = int(request.args.get("mes", 0))
        anio = int(request.args.get("ano", 0))

        if not mes or not anio:
            return jsonify({"msg": "Mes y año requeridos"}), 400

        total_gastos = db.session.query(
            func.sum(Gasto.monto)
        ).filter(
            Gasto.restaurante_id == restaurante_id,
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio
        ).scalar() or 0

        total_ventas = db.session.query(
            func.sum(Venta.monto)
        ).filter(
            Venta.restaurante_id == restaurante_id,
            extract("month", Venta.fecha) == mes,
            extract("year", Venta.fecha) == anio
        ).scalar() or 0

        porcentaje = round((total_gastos / total_ventas)
                           * 100, 2) if total_ventas else 0

        return jsonify({
            "gastos": round(total_gastos, 2),
            "ventas": round(total_ventas, 2),
            "porcentaje": porcentaje
        }), 200

    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route('/api/encargado/resumen-porcentaje/<int:restaurante_id>/<int:mes>/<int:ano>', methods=['GET'])
@jwt_required()
def resumen_porcentaje(restaurante_id, mes, ano):

    ventas = db.session.query(func.sum(Venta.monto)).filter(
        Venta.restaurante_id == restaurante_id,
        extract('month', Venta.fecha) == mes,
        extract('year', Venta.fecha) == ano
    ).scalar() or 0

    gastos = db.session.query(func.sum(Gasto.monto)).filter(
        Gasto.restaurante_id == restaurante_id,
        extract('month', Gasto.fecha) == mes,
        extract('year', Gasto.fecha) == ano
    ).scalar() or 0

    porcentaje = round((gastos / ventas) * 100, 2) if ventas > 0 else 0

    return jsonify({
        "ventas": round(ventas, 2),
        "gastos": round(gastos, 2),
        "porcentaje": porcentaje
    }), 200


@api.route("/gastos/resumen-diario", methods=["GET"])
@jwt_required()
def resumen_diario_chef_encargado():
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)

        if not usuario or not usuario.restaurante_id:
            return jsonify({"msg": "Usuario no válido"}), 404

        restaurante_id = usuario.restaurante_id
        mes = request.args.get("mes", type=int)
        ano = request.args.get("ano", type=int)

        if not mes or not ano:
            return jsonify({"msg": "Faltan parámetros"}), 400

        # Ventas y gastos por día
        ventas_diarias = db.session.query(
            extract("day", Venta.fecha).label("dia"),
            func.sum(Venta.monto).label("ventas")
        ).filter(
            Venta.restaurante_id == restaurante_id,
            extract("month", Venta.fecha) == mes,
            extract("year", Venta.fecha) == ano
        ).group_by(
            extract("day", Venta.fecha)
        ).all()

        gastos_diarios = db.session.query(
            extract("day", Gasto.fecha).label("dia"),
            func.sum(Gasto.monto).label("gastos")
        ).filter(
            Gasto.restaurante_id == restaurante_id,
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == ano
        ).group_by(
            extract("day", Gasto.fecha)
        ).all()

        ventas_dict = {int(v.dia): float(v.ventas) for v in ventas_diarias}
        gastos_dict = {int(g.dia): float(g.gastos) for g in gastos_diarios}

        # --- ACUMULADOS ---
        acum_ventas = 0.0
        acum_gastos = 0.0
        resumen = []

        dias = sorted(set(ventas_dict.keys()) | set(gastos_dict.keys()))
        for dia in dias:
            v = ventas_dict.get(dia, 0.0)
            g = gastos_dict.get(dia, 0.0)

            acum_ventas += v
            acum_gastos += g

            porcentaje = round((acum_gastos / acum_ventas)
                               * 100, 2) if acum_ventas > 0 else 0.0

            resumen.append({
                "dia": dia,
                "ventas": v,               # ventas SOLO del día
                "gastos": g,               # gastos SOLO del día
                "acum_ventas": acum_ventas,  # acumulado hasta ese día
                "acum_gastos": acum_gastos,  # acumulado hasta ese día
                "porcentaje": porcentaje    # % acumulado hasta ese día
            })

        return jsonify(resumen), 200

    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route("/admin/gastos/resumen-diario", methods=["GET"])
@jwt_required()
def resumen_diario_admin():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        # Solo super_admin, admin o director
        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        restaurante_id = request.args.get("restaurante_id", type=int)
        mes = request.args.get("mes", type=int)
        ano = request.args.get("ano", type=int)

        if not restaurante_id or not mes or not ano:
            return jsonify({"msg": "Faltan parámetros"}), 400

        # Verificar que el restaurante pertenece a la empresa del usuario (si aplica)
        if restaurante_id and current_user.empresa_id:
            restaurante = Restaurante.query.get(restaurante_id)
            if restaurante and restaurante.empresa_id and restaurante.empresa_id != current_user.empresa_id:
                return jsonify({"msg": "No autorizado para ver este restaurante"}), 403

        ventas_diarias = db.session.query(
            extract("day", Venta.fecha).label("dia"),
            func.sum(Venta.monto).label("ventas")
        ).filter(
            Venta.restaurante_id == restaurante_id,
            extract("month", Venta.fecha) == mes,
            extract("year", Venta.fecha) == ano
        ).group_by(
            extract("day", Venta.fecha)
        ).all()

        gastos_diarios = db.session.query(
            extract("day", Gasto.fecha).label("dia"),
            func.sum(Gasto.monto).label("gastos")
        ).filter(
            Gasto.restaurante_id == restaurante_id,
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == ano
        ).group_by(
            extract("day", Gasto.fecha)
        ).all()

        resumen = []
        dias = set()

        ventas_dict = {int(v.dia): float(v.ventas) for v in ventas_diarias}
        gastos_dict = {int(g.dia): float(g.gastos) for g in gastos_diarios}
        dias.update(ventas_dict.keys())
        dias.update(gastos_dict.keys())

        for dia in sorted(dias):
            ventas = ventas_dict.get(dia, 0)
            gastos = gastos_dict.get(dia, 0)
            porcentaje = round((gastos / ventas) * 100, 2) if ventas > 0 else 0

            resumen.append({
                "dia": dia,
                "ventas": ventas,
                "gastos": gastos,
                "porcentaje": porcentaje
            })

        return jsonify(resumen), 200

    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route('/gastos/categorias-resumen', methods=['GET'])
@jwt_required()
def gastos_por_categoria():
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)

        if not usuario or not usuario.restaurante_id:
            return jsonify({"msg": "Usuario no válido"}), 404

        restaurante_id = usuario.restaurante_id
        mes = int(request.args.get("mes", 0))
        ano = int(request.args.get("ano", 0))

        if not mes or not ano:
            return jsonify({"msg": "Mes y año requeridos"}), 400

        resumen = db.session.query(
            Gasto.categoria,
            func.sum(Gasto.monto).label("total")
        ).filter(
            Gasto.restaurante_id == restaurante_id,
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == ano
        ).group_by(Gasto.categoria).all()

        resultado = [{"categoria": r.categoria or "Sin categoría",
                      "total": float(r.total)} for r in resumen]

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route("/ventas/resumen-diario", methods=["GET"])
@jwt_required()
def resumen_ventas_diario():
    try:
        user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(user_id)

        if not usuario or not usuario.restaurante_id:
            return jsonify({"msg": "Usuario no válido"}), 404

        restaurante_id = usuario.restaurante_id
        mes = int(request.args.get("mes", 0))
        ano = int(request.args.get("ano", 0))

        if not mes or not ano:
            return jsonify({"msg": "Mes y año requeridos"}), 400

        ventas_diarias = db.session.query(
            extract("day", Venta.fecha).label("dia"),
            func.sum(Venta.monto).label("monto")
        ).filter(
            Venta.restaurante_id == restaurante_id,
            extract("month", Venta.fecha) == mes,
            extract("year", Venta.fecha) == ano
        ).group_by(
            extract("day", Venta.fecha)
        ).order_by(
            extract("day", Venta.fecha)
        ).all()

        resultado = [{"dia": int(row.dia), "monto": float(row.monto)}
                     for row in ventas_diarias]

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route('/admin/resumen-general', methods=['GET'])
@jwt_required()
def resumen_general_admin():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        # Solo super_admin, admin o director
        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        # Obtener mes y año actual si no se pasan como query
        from datetime import datetime
        mes = int(request.args.get("mes", datetime.now().month))
        anio = int(request.args.get("ano", datetime.now().year))

        # Filtrar restaurantes según empresa si no es super_admin
        if _user_is_super_admin(current_user):
            restaurantes = Restaurante.query.all()
        else:
            if current_user.empresa_id:
                restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
            else:
                restaurantes = Restaurante.query.all()
        resumen = []

        for r in restaurantes:
            # Ventas totales del mes
            total_ventas = db.session.query(
                db.func.sum(Venta.monto)
            ).filter(
                Venta.restaurante_id == r.id,
                db.extract("month", Venta.fecha) == mes,
                db.extract("year", Venta.fecha) == anio
            ).scalar() or 0

            # Gastos totales del mes
            total_gastos = db.session.query(
                db.func.sum(Gasto.monto)
            ).filter(
                Gasto.restaurante_id == r.id,
                db.extract("month", Gasto.fecha) == mes,
                db.extract("year", Gasto.fecha) == anio
            ).scalar() or 0

            porcentaje_gasto = round(
                (total_gastos / total_ventas) * 100, 2) if total_ventas > 0 else 0

            resumen.append({
                "restaurante_id": r.id,
                "nombre": r.nombre,
                "venta_total": round(total_ventas, 2),
                "porcentaje_gasto": porcentaje_gasto
            })

        return jsonify(resumen), 200

    except Exception as e:
        return jsonify({"msg": "Error al generar el resumen", "error": str(e)}), 500


@api.route("/admin/ventas-diarias", methods=["GET"])
@jwt_required()
def ventas_diarias_admin():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        restaurante_id = request.args.get("restaurante_id")
        mes = int(request.args.get("mes"))
        ano = int(request.args.get("ano"))

        if not restaurante_id or not mes or not ano:
            return jsonify({"msg": "Faltan parámetros"}), 400

        # Verificar empresa si aplica
        if restaurante_id and current_user.empresa_id:
            restaurante = Restaurante.query.get(int(restaurante_id))
            if restaurante and restaurante.empresa_id and restaurante.empresa_id != current_user.empresa_id:
                return jsonify({"msg": "No autorizado para ver este restaurante"}), 403

        ventas = db.session.query(Venta).filter(
            Venta.restaurante_id == restaurante_id,
            extract("month", Venta.fecha) == mes,
            extract("year", Venta.fecha) == ano
        ).order_by(Venta.fecha.asc()).all()

        return jsonify([v.serialize() for v in ventas]), 200

    except Exception as e:
        return jsonify({"msg": "Error cargando ventas diarias", "error": str(e)}), 500


@api.route('/admin/resumen-porcentaje', methods=['GET'])
@jwt_required()
def admin_resumen_porcentaje():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        restaurante_id = request.args.get("restaurante_id")
        mes = int(request.args.get("mes"))
        ano = int(request.args.get("ano"))

        if not restaurante_id or not mes or not ano:
            return jsonify({"msg": "Parámetros incompletos"}), 400

        # Verificar empresa si aplica
        if restaurante_id and current_user.empresa_id:
            restaurante = Restaurante.query.get(int(restaurante_id))
            if restaurante and restaurante.empresa_id and restaurante.empresa_id != current_user.empresa_id:
                return jsonify({"msg": "No autorizado para ver este restaurante"}), 403

        total_ventas = db.session.query(func.sum(Venta.monto)).filter(
            Venta.restaurante_id == restaurante_id,
            extract('month', Venta.fecha) == mes,
            extract('year', Venta.fecha) == ano
        ).scalar() or 0

        total_gastos = db.session.query(func.sum(Gasto.monto)).filter(
            Gasto.restaurante_id == restaurante_id,
            extract('month', Gasto.fecha) == mes,
            extract('year', Gasto.fecha) == ano
        ).scalar() or 0

        porcentaje = round((total_gastos / total_ventas) *
                           100, 2) if total_ventas > 0 else 0
        promedio_diario = round(
            total_ventas / 30, 2) if total_ventas > 0 else 0
        proyeccion = round((total_ventas / (mes * 30)) * 30,
                           2) if mes > 0 and total_ventas > 0 else 0

        return jsonify({
            "total_ventas": round(total_ventas, 2),
            "total_gastos": round(total_gastos, 2),
            "porcentaje_gasto": porcentaje,
            "promedio_diario": promedio_diario,
            "proyeccion_mensual": proyeccion
        }), 200

    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route("/admin/gastos/por-dia", methods=["GET"])
@jwt_required()
def gastos_por_dia_admin():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        # Solo super_admin, admin o director
        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        mes = int(request.args.get("mes", 0))
        anio = int(request.args.get("ano", 0))
        if not mes or not anio:
            return jsonify({"msg": "Mes y año requeridos"}), 400

        # Base query de gastos
        gastos_query = db.session.query(Gasto).join(Restaurante, Gasto.restaurante_id == Restaurante.id).filter(
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio
        )

        # Si no es super_admin y tiene empresa, limitar a su empresa
        if not _user_is_super_admin(current_user) and current_user.empresa_id:
            gastos_query = gastos_query.filter(Restaurante.empresa_id == current_user.empresa_id)

        total_gastado = db.session.query(func.sum(Gasto.monto)).select_from(gastos_query.subquery()).scalar() or 0

        # Restaurantes activos dentro del alcance
        restaurantes_query = Restaurante.query.filter(Restaurante.activo == True)
        if not _user_is_super_admin(current_user) and current_user.empresa_id:
            restaurantes_query = restaurantes_query.filter(Restaurante.empresa_id == current_user.empresa_id)
        restaurantes_activos = restaurantes_query.count()

        # Proveedor más usado dentro del alcance
        proveedor_mas_usado = db.session.query(
            Proveedor.nombre, func.count(Gasto.id).label("cantidad")
        ).join(Gasto, Gasto.proveedor_id == Proveedor.id).join(Restaurante, Gasto.restaurante_id == Restaurante.id).filter(
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio
        ).group_by(Proveedor.nombre)

        if not _user_is_super_admin(current_user) and current_user.empresa_id:
            proveedor_mas_usado = proveedor_mas_usado.filter(Restaurante.empresa_id == current_user.empresa_id)

        proveedor_mas_usado = proveedor_mas_usado.order_by(desc("cantidad")).first()

        proveedor_nombre = proveedor_mas_usado[0] if proveedor_mas_usado else "Sin datos"

        restaurante_top_query = db.session.query(
            Restaurante.nombre, func.sum(Gasto.monto).label("total")
        ).join(Gasto, Gasto.restaurante_id == Restaurante.id).filter(
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio
        )
        if not _user_is_super_admin(current_user) and current_user.empresa_id:
            restaurante_top_query = restaurante_top_query.filter(Restaurante.empresa_id == current_user.empresa_id)

        restaurante_top = restaurante_top_query.group_by(Restaurante.nombre).order_by(desc("total")).first()
        restaurante_nombre = restaurante_top[0] if restaurante_top else "Sin datos"
        return jsonify({
            "total_gastado": round(total_gastado, 2),
            "restaurantes_activos": restaurantes_activos,
            "proveedor_top": proveedor_nombre,
            "restaurante_top": restaurante_nombre
        }), 200
    except Exception as e:
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


# NUEVOS ENDPOINTS gASTOS

@api.route('/resumen-gastos', methods=['GET'])
@jwt_required()
def resumen_gastos_admin():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        # Solo super_admin, admin o director
        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        from datetime import datetime
        mes = int(request.args.get("mes", datetime.now().month))
        ano = int(request.args.get("ano", datetime.now().year))

        # Filtrar restaurantes según empresa si aplica
        if _user_is_super_admin(current_user):
            restaurantes = Restaurante.query.all()
        else:
            if current_user.empresa_id:
                restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
            else:
                restaurantes = []

        total_gastado = 0
        proveedor_contador = {}
        restaurante_gastos = {}
        for r in restaurantes:
            # Gastos totales del restaurante
            gastos = Gasto.query.filter(
                Gasto.restaurante_id == r.id,
                db.extract("month", Gasto.fecha) == mes,
                db.extract("year", Gasto.fecha) == ano
            ).all()
            for g in gastos:
                total_gastado += g.monto
                # Contar proveedores
                if g.proveedor_id:
                    proveedor_contador[g.proveedor_id] = proveedor_contador.get(
                        g.proveedor_id, 0) + 1
            # Sumar gasto total por restaurante
            restaurante_gastos[r.nombre] = restaurante_gastos.get(
                r.nombre, 0) + sum([g.monto for g in gastos])
        # Proveedor más usado
        proveedor_top = "No disponible"
        if proveedor_contador:
            proveedor_id = max(proveedor_contador, key=proveedor_contador.get)
            proveedor = Proveedor.query.get(proveedor_id)
            proveedor_top = proveedor.nombre if proveedor else "No disponible"
        # Restaurante con más gasto
        restaurante_top = "No disponible"
        if restaurante_gastos:
            restaurante_top = max(restaurante_gastos,
                                  key=restaurante_gastos.get)
        resumen = {
            "total_gastado": round(total_gastado, 2),
            "restaurantes_activos": len(restaurantes),
            "proveedor_top": proveedor_top,
            "restaurante_top": restaurante_top
        }
        return jsonify(resumen), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener el resumen", "error": str(e)}), 500


@api.route("/gasto-por-restaurante", methods=["GET"])
@jwt_required()
def gasto_por_restaurante():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        # Obtener parámetros de la URL
        mes_str = request.args.get("mes")
        ano_str = request.args.get("ano")
        # Validación: asegurarse de que existan ambos parámetros
        if not mes_str or not ano_str:
            return jsonify({"msg": "Faltan parámetros 'mes' y 'ano'"}), 422
        # Convertir a enteros
        mes = int(mes_str)
        ano = int(ano_str)
        # Obtener restaurantes según empresa
        if _user_is_super_admin(current_user):
            restaurantes = Restaurante.query.all()
        else:
            if current_user.empresa_id:
                restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
            else:
                restaurantes = []
        resultado = []
        for r in restaurantes:
            gastos = db.session.query(db.func.sum(Gasto.monto)).filter(
                Gasto.restaurante_id == r.id,
                db.extract("month", Gasto.fecha) == mes,
                db.extract("year", Gasto.fecha) == ano
            ).scalar() or 0
            resultado.append({
                "restaurante": r.nombre,
                "total_gastado": round(gastos, 2)
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({
            "msg": "Error al obtener los gastos por restaurante",
            "error": str(e)
        }), 500


@api.route('/gasto-evolucion-mensual', methods=['GET'])
@jwt_required()
def evolucion_gasto_mensual():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        from datetime import datetime
        ano = int(request.args.get("ano", datetime.now().year))

        # Obtener restaurantes según empresa
        if _user_is_super_admin(current_user):
            restaurantes = Restaurante.query.all()
        else:
            if current_user.empresa_id:
                restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
            else:
                restaurantes = []
        if not restaurantes:
            return jsonify([]), 200
        resultado = []
        # Por cada mes del año
        for mes in range(1, 13):
            total_mes = 0
            for restaurante in restaurantes:
                gastos = Gasto.query.filter(
                    Gasto.restaurante_id == restaurante.id,
                    db.extract('year', Gasto.fecha) == ano,
                    db.extract('month', Gasto.fecha) == mes
                ).all()
                total_mes += sum([g.monto for g in gastos])
            resultado.append({
                "mes": mes,
                "total_gastado": round(total_mes, 2)
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"msg": "Error al calcular la evolución mensual", "error": str(e)}), 500


@api.route('/proveedores-top', methods=['GET'])
@jwt_required()
def get_proveedores_top():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
        return jsonify({"msg": "Acceso no autorizado"}), 403

    mes = request.args.get("mes")
    ano = request.args.get("ano")
    if not mes or not ano:
        return jsonify({"msg": "Parámetros mes y año requeridos"}), 400
    try:
        query = (
            db.session.query(
                Proveedor.nombre,
                func.count(Gasto.id).label("veces_usado"),
                func.sum(Gasto.monto).label("total_gastado")
            )
            .join(Gasto, Gasto.proveedor_id == Proveedor.id)
            .join(Restaurante, Gasto.restaurante_id == Restaurante.id)
            .filter(func.extract("month", Gasto.fecha) == int(mes))
            .filter(func.extract("year", Gasto.fecha) == int(ano))
        )

        if not _user_is_super_admin(current_user) and current_user.empresa_id:
            query = query.filter(Restaurante.empresa_id == current_user.empresa_id)

        resultados = (
            query
            .group_by(Proveedor.nombre)
            .order_by(func.sum(Gasto.monto).desc())
            .limit(5)
            .all()
        )
        data = []
        for nombre, veces_usado, total_gastado in resultados:
            data.append({
                "nombre": nombre,
                "veces_usado": veces_usado,
                "total_gastado": float(total_gastado) if total_gastado else 0.0
            })
        return jsonify(data), 200
    except Exception as e:
        print("Error en get_proveedores_top:", e)
        return jsonify({"msg": "Error al obtener proveedores", "error": str(e)}), 500

# Endpoints Vista Ventas


@api.route('/resumen-ventas', methods=['GET'])
@jwt_required()
def resumen_ventas_admin():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        from datetime import datetime
        mes = int(request.args.get("mes", datetime.now().month))
        ano = int(request.args.get("ano", datetime.now().year))

        # Restaurantes según empresa
        if _user_is_super_admin(current_user):
            restaurantes = Restaurante.query.all()
        else:
            if current_user.empresa_id:
                restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
            else:
                restaurantes = []
        total_vendido = 0
        restaurante_ventas = {}
        for r in restaurantes:
            ventas = Venta.query.filter(
                Venta.restaurante_id == r.id,
                db.extract("month", Venta.fecha) == mes,
                db.extract("year", Venta.fecha) == ano
            ).all()
            monto_total_restaurante = sum([v.monto for v in ventas])
            total_vendido += monto_total_restaurante
            restaurante_ventas[r.nombre] = monto_total_restaurante
        restaurante_top = "No disponible"
        if restaurante_ventas:
            restaurante_top = max(restaurante_ventas,
                                  key=restaurante_ventas.get)
        promedio_por_restaurante = (
            round(total_vendido / len(restaurante_ventas), 2)
            if restaurante_ventas else 0
        )
        resumen = {
            "total_vendido": round(total_vendido, 2),
            "restaurantes_con_ventas": len(restaurante_ventas),
            "restaurante_top": restaurante_top,
            "promedio_por_restaurante": promedio_por_restaurante
        }
        return jsonify(resumen), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener el resumen de ventas", "error": str(e)}), 500


@api.route('/venta-evolucion-mensual', methods=['GET'])
@jwt_required()
def evolucion_venta_mensual():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        from datetime import datetime
        ano = int(request.args.get("ano", datetime.now().year))

        if _user_is_super_admin(current_user):
            restaurantes = Restaurante.query.all()
        else:
            if current_user.empresa_id:
                restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
            else:
                restaurantes = []
        if not restaurantes:
            return jsonify([]), 200
        resultado = []
        for mes in range(1, 13):
            total_mes = 0
            for restaurante in restaurantes:
                ventas = Venta.query.filter(
                    Venta.restaurante_id == restaurante.id,
                    db.extract('year', Venta.fecha) == ano,
                    db.extract('month', Venta.fecha) == mes
                ).all()
                total_mes += sum([v.monto for v in ventas])
            resultado.append({
                "mes": mes,
                "total_vendido": round(total_mes, 2)
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"msg": "Error al calcular la evolución mensual de ventas", "error": str(e)}), 500


@api.route("/ventas-por-restaurante", methods=["GET"])
@jwt_required()
def ventas_por_restaurante():
    try:
        current_user = _get_current_user()
        if not current_user:
            return jsonify({"msg": "No autenticado"}), 401

        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"msg": "Acceso no autorizado"}), 403

        mes_str = request.args.get("mes")
        ano_str = request.args.get("ano")
        if not mes_str or not ano_str:
            return jsonify({"msg": "Faltan parámetros 'mes' y 'ano'"}), 422
        mes = int(mes_str)
        ano = int(ano_str)

        if _user_is_super_admin(current_user):
            restaurantes = Restaurante.query.all()
        else:
            if current_user.empresa_id:
                restaurantes = Restaurante.query.filter_by(empresa_id=current_user.empresa_id).all()
            else:
                restaurantes = []
        resultado = []
        for r in restaurantes:
            ventas = db.session.query(db.func.sum(Venta.monto)).filter(
                Venta.restaurante_id == r.id,
                db.extract("month", Venta.fecha) == mes,
                db.extract("year", Venta.fecha) == ano
            ).scalar() or 0
            resultado.append({
                "restaurante": r.nombre,
                "total_vendido": round(ventas, 2)
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({
            "msg": "Error al obtener las ventas por restaurante",
            "error": str(e)
        }), 500


@api.route('/restaurantes-top', methods=['GET'])
@jwt_required()
def get_restaurantes_top():
    current_user = _get_current_user()
    if not current_user:
        return jsonify({"msg": "No autenticado"}), 401

    if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
        return jsonify({"msg": "Acceso no autorizado"}), 403

    mes = request.args.get("mes")
    ano = request.args.get("ano")
    if not mes or not ano:
        return jsonify({"msg": "Parámetros mes y año requeridos"}), 400
    try:
        query = (
            db.session.query(
                Restaurante.nombre,
                func.count(Venta.id).label("ventas_realizadas"),
                func.sum(Venta.monto).label("total_vendido")
            )
            .join(Venta, Venta.restaurante_id == Restaurante.id)
            .filter(func.extract("month", Venta.fecha) == int(mes))
            .filter(func.extract("year", Venta.fecha) == int(ano))
        )

        if not _user_is_super_admin(current_user) and current_user.empresa_id:
            query = query.filter(Restaurante.empresa_id == current_user.empresa_id)

        resultados = (
            query
            .group_by(Restaurante.nombre)
            .order_by(func.sum(Venta.monto).desc())
            .limit(5)
            .all()
        )
        data = []
        for nombre, ventas_realizadas, total_vendido in resultados:
            data.append({
                "nombre": nombre,
                "ventas_realizadas": ventas_realizadas,
                "total_vendido": float(total_vendido) if total_vendido else 0.0
            })
        return jsonify(data), 200
    except Exception as e:
        print("Error en get_restaurantes_top:", e)
        return jsonify({"msg": "Error al obtener restaurantes top", "error": str(e)}), 500

# aLERT BORRAR rESTAURANTE


@api.route('/restaurantes/<int:id>/tiene-ventas', methods=['GET'])
@jwt_required()
def restaurante_tiene_ventas(id):
    try:
        ventas = Venta.query.filter_by(restaurante_id=id).first()
        tiene_ventas = ventas is not None
        return jsonify({"tieneVentas": tiene_ventas}), 200
    except Exception as e:
        return jsonify({"msg": "Error al verificar ventas del restaurante", "error": str(e)}), 500

# Nuevo endpoint Ventas


@api.route('/ventas/encargado', methods=['GET'])
@jwt_required()
def obtener_ventas_encargado():
    mes = request.args.get("mes", type=int)
    ano = request.args.get("ano", type=int)
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user or not user.restaurante_id:
        return jsonify({"msg": "Usuario no válido o sin restaurante asignado"}), 400
    try:
        ventas = Venta.query.filter(
            Venta.restaurante_id == user.restaurante_id,
            db.extract("month", Venta.fecha) == mes,
            db.extract("year", Venta.fecha) == ano
        ).all()
        resultados = []
        for v in ventas:
            resultados.append({
                "id": v.id,
                "fecha": v.fecha.isoformat(),
                "monto": v.monto,
                "turno": v.turno,
                "restaurante_id": v.restaurante_id
            })
        return jsonify(resultados), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener ventas", "error": str(e)}), 500


@api.route("/ventas-detalle", methods=["GET"])
@jwt_required()
def ventas_detalle_por_restaurante():
    try:
        mes = request.args.get("mes")
        ano = request.args.get("ano")
        restaurante_id = request.args.get("restaurante_id")
        if not mes or not ano or not restaurante_id:
            return jsonify({"msg": "Faltan parámetros"}), 422
        ventas = Venta.query.filter(
            Venta.restaurante_id == int(restaurante_id),
            db.extract("month", Venta.fecha) == int(mes),
            db.extract("year", Venta.fecha) == int(ano)
        ).all()
        return jsonify([v.serialize() for v in ventas]), 200
    except Exception as e:
        return jsonify({
            "msg": "Error al obtener ventas detalladas",
            "error": str(e)
        }), 500


@api.route("/ping", methods=["GET"])
def ping():
    """
    Endpoint ligero para mantener vivo el backend en Render.
    No consulta la base de datos, solo responde con un estado básico.
    """
    return jsonify({"status": "ok"}), 200


def limpiar_email(texto):
    texto = unicodedata.normalize('NFKD', texto).encode(
        'ascii', 'ignore').decode('utf-8')
    return texto.lower().replace(' ', '').replace('&', '')

# ✅ Validación de sesión: /api/private
@api.route("/private", methods=["GET"])
@jwt_required()
def private():
    try:
        # En /login guardas identity como str → aquí lo conviertes a int
        user_id = int(get_jwt_identity())
        user = Usuario.query.get(user_id)
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        data = user.serialize()

        # Agrega el nombre del restaurante si existe (igual que en /login)
        if user.restaurante_id:
            r = Restaurante.query.get(user.restaurante_id)
            if r:
                data["restaurante_nombre"] = r.nombre

        # Agrega información de empresa si aplica
        if user.empresa_id:
            empresa = Empresa.query.get(user.empresa_id)
            if empresa:
                data["empresa_nombre"] = empresa.nombre

        # Evita respuestas 304 (caché)
        resp = jsonify(data)
        resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        resp.headers["Pragma"] = "no-cache"
        resp.headers["Expires"] = "0"
        return resp, 200
    except Exception as e:
        return jsonify({"msg": "Error en /private", "error": str(e)}), 500


# Endpoint para que el admin actualice sus datos personales
@api.route('/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user = _get_current_user()

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # super_admin, admin y director pueden actualizar sus propios datos personales
        if not (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user)):
            return jsonify({"error": "Solo el admin, super admin o director pueden actualizar estos datos"}), 403

        data = request.get_json()

        # Actualizar nombre si se proporciona
        if data.get('nombre'):
            current_user.nombre = data['nombre']

        # Actualizar email si se proporciona
        if data.get('email'):
            # Verificar que el email no esté en uso por otro usuario
            existing_user = Usuario.query.filter(Usuario.email == data['email'], Usuario.id != current_user_id).first()
            if existing_user:
                return jsonify({"error": "Este email ya está en uso"}), 400
            current_user.email = data['email']

        db.session.commit()

        return jsonify({
            "success": True,
            "msg": "Datos actualizados correctamente",
            "user": {
                "nombre": current_user.nombre,
                "email": current_user.email
            }
        }), 200

    except Exception as e:
        print("Error updating profile:", str(e))
        return jsonify({"error": "Error al actualizar datos"}), 500


# Endpoint para cambiar contraseña (todos los roles)
@api.route('/profile/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        current_user_id = int(get_jwt_identity())
        current_user = Usuario.query.get(current_user_id)

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({"error": "Faltan datos requeridos"}), 400

        # Verificar contraseña actual
        if not check_password_hash(current_user.password, current_password):
            return jsonify({"error": "Contraseña actual incorrecta"}), 400

        # Validar nueva contraseña
        if len(new_password) < 6:
            return jsonify({"error": "La nueva contraseña debe tener al menos 6 caracteres"}), 400

        # Actualizar contraseña
        current_user.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({
            "success": True,
            "msg": "Contraseña actualizada correctamente"
        }), 200

    except Exception as e:
        print("Error changing password:", str(e))
        return jsonify({"error": "Error al cambiar contraseña"}), 500


# ===== RUTAS DE AUDITORÍA =====

@api.route('/audit/logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    """Obtiene los logs de auditoría con filtros y paginación (solo para admins)"""
    try:
        from api.audit_service import AuditService

        current_user = _get_current_user()

        # Solo super_admin, admin o director pueden ver los logs
        if not (current_user and (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user))):
            return jsonify({"msg": "Acceso denegado. Solo administradores o directores."}), 403

        # Obtener parámetros de consulta
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))

        # Construir filtros
        filters = {}
        if request.args.get('user_id'):
            filters['user_id'] = int(request.args.get('user_id'))
        if request.args.get('action_type'):
            filters['action_type'] = request.args.get('action_type')
        if request.args.get('table_name'):
            filters['table_name'] = request.args.get('table_name')
        if request.args.get('restaurante_id'):
            filters['restaurante_id'] = int(request.args.get('restaurante_id'))
        if request.args.get('date_from'):
            from datetime import datetime
            filters['date_from'] = datetime.fromisoformat(request.args.get('date_from'))
        if request.args.get('date_to'):
            from datetime import datetime
            filters['date_to'] = datetime.fromisoformat(request.args.get('date_to'))

        # Filtrar por empresa para admin/director (el super_admin ve todo)
        if (_user_is_admin(current_user) or _user_is_director(current_user)) and current_user.empresa_id:
            filters['empresa_id'] = current_user.empresa_id

        # Obtener logs
        result = AuditService.get_logs(page=page, per_page=per_page, filters=filters)

        return jsonify(result), 200

    except Exception as e:
        print(f"Error getting audit logs: {str(e)}")
        return jsonify({"msg": "Error interno", "error": str(e)}), 500


@api.route('/audit/stats', methods=['GET'])
@jwt_required()
def get_audit_stats():
    """Obtiene estadísticas de los logs de auditoría (solo para admins)"""
    try:
        current_user = _get_current_user()

        # Solo super_admin, admin o director pueden ver las estadísticas
        if not (current_user and (_user_is_super_admin(current_user) or _user_is_admin(current_user) or _user_is_director(current_user))):
            return jsonify({"msg": "Acceso denegado. Solo administradores o directores."}), 403

        from sqlalchemy import func
        from datetime import datetime, timedelta

        # Estadísticas de los últimos 30 días
        fecha_inicio = datetime.utcnow() - timedelta(days=30)

        # Base query para stats
        base_query = db.session.query(AuditLog).filter(
            AuditLog.timestamp >= fecha_inicio
        )

        # Si es admin/director (no super_admin), limitar a su empresa usando Restaurante y Usuario
        if (_user_is_admin(current_user) or _user_is_director(current_user)) and current_user.empresa_id:
            from api.models import Restaurante, Usuario  # import local para evitar ciclos
            empresa_id = current_user.empresa_id

            base_query = base_query.join(
                Usuario,
                AuditLog.usuario_id == Usuario.id,
                isouter=True
            ).join(
                Restaurante,
                AuditLog.restaurante_id == Restaurante.id,
                isouter=True
            ).filter(
                (Restaurante.empresa_id == empresa_id) |
                ((AuditLog.restaurante_id.is_(None)) & (Usuario.empresa_id == empresa_id))
            )

        base_subq = base_query.subquery()

        # Total de acciones por tipo
        actions_by_type = db.session.query(
            base_subq.c.action_type,
            func.count(base_subq.c.id).label('count')
        ).group_by(base_subq.c.action_type).all()

        # Usuarios más activos (filtrados por empresa si aplica)
        most_active_query = db.session.query(
            Usuario.nombre,
            Usuario.email,
            func.count(AuditLog.id).label('count')
        ).join(AuditLog).filter(
            AuditLog.timestamp >= fecha_inicio
        )
        if (_user_is_admin(current_user) or _user_is_director(current_user)) and current_user.empresa_id:
            most_active_query = most_active_query.filter(Usuario.empresa_id == current_user.empresa_id)

        most_active_users = most_active_query.group_by(
            Usuario.id, Usuario.nombre, Usuario.email
        ).order_by(
            func.count(AuditLog.id).desc()
        ).limit(10).all()

        # Acciones por tabla
        actions_by_table = db.session.query(
            base_subq.c.table_name,
            func.count(base_subq.c.id).label('count')
        ).group_by(base_subq.c.table_name).all()

        return jsonify({
            "period": "Últimos 30 días",
            "actions_by_type": [{"type": r.action_type, "count": r.count} for r in actions_by_type],
            "most_active_users": [{"name": r.nombre, "email": r.email, "count": r.count} for r in most_active_users],
            "actions_by_table": [{"table": r.table_name, "count": r.count} for r in actions_by_table]
        }), 200

    except Exception as e:
        print(f"Error getting audit stats: {str(e)}")
        return jsonify({"msg": "Error interno", "error": str(e)}), 500
