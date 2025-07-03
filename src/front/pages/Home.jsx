import React from "react";
import "../styles/landing_styles.css";
import { Login } from "../components/Login.jsx";
import { FooterLanding } from "../components/FooterLanding.jsx";
import bgforgot from "../assets/img/forgot_bg.png";

export const Home = () => {
  return (
    <>
      <div
        className="container-fluid landing-container"
        style={{ backgroundImage: `url(${bgforgot})` }}
      >
        <div className="row align-items-center main-row mx-auto">
          <div className="col-lg-6 col-12 text-center text-lg-start landing-message">
            <h1>Gestiona tus gastos</h1>
            <p className="fw-semibold text-dark">Inicia sesión para llevar un control de tu inversión culinaria.</p>
          </div>

          <div className="d-flex justify-content-center col-12 col-sm-12 col-md-9 col-lg-6 col-xl-5 col-xxl-4 mx-auto login-overlay ">
            <Login />
          </div>
        </div>
        <FooterLanding />
      </div>
    </>
  );
};




