import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const PatchAnnouncement = () => {
    const STORAGE_KEY = "patchViewed_v9"; // misma clave en todos los sitios
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
                <div className="gf-panel p-3 p-md-4 mb-3">

                    <ul className="list-unstyled mb-3">
                        <li> - Ahora al recargar la pagina no se mandara a la pagina de "iniciar sesion".</li>
                        <li> - Se corrigio el error al actualizar un gasto, ya no trae informacion errada.</li>
                        <li> - Vista admin ajustada a <strong> GASTOCK </strong></li>

                        <li>🛟 <strong>¿Algo no va bien?</strong> Avisame de inmediato para arreglarlo cuanto antes. ¡Gracias por tu ayuda!</li>
                    </ul>

                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Entendido
                </Button>
            </Modal.Footer>
        </Modal>
    );
};



