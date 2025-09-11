import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ⬇️ Mantén tus componentes como ya los tienes
import ResumenVentas from "./VistaVentas/ResumenVentas";
import VentasPorRestauranteChart from "./VistaVentas/VentasPorRestauranteChart";
import TablaTopRestaurantes from "./VistaVentas/TablaTopRestaurantes";
import EvolucionVentasMensual from "./VistaVentas/EvolucionVentasMensual";
// (Opcional) si tienes filtros para ventas
// import FiltrosVentas from "./VistaVentas/FiltrosVentas";


// Estilos ya incluidos en brand-unified.css

const AdminVentas = () => {
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
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="sticky-top"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", zIndex: 10 }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                💰 Ventas — Visión General
              </h1>
              <p className="text-muted mb-0 small">Resumen mensual, ranking por restaurante y evolución anual</p>
            </div>

            {/* Controles de mes */}
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={retrocederMes}
                aria-label="Mes anterior"
              >
                ←
              </button>

              <div 
                className="px-4 py-2 fw-medium text-center" 
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '12px',
                  minWidth: '180px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  fontSize: '0.95rem',
                  color: 'var(--color-text)'
                }}
              >
                📅 {new Date(ano, mes - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                <input
                  type="month"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                  value={mesAno}
                  onChange={(e) => setMesAno(e.target.value)}
                  aria-label="Seleccionar mes"
                />
              </div>

              <button
                className="btn d-flex align-items-center justify-content-center"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-bg-subtle)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-bg-card)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={avanzarMes}
                aria-label="Mes siguiente"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">


        {/* KPIs */}
        <section className="mb-4">
          <ResumenVentas mes={mes} ano={ano} />
        </section>

        {/* Grid: Barras por restaurante + Top tabla */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-7">
            <div 
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              <div 
                className="px-4 py-3 d-flex align-items-center gap-3"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--color-bg-subtle)',
                    borderRadius: '10px',
                    fontSize: '1.2rem'
                  }}
                >
                  📊
                </div>
                <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>Ventas por restaurante</h5>
              </div>
              <div className="p-4" style={{ height: "450px" }}>
                <VentasPorRestauranteChart mes={mes} ano={ano} />
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div 
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              <div 
                className="px-4 py-3 d-flex align-items-center gap-3"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--color-bg-subtle)',
                    borderRadius: '10px',
                    fontSize: '1.2rem'
                  }}
                >
                  🏆
                </div>
                <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>Top restaurantes</h5>
              </div>
              <div className="p-3">
                <TablaTopRestaurantes mes={mes} ano={ano} top={15} />
              </div>
            </div>
          </div>
        </div>

        {/* Evolución anual */}
        <div 
          className="mb-4"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >
          <div 
            className="px-4 py-3 d-flex align-items-center gap-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-subtle)',
                borderRadius: '10px',
                fontSize: '1.2rem'
              }}
            >
              📈
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: "var(--color-text)" }}>Evolución anual de ventas ({ano})</h5>
          </div>
          <div className="p-4">
            <EvolucionVentasMensual ano={ano} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminVentas;
