import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
//import { chartData } from "../assets/data";

export const Chart = ({data}) => {
  return (
    <ResponsiveContainer width={"100%"} height={300}>
      <BarChart width={130} height={20} data={data}>
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid strokeDasharray='3 3' />
        <Bar dataKey='total' fill='#C70039' />
      </BarChart>
    </ResponsiveContainer>
  );
};
