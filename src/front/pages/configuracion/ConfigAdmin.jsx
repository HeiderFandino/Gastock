import React, { useEffect } from "react";
import { DatosPersonales } from "./Datos/DatosPersonales.jsx";
import { CambiarContrasena } from "./Datos/CambiarContrasena.jsx";
import { MonedaPrincipal } from "./Datos/MonedaPrincipal.jsx";


export const ConfigAdmin = () => {
  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);
  return (
    <div className="dashboard-container ">
      <h1 className="dashboard-title">Configuración del Administrador</h1>
      <p className="dashboard-welcome mb-4">Configura tu usuario</p>
      <div className="d-flex flex-wrap">
        <DatosPersonales />

        <CambiarContrasena />

        <MonedaPrincipal />
      </div>
    </div >
  );
};
