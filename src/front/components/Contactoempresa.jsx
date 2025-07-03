// src/pages/Contacto.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import bgforgot from "../assets/img/forgot_bg.png"

export const Contactoempresa = () => {
    const navigate = useNavigate();

    return (
        <div
            className="container-fluid landing-container py-5"
            style={{
                backgroundImage: `url(${bgforgot})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="card mx-auto p-4 shadow bg-white rounded-4" style={{ maxWidth: "600px" }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline-secondary mb-3"
                >
                    ← Volver
                </button>
                <h2 className="text-primary fw-bold mb-4">Contáctanos</h2>
                <p className="mb-3">
                    ¿Tienes dudas o necesitas más información? Nuestro equipo está listo para ayudarte:
                </p>

                <ul className="list-unstyled mb-4">
                    <li className="mb-2">
                        <strong>📍 Dirección:</strong> Calle Falsa, 123, 28080 Madrid
                    </li>
                    <li className="mb-2">
                        <strong>📞 Teléfono:</strong>{" "}
                        <a href="tel:+34123456789" className="text-decoration-none">
                            +34 912 345 678
                        </a>
                    </li>
                    <li className="mb-2">
                        <strong>✉️ Email:</strong>{" "}
                        <a href="mailto:info@gastrosol.com" className="text-decoration-none">
                            info@gastrosol.com
                        </a>
                    </li>
                    <li>
                        <strong>🌐 Web:</strong>{" "}
                        <a href="https://www.gastrosol.com" target="_blank" rel="noopener" className="text-decoration-none">
                            www.gastrosol.com
                        </a>
                    </li>
                </ul>

                <div className="ratio ratio-16x9">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18…"
                        title="Ubicación GastroSoft"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};
