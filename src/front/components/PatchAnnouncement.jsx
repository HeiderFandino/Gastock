import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

// ========================================
// 🔧 CONFIGURACIÓN DE VERSIÓN
// ========================================
// Para crear un nuevo anuncio:
// 1. Cambia CURRENT_VERSION por la nueva versión
// 2. Actualiza PATCH_NOTES con las mejoras
// 3. ¡Listo! Tus clientes verán el nuevo anuncio una vez
// ========================================

const CURRENT_VERSION = "v16";
const PATCH_NOTES = [
    "Desplazamiento lateral en los la vista mensual de gasto MEJORADO",
    "al momento de iniciar sesion ya no es sensible a las MAYUSCULAS",
    "Corrección de errores menores",
];

export const PatchAnnouncement = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasViewed = localStorage.getItem(`patchViewed_${CURRENT_VERSION}`);
        if (!hasViewed) {
            setShow(true);
        }
    }, []);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem(`patchViewed_${CURRENT_VERSION}`, "true");
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header
                closeButton
                style={{
                    background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)",
                    color: "white",
                    border: "none"
                }}
            >
                <Modal.Title style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                    <i className="bi bi-stars me-2" />
                    Gastock actualizado
                    <span
                        className="ms-2 badge"
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            fontSize: "0.7rem"
                        }}
                    >
                        {CURRENT_VERSION}
                    </span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body
                style={{
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    padding: "1.25rem"
                }}
            >
                <div className="mb-3">
                    <h6 className="text-primary mb-3" style={{ fontWeight: "600" }}>
                        🚀 Nuevas mejoras disponibles:
                    </h6>

                    <ul className="list-unstyled mb-0">
                        {PATCH_NOTES.map((note, index) => (
                            <li key={index} className="mb-2 d-flex align-items-start">
                                <i className="bi bi-check-circle-fill text-success me-2 mt-1" />
                                <span style={{ fontSize: "0.9rem" }}>{note}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    className="text-center p-2 rounded"
                    style={{ background: "rgba(74, 144, 226, 0.1)" }}
                >
                    <small className="text-muted">
                        ¿Problemas? Visita{" "}
                        <a
                            href="https://www.gastock.es"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#4a90e2", fontWeight: "600" }}
                        >
                            www.gastock.es
                        </a>
                    </small>
                </div>
            </Modal.Body>

            <Modal.Footer
                style={{
                    background: "#f8f9fa",
                    border: "none",
                    justifyContent: "center",
                    padding: "1rem"
                }}
            >
                <Button
                    onClick={handleClose}
                    style={{
                        background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)",
                        border: "none",
                        padding: "0.6rem 2rem",
                        borderRadius: "25px",
                        fontWeight: "600",
                        boxShadow: "0 3px 10px rgba(74, 144, 226, 0.3)"
                    }}
                >
                    ¡Perfecto!
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
