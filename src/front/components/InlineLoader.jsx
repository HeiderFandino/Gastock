import React from "react";

const InlineLoader = ({ message = "Cargando..." }) => (
  <div className="inline-loader" role="status" aria-live="polite">
    <span className="spinner-inline spinner-inline--dark" aria-hidden="true" />
    <span className="inline-loader__text">{message}</span>
  </div>
);

export default InlineLoader;
