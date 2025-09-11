import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gastoServices from "../../services/GastoServices";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";

import "../../styles/AdminGastos.css";

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
      .catch(() => { });
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
    <div className="dashboard-container">
      {/* ===== Header compacto v2 ===== */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">

          <div className="ag-brand-dot" />
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">Detalle Diario de Gastos</h1>
          <p className="ag-subtitle">Consulta los gastos registrados por fecha y filtros.</p>
        </div>
      </div>

      {mensaje && <div className="alert alert-danger text-center" role="alert">{mensaje}</div>}

      {/* ===== Filtros responsive ===== */}
      <div className="ag-card mb-3">
        <div className="ag-card-header">
          <div className="ag-icon">🔍</div>
          <h5 className="mb-0">Filtros</h5>
        </div>
        <div className="p-3">
          {/* Fecha y botón Hoy */}
          <div className="row g-2 mb-3">
            <div className="col-8 col-sm-6">
              <label className="form-label small fw-bold">Fecha:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="col-4 col-sm-6 d-flex align-items-end">
              <button className="btn btn-outline-success w-100" onClick={handleHoy}>
                Hoy
              </button>
            </div>
          </div>

          {/* Filtros de Proveedor y Categoría */}
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-bold">Proveedor:</label>
              <select
                className="form-select"
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
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-bold">Categoría:</label>
              <select
                className="form-select"
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
          </div>
        </div>
      </div>

      {/* ===== Lista mobile (cards) ===== */}
      <ul className="list-unstyled d-sm-none">
        {displayedDaily.length === 0 ? (
          <li className="text-muted px-2 text-center py-4">
            <div className="ag-icon mx-auto mb-2" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>💸</div>
            No hay gastos para esta fecha.
          </li>
        ) : (
          displayedDaily.map((g) => {
            const provName = proveedoresList.find((p) => p.id === g.proveedor_id)?.nombre || g.proveedor_id;
            return (
              <li key={g.id} className="ag-card p-3 mb-2">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <div className="fw-bold" style={{ fontSize: "1.05rem" }}>{provName}</div>
                    <div className="text-muted" style={{ fontSize: ".9rem" }}>
                      <span className="badge bg-secondary me-2">{g.categoria}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-danger" style={{ fontSize: "1.1rem" }}>
                      {simbolo}{parseFloat(g.monto).toFixed(2)}
                    </div>
                  </div>
                </div>
                {g.nota && (
                  <div className="text-muted small mt-2">
                    <strong>Nota:</strong> {g.nota}
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>

      {/* ===== Tabla desktop ===== */}
      <div className="table-responsive d-none d-sm-block">
        <table className="table users-table mt-2 mb-0">
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
                  <td>
                    <span className="badge bg-secondary">{g.categoria}</span>
                  </td>
                  <td className="fw-bold text-danger">{simbolo}{parseFloat(g.monto).toFixed(2)}</td>
                  <td>{g.nota || '-'}</td>
                </tr>
              );
            })}
            {displayedDaily.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  <div className="ag-icon mx-auto mb-2" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>💸</div>
                  No hay gastos para esta fecha.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Resumen total (solo cuando hay datos) ===== */}
      {displayedDaily.length > 0 && (
        <div className="ag-card mt-3">
          <div className="ag-card-header">
            <div className="ag-icon">📊</div>
            <h5 className="mb-0">Resumen</h5>
          </div>
          <div className="p-3 text-center">
            <div className="fw-bold text-danger" style={{ fontSize: "1.3rem" }}>
              Total: {simbolo}{displayedDaily.reduce((sum, g) => sum + parseFloat(g.monto), 0).toFixed(2)}
            </div>
            <div className="text-muted small">
              {displayedDaily.length} gasto{displayedDaily.length !== 1 ? 's' : ''} registrado{displayedDaily.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGastosDetalle;
