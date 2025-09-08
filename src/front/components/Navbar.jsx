import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logo from "../assets/img/gastock2_tmp.png";

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
    <nav ref={navRef} className="navbar navbar-light bg-white border-bottom py-2 sticky-top">
      <div className="container-fluid align-items-center">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img
            src={logo}
            alt="Gastock Logo"
            className="brand-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </Link>

        {/* Bloque compacto: texto pegado al icono (SIEMPRE, móvil y desktop) */}
        <div className="user-compact d-flex align-items-center ms-auto">
          <div className="user-lines me-2 text-end">
            <div className="user-name fw-semibold text-truncate" title={nombre}>{nombre}</div>
            <div className="user-role extra-small text-capitalize">{rol}</div>
            {rol !== "admin" && (
              <div className="user-restaurant extra-small text-muted text-truncate" title={restaurante}>
                {restaurante}
              </div>
            )}
          </div>

          {/* Botón avatar (toggle menú propio) */}
          <button
            type="button"
            className="avatar-btn"
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <i className="bi bi-person-circle" />
          </button>
        </div>

        {/* Menú fijo superpuesto */}
        {open && (
          <>
            {/* Fondo clicable para cerrar */}
            <div className="user-menu-backdrop" />
            <div ref={menuRef} className="user-menu">
              {/* Cabecera con datos (útil en pantallas pequeñas) */}


              <ul className="list-unstyled mb-0">
                <li>
                  <Link className="user-menu-item" to="/profile" onClick={() => setOpen(false)}>
                    <i className="bi bi-person me-2" /> Perfil
                  </Link>
                </li>
                <li>
                  <Link className="user-menu-item" to={`/${rol}/settings`} onClick={() => setOpen(false)}>
                    <i className="bi bi-gear me-2" /> Ajustes
                  </Link>
                </li>
                <li><hr className="my-2" /></li>
                <li>
                  <button className="user-menu-item text-danger" onClick={handleLogout}>
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
