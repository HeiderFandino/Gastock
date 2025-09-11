import React, { useEffect, useState } from "react";
// Estilos ya incluidos en brand-unified.css

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

    onSave({ ...gasto, ...payload });
  };

  return (
    <div className="modal fade show brand-modal" style={{ display: 'block', background: 'rgba(0, 0, 0, 0.65)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-icon">📝</div>
            <h5 className="modal-title">Editar Gasto</h5>
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
                  <label className="form-label">🏢 Proveedor</label>
                  <select 
                    name="proveedor_id" 
                    value={form.proveedor_id} 
                    onChange={handleChange} 
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona proveedor...</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">📋 Categoría</label>
                  <select 
                    name="categoria" 
                    value={form.categoria} 
                    onChange={handleChange} 
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona categoría...</option>
                    <option value="alimentos">🍞 Alimentos</option>
                    <option value="bebidas">🥤 Bebidas</option>
                    <option value="limpieza">🧽 Limpieza</option>
                    <option value="equipamiento">⚒️ Equipamiento</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">💰 Monto</label>
                  <input 
                    type="number" 
                    name="monto" 
                    value={form.monto} 
                    onChange={handleChange} 
                    placeholder="0.00"
                    className="form-control"
                    step="0.01"
                    min="0"
                    required 
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">📝 Nota (opcional)</label>
                  <input 
                    type="text" 
                    name="nota" 
                    value={form.nota} 
                    onChange={handleChange} 
                    placeholder="Descripción adicional del gasto..."
                    className="form-control"
                  />
                </div>
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
              >
                💾 Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GastoModal;
