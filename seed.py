import random
import os
import sys
import unicodedata
from calendar import monthrange
from datetime import date, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from api.models import Proveedor, Gasto, Usuario, Restaurante, Venta
from app import app, db
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

def limpiar_email(texto):
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    return texto.lower().replace(' ', '').replace('&', '')

with app.app_context():
    print("🧹 Borrando TODOS los datos...")

    Venta.query.delete()
    Gasto.query.delete()
    Proveedor.query.delete()
    Usuario.query.delete()
    Restaurante.query.delete()
    db.session.commit()

    print("🔄 Inicializando seed...")

    nombres_restaurantes = [
        "La Marea", "Tango Grill", "Internacional Bar", "Mar & Terra",
        "Sabor Criollo", "Pasta & Vino", "Fusión Oriental", "El Rincón Vegano",
        "Tapas Urbanas", "Bistró Mediterráneo"
    ]

    estados_gasto = ["dentro"] * 3 + ["limite"] * 3 + ["fuera"] * 4
    random.shuffle(estados_gasto)

    restaurantes = []
    for i, nombre in enumerate(nombres_restaurantes):
        clean_name = limpiar_email(nombre)
        restaurante = Restaurante(
            nombre=nombre,
            direccion=f"Calle {random.randint(1, 200)}, Ciudad",
            telefono=f"6{random.randint(10000000, 99999999)}",
            email_contacto=f"contacto.{clean_name}@ohmychef.com"
        )
        db.session.add(restaurante)
        restaurante.estado_gasto = estados_gasto[i]
        restaurantes.append(restaurante)
    db.session.commit()

    print("🏗️ Restaurantes creados.")

    apellidos = ["Gómez", "Pérez", "Rodríguez", "Fernández", "López", "Martínez"]
    nombres_chef = ["Laura", "Carlos", "Sofía", "Pedro", "Ana", "Miguel", "Lucía", "David", "Elena", "Javier"]
    nombres_encargado = ["Andrés", "Patricia", "Raúl", "Beatriz", "Tomás", "Irene", "Diego", "Clara", "Rubén", "Nuria"]

    for i, restaurante in enumerate(restaurantes):
        clean_name = limpiar_email(restaurante.nombre)

        if restaurante.nombre == "La Marea":
            email_encargado = "heiderfandino@gmail.com"
            email_chef = "heideralfonsoo@gmail.com"
        else:
            email_encargado = f"encargado.{clean_name}@ohmychef.com"
            email_chef = f"chef.{clean_name}@ohmychef.com"

        encargado = Usuario(
            nombre=f"{nombres_encargado[i]} {random.choice(apellidos)}",
            email=email_encargado,
            rol="encargado",
            status="active",
            restaurante_id=restaurante.id,
            password=generate_password_hash("123456")
        )
        chef = Usuario(
            nombre=f"{nombres_chef[i]} {random.choice(apellidos)}",
            email=email_chef,
            rol="chef",
            status="active",
            restaurante_id=restaurante.id,
            password=generate_password_hash("123456")
        )
        db.session.add(encargado)
        db.session.add(chef)

    admin = Usuario(
        nombre="Admin Principal",
        email="ohmychefapp@gmail.com",
        rol="admin",
        status="active",
        restaurante_id=None,
        password=generate_password_hash("123456")
    )
    db.session.add(admin)
    db.session.commit()

    print("👤 Admin y usuarios creados.")

    print("➕ Creando proveedores...")

    proveedores_reales = [
        {"nombre": "Gas y Energía", "categoria": "otros"},
        {"nombre": "Distribuidora Coca-Cola", "categoria": "bebidas"},
        {"nombre": "Bebidas Alianza", "categoria": "bebidas"},
        {"nombre": "Limpieza Total", "categoria": "limpieza"},
        {"nombre": "Soluciones Higiénicas", "categoria": "limpieza"},
        {"nombre": "Embalajes Ruiz", "categoria": "otros"},
        {"nombre": "Lácteos del Sur", "categoria": "alimentos"},
        {"nombre": "Aguas Claras", "categoria": "bebidas"},
        {"nombre": "Verduras Frescas", "categoria": "alimentos"},
        {"nombre": "Higiene Express", "categoria": "limpieza"},
    ]

    proveedores_por_restaurante = {}

    for restaurante in restaurantes:
        lista = []
        for p in proveedores_reales:
            clean_rest = limpiar_email(restaurante.nombre)
            email = f"{p['nombre'].lower().replace(' ', '').replace('&','')}@{clean_rest}.com"
            prov = Proveedor(
                nombre=p["nombre"],
                categoria=p["categoria"],
                direccion=f"Calle Proveedor, Ciudad",
                telefono=f"6{random.randint(10000000, 99999999)}",
                email_contacto=email,
                restaurante_id=restaurante.id
            )
            db.session.add(prov)
            lista.append(prov)
        proveedores_por_restaurante[restaurante.id] = lista

    db.session.commit()

    print("💰 Generando gastos y ventas desde enero...")

    fecha_inicio = date(2025, 1, 1)
    hoy = date.today()
    ultimo_dia = monthrange(hoy.year, hoy.month)[1]
    fecha_fin = date(hoy.year, hoy.month, ultimo_dia)
    dias = (fecha_fin - fecha_inicio).days

    for restaurante in restaurantes:
        chef = Usuario.query.filter_by(rol='chef', restaurante_id=restaurante.id).first()
        proveedores = proveedores_por_restaurante[restaurante.id]

        for i in range(dias):
            fecha = fecha_inicio + timedelta(days=i)

            gastos_del_dia = []
            for _ in range(3):  # ← SOLO 3 gastos diarios
                proveedor = random.choice(proveedores)

                if restaurante.estado_gasto == "dentro":
                    monto = round(random.uniform(10, 50), 2)
                elif restaurante.estado_gasto == "limite":
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
                    nota=f"Gasto de {proveedor.nombre}"
                )
                db.session.add(gasto)
                gastos_del_dia.append(monto)

            total_gastos_dia = sum(gastos_del_dia)

            if restaurante.estado_gasto == "dentro":
                porcentaje = random.uniform(0.25, 0.30)
            elif restaurante.estado_gasto == "limite":
                porcentaje = random.uniform(0.30, 0.33)
            else:
                porcentaje = random.uniform(0.36, 0.42)

            total_venta_dia = round(total_gastos_dia / porcentaje, 2)

            venta = Venta(
                fecha=fecha,
                turno="tarde",
                monto=total_venta_dia,
                restaurante_id=restaurante.id
            )
            db.session.add(venta)

    db.session.commit()
    print("✅ Base de datos reiniciada con éxito.")
