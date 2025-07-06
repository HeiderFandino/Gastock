import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const PatchAnnouncement = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasViewed = localStorage.getItem("patchViewed_v1");
        if (!hasViewed) {
            setShow(true);
        }
    }, []);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem("patchViewed_v1", "true");
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>🛠️ ¡Actualización del sistema!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ul className="list-unstyled mb-0">
                    <li>✅ Ahora puedes registrar gastos sumando valores como “10+5+2”.</li>
                    <li>✅ Buscador integrado para encontrar proveedores fácilmente al registrar gastos.</li>
                    <li>✅ Botón de registro de gastos bloqueado para evitar envíos duplicados.</li>
                    <li>✅ Validación mejorada en montos: evita errores al ingresar letras u operadores inválidos.</li>
                    <li>✅ Edición y eliminación de gastos en el detalle diario, con total del día calculado automáticamente.</li>
                    <li>✅ Flechas añadidas para cambiar rápidamente de día en el detalle diario.</li>
                    <li>✅ Modal de anuncio de actualizaciones mostrado solo una vez por usuario.</li>
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Entendido
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
