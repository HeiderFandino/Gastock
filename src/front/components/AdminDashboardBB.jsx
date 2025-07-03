import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import '../styles/AdminDashboardBB.css';
import { QuickActionsAdmin } from '../components/QuickActionsAdmin';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MonedaSimbolo = () => '€';

const GastosChefAdmin = ({ datos, alto, xAxisProps, yAxisProps, tooltipProps, lineProps }) => (
  <ResponsiveContainer width="100%" height={alto}>
    <BarChart data={datos}>
      <XAxis {...xAxisProps} />
      <YAxis {...yAxisProps} />
      <Tooltip {...tooltipProps} />
      <Bar {...lineProps} />
    </BarChart>
  </ResponsiveContainer>
);

const AdminDashboardBB = () => {
  const navigate = useNavigate();
  const simbolo = MonedaSimbolo();
  const [resumenes, setResumenes] = useState([]);
  const [gastoDiario, setGastoDiario] = useState({});

  useEffect(() => {
    const fetchResumen = async () => {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();

      try {
        const data = await adminService.getResumenGeneral(mes, ano);
        setResumenes(data);

        const diarioData = {};
        for (const r of data) {
          const res = await adminService.getResumenGastoDiario(r.restaurante_id, mes, ano);
          diarioData[r.restaurante_id] = res;
        }
        setGastoDiario(diarioData);
      } catch (err) {
        console.error("Error al cargar resumen general", err);
      }
    };

    fetchResumen();
  }, []);

  const getColorClasses = (porcentaje) => {
    if (porcentaje > 36) return ['bg-danger-subtle', 'text-danger', '🚨', 'Alto'];
    if (porcentaje > 33) return ['bg-warning-subtle', 'text-warning', '⚠️', 'Atención'];
    return ['bg-success-subtle', 'text-success', '✅', 'Dentro de rango'];
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome mb-4">Tu resumen actual.</h1>

      <div className="card shadow-sm border rounded p-4 flex-wrap mb-4 d-flex flex-row justify-content-start">
        {[...resumenes]
          .sort((a, b) => b.venta_total - a.venta_total)
          .map((r, index) => {
            const [bgClass, textClass, icono, status] = getColorClasses(r.porcentaje_gasto);
            const gastoDia = gastoDiario[r.restaurante_id] || [];

            return (
              <div key={r.restaurante_id} className={`restaurant-card restauranteDash flex-grow-1 col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl-3 mb-4 ps-4 me-2 ${isTop1(index) ? 'top-one-card' : ''}`} >
                <h4 className="mb-2 text-center fw-bold">{isTop1(index) ? '🌟 ' : ''}{r.nombre}</h4>

                <div className="d-flex justify-content-between gap-2 mb-3">
                  {/* CAMBIO: tarjeta azul con texto azul */}
                  <div className="card shadow-sm border rounded p-2 bg-info-subtle" style={{ width: '48%' }}>
                    <div className="text-center">
                      <div className="icono-circular bg-white rounded-circle mb-1 d-inline-flex align-items-center justify-content-center" >
                        💰
                      </div>
                      <p className="fw-bold text-info mb-0 small">Ventas</p>
                      <p className="fw-bold text-dark mb-0 fs-6" style={{ fontSize: '0.75rem' }}>
                        {r.venta_total.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' ' + simbolo}
                      </p>
                    </div>
                  </div>

                  <div className={`card shadow-sm border rounded p-2 ${bgClass}`} style={{ width: '48%' }}>
                    <div className="text-center">
                      <div className="icono-circular bg-white rounded-circle mb-1 d-inline-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                        {icono}
                      </div>
                      <p className={`fw-bold fs-6 ${textClass} mb-0 small`}>% Gasto</p>
                      <p className={`fw-bold fs-6 ${textClass} mb-0`} style={{ fontSize: '0.75rem' }}>
                        {r.venta_total > 0 ? r.porcentaje_gasto + '%' : '0%'}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  className="mt-2 enlacevertodo"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => navigate(`/admin/restaurante/${r.restaurante_id}`)}
                >
                  Ver todo
                </a>
              </div>
            );
          })}
      </div>

      <div className="card mt-4 shadow-sm border rounded p-4 px-0 pt-0">
        <QuickActionsAdmin />
      </div>
    </div>
  );
};

const isTop1 = (index) => index === 0;

export default AdminDashboardBB;
