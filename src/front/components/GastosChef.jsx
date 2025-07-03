
import React from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";


const GastosChef = ({
    datos,
    ancho = 800,
    alto = 300,
    rol = "grafico",
    margen = { top: 20, right: 30, left: 20, bottom: 5 },
    xAxisProps = { dataKey: "name", interval: 0 },
    yAxisProps = { domain: [0, 100], tickFormatter: (v) => `${v}%` },
    tooltipProps = { formatter: (v) => `${v}%` },
    lineProps = { dataKey: "porcentaje", stroke: "#82ca9d", strokeWidth: 2, dot: { r: 3 } }
}) => {
     return (
    <div role={rol}>
      <LineChart width={ancho} height={alto} data={datos} margin={margen}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip {...tooltipProps} />
        <Legend />
        <Line type="monotone" {...lineProps} />
      </LineChart>
    </div>
  );
};


export default GastosChef;
