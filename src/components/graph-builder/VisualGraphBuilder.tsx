"use client";

import { useEffect, useMemo, useState } from "react";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  seriesToWorksheet,
  type WorksheetColumnRegistry,
} from "@/lib/experimentalWorksheet";
import {
  applyVisualGraphSpecification,
  buildVisualGraphPreview,
  buildVisualGraphVariables,
  INITIAL_VISUAL_GRAPH_BUILDER_DRAFT,
  suggestDefaultYVariable,
  validateVisualGraphConfiguration,
  type GraphSpecification,
  type VisualGraphBuilderDraft,
  type VisualGraphPreview,
  type VisualGraphSpecification,
} from "@/lib/visualGraphBuilder";

import { GraphPreview } from "./GraphPreview";
import { GraphTypeSelector } from "./GraphTypeSelector";
import { VariableBadgeList, VariableSelector } from "./VariableSelector";

type VisualGraphBuilderProps = {
  series: ExperimentalSeries[];
  columnRegistry?: WorksheetColumnRegistry;
  onCreateGraph: (result: {
    graphSpec: GraphSpecification;
    preview: VisualGraphPreview;
    displaySeries: ExperimentalSeries[];
  }) => void;
  btnOutlineSm: string;
  btnPrimary: string;
  inputField: string;
  fieldLabel: string;
  dataEmptyState: string;
  soonBadgeClassName: string;
};

