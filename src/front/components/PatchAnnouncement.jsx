import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const PatchAnnouncement = () => {
    const STORAGE_KEY = "patchViewed_v8"; // misma clave en todos los sitios
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
                    <h1 className="mb-2 text-brand fw-bold">¡Bienvenido a Gastock!</h1>

                    <p className="text-muted mb-3">
                        Si antes usabas <strong>OhMyChef</strong>, desde hoy continuas en <strong>Gastock</strong>.
                        Encontrarás todo más claro, rápido y listo para usarse en el móvil.
                        Tu cuenta y tus datos siguen seguros: no tienes que hacer nada.
                    </p>

                    <ul className="list-unstyled mb-3">
                        <li>📱 <strong>Versión móvil:</strong> ahora se ve mejor en teléfonos, con botones más grandes y navegación simple.</li>
                        <li>⚡ <strong>Versión general:</strong> pantallas más ordenadas y tiempos de carga más rápidos.</li>
                        <li>🛟 <strong>¿Algo no va bien?</strong> Avísanos de inmediato para arreglarlo cuanto antes. ¡Gracias por tu ayuda!</li>
                    </ul>


                </div>
                <ul className="list-unstyled mb-0">
                    <li>📱 Se ha mejorado la vista en verison MOVILES.</li>
                    <li>⚡ Navegación más rápida y clara en pantallas pequeñas.</li>
                    <li> Te invito a probar la nueva versión móvil hoy mismo 🚀</li>
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



