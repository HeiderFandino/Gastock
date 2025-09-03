// src/front/pages/admin/VistaGastos/TablaProveedores.jsx
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminService";

const TablaProveedores = ({ mes, ano }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mes || !ano) return;
      setLoading(true);
      try {
        const data = await adminService.getProveedoresTop(mes, ano);
        if (!mounted) return;
        setProveedores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
        setProveedores([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mes, ano]);

  return (
    <div className="table-responsive">
      {loading ? (
        <p>Cargando proveedores...</p>
      ) : !proveedores.length ? (
        <p>No hay datos disponibles para este periodo.</p>
      ) : (
        <table className="table table-sm table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Nombre proveedor</th>
              <th>Total gastado</th>
              <th>Veces usado</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p, i) => (
              <tr key={i}>
                <td>{p.nombre}</td>
                <td>€{Number(p.total_gastado || 0).toLocaleString()}</td>
                <td>{p.veces_usado ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default TablaProveedores;
