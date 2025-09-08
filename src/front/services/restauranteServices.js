// src/front/services/restauranteServices.js
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const restauranteService = {
  getRestaurantes: async (token) => {
    const res = await fetch(`${backendUrl}/api/restaurantes`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error("No se pudo obtener la información de los restaurantes");
    return await res.json();
  },

  createRestaurante: async (data, token) => {
    const res = await fetch(`${backendUrl}/api/restaurantes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Error al crear restaurante");
    return json;
  },

  updateRestaurante: async (id, data, token) => {
    const res = await fetch(`${backendUrl}/api/restaurantes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(json?.message || "Error al actualizar restaurante");
    return json;
  },

  eliminarRestaurante: async (id, password, token) => {
    const res = await fetch(`${backendUrl}/api/restaurantes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Admin-Password": password, // ✅ contraseña por cabecera
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      let msg =
        json?.error || json?.message || "No se pudo eliminar el restaurante";
      if (json?.conteos) {
        const c = json.conteos;
        msg += ` (ventas: ${c.ventas}, gastos: ${c.gastos}, proveedores: ${c.proveedores}, usuarios: ${c.usuarios})`;
      }
      throw new Error(msg);
    }
    return json || null;
  },

  verificarVentas: async (id, token) => {
    const res = await fetch(
      `${backendUrl}/api/restaurantes/${id}/tiene-ventas`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Error al verificar ventas");
    // Asegura boolean:
    return Boolean(json?.tieneVentas);
  },

  getRestaurante: async (id) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${backendUrl}/api/restaurantes/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("No se pudo obtener el restaurante");
    return await res.json();
  },
};

export default restauranteService;
