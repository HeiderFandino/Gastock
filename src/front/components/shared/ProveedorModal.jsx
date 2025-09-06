// src/front/components/modals/ProveedorModal.jsx
import React from "react";
import { Modal } from "react-bootstrap";
import { ProveedorForm } from "../shared/ProveedorForm";

export const ProveedorModal = ({ show, onHide, onSuccess }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      centered
      dialogClassName="pm-dialog"
      contentClassName="pm-content card-brand glass"
    >
      <Modal.Header closeButton closeVariant="white" className="pm-header">
        <Modal.Title className="pm-title">Registrar Proveedor</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        <ProveedorForm onSuccess={onSuccess} onCancel={onHide} />
      </Modal.Body>
    </Modal>
  );
};
