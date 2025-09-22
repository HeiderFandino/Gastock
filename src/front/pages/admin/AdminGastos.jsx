import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Tus componentes ya subidos
import ResumenGastos from "./ResumenGastos";
import GastoPorRestauranteChart from "./GastoPorRestauranteChart";
import TablaProveedores from "./TablaProveedores";
import EvolucionGastoMensual from "./EvolucionGastoMensual";
import FiltrosGasto from "./FiltrosGasto";

// Acciones rápidas (si ya las tienes)
import { QuickActionsAdmin } from "../../components/QuickActionsAdmin";

// Estilos ya incluidos en brand-unified.css

const AdminGastos = () => {
  const navigate = useNavigate();
  const hoy = new Date();
  const [mesAno, setMesAno] = useState(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`
  );
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [ano, setAno] = useState(hoy.getFullYear());

  useEffect(() => {
    const [y, m] = mesAno.split("-").map(Number);
    setMes(m);
    setAno(y);
    const el = document.getElementsByClassName("custom-sidebar")?.[0];
    if (el) el.scrollTo(0, 0);
  }, [mesAno]);

  const retrocederMes = () => {
    const d = new Date(ano, mes - 2);
    setMesAno(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const avanzarMes = () => {
    const d = new Date(ano, mes); // siguiente mes
    setMesAno(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="min-vh-100" style={{ background: 'var(--color-bg)' }}>
      {/* Header sticky */}
      <div className="sticky-top" style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', zIndex: 1000 }}>
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                💸 Gastos — Visión General
              </h1>
              <p className="text-muted mb-0 small">Análisis de gastos mensual, gasto por restaurante y evolución anual</p>
            </div>
            
            {/* Controles de mes */}
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <button 
                className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
                onClick={retrocederMes}
                style={{ 
                  width: '36px', 
                  height: '36px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'var(--color-brand-100)';
                  e.target.style.borderColor = 'var(--color-brand-300)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.borderColor = 'var(--color-border)';
                }}
              >
                ←
              </button>
              
              <div 
                className="px-4 py-2 rounded-pill fw-medium position-relative"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  minWidth: '180px',
                  textAlign: 'center'
                }}
              >
                {new Date(ano, mes - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                <input
                  type="month"
                  className="position-absolute w-100 h-100 opacity-0"
                  style={{ top: 0, left: 0, cursor: 'pointer' }}
                  value={mesAno}
                  onChange={(e) => setMesAno(e.target.value)}
                  aria-label="Seleccionar mes"
                />
              </div>
              
              <button 
                className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center"
                onClick={avanzarMes}
                style={{ 
                  width: '36px', 
                  height: '36px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'var(--color-brand-100)';
                  e.target.style.borderColor = 'var(--color-brand-300)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.borderColor = 'var(--color-border)';
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {/* Resumen KPI */}
        <div className="mb-4">
          <ResumenGastos mes={mes} ano={ano} />
        </div>

        {/* Grid: Barras por restaurante + Tabla proveedores */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-7">
            <div 
              className="h-100 p-0 overflow-hidden"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="d-flex align-items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--color-brand-600)',
                    color: 'white',
                    fontSize: '18px'
                  }}
                >
                  💸
                </div>
                <h5 className="mb-0 fw-semibold" style={{ color: 'var(--color-text)' }}>
                  Gastos por Restaurante
                </h5>
              </div>
              <div className="p-4" style={{ height: "450px" }}>
                <GastoPorRestauranteChart mes={mes} ano={ano} />
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div 
              className="h-100 p-0 overflow-hidden"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="d-flex align-items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--color-brand-600)',
                    color: 'white',
                    fontSize: '18px'
                  }}
                >
                  🤝
                </div>
                <h5 className="mb-0 fw-semibold" style={{ color: 'var(--color-text)' }}>
                  Proveedores Principales
                </h5>
              </div>
              <div className="p-0">
                <TablaProveedores mes={mes} ano={ano} />
              </div>
            </div>
          </div>
        </div>

        {/* Evolución anual */}
        <div className="mb-4">
          <div 
            className="p-0 overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="d-flex align-items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--color-brand-600)',
                  color: 'white',
                  fontSize: '18px'
                }}
              >
                📈
              </div>
              <h5 className="mb-0 fw-semibold" style={{ color: 'var(--color-text)' }}>
                Evolución del Gasto - Año {ano}
              </h5>
            </div>
            <div className="p-4">
              <EvolucionGastoMensual ano={ano} />
            </div>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div 
          className="p-0 overflow-hidden"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="d-flex align-items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-brand-600)',
                color: 'white',
                fontSize: '18px'
              }}
            >
              🧭
            </div>
            <h5 className="mb-0 fw-semibold" style={{ color: 'var(--color-text)' }}>
              Herramientas Adicionales
            </h5>
          </div>
          <div className="p-4">
            <FiltrosGasto />
            <div className="mt-3 p-3 rounded-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <small className="text-muted">
                💡 <strong>Próximas funciones:</strong> Selector de restaurante específico y acceso directo al análisis detallado por día.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGastos;
