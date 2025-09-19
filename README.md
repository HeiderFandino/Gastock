# Gastock

Gastock es la plataforma que usamos para controlar la salud financiera de varios restaurantes desde un único panel. Combina un backend en Flask con un frontend en React para centralizar ventas, gastos, proveedores y usuarios por rol.

## Características
- Autenticación con JWT y recuperación de contraseña por correo.
- Paneles diferenciados para administradores, encargados y chefs.
- Registro de ventas, gastos y facturas con adjuntos y métricas de comparación mensual.
- Gestión de restaurantes, proveedores y márgenes objetivo desde una sola consola.
- Visualizaciones con Chart.js y Recharts para seguir KPIs clave.

## Tecnologías
- **Frontend:** React 18 + Vite, React Router, Bootstrap 5, Bootstrap Icons, FontAwesome, Chart.js, Recharts, React-Select.
- **Backend:** Flask, SQLAlchemy, Alembic/Flask-Migrate, Flask-JWT-Extended, Flask-Mail, SendGrid.
- **Herramientas:** Pipenv, Node 20, Python 3.13, Render (deploy), Dockerfile y Procfile listos para producción.

## Estructura del proyecto
```
src/
|- front/          # Aplicación React (páginas, hooks, servicios y estilos)
|  |- components/
|  |- pages/
|  \- services/
|- api/            # Blueprint Flask (modelos, rutas, emails, comandos)
|- app.py          # Configuración principal de Flask
\- wsgi.py
```

## Configuración rápida
1. Clona el repositorio y ubícate en la carpeta del proyecto.
2. Prepara un archivo .env (puedes partir del existente) y define:
   - DATABASE_URL (PostgreSQL recomendado)
   - JWT_SECRET_KEY
   - EMAIL_USER y EMAIL_PASS (credenciales SMTP)
   - EMAIL_SENDER (alias para los correos salientes)
   - SENDGRID_API_KEY (para notificaciones transaccionales)
   - FLASK_DEBUG=1 opcional para desarrollo
   - En el frontend, VITE_BACKEND_URL apuntando al origen del API, por ejemplo http://localhost:3001

### Backend (Flask)
```bash
pipenv install
pipenv run migrate      # crea las migraciones
pipenv run upgrade      # aplica los cambios a la base de datos
pipenv run start        # levanta la API en http://localhost:3001
```

### Frontend (React)
```bash
npm install
npm run dev             # UI en http://localhost:5173
```
> Ejecuta ambos servicios en terminales separadas. El login usa sessionStorage, así que recuerda cerrar sesión desde la app o borrar datos del navegador cuando cambies de usuario.

## Scripts útiles
- pipenv run insert-test-users 5 genera usuarios de prueba.
- pipenv run downgrade revierte la última migración.
- npm run build produce la versión optimizada para producción.
- render_build.sh automatiza el build al desplegar en Render.

## Modelos principales
- Restaurante: datos de cada local y relaciones con usuarios, ventas y gastos.
- Usuario: roles (admin, encargado, chef), estado y moneda preferida.
- Venta: monto diario por turno y restaurante.
- Gasto: categoría, proveedor, adjuntos y notas.
- Proveedor: contacto, categoría y observaciones por restaurante.
- FacturaAlbaran y MargenObjetivo: control documental y márgenes objetivo configurables.

## Roles en la plataforma
- **Admin:** gestiona restaurantes, usuarios, compara KPIs entre locales y consulta tendencias mensuales.
- **Encargado:** registra ventas y gastos diarios, gestiona proveedores del local y revisa reportes rápidos.
- **Chef:** consulta el presupuesto disponible, gastos por categoría y atajos operativos para el día a día.

## Despliegue
El proyecto incluye render.yaml, Dockerfile.render y Procfile para desplegar rápidamente en Render. Ajusta las variables de entorno en el panel de Render y utiliza render_build.sh como comando de build.

Listo. Con esto tienes una base clara para seguir desarrollando Gastock y presentarla sin depender del README genérico de la plantilla.
