import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const PatchAnnouncement = () => {
    const STORAGE_KEY = "patchViewed_v11"; // Actualizada versión
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasViewed = localStorage.getItem(STORAGE_KEY);
        if (!hasViewed) {
            setShow(true);
        }
    }, []);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            backdrop="static"
        >
            <Modal.Header
                closeButton
                style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none"
                }}
            >
                <Modal.Title
                    className="d-flex align-items-center gap-2 w-100"
                    style={{ fontSize: "1.3rem", fontWeight: "700" }}
                >
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-rocket-takeoff" style={{ fontSize: "1.5rem" }} />
                        <span>¡Nueva Actualización v11!</span>
                    </div>
                    <div
                        className="ms-auto badge"
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            fontSize: "0.7rem",
                            fontWeight: "500"
                        }}
                    >
                        Septiembre 2024
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body
                style={{
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    padding: "2rem"
                }}
            >
                <div className="text-center mb-4">
                    <h5
                        className="mb-2"
                        style={{
                            color: "#4c5a7a",
                            fontWeight: "600",
                            fontSize: "1.1rem"
                        }}
                    >
                        🎉 ¡Tu aplicación ahora es mejor!
                    </h5>
                    <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                    >
                        Hemos añadido nuevas características para hacer tu trabajo más fácil
                    </p>
                </div>

                <div className="row g-3">
                    <div className="col-12">
                        <div
                            className="p-3 rounded-3 border-0"
                            style={{
                                background: "rgba(255,255,255,0.8)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
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
                                        flexShrink: 0
                                    }}
                                >
                                    <i className="bi bi-info-circle" />
                                </div>
                                <div>
                                    <h6
                                        className="mb-1"
                                        style={{ color: "#4c5a7a", fontWeight: "600" }}
                                    >
                                        Información Rápida y Clara
                                    </h6>
                                    <p
                                        className="mb-0 text-muted"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        Ahora verás los datos más importantes de un vistazo
                                        en la parte superior de tu pantalla, siempre actualizada.
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
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
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
                                        flexShrink: 0
                                    }}
                                >
                                    <i className="bi bi-calendar-event" />
                                </div>
                                <div>
                                    <h6
                                        className="mb-1"
                                        style={{ color: "#4c5a7a", fontWeight: "600" }}
                                    >
                                        Días Festivos de Barcelona
                                    </h6>
                                    <p
                                        className="mb-0 text-muted"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        Te avisamos cuándo es el próximo día festivo para que
                                        puedas preparar tu restaurante con tiempo.
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
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
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
                                        flexShrink: 0
                                    }}
                                >
                                    <i className="bi bi-speedometer2" />
                                </div>
                                <div>
                                    <h6
                                        className="mb-1"
                                        style={{ color: "#4c5a7a", fontWeight: "600" }}
                                    >
                                        Mejor Vista de tus Negocios
                                    </h6>
                                    <p
                                        className="mb-0 text-muted"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        Pantallas renovadas que te muestran más información clara
                                        sobre el rendimiento de tus restaurantes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="mt-4 p-3 rounded-3"
                    style={{
                        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                        border: "1px solid rgba(252, 182, 159, 0.3)"
                    }}
                >
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <i
                            className="bi bi-life-preserver"
                            style={{ color: "#d63384", fontSize: "1.2rem" }}
                        />
                        <h6
                            className="mb-0"
                            style={{ color: "#d63384", fontWeight: "600" }}
                        >
                            ¿Necesitas ayuda?
                        </h6>
                    </div>
                    <p
                        className="mb-0"
                        style={{ color: "#8b4513", fontSize: "0.9rem" }}
                    >
                        Si algo no funciona como esperas o tienes ideas para mejorar,
                        ¡cuéntanos! Tu opinión nos ayuda a hacer la aplicación mejor.
                    </p>
                </div>
            </Modal.Body>

            <Modal.Footer
                style={{
                    background: "#f8f9fa",
                    border: "none",
                    justifyContent: "center"
                }}
            >
                <Button
                    onClick={handleClose}
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        padding: "0.75rem 2rem",
                        borderRadius: "25px",
                        fontWeight: "600",
                        fontSize: "1rem",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                        transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
                    }}
                >
                    ¡Perfecto, empecemos! 🚀
                </Button>
            </Modal.Footer>
        </Modal>
    );
};



