import React from "react";

import { useNavigate } from "react-router-dom";
export const FooterLanding = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer-landing contacto text-center py-3 bg-light border-top">
      <p className="mb-0 text-secondary small">
        <span
          onClick={() => navigate("/sobrenosotros")}
          className="text-decoration-underline text-secondary mx-2 link-underline-opacity-75-hover"
          role="button"
        >
          Sobre nosotros
        </span>
        |
        <span
          onClick={() => navigate("/contactoempresa")}
          className="text-decoration-underline text-secondary mx-2 link-underline-opacity-75-hover"
          role="button"
        >
          Contacto
        </span>
      </p>
    </footer>
  );
};

