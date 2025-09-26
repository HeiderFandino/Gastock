import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import AuditServices from "../../services/AuditServices";
import { FiActivity, FiUser, FiCalendar, FiFilter, FiRefreshCw } from "react-icons/fi";

const AdminActividad = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const user = store?.user;

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 50,
    action_type: "",
    table_name: "",
    date_from: "",
    date_to: ""
  });

  // Verificar que sea admin
  useEffect(() => {
    if (!user || user.rol !== "admin") {
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate]);

  // Cargar logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await AuditServices.getLogs(filters);
      setLogs(response.logs || []);
    } catch (err) {
      console.error("Error loading logs:", err);
      setError("Error al cargar la actividad");
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await AuditServices.getStats();
      setStats(response);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  useEffect(() => {
    if (user?.rol === "admin") {
      loadLogs();
      loadStats();
    }
  }, [user, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      per_page: 50,
      action_type: "",
      table_name: "",
      date_from: "",
      date_to: ""
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const getActionIcon = (actionType) => {
    const icons = {
      CREATE: "🆕",
      UPDATE: "✏️",
      DELETE: "🗑️",
      LOGOUT: "🚪"
    };
    return icons[actionType] || "📝";
  };

  const getActionColor = (actionType) => {
    const colors = {
      CREATE: "text-success",
      UPDATE: "text-info",
      DELETE: "text-danger",
      LOGOUT: "text-secondary"
    };
    return colors[actionType] || "text-muted";
  };

  if (!user || user.rol !== "admin") {
    return null;
  }

  return (
    <div className="dashboard-container admin-bb">
      {/* Header */}
      <div
        className="sticky-top"
        style={{
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          zIndex: 10
        }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                <FiActivity className="me-2" />
                Actividad del Sistema
              </h1>
              <p className="text-muted mb-0 small">
                Historial completo de acciones realizadas por todos los usuarios
              </p>
            </div>
            <button
              onClick={() => { loadLogs(); loadStats(); }}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "spin" : ""} />
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Estadísticas rápidas */}
        {stats && (
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="card-brand p-3">
                <h6 className="fw-bold text-primary mb-2">Acciones por Tipo</h6>
                {stats.actions_by_type?.filter(item => item.type !== 'LOGIN').slice(0, 3).map((item, index) => (
                  <div key={index} className="d-flex justify-content-between small mb-1">
                    <span>{getActionIcon(item.type)} {item.type}</span>
                    <span className="fw-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card-brand p-3">
                <h6 className="fw-bold text-info mb-2">Usuarios Más Activos</h6>
                {stats.most_active_users?.slice(0, 3).map((user, index) => (
                  <div key={index} className="d-flex justify-content-between small mb-1">
                    <span className="text-truncate">{user.name}</span>
                    <span className="fw-medium">{user.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card-brand p-3">
                <h6 className="fw-bold text-success mb-2">Tablas Modificadas</h6>
                {stats.actions_by_table?.slice(0, 3).map((table, index) => (
                  <div key={index} className="d-flex justify-content-between small mb-1">
                    <span>{table.table}</span>
                    <span className="fw-medium">{table.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="card-brand p-3 mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <FiFilter />
            <h6 className="mb-0 fw-bold">Filtros</h6>
            <button
              onClick={clearFilters}
              className="btn btn-outline-secondary btn-sm ms-auto"
            >
              Limpiar
            </button>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label small fw-medium">Tipo de Acción</label>
              <select
                className="form-select"
                value={filters.action_type}
                onChange={(e) => handleFilterChange("action_type", e.target.value)}
              >
                <option value="">Todas</option>
                <option value="CREATE">🆕 Crear</option>
                <option value="UPDATE">✏️ Actualizar</option>
                <option value="DELETE">🗑️ Eliminar</option>
                <option value="LOGOUT">🚪 Logout</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-medium">Tabla</label>
              <select
                className="form-select"
                value={filters.table_name}
                onChange={(e) => handleFilterChange("table_name", e.target.value)}
              >
                <option value="">Todas</option>
                <option value="gastos">💰 Gastos</option>
                <option value="ventas">📊 Ventas</option>
                <option value="usuarios">👥 Usuarios</option>
                <option value="proveedores">🏢 Proveedores</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-medium">Fecha Desde</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_from}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-medium">Fecha Hasta</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lista de actividad */}
        <div className="card-brand">
          <div className="p-3 border-bottom">
            <h6 className="fw-bold mb-0">
              <FiCalendar className="me-2" />
              Registro de Actividad ({logs.filter(log => log.action_type !== 'LOGIN').length} entradas)
            </h6>
          </div>

          {loading ? (
            <div className="p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 mb-0 text-muted">Cargando actividad...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center">
              <FiActivity size={48} className="text-muted mb-3" />
              <p className="text-muted mb-0">
                {Object.values(filters).some(f => f && f !== 1 && f !== 50)
                  ? "No se encontraron registros con los filtros aplicados"
                  : "No hay actividad registrada aún"}
              </p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {logs.filter(log => log.action_type !== 'LOGIN').map((log, index) => (
                <div key={log.id} className="list-group-item border-0">
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1">
                      <span className="fs-4">{getActionIcon(log.action_type)}</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className={`badge ${getActionColor(log.action_type)}`}>
                          {log.action_type}
                        </span>
                        <span className="text-muted small">
                          <FiUser size={12} className="me-1" />
                          {log.usuario_nombre}
                        </span>
                        <span className="text-muted small">
                          <FiCalendar size={12} className="me-1" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="mb-1 fw-medium">
                        {log.description || `${log.action_type} en ${log.table_name}`}
                      </p>
                      {log.table_name && (
                        <small className="text-muted">
                          Tabla: <code>{log.table_name}</code>
                          {log.record_id && ` | ID: ${log.record_id}`}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS para el spinner */}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminActividad;