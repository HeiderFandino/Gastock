import React from "react";
import "../../styles/landing_styles.css";
import forgotBg from "../../assets/img/forgot_bg.png";
import ForgotPassword from "./ForgotPassword.jsx";
import { FooterLanding } from "../../components/FooterLanding.jsx";

const ForgotPage = () => {
  return (
    <div
      className="container-fluid landing-container"
      style={{ backgroundImage: `url(${forgotBg})` }}
    >
      <div className="row align-items-center main-row mx-auto">
        <div className="col-lg-6 col-12 text-center text-lg-start landing-message">
          <h1>Recupera el acceso a tu cocina digital</h1>
          <p className="fw-semibold text-dark">Vuelve a tomar el control de tu gestión culinaria en segundos.</p>
        </div>
        <div className="col-10 col-sm-8 col-md-8 col-lg-6 col-xl-5 col-xxl-3 mx-auto auth-overlay">
          <ForgotPassword />
        </div>
      </div>
      <FooterLanding />
    </div>
  );
};
export default ForgotPage;






