import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import { useNavigate } from "react-router-dom";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import "../../styles/AdminGastos.css";
import { FiSave } from "react-icons/fi";

export const RegistrarVenta = () => {
  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const simbolo = MonedaSimbolo();
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    monto: "",
    turno: "mañana",
  });

  const [estado, setEstado] = useState({ loading: false, mensaje: "", error: false });

  const nombreMes = new Date(form.fecha).toLocaleString("es", { month: "long", year: "numeric" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado({ loading: true, mensaje: "", error: false });

    try {
      const data = {
        ...form,
        restaurante_id: store.user.restaurante_id,
      };
      await ventaServices.registrarVenta(data);
      setEstado({ loading: false, mensaje: "Venta registrada con éxito", error: false });
      setTimeout(() => {
        navigate("/encargado/ventas");
      }, 1500);
    } catch (error) {
      setEstado({
        loading: false,
        mensaje: error.message || "Error al registrar la venta",
        error: true,
      });
    }
  };

  const actionsClass = `d-flex gap-2 mt-4 ${estado.loading ? 'is-loading-blur' : ''}`;
  const submitButtonClass = `btn btn-success d-inline-flex align-items-center ${estado.loading ? 'btn-loading' : ''}`;

  return (
    <div className="dashboard-container admin-bb">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">

        <div className="ag-title-wrap">
          <h1 className="ag-title">Registrar Venta</h1>
          <p className="ag-subtitle">Registra una nueva venta para el mes actual: {nombreMes}</p>
        </div>
      </div>

      {estado.mensaje && (
        <div className={`alert text-center ${estado.error ? "alert-danger" : "alert-success"}`} role="alert">
          {estado.mensaje}
        </div>
      )}

      {/* ===== Formulario ===== */}
      <div className="ag-card">
        <div className="ag-card-header">
          <div className="ag-icon">💰</div>
          <h5 className="mb-0">Datos de la Venta</h5>
        </div>
        <div className="p-3 p-md-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Fecha */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  className="form-control"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                  disabled={estado.loading}
                />
              </div>

              {/* Turno */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold">Turno</label>
                <select
                  name="turno"
                  className="form-control"
                  value={form.turno}
                  onChange={handleChange}
                  disabled={estado.loading}
                >
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                </select>
              </div>

              {/* Monto */}
              <div className="col-12">
                <label className="form-label fw-bold">Monto ({simbolo})</label>
                <input
                  type="number"
                  name="monto"
                  className="form-control"
                  value={form.monto}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={estado.loading}
                />
              </div>
            </div>

            <div className={actionsClass}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/encargado/ventas')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={submitButtonClass}
                disabled={estado.loading}
                aria-busy={estado.loading}
              >
                {estado.loading ? (
                  <>
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <FiSave size={16} className="me-1" />
                    <span>Registrar Venta</span>
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
