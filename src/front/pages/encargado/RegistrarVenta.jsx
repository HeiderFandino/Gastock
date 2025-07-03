import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import ventaServices from "../../services/ventaServices";
import { useNavigate } from "react-router-dom";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

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

  return (
    <div className="dashboard-container">
      <button onClick={() => navigate('/encargado/ventas')} className="back-button">← Volver a ventas</button>
      <h1 className="dashboard-title">Registrar Venta</h1>
      <h5 className="dashboard-welcome text-white mt-2 mb-4 d-inline-block rounded">Mes actual: {nombreMes.toUpperCase()}</h5>

      <form onSubmit={handleSubmit} className="proveedor-card m-0 bg-white col-12 col-sm-12 col-md-12 col-lg-10 col-xx-9 p-4 shadow rounded">
        {/* Fecha */}
        <div className="row align-items-end mb-3">
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 mt-2">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              name="fecha"
              className="form-control"
              value={form.fecha}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Monto */}
        <div className="row align-items-end mb-3">
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 mt-2">
            <label className="form-label">Monto ({simbolo})</label>
            <input
              type="number"
              name="monto"
              className="form-control"
              value={form.monto}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Turno */}
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 mt-2">
            <label className="form-label">Turno</label>
            <select name="turno" className="form-select" value={form.turno} onChange={handleChange}>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>

        <div>
          <button type="submit" className="btn btn-success mt-3" disabled={estado.loading}>
            {estado.loading ? "Guardando..." : "Registrar Venta"}
          </button>
        </div>

        {estado.mensaje && (
          <div className={`alert mt-3 ${estado.error ? "alert-danger" : "alert-success"}`}>
            {estado.mensaje}
          </div>
        )}
      </form>
    </div>
  );
};
