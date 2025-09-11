import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import gastoServices from "../../services/GastoServices";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { MonedaSimbolo } from "../../services/MonedaSimbolo";
import GastoModal from "../../components/GastoModal";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

// Estilos ya incluidos en brand-unified.css

const AdminGastosDetalle = () => {
  const simbolo = MonedaSimbolo();
  const { store } = useGlobalReducer();
  const user = store.user;
  const query = new URLSearchParams(window.location.search);
  const restauranteId = query.get("restaurante_id");
  const navigate = useNavigate();

  const [view, setView] = useState("diario");
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
  const [loading, setLoading] = useState(true);

  // Helpers
  const rid = Number(restauranteId);
  const provById = (id) => proveedoresList.find((p) => Number(p.id) === Number(id));
  const provName = (id) => (provById(id)?.nombre ?? String(id));

  // Proveedores (según restaurante)
  useEffect(() => {
    if (!rid) return;
    gastoServices
      .getProveedores(rid)
      .then(setProveedoresList)
      .catch(() => { });
  }, [rid]);

  // Resumen mensual
  useEffect(() => {
    if (view !== "mensual" || !rid) return;
    gastoServices
      .resumenMensual(mes, ano)
      .then((data) => {
        // Filtrar por restaurante_id en el frontend
        const filteredData = {
          datos: {},
          proveedores: [],
          dias: data.dias || [],
          totales: {}
        };
        // Solo mantenemos los datos del restaurante específico
        setMonthlyData(filteredData);
      })
      .catch(() => setMensaje("Error al obtener resumen mensual"));
  }, [view, mes, ano, rid]);

  // Carga diaria
  const cargarGastosDiarios = async () => {
    try {
      const all = await gastoServices.getGastos();
      const filtered = all
        .filter((g) => Number(g.restaurante_id) === rid)
        .filter((g) => g.fecha === selectedDate);

      setDailyData(filtered);
      setTipoMensaje("info");
      setMensaje("");
    } catch (err) {
      setMensaje("Error al obtener gastos diarios");
      setTipoMensaje("error");
    }
  };

  useEffect(() => {
    if (view !== "diario" || !rid) return;
    cargarGastosDiarios();
  }, [view, selectedDate, rid]);

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleHoy = () => setSelectedDate(new Date().toISOString().split("T")[0]);

  const cambiarDia = (delta) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + delta);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const nombreMes = new Date(ano, mes - 1).toLocaleString("es", { month: "long", year: "numeric" });

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

      setDailyData((prev) =>
        prev.map((g) =>
          g.id === editado.id
            ? {
              ...g,
              ...editado,
              fecha: selectedDate,
              restaurante_id: rid,
            }
            : g
        )
      );
    } catch (err) {
      setMensaje("❌ Error al actualizar gasto");
      setTipoMensaje("error");
    } finally {
      setModalVisible(false);
      setGastoEditar(null);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

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

  const displayedDaily = dailyData
    .filter((g) => !filterProveedor || Number(g.proveedor_id) === Number(filterProveedor))
    .filter((g) => !filterCategoria || g.categoria === filterCategoria);

  const totalGastosDia = useMemo(
    () => displayedDaily.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0),
    [displayedDaily]
  );

  const totalGastosMes = useMemo(
    () => Object.values(monthlyData.totales || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0),
    [monthlyData.totales]
  );

  // Si no hay restaurante_id, mostrar error
  if (!restauranteId) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <div style={{ fontSize: '3rem', opacity: 0.4 }}>⚠️</div>
          <h4 className="text-danger mb-3">⚠️ Error de Parámetros</h4>
          <p className="text-muted">No se ha especificado el ID del restaurante en la URL.</p>
          <button className="btn btn-gastock" onClick={() => navigate('/admin/gastos')}>Volver a Gastos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container admin-bb">
      {/* Header simplificado */}
      <div
        className="sticky-top"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", zIndex: 10 }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button
                className="btn d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.color = 'var(--color-text-secondary)';
                }}
                onClick={() => navigate('/admin/gastos')}
                title="Volver a Gastos"
                aria-label="Volver a Gastos"
              >
                ←
              </button>
              <div>
                <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                  💸 Detalle de Gastos
                </h1>
                <p className="text-muted mb-0 small">Gestiona los gastos del restaurante</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {mensaje && (
          <div className={`alert alert-dismissible fade show ${tipoMensaje === "success" ? "alert-success" : "alert-danger"}`} role="alert" style={{ borderRadius: '12px' }}>
            {mensaje}
          </div>
        )}

        {/* ===== Tabs elegantes ===== */}
        <div className="d-flex justify-content-center mb-4">
          <div className="d-flex" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '4px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
            <button
              className="btn px-4 py-2 fw-medium"
              style={{
                borderRadius: '12px',
                border: 'none',
                background: view === "mensual" ? 'var(--color-primary)' : 'transparent',
                color: view === "mensual" ? 'white' : 'var(--color-text)',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                boxShadow: view === "mensual" ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
              }}
              onClick={() => setView("mensual")}
            >
              📊 Mensual
            </button>
            <button
              className="btn px-4 py-2 fw-medium"
              style={{
                borderRadius: '12px',
                border: 'none',
                background: view === "diario" ? 'var(--color-primary)' : 'transparent',
                color: view === "diario" ? 'white' : 'var(--color-text)',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                boxShadow: view === "diario" ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
              }}
              onClick={() => setView("diario")}
            >
              📅 Diario
            </button>
          </div>
        </div>

        {/* ======= VISTA MENSUAL ======= */}
        {view === "mensual" ? (
          <>
            {/* ===== Filtro de mes centrado ===== */}
            <div className="d-flex align-items-center justify-content-center mb-4">
              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease',
                  fontSize: '1.1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={() => {
                  const newMonth = mes === 1 ? 12 : mes - 1;
                  const newYear = mes === 1 ? ano - 1 : ano;
                  setMes(newMonth);
                  setAno(newYear);
                }}
              >
                ◀
              </button>
              <div
                className="mx-4 px-5 py-3 fw-medium text-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  minWidth: '220px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  fontSize: '1.1rem',
                  color: 'var(--color-text)'
                }}
              >
                📊 {nombreMes}
              </div>
              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease',
                  fontSize: '1.1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={() => {
                  const newMonth = mes === 12 ? 1 : mes + 1;
                  const newYear = mes === 12 ? ano + 1 : ano;
                  setMes(newMonth);
                  setAno(newYear);
                }}
              >
                ▶
              </button>
            </div>

            <div className="text-center py-4">
              <div className="ag-icon mx-auto mb-2" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>📊</div>
              <p className="text-muted">Vista mensual próximamente disponible.</p>
            </div>
          </>
        ) : (
          /* ======= VISTA DIARIA ======= */
          <>
            {/* ===== Filtro de fecha elegante ===== */}
            <div className="d-flex align-items-center justify-content-center mb-4">
              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease',
                  fontSize: '1.1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={() => cambiarDia(-1)}
              >
                ◀
              </button>

              <div className="d-flex align-items-center mx-4">
                <input
                  type="date"
                  className="form-control text-center fw-medium"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    padding: '12px 16px',
                    minWidth: '180px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <button
                  className="btn ms-3"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-success), color-mix(in srgb, var(--color-success) 85%, #16a34a))',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    padding: '8px 16px',
                    boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 6px rgba(34, 197, 94, 0.3)';
                  }}
                  onClick={handleHoy}
                >
                  🕐 Hoy
                </button>
              </div>

              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease',
                  fontSize: '1.1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={() => cambiarDia(1)}
              >
                ▶
              </button>
            </div>

            {/* ===== Filtros adicionales ===== */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">🏢 Proveedor:</label>
                <select
                  className="form-select"
                  value={filterProveedor}
                  onChange={(e) => setFilterProveedor(e.target.value)}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text)',
                    padding: '10px 14px'
                  }}
                >
                  <option value="">Todos los proveedores</option>
                  {proveedoresList.map((p) => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium">📋 Categoría:</label>
                <select
                  className="form-select"
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text)',
                    padding: '10px 14px'
                  }}
                >
                  <option value="">Todas las categorías</option>
                  <option value="alimentos">🍞 Alimentos</option>
                  <option value="bebidas">🥤 Bebidas</option>
                  <option value="limpieza">🧽 Limpieza</option>
                  <option value="equipamiento">⚒️ Equipamiento</option>
                  <option value="otros">📦 Otros</option>
                </select>
              </div>
            </div>

            {displayedDaily.length === 0 ? (
              <div className="text-center py-4">
                <div className="ag-icon mx-auto mb-2" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>📊</div>
                <p className="text-muted">No hay gastos registrados para esta fecha.</p>
              </div>
            ) : (
              <>
                {/* ===== Lista mobile (cards) ===== */}
                <ul className="list-unstyled d-sm-none">
                  {displayedDaily.map((g) => (
                    <li key={g.id} className="ag-card p-3 mb-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <div className="fw-bold" style={{ fontSize: "1.05rem" }}>{provName(g.proveedor_id)}</div>
                          <div className="text-muted" style={{ fontSize: ".9rem" }}>
                            <span className="badge bg-secondary me-2">{g.categoria}</span>
                            {g.nota && <small>{g.nota}</small>}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-success" style={{ fontSize: "1.1rem" }}>
                            {simbolo}{parseFloat(g.monto).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="action-icon-button edit-button"
                          onClick={() => abrirModalEditar(g.id)}
                          title="Editar"
                          aria-label="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          className="action-icon-button delete-button"
                          onClick={() => eliminar(g.id)}
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* ===== Tabla desktop ===== */}
                <div className="table-responsive d-none d-sm-block">
                  <table className="table users-table mt-2 mb-0">
                    <thead>
                      <tr>
                        <th>Proveedor</th>
                        <th>Categoría</th>
                        <th>Monto ({simbolo})</th>
                        <th>Nota</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedDaily.map((g) => (
                        <tr key={g.id}>
                          <td>{provName(g.proveedor_id)}</td>
                          <td><span className="badge bg-secondary">{g.categoria}</span></td>
                          <td className="fw-bold text-success">{simbolo}{parseFloat(g.monto).toFixed(2)}</td>
                          <td>{g.nota || "-"}</td>
                          <td className="text-end">
                            <button
                              className="action-icon-button edit-button me-2"
                              onClick={() => abrirModalEditar(g.id)}
                              title="Editar"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              className="action-icon-button delete-button"
                              onClick={() => eliminar(g.id)}
                              title="Eliminar"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* FAB móvil */}
        <button
          className="ag-fab d-md-none"
          onClick={() => navigate(`/admin/gastos`)}
          aria-label="Nuevo gasto"
          title="Registrar nuevo gasto"
        >
          <FiPlus size={24} />
        </button>

      </div>

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

export default AdminGastosDetalle;