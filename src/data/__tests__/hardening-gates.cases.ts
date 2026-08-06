/**
 * DATA-I9 — Quality gate registry unit cases.
 */
import {
  DATA_QUALITY_GATE_COUNT,
  DATA_QUALITY_GATES,
  DataQualityGateId,
} from "../internal/quality-gates";

export type HardeningCaseResult = {
  id: string;
  pass: boolean;
  detail: string;
};

export async function runDataHardeningCaseSuite(): Promise<
  HardeningCaseResult[]
> {
  const results: HardeningCaseResult[] = [];
  const check = (id: string, pass: boolean, detail: string) => {
    results.push({ id, pass, detail });
  };

  check(
    "qg.count.nine",
    DATA_QUALITY_GATE_COUNT === 9,
    `count=${DATA_QUALITY_GATE_COUNT}`
  );

  check(
    "qg.ids.g1",
    DATA_QUALITY_GATES[0]?.id === DataQualityGateId.G1_Architecture,
    "G1 first"
  );

  check(
    "qg.ids.g9",
    DATA_QUALITY_GATES[8]?.id === DataQualityGateId.G9_Certification,
    "G9 last"
  );

  const ids = new Set(DATA_QUALITY_GATES.map((g) => g.id));
  check("qg.ids.unique", ids.size === 9, `unique=${ids.size}`);

  const scripts = new Set(DATA_QUALITY_GATES.map((g) => g.npmScript));
  check("qg.scripts.unique", scripts.size === 9, `scripts=${scripts.size}`);

  for (const gate of DATA_QUALITY_GATES) {
    check(
      `qg.${gate.id}.purpose`,
      gate.purpose.length > 10,
      gate.name
    );
    check(
      `qg.${gate.id}.criterion`,
      gate.p10Criterion.length > 10,
      "P10 criterion bound"
    );
  }

  return results;
}
