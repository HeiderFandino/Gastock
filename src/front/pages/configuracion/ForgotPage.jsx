import React from "react";
import forgotBg from "../../assets/img/fondo-pantalla.png";
import ForgotPassword from "./ForgotPassword.jsx";

const ForgotPage = () => {
  return (
    <div className="auth-split">
      {/* PANEL IZQUIERDO */}
      <section className="auth-left">
        <div className="auth-left-inner text-center">
          <ForgotPassword />
        </div>
      </section>

      {/* PANEL DERECHO */}
      <section
        className="auth-right"
        style={{ backgroundImage: `url(${forgotBg})` }}
      >
        <div className="auth-right-inner">
          <h1 className="hero-title">
            Recupera el acceso<br />
            a tu cocina digital
          </h1>
          <p className="hero-subtitle">
            Vuelve a tomar el control de tu gestión culinaria en segundos.
          </p>
        </div>
      </section>
    </div>
  );
};
export default ForgotPage;






