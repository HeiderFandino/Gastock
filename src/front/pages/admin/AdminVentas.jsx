import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ⬇️ Mantén tus componentes como ya los tienes
import ResumenVentas from "./VistaVentas/ResumenVentas";
import VentasPorRestauranteChart from "./VistaVentas/VentasPorRestauranteChart";
import TablaTopRestaurantes from "./VistaVentas/TablaTopRestaurantes";
import EvolucionVentasMensual from "./VistaVentas/EvolucionVentasMensual";
// (Opcional) si tienes filtros para ventas
// import FiltrosVentas from "./VistaVentas/FiltrosVentas";


// Reutilizamos el mismo CSS de Gastos para el layout (ag-*)
import "../../styles/AdminGastos.css";

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
    <div className="dashboard-container">
      {/* Volver */}
      {/* HEADER COMPACTO V2 PARA VENTAS */}
      <div className="ag-header mb-3">
        <div className="ag-header-top">

          <div className="ag-brand-dot" />
        </div>

        <div className="ag-title-wrap">
          <h1 className="ag-title">Ventas — Visión General</h1>
          <p className="ag-subtitle">Resumen mensual, ranking por restaurante y evolución anual.</p>
        </div>

        {/* Controles Mes (compactos y centrados) */}
        <div className="ag-monthbar">
          <button className="ag-monthbtn" onClick={retrocederMes} aria-label="Mes anterior">←</button>

          <div className="ag-monthpill">
            {new Date(ano, mes - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            {/* input real (oculto) para accesibilidad y teclado */}
            <input
              type="month"
              className="ag-month-hidden"
              value={mesAno}
              onChange={(e) => setMesAno(e.target.value)}
              aria-label="Seleccionar mes"
            />
          </div>

          <button className="ag-monthbtn" onClick={avanzarMes} aria-label="Mes siguiente">→</button>
        </div>
      </div>


      {/* KPIs */}
      <section className="ag-section">
        <ResumenVentas mes={mes} ano={ano} />
      </section>

      {/* Grid: Barras por restaurante + Top tabla */}
      <section className="ag-grid">
        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">📊</div>
            <h5 className="mb-0">Ventas por restaurante</h5>
          </div>
          <div className="ag-chart-wrap">
            <VentasPorRestauranteChart mes={mes} ano={ano} />
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">🏆</div>
            <h5 className="mb-0">Top restaurantes</h5>
          </div>
          <div className="p-3">
            <TablaTopRestaurantes mes={mes} ano={ano} top={15} />
          </div>
        </div>
      </section>

      {/* Evolución anual */}
      <section className="ag-card mt-3">
        <div className="ag-card-header">
          <div className="ag-icon">📈</div>
          <h5 className="mb-0">Evolución anual de ventas ({ano})</h5>
        </div>
        <div className="ag-chart-wrap">
          <EvolucionVentasMensual ano={ano} />
        </div>
      </section>

      {/* (Opcional) Filtros adicionales, si los tienes */}
      {false && (
        <section className="ag-card mt-3">
          <div className="ag-card-header">
            <div className="ag-icon">🧭</div>
            <h5 className="mb-0">Filtros adicionales</h5>
          </div>
          <div className="p-3">
            {/* <FiltrosVentas /> */}
            <small className="text-muted d-block mt-2">
              *Próximamente: selector de restaurante y exportación a CSV.
            </small>
          </div>
        </section>
      )}


    </div>
  );
};

export default AdminVentas;
