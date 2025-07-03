import React, { useEffect } from "react";
import { DatosPersonales } from "./Datos/DatosPersonales.jsx";
import { CambiarContrasena } from "./Datos/CambiarContrasena.jsx";
import { MonedaPrincipal } from "./Datos/MonedaPrincipal.jsx";

const ConfigEncargado = () => {

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  return (
    <div className="dashboard-container ">
      <h1 className="dashboard-title mb-4">Configuración del Encargado</h1>
      <div className="d-flex flex-wrap">
        <DatosPersonales />
        <CambiarContrasena />
        <MonedaPrincipal />
      </div>
    </div>
  );
};
export default ConfigEncargado;