import React from "react";
import { Modal, Button } from "react-bootstrap";
const ErrorModal = ({ show, onClose, mensaje }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Acción no permitida</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{mensaje}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default ErrorModal;
