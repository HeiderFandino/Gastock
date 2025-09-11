import React from "react";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";

const CompactMonthFilter = ({
  mesSeleccionado,
  anoSeleccionado,
  onMesChange,
  onAnoChange,
  onNuevoClick,
  nuevoButtonText = "Nueva Venta",
  showNuevoButton = true,
  className = ""
}) => {
  // Función para avanzar/retroceder mes
  const cambiarMes = (direccion) => {
    let nuevoMes = mesSeleccionado + direccion;
    let nuevoAno = anoSeleccionado;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAno += 1;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAno -= 1;
    }

    onMesChange(nuevoMes);
    onAnoChange(nuevoAno);
  };

  // Formatear mes
  const nombreMes = new Date(anoSeleccionado, mesSeleccionado - 1)
    .toLocaleString("es", { month: "long", year: "numeric" });

  const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  return (
    <div className={`compact-month-filter ${className}`}>
      {/* Controles de mes */}
      <div className="cmf-month-controls">
        <button 
          className="cmf-nav-btn" 
          onClick={() => cambiarMes(-1)}
          title="Mes anterior"
        >
          <FiChevronLeft size={16} />
        </button>
        
        <div className="cmf-month-display">
          <span className="cmf-month-text">{nombreMesCapitalizado}</span>
        </div>
        
        <button 
          className="cmf-nav-btn" 
          onClick={() => cambiarMes(1)}
          title="Mes siguiente"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      {/* Botón de acción */}
      {showNuevoButton && onNuevoClick && (
        <button 
          className="cmf-action-btn d-none d-md-inline-flex"
          onClick={onNuevoClick}
        >
          <FiPlus size={16} />
          <span>{nuevoButtonText}</span>
        </button>
      )}
    </div>
  );
};

export default CompactMonthFilter;