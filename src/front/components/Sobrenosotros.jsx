import React from "react";
import { Link, useNavigate } from "react-router-dom";
import bgforgot from "../assets/img/forgot_bg.png"
import { FooterLanding } from '../components/FooterLanding';
export const Sobrenosotros = () => {
    const navigate = useNavigate();
    return (
        <>
            <div
                className="container-fluid landing-container"
                style={{ backgroundImage: `url(${bgforgot})` }}
            >
                <div className="card container p-5 shadow mt-5">
                    <button onClick={() => navigate('/')} className="back-button col-4 col-sm-8 col-lg-3">← Volver</button>
                    <h1 className="mb-4 ms-5 ">Sobre Nosotros</h1>
                    <div className="row d-flex justify-content-around">
                        <div className="col-md-8 nosotros">
                            <p>
                                En <strong>GastroSoft Solutions</strong> nos dedicamos desde 2018 a crear soluciones digitales para la gestión integral de restaurantes. Nuestra misión es facilitar el día a día de gerentes, chefs y camareros, ayudando a optimizar los flujos de trabajo y controlar los gastos y las ventas con precisión.
                            </p>
                            <p>
                                Nuestra aplicación <strong>OhMyChef</strong> permite llevar un control exhaustivo de:
                                <ul>
                                    <li>Roles y horarios de empleados</li>
                                    <li>Gestión de ventas en tiempo real</li>
                                    <li>Registro y análisis de gastos diarios</li>
                                    <li>Control de inventario y albaranes</li>
                                    <li>Informes automáticos y exportables</li>
                                </ul>
                            </p>
                            <p>
                                Contamos con un equipo multidisciplinar de desarrolladores, expertos en hostelería y diseñadores UX/UI que trabajan codo a codo para ofrecer una experiencia adaptada a las necesidades reales del sector.
                            </p>
                        </div>
                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-2 col-xxl-2 d-flex text-center">
                            <img src="/src/front/assets/img/logo.svg" alt="Chef Logo" class="img-fluid mb-3"
                                className="img-fluid"
                            />
                        </div>
                    </div>
                </div>

            </div>


        </>
    );
};
