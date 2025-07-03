import React, { useEffect, useState } from "react";
import "../styles/UserModal.css";

const GastoModal = ({ gasto, proveedores, onClose, onSave }) => {
  const [form, setForm] = useState({
    proveedor_id: "",
    categoria: "",
    monto: "",
    nota: ""
  });

  useEffect(() => {
    if (gasto) {
      setForm({
        proveedor_id: gasto.proveedor_id || "",
        categoria: gasto.categoria || "",
        monto: gasto.monto || "",
        nota: gasto.nota || ""
      });
    }
  }, [gasto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const categoriaCapitalizada = form.categoria.charAt(0).toUpperCase() + form.categoria.slice(1);

    const payload = {
      proveedor_id: parseInt(form.proveedor_id),
      categoria: categoriaCapitalizada,
      monto: parseFloat(form.monto),
      nota: form.nota,
      fecha: gasto.fecha,
      usuario_id: gasto.usuario_id,
      restaurante_id: gasto.restaurante_id
    };

    if (gasto.archivo_adjunto) {
      payload.archivo_adjunto = gasto.archivo_adjunto;
    }

    console.log("🟡 Datos enviados al backend:", payload);
    onSave({ ...gasto, ...payload });
  };

  return (
    <div className="modaal-backdrop">
      <div className="modaal">
        <h2 className="titulo">Editar Gasto</h2>
        <form onSubmit={handleSubmit} className="modaal-form px-0">
          <select
            name="proveedor_id"
            value={form.proveedor_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona categoría</option>
            <option value="alimentos">Alimentos</option>
            <option value="bebidas">Bebidas</option>
            <option value="limpieza">Limpieza</option>
            <option value="otros">Otros</option>
          </select>

          <input
            type="number"
            name="monto"
            value={form.monto}
            onChange={handleChange}
            placeholder="Monto"
            required
          />

          <input
            type="text"
            name="nota"
            value={form.nota}
            onChange={handleChange}
            placeholder="Nota"
          />

          <div className="modaal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GastoModal;
