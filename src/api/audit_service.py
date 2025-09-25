"""
Servicio de Auditoría para Gastock
Registra todas las acciones importantes del sistema
"""
import json
from datetime import datetime
from flask import request
from flask_jwt_extended import get_jwt_identity
from api.models import db, AuditLog, Usuario
import traceback


class AuditService:

    @staticmethod
    def get_current_user():
        """Obtiene el usuario actual desde el JWT"""
        try:
            user_id = get_jwt_identity()
            if user_id:
                return Usuario.query.get(user_id)
            return None
        except:
            return None

    @staticmethod
    def get_client_info():
        """Obtiene información del cliente (IP, User-Agent)"""
        try:
            ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'Unknown'))
            user_agent = request.headers.get('User-Agent', 'Unknown')
            return ip_address, user_agent
        except:
            return 'Unknown', 'Unknown'

    @staticmethod
    def log_action(action_type, table_name, record_id=None, old_values=None, new_values=None, description=None, user_id=None, restaurante_id=None):
        """
        Registra una acción en el sistema de auditoría

        Args:
            action_type (str): Tipo de acción (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
            table_name (str): Nombre de la tabla afectada
            record_id (int): ID del registro afectado (opcional)
            old_values (dict): Valores anteriores (opcional)
            new_values (dict): Valores nuevos (opcional)
            description (str): Descripción legible de la acción (opcional)
            user_id (int): ID del usuario (opcional, se obtiene automáticamente)
            restaurante_id (int): ID del restaurante (opcional)
        """
        try:
            # Obtener usuario actual si no se proporciona
            current_user = None
            if user_id:
                current_user = Usuario.query.get(user_id)
            else:
                current_user = AuditService.get_current_user()

            if not current_user:
                return  # No podemos registrar sin usuario

            # Obtener información del cliente
            ip_address, user_agent = AuditService.get_client_info()

            # Convertir valores a JSON si existen
            old_values_json = json.dumps(old_values) if old_values else None
            new_values_json = json.dumps(new_values) if new_values else None

            # Si no se proporciona restaurante_id, intentar obtenerlo del usuario
            if not restaurante_id and hasattr(current_user, 'restaurante_id'):
                restaurante_id = current_user.restaurante_id

            # Crear el registro de auditoría
            audit_log = AuditLog(
                usuario_id=current_user.id,
                action_type=action_type,
                table_name=table_name,
                record_id=record_id,
                old_values=old_values_json,
                new_values=new_values_json,
                ip_address=ip_address,
                user_agent=user_agent,
                description=description,
                restaurante_id=restaurante_id,
                timestamp=datetime.utcnow()
            )

            db.session.add(audit_log)
            db.session.commit()

        except Exception as e:
            # En caso de error, no queremos que falle la operación principal
            print(f"Error logging audit action: {str(e)}")
            traceback.print_exc()
            try:
                db.session.rollback()
            except:
                pass

    @staticmethod
    def log_login(user_id, success=True):
        """Registra un intento de login"""
        user = Usuario.query.get(user_id) if user_id else None
        action_type = "LOGIN" if success else "LOGIN_FAILED"
        description = f"Usuario {'exitoso' if success else 'fallido'} login"

        if user:
            description += f" - {user.nombre} ({user.email})"

        AuditService.log_action(
            action_type=action_type,
            table_name="usuarios",
            record_id=user_id,
            description=description,
            user_id=user_id if success else None
        )

    @staticmethod
    def log_logout(user_id):
        """Registra un logout"""
        user = Usuario.query.get(user_id)
        description = f"Usuario logout - {user.nombre} ({user.email})" if user else "Usuario logout"

        AuditService.log_action(
            action_type="LOGOUT",
            table_name="usuarios",
            record_id=user_id,
            description=description,
            user_id=user_id
        )

    @staticmethod
    def log_create(table_name, record_id, new_values, description=None):
        """Registra la creación de un registro"""
        if not description:
            description = f"Nuevo registro creado en {table_name}"

        AuditService.log_action(
            action_type="CREATE",
            table_name=table_name,
            record_id=record_id,
            new_values=new_values,
            description=description
        )

    @staticmethod
    def log_update(table_name, record_id, old_values, new_values, description=None):
        """Registra la actualización de un registro"""
        if not description:
            description = f"Registro actualizado en {table_name}"

        AuditService.log_action(
            action_type="UPDATE",
            table_name=table_name,
            record_id=record_id,
            old_values=old_values,
            new_values=new_values,
            description=description
        )

    @staticmethod
    def log_delete(table_name, record_id, old_values, description=None):
        """Registra la eliminación de un registro"""
        if not description:
            description = f"Registro eliminado de {table_name}"

        AuditService.log_action(
            action_type="DELETE",
            table_name=table_name,
            record_id=record_id,
            old_values=old_values,
            description=description
        )

    @staticmethod
    def get_logs(page=1, per_page=50, filters=None):
        """
        Obtiene logs de auditoría con paginación y filtros

        Args:
            page (int): Página actual
            per_page (int): Registros por página
            filters (dict): Filtros a aplicar
                - user_id: Filtrar por usuario
                - action_type: Filtrar por tipo de acción
                - table_name: Filtrar por tabla
                - date_from: Fecha desde
                - date_to: Fecha hasta
                - restaurante_id: Filtrar por restaurante
        """
        query = AuditLog.query

        if filters:
            if filters.get('user_id'):
                query = query.filter(AuditLog.usuario_id == filters['user_id'])

            if filters.get('action_type'):
                query = query.filter(AuditLog.action_type == filters['action_type'])

            if filters.get('table_name'):
                query = query.filter(AuditLog.table_name == filters['table_name'])

            if filters.get('restaurante_id'):
                query = query.filter(AuditLog.restaurante_id == filters['restaurante_id'])

            if filters.get('date_from'):
                query = query.filter(AuditLog.timestamp >= filters['date_from'])

            if filters.get('date_to'):
                query = query.filter(AuditLog.timestamp <= filters['date_to'])

        # Ordenar por timestamp descendente (más recientes primero)
        query = query.order_by(AuditLog.timestamp.desc())

        # Aplicar paginación
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return {
            'logs': [log.serialize() for log in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }