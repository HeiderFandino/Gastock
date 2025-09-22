import React from 'react'
import ReactDOM from 'react-dom/client'

// 1) Framework primero (para que tus estilos puedan sobrescribir)
import 'bootstrap/dist/css/bootstrap.min.css';

// 2) Design system: variables globales (antes de TODO)  
import './styles/brand-unified.css';

// 3) Resto de estilos de la app (ya consumen tokens)
import './index.css';
import './styles/nabvar.css';
import './styles/nabvar-left.css';
import './styles/QuickActionCard.css';
import './styles/EncargadoDashboard.css';
import './styles/Encargado.css';
import './styles/UserModal.css';
import './styles/EncargadoGastos.mobile.css';
import './styles/EncargadoVentasMobile.css';
import './styles/AdminRestauranteComponent.css';
import './styles/AdminRestaurantDetail.css';
import './styles/AdminGastos.css';
import './styles/AdminDashboardBB.css';
import './styles/Ajustes.css';
import './styles/PasswordModal.css';
import './styles/ProveedorForm.css';
import './styles/ProveedorRestauranteDetail.css';
import './styles/Usuarios.css';
import "./styles/login.css";
import './styles/chefventas.css';

import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from './hooks/useGlobalReducer';
import { BackendURL } from './components/BackendURL';

const Main = () => {
    if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "") {
        return (
            <React.StrictMode>
                <BackendURL />
            </React.StrictMode>
        );
    }
    return (
        <React.StrictMode>
            <StoreProvider>
                <RouterProvider router={router} />
            </StoreProvider>
        </React.StrictMode>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
