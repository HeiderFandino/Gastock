import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/img/gastock2_tmp.png";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage("Token inválido o expirado");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await resp.json();

      if (resp.ok && data.success) {
        setSuccess(true);
        setMessage("¡Contraseña actualizada con éxito!");
      } else {
        setMessage(data.msg || "Error al actualizar la contraseña");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel" style={{ padding: "1.5rem" }}>
      <img src={logo} alt="Gastock" className="auth-logo mb-3" style={{ height: "60px" }} />

      {!success && (
        <h2 className="auth-title" style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>Nueva contraseña</h2>
      )}

      {message && (
        <div className={`login-error ${success ? 'success' : ''}`}>
          {message}
        </div>
      )}

      {!success && token && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Nueva contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Introduce tu nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Confirma tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>

          <Link to="/" className="btn-ghost mt-2">
            Volver al inicio
          </Link>
        </form>
      )}

      {success && (
        <div className="text-center mt-3">
          <div className="success-message mb-3" style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}>
            ✅ ¡Contraseña actualizada con éxito!
          </div>
          <p className="text-muted mb-3">
            Ya puedes iniciar sesión con tu nueva contraseña
          </p>
          <Link to="/" className="btn-primary btn-block">
            Volver al inicio
          </Link>
        </div>
      )}

      {!token && !success && (
        <div className="text-center mt-3">
          <Link to="/" className="btn-ghost">
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
