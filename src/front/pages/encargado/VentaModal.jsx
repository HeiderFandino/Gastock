import React, { useState } from "react";
import "../../styles/UserModal.css";
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
    <div className="modaal-backdrop">
      <div className="modaal">
        <h2 className="titulo">Registrar Venta</h2>
        <form onSubmit={handleSubmit} className="modaal-form px-0">
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="monto"
            placeholder={`Monto (${simbolo})`}
            value={form.monto}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          <select name="turno" value={form.turno} onChange={handleChange}>
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
          </select>

          {mensaje && (
            <div className="alert alert-danger text-center mt-3 py-2 fw-bold">
              {mensaje}
            </div>
          )}

          <div className="modaal-actions mt-3">
            <button type="button" onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VentaModal;
