import AdminVerRestaurante from "./AdminVerRestaurante";
import AdminRestaurantePestania from "./AdminRestaurantePestania";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import '../../styles/AdminRestauranteComponent.css';
import { useEffect, useState } from "react";
// import '../styles/AdminDashboardBB.css';


const AdminRestauranteComponent = () => {
    const location = useLocation();
    const [editar, SetEditar] = useState("")

    useEffect(() => {
        SetEditar(location.state?.editar);

    }, [location.state]);

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Restaurantes</h1>
            <p className="dashboard-welcome mb-2">Añade tu Restaurante</p>

            <div className="col-12 col-sm-12 col-md-12 col-lg-10 col-xl-8 col-xxl-7 mt-4">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <Link className={`nav-link pestania ${location.pathname.endsWith("expense") ? "active" : ""}`} to="expense">
                            Ver Restaurantes
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link pestania ${location.pathname.endsWith("restaurant") ? "active" : ""}`} to="restaurant">
                            {editar == "ediccion" ? "Editar Restaurante" : "Crear restaurante"}
                        </Link>
                    </li>
                </ul>
                <div className="card p-4">
                    <Routes>
                        <Route path="expense" element={<AdminVerRestaurante />} />
                        <Route path="restaurant" element={<AdminRestaurantePestania />} />
                        <Route path="/" element={<Navigate to="expense" replace />} />
                    </Routes>
                </div>

            </div>
        </div>
    )

}

export default AdminRestauranteComponent;