import React from "react";

import brandLogo from "../assets/img/gastock2_tmp.png";

export const LoadingScreen = () => {
  return (
    <div className="loading-screen d-flex flex-column justify-content-center align-items-center">
      <img
        src={brandLogo}
        alt="Gastock"
        className="loading-logo"
        width={320}   // ⬅️ Aumentado (antes 160)
        height="auto"
      />
      <p className="mt-4 mb-0 loading-text">Organizando tus números en segundos…</p>
      <div className="mt-3 brand-spinner" aria-label="Cargando" />
    </div>
  );
};

export default LoadingScreen; 