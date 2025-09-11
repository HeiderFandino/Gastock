import React, { useEffect, useMemo, useState } from "react";
import adminService from "../../../services/adminService";
import { useSearchParams } from "react-router-dom";
import "../../../styles/EncargadoDashboard.css";

const ResumenVentas = ({ mes: mesProp, ano: anoProp }) => {
  const [searchParams] = useSearchParams();
  const hoy = useMemo(() => new Date(), []);
  const mesFromUrl = Number(searchParams.get("mes")) || null;
  const anoFromUrl = Number(searchParams.get("ano")) || null;

  const mes = mesProp || mesFromUrl || hoy.getMonth() + 1;
  const ano = anoProp || anoFromUrl || hoy.getFullYear();

  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    const fetchResumen = async () => {
      setLoading(true);
      try {
        const data = await adminService.getResumenAdminVentas(mes, ano);
        if (cancel) return;

        if (data && data.total_vendido !== undefined) {
          setResumen([
            { titulo: `Total vendido (${mes}/${ano})`, valor: `€${Number(data.total_vendido || 0).toLocaleString("es-ES")}` },
            { titulo: "Nº de restaurantes con ventas", valor: Number(data.restaurantes_con_ventas || 0).toLocaleString("es-ES") },
            { titulo: "Restaurante top", valor: data.restaurante_top || "—" },
            { titulo: "Promedio por restaurante", valor: `€${Number(data.promedio_por_restaurante || 0).toLocaleString("es-ES")}` },
          ]);
        } else setResumen([]);
      } catch (err) {
        console.error("Error al obtener el resumen de ventas:", err);
        setResumen([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    fetchResumen();
    return () => { cancel = true; };
  }, [mes, ano]);

  if (loading) return (
    <div className="text-center py-4">
      <div className="spinner-border" style={{ color: '#2563eb' }} role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
  
  if (!resumen || resumen.length === 0) return (
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
              background: i === 0 ? '#dcfce7' : i === 1 ? '#dbeafe' : i === 2 ? '#fef3c7' : '#e0e7ff', 
              color: i === 0 ? '#16a34a' : i === 1 ? '#2563eb' : i === 2 ? '#d97706' : '#7c3aed', 
              width: 48, 
              height: 48, 
              fontSize: '1.2rem' 
            }}>
              {i === 0 ? '💰' : i === 1 ? '🏢' : i === 2 ? '🏆' : '📊'}
            </div>
            <p className="ag-card-label mb-2">{item.titulo}</p>
            <h3 className="ag-card-value mb-0" style={{ color: '#2563eb' }}>{item.valor}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumenVentas;
