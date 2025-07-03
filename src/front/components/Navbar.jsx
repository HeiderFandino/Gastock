import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store } = useGlobalReducer();
  const user = store.user;

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-2">
      <div className="container-fluid align-items-center mx-4">
        <a className="navbar-brand" href="#">
          <img
            src="/docs/assets/ohmychef 312.png"
            alt="OhMyChef Logo"
            width="200"
            height="55"
          />
        </a>

        <ul className="navbar-nav ms-auto d-flex align-items-center ps-md-4 gap-3">
          <li className="nav-item d-flex align-items-center gap-2">
            <div className="text-end">
              <div class="ueref">
                <p className="mb-0 name color-orange">{user.nombre}</p>
                <p className="mb-0 fs-5 small text-capitalize fw-bold">{user.rol}</p>
              </div>
              {user.rol !== "admin" && (
                <p className="mb-0 restaurant text-secondary small">
                  {user.restaurante_nombre || "Sin restaurante asignado"}
                </p>
              )}
            </div>
            <i className="bi bi-person-circle fs-1"></i>
          </li>
        </ul>
      </div>
    </nav>
  );
};
