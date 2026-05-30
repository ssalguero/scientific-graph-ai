"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [expression, setExpression] = useState("");
  const [graphs, setGraphs] = useState<any[]>([]);

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

    const { error } = await supabase
      .from("graphs")
      .insert([
        {
          title: expression,
          expression: expression,
        },
      ]);

    if (!error) {
      setExpression("");
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
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Ej: x^2 + 3x + 1"
          className="border p-2 rounded w-80 text-black"
        />

        <button
          onClick={saveGraph}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </div>

      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">
          Gráficos guardados
        </h2>

        {graphs.map((graph) => (
          <div
            key={graph.id}
            className="border p-3 rounded mb-2"
          >
            {graph.expression}
          </div>
        ))}
      </div>
    </main>
  );
}

