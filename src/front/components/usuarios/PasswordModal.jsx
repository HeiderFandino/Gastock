import React, { useState, useEffect } from "react";
import "../../styles/PasswordModal.css"; // Opcional: si quieres extraer estilos

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
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="titulo">Confirmar acción</h3>
        <p>Introduce tu contraseña de administrador:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
            required
          />
          <div className="modal-actions">
            <button type="submit" className="btn-confirm">Aceptar</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
