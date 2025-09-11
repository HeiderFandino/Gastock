import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import useGlobalReducer from "../hooks/useGlobalReducer";
import gastoServices from "../services/GastoServices";
// Estilos ya incluidos en brand-unified.css


export const GastoForm = () => {
  const { store } = useGlobalReducer();
  const user = store.user;
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [gastos, setGastos] = useState([
    { proveedor_id: "", categoria: "", monto: "", nota: "" },
  ]);
  const [activo, setActivo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [proveedores, setProveedores] = useState([]);

  // Carga de proveedores depende de restaurante_id
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        if (!user?.restaurante_id) return;
        const data = await gastoServices.getProveedores(user.restaurante_id);
        setProveedores(data);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
        setMensaje("Error al cargar proveedores");
      }
    };
    fetchProveedores();
  }, [user?.restaurante_id]);

  const agregarGasto = () => {
    setGastos([...gastos, { proveedor_id: "", categoria: "", monto: "", nota: "" }]);
    setActivo(true);
  };

  const eliminarGasto = (index) => {
    setGastos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const nuevosGastos = [...gastos];
    nuevosGastos[index][field] = value;
    setGastos(nuevosGastos);
  };

  const handleProveedorChange = (index, proveedorId) => {
    const nuevosGastos = [...gastos];
    nuevosGastos[index].proveedor_id = proveedorId;

    const proveedor = proveedores.find((p) => p.id === parseInt(proveedorId, 10));
    // Si el proveedor trae categoria, úsala; si no, no pises lo que el usuario haya escrito
    if (proveedor?.categoria) {
      nuevosGastos[index].categoria = proveedor.categoria;
    }
    setGastos(nuevosGastos);
  };

  // Eval simple para permitir sumas/restas en monto (p.ej. "10+2-1,5")
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
        if (!Number.isFinite(num)) throw new Error("Número inválido en expresión.");
        result = operator === "+" ? result + num : result - num;
      }
    });
    return result;
  };

  const registrarGastos = async () => {
    if (loading) return;
    setMensaje("");

    // Validaciones básicas
    const errores = [];
    if (!user?.restaurante_id) errores.push("Falta restaurante_id del usuario.");
    if (!fecha) errores.push("La fecha es obligatoria.");

    gastos.forEach((g, i) => {
      if (!g.proveedor_id) errores.push(`Fila ${i + 1}: selecciona un proveedor.`);
      if (!g.monto && g.monto !== 0) errores.push(`Fila ${i + 1}: ingresa un monto.`);
      if (!g.categoria?.trim()) errores.push(`Fila ${i + 1}: la categoría es obligatoria.`);
      // Nota opcional, no validar
    });

    if (errores.length) {
      setMensaje("Corrige estos errores:\n• " + errores.join("\n• "));
      return;
    }

    // Construcción de payload normalizado
    let payload;
    try {
      payload = gastos.map((g) => {
        const montoCalculado = safeEval(String(g.monto).replace(/,/g, "."));
        if (!Number.isFinite(montoCalculado) || montoCalculado <= 0) {
          throw new Error(`Monto inválido "${g.monto}"`);
        }
        const categoriaNormalizada = g.categoria
          ? g.categoria.charAt(0).toUpperCase() + g.categoria.slice(1).toLowerCase()
          : "General";

        return {
          restaurante_id: Number(user.restaurante_id),
          usuario_id: Number(user.id),
          fecha, // YYYY-MM-DD
          proveedor_id: Number(g.proveedor_id),
          monto: Number(montoCalculado.toFixed(2)),
          categoria: categoriaNormalizada,
          nota: g.nota ?? "",
        };
      });
    } catch (e) {
      setMensaje(`Error en montos: ${e.message}`);
      return;
    }

    try {
      setLoading(true);
      // usar el método existente del service (bulk)
      await gastoServices.registrarGastoMultiple(payload);
      setMensaje("Gastos registrados correctamente ✅");
      setGastos([{ proveedor_id: "", categoria: "", monto: "", nota: "" }]);
      setActivo(false);
      // Navega tras un pequeño respiro visual
      setTimeout(() => {
        navigate(`/${user.rol}/gastos`, {
          state: { registrado: true, view: "diario" },
        });
      }, 900);
    } catch (error) {
      console.error("Error al registrar:", error);
      setMensaje(`Error al registrar los gastos ❌`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="gasto-form-container">
      <div className="gf-header">
        <h1 className="gf-title">Registrar Gastos</h1>
        <p className="gf-subtitle">Registra los gastos del restaurante organizados por proveedor y categoría</p>
      </div>

      <div className="gf-main-card">
        <div className="gf-date-row">
          <label className="gf-date-label">📅 Fecha:</label>
          <input
            type="date"
            className="gf-date-input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* Listado de gastos */}
        {gastos.map((gasto, index) => (
          <div className="gf-gasto-row" key={index}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="gf-label">🏢 Proveedor</label>
                <Select
                  className="gf-react-select"
                  classNamePrefix="select"
                  components={{ IndicatorSeparator: () => null }}
                  value={
                    gasto.proveedor_id
                      ? {
                        value: gasto.proveedor_id,
                        label:
                          proveedores.find((p) => p.id === parseInt(gasto.proveedor_id, 10))
                            ?.nombre || gasto.proveedor_id,
                      }
                      : null
                  }
                  onChange={(option) => handleProveedorChange(index, option ? option.value : "")}
                  options={proveedores.map((p) => ({
                    value: p.id,
                    label: p.nombre,
                  }))}
                  placeholder="Selecciona un proveedor..."
                  isClearable
                  isSearchable
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="gf-label">📋 Categoría</label>
                <input
                  type="text"
                  className="gf-input"
                  value={gasto.categoria}
                  onChange={(e) => handleInputChange(index, "categoria", e.target.value)}
                  placeholder="Ej: Alimentos, Bebidas..."
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="gf-label">💰 Monto</label>
                <input
                  type="text"
                  className="gf-input"
                  value={gasto.monto}
                  onChange={(e) => handleInputChange(index, "monto", e.target.value)}
                  placeholder="0.00 (permite cálculos)"
                />
              </div>

              <div className="col-12 col-md-2">
                <label className="gf-label">📝 Nota</label>
                <input
                  type="text"
                  className="gf-input"
                  value={gasto.nota}
                  onChange={(e) => handleInputChange(index, "nota", e.target.value)}
                  placeholder="Opcional..."
                />
              </div>

              {/* Botón Eliminar */}
              {gastos.length > 1 && (
                <div className="col-12 d-flex justify-content-end">
                  <button
                    type="button"
                    className="gf-remove-btn"
                    onClick={() => eliminarGasto(index)}
                    aria-label="Eliminar gasto"
                    title="Eliminar este gasto"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="d-flex gap-3 mt-4">
          <button className="btn-gastock-outline" onClick={agregarGasto} disabled={loading}>
            + Añadir otro gasto
          </button>
          <button className="btn-gastock" onClick={registrarGastos} disabled={loading}>
            {loading ? "Registrando..." : "Registrar Gastos"}
          </button>
        </div>

        {mensaje && <div className="alert alert-info mt-3" style={{ whiteSpace: "pre-line" }}>
          {mensaje}
        </div>}
      </div>
    </div>
  );
};
