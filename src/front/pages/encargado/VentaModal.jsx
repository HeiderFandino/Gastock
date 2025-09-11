import React, { useState } from "react";
// Estilos ya incluidos en brand-unified.css
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

const VentaModal = ({ onSave, onClose }) => {
  const simbolo = MonedaSimbolo();

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    monto: "",
    turno: "mañana",
  });

  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.monto || parseFloat(form.monto) < 0) {
      setMensaje("⚠️ El monto debe ser mayor o igual a 0.");
      return;
    }

    setMensaje("");

    try {
      await onSave(form);
    } catch (error) {
      const status = error?.response?.status || error?.status || error?.code;
      if (status === 409) {
        setMensaje("⚠️ Ya hay una venta registrada para ese día y turno.");
      } else {
        setMensaje("⚠️ Ya hay una venta registrada para ese día y turno..");
      }
    }
  }

  return (
    <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">💰</div>
            <h5 className="modal-title">Registrar Nueva Venta</h5>
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
                <div className="col-md-6">
                  <label className="form-label">📅 Fecha</label>
                  <input 
                    type="date" 
                    name="fecha" 
                    value={form.fecha} 
                    onChange={handleChange} 
                    className="form-control"
                    required 
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">⏰ Turno</label>
                  <select 
                    name="turno" 
                    value={form.turno} 
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="mañana">🌅 Mañana</option>
                    <option value="tarde">☀️ Tarde</option>
                    <option value="noche">🌙 Noche</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">💰 Monto de la venta</label>
                  <div className="input-group">
                    <span className="input-group-text">{simbolo}</span>
                    <input 
                      type="number" 
                      name="monto" 
                      placeholder="0.00"
                      value={form.monto} 
                      onChange={handleChange} 
                      min="0" 
                      step="0.01" 
                      className="form-control"
                      required 
                    />
                  </div>
                </div>
              </div>

              {mensaje && (
                <div className="alert alert-danger mt-3 text-center">
                  {mensaje}
                </div>
              )}
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
              >
                💾 Registrar Venta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VentaModal;
