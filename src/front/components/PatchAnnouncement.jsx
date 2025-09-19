import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const PatchAnnouncement = () => {
    const STORAGE_KEY = "patchViewed_v13"; // sube versión para que todos lo vean una vez
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasViewed = localStorage.getItem(STORAGE_KEY);
        if (!hasViewed) setShow(true);
    }, []);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header
                closeButton
                style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                }}
            >
                <Modal.Title
                    className="d-flex align-items-center gap-2 w-100"
                    style={{ fontSize: "1.3rem", fontWeight: "700" }}
                >
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-tools" style={{ fontSize: "1.5rem" }} />
                        <span>Estamos reestructurando la página</span>
                    </div>
                    <div
                        className="ms-auto badge"
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            fontSize: "0.7rem",
                            fontWeight: "500",
                        }}
                    >
                        Aviso temporal
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body
                style={{
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    padding: "1.5rem",
                }}
            >
                <div className="text-center mb-3">
                    <h5
                        className="mb-2"
                        style={{ color: "#4c5a7a", fontWeight: "600", fontSize: "1rem" }}
                    >
                        🔧 Mejoras en curso para darte una experiencia más rápida y clara.
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                        Si en algún momento esta página deja de cargar, ve a{" "}
                        <a
                            href="https://www.gastock.es"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontWeight: 600 }}
                        >
                            www.gastock.es
                        </a>
                    </p>
                </div>

                <div className="row g-3">
                    <div className="col-12">
                        <div
                            className="p-3 rounded-3 border-0"
                            style={{
                                background: "rgba(255,255,255,0.8)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            <div className="d-flex align-items-start gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                                        color: "white",
                                        fontSize: "1.1rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    <i className="bi bi-arrow-repeat" />
                                </div>
                                <div>
                                    <h6 className="mb-1" style={{ color: "#4c5a7a", fontWeight: "600" }}>
                                        Cambios en marcha
                                    </h6>
                                    <p className="mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
                                        Estamos reestructurando la web. Puede haber cortes puntuales o
                                        comportamientos raros durante unas horas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div
                            className="p-3 rounded-3 border-0"
                            style={{
                                background: "rgba(255,255,255,0.8)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            <div className="d-flex align-items-start gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                                        color: "white",
                                        fontSize: "1.1rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    <i className="bi bi-link-45deg" />
                                </div>
                                <div>
                                    <h6 className="mb-1" style={{ color: "#4c5a7a", fontWeight: "600" }}>
                                        Entra por nuestra URL oficial
                                    </h6>
                                    <p className="mb-1 text-muted" style={{ fontSize: "0.9rem" }}>
                                        Si algo no funciona, usa:
                                        {" "}
                                        <a
                                            href="https://www.gastock.es"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontWeight: 600 }}
                                        >
                                            https://www.gastock.es
                                        </a>
                                        .
                                    </p>
                                    <small className="text-muted">
                                        Consejo rápido: <strong>Ctrl/⌘ + D</strong> para guardarlo en
                                        favoritos. También puedes arrastrar la URL a la barra de marcadores
                                        para dejarlo anclado.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div
                            className="p-3 rounded-3 border-0"
                            style={{
                                background: "rgba(255,255,255,0.8)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            <div className="d-flex align-items-start gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "linear-gradient(135deg, #f093fb, #f5576c)",
                                        color: "white",
                                        fontSize: "1.1rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    <i className="bi bi-chat-dots" />
                                </div>
                                <div>
                                    <h6 className="mb-1" style={{ color: "#4c5a7a", fontWeight: "600" }}>
                                        ¿Algún problema o idea?
                                    </h6>
                                    <p className="mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
                                        Si ves errores o tienes sugerencias, avísanos. ¡Nos ayudas a mejorar!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer
                style={{ background: "#f8f9fa", border: "none", justifyContent: "center", gap: "0.75rem" }}
            >
                <Button
                    as="a"
                    href="https://www.gastock.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        border: "none",
                        padding: "0.7rem 1.25rem",
                        borderRadius: "25px",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        boxShadow: "0 4px 15px rgba(79, 172, 254, 0.35)",
                    }}
                >
                    Ir a www.gastock.es
                </Button>

                <Button
                    onClick={handleClose}
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "25px",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                    }}
                >
                    Entendido
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
