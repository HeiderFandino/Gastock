import React, { useEffect, useState } from "react";
// Estilos ya incluidos en brand-unified.css

const UserModal = ({ user, onSave, onClose, restaurants }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "chef",
    restaurante_id: "",
    status: "active"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        password: "",
        rol: user.rol || "chef",
        restaurante_id: user.restaurante_id || "",
        status: user.status || "active"
      });
    } else {
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "chef",
        restaurante_id: "",
        status: "active"
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error guardando usuario", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">👤</div>
            <h5 className="modal-title">
              {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">👤 Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    placeholder="Ingresa el nombre completo"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">📧 Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">🔒 Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder={user ? "Nueva contraseña (opcional)" : "Contraseña del usuario"}
                    value={formData.password}
                    onChange={handleChange}
                    required={!user}
                    disabled={saving}
                  />
                  {user && (
                    <small className="form-text text-muted">
                      Deja vacío para mantener la contraseña actual
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">👔 Rol</label>
                  <select
                    name="rol"
                    className="form-select"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >
                    <option value="encargado">👨‍💼 Encargado</option>
                    <option value="chef">👨‍🍳 Chef</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏪 Restaurante</label>
                  <select
                    name="restaurante_id"
                    className="form-select"
                    value={formData.restaurante_id}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >
                    <option value="">Selecciona restaurante...</option>
                    {Array.isArray(restaurants) && restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">⚡ Estado</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  >
                    <option value="active">✅ Activo</option>
                    <option value="inactive">❌ Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn-secondary"
                onClick={onClose}
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
                    💾 {user ? "Actualizar" : "Crear"} Usuario
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

export default UserModal;
