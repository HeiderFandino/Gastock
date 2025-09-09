// src/front/components/RutaPrivada.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import userServices from "../services/userServices";
import { LoadingScreen } from "./LoadingScreen";

// ACL compartida (misma que usamos en Login.jsx)
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
  if (!match) return true;
  return match.roles.includes(rol);
}

export const RutaPrivada = () => {
  const { store, dispatch } = useGlobalReducer();
  const [cargando, setCargando] = useState(true);
  const token = sessionStorage.getItem("token");
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    let cancel = false;

    const hydrateFromStorage = () => {
      try {
        const raw = sessionStorage.getItem("user");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.id && parsed?.rol) {
          dispatch({ type: "get_user_info", payload: parsed });
          return parsed;
        }
      } catch {
        /* ignore */
      }
      return null;
    };

    const boot = async () => {
      if (!token) {
        // Sin token, asegúrate de no arrastrar rutas privadas previas
        sessionStorage.removeItem("lastPrivatePath");
        setCargando(false);
        return;
      }

      // 1) Hidrata rápido desde sessionStorage
      const cached = hydrateFromStorage();
      if (cached) {
        setCargando(false);
        // Refresco silencioso
        userServices
          .getUserinfo()
          .then((u) => {
            if (!cancel && u) {
              sessionStorage.setItem("user", JSON.stringify(u));
              dispatch({ type: "get_user_info", payload: u });
            }
          })
          .catch(() => {
            // 401 → handleUnauthorized en services limpiará y redirigirá
          });
        return;
      }

      // 2) Sin cache local: pedir al backend
      try {
        const u = await userServices.getUserinfo();
        if (!cancel && u) {
          sessionStorage.setItem("user", JSON.stringify(u));
          dispatch({ type: "get_user_info", payload: u });
        }
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } finally {
        if (!cancel) setCargando(false);
      }
    };

    boot();
    return () => {
      cancel = true;
    };
  }, [token, path, dispatch]);

  // Guardar última ruta privada válida (solo si el rol actual tiene permiso)
  useEffect(() => {
    if (!token || !store.user) return;
    if (isAllowed(path, store.user.rol)) {
      sessionStorage.setItem("lastPrivatePath", path);
    }
  }, [token, path, store.user]);

  if (cargando) return <LoadingScreen />;

  if (!token || !store.user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Chequeo de ACL por rol
  if (!isAllowed(path, store.user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RutaPrivada;
