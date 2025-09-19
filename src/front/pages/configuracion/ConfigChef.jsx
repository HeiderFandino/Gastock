import React, { useEffect } from "react";
import Configuracion from "../configuracion/Configuracion";

const ConfigChef = () => {
  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="d-flex flex-wrap">
        <Configuracion />
      </div>
    </div>
  );
};
export default ConfigChef;