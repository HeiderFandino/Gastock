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
                    <li>✅ SE CORRIGIO LOS DATOS DE PROYECCION MENSUAL, ANTES CALCULABA A 30 DIAS SIN IMPORTAR EL MES, AHORA SE CALCULA DEPENDIENDO EL MES ACTUAL </li>
                    <li>✅ YA SE PUEDEN MIRAR LOS MESES ANTERIORES DESDE EL DASHBOARD </li>
                    <li>✅ NUR, GRACIAS POR EL APOYO HERMANO! </li>

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
