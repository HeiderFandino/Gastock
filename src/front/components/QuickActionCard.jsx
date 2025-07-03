import React from "react";

const QuickActionCard = ({ icon, title, subtitle, onClick }) => (
  <div
    className="rounded border shadow-sm p-3 action-card bg-white"
    style={{ width: "180px", cursor: "pointer" }}
    onClick={onClick}
  >
    <div className="icono-circular bg-light mb-2 fs-4 text-center">{icon}</div>
    <h6 className="fw-bold mb-1">{title}</h6>
    <p className="small text-muted">{subtitle}</p>
  </div>
);

export default QuickActionCard;