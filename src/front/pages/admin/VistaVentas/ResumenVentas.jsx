import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import adminService from "../../../services/adminService";
import { useSearchParams } from "react-router-dom";

const ResumenVentas = ({ mes: mesProp, ano: anoProp }) => {
  const [searchParams] = useSearchParams();
  const hoy = useMemo(() => new Date(), []);
  const mesFromUrl = Number(searchParams.get("mes")) || null;
  const anoFromUrl = Number(searchParams.get("ano")) || null;

  const mes = mesProp || mesFromUrl || hoy.getMonth() + 1;
  const ano = anoProp || anoFromUrl || hoy.getFullYear();

  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    const fetchResumen = async () => {
      setLoading(true);
      try {
        const data = await adminService.getResumenAdminVentas(mes, ano);
        if (cancel) return;

        if (data && data.total_vendido !== undefined) {
          setResumen([
            { titulo: `Total vendido (${mes}/${ano})`, valor: `€${Number(data.total_vendido || 0).toLocaleString("es-ES")}` },
            { titulo: "Nº de restaurantes con ventas", valor: Number(data.restaurantes_con_ventas || 0).toLocaleString("es-ES") },
            { titulo: "Restaurante top", valor: data.restaurante_top || "—" },
            { titulo: "Promedio por restaurante", valor: `€${Number(data.promedio_por_restaurante || 0).toLocaleString("es-ES")}` },
          ]);
        } else setResumen([]);
      } catch (err) {
        console.error("Error al obtener el resumen de ventas:", err);
        setResumen([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    fetchResumen();
    return () => { cancel = true; };
  }, [mes, ano]);

  if (loading) return <Spinner animation="border" size="sm" />;
  if (!resumen || resumen.length === 0) return <p className="text-muted">No hay datos disponibles.</p>;

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

export default ResumenVentas;
