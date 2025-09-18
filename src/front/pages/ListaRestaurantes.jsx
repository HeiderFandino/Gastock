import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import therestaurant from "../services/restauranteServices";
import { useNavigate, Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";



const ListaRestaurantes = ({ restaurantes }) => {
  const [loading, setLoading] = useState(false);
  const { store, dispatch } = useGlobalReducer();
  const [mensaje, setMensaje] = useState("");
  const token = sessionStorage.getItem("token");
  const [restaurantesLocal, setRestaurantesLocal] = useState([]);


  const navigate = useNavigate();

  useEffect(() => {
    if (Array.isArray(restaurantes)) {
      setRestaurantesLocal(restaurantes);
    }
  }, [restaurantes]);

  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  // funcion editar
  const handlerditar = (restauranteSeleccionado) => {

    navigate(`/${store.user.rol}/restaurantes/restaurant`, {
      state: { restaurante: restauranteSeleccionado, editar: "ediccion" }
    });

    console.log("Restaurante seleccionado:", restauranteSeleccionado);

  };


  // funcion eliminar
  const handlerEliminar = (restauranteSeleccionado) => {
    if (token && store.user.rol === "admin") {
      if (!confirm("¿Confirmas los datos introducidos?")) return
      setLoading(true);
      therestaurant.eliminarRestaurante(restauranteSeleccionado.id, token)
        .then(data => {
          setMensaje("restaurante eliminado con exito");
          setRestaurantesLocal((prev) => prev.filter((r) => r.id !== restauranteSeleccionado.id));
          dispatch({ type: "remove_restaurante", payload: restauranteSeleccionado.id });
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setMensaje("No se ha podido eliminar el restaurante");
        });
    } else {
      setMensaje("No tienes permisos para eliminar restaurantes");
    }
  };
  return (

    loading ? (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    ) : (
      <div className="container">
        <h5 className="mb-3">Lista de Restaurantes</h5>
        <ul className="list-group">
          {restaurantesLocal && restaurantesLocal.map(restaurante => (
            <li
              key={restaurante.id}
              className="list-group-item d-flex justify-content-between flex-wrap align-items-center"
            >

              <div>
                <strong>{restaurante.nombre}</strong>
                <br />
                <small className="text-muted">{restaurante.direccion}</small>
                <br />
                <small className="text-muted">{restaurante.email_contacto}</small>
                <br />
                <small className="text-muted">ID: {restaurante.id}</small>
                <br />
                {restaurante.telefono &&
                  <small className="text-muted">{restaurante.telefono}</small>
                }

              </div>

              <div className="d-flex align-items-center gap-2">

                <button
                  className="action-icon-button edit-button"
                  type="button"
                  onClick={() => handlerditar(restaurante)}
                  title="Editar restaurante"
                  aria-label="Editar restaurante"
                >
                  <FiEdit2 size={18} aria-hidden="true" focusable="false" />
                </button>
                <button
                  className="action-icon-button delete-button"
                  type="button"
                  onClick={() => handlerEliminar(restaurante)}
                  title="Eliminar restaurante"
                  aria-label="Eliminar restaurante"
                >
                  <FiTrash2 size={18} aria-hidden="true" focusable="false" />
                </button>

              </div>
            </li>
          ))}
        </ul>

        {mensaje && (
          <div
            className={`alert col-12 col-sm-12 col-md-12 col-lg-6 mt-3 text-white text-center float-end ${mensaje.toLowerCase().includes("exito") ? "bg-success" : "bg-danger"
              }`}
          >
            {mensaje}
          </div>
        )}
      </div>
    )
  );



};

export default ListaRestaurantes;
