import os
import random
import sys
import unicodedata
from datetime import date, timedelta

from dotenv import load_dotenv
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# app.py reads DATABASE_URL while it is being imported, so the environment must
# be loaded first. Pipenv normally does this too, but keeping it here makes
# `python seed.py` behave consistently.
load_dotenv(os.path.join(BASE_DIR, ".env"))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

from api.models import (
    AuditLog,
    Empresa,
    FacturaAlbaran,
    Gasto,
    MargenObjetivo,
    Proveedor,
    Restaurante,
    Usuario,
    Venta,
)
from app import app, db  # noqa: E402

PASSWORD_HASH_METHOD = "pbkdf2:sha256"


def limpiar_email(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("utf-8")
    return texto.lower().replace(" ", "").replace("&", "")


def limpiar_base_de_datos() -> None:
    """Delete application data without leaving orphaned foreign keys."""
    modelos = (
        AuditLog,
        FacturaAlbaran,
        Gasto,
        Venta,
        MargenObjetivo,
        Proveedor,
        Usuario,
        Restaurante,
        Empresa,
    )
    tablas_esperadas = {modelo.__tablename__ for modelo in modelos}
    tablas_existentes = set(inspect(db.engine).get_table_names())
    tablas_faltantes = sorted(tablas_esperadas - tablas_existentes)

    if tablas_faltantes:
        raise RuntimeError(
            "Faltan tablas en la base de datos: "
            f"{', '.join(tablas_faltantes)}. Ejecuta `pipenv run upgrade` antes del seed."
        )

    try:
        if db.engine.dialect.name == "postgresql":
            nombres = ", ".join(f'"{modelo.__tablename__}"' for modelo in modelos)
            db.session.execute(
                text(f"TRUNCATE TABLE {nombres} RESTART IDENTITY CASCADE")
            )
        else:
            # This order starts with child tables and ends with parent tables.
            for modelo in modelos:
                db.session.execute(modelo.__table__.delete())
    except SQLAlchemyError:
        db.session.rollback()
        raise


with app.app_context():
    print("Borrando TODOS los datos...")
    limpiar_base_de_datos()

    print("Inicializando seed...")

    # Superadmin fijo
    superadmin = Usuario(
        nombre="Superadmin",
        email="gastockapp@gmail.com",
        rol="super_admin",
        status="active",
        empresa_id=None,
        restaurante_id=None,
        password=generate_password_hash(
            "Haf1103.", method=PASSWORD_HASH_METHOD
        ),
    )
    db.session.add(superadmin)
    db.session.flush()

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
        db.session.flush()

        admin_user = Usuario(
            nombre=admin_info["nombre"],
            email=admin_info["email"],
            rol="admin",
            status="active",
            empresa_id=empresa.id,
            restaurante_id=None,
            password=generate_password_hash(
                "123456", method=PASSWORD_HASH_METHOD
            ),
        )
        db.session.add(admin_user)
        db.session.flush()

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
                password=generate_password_hash(
                    "123456", method=PASSWORD_HASH_METHOD
                ),
            )
            db.session.add(director)
        db.session.flush()

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
            db.session.flush()

            # Margen objetivo por restaurante
            margen_min = round(random.uniform(0.30, 0.34), 2)
            margen_max = round(random.uniform(max(margen_min, 0.34), 0.40), 2)
            margen = MargenObjetivo(
                restaurante_id=restaurante.id,
                porcentaje_min=margen_min * 100,
                porcentaje_max=margen_max * 100,
            )
            db.session.add(margen)
            db.session.flush()

            # Usuarios por restaurante
            encargado = Usuario(
                nombre=f"{nombres_encargado[i % len(nombres_encargado)]} {random.choice(apellidos)}",
                email=f"encargado.{clean_rest}@gastock.com",
                rol="encargado",
                status="active",
                empresa_id=empresa.id,
                restaurante_id=restaurante.id,
                password=generate_password_hash(
                    "123456", method=PASSWORD_HASH_METHOD
                ),
            )
            chef = Usuario(
                nombre=f"{nombres_chef[i % len(nombres_chef)]} {random.choice(apellidos)}",
                email=f"chef.{clean_rest}@gastock.com",
                rol="chef",
                status="active",
                empresa_id=empresa.id,
                restaurante_id=restaurante.id,
                password=generate_password_hash(
                    "123456", method=PASSWORD_HASH_METHOD
                ),
            )
            db.session.add(encargado)
            db.session.add(chef)
            db.session.flush()

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
            db.session.flush()

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

            db.session.flush()

    db.session.commit()
    print("Base de datos reiniciada con exito.")
