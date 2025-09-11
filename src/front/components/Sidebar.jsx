// src/front/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Sidebar = () => {
  const [menuall, setMenuall] = useState(false); // rail vs ancho
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();
  const rol = store?.user?.rol;
  const { id } = useParams();

  const toggleRail = () => setMenuall(!menuall);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("lastPrivatePath");
    localStorage.removeItem("adminEmail");
    dispatch({ type: "get_user_info", payload: null });
    navigate("/", { replace: true });
  };

  // activo por ruta (soporta rutas con :id)
  const isActive = (paths = []) => {
    return paths.some((p) =>
      p.includes(":")
        ? location.pathname.startsWith(p.replace(":id", id || ""))
        : location.pathname === p
    );
  };

  const getNavLinkStyle = (active = false) => ({
    borderRadius: '12px',
    padding: '12px 16px',
    margin: '2px 0',
    transition: 'all 0.2s ease',
    background: active ? 'var(--color-primary)' : 'transparent',
    color: active ? 'white' : 'var(--color-text)',
    boxShadow: active ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
    textDecoration: 'none',
    border: 'none'
  });

  const getNavLinkHoverProps = (active = false) => ({
    onMouseEnter: (e) => {
      if (!active) {
        e.target.style.background = 'var(--color-bg-subtle)';
        e.target.style.transform = 'translateX(4px)';
      }
    },
    onMouseLeave: (e) => {
      if (!active) {
        e.target.style.background = 'transparent';
        e.target.style.transform = 'translateX(0)';
      }
    }
  });

  return (
    <>
      {/* === Sidebar moderno (solo >= md) === */}
      <div className="sidebar-container d-none d-md-flex">
        <nav
          id="sidebar"
          className={`sidebar menu d-flex flex-column ${menuall ? "w-72" : "w-240"}`}
          style={{
            background: "var(--color-bg-card)",
            borderRight: "1px solid var(--color-border)",
            backdropFilter: "blur(10px)",
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.08)",
            padding: "1rem"
          }}
        >
          <ul className="nav flex-column" style={{ gap: '4px' }}>
            {rol === "admin" && (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/admin/dashboard" 
                    title="Dashboard"
                    style={getNavLinkStyle(isActive(["/admin/dashboard", `/admin/restaurante/${id || ""}`]))}
                    {...getNavLinkHoverProps(isActive(["/admin/dashboard", `/admin/restaurante/${id || ""}`]))}
                  >
                    <i className="bi bi-house me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Dashboard</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/admin/restaurantes/expense" 
                    title="Restaurantes"
                    style={getNavLinkStyle(isActive(["/admin/restaurantes/expense", "/admin/restaurantes/restaurant"]))}
                    {...getNavLinkHoverProps(isActive(["/admin/restaurantes/expense", "/admin/restaurantes/restaurant"]))}
                  >
                    <i className="bi bi-shop me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Restaurantes</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/admin/ventas" 
                    title="Ventas"
                    style={getNavLinkStyle(isActive(["/admin/ventas"]))}
                    {...getNavLinkHoverProps(isActive(["/admin/ventas"]))}
                  >
                    <i className="bi bi-bar-chart me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Ventas</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/admin/gastos" 
                    title="Gastos"
                    style={getNavLinkStyle(isActive(["/admin/gastos"]))}
                    {...getNavLinkHoverProps(isActive(["/admin/gastos"]))}
                  >
                    <i className="bi bi-cash-coin me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Gastos</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/admin/usuarios" 
                    title="Usuarios"
                    style={getNavLinkStyle(isActive(["/admin/usuarios"]))}
                    {...getNavLinkHoverProps(isActive(["/admin/usuarios"]))}
                  >
                    <i className="bi bi-people me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Usuarios</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/admin/settings" 
                    title="Configuración"
                    style={getNavLinkStyle(isActive(["/admin/settings"]))}
                    {...getNavLinkHoverProps(isActive(["/admin/settings"]))}
                  >
                    <i className="bi bi-gear me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Configuración</span>}
                  </Link>
                </li>
              </>
            )}

            {rol === "encargado" && (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/encargado/dashboard" 
                    title="Dashboard"
                    style={getNavLinkStyle(isActive(["/encargado/dashboard"]))}
                    {...getNavLinkHoverProps(isActive(["/encargado/dashboard"]))}
                  >
                    <i className="bi bi-house me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Dashboard</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/encargado/ventas" 
                    title="Ventas"
                    style={getNavLinkStyle(isActive(["/encargado/ventas", "/encargado/registrar-venta"]))}
                    {...getNavLinkHoverProps(isActive(["/encargado/ventas", "/encargado/registrar-venta"]))}
                  >
                    <i className="bi bi-bar-chart me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Ventas</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/encargado/gastos" 
                    title="Gastos"
                    style={getNavLinkStyle(isActive(["/encargado/gastos", "/encargado/gastos/registrar"]))}
                    {...getNavLinkHoverProps(isActive(["/encargado/gastos", "/encargado/gastos/registrar"]))}
                  >
                    <i className="bi bi-cash-stack me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Gastos</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/encargado/proveedores" 
                    title="Proveedores"
                    style={getNavLinkStyle(isActive(["/encargado/proveedores"]))}
                    {...getNavLinkHoverProps(isActive(["/encargado/proveedores"]))}
                  >
                    <i className="bi bi-truck me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Proveedores</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/encargado/settings" 
                    title="Configuración"
                    style={getNavLinkStyle(isActive(["/encargado/settings"]))}
                    {...getNavLinkHoverProps(isActive(["/encargado/settings"]))}
                  >
                    <i className="bi bi-gear me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Configuración</span>}
                  </Link>
                </li>
              </>
            )}

            {rol === "chef" && (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/chef/dashboard" 
                    title="Dashboard"
                    style={getNavLinkStyle(isActive(["/chef/dashboard"]))}
                    {...getNavLinkHoverProps(isActive(["/chef/dashboard"]))}
                  >
                    <i className="bi bi-house me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Dashboard</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/chef/proveedores" 
                    title="Proveedores"
                    style={getNavLinkStyle(isActive(["/chef/proveedores"]))}
                    {...getNavLinkHoverProps(isActive(["/chef/proveedores"]))}
                  >
                    <i className="bi bi-truck me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Proveedores</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/chef/gastos" 
                    title="Gastos"
                    style={getNavLinkStyle(isActive(["/chef/gastos", "/chef/gastos/registrar"]))}
                    {...getNavLinkHoverProps(isActive(["/chef/gastos", "/chef/gastos/registrar"]))}
                  >
                    <i className="bi bi-receipt me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Gastos</span>}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link 
                    className="nav-link d-flex align-items-center" 
                    to="/chef/settings" 
                    title="Configuración"
                    style={getNavLinkStyle(isActive(["/chef/settings"]))}
                    {...getNavLinkHoverProps(isActive(["/chef/settings"]))}
                  >
                    <i className="bi bi-gear me-2" style={{ fontSize: '1.1rem' }}></i>
                    {!menuall && <span className="fw-medium">Configuración</span>}
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="logout mt-auto">
            <button
              className="nav-link d-flex align-items-center bg-transparent border-0 w-100"
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                ...getNavLinkStyle(false),
                color: 'var(--color-text-muted)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--color-bg-subtle)';
                e.target.style.transform = 'translateX(4px)';
                e.target.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateX(0)';
                e.target.style.color = 'var(--color-text-muted)';
              }}
            >
              <i className="bi bi-box-arrow-left me-2" style={{ fontSize: '1.1rem' }}></i>
              {!menuall && <span className="fw-medium">Cerrar sesión</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* === Bottom Nav moderno (solo móvil) === */}
      <nav 
        className="bottom-nav d-md-none" 
        style={{
          background: "var(--color-bg-card)",
          borderTop: "1px solid var(--color-border)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.08)"
        }}
      >
        <ul className="d-flex justify-content-around m-0 p-0 list-unstyled">
          {rol === "admin" && (
            <>
              <li>
                <Link to="/admin/dashboard" className={`bn-item ${isActive(["/admin/dashboard"])}`}>
                  <i className="bi bi-house"></i><span>Home</span>
                </Link>
              </li>
              {/* 🔹 Restaurantes (faltaba) */}
              <li>
                <Link to="/admin/restaurantes/expense" className={`bn-item ${isActive(["/admin/restaurantes/expense", "/admin/restaurantes/restaurant"])}`}>
                  <i className="bi bi-shop"></i><span>Rest.</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/ventas" className={`bn-item ${isActive(["/admin/ventas"])}`}>
                  <i className="bi bi-bar-chart"></i><span>Ventas</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/gastos" className={`bn-item ${isActive(["/admin/gastos"])}`}>
                  <i className="bi bi-cash-coin"></i><span>Gastos</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className={`bn-item ${isActive(["/admin/settings"])}`}>
                  <i className="bi bi-gear"></i><span>Ajustes</span>
                </Link>
              </li>
            </>
          )}

          {rol === "encargado" && (
            <>
              <li>
                <Link to="/encargado/dashboard" className={`bn-item ${isActive(["/encargado/dashboard"])}`}>
                  <i className="bi bi-house"></i><span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/encargado/ventas" className={`bn-item ${isActive(["/encargado/ventas"])}`}>
                  <i className="bi bi-bar-chart"></i><span>Ventas</span>
                </Link>
              </li>
              <li>
                <Link to="/encargado/gastos" className={`bn-item ${isActive(["/encargado/gastos"])}`}>
                  <i className="bi bi-cash-stack"></i><span>Gastos</span>
                </Link>
              </li>
              {/* 🔹 Proveedores (faltaba) */}
              <li>
                <Link to="/encargado/proveedores" className={`bn-item ${isActive(["/encargado/proveedores"])}`}>
                  <i className="bi bi-truck"></i><span>Prov.</span>
                </Link>
              </li>
              <li>
                <Link to="/encargado/settings" className={`bn-item ${isActive(["/encargado/settings"])}`}>
                  <i className="bi bi-gear"></i><span>Ajustes</span>
                </Link>
              </li>
            </>
          )}

          {rol === "chef" && (
            <>
              <li>
                <Link to="/chef/dashboard" className={`bn-item ${isActive(["/chef/dashboard"])}`}>
                  <i className="bi bi-house"></i><span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/chef/gastos" className={`bn-item ${isActive(["/chef/gastos"])}`}>
                  <i className="bi bi-receipt"></i><span>Gastos</span>
                </Link>
              </li>
              <li>
                <Link to="/chef/proveedores" className={`bn-item ${isActive(["/chef/proveedores"])}`}>
                  <i className="bi bi-truck"></i><span>Prov.</span>
                </Link>
              </li>
              <li>
                <Link to="/chef/settings" className={`bn-item ${isActive(["/chef/settings"])}`}>
                  <i className="bi bi-gear"></i><span>Ajustes</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
};
