import React, { useState, useEffect } from "react";
import userServices from "../services/userServices";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/logo.svg";
import { useNavigate, Link } from "react-router-dom";


export const Login = () => {

  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [FormData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

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
      .catch(() => setErrorMessage("Hubo un error en el login"));
  };
  return (
    <div className="auth-overlay text-center mt-sm-0 mb-sm-4 mt-md-0">
      <img
        src={logo}
        alt="Chef Logo"
        className="img-fluid mb-3"
        style={{ height: "100px" }}
      />
      <h2 className="text-dark mb-4 fw-bold">Iniciar sesión</h2>
      {errorMessage && (
        <div className="alert alert-danger">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'transparent' }}>
        <div className="mb-3 text-start">
          <label htmlFor="username" className="form-label">Correo electrónico</label>
          <input
            type="email"
            name="email"
            id="username"
            className="form-control"
            placeholder="Introduce tu email"
            value={FormData.email}
            onChange={handleChange}
          />
          <small className="text-muted">Tu usuario único</small>
        </div>
        <div className="mb-3 text-start">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            placeholder="Introduce tu contraseña"
            value={FormData.password}
            onChange={handleChange}
          />
          <small className="text-muted">Tu contraseña segura</small>
        </div>
        <button type="submit" className="btn bg-orange text-white w-100">
          Entrar
        </button>
        <div className="mt-3">
          <p className="text-center mt-2">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </p>
        </div>
      </form>
    </div>
  );
};















