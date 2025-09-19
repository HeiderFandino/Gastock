import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/img/gastock2_tmp.png";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setEmailSent(true);
        setMessage("Correo enviado con éxito. Revisa tu bandeja de entrada.");
      } else {
        setMessage(data.msg || "No se pudo enviar el correo.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error al enviar el correo.");
    }
  };
  return (
    <div className="auth-panel">
      <img src={logo} alt="Gastock" className="auth-logo mb-4" />
      <h2 className="auth-title">Recuperar contraseña</h2>

      {message && <div className="login-error">{message}</div>}

      {!emailSent && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Introduce tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Enviar</button>

          <Link
            to="/"
            className="btn-primary mt-2"
            style={{
              textDecoration: "none",
              display: "inline-block",
              textAlign: "center"
            }}
          >
            Volver al inicio
          </Link>
        </form>
      )}

      {emailSent && (
        <div className="text-center mt-3">
          <p className="text-muted mb-3">Revisa tu bandeja de entrada</p>
          <Link
            to="/"
            className="btn-primary"
            style={{
              textDecoration: "none",
              display: "inline-block",
              textAlign: "center"
            }}
          >
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
};
export default ForgotPassword;





























































































