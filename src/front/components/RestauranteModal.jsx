import React, { useState, useEffect } from "react";
// Estilos ya incluidos en brand-unified.css

const RestauranteModal = ({ restaurante, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        direccion: "",
        telefono: "",
        email_contacto: "",
    });

    useEffect(() => {
        if (restaurante) {
            setFormData({
                nombre: restaurante.nombre || "",
                direccion: restaurante.direccion || "",
                telefono: restaurante.telefono || "",
                email_contacto: restaurante.email_contacto || "",
            });
        } else {
            setFormData({
                nombre: "",
                direccion: "",
                telefono: "",
                email_contacto: "",
            });
        }
    }, [restaurante]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal fade show brand-modal" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="modal-icon">🏪</div>
                        <h5 className="modal-title">
                            {restaurante ? "Editar Restaurante" : "Crear Nuevo Restaurante"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">🏪 Nombre del restaurante</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        className="form-control"
                                        placeholder="Ingresa el nombre del restaurante"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">📍 Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        className="form-control"
                                        placeholder="Dirección del restaurante"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">📞 Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        className="form-control"
                                        placeholder="Número de contacto"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">📧 Email de contacto</label>
                                    <input
                                        type="email"
                                        name="email_contacto"
                                        className="form-control"
                                        placeholder="contacto@restaurante.com"
                                        value={formData.email_contacto}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="modal-btn-secondary"
                                onClick={onClose}
                            >
                                ❌ Cancelar
                            </button>
                            <button
                                type="submit"
                                className="modal-btn-primary"
                            >
                                💾 {restaurante ? "Actualizar" : "Crear"} Restaurante
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RestauranteModal;
