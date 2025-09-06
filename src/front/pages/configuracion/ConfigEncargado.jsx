import React, { useEffect } from "react";
import { DatosPersonales } from "./Datos/DatosPersonales.jsx";
import { CambiarContrasena } from "./Datos/CambiarContrasena.jsx";
import { MonedaPrincipal } from "./Datos/MonedaPrincipal.jsx";
import Configuracion from "../configuracion/Configuracion";

const ConfigEncargado = () => {

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  return (
    <div className="dashboard-container ">

      <div className="d-flex flex-wrap">
        <Configuracion />

      </div>
    </div>
  );
};
export default ConfigEncargado;