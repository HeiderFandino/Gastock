import React from "react";
// Estilos ya incluidos en brand-unified.css

const ErrorModal = ({ show, onClose, mensaje }) => {
  if (!show) return null;

  return (
    <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">⚠️</div>
            <h5 className="modal-title">Acción no permitida</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <p className="text-center mb-0">{mensaje}</p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={onClose}
            >
              ✅ Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ErrorModal;
