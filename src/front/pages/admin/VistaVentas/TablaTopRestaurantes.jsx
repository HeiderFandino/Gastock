import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminService";

const TablaTopRestaurantes = () => {
  const fechaActual = new Date();
  const [mes, setMes] = useState(fechaActual.getMonth() + 1);
  const [ano, setAno] = useState(fechaActual.getFullYear());
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const mesesNombre = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const fetchRestaurantes = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRestaurantesTop(mes, ano);
      setRestaurantes(data);
    } catch (error) {
      console.error("Error al obtener restaurantes:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRestaurantes();
  }, [mes, ano]);
  return (
    <div className="p-3 bg-white rounded shadow-sm mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" value={mes} onChange={e => setMes(parseInt(e.target.value))}>
            {mesesNombre.map((nombre, i) => (
              <option key={i + 1} value={i + 1}>{nombre.toLowerCase()}</option>
            ))}
          </select>
          <select className="form-select form-select-sm" value={ano} onChange={e => setAno(parseInt(e.target.value))}>
            {[ano - 1, ano, ano + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
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
                  <td>€{r.total_vendido.toLocaleString()}</td>
                  <td>{r.num_ventas}</td>
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