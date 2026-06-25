import { renderToStaticMarkup } from "react-dom/server";

import type { ExperimentalSeries } from "../src/lib/experimentalData";
import { VisualGraphBuilder } from "../src/components/graph-builder/VisualGraphBuilder";

const control1: ExperimentalSeries = {
  id: "control1",
  name: "Control1",
  color: "#3b82f6",
  points: [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 30 },
  ],
};

const tratamiento1: ExperimentalSeries = {
  id: "tratamiento1",
  name: "Tratamiento1",
  color: "#ef4444",
  points: [
    { x: 1, y: 30 },
    { x: 2, y: 40 },
    { x: 3, y: 50 },
  ],
};

const stubProps = {
  series: [control1, tratamiento1],
  onCreateGraph: () => {},
  btnOutlineSm: "btn-outline-sm",
  btnPrimary: "btn-primary",
  inputField: "input-field",
  fieldLabel: "field-label",
  dataEmptyState: "data-empty-state",
  soonBadgeClassName: "soon-badge",
};

const markup = renderToStaticMarkup(<VisualGraphBuilder {...stubProps} />);

const hasCreateGraphLabel = markup.includes("Crear gráfico");
const hasCreateGraphTestId = markup.includes('data-testid="create-graph-button"');

const summary = {
  phase: "visual-graph-builder-render-unit",
  pass: hasCreateGraphLabel && hasCreateGraphTestId,
  checks: {
    label: hasCreateGraphLabel,
    testId: hasCreateGraphTestId,
  },
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
