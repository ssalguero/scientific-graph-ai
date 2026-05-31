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

const COLOR_LABELS: Record<string, string> = {
  blue: "Azul",
  red: "Rojo",
  green: "Verde",
  purple: "Violeta",
};

const btnPrimary =
  "text-white px-4 py-2 rounded transition-colors hover:opacity-90";
const btnColor =
  "text-white px-3 py-1 rounded transition-colors hover:opacity-90";
const btnOutline =
  "border px-2 py-1 rounded transition-colors hover:bg-gray-100";
const btnIcon =
  "text-white px-3 py-1 rounded transition-colors hover:opacity-90";

export default function Home() {
  const [title, setTitle] = useState("");
  const [expression, setExpression] = useState("");
  const [graphs, setGraphs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [color, setColor] = useState("blue");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

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

      setErrorMessage("La expresión matemática es inválida.");
    }
  };

  const graphExpression = (expr: string) => {
    try {
      setExpression(expr);

      const points = [];

      for (let x = minX; x <= maxX; x += 0.5) {
        const y = evaluate(expr, { x });

        points.push({
          x,
          y,
        });
      }

      setChartData(points);
      setErrorMessage("");
    } catch (error) {
      console.error(error);

      setErrorMessage("La expresión matemática es inválida.");
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

    const graphTitle = title.trim() || expression;

    const { data: existing } = await supabase
      .from("graphs")
      .select("id")
      .eq("expression", expression)
      .limit(1);

    if (existing && existing.length > 0) {
      alert("Ese gráfico ya está guardado");
      return;
    }

    const { error } = await supabase.from("graphs").insert([
      {
        title: graphTitle,
        expression: expression,
        color: color,
        min_x: minX,
        max_x: maxX,
      },
    ]);

    if (!error) {
      loadGraphs();
    }
  };

  const newGraph = () => {
    setSelectedGraphId(null);
    setTitle("");
    setExpression("");
    setChartData([]);
    setErrorMessage("");
    setColor("blue");
    setMinX(-10);
    setMaxX(10);
  };

  const loadGraph = (graph: any) => {
    setSelectedGraphId(graph.id);
    setTitle(graph.title || graph.expression);
    setExpression(graph.expression);
    setColor(graph.color || "blue");
    setMinX(Number(graph.min_x ?? -10));
    setMaxX(Number(graph.max_x ?? 10));
    graphExpression(graph.expression);
  };

  const deleteGraph = async (id: string) => {
    const confirmDelete = confirm("¿Eliminar este gráfico?");

    if (!confirmDelete) return;

    const { error } = await supabase.from("graphs").delete().eq("id", id);

    if (!error) {
      if (selectedGraphId === id) {
        newGraph();
      }
      loadGraphs();
    }
  };

  const getGraphDisplayTitle = (graph: any) =>
    graph.title?.trim() || graph.expression;

  useEffect(() => {
    loadGraphs();
  }, []);

  return (
    <main className="flex min-h-screen">
      <div className="w-72 border-r p-4">
        <h2 className="text-xl font-bold mb-1">Gráficos</h2>
        <p className="text-sm text-gray-500 mb-6">
          {graphs.length}{" "}
          {graphs.length === 1 ? "gráfico guardado" : "gráficos guardados"}
        </p>

        <button
          onClick={newGraph}
          className={`w-full bg-green-600 ${btnPrimary} mb-6`}
        >
          + Nuevo
        </button>

        {graphs.map((graph) => (
          <button
            key={graph.id}
            onClick={() => loadGraph(graph)}
            className={`w-full text-left border p-2 rounded mb-2 transition-colors hover:bg-gray-100 ${
              selectedGraphId === graph.id
                ? "bg-blue-100 border-blue-500"
                : ""
            }`}
          >
            {getGraphDisplayTitle(graph)}
          </button>
        ))}
      </div>

      <div className="flex-1 p-10 overflow-auto">
        <h1 className="text-5xl font-bold mb-10">Scientific Graph AI 🚀</h1>

        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Parábola cuadrática"
              className="border p-2 rounded w-80 text-black"
            />
          </div>

          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Expresión
              </label>
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
            </div>
            <button
              onClick={generateGraph}
              className={`bg-green-600 ${btnPrimary}`}
            >
              Graficar
            </button>
            <button
              onClick={saveGraph}
              className={`bg-blue-600 ${btnPrimary}`}
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setColor("blue")}
            className={`bg-blue-500 ${btnColor}`}
          >
            Azul
          </button>
          <button
            onClick={() => setColor("red")}
            className={`bg-red-500 ${btnColor}`}
          >
            Rojo
          </button>
          <button
            onClick={() => setColor("green")}
            className={`bg-green-500 ${btnColor}`}
          >
            Verde
          </button>
          <button
            onClick={() => setColor("purple")}
            className={`bg-purple-500 ${btnColor}`}
          >
            Violeta
          </button>
        </div>

        <div className="mb-8">
          <p className="font-semibold mb-2">Rango X</p>

          <div className="flex gap-2">
            <input
              type="number"
              value={minX}
              onChange={(e) => setMinX(Number(e.target.value))}
              placeholder="Desde"
              className="border p-2 rounded w-24 text-black"
            />
            <input
              type="number"
              value={maxX}
              onChange={(e) => setMaxX(Number(e.target.value))}
              placeholder="Hasta"
              className="border p-2 rounded w-24 text-black"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-600 mb-6 font-medium">❌ {errorMessage}</p>
        )}

        <div className="text-sm text-gray-600 mb-8">
          <p className="font-semibold mb-3">Ejemplos:</p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => graphExpression("x^2")}
              className={btnOutline}
            >
              x²
            </button>

            <button
              onClick={() => graphExpression("x^3")}
              className={btnOutline}
            >
              x³
            </button>

            <button
              onClick={() => graphExpression("sin(x)")}
              className={btnOutline}
            >
              sin(x)
            </button>

            <button
              onClick={() => graphExpression("cos(x)")}
              className={btnOutline}
            >
              cos(x)
            </button>

            <button
              onClick={() => graphExpression("tan(x)")}
              className={btnOutline}
            >
              tan(x)
            </button>

            <button
              onClick={() => graphExpression("sqrt(abs(x))")}
              className={btnOutline}
            >
              sqrt(abs(x))
            </button>

            <button
              onClick={() => graphExpression("log(x)")}
              className={btnOutline}
            >
              log(x)
            </button>

            <button
              onClick={() => graphExpression("exp(x)")}
              className={btnOutline}
            >
              exp(x)
            </button>
          </div>
        </div>

        <div className="w-full h-[600px] mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="y"
                stroke={color}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6">Detalles del gráfico</h2>

          {graphs.length === 0 && (
            <p className="text-gray-500">No hay gráficos guardados aún.</p>
          )}

          {graphs.map((graph) => (
            <div key={graph.id} className="border p-4 rounded mb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Título: </span>
                    {getGraphDisplayTitle(graph)}
                  </p>
                  <p>
                    <span className="font-semibold">Expresión: </span>
                    {graph.expression}
                  </p>
                  <p>
                    <span className="font-semibold">Color: </span>
                    {graph.color === "blue" && "🔵 "}
                    {graph.color === "red" && "🔴 "}
                    {graph.color === "green" && "🟢 "}
                    {graph.color === "purple" && "🟣 "}
                    {COLOR_LABELS[graph.color] || graph.color}
                  </p>
                  <p>
                    <span className="font-semibold">Rango X: </span>
                    {graph.min_x} → {graph.max_x}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => loadGraph(graph)}
                    className={`bg-blue-600 ${btnIcon}`}
                  >
                    📈
                  </button>

                  <button
                    onClick={() => deleteGraph(graph.id)}
                    className={`bg-red-600 ${btnIcon}`}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
