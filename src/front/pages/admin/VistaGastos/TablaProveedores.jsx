// src/front/pages/admin/VistaGastos/TablaProveedores.jsx
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminService";
import "../../../styles/EncargadoDashboard.css";

const nombresMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const TablaProveedores = ({ mes, ano }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mes || !ano) return;
      setLoading(true);
      try {
        const data = await adminService.getProveedoresTop(mes, ano);
        if (!mounted) return;
        setProveedores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
        setProveedores([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mes, ano]);

  return (
    <div className="card-brand mt-4">
      <h6 className="ag-card-title mb-4" style={{ color: '#2563eb' }}>📦 Top proveedores ({nombresMes[mes - 1]?.toLowerCase()} {ano})</h6>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" style={{ color: '#2563eb' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando proveedores...</p>
        </div>
      ) : !proveedores.length ? (
        <div className="text-center py-4">
          <div className="ag-icon mx-auto mb-3" style={{ 
            background: '#fef3c7', 
            color: '#d97706', 
            width: 48, 
            height: 48, 
            fontSize: '1.5rem' 
          }}>📦</div>
          <p className="text-muted">No hay datos disponibles para este periodo.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table users-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ color: '#374151', fontWeight: '600' }}>Nombre proveedor</th>
                <th style={{ color: '#374151', fontWeight: '600' }}>Total gastado</th>
                <th style={{ color: '#374151', fontWeight: '600' }}>Veces usado</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p, i) => (
                <tr key={i}>
                  <td className="fw-medium" style={{ color: '#1f2937' }}>{p.nombre}</td>
                  <td className="fw-bold" style={{ color: '#2563eb' }}>€{Number(p.total_gastado || 0).toLocaleString("es-ES")}</td>
                  <td style={{ color: '#6366f1', fontWeight: '500' }}>{Number(p.veces_usado ?? 0).toLocaleString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default TablaProveedores;
