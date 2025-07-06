import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import useGlobalReducer from "../hooks/useGlobalReducer";
import gastoServices from "../services/GastoServices";

export const GastoForm = () => {
  const { store } = useGlobalReducer();
  const user = store.user;
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [gastos, setGastos] = useState([
    { proveedor_id: "", categoria: "", monto: "", nota: "" },
  ]);
  const [activo, setActivo] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const nombreMes = new Date(fecha).toLocaleString("es", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (user?.restaurante_id) {
      gastoServices
        .getProveedores(user.restaurante_id)
        .then(setProveedores)
        .catch(() => setMensaje("Error al cargar proveedores"));
    }
  }, []);

  const handleInputChange = (index, field, value) => {
    const nuevosGastos = [...gastos];
    nuevosGastos[index][field] = value;
    setGastos(nuevosGastos);
  };

  const handleProveedorChange = (index, proveedorId) => {
    const nuevosGastos = [...gastos];
    nuevosGastos[index].proveedor_id = proveedorId;

    const proveedor = proveedores.find((p) => p.id === parseInt(proveedorId));
    nuevosGastos[index].categoria = proveedor ? proveedor.categoria : "";

    setGastos(nuevosGastos);
  };

  const agregarGasto = () => {
    setGastos([...gastos, { proveedor_id: "", categoria: "", monto: "", nota: "" }]);
    setActivo(true);
  };

  const eliminarGasto = (index) => {
    const nuevosGastos = [...gastos];
    nuevosGastos.splice(index, 1);
    setGastos(nuevosGastos);
  };

  const safeEval = (expression) => {
    const validChars = /^[0-9+\-.\s]+$/;
    if (!validChars.test(expression)) {
      throw new Error("Expresión inválida: solo números y + - son permitidos.");
    }
    const tokens = expression.match(/[+\-]|\d+(\.\d+)?/g);
    if (!tokens) throw new Error("Expresión vacía o inválida.");
    let result = 0;
    let operator = "+";
    tokens.forEach((token) => {
      if (token === "+" || token === "-") {
        operator = token;
      } else {
        const num = parseFloat(token);
        if (isNaN(num)) throw new Error("Número inválido en expresión.");
        result = operator === "+" ? result + num : result - num;
      }
    });
    return result;
  };

  const registrarGastos = async () => {
    if (loading) return;

    const camposIncompletos = gastos.some(
      (g) => !g.proveedor_id || !g.monto
    );
    if (camposIncompletos) {
      setMensaje("Completa proveedor y monto en todos los gastos antes de registrar ❌");
      return;
    }

    let datos;
    try {
      datos = gastos.map((g) => {
        let montoCalculado = 0;
        try {
          montoCalculado = safeEval(g.monto.replace(/,/g, "."));
        } catch (e) {
          console.error("Expresión inválida en el monto:", g.monto);
          setMensaje(`Monto inválido en una de las filas: "${g.monto}"`);
          throw new Error("Monto inválido");
        }
        return {
          ...g,
          fecha,
          monto: parseFloat(montoCalculado.toFixed(2)),
          usuario_id: user.id,
          restaurante_id: user.restaurante_id,
        };
      });
    } catch (e) {
      return; 
    }

    try {
      setLoading(true);
      await gastoServices.registrarGastoMultiple(datos);
      setMensaje("Gastos registrados correctamente ✅");

      setTimeout(() => {
        navigate(`/${user.rol}/gastos`, {
          state: { registrado: true, view: "diario" },
        });
      }, 1200);
    } catch (error) {
      console.error("Error al registrar:", error);
      setMensaje("Error al registrar los gastos ❌");
    } finally {
      setTimeout(() => setLoading(false), 5000);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary mb-3"
      >
        ← Volver
      </button>

      <h3 className="mb-2">Registrar Gastos del día</h3>
      <div className="bg-orange d-inline-block text-white py-2 px-3 mb-4 rounded">
        Mes actual: {nombreMes.toUpperCase()}
      </div>

      <div className="bg-white col-12 col-sm-12 col-md-12 col-lg-10 col-xx-9 p-4 shadow rounded">
        <div className="mb-4 col-12 col-sm-12 col-md-6 col-lg-3">
          <label className="form-label fw-semibold">Fecha</label>
          <input
            type="date"
            className="form-control"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {gastos.map((gasto, index) => (
          <div
            key={index}
            className="d-flex flex-wrap align-items-end mb-3 border-bottom pb-3 gap-2"
          >
            <div className="flex-grow-1 min-w-0" style={{ flexBasis: "25%" }}>
              <label className="form-label fw-semibold">Proveedor</label>
              <Select
                options={proveedores.map((prov) => ({
                  value: prov.id,
                  label: prov.nombre,
                }))}
                value={
                  gasto.proveedor_id
                    ? {
                        value: gasto.proveedor_id,
                        label:
                          proveedores.find((p) => p.id === parseInt(gasto.proveedor_id))?.nombre ||
                          gasto.proveedor_id,
                      }
                    : null
                }
                onChange={(selected) => handleProveedorChange(index, selected.value)}
                placeholder="Selecciona un proveedor..."
                isSearchable
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: state.isFocused ? "#fd7e14" : "#ced4da",
                    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(253, 126, 20, 0.25)" : "none",
                    height: "38px",
                    minHeight: "38px",
                    fontSize: "0.9rem",
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: "0.9rem",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    fontSize: "0.9rem",
                  }),
                  dropdownIndicator: (provided) => ({
                    ...provided,
                    padding: "6px",
                  }),
                  clearIndicator: (provided) => ({
                    ...provided,
                    padding: "6px",
                  }),
                }}
              />
            </div>

            <div className="flex-grow-1 min-w-0" style={{ flexBasis: "20%" }}>
              <label className="form-label fw-semibold">Categoría</label>
              <input
                type="text"
                className="form-control"
                value={gasto.categoria}
                readOnly
              />
            </div>

            <div className="flex-grow-1 min-w-0" style={{ flexBasis: "15%" }}>
              <label className="form-label fw-semibold">Monto (€)</label>
              <input
                type="text"
                className="form-control"
                value={gasto.monto}
                onChange={(e) => handleInputChange(index, "monto", e.target.value)}
              />
            </div>

            <div className="flex-grow-1 min-w-0" style={{ flexBasis: "25%" }}>
              <label className="form-label fw-semibold">Nota</label>
              <input
                type="text"
                className="form-control"
                value={gasto.nota}
                onChange={(e) => handleInputChange(index, "nota", e.target.value)}
              />
            </div>

            <div className="ms-auto">
              {gastos.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger mt-4"
                  onClick={() => eliminarGasto(index)}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="d-flex gap-3 mt-4">
          <button
            className={`btn btn-outline-orange ${activo ? "active" : "nobg"}`}
            onClick={agregarGasto}
            disabled={loading}
          >
            + Añadir otro gasto
          </button>
          <button
            className={`btn btn-outline-orange ${!activo ? "active" : "nobg"}`}
            onClick={registrarGastos}
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar Gastos"}
          </button>
        </div>

        {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
      </div>
    </div>
  );
};
