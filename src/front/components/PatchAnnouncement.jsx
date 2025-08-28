import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const PatchAnnouncement = () => {
    const STORAGE_KEY = "patchViewed_v4"; // misma clave en todos los sitios
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
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>🛠️ ¡Actualización del sistema!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <ul className="list-unstyled mb-0">
                <li>✅ Tu sesión ahora dura ¡hasta 10 horas! 🔐</li>
                <li>✅ Nada de que te saque cada rato 😅</li>
                <li>👉 Recuerda: este aviso solo aparece una vez por sesión 😉</li>
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
