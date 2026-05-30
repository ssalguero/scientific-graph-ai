"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { evaluate } from "mathjs";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [expression, setExpression] = useState("");
  const [graphs, setGraphs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [minX, setMinX] = useState(-10);
  const [maxX, setMaxX] = useState(10);

  const generateGraph = () => {
    try {
      const points = [];
    
      for (let x = minX; x <= maxX; x += 0.5) {
        const y = evaluate(expression, { x });
    
        points.push({
          x,
          y,
        });
      }
    
      setChartData(points);
      setErrorMessage("");
    } catch (error) {
      console.error("Error al generar gráfico:", error);
    
      setErrorMessage(
        "La expresión matemática es inválida."
      );
    }
  };

  const loadGraphs = async () => {
    const { data, error } = await supabase
      .from("graphs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGraphs(data);
    }
  };

  const saveGraph = async () => {
    if (!expression.trim()) return;
  
    const { data: existing } = await supabase
      .from("graphs")
      .select("id")
      .eq("expression", expression)
      .limit(1);
  
    if (existing && existing.length > 0) {
      alert("Ese gráfico ya está guardado");
      return;
    }
  
    const { error } = await supabase
      .from("graphs")
      .insert([
        {
          title: expression,
          expression: expression,
        },
      ]);
  
    if (!error) {
      loadGraphs();
    }
  };
  const loadGraph = (expr: string) => {
    setExpression(expr);
  
    try {
      const points = [];
  
      for (let x = minX; x <= maxX; x += 0.5) {
        const y = evaluate(expr, { x });
  
        points.push({
          x,
          y,
        });
      }
  
      setChartData(points);
    } catch (error) {
      console.error(error);
    }
  };
  const deleteGraph = async (id: string) => {
    const confirmDelete = confirm(
      "¿Eliminar este gráfico?"
    );
  
    if (!confirmDelete) return;
  
    const { error } = await supabase
      .from("graphs")
      .delete()
      .eq("id", id);
  
    if (!error) {
      loadGraphs();
    }
  };
  useEffect(() => {
    loadGraphs();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <h1 className="text-5xl font-bold mb-8">
        Scientific Graph AI 🚀
      </h1>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={expression}
          onChange={(e) => {
            setExpression(e.target.value);
            setErrorMessage("");
          }}
          placeholder="Ej: x^2 + 3*x + 1"
          className="border p-2 rounded w-80 text-black"
        />

        <button
          onClick={generateGraph}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Graficar
        </button>

        <button
          onClick={saveGraph}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </div>
      {errorMessage && (
          <p className="text-red-600 mb-4 font-medium">
            ❌ {errorMessage}
          </p>
      )}

      <div className="w-full max-w-4xl h-[400px] mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#2563eb"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">
          Gráficos guardados
        </h2>

        {graphs.map((graph) => (
          <div
            key={graph.id}
            className="border p-3 rounded mb-2 flex justify-between items-center"
          >
          <span
            onClick={() => loadGraph(graph.expression)}
            className="cursor-pointer flex-1"
          >
            {graph.expression}
          </span>

          <button
            onClick={() => deleteGraph(graph.id)}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            🗑️
          </button>
          </div>
        ))}
        <div className="flex gap-2 mb-8">
          <input
            type="number"
            value={minX}
            onChange={(e) => setMinX(Number(e.target.value))}
            className="border p-2 rounded w-32 text-black"
            placeholder="Desde"
          />

          <input
            type="number"
            value={maxX}
            onChange={(e) => setMaxX(Number(e.target.value))}
            className="border p-2 rounded w-32 text-black"
            placeholder="Hasta"
          />
        </div>
      </div>
    </main>
  );
}
