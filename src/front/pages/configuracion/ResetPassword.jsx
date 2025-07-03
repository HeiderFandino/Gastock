import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import forgotBg from "../../assets/img/forgot_bg.png";
import logo from "../../assets/img/logo.svg";
import { FooterLanding } from "../../components/FooterLanding.jsx";
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false); // Nuevo estado
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, new_password: newPassword })
      });
      const data = await resp.json();
      setMessage(data.msg);
      if (resp.ok) setSuccess(true); // Mostrar botón para volver
    } catch (error) {
      console.error(error);
      setMessage("Error al cambiar la contraseña.");
    }
  };
  return (
    <div className="container-fluid landing-container" style={{ backgroundImage: `url(${forgotBg})` }}>
      <div className="row align-items-center main-row mx-auto">
        <div className="col-lg-6 col-12 text-center text-lg-start landing-message">
          <h1>Restablece tu contraseña</h1>
          <p className="fw-semibold text-dark">Introduce tu nueva contraseña segura para volver a tu cocina digital.</p>
        </div>
        <div className="col-10 col-sm-8 col-md-8 col-lg-6 col-xl-5 col-xxl-3 mx-auto auth-overlay">
          <img src={logo} alt="Logo" className="img-fluid mb-3" style={{ height: "100px" }} />
          <h2 className="login-title text-black text-center mt-3 mb-3">Nueva contraseña</h2>
          {message && <div className="alert alert-info text-start">{message}</div>}
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-start">
                <label className="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 text-start">
                <label className="form-label">Confirmar contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirma la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn bg-orange text-white w-100">
                Cambiar contraseña
              </button>
            </form>
          )}
          {success && (
            <button
              className="btn bg-orange text-white mt-3 w-100"
              onClick={() => navigate("/")}
            >
              Volver al login
            </button>
          )}
        </div>
      </div>
      <FooterLanding />
    </div>
  );
};
export default ResetPassword;





















