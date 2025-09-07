import React, { useState, useEffect } from "react";
import userServices from "../services/userServices";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/gastock2_tmp.png";
import { useNavigate, Link } from "react-router-dom";

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [FormData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleChange = (e) => {
    setFormData({ ...FormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    userServices
      .login(FormData)
      .then((data) => {
        if (!data || !data.access_token) {
          setErrorMessage("Credenciales incorrectas");
        } else {
          sessionStorage.setItem("token", data.access_token);
          if (data.user && data.user.rol === "admin") {
            localStorage.setItem("adminEmail", data.user.email);
          }
          dispatch({ type: "get_user_info", payload: data.user });
          navigate(`/${data.user.rol}/dashboard`);
        }
      })
      .catch(() => setErrorMessage("Hubo un error en el login"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-panel">
      <h2 className="auth-title">Iniciar sesión</h2>

      {errorMessage && (
        <div className="alert">{errorMessage}</div>
      )}

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
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <Link to="/forgot-password" className="forgot-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </form>
    </div>
  );
};