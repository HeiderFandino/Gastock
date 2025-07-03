import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminService from "../services/adminService";
import "../styles/AdminDashboardBB.css";

const AdminRestauranteDetalle = () => {
  const { id } = useParams();
  const [resumen, setResumen] = useState({});

  useEffect(() => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const ano = fecha.getFullYear();

    const fetchResumen = async () => {
      try {
        const data = await adminService.getResumenPorcentaje(id, mes, ano);
        setResumen(data);
      } catch (error) {
        console.error("Error al obtener resumen del restaurante:", error);
      }
    };

    fetchResumen();
  }, [id]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Detalle del Restaurante #{id}</h2>
      <ul className="list-group mt-4">
        <li className="list-group-item fw-bold" style={{ textShadow: '0 0 2px white' }}>
          💰 Total ventas: €{" "}
          {resumen.total_ventas?.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </li>
        <li className="list-group-item fw-bold" style={{ textShadow: '0 0 2px white' }}>
          📉 Total gastos: €{" "}
          {resumen.total_gastos?.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </li>
        <li className="list-group-item fw-bold" style={{ textShadow: '0 0 2px white' }}>
          📈 Promedio diario: €{" "}
          {resumen.promedio_diario?.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </li>
        <li className="list-group-item fw-bold" style={{ textShadow: '0 0 2px white' }}>
          🧮 Proyección mensual: €{" "}
          {resumen.proyeccion_mensual?.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </li>
        <li className="list-group-item fw-bold" style={{ textShadow: '0 0 2px white' }}>
          📊 Porcentaje gasto:{" "}
          {resumen.porcentaje?.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          %
        </li>
      </ul>
    </div>
  );
};

export default AdminRestauranteDetalle;
