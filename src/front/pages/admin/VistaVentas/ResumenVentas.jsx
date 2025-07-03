import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import adminService from "../../../services/adminService";
const ResumenVentas = () => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const mes = 6; // Junio
        const ano = 2025;
        const data = await adminService.getResumenAdminVentas(mes, ano);
        if (data && data.total_vendido !== undefined) {
          const resumenArray = [
            { titulo: "Total vendido (junio)", valor: `€${data.total_vendido}` },
            { titulo: "Nº de restaurantes con ventas", valor: data.restaurantes_con_ventas },
            { titulo: "Restaurante top", valor: data.restaurante_top },
            { titulo: "Promedio por restaurante", valor: `€${data.promedio_por_restaurante}` },
          ];
          setResumen(resumenArray);
        } else {
          setResumen([]);
        }
      } catch (err) {
        console.error("Error al obtener el resumen de ventas:", err);
        setResumen([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);
  if (loading) return <Spinner animation="border" size="sm" />;
  if (!resumen || resumen.length === 0)
    return <p className="text-muted">No hay datos disponibles.</p>;
  return (
    <Row className="mb-4">
      {resumen.map((item, i) => (
        <Col key={i} xs={12} sm={6} md={3} className="mb-3 col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 col-12">
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
export default ResumenVentas;













