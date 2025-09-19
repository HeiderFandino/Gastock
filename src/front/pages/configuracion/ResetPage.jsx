import React from "react";
import resetBg from "../../assets/img/fondo-pantalla.png";
import ResetPassword from "./ResetPassword.jsx";

const ResetPage = () => {
  return (
    <div className="auth-split">
      {/* PANEL IZQUIERDO */}
      <section className="auth-left">
        <div className="auth-left-inner text-center" style={{
          maxWidth: "400px",
          margin: "0 auto",
          padding: "2rem 1rem"
        }}>
          <ResetPassword />
        </div>
      </section>

      {/* PANEL DERECHO */}
      <section
        className="auth-right"
        style={{ backgroundImage: `url(${resetBg})` }}
      >
        <div className="auth-right-inner">
          <h1 className="hero-title">
            Crea tu nueva<br />
            contraseña
          </h1>
          <p className="hero-subtitle">
            Protege tu cuenta con una contraseña segura.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ResetPage;