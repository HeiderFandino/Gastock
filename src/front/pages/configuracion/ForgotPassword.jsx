import React, { useState } from "react";
import logo from "../../assets/img/logo.svg";

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
    <div className="text-center px-4">
      <img src={logo} alt="Chef Logo" className="img-fluid mb-2 mx-auto" style={{ height: "100px" }} />
      <h2 className="login-title text-black text-center mt-4 mb-3">Recuperar contraseña</h2>
      {message && <div className="alert alert-info text-start">{message}</div>}
      {!emailSent && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="Introduce tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn bg-orange text-white w-100">Enviar</button>
        </form>
      )}
    </div>
  );
};
export default ForgotPassword;





























































































