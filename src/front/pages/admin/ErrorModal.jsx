import React from "react";
// Estilos ya incluidos en brand-unified.css

const ErrorModal = ({ show, onClose, mensaje }) => {
  if (!show) return null;

  return (
    <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content" style={{ border: "none", boxShadow: "0 14px 45px rgba(0,0,0,0.15)" }}>
          <div className="modal-header" style={{ background: "#f7f9fb", borderBottom: "none" }}>
            <div className="modal-icon" style={{ background: "#eef4ff", color: "#ef9b1f", borderRadius: "12px" }}>⚠️</div>
            <h5 className="modal-title" style={{ fontWeight: 700 }}>Acción no permitida</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body text-center" style={{ padding: "12px 18px 4px 18px", color: "#4b5563", fontSize: "0.95rem" }}>
            <p className="mb-0">{mensaje}</p>
          </div>

          <div className="modal-footer justify-content-center" style={{ borderTop: "none", paddingBottom: "18px" }}>
            <button
              type="button"
              className="modal-btn-primary"
              onClick={onClose}
              style={{
                background: "linear-gradient(135deg, #4f8bff, #6ea7ff)",
                border: "none",
                fontWeight: 600,
                padding: "10px 16px"
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ErrorModal;
