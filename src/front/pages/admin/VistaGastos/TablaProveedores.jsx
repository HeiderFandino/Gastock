import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminService";
const TablaProveedores = () => {
  const fechaActual = new Date();
  const [mes, setMes] = useState(fechaActual.getMonth() + 1);
  const [ano, setAno] = useState(fechaActual.getFullYear());
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const mesesNombre = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProveedoresTop(mes, ano);
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProveedores();
  }, [mes, ano]);
  return (
    <div className="p-3 bg-white rounded shadow-sm mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Top proveedores por gasto total</h6>
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
        <p>Cargando proveedores...</p>
      ) : proveedores.length === 0 ? (
        <p>No hay datos disponibles para este periodo.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre proveedor</th>
                <th>Total gastado</th>
                <th>Nº restaurantes</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p, i) => (
                <tr key={i}>
                  <td>{p.nombre}</td>
                  <td>€{p.total_gastado.toLocaleString()}</td>
                  <td>{p.num_restaurantes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default TablaProveedores;
