export function VisualGraphBuilder({
  series,
  columnRegistry = {},
  onCreateGraph,
  btnOutlineSm,
  btnPrimary,
  inputField,
  fieldLabel,
  dataEmptyState,
  soonBadgeClassName,
}: VisualGraphBuilderProps) {
  const model = useMemo(() => seriesToWorksheet(series), [series]);
  const variables = useMemo(
    () => buildVisualGraphVariables(model, columnRegistry),
    [model, columnRegistry]
  );

  const [spec, setSpec] = useState<VisualGraphBuilderDraft>(
    INITIAL_VISUAL_GRAPH_BUILDER_DRAFT
  );
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (
      spec.graphType === null ||
      spec.graphType === "heatmap" ||
      spec.graphType === "pca"
    ) {
      return;
    }
    const defaultY = suggestDefaultYVariable(variables);
    if (!defaultY) return;
    setSpec((previous) =>
      previous.yVariable ? previous : { ...previous, yVariable: defaultY }
    );
  }, [variables, spec.graphType]);

  const validation = useMemo(
    () => validateVisualGraphConfiguration(spec, model, columnRegistry),
    [spec, model, columnRegistry]
  );

  const preview = useMemo(() => {
    if (!validation.ok) {
      return null;
    }
    const result = buildVisualGraphPreview(spec, model, columnRegistry);
    return "error" in result ? null : result;
  }, [spec, model, columnRegistry, validation.ok]);

  const previewError = validation.ok ? null : validation.message;
  const canCreateGraph = validation.ok && preview !== null;

  const updateSpec = (patch: Partial<VisualGraphBuilderDraft>) => {
    setSpec((previous) => ({ ...previous, ...patch }));
    setCreateError(null);
  };

  const handleCreateGraph = () => {
    const result = applyVisualGraphSpecification(spec, series, columnRegistry);
    if (!result.ok) {
      setCreateError(result.message);
      return;
    }

    setCreateError(null);
    onCreateGraph({
      graphSpec: result.graphSpec,
      preview: result.preview,
      displaySeries: result.displaySeries,
    });
  };

  if (series.length === 0) {
    return (
      <p className={dataEmptyState}>
        Importe o edite datos en la Worksheet para usar el Constructor Visual.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_3fr]">
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
          <GraphTypeSelector
            value={spec.graphType}
            onChange={(graphType) => updateSpec({ graphType })}
            soonBadgeClassName={soonBadgeClassName}
          />

          {(spec.graphType === "scatter" ||
            spec.graphType === "line" ||
            spec.graphType === "bubble") && (
            <>
              <VariableSelector
                label="Variable X"
                value={spec.xVariable}
                variables={variables}
                onChange={(xVariable) => updateSpec({ xVariable })}
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
              />
              <VariableSelector
                label="Variable Y"
                value={spec.yVariable}
                variables={variables}
                onChange={(yVariable) => updateSpec({ yVariable })}
                requireNumeric
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
                errorMessage={
                  spec.graphType !== "bubble" &&
                  spec.yVariable &&
                  !variables.find((item) => item.seriesId === spec.yVariable)
                    ?.numericCompatible
                    ? "Variable no compatible con este gráfico."
                    : null
                }
              />
              {spec.graphType === "bubble" ? (
                <>
                  <VariableSelector
                    label="Variable de tamaño (opcional)"
                    value={spec.sizeVariable ?? null}
                    variables={variables}
                    onChange={(sizeVariable) => updateSpec({ sizeVariable })}
                    allowEmpty
                    requireNumeric
                    inputClassName={inputField}
                    fieldLabelClassName={fieldLabel}
                  />
                  <VariableSelector
                    label="Variable de grupo (opcional)"
                    value={spec.groupVariable}
                    variables={variables}
                    onChange={(groupVariable) => updateSpec({ groupVariable })}
                    allowEmpty
                    inputClassName={inputField}
                    fieldLabelClassName={fieldLabel}
                  />
                </>
              ) : null}
              {spec.graphType === "scatter" ? (
                <>
                  <VariableSelector
                    label="Variable de grupo (opcional)"
                    value={spec.groupVariable}
                    variables={variables}
                    onChange={(groupVariable) => updateSpec({ groupVariable })}
                    allowEmpty
                    inputClassName={inputField}
                    fieldLabelClassName={fieldLabel}
                  />
                  <div>
                    <label className={fieldLabel}>Color</label>
                    <input
                      type="color"
                      value={spec.color}
                      onChange={(event) =>
                        updateSpec({ color: event.target.value })
                      }
                      className="h-9 w-14 cursor-pointer rounded border border-[var(--app-border)] bg-[var(--app-surface)]"
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Tamaño puntos</label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={spec.markerSize}
                      onChange={(event) =>
                        updateSpec({
                          markerSize: Number(event.target.value) || 6,
                        })
                      }
                      className={inputField}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Marcadores</label>
                    <select
                      value={spec.marker}
                      onChange={(event) =>
                        updateSpec({
                          marker:
                            event.target.value as VisualGraphSpecification["marker"],
                        })
                      }
                      className={inputField}
                    >
                      <option value="none">Ninguno</option>
                      <option value="circle">Círculo</option>
                      <option value="square">Cuadrado</option>
                      <option value="diamond">Diamante</option>
                    </select>
                  </div>
                </>
              ) : spec.graphType === "line" ? (
                <>
                  <div>
                    <label className={fieldLabel}>Color</label>
                    <input
                      type="color"
                      value={spec.color}
                      onChange={(event) =>
                        updateSpec({ color: event.target.value })
                      }
                      className="h-9 w-14 cursor-pointer rounded border border-[var(--app-border)] bg-[var(--app-surface)]"
                    />
                  </div>
                  <>
                    <div>
                      <label className={fieldLabel}>Línea</label>
                      <select
                        value={spec.lineStyle}
                        onChange={(event) =>
                          updateSpec({
                            lineStyle:
                              event.target.value as VisualGraphSpecification["lineStyle"],
                          })
                        }
                        className={inputField}
                      >
                        <option value="solid">Sólida</option>
                        <option value="dashed">Discontinua</option>
                        <option value="dotted">Punteada</option>
                      </select>
                    </div>
                    <div>
                      <label className={fieldLabel}>Marcadores</label>
                      <select
                        value={spec.marker}
                        onChange={(event) =>
                          updateSpec({
                            marker:
                              event.target.value as VisualGraphSpecification["marker"],
                          })
                        }
                        className={inputField}
                      >
                        <option value="none">Ninguno</option>
                        <option value="circle">Círculo</option>
                        <option value="square">Cuadrado</option>
                        <option value="diamond">Diamante</option>
                      </select>
                    </div>
                  </>
                </>
              ) : null}
            </>
          )}

          {spec.graphType === "histogram" && (
            <>
              <VariableSelector
                label="Variable"
                value={spec.yVariable}
                variables={variables}
                onChange={(yVariable) => updateSpec({ yVariable })}
                requireNumeric
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
              />
              <div>
                <label className={fieldLabel}>Bins</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={spec.bins}
                  onChange={(event) =>
                    updateSpec({ bins: Number(event.target.value) || 10 })
                  }
                  className={inputField}
                />
              </div>
            </>
          )}

          {(spec.graphType === "bar" ||
            spec.graphType === "boxPlot" ||
            spec.graphType === "violin") && (
            <>
              <VariableSelector
                label={spec.graphType === "bar" ? "Categoría" : "Grupo"}
                value={spec.groupVariable}
                variables={variables}
                onChange={(groupVariable) => updateSpec({ groupVariable })}
                allowEmpty
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
              />
              <VariableSelector
                label="Valor"
                value={spec.yVariable}
                variables={variables}
                onChange={(yVariable) => updateSpec({ yVariable })}
                requireNumeric
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
              />
              {spec.graphType === "bar" ? (
                <div>
                  <label className={fieldLabel}>Error Bars</label>
                  <select
                    value={spec.errorBars}
                    onChange={(event) =>
                      updateSpec({
                        errorBars: event.target.value as VisualGraphSpecification["errorBars"],
                      })
                    }
                    className={inputField}
                  >
                    <option value="none">Ninguna</option>
                    <option value="sd">SD</option>
                    <option value="sem">SEM</option>
                    <option value="ci95">IC 95%</option>
                  </select>
                </div>
              ) : null}
            </>
          )}

          {spec.graphType === "heatmap" && (
            <>
              <p className="text-xs text-[var(--app-text-muted)]">
                Sin columnas X/Y se correlacionan todas las variables numéricas.
                Con ambas, se acota el subconjunto al rango en el worksheet.
              </p>
              <VariableSelector
                label="Columna X (opcional)"
                value={spec.xVariable}
                variables={variables}
                onChange={(xVariable) => updateSpec({ xVariable })}
                allowEmpty
                requireNumeric
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
              />
              <VariableSelector
                label="Columna Y (opcional)"
                value={spec.yVariable}
                variables={variables}
                onChange={(yVariable) => updateSpec({ yVariable })}
                allowEmpty
                requireNumeric
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
              />
              <VariableSelector
                label="Variable de color (opcional)"
                value={spec.colorVariable ?? null}
                variables={variables}
                onChange={(colorVariable) => updateSpec({ colorVariable })}
                allowEmpty
                requireNumeric
                inputClassName={inputField}
                fieldLabelClassName={fieldLabel}
                errorMessage={
                  spec.colorVariable &&
                  !variables.find((item) => item.seriesId === spec.colorVariable)
                    ?.numericCompatible
                    ? "Variable no compatible con este gráfico."
                    : null
                }
              />
            </>
          )}

          {spec.graphType === "pca" && (
            <>
              <div>
                <p className={fieldLabel}>Variables PCA</p>
                <p className="mb-2 text-xs text-[var(--app-text-muted)]">
                  Seleccione al menos 2 columnas numéricas para el análisis.
                </p>
                <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3">
                  {variables
                    .filter((variable) => variable.numericCompatible)
                    .map((variable) => {
                      const selected = (spec.pcaVariables ?? []).includes(
                        variable.seriesId
                      );

                      return (
                        <label
                          key={`${variable.kind}-${variable.seriesId}`}
                          className="flex cursor-pointer items-center gap-2 text-sm text-[var(--app-text)]"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              const current = spec.pcaVariables ?? [];
                              const next = selected
                                ? current.filter(
                                    (seriesId) => seriesId !== variable.seriesId
                                  )
                                : [...current, variable.seriesId];
                              updateSpec({ pcaVariables: next });
                            }}
                            className="rounded border-[var(--app-border)]"
                          />
                          <span>
                            {variable.label}
                            {variable.badges.includes("fx") ? "  ƒx" : ""}
                            {variable.badges.includes("transform") ? "  ⇄" : ""}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={spec.pcaStandardize ?? true}
                  onChange={(event) =>
                    updateSpec({ pcaStandardize: event.target.checked })
                  }
                  className="rounded border-[var(--app-border)]"
                />
                <span className={fieldLabel}>Estandarizar variables</span>
              </label>
            </>
          )}

          <div>
            <label className={fieldLabel}>Título (opcional)</label>
            <input
              type="text"
              value={spec.title ?? ""}
              onChange={(event) => updateSpec({ title: event.target.value })}
              placeholder="Gráfico experimental"
              className={inputField}
            />
          </div>

          <div>
            <p className={fieldLabel}>Variables disponibles</p>
            <VariableBadgeList variables={variables} />
          </div>

          {createError ? (
            <p className="text-sm text-[var(--app-danger-text)]">{createError}</p>
          ) : null}

          {!canCreateGraph && validation.ok === false ? (
            <p className="text-xs text-[var(--app-text-muted)]">
              Complete las variables requeridas para habilitar la creación.
            </p>
          ) : null}

          <div className="border-t border-[var(--app-border)] pt-4">
            <button
              type="button"
              data-testid="create-graph-button"
              className={`${btnPrimary} w-full bg-[var(--app-accent)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={handleCreateGraph}
              disabled={!canCreateGraph}
              aria-disabled={!canCreateGraph}
            >
              Crear gráfico
            </button>
          </div>
        </div>
      </div>

      <GraphPreview
        preview={preview}
        errorMessage={previewError}
        scatterStyle={
          spec.graphType === "scatter"
            ? {
                color: spec.color,
                markerSize: spec.markerSize,
                marker: spec.marker,
              }
            : null
        }
      />
    </div>
  );
}
