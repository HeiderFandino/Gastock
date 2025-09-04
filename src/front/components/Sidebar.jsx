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
    dispatch({ type: "get_user_info", payload: null });
    navigate("/");
  };

  // helpers de activo
  const isActive = (paths = []) => {
    return paths.some((p) =>
      p.includes(":")
        ? // soporte para rutas con params (ej: /admin/restaurante/:id)
        location.pathname.startsWith(p.replace(":id", id || ""))
        : location.pathname === p
    )
      ? "color-orange-bold"
      : "";
  };

  return (
    <>
      {/* === Sidebar (solo >= md) === */}
      <div className="sidebar-container d-none d-md-flex">
        <nav
          id="sidebar"
          className={`sidebar menu d-flex flex-column p-3 ${menuall ? "w-72" : "w-240"
            }`}
        >
          {/* Header + botón colapsar */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {!menuall && (
              <span className="fs-5 fw-bold">Menú</span>
            )}
            <button
              className="btn btn-light btn-sm"
              type="button"
              onClick={toggleRail}
              aria-label={menuall ? "Expandir menú" : "Colapsar menú"}
              title={menuall ? "Expandir menú" : "Colapsar menú"}
            >
              <i className={`bi ${menuall ? "bi-chevron-double-right" : "bi-chevron-double-left"}`}></i>
            </button>
          </div>

          <ul className="nav nav-pills flex-column gap-1">
            {rol === "admin" && (
              <>
                <li className={`nav-item ${isActive(["/admin/dashboard", `/admin/restaurante/${id || ""}`])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/admin/dashboard" title="Dashboard">
                    <i className="bi bi-house me-2"></i>
                    {!menuall && <span>Dashboard</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/admin/restaurantes/expense", "/admin/restaurantes/restaurant"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/admin/restaurantes/expense" title="Restaurantes">
                    <i className="bi bi-shop me-2"></i>
                    {!menuall && <span>Restaurantes</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/admin/ventas"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/admin/ventas" title="Ventas">
                    <i className="bi bi-bar-chart me-2"></i>
                    {!menuall && <span>Ventas</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/admin/gastos"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/admin/gastos" title="Gastos">
                    <i className="bi bi-cash-coin me-2"></i>
                    {!menuall && <span>Gastos</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/admin/usuarios"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/admin/usuarios" title="Usuarios">
                    <i className="bi bi-people me-2"></i>
                    {!menuall && <span>Usuarios</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/admin/settings"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/admin/settings" title="Configuración">
                    <i className="bi bi-gear me-2"></i>
                    {!menuall && <span>Configuración</span>}
                  </Link>
                </li>
              </>
            )}

            {rol === "encargado" && (
              <>
                <li className={`nav-item ${isActive(["/encargado/dashboard"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/encargado/dashboard" title="Dashboard">
                    <i className="bi bi-house me-2"></i>
                    {!menuall && <span>Dashboard</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/encargado/ventas", "/encargado/registrar-venta"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/encargado/ventas" title="Ventas">
                    <i className="bi bi-bar-chart me-2"></i>
                    {!menuall && <span>Ventas</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/encargado/gastos", "/encargado/gastos/registrar"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/encargado/gastos" title="Gastos">
                    <i className="bi bi-cash-stack me-2"></i>
                    {!menuall && <span>Gastos</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/encargado/proveedores"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/encargado/proveedores" title="Proveedores">
                    <i className="bi bi-truck me-2"></i>
                    {!menuall && <span>Proveedores</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/encargado/settings"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/encargado/settings" title="Configuración">
                    <i className="bi bi-gear me-2"></i>
                    {!menuall && <span>Configuración</span>}
                  </Link>
                </li>
              </>
            )}

            {rol === "chef" && (
              <>
                <li className={`nav-item ${isActive(["/chef/dashboard"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/chef/dashboard" title="Dashboard">
                    <i className="bi bi-house me-2"></i>
                    {!menuall && <span>Dashboard</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/chef/proveedores"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/chef/proveedores" title="Proveedores">
                    <i className="bi bi-truck me-2"></i>
                    {!menuall && <span>Proveedores</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/chef/gastos", "/chef/gastos/registrar"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/chef/gastos" title="Gastos">
                    <i className="bi bi-receipt me-2"></i>
                    {!menuall && <span>Gastos</span>}
                  </Link>
                </li>

                <li className={`nav-item ${isActive(["/chef/settings"])}`}>
                  <Link className="nav-link d-flex align-items-center" to="/chef/settings" title="Configuración">
                    <i className="bi bi-gear me-2"></i>
                    {!menuall && <span>Configuración</span>}
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="logout mt-auto">
            <button
              className={`nav-link text-muted d-flex align-items-center bg-transparent border-0 ${menuall ? "logout-column" : "logout-row"
                }`}
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <i className="bi bi-box-arrow-left me-2"></i>
              {!menuall && <span>Cerrar sesión</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* === Bottom Nav (solo móvil) === */}
      <nav className="bottom-nav d-md-none">
        <ul className="d-flex justify-content-around m-0 p-0 list-unstyled">
          {rol === "admin" && (
            <>
              <li>
                <Link to="/admin/dashboard" className={`bn-item ${isActive(["/admin/dashboard"])}`}>
                  <i className="bi bi-house"></i><span>Home</span>
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
