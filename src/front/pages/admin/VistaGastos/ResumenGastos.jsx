// src/front/pages/admin/VistaGastos/ResumenGastos.jsx
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminService";
import "../../../styles/EncargadoDashboard.css";

const nombresMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const ResumenGastos = ({ mes, ano }) => {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mes || !ano) return;
      setLoading(true);
      try {
        const data = await adminService.getResumenAdminGastos(mes, ano);
        if (!mounted) return;

        const labelMes = nombresMes[mes - 1] || "";
        if (data && data.total_gastado !== undefined) {
          setResumen([
            { titulo: `Total gastado (${labelMes.toLowerCase()})`, valor: `€${Number(data.total_gastado).toLocaleString()}` },
            { titulo: "Nº de restaurantes activos", valor: data.restaurantes_activos },
            { titulo: "Proveedor más usado", valor: data.proveedor_top },
            { titulo: "Top restaurante", valor: data.restaurante_top },
          ]);
        } else {
          setResumen([]);
        }
      } catch (e) {
        console.error("Error al obtener el resumen:", e);
        setResumen([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mes, ano]);

  if (loading) return (
    <div className="text-center py-4">
      <div className="spinner-border" style={{ color: '#2563eb' }} role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
  
  if (!resumen.length) return (
    <div className="text-center py-4">
      <p className="text-muted">No hay datos disponibles.</p>
    </div>
  );

  return (
    <div className="row g-4 mb-0">
      {resumen.map((item, i) => (
        <div key={i} className="col-6 col-md-3">
          <div className="card-brand h-100 text-center" style={{ padding: '20px 12px' }}>
            <div className="ag-icon mx-auto mb-3" style={{ 
              background: i === 0 ? '#fee2e2' : i === 1 ? '#dbeafe' : i === 2 ? '#fef3c7' : '#dcfce7', 
              color: i === 0 ? '#2563eb' : i === 1 ? '#2563eb' : i === 2 ? '#d97706' : '#16a34a', 
              width: 48, 
              height: 48, 
              fontSize: '1.2rem' 
            }}>
              {i === 0 ? '💸' : i === 1 ? '🏢' : i === 2 ? '📦' : '🏆'}
            </div>
            <p className="ag-card-label mb-2">{item.titulo}</p>
            <h3 className="ag-card-value mb-0" style={{ color: '#2563eb' }}>{item.valor}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumenGastos;
