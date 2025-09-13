import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const GastosChef = ({
  datos,
  ancho = "100%",
  alto = 300,
  rol = "grafico",
  margen = { top: 20, right: 30, left: 20, bottom: 5 },
  xAxisProps = { dataKey: "dia", type: "number", interval: 0 },
  yAxisProps = { domain: [0, 100], tickFormatter: (v) => `${v}%` },
  tooltipProps = { formatter: (v) => `${v}%` },
  lineProps = { dataKey: "porcentaje", stroke: "#87abe5", strokeWidth: 2, dot: { r: 3 }, name: "% gasto" }
}) => {
  return (
    <div role={rol} style={{ width: "100%" }}>
      <ResponsiveContainer width={ancho} height={alto}>
        <LineChart data={datos} margin={margen}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...tooltipProps} />
          <Legend />
          <Line type="monotone" {...lineProps} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GastosChef;
