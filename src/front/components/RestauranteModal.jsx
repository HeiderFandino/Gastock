import React, { useState, useEffect } from "react";
import "../styles/UserModal.css";

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
        <div className="modaal-backdrop">
            <div className="modaal">
                <h2 className="titulo">
                    {restaurante ? "Editar Restaurante" : "Crear Restaurante"}
                </h2>
                <form onSubmit={handleSubmit} className="modaal-form px-0">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre del restaurante"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="direccion"
                        placeholder="Dirección"
                        value={formData.direccion}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        name="email_contacto"
                        placeholder="Email de contacto"
                        value={formData.email_contacto}
                        onChange={handleChange}
                    />
                    <div className="modaal-actions">
                        <button type="button" onClick={onClose} className="btn-cancelar">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-guardar">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestauranteModal;
