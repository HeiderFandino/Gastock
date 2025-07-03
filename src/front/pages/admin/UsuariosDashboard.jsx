
import React, { useEffect } from "react";
import Usuarios from "../../components/usuarios/Usuarios.jsx"


export const UsuariosDashboard = () => {
  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);
  return (

    <Usuarios />

  );
};
