import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Tus componentes ya subidos
import ResumenGastos from "./VistaGastos/ResumenGastos";
import GastoPorRestauranteChart from "./VistaGastos/GastoPorRestauranteChart";
import TablaProveedores from "./VistaGastos/TablaProveedores";
import EvolucionGastoMensual from "./VistaGastos/EvolucionGastoMensual";
import FiltrosGasto from "./VistaGastos/FiltrosGasto";

// Acciones rápidas (si ya las tienes)
import { QuickActionsAdmin } from "../../components/QuickActionsAdmin";

// CSS específico (hereda de brand)
import "../../styles/AdminGastos.css";

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
    <div className="dashboard-container">
      <div className="mb-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/admin/dashboard")}>
          ← Volver
        </button>
      </div>

      <h1 className="dashboard-title mb-1">Gastos — Visión General</h1>
      <p className="dashboard-welcome mb-3">Resumen mensual, ranking por restaurante y proveedores.</p>

      {/* Controles fecha (mobile-first) */}
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

      {/* Resumen KPI */}
      <section className="ag-section">
        <ResumenGastos mes={mes} ano={ano} />
      </section>

      {/* Grid responsive: gráfico barras (izq) + tabla proveedores (der) */}
      <section className="ag-grid">
        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">💸</div>
            <h5 className="mb-0">Gasto por restaurante</h5>
          </div>
          <div className="ag-chart-wrap">
            <GastoPorRestauranteChart mes={mes} ano={ano} />
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <div className="ag-icon">🤝</div>
            <h5 className="mb-0">Proveedores más usados</h5>
          </div>
          <TablaProveedores mes={mes} ano={ano} />
        </div>
      </section>

      {/* Evolución anual */}
      <section className="ag-card mt-3">
        <div className="ag-card-header">
          <div className="ag-icon">📈</div>
          <h5 className="mb-0">Evolución del gasto (año {ano})</h5>
        </div>
        <div className="ag-chart-wrap">
          <EvolucionGastoMensual ano={ano} />
        </div>
      </section>

      {/* (Opcional) Filtros extra + CTA detalle por restaurante */}
      <section className="ag-card mt-3">
        <div className="ag-card-header">
          <div className="ag-icon">🧭</div>
          <h5 className="mb-0">Filtros adicionales</h5>
        </div>
        <div className="p-3">
          <FiltrosGasto />
          <small className="text-muted d-block mt-2">
            *Próximamente: selector de restaurante y acceso directo al detalle diario.
          </small>
        </div>
      </section>
    </div>
  );
};

export default AdminGastos;
