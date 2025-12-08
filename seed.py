import os
import random
import sys
import unicodedata
from datetime import date, timedelta

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from werkzeug.security import generate_password_hash

sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from api.models import (
    AuditLog,
    Empresa,
    Gasto,
    MargenObjetivo,
    Proveedor,
    Restaurante,
    Usuario,
    Venta,
)
from app import app, db  # noqa: E402

load_dotenv()


def limpiar_email(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("utf-8")
    return texto.lower().replace(" ", "").replace("&", "")


with app.app_context():
    print("Borrando TODOS los datos...")

    # En PostgreSQL podemos usar TRUNCATE para limpiar más rápido; en SQLite no existe.
    try:
        db.session.execute(text("TRUNCATE audit_logs CASCADE"))
        db.session.execute(text("TRUNCATE margen_objetivo CASCADE"))
        db.session.commit()
    except OperationalError:
        db.session.rollback()

    # Borrado clásico con ORM; si alguna tabla no existe (por ejemplo en SQLite
    # sin migraciones completas), ignoramos el error para no romper el seed.
    try:
      AuditLog.query.delete()
    except OperationalError:
      db.session.rollback()
    try:
      Venta.query.delete()
    except OperationalError:
      db.session.rollback()
    try:
      Gasto.query.delete()
    except OperationalError:
      db.session.rollback()
    try:
      Proveedor.query.delete()
    except OperationalError:
      db.session.rollback()
    try:
      MargenObjetivo.query.delete()
    except OperationalError:
      db.session.rollback()
    try:
      Usuario.query.delete()
    except OperationalError:
      db.session.rollback()
    try:
      Restaurante.query.delete()
    except OperationalError:
      db.session.rollback()
    try:
      Empresa.query.delete()
    except OperationalError:
      db.session.rollback()

    db.session.commit()

    print("Inicializando seed...")

    # Superadmin fijo
    superadmin = Usuario(
        nombre="Superadmin",
        email="gastockapp@gmail.com",
        rol="super_admin",
        status="active",
        empresa_id=None,
        restaurante_id=None,
        password=generate_password_hash("Haf1103."),
    )
    db.session.add(superadmin)
    db.session.commit()

    proveedores_base = [
        {"nombre": "Gas y Energia", "categoria": "otros"},
        {"nombre": "Distribuidora Coca-Cola", "categoria": "bebidas"},
        {"nombre": "Bebidas Alianza", "categoria": "bebidas"},
        {"nombre": "Limpieza Total", "categoria": "limpieza"},
        {"nombre": "Soluciones Higienicas", "categoria": "limpieza"},
        {"nombre": "Embalajes Ruiz", "categoria": "otros"},
        {"nombre": "Lacteos del Sur", "categoria": "alimentos"},
        {"nombre": "Aguas Claras", "categoria": "bebidas"},
        {"nombre": "Verduras Frescas", "categoria": "alimentos"},
        {"nombre": "Higiene Express", "categoria": "limpieza"},
    ]

    # Dos admins, cada uno con 10 restaurantes
    admins_info = [
        {"nombre": "Admin Norte", "email": "admin1@gastock.com", "empresa": "Empresa Norte"},
        {"nombre": "Admin Sur", "email": "admin2@gastock.com", "empresa": "Empresa Sur"},
    ]

    apellidos = ["Gomez", "Perez", "Rodriguez", "Fernandez", "Lopez", "Martinez"]
    nombres_chef = ["Laura", "Carlos", "Sofia", "Pedro", "Ana", "Miguel", "Lucia", "David", "Elena", "Javier"]
    nombres_encargado = ["Andres", "Patricia", "Raul", "Beatriz", "Tomas", "Irene", "Diego", "Clara", "Ruben", "Nuria"]
    nombres_director = ["Daniel", "Sandra", "Victor", "Patricia", "Alfonso", "Noelia"]

    hoy = date.today()
    # Últimos 3 meses (incluye mes en curso)
    start_month = hoy.month - 2
    start_year = hoy.year
    if start_month <= 0:
        start_month += 12
        start_year -= 1
    fecha_inicio = date(start_year, start_month, 1)
    fecha_fin = hoy
    dias = (fecha_fin - fecha_inicio).days + 1

    for admin_idx, admin_info in enumerate(admins_info, start=1):
        empresa = Empresa(nombre=admin_info["empresa"], activo=True)
        db.session.add(empresa)
        db.session.commit()

        admin_user = Usuario(
            nombre=admin_info["nombre"],
            email=admin_info["email"],
            rol="admin",
            status="active",
            empresa_id=empresa.id,
            restaurante_id=None,
            password=generate_password_hash("123456"),
        )
        db.session.add(admin_user)
        db.session.commit()

        # Dos directores por empresa
        empresa_slug = limpiar_email(empresa.nombre)
        for j in range(2):
            director = Usuario(
                nombre=f"{nombres_director[j % len(nombres_director)]} {random.choice(apellidos)}",
                email=f"director{j + 1}.{empresa_slug}@gastock.com",
                rol="director",
                status="active",
                empresa_id=empresa.id,
                restaurante_id=None,
                password=generate_password_hash("123456"),
            )
            db.session.add(director)
        db.session.commit()

        print(f"Creando restaurantes para {admin_info['nombre']}...")

        for i in range(10):
            rest_name = f"Restaurante {admin_idx}-{i + 1}"
            clean_rest = limpiar_email(rest_name)

            restaurante = Restaurante(
                nombre=rest_name,
                direccion=f"Calle {random.randint(1, 200)}, Ciudad",
                telefono=f"6{random.randint(10000000, 99999999)}",
                email_contacto=f"contacto.{clean_rest}@gastock.com",
                empresa_id=empresa.id,
            )
            db.session.add(restaurante)
            db.session.commit()

            # Margen objetivo por restaurante
            margen_min = round(random.uniform(0.30, 0.34), 2)
            margen_max = round(random.uniform(max(margen_min, 0.34), 0.40), 2)
            margen = MargenObjetivo(
                restaurante_id=restaurante.id,
                porcentaje_min=margen_min * 100,
                porcentaje_max=margen_max * 100,
            )
            db.session.add(margen)
            db.session.commit()

            # Usuarios por restaurante
            encargado = Usuario(
                nombre=f"{nombres_encargado[i % len(nombres_encargado)]} {random.choice(apellidos)}",
                email=f"encargado.{clean_rest}@gastock.com",
                rol="encargado",
                status="active",
                empresa_id=empresa.id,
                restaurante_id=restaurante.id,
                password=generate_password_hash("123456"),
            )
            chef = Usuario(
                nombre=f"{nombres_chef[i % len(nombres_chef)]} {random.choice(apellidos)}",
                email=f"chef.{clean_rest}@gastock.com",
                rol="chef",
                status="active",
                empresa_id=empresa.id,
                restaurante_id=restaurante.id,
                password=generate_password_hash("123456"),
            )
            db.session.add(encargado)
            db.session.add(chef)
            db.session.commit()

            # Proveedores (10 por restaurante)
            proveedores_rest = []
            for prov in proveedores_base:
                email_prov = f"{prov['nombre'].lower().replace(' ', '').replace('&','')}@{clean_rest}.com"
                proveedor_obj = Proveedor(
                    nombre=prov["nombre"],
                    categoria=prov["categoria"],
                    direccion="Calle Proveedor, Ciudad",
                    telefono=f"6{random.randint(10000000, 99999999)}",
                    email_contacto=email_prov,
                    restaurante_id=restaurante.id,
                )
                proveedores_rest.append(proveedor_obj)
                db.session.add(proveedor_obj)
            db.session.commit()

            # Estado de gasto ficticio para calibrar montos
            estado_gasto = random.choice(["dentro", "limite", "fuera"])

            # Gastos y ventas de los últimos 3 meses
            for offset in range(dias):
                fecha = fecha_inicio + timedelta(days=offset)

                gastos_del_dia = []
                for _ in range(3):
                    proveedor = random.choice(proveedores_rest)

                    if estado_gasto == "dentro":
                        monto = round(random.uniform(10, 50), 2)
                    elif estado_gasto == "limite":
                        monto = round(random.uniform(20, 60), 2)
                    else:
                        monto = round(random.uniform(40, 80), 2)

                    gasto = Gasto(
                        fecha=fecha,
                        monto=monto,
                        categoria=proveedor.categoria,
                        proveedor_id=proveedor.id,
                        usuario_id=chef.id,
                        restaurante_id=restaurante.id,
                        nota=f"Gasto de {proveedor.nombre}",
                    )
                    db.session.add(gasto)
                    gastos_del_dia.append(monto)

                total_gastos_dia = sum(gastos_del_dia)

                if estado_gasto == "dentro":
                    porcentaje = random.uniform(0.25, 0.30)
                elif estado_gasto == "limite":
                    porcentaje = random.uniform(0.30, 0.33)
                else:
                    porcentaje = random.uniform(0.36, 0.42)

                total_venta_dia = round(total_gastos_dia / porcentaje, 2)

                venta = Venta(
                    fecha=fecha,
                    turno="tarde",
                    monto=total_venta_dia,
                    restaurante_id=restaurante.id,
                )
                db.session.add(venta)

            db.session.commit()

    print("Base de datos reiniciada con exito.")
