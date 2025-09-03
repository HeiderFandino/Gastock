// src/front/pages/admin/VistaGastos/ResumenGastos.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import adminService from "../../../services/adminService";

const nombresMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const ResumenGastos = ({ mes, ano }) => {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mes || !ano) return;
      setLoading(true);
      try {
        const data = await adminService.getResumenAdminGastos(mes, ano);
        if (!mounted) return;

        const labelMes = nombresMes[mes - 1] || "";
        if (data && data.total_gastado !== undefined) {
          setResumen([
            { titulo: `Total gastado (${labelMes.toLowerCase()})`, valor: `€${Number(data.total_gastado).toLocaleString()}` },
            { titulo: "Nº de restaurantes activos", valor: data.restaurantes_activos },
            { titulo: "Proveedor más usado", valor: data.proveedor_top },
            { titulo: "Top restaurante", valor: data.restaurante_top },
          ]);
        } else {
          setResumen([]);
        }
      } catch (e) {
        console.error("Error al obtener el resumen:", e);
        setResumen([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mes, ano]);

  if (loading) return <Spinner animation="border" size="sm" />;
  if (!resumen.length) return <p className="text-muted">No hay datos disponibles.</p>;

  return (
    <Row className="mb-4">
      {resumen.map((item, i) => (
        <Col key={i} xs={12} sm={6} md={3} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title className="fs-6 text-muted">{item.titulo}</Card.Title>
              <Card.Text className="fs-4 fw-bold">{item.valor}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ResumenGastos;
