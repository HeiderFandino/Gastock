import React, { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/Ajustes.css";

export default function Configuracion() {
    const { store, dispatch } = useGlobalReducer();
    const [userRole, setUserRole] = useState(null);
    const [profileData, setProfileData] = useState({ nombre: "", email: "" });
    const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", confirm_password: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const curr = getComputedStyle(document.documentElement).getPropertyValue("--navbar-h");
        if (!curr) document.documentElement.style.setProperty("--navbar-h", "56px");
        const scroller = document.querySelector(".custom-sidebar");
        if (scroller) scroller.scrollTo(0, 0);

        // Obtener rol del usuario y cargar datos
        if (store.user) {
            setUserRole(store.user.rol);
            setProfileData({
                nombre: store.user.nombre || "",
                email: store.user.email || ""
            });
        }
    }, [store.user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage("Datos actualizados correctamente");
                // Actualizar el store global
                dispatch({ type: "get_user_info", payload: { ...store.user, ...data.user } });
            } else {
                setMessage(data.error || "Error al actualizar datos");
            }
        } catch (error) {
            setMessage("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage("Contraseña actualizada correctamente");
                setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
            } else {
                setMessage(data.error || "Error al cambiar contraseña");
            }
        } catch (error) {
            setMessage("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="config-page container-fluid py-3">
            <header className="mb-3">
                <h1 className="page-title">Configuración</h1>
                <p className="page-subtitle">
                    Gestiona tu cuenta y preferencias.
                </p>
                {message && (
                    <div className={`alert ${message.includes("correctamente") ? "alert-success" : "alert-danger"}`}>
                        {message}
                    </div>
                )}
            </header>

            {/* Layout de una sola columna, panel centrado */}
            <main className="aj-content">
                <div className="aj-panel aj-panel--center">

                    {/* DATOS PERSONALES - Solo para admin */}
                    {userRole === "admin" && (
                        <>
                            <section className="aj-block">
                                <h3 className="aj-block-title">Datos personales</h3>
                                <form className="aj-row" onSubmit={handleProfileSubmit}>
                                    <div>
                                        <label className="form-label aj-label">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nombre y apellido"
                                            value={profileData.nombre}
                                            onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label aj-label">Correo electrónico</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="tu@correo.com"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <button type="submit" className="btn-gastock" disabled={loading}>
                                            {loading ? "Guardando..." : "Guardar cambios"}
                                        </button>
                                    </div>
                                </form>
                            </section>
                            <hr className="aj-divider" />
                        </>
                    )}

                    {/* CONTRASEÑA - Para todos los roles */}
                    <section className="aj-block">
                        <h3 className="aj-block-title">Cambiar contraseña</h3>
                        <form className="aj-row" onSubmit={handlePasswordSubmit}>
                            <div>
                                <label className="form-label aj-label">Contraseña actual</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label aj-label">Nueva contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    minLength="6"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label aj-label">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    minLength="6"
                                    required
                                />
                            </div>
                            <div className="mt-2">
                                <button type="submit" className="btn-gastock" disabled={loading}>
                                    {loading ? "Actualizando..." : "Actualizar contraseña"}
                                </button>
                            </div>
                        </form>
                    </section>

                </div>
            </main>
        </div>
    );
}
