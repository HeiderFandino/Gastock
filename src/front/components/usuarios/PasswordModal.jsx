import React, { useState, useEffect } from "react";
// Estilos ya incluidos en brand-unified.css

const PasswordModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) setPassword("");
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    onConfirm(password);
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">🔐</div>
            <h5 className="modal-title">Confirmar Acción</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="text-muted mb-3">
                Para continuar, introduce tu contraseña de administrador:
              </p>
              
              <div className="mb-3">
                <label className="form-label">🔒 Contraseña</label>
                <input
                  type="password"
                  value={password}
                  placeholder="Contraseña de administrador"
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn-secondary"
                onClick={onClose}
              >
                ❌ Cancelar
              </button>
              <button
                type="submit"
                className="modal-btn-primary"
                disabled={!password.trim()}
              >
                🔓 Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
