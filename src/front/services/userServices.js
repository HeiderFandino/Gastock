// src/front/services/userServices.js
const userServices = {};
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Manejo 401 → limpia sesión y te manda al Home (no a /login si no la usas)
const handleUnauthorized = (response) => {
  if (response.status === 401) {
    sessionStorage.clear();
    window.location.href = "/"; // usa "/" porque tu login está en Home
  }
};

userServices.register = async (formData) => {
  try {
    const resp = await fetch(backendUrl + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!resp.ok) throw Error("something went wrong");
    return await resp.json();
  } catch (error) {
    console.log(error);
  }
};

// OJO: aquí pasas el token desde fuera, esto ya estaba bien
userServices.getUsuarios = async (token) => {
  const response = await fetch(`${backendUrl}/api/usuarios`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  await new Promise((res) => setTimeout(res, 2000));
  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error("No se pudo obtener la información del los usuarios");
  }
  return await response.json();
};

// ✅ CORREGIDO: leer SIEMPRE de sessionStorage (donde guardas el token)
userServices.getUserinfo = async () => {
  const token = sessionStorage.getItem("token");
  const resp = await fetch(backendUrl + "/api/private", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  await new Promise((res) => setTimeout(res, 2000));
  if (!resp.ok) {
    handleUnauthorized(resp);
    throw new Error("No se pudo obtener la información del usuario");
  }
  return await resp.json();
};

userServices.login = async (formData) => {
  try {
    const resp = await fetch(backendUrl + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!resp.ok) throw Error("something went wrong");
    const data = await resp.json();

    // Ya lo hacías así: guardar en sessionStorage
    sessionStorage.setItem("token", data.access_token);
    sessionStorage.setItem("restaurante_id", data.user.restaurante_id);
    sessionStorage.setItem("restaurante_moneda", data.user.restaurante_nombre);

    return data;
  } catch (error) {
    console.log(error);
  }
};

export default userServices;
