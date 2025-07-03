from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Restaurante(db.Model):
    __tablename__ = 'restaurantes'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    direccion = db.Column(db.String(200))
    telefono = db.Column(db.String(11))
    email_contacto = db.Column(db.String(100))
    activo = db.Column(db.Boolean, default=True, nullable=True)
    usuarios = db.relationship('Usuario', backref='restaurante', lazy=True)
    ventas = db.relationship('Venta', backref='restaurante', lazy=True)
    gastos = db.relationship('Gasto', backref='restaurante', lazy=True)
    proveedores = db.relationship(
        'Proveedor', backref='restaurante', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "email_contacto": self.email_contacto,
            "usuarios": self.usuarios,
            "telefono": self.telefono,
            "activo": self.activo
        }


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    rol = db.Column(db.Enum('admin', 'encargado', 'chef', name='roles'), nullable=False)
    restaurante_id = db.Column(db.Integer, db.ForeignKey('restaurantes.id'), nullable=True)
    
    status = db.Column(db.String(20), default="active") 
    restaurante_id = db.Column(db.Integer, db.ForeignKey('restaurantes.id'), nullable=True)
    moneda = db.Column(db.String(10), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "rol": self.rol,
            "status": self.status,  # ✅ Añadir también al serialize
            "restaurante_id": self.restaurante_id,
            "moneda": self.moneda  # Incluida en el serialize
        }


class Venta(db.Model):
    __tablename__ = 'ventas'
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Float, nullable=False)
    turno = db.Column(db.String(50))
    restaurante_id = db.Column(db.Integer, db.ForeignKey(
        'restaurantes.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "monto": self.monto,
            "turno": self.turno,
            "restaurante_id": self.restaurante_id,
        }


class Proveedor(db.Model):
    __tablename__ = 'proveedores'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(100))
    direccion = db.Column(db.String(200))
    telefono = db.Column(db.String(50))
    email_contacto = db.Column(db.String(100))
    observaciones = db.Column(db.Text)
    restaurante_id = db.Column(db.Integer, db.ForeignKey(
        'restaurantes.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "categoria": self.categoria,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "email_contacto": self.email_contacto,
            "observaciones": self.observaciones,
            "restaurante_id": self.restaurante_id,
        }


class Gasto(db.Model):
    __tablename__ = 'gastos'
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(100))
    proveedor_id = db.Column(db.Integer, db.ForeignKey(
        'proveedores.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey(
        'usuarios.id'), nullable=False)
    restaurante_id = db.Column(db.Integer, db.ForeignKey(
        'restaurantes.id'), nullable=False)
    nota = db.Column(db.Text)
    archivo_adjunto = db.Column(db.String(200))
    proveedor = db.relationship('Proveedor')
    usuario = db.relationship('Usuario')

    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "monto": self.monto,
            "categoria": self.category,
            "proveedor_id": self.proveedor_id,
            "usuario_id": self.usuario_id,
            "restaurante_id": self.restaurante_id,
            "nota": self.nota,
            "archivo_adjunto": self.archivo_adjunto,
        }


class FacturaAlbaran(db.Model):
    __tablename__ = 'facturas_albaranes'
    id = db.Column(db.Integer, primary_key=True)
    proveedor_id = db.Column(db.Integer, db.ForeignKey(
        'proveedores.id'), nullable=False)
    restaurante_id = db.Column(db.Integer, db.ForeignKey(
        'restaurantes.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.Text)
    proveedor = db.relationship('Proveedor', backref='facturas')
    restaurante = db.relationship('Restaurante', backref='facturas')

    def serialize(self):
        return {
            "id": self.id,
            "proveedor_id": self.proveedor_id,
            "restaurante_id": self.restaurante_id,
            "fecha": self.fecha,
            "monto": self.monto,
            "descripcion": self.descripcion,
        }


class MargenObjetivo(db.Model):
    __tablename__ = 'margen_objetivo'
    id = db.Column(db.Integer, primary_key=True)
    restaurante_id = db.Column(db.Integer, db.ForeignKey(
        'restaurantes.id'), nullable=False)
    porcentaje_min = db.Column(db.Float, nullable=False)
    porcentaje_max = db.Column(db.Float, nullable=False)
    restaurante = db.relationship('Restaurante', backref='margen_objetivo')

    def serialize(self):
        return {
            "id": self.id,
            "restaurante_id": self.restaurante_id,
            "porcentaje_min": self.porcentaje_min,
            "porcentaje_max": self.porcentaje_max,
        }
