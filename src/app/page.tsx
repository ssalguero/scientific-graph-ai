"use client";

import { useEffect, useRef, useState } from "react";
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

const card =
  "bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8";
const inputField =
  "w-full border border-slate-200 rounded-lg px-4 py-3 text-base text-slate-900 bg-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";
const btnPrimary =
  "inline-flex items-center justify-center font-semibold text-white text-base px-7 py-3 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-[0.98]";
const btnColor =
  "flex-1 min-w-[5rem] font-semibold text-base text-white px-4 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]";
const btnOutline =
  "border border-slate-200 bg-white px-4 py-2 rounded-lg text-base text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow";
const btnIcon =
  "inline-flex items-center justify-center text-white text-lg px-4 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-[0.98]";
const sectionTitle =
  "text-sm sm:text-base font-semibold uppercase tracking-wider text-slate-500 mb-5";

const SECOND_CURVE_COLOR = "#334155";

export default function Home() {
  const [title, setTitle] = useState("");
  const [curves, setCurves] = useState<Array<{ id: number; expression: string }>>(
    [{ id: 1, expression: "" }]
  );
  const [graphs, setGraphs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [color, setColor] = useState("blue");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  const [minX, setMinX] = useState(-10);
  const [maxX, setMaxX] = useState(10);

  const nextCurveIdRef = useRef(2);
  const expression = curves[0]?.expression ?? "";

  const CURVE_COLORS = [
    SECOND_CURVE_COLOR,
    "#4f46e5", // indigo-600
    "#16a34a", // green-600
    "#db2777", // pink-600
    "#f59e0b", // amber-500
    "#0891b2", // cyan-600
  ];

  const getCurveColor = (index: number) => {
    if (index === 0) return color;
    return CURVE_COLORS[(index - 1) % CURVE_COLORS.length];
  };

  const addCurve = () => {
    const id = nextCurveIdRef.current++;
    setCurves((prev) => [...prev, { id, expression: "" }]);
  };

  const removeCurve = (id: number) => {
    setCurves((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((c) => c.id !== id);
    });
  };

  const updateCurveExpression = (id: number, value: string) => {
    setCurves((prev) =>
      prev.map((c) => (c.id === id ? { ...c, expression: value } : c))
    );
  };

  const resetToSingleCurve = (expr: string) => {
    nextCurveIdRef.current = 2;
    setCurves([{ id: 1, expression: expr }]);
  };

  const generateGraph = () => {
    try {
      const points = [];
      const activeCurves = curves
        .map((c, idx) => ({ idx, expression: c.expression.trim() }))
        .filter((c) => c.expression.length > 0);

      for (let x = minX; x <= maxX; x += 0.5) {
        const point: Record<string, number> = { x };
        for (const curve of activeCurves) {
          point[`y${curve.idx + 1}`] = evaluate(curve.expression, { x });
        }

        points.push(point);
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
      resetToSingleCurve(expr);

      const points = [];

      for (let x = minX; x <= maxX; x += 0.5) {
        const y = evaluate(expr, { x });

        points.push({
          x,
          y1: y,
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
    const graphPayload = {
      title: graphTitle,
      expression: expression,
      curves: curves.map((c) => ({ expression: c.expression })),
      color: color,
      min_x: minX,
      max_x: maxX,
    };

    if (selectedGraphId) {
      const { data: existing } = await supabase
        .from("graphs")
        .select("id")
        .eq("expression", expression)
        .neq("id", selectedGraphId)
        .limit(1);

      if (existing && existing.length > 0) {
        alert("Ese gráfico ya está guardado");
        return;
      }

      const { error } = await supabase
        .from("graphs")
        .update(graphPayload)
        .eq("id", selectedGraphId);

      if (!error) {
        generateGraph();
        loadGraphs();
      }
      return;
    }

    const { data: existing } = await supabase
      .from("graphs")
      .select("id")
      .eq("expression", expression)
      .limit(1);

    if (existing && existing.length > 0) {
      alert("Ese gráfico ya está guardado");
      return;
    }

    const { error } = await supabase.from("graphs").insert([graphPayload]);

    if (!error) {
      generateGraph();
      loadGraphs();
    }
  };

  const newGraph = () => {
    setSelectedGraphId(null);
    setTitle("");
    resetToSingleCurve("");
    setChartData([]);
    setErrorMessage("");
    setColor("blue");
    setMinX(-10);
    setMaxX(10);
  };

  const loadGraph = (graph: any) => {
    setSelectedGraphId(graph.id);
    setTitle(graph.title || graph.expression);
    const dbCurves = graph.curves;
    let nextCurves: Array<{ id: number; expression: string }> = [
      { id: 1, expression: graph.expression ?? "" },
    ];

    if (Array.isArray(dbCurves) && dbCurves.length > 0) {
      nextCurves = dbCurves.map((c: any, idx: number) => {
        if (typeof c === "string") return { id: idx + 1, expression: c };
        return { id: idx + 1, expression: String(c?.expression ?? "") };
      });
    }

    nextCurveIdRef.current = nextCurves.length + 1;
    setCurves(nextCurves);
    setColor(graph.color || "blue");
    setMinX(Number(graph.min_x ?? -10));
    setMaxX(Number(graph.max_x ?? 10));

    try {
      const points = [];
      const activeCurves = nextCurves
        .map((c, idx) => ({ idx, expression: c.expression.trim() }))
        .filter((c) => c.expression.length > 0);

      for (let x = Number(graph.min_x ?? -10); x <= Number(graph.max_x ?? 10); x += 0.5) {
        const point: Record<string, number> = { x };
        for (const curve of activeCurves) {
          point[`y${curve.idx + 1}`] = evaluate(curve.expression, { x });
        }
        points.push(point);
      }

      setChartData(points);
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage("La expresión matemática es inválida.");
    }
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

  const isEditing = selectedGraphId !== null;
  const activeCurves = curves
    .map((c, idx) => ({ idx, expression: c.expression.trim() }))
    .filter((c) => c.expression.length > 0);

  useEffect(() => {
    loadGraphs();
  }, []);

  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-slate-50">
      <aside className="w-full lg:w-[280px] lg:min-h-screen shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Gráficos
          </h2>
          <p className="text-base text-slate-500 mt-1">
            {graphs.length}{" "}
            {graphs.length === 1 ? "gráfico guardado" : "gráficos guardados"}
          </p>
        </div>

        <div className="p-5">
          <button
            onClick={newGraph}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 ${btnPrimary} py-3.5 text-base font-semibold mb-6`}
          >
            + Nuevo gráfico
          </button>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {graphs.map((graph) => (
              <button
                key={graph.id}
                onClick={() => loadGraph(graph)}
                className={`w-full text-left border rounded-lg px-3 py-3.5 text-base transition-all ${
                  selectedGraphId === graph.id
                    ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500/20 font-medium"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <span className="line-clamp-2">
                  {getGraphDisplayTitle(graph)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 lg:py-10 space-y-8 lg:space-y-12">
          <header>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-slate-900 tracking-tight">
              Scientific Graph AI
            </h1>
            <p className="text-slate-500 mt-3 text-lg sm:text-xl">
              Visualiza, guarda y gestiona tus funciones matemáticas
            </p>
          </header>

          <section>
            <h2 className={sectionTitle}>Panel de control</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
              <div className={`${card} lg:col-span-6 xl:col-span-7 flex flex-col gap-6`}>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg xl:text-xl font-semibold text-slate-900">
                      Información del gráfico
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        isEditing
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isEditing ? "Editando gráfico" : "Nuevo gráfico"}
                    </span>
                  </div>
                  <p className="text-base text-slate-500 mt-2">
                    Define título y expresión matemática
                  </p>
                </div>

                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-base font-medium text-slate-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Parábola cuadrática"
                      className={inputField}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-medium text-slate-700">
                      Curvas
                    </p>
                    <button
                      type="button"
                      onClick={addCurve}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      + Agregar curva
                    </button>
                  </div>

                  <div className="space-y-4">
                    {curves.map((curve, idx) => (
                      <div key={curve.id}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <label className="block text-base font-medium text-slate-700">
                            Expresión {idx + 1}
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                              <span
                                className="inline-block w-5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: getCurveColor(idx) }}
                              />
                              Color
                            </span>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => removeCurve(curve.id)}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                                title="Eliminar curva"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={curve.expression}
                          onChange={(e) => {
                            updateCurveExpression(curve.id, e.target.value);
                            setErrorMessage("");
                          }}
                          placeholder={
                            idx === 0 ? "Ej: x^2 + 3*x + 1" : "Ej: sin(x)"
                          }
                          className={inputField}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
                  <button
                    onClick={generateGraph}
                    className={`bg-emerald-600 hover:bg-emerald-700 ${btnPrimary} sm:min-w-[160px]`}
                  >
                    Graficar
                  </button>
                  <button
                    onClick={saveGraph}
                    className={`bg-blue-600 hover:bg-blue-700 ${btnPrimary} sm:min-w-[160px]`}
                  >
                    {isEditing ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </div>

              <div className={`${card} lg:col-span-3 flex flex-col gap-6`}>
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-slate-900">
                    Apariencia
                  </h3>
                  <p className="text-base text-slate-500 mt-2">
                    Selecciona el color de la curva 1
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 flex-1 content-start">
                  <button
                    onClick={() => setColor("blue")}
                    className={`bg-blue-500 hover:bg-blue-600 ${btnColor} ${
                      color === "blue"
                        ? "ring-2 ring-blue-600 ring-offset-2"
                        : ""
                    }`}
                  >
                    Azul
                  </button>
                  <button
                    onClick={() => setColor("red")}
                    className={`bg-red-500 hover:bg-red-600 ${btnColor} ${
                      color === "red"
                        ? "ring-2 ring-red-600 ring-offset-2"
                        : ""
                    }`}
                  >
                    Rojo
                  </button>
                  <button
                    onClick={() => setColor("green")}
                    className={`bg-emerald-500 hover:bg-emerald-600 ${btnColor} ${
                      color === "green"
                        ? "ring-2 ring-emerald-600 ring-offset-2"
                        : ""
                    }`}
                  >
                    Verde
                  </button>
                  <button
                    onClick={() => setColor("purple")}
                    className={`bg-purple-500 hover:bg-purple-600 ${btnColor} ${
                      color === "purple"
                        ? "ring-2 ring-purple-600 ring-offset-2"
                        : ""
                    }`}
                  >
                    Violeta
                  </button>
                </div>
              </div>

              <div className={`${card} lg:col-span-3 flex flex-col gap-6`}>
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-slate-900">
                    Rango
                  </h3>
                  <p className="text-base text-slate-500 mt-2">
                    Define el intervalo del eje X
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5 flex-1 content-start">
                  <div>
                    <label className="block text-base font-medium text-slate-700 mb-2">
                      Min X
                    </label>
                    <input
                      type="number"
                      value={minX}
                      onChange={(e) => setMinX(Number(e.target.value))}
                      placeholder="Desde"
                      className={inputField}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-slate-700 mb-2">
                      Max X
                    </label>
                    <input
                      type="number"
                      value={maxX}
                      onChange={(e) => setMaxX(Number(e.target.value))}
                      placeholder="Hasta"
                      className={inputField}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-base font-medium">
              {errorMessage}
            </div>
          )}

          <section>
            <h2 className={sectionTitle}>Visualización</h2>
            <div className={`${card} p-5 sm:p-6 lg:p-8 w-full`}>
              {activeCurves.length > 0 && (
                <div className="flex flex-wrap gap-5 mb-5 pb-5 border-b border-slate-100">
                  {activeCurves.map((curve) => (
                    <div key={curve.idx} className="flex items-center gap-2.5">
                      <span
                        className="inline-block w-5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: getCurveColor(curve.idx) }}
                      />
                      <span className="text-sm font-mono text-slate-700">
                        {curve.expression}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="w-full min-h-[600px] h-[600px] sm:h-[650px] lg:h-[700px] max-h-[700px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="x" stroke="#64748b" fontSize={14} />
                    <YAxis stroke="#64748b" fontSize={14} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "0.5rem",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                      }}
                    />
                    {activeCurves.map((curve) => (
                      <Line
                        key={curve.idx}
                        type="monotone"
                        dataKey={`y${curve.idx + 1}`}
                        stroke={getCurveColor(curve.idx)}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className={`${card}`}>
            <h3 className="text-lg xl:text-xl font-semibold text-slate-900 mb-2">
              Ejemplos matemáticos
            </h3>
            <p className="text-base text-slate-500 mb-5">
              Haz clic para cargar una expresión de ejemplo
            </p>

            <div className="flex flex-wrap gap-3">
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
          </section>

          <section>
            <h2 className={sectionTitle}>Detalles del gráfico</h2>

            {graphs.length === 0 && (
              <div className={`${card} text-center py-12`}>
                <p className="text-slate-500 text-lg">
                  No hay gráficos guardados aún.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              {graphs.map((graph) => (
                <div key={graph.id} className={card}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
                    <dl className="space-y-4 flex-1 min-w-0">
                      <div>
                        <dt className="text-sm font-medium uppercase tracking-wide text-slate-400">
                          Título
                        </dt>
                        <dd className="text-lg font-semibold text-slate-900 mt-1 truncate">
                          {getGraphDisplayTitle(graph)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium uppercase tracking-wide text-slate-400">
                          Expresión
                        </dt>
                        <dd className="text-base text-slate-700 mt-1 font-mono bg-slate-50 rounded-md px-3 py-1.5 inline-block max-w-full break-all">
                          {graph.expression}
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-x-10 gap-y-4">
                        <div>
                          <dt className="text-sm font-medium uppercase tracking-wide text-slate-400">
                            Color
                          </dt>
                          <dd className="text-base text-slate-700 mt-1">
                            {graph.color === "blue" && "🔵 "}
                            {graph.color === "red" && "🔴 "}
                            {graph.color === "green" && "🟢 "}
                            {graph.color === "purple" && "🟣 "}
                            {COLOR_LABELS[graph.color] || graph.color}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium uppercase tracking-wide text-slate-400">
                            Rango X
                          </dt>
                          <dd className="text-base text-slate-700 mt-1">
                            {graph.min_x} → {graph.max_x}
                          </dd>
                        </div>
                      </div>
                    </dl>

                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => loadGraph(graph)}
                        className={`bg-blue-600 hover:bg-blue-700 ${btnIcon}`}
                        title="Cargar gráfico"
                      >
                        📈
                      </button>

                      <button
                        onClick={() => deleteGraph(graph.id)}
                        className={`bg-red-600 hover:bg-red-700 ${btnIcon}`}
                        title="Eliminar gráfico"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
