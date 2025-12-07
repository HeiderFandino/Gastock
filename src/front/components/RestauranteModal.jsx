import React, { useState, useEffect } from "react";
// Estilos ya incluidos en brand-unified.css

const RestauranteModal = ({ restaurante, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        direccion: "",
        telefono: "",
        email_contacto: "",
        porcentaje_min: "",
        porcentaje_max: ""
    });

    useEffect(() => {
        if (restaurante) {
            setFormData({
                nombre: restaurante.nombre || "",
                direccion: restaurante.direccion || "",
                telefono: restaurante.telefono || "",
                email_contacto: restaurante.email_contacto || "",
                porcentaje_min: restaurante.porcentaje_min ?? "",
                porcentaje_max: restaurante.porcentaje_max ?? ""
            });
        } else {
            setFormData({
                nombre: "",
                direccion: "",
                telefono: "",
                email_contacto: "",
                porcentaje_min: "",
                porcentaje_max: ""
            });
        }
    }, [restaurante]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const min = parseFloat(formData.porcentaje_min);
        const max = parseFloat(formData.porcentaje_max);
        if (isNaN(min) || isNaN(max)) {
            alert("Los porcentajes deben ser numéricos.");
            return;
        }
        if (min < 0 || max < 0 || min > 100 || max > 100) {
            alert("Los porcentajes deben estar entre 0 y 100.");
            return;
        }
        if (min > max) {
            alert("El margen mínimo no puede ser mayor que el máximo.");
            return;
        }
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

                                <div className="col-md-6">
                                    <label className="form-label">📈 Margen mínimo (%)</label>
                                    <input
                                        type="number"
                                        name="porcentaje_min"
                                        className="form-control"
                                        placeholder="Ej: 30"
                                        value={formData.porcentaje_min}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">📉 Margen máximo (%)</label>
                                    <input
                                        type="number"
                                        name="porcentaje_max"
                                        className="form-control"
                                        placeholder="Ej: 40"
                                        value={formData.porcentaje_max}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
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
