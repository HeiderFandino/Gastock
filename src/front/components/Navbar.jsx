import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/logo.svg"; // ⚠️ Ajusta la ruta según tu proyecto

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const user = store?.user;

  if (!user) return null;

  const nombre = user?.nombre || "Usuario";
  const rol = (user?.rol || "").toLowerCase();
  const restaurante = user?.restaurante_nombre || "Sin restaurante";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    dispatch({ type: "get_user_info", payload: null });
    navigate("/");
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom py-2 sticky-top">
      <div className="container-fluid align-items-center px-3">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img
            src={logo}
            alt="Gastock Logo"
            className="brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="fw-semibold text-dark brand-text">
            Gastock
          </span>
        </Link>

        {/* Bloque usuario */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Texto usuario (≥ md) */}
          <div className="text-end d-none d-md-block me-1">
            <p
              className="mb-0 name color-orange text-truncate user-name"
              title={nombre}
            >
              {nombre}
            </p>
            <p className="mb-0 small text-capitalize fw-bold">{rol}</p>
            {rol !== "admin" && (
              <p
                className="mb-0 restaurant text-secondary small text-truncate user-restaurant"
                title={restaurante}
              >
                {restaurante}
              </p>
            )}
          </div>

          {/* Avatar + dropdown */}
          <div className="dropdown">
            <button
              className=" p-0 avatar-btn"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Menú de usuario"
            >
              <i className="bi bi-person-circle"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              {/* Info usuario en móvil */}
              <li className="d-md-none px-3 py-2">
                <div className="small fw-semibold text-truncate" title={nombre}>
                  {nombre}
                </div>
                <div className="small text-muted text-capitalize">{rol}</div>
                {rol !== "admin" && (
                  <div
                    className="small text-muted text-truncate"
                    title={restaurante}
                  >
                    {restaurante}
                  </div>
                )}
              </li>
              <li>
                <hr className="dropdown-divider d-md-none" />
              </li>

              <li>
                <Link className="dropdown-item" to="/profile">
                  <i className="bi bi-person me-2" /> Perfil
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to={`/${rol}/settings`}>
                  <i className="bi bi-gear me-2" /> Ajustes
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2" /> Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};
