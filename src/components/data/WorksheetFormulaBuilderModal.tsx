"use client";

import { useEffect, useRef, useState } from "react";

import {
  FORMULA_BUILDER_FUNCTIONS,
  buildWorksheetFormulaVariables,
  type WorksheetFormulaVariable,
} from "@/lib/worksheetFormulaBuilder";

type WorksheetFormulaBuilderModalProps = {
  open: boolean;
  anchorColumnLabel: string;
  xColumnLabel: string;
  columns: Array<{ seriesId: string; label: string }>;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (columnLabel: string, expression: string) => void;
  btnOutlineSm: string;
  btnPrimary: string;
  inputField: string;
  fieldLabel: string;
};

export function WorksheetFormulaBuilderModal({
  open,
  anchorColumnLabel,
  xColumnLabel,
  columns,
  errorMessage,
  onClose,
  onSubmit,
  btnOutlineSm,
  btnPrimary,
  inputField,
  fieldLabel,
}: WorksheetFormulaBuilderModalProps) {
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const [columnLabel, setColumnLabel] = useState("");
  const [expression, setExpression] = useState("");

  const variables: WorksheetFormulaVariable[] = buildWorksheetFormulaVariables({
    xColumnLabel,
    columns,
    rows: [],
  });

  useEffect(() => {
    if (!open) return;
    setColumnLabel("");
    setExpression("");
    const timer = window.setTimeout(() => formulaRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open, anchorColumnLabel]);

  if (!open) return null;

  const insertToken = (token: string) => {
    const field = formulaRef.current;
    if (!field) {
      setExpression((previous) => `${previous}${token}`);
      return;
    }

    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? field.value.length;
    const nextValue = `${field.value.slice(0, start)}${token}${field.value.slice(end)}`;
    setExpression(nextValue);
    const cursor = start + token.length;
    window.requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(cursor, cursor);
    });
  };

  const handleSubmit = () => {
    onSubmit(columnLabel, expression);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="worksheet-formula-builder-title"
      >
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="worksheet-formula-builder-title"
                className="text-lg font-semibold text-[var(--app-heading)]"
              >
                Nueva columna derivada
              </h2>
              <p className="text-sm text-[var(--app-text-muted)]">
                Combine varias variables con expresiones matemáticas.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-auto px-5 py-4">
          <div>
            <label className={fieldLabel} htmlFor="formula-column-label">
              Nombre de la nueva variable
            </label>
            <input
              id="formula-column-label"
              type="text"
              value={columnLabel}
              onChange={(event) => setColumnLabel(event.target.value)}
              placeholder="Índice metabólico"
              className={inputField}
            />
          </div>

          <div>
            <label className={fieldLabel} htmlFor="formula-expression">
              Fórmula
            </label>
            <textarea
              id="formula-expression"
              ref={formulaRef}
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              placeholder="(Control1 + Tratamiento1) / 2"
              rows={4}
              className={`${inputField} font-mono text-sm`}
            />
            {errorMessage ? (
              <p className="mt-2 text-sm text-[var(--app-danger-text)]">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div>
            <p className={fieldLabel}>Variables disponibles</p>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <button
                  key={`${variable.kind}-${variable.seriesId}`}
                  type="button"
                  className={`${btnOutlineSm} font-mono text-xs`}
                  onClick={() => insertToken(variable.label)}
                >
                  {variable.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className={fieldLabel}>Funciones disponibles</p>
            <div className="flex flex-wrap gap-2">
              {FORMULA_BUILDER_FUNCTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`${btnOutlineSm} font-mono text-xs`}
                  onClick={() => insertToken(`${name}()`)}
                >
                  {name}()
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--app-text-muted)]">
              Operadores: + − × / ^ ( ). V2: condicionales, estadísticas por
              fila y funciones sobre columnas completas.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--app-border)] px-5 py-4">
          <button type="button" className={btnOutlineSm} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={btnPrimary}
            onClick={handleSubmit}
            disabled={!columnLabel.trim() || !expression.trim()}
          >
            Crear columna
          </button>
        </div>
      </div>
    </div>
  );
}
