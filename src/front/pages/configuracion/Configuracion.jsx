import React, { useEffect } from "react";
import "../../styles/Ajustes.css";

export default function Configuracion() {
    useEffect(() => {
        const curr = getComputedStyle(document.documentElement).getPropertyValue("--navbar-h");
        if (!curr) document.documentElement.style.setProperty("--navbar-h", "56px");
        const scroller = document.querySelector(".custom-sidebar");
        if (scroller) scroller.scrollTo(0, 0);
    }, []);

    return (
        <div className="config-page container-fluid py-3">
            <header className="mb-3">
                <h1 className="page-title">Configuración</h1>
                <p className="page-subtitle">
                    Gestiona tu cuenta, apariencia y preferencias del restaurante.
                </p>
            </header>

            {/* Layout de una sola columna, panel centrado */}
            <main className="aj-content">
                <div className="aj-panel aj-panel--center">

                    {/* DATOS PERSONALES */}
                    <section className="aj-block">
                        <h3 className="aj-block-title">Datos personales</h3>
                        <form className="aj-row">
                            <div>
                                <label className="form-label aj-label">Nombre</label>
                                <input type="text" className="form-control" placeholder="Nombre y apellido" />
                            </div>
                            <div>
                                <label className="form-label aj-label">Correo electrónico</label>
                                <input type="email" className="form-control" placeholder="tu@correo.com" />
                            </div>
                            <div className="mt-2">
                                <button type="button" className="btn-gastock">Guardar cambios</button>
                            </div>
                        </form>
                    </section>

                    <hr className="aj-divider" />

                    {/* CONTRASEÑA */}
                    <section className="aj-block">
                        <h3 className="aj-block-title">Cambiar contraseña</h3>
                        <form className="aj-row">
                            <div>
                                <label className="form-label aj-label">Actual</label>
                                <input type="password" className="form-control" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="form-label aj-label">Nueva</label>
                                <input type="password" className="form-control" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="form-label aj-label">Confirmar</label>
                                <input type="password" className="form-control" placeholder="••••••••" />
                            </div>
                            <div className="mt-2">
                                <button type="button" className="btn-gastock">Actualizar contraseña</button>
                            </div>
                        </form>
                    </section>

                    <hr className="aj-divider" />

                    {/* MONEDA */}
                    <section className="aj-block">
                        <h3 className="aj-block-title">Moneda principal</h3>
                        <form className="aj-row">
                            <div>
                                <label className="form-label aj-label">Selecciona tu moneda</label>
                                <select className="form-select">
                                    <option value="">Selecciona</option>
                                    <option value="EUR">€ Euro</option>
                                    <option value="USD">$ Dólar</option>
                                    <option value="GBP">£ Libra</option>
                                </select>
                            </div>
                            <div className="mt-2">
                                <button type="button" className="btn-gastock">Guardar cambio</button>
                            </div>
                        </form>
                    </section>

                    <hr className="aj-divider" />

                    {/* PERSONALIZACIÓN */}
                    <section className="aj-block">
                        <h3 className="aj-block-title">Personalización</h3>
                        <div className="mb-2">
                            <label className="form-label aj-label">Tema visual</label>
                            <select className="form-select">
                                <option value="claro">Claro</option>
                                <option value="oscuro">Oscuro</option>
                            </select>
                        </div>
                        <button className="btn-gastock mt-2">Aplicar cambios</button>
                    </section>

                    <hr className="aj-divider" />

                    {/* AVANZADOS */}
                    <section className="aj-block">
                        <h3 className="aj-block-title">Ajustes avanzados</h3>
                        <div className="form-check form-switch mb-3">
                            <input className="form-check-input" type="checkbox" id="cfg-logs" />
                            <label className="form-check-label" htmlFor="cfg-logs">Activar logs del sistema</label>
                        </div>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="cfg-debug" />
                            <label className="form-check-label" htmlFor="cfg-debug">Modo debug</label>
                        </div>
                        <button className="btn-gastock mt-3">Guardar configuración</button>
                    </section>

                </div>
            </main>
        </div>
    );
}
