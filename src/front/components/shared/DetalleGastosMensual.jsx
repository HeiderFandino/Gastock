import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import gastoServices from "../../services/GastoServices";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import GastoModal from "../GastoModal";
import "../../styles/Encargado.css";
import "../../styles/EncargadoGastos.mobile.css"; // <-- SOLO móvil

export const DetalleGastosMensual = () => {
  const simbolo = MonedaSimbolo();
  const { store } = useGlobalReducer();
  const user = store.user;
  const navigate = useNavigate();

  const [view, setView] = useState("mensual");
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [ano, setAno] = useState(hoy.getFullYear());

  const [monthlyData, setMonthlyData] = useState({
    datos: {},
    proveedores: [],
    dias: [],
    totales: {},
  });

  const [selectedDate, setSelectedDate] = useState(hoy.toISOString().split("T")[0]);
  const [dailyData, setDailyData] = useState([]);
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [proveedoresList, setProveedoresList] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("info");
  const [gastoEditar, setGastoEditar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!user?.restaurante_id) return;
    gastoServices
      .getProveedores(user.restaurante_id)
      .then(setProveedoresList)
      .catch(() => { });
  }, [user]);

  useEffect(() => {
    if (view !== "mensual" || !user?.restaurante_id) return;
    gastoServices
      .resumenMensual(mes, ano)
      .then(setMonthlyData)
      .catch(() => setMensaje("Error al obtener resumen mensual"));
  }, [view, mes, ano, user?.restaurante_id]);

  useEffect(() => {
    if (view !== "diario" || !user?.restaurante_id) return;

    const fetchGastos = async () => {
      try {
        const all = await gastoServices.getGastos();
        if (!Array.isArray(all)) throw new Error("Datos no válidos");

        const filtered = all
          .filter((g) => g.restaurante_id === user.restaurante_id)
          .filter((g) => g.fecha === selectedDate);

        setDailyData(filtered);
      } catch (err) {
        setMensaje("Error al obtener gastos diarios");
        setTipoMensaje("error");
      }
    };

    fetchGastos();
  }, [view, selectedDate, user?.restaurante_id]);

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const handleMesChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setAno(parseInt(year, 10));
    setMes(parseInt(month, 10));
  };

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleHoy = () => setSelectedDate(new Date().toISOString().split("T")[0]);

  const cambiarDia = (delta) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + delta);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const nombreMes = new Date(ano, mes - 1).toLocaleString("es", { month: "long", year: "numeric" });

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      await gastoServices.eliminarGasto(id);
      setDailyData((prev) => prev.filter((g) => g.id !== id));
      setMensaje("✅ Gasto eliminado correctamente");
      setTipoMensaje("success");
    } catch (err) {
      setMensaje("❌ No se pudo eliminar el gasto");
      setTipoMensaje("error");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const abrirModalEditar = (id) => {
    const gasto = dailyData.find((g) => g.id === id);
    if (gasto) {
      setGastoEditar({ ...gasto });
      setModalVisible(true);
    }
  };

  const guardarEdicion = async (editado) => {
    try {
      await gastoServices.editarGasto(editado.id, editado);
      setMensaje("✅ Gasto actualizado");
      setTipoMensaje("success");
      const updated = await gastoServices.getGastos(user.restaurante_id);
      const filtered = updated.filter((g) => g.fecha === selectedDate);
      setDailyData(filtered);
    } catch (err) {
      setMensaje("❌ Error al actualizar gasto");
      setTipoMensaje("error");
    } finally {
      setModalVisible(false);
      setGastoEditar(null);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const displayedDaily = dailyData
    .filter((g) => !filterProveedor || g.proveedor_id === parseInt(filterProveedor, 10))
    .filter((g) => !filterCategoria || g.categoria === filterCategoria);

  const totalGastosDia = useMemo(
    () => displayedDaily.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0),
    [displayedDaily]
  );
  const totalGastosMes = useMemo(
    () => Object.values(monthlyData.totales || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0),
    [monthlyData.totales]
  );

  return (
    <div className="dashboard-container">

      {/* ======= Header ======= */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="dashboard-title m-0">Detalle de Gastos</h1>
        <button
          className="btn-gastock d-none d-md-inline-flex"
          onClick={() => navigate(`/${user.rol}/gastos/registrar`)}
        >
          <i className="bi bi-plus-circle me-2"></i> Registrar gasto
        </button>

      </div>

      {/* Tabs (desktop y móvil) */}
      <div className="btn-group col-12 col-sm-12 col-lg-6 col-xl-5 mb-3 d-none d-md-inline-flex">
        <button
          className={`btn btn-tab ${view === "mensual" ? "active" : "nobg"}`}
          onClick={() => setView("mensual")}
        >
          Resumen Mensual
        </button>

        <button
          className={`btn btn-tab ${view === "diario" ? "active" : "nobg"}`}
          onClick={() => setView("diario")}
        >
          Detalle Diario
        </button>
      </div>

      {/* Tabs móviles compactos */}
      <div className="eg-tabs d-md-none">
        <button className={`eg-tab ${view === "mensual" ? "active" : ""}`} onClick={() => setView("mensual")}>Gasto mensual</button>
        <button className={`eg-tab ${view === "diario" ? "active" : ""}`} onClick={() => setView("diario")}>Gasto diario</button>
      </div>

      {mensaje && (
        <div className={`alert mt-2 ${tipoMensaje === "success" ? "alert-success" : "alert-danger"}`}>
          {mensaje}
        </div>
      )}

      {/* ======= VISTA MENSUAL ======= */}
      {view === "mensual" ? (
        <>
          {/* Toolbar mes (sticky móvil) */}
          <div className="eg-toolbar d-md-none">
            <input
              type="month"
              className="form-control eg-month"
              value={`${ano}-${String(mes).padStart(2, "0")}`}
              onChange={handleMesChange}
              aria-label="Seleccionar mes"
            />
          </div>
          <div className="eg-toolbar-spacer d-md-none" />

          {/* KPIs móvil */}
          <div className="eg-kpis d-md-none">
            <div className="eg-chip">
              <div className="eg-chip-title text-warning">Total del mes</div>
              <div className="eg-chip-value text-warning">
                {totalGastosMes.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
              </div>
            </div>
            <div className="eg-chip">
              <div className="eg-chip-title">Proveedores</div>
              <div className="eg-chip-value">{monthlyData.proveedores.length}</div>
            </div>
          </div>

          {/* Desktop original */}
          <div className="d-none d-md-block">
            <div className="mb-3 justify-content-start">
              <div className="d-flex justify-content-start flex-wrap align-items-center mb-3 mt-2">

                <input
                  type="month"
                  className="form-control w-auto"
                  value={`${ano}-${String(mes).padStart(2, "0")}`}
                  onChange={handleMesChange}
                />
              </div>
              <p className="text-muted small">Días del mes incluidos: {monthlyData.dias.join(", ")}</p>
            </div>

            <div className="table-responsive">
              <table className="table table-striped users-table">
                <thead>
                  <tr>
                    <th rowSpan="2">Proveedor</th>
                    <th colSpan={monthlyData.dias.length} className="text-center">Día del mes</th>
                    <th rowSpan="2">Total</th>
                  </tr>
                  <tr>
                    {monthlyData.dias.map((d) => (
                      <th key={d} title={`Día ${d}`} className="text-center">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.proveedores.map((prov) => (
                    <tr key={prov}>
                      <td className="fs-7"><strong>{prov}</strong></td>
                      {monthlyData.dias.map((d) => (
                        <td key={d} className="text-end">
                          {monthlyData.datos[prov]?.[d]?.toFixed(2) || "-"}
                        </td>
                      ))}
                      <td className="text-end fw-bold">
                        {monthlyData.totales[prov]?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Móvil: lista simple por proveedor (nombre + total) */}
          <div className="d-md-none">
            <ul className="eg-list">
              {monthlyData.proveedores.map((prov) => (
                <li className="eg-item" key={prov}>
                  <div className="eg-item-main">
                    <div className="eg-item-title">{prov}</div>
                    <div className="eg-item-amount">
                      {(monthlyData.totales[prov] || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
                    </div>
                  </div>
                </li>
              ))}
              {monthlyData.proveedores.length === 0 && (
                <li className="eg-empty">No hay datos del mes seleccionado.</li>
              )}
            </ul>
          </div>
        </>
      ) : (
        /* ======= VISTA DIARIA ======= */
        <>
          {/* Toolbar fecha (sticky móvil) */}
          <div className="eg-toolbar d-md-none">
            <button className="eg-ctrl" onClick={() => cambiarDia(-1)} aria-label="Día anterior">←</button>
            <input type="date" className="form-control eg-date" value={selectedDate} onChange={handleDateChange} />
            <button className="eg-ctrl" onClick={() => cambiarDia(1)} aria-label="Día siguiente">→</button>
            <button className="eg-ctrl eg-ctrl-success" onClick={handleHoy}>Hoy</button>
          </div>
          <div className="eg-toolbar-spacer d-md-none" />

          {/* KPIs móvil */}
          <div className="eg-kpis d-md-none">
            <div className="eg-chip">
              <div className="eg-chip-title text-success">Total del día</div>
              <div className="eg-chip-value text-success">
                {totalGastosDia.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
              </div>
            </div>
            <div className="eg-chip">
              <div className="eg-chip-title">Gastos</div>
              <div className="eg-chip-value">{displayedDaily.length}</div>
            </div>
          </div>

          {/* Desktop original (filtros + tabla) */}
          <div className="d-none d-md-block">
            <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
              <label className="me-2">Fecha:</label>
              <div className="d-flex align-items-center gap-2 me-3">
                <button className="btn btn-outline-secondary px-2" onClick={() => cambiarDia(-1)} title="Día anterior">←</button>
                <input type="date" className="form-control w-auto" value={selectedDate} onChange={handleDateChange} />
                <button className="btn btn-outline-secondary px-2" onClick={() => cambiarDia(1)} title="Día siguiente">→</button>
              </div>
              <button className="btn btn-success me-3" onClick={handleHoy}>Hoy</button>
              <label className="me-2">Proveedor:</label>
              <select className="form-select w-auto me-2" value={filterProveedor} onChange={(e) => setFilterProveedor(e.target.value)}>
                <option value="">Todos</option>
                {proveedoresList.map((p) => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
              </select>
              <label className="me-2">Categoría:</label>
              <select className="form-select w-auto" value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
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
                    <th>Acciones</th>
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
                        <td>
                          <button className="action-icon-button edit-button" onClick={() => abrirModalEditar(g.id)} title="Editar gasto">✏️</button>
                          <button className="action-icon-button delete-button" onClick={() => eliminar(g.id)} title="Eliminar gasto">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                  {displayedDaily.length === 0 && (
                    <tr><td colSpan={5} className="text-center">No hay gastos para esta fecha.</td></tr>
                  )}
                </tbody>
              </table>

              <div className="bg-white shadow rounded p-3 mt-3 text-end">
                <span className="fw-bold fs-5">Total del día: {simbolo}{totalGastosDia.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Móvil: cards compactas */}
          <div className="d-md-none">
            <ul className="eg-list">
              {displayedDaily.map((g) => {
                const provName = proveedoresList.find((p) => p.id === g.proveedor_id)?.nombre || g.proveedor_id;
                return (
                  <li className="eg-item" key={g.id}>
                    <div className="eg-item-main">
                      <div className="eg-item-title">{provName}</div>
                      <div className="eg-item-amount">
                        {parseFloat(g.monto).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
                      </div>
                    </div>
                    <div className="eg-item-sub">
                      <span className="eg-meta">{g.categoria}{g.nota ? ` · ${g.nota}` : ""}</span>
                      <div className="eg-actions">
                        <button className="eg-icon-btn" aria-label="Editar" onClick={() => abrirModalEditar(g.id)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="eg-icon-btn eg-danger" aria-label="Eliminar" onClick={() => eliminar(g.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
              {displayedDaily.length === 0 && <li className="eg-empty">No hay gastos para esta fecha.</li>}
            </ul>

            {/* Total día (móvil) */}
            <div className="eg-totalbar">
              <span>Total del día</span>
              <strong>
                {totalGastosDia.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{simbolo}
              </strong>
            </div>
          </div>
        </>
      )}

      {/* FAB móvil */}
      <button
        className="eg-fab d-md-none"
        onClick={() => navigate(`/${user.rol}/gastos/registrar`)}
        aria-label="Registrar gasto"
      >
        <i className="bi bi-receipt"></i>
      </button>

      {/* Modal edición */}
      {modalVisible && (
        <GastoModal
          gasto={gastoEditar}
          proveedores={proveedoresList}
          onSave={guardarEdicion}
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};
