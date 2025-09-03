import React, { useEffect, useMemo, useState } from "react";
import adminService from "../../../services/adminService";
import { useSearchParams } from "react-router-dom";

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
    <div className="p-3 bg-white rounded shadow-sm mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Top restaurantes por ventas ({mesesNombre[mes - 1].toLowerCase()} {ano})</h6>
        {!controlled && (
          <div className="d-flex gap-2">
            <select className="form-select form-select-sm" value={mes} onChange={e => setMes(parseInt(e.target.value))}>
              {mesesNombre.map((nombre, i) => (
                <option key={i + 1} value={i + 1}>{nombre.toLowerCase()}</option>
              ))}
            </select>
            <select className="form-select form-select-sm" value={ano} onChange={e => setAno(parseInt(e.target.value))}>
              {[ano - 1, ano, ano + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <p>Cargando restaurantes...</p>
      ) : restaurantes.length === 0 ? (
        <p>No hay datos disponibles para este periodo.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre restaurante</th>
                <th>Total vendido</th>
                <th>Nº de ventas</th>
              </tr>
            </thead>
            <tbody>
              {restaurantes.map((r, i) => (
                <tr key={i}>
                  <td>{r.nombre}</td>
                  <td>€{Number(r.total_vendido || 0).toLocaleString("es-ES")}</td>
                  <td>{Number(r.ventas_realizadas || 0).toLocaleString("es-ES")}</td>
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
