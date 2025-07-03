const ventaServices = {};
const backendUrl = import.meta.env.VITE_BACKEND_URL;

ventaServices.registrarVenta = async (formData) => {
  const token = sessionStorage.getItem("token");
  const resp = await fetch(`${backendUrl}/api/ventas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.msg || "Error al registrar venta");
  }

  return data;
};

ventaServices.getVentas = async (mes, ano) => {
  const token = sessionStorage.getItem("token");
  const resp = await fetch(`${backendUrl}/api/ventas?mes=${mes}&ano=${ano}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) throw new Error("Error al obtener ventas");
  return await resp.json();
};

ventaServices.eliminarVenta = async (id) => {
  const token = sessionStorage.getItem("token");
  const resp = await fetch(`${backendUrl}/api/ventas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Error al eliminar venta");
};

ventaServices.editarVenta = async (id, data) => {
  const token = sessionStorage.getItem("token");
  const resp = await fetch(`${backendUrl}/api/ventas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error("Error al actualizar venta");
};

ventaServices.getVentasEncargado = async (mes, ano) => {
  const token = sessionStorage.getItem("token");
  const resp = await fetch(`${backendUrl}/api/ventas/encargado?mes=${mes}&ano=${ano}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) throw new Error("Error al obtener ventas");
  return await resp.json();
};

ventaServices.getVentasDetalle = async (mes, ano, restaurante_id) => {
  const resp = await fetch(
    `${backendUrl}/api/ventas-detalle?mes=${mes}&ano=${ano}&restaurante_id=${restaurante_id}`,
    {
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    }
  );
  if (!resp.ok) throw new Error("Error al obtener ventas");
  return await resp.json();
};

export default ventaServices;
