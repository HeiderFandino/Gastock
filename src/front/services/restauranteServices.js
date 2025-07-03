const backendUrl = import.meta.env.VITE_BACKEND_URL;

const restauranteService = {
  getRestaurantes: async (token) => {
    const response = await fetch(`${backendUrl}/api/restaurantes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener la información de los restaurantes");
    }

    return await response.json();
  },

  createRestaurante: async (data, token) => {
    const response = await fetch(`${backendUrl}/api/restaurantes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear restaurante");
    }

    return await response.json();
  },

  updateRestaurante: async (id, data, token) => {
    const response = await fetch(`${backendUrl}/api/restaurantes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar restaurante");
    }

    return await response.json();
  },

  eliminarRestaurante: async (id, token) => {
    const response = await fetch(`${backendUrl}/api/restaurantes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del servidor:", errorText);
      throw new Error("No se pudo eliminar el restaurante");
    }

    return response.status !== 204 ? await response.json() : null;
  },

  eliminarRestaurante: async (id, password, token) => {
  const response = await fetch(`${backendUrl}/api/restaurantes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ adminPassword: password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error del servidor:", errorText);
    throw new Error("No se pudo eliminar el restaurante");
  }

  return response.status !== 204 ? await response.json() : null;
},
verificarVentas: async (id, token) => {
  try {
    const response = await fetch(`${backendUrl}/api/restaurantes/${id}/tiene-ventas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
    },
    });
    if (!response.ok) throw new Error("Error al verificar ventas");
    return await response.json();
  } catch (error) {
    console.error("Error en verificarVentas:", error);
    throw error;
  }
},

getRestaurante: async (id) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${backendUrl}/api/restaurantes/${id}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo obtener el restaurante");
  }
  return await response.json();
},

};

export default restauranteService;
