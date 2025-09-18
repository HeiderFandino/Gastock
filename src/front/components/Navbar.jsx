import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/gastock2_tmp.png";
import "../styles/nabvar.css";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const user = store?.user;
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const nombre = user?.nombre || "Usuario";
  const rol = (user?.rol || "").toLowerCase();
  const restaurante = user?.restaurante_nombre || "Sin restaurante";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    dispatch({ type: "get_user_info", payload: null });
    navigate("/");
  };

  // Altura navbar → CSS var para posicionar el menú fijo
  useEffect(() => {
    const setNavbarH = () => {
      const el = navRef.current || document.querySelector(".navbar.sticky-top");
      if (!el) return;
      const h = Math.round(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    };
    setNavbarH();
    window.addEventListener("resize", setNavbarH);
    return () => window.removeEventListener("resize", setNavbarH);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <nav
      ref={navRef}
      className="navbar sticky-top"
    >
      <div className="container-fluid align-items-center" style={{ padding: "0.25rem 0.75rem" }}>
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/"
          style={{ color: "var(--color-text)" }}
        >
          <img
            src={logo}
            alt="Gastock Logo"
            className="brand-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </Link>

        {/* Bloque compacto: texto pegado al icono */}
        <div className="user-compact d-flex align-items-center ms-auto">
          <div className="user-lines me-2 text-end d-block">
            <div
              className="user-name fw-semibold text-truncate"
              title={nombre}
              style={{
                color: "#000000",
                fontSize: "1rem",
                lineHeight: "1.2",
                maxWidth: "150px",
                fontWeight: "600"
              }}
            >
              {nombre}
            </div>
            <div
              className="user-role text-capitalize"
              style={{
                color: "#1d4ed8",
                fontSize: "0.85rem",
                lineHeight: "1.2",
                fontWeight: "500"
              }}
            >
              {rol}
            </div>
            {rol !== "admin" && (
              <div
                className="user-restaurant text-truncate"
                title={restaurante}
                style={{
                  color: "#60a5fa",
                  fontSize: "0.8rem",
                  lineHeight: "1.2",
                  fontWeight: "500"
                }}
              >
                {restaurante}
              </div>
            )}
          </div>

          {/* Botón avatar moderno */}
          <button
            type="button"
            className="btn d-flex align-items-center justify-content-center"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "var(--color-primary)",
              border: "none",
              color: "white",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.3)";
            }}
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <i className="bi bi-person-circle" style={{ fontSize: "1.5rem" }} />
          </button>
        </div>

        {/* Menú moderno superpuesto */}
        {open && (
          <>
            {/* Fondo clicable para cerrar */}
            <div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{
                background: "rgba(0, 0, 0, 0.1)",
                zIndex: 999,
                backdropFilter: "blur(2px)"
              }}
            />
            <div
              ref={menuRef}
              className="position-absolute"
              style={{
                top: "calc(100% + 8px)",
                right: "16px",
                minWidth: "200px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                zIndex: 1000,
                padding: "8px"
              }}
            >
              {/* Cabecera móvil */}
              <div className="d-md-none px-3 py-2 mb-2 border-bottom" style={{ borderColor: "var(--color-border)" }}>
                <div
                  className="fw-semibold"
                  style={{ color: "var(--color-text)", fontSize: "0.9rem" }}
                >
                  {nombre}
                </div>
                <div
                  className="text-capitalize"
                  style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}
                >
                  {rol}
                </div>
                {rol !== "admin" && (
                  <div
                    style={{ color: "var(--color-text-muted)", fontSize: "0.7rem" }}
                  >
                    {restaurante}
                  </div>
                )}
              </div>

              <ul className="list-unstyled mb-0">
                <li>
                  <Link
                    className="d-flex align-items-center px-3 py-2 text-decoration-none rounded-2"
                    to="/profile"
                    onClick={() => setOpen(false)}
                    style={{
                      color: "var(--color-text)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "var(--color-bg-subtle)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    <i className="bi bi-person me-2" /> Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    className="d-flex align-items-center px-3 py-2 text-decoration-none rounded-2"
                    to={`/${rol}/settings`}
                    onClick={() => setOpen(false)}
                    style={{
                      color: "var(--color-text)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "var(--color-bg-subtle)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    <i className="bi bi-gear me-2" /> Configuración
                  </Link>
                </li>
                <li>
                  <hr
                    className="my-2"
                    style={{ borderColor: "var(--color-border)", margin: "8px 0" }}
                  />
                </li>
                <li>
                  <button
                    className="btn w-100 d-flex align-items-center px-3 py-2 rounded-2"
                    onClick={handleLogout}
                    style={{
                      color: "var(--color-danger)",
                      background: "transparent",
                      border: "none",
                      transition: "all 0.2s ease",
                      textAlign: "left"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "var(--color-danger-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2" /> Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};