import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gastoServices from "../../services/GastoServices";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

const AdminGastosDetalle = () => {
  const simbolo = MonedaSimbolo();
  const { store } = useGlobalReducer();
  const user = store.user;
  const query = new URLSearchParams(window.location.search);
  const restauranteId = query.get("restaurante_id") || user?.restaurante_id;
  const navigate = useNavigate();

  const hoy = new Date();
  const [selectedDate, setSelectedDate] = useState(hoy.toISOString().split("T")[0]);
  const [dailyData, setDailyData] = useState([]);
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [proveedoresList, setProveedoresList] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!restauranteId) return;
    gastoServices
      .getProveedores(restauranteId)
      .then((list) => setProveedoresList(list))
      .catch(() => {});
  }, [restauranteId]);

  useEffect(() => {
    if (!restauranteId) return;

    const fetchGastos = async () => {
      try {
        const all = await gastoServices.getGastos(restauranteId);

        if (!Array.isArray(all)) throw new Error("Respuesta inválida");

        const filtered = all.filter((g) => g.fecha === selectedDate);
        setDailyData(filtered);
        setMensaje(""); // limpia mensaje de error si éxito
      } catch (err) {
        console.error("❌ Error al obtener gastos diarios:", err);
        setMensaje("Error al obtener gastos diarios");
      }
    };

    fetchGastos();
  }, [selectedDate, restauranteId]);

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleHoy = () => setSelectedDate(new Date().toISOString().split("T")[0]);

  const displayedDaily = dailyData
    .filter((g) => !filterProveedor || Number(g.proveedor_id) === Number(filterProveedor))
    .filter((g) => !filterCategoria || g.categoria === filterCategoria);

  return (
    <div className="dashboard-container ">
      <div className="mb-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/admin/dashboard")}>
          ← Volver
        </button>
      </div>

      <h1 className="dashboard-title mb-3">Detalle Diario de Gastos</h1>

      {mensaje && <div className="alert alert-danger">{mensaje}</div>}

      <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
        <label className="me-2">Fecha:</label>
        <input
          type="date"
          className="form-control w-auto me-2"
          value={selectedDate}
          onChange={handleDateChange}
        />
        <button className="btn btn-success me-3" onClick={handleHoy}>
          Hoy
        </button>

        <label className="me-2">Proveedor:</label>
        <select
          className="form-select w-auto me-2"
          value={filterProveedor}
          onChange={(e) => setFilterProveedor(e.target.value)}
        >
          <option value="">Todos</option>
          {proveedoresList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <label className="me-2">Categoría:</label>
        <select
          className="form-select w-auto"
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="alimentos">Alimentos</option>
          <option value="bebidas">Bebidas</option>
          <option value="limpieza">Limpieza</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-striped users-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {displayedDaily.map((g) => {
              const provName = proveedoresList.find((p) => p.id === g.proveedor_id)?.nombre || g.proveedor_id;
              return (
                <tr key={g.id}>
                  <td>{provName}</td>
                  <td>{g.categoria}</td>
                  <td>{simbolo}{parseFloat(g.monto).toFixed(2)}</td>
                  <td>{g.nota}</td>
                </tr>
              );
            })}
            {displayedDaily.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">
                  No hay gastos para esta fecha.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminGastosDetalle;
