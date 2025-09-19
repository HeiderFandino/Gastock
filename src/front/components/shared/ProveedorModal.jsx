import React, { useState, useEffect } from "react";
// Estilos ya incluidos en brand-unified.css

const ProveedorModal = ({ show, onHide, onSuccess, proveedor, modo = "crear" }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    categoria: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (proveedor && modo === "editar") {
      setFormData({
        nombre: proveedor.nombre || "",
        contacto: proveedor.contacto || "",
        telefono: proveedor.telefono || "",
        email: proveedor.email || "",
        direccion: proveedor.direccion || "",
        categoria: proveedor.categoria || ""
      });
    } else {
      setFormData({
        nombre: "",
        contacto: "",
        telefono: "",
        email: "",
        direccion: "",
        categoria: ""
      });
    }
  }, [proveedor, modo, show]);

  useEffect(() => {
    if (!show) {
      setSaving(false);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      const dataToSend = modo === "editar" ? { ...proveedor, ...formData } : formData;
      await onSuccess(dataToSend);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">🏢</div>
            <h5 className="modal-title">
              {modo === "editar" ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">🏢 Nombre del proveedor</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    placeholder="Ingresa el nombre del proveedor"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">👤 Persona de contacto</label>
                  <input
                    type="text"
                    name="contacto"
                    className="form-control"
                    placeholder="Nombre del contacto principal"
                    value={formData.contacto}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📞 Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    className="form-control"
                    placeholder="Número de contacto"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📧 Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="proveedor@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📋 Categoría</label>
                  <select
                    name="categoria"
                    className="form-select"
                    value={formData.categoria}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Selecciona categoría...</option>
                    <option value="alimentos">🍞 Alimentos</option>
                    <option value="bebidas">🥤 Bebidas</option>
                    <option value="limpieza">🧴 Limpieza</option>
                    <option value="equipamiento">⚒️ Equipamiento</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">📍 Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    className="form-control"
                    placeholder="Dirección del proveedor"
                    value={formData.direccion}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn-secondary"
                onClick={onHide}
                disabled={saving}
              >
                ❌ Cancelar
              </button>
              <button
                type="submit"
                className={`modal-btn-primary ${saving ? "btn-loading" : ""}`}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    💾 {modo === "editar" ? "Actualizar" : "Registrar"} Proveedor
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProveedorModal;
