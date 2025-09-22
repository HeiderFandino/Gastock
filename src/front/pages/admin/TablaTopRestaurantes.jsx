import React, { useEffect, useMemo, useState } from "react";
import adminService from "../../services/adminService";
import { useSearchParams } from "react-router-dom";
import "../../styles/EncargadoDashboard.css";

const TablaTopRestaurantes = ({ mes: mesProp, ano: anoProp }) => {
  const [searchParams] = useSearchParams();
  const hoy = useMemo(() => new Date(), []);
  const mesFromUrl = Number(searchParams.get("mes")) || null;
  const anoFromUrl = Number(searchParams.get("ano")) || null;

  const controlled = mesProp && anoProp;
  const [mes, setMes] = useState(mesProp || mesFromUrl || hoy.getMonth() + 1);
  const [ano, setAno] = useState(anoProp || anoFromUrl || hoy.getFullYear());
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const mesesNombre = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const fetchRestaurantes = async (m, a) => {
    setLoading(true);
    try {
      const data = await adminService.getRestaurantesTop(m, a);
      setRestaurantes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener restaurantes:", error);
      setRestaurantes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantes(mes, ano);
  }, [mes, ano]);

  useEffect(() => {
    if (controlled) {
      setMes(mesProp);
      setAno(anoProp);
    }
  }, [controlled, mesProp, anoProp]);

  return (
    <div className="card-brand mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="ag-card-title mb-0" style={{ color: '#2563eb' }}>🏆 Top restaurantes por ventas ({mesesNombre[mes - 1].toLowerCase()} {ano})</h6>
        {!controlled && (
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm" 
              value={mes} 
              onChange={e => setMes(parseInt(e.target.value))}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#374151',
                fontSize: '0.875rem'
              }}
            >
              {mesesNombre.map((nombre, i) => (
                <option key={i + 1} value={i + 1}>{nombre.toLowerCase()}</option>
              ))}
            </select>
            <select 
              className="form-select form-select-sm" 
              value={ano} 
              onChange={e => setAno(parseInt(e.target.value))}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#374151',
                fontSize: '0.875rem'
              }}
            >
              {[ano - 1, ano, ano + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" style={{ color: '#2563eb' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando restaurantes...</p>
        </div>
      ) : restaurantes.length === 0 ? (
        <div className="text-center py-4">
          <div className="ag-icon mx-auto mb-3" style={{ 
            background: '#fef3c7', 
            color: '#d97706', 
            width: 48, 
            height: 48, 
            fontSize: '1.5rem' 
          }}>🏢</div>
          <p className="text-muted">No hay datos disponibles para este periodo.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table users-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ color: '#374151', fontWeight: '600' }}>Nombre restaurante</th>
                <th style={{ color: '#374151', fontWeight: '600' }}>Total vendido</th>
                <th style={{ color: '#374151', fontWeight: '600' }}>Nº de ventas</th>
              </tr>
            </thead>
            <tbody>
              {restaurantes.map((r, i) => (
                <tr key={i}>
                  <td className="fw-medium" style={{ color: '#1f2937' }}>{r.nombre}</td>
                  <td className="fw-bold" style={{ color: '#2563eb' }}>€{Number(r.total_vendido || 0).toLocaleString("es-ES")}</td>
                  <td style={{ color: '#6366f1', fontWeight: '500' }}>{Number(r.ventas_realizadas || 0).toLocaleString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaTopRestaurantes;
