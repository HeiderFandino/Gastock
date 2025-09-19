// src/front/components/Login.jsx
import React, { useState, useEffect } from "react";
import userServices from "../services/userServices";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../styles/Login.css"; // 👈 nuevo import para estilos

// ACL simple para validar si una ruta privada es accesible por rol
const ACL = [
  { prefix: "/chef/gastos", roles: ["chef"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/encargado", roles: ["encargado"] },
  { prefix: "/chef", roles: ["chef"] },
  { prefix: "/ventas", roles: ["encargado"] },
];

function isAllowed(path, rol) {
  const match =
    ACL.filter((r) => path.startsWith(r.prefix)).sort(
      (a, b) => b.prefix.length - a.prefix.length
    )[0] || null;
  if (!match) return true; // rutas no listadas = abiertas
  return match.roles.includes(rol);
}

function destinoPorRol(rol) {
  if (rol === "admin") return "/admin/dashboard";
  if (rol === "encargado") return "/encargado/dashboard";
  if (rol === "chef") return "/chef/dashboard";
  return "/";
}

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();

  const [FormData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleChange = (e) => {
    setFormData({ ...FormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await userServices.login(FormData);

      if (!data?.access_token || !data?.user) {
        setErrorMessage("Usuario o contraseña incorrectos");
        return;
      }

      sessionStorage.setItem("token", data.access_token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.rol === "admin") {
        localStorage.setItem("adminEmail", data.user.email);
      }

      dispatch({ type: "get_user_info", payload: data.user });

      const last = sessionStorage.getItem("lastPrivatePath");
      if (last && last.startsWith("/") && isAllowed(last, data.user.rol)) {
        navigate(last, { replace: true });
        return;
      }

      navigate(destinoPorRol(data.user.rol), { replace: true });
    } catch (err) {
      if (err.payload?.msg) {
        setErrorMessage(err.payload.msg);
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel">
      <h2 className="auth-title">Iniciar sesión</h2>

      {errorMessage && <div className="login-error">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="form-control"
            placeholder="Introduce tu email"
            value={FormData.email}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            placeholder="Introduce tu contraseña"
            value={FormData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <Link to="/forgot-password" className="forgot-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </form>
    </div>
  );
};
