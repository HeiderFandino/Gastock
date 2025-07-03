import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import adminService from "../../../services/adminService";
const ResumenGastos = () => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const mes = 6; // Junio
        const ano = 2025;
        const data = await adminService.getResumenAdminGastos(mes, ano);
        if (data && data.total_gastado !== undefined) {
          const resumenArray = [
            { titulo: "Total gastado (junio)", valor: `€${data.total_gastado}` },
            { titulo: "Nº de restaurantes activos", valor: data.restaurantes_activos },
            { titulo: "Proveedor más usado", valor: data.proveedor_top },
            { titulo: "Top restaurante", valor: data.restaurante_top },
          ];
          setResumen(resumenArray);
        } else {
          setResumen([]);
        }
      } catch (err) {
        console.error("Error al obtener el resumen:", err);
        setResumen([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);
  if (loading) return <Spinner animation="border" size="sm" />;
  if (!resumen || resumen.length === 0) return <p className="text-muted">No hay datos disponibles.</p>;
  return (
    <Row className="mb-4">
      {resumen.map((item, i) => (
        <Col key={i} xs={12} sm={6} md={3} className="mb-3 col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 col-12 col-md-3 col-sm-6 col-12">
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






























