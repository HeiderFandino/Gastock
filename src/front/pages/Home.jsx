import React from "react";
import { Login } from "../components/Login.jsx";
import gastockfondo from "../assets/img/fondo-pantalla.png";
import logo from "../assets/img/gastock2.png";

import "../styles/login.css";

export const Home = () => {
  return (
    <div className="auth-split">

      {/* PANEL IZQUIERDO */}
      <section className="auth-left">
        <div className="auth-left-inner text-center">
          {/* Logo arriba */}
          <img src={logo} alt="Gastock" className="auth-logo" />

          {/* Formulario de login */}
          <Login />
        </div>
      </section>

      {/* PANEL DERECHO */}
      <section
        className="auth-right"
        style={{ backgroundImage: `url(${gastockfondo})` }}
      >
        <div className="auth-right-inner">
          <h1 className="hero-title">
            Gestiona<br />
            tus gastos
          </h1>
          <p className="hero-subtitle">
            Inicia sesión para llevar un control de tu inversión culinaria.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
