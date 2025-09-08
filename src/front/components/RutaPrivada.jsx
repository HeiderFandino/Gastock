// src/front/components/RutaPrivada.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import userServices from "../services/userServices";
import { LoadingScreen } from "./LoadingScreen";

export const RutaPrivada = () => {
  const { store, dispatch } = useGlobalReducer();
  const [cargando, setCargando] = useState(true);
  const token = sessionStorage.getItem("token");
  const location = useLocation();
  const path = location.pathname;

  // Prefijos protegidos -> roles permitidos (match más largo primero)
  const ACL = [
    { prefix: "/chef/gastos", roles: ["chef"] },
    { prefix: "/admin", roles: ["admin"] },
    { prefix: "/encargado", roles: ["encargado"] },
    { prefix: "/chef", roles: ["chef"] },
    { prefix: "/ventas", roles: ["encargado"] },
  ];

  const match =
    ACL.filter((r) => path.startsWith(r.prefix)).sort(
      (a, b) => b.prefix.length - a.prefix.length
    )[0] || null;

  const rolesPermitidos = match ? match.roles : null;

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
        setCargando(false);
        return;
      }

      // 1) Hidrata rápido desde sessionStorage para evitar parpadeos/redirecciones
      const cached = hydrateFromStorage();
      if (cached) {
        setCargando(false);
        // Refresco silencioso para validar token/usuario actual
        userServices
          .getUserinfo()
          .then((u) => {
            if (!cancel && u) {
              sessionStorage.setItem("user", JSON.stringify(u));
              dispatch({ type: "get_user_info", payload: u });
            }
          })
          .catch(() => {
            // Si falla, handleUnauthorized en services hace la limpieza/redirección
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
        // handleUnauthorized ya responde: limpiará y enviará a "/"
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

  // Guardar última ruta privada válida (para volver tras login/refresh)
  useEffect(() => {
    if (token) sessionStorage.setItem("lastPrivatePath", path);
  }, [token, path]);

  if (cargando) return <LoadingScreen />;

  // Si no hay token o no está el user en store, manda a Home (tu login está en "/")
  if (!token || !store.user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Chequeo de ACL por rol
  if (rolesPermitidos && !rolesPermitidos.includes(store.user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RutaPrivada;
