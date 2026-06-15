// Validates computeCriticalTValue (table interpolation, α=0.05 bilateral IC95%)
const EFFECT_SIZE_ALPHA = 0.05;

const T_CRITICAL_95_TABLE = [
  [1, 12.706],
  [2, 4.303],
  [3, 3.182],
  [4, 2.776],
  [5, 2.571],
  [6, 2.447],
  [7, 2.365],
  [8, 2.306],
  [9, 2.262],
  [10, 2.228],
  [11, 2.201],
  [12, 2.179],
  [13, 2.16],
  [14, 2.145],
  [15, 2.131],
  [16, 2.12],
  [17, 2.11],
  [18, 2.101],
  [19, 2.093],
  [20, 2.086],
  [25, 2.06],
  [30, 2.042],
  [40, 2.021],
  [60, 2.0],
  [120, 1.98],
  [Infinity, 1.96],
];

const interpolateCriticalTFromTable = (degreesOfFreedom) => {
  if (degreesOfFreedom <= 0) return Number.NaN;
  if (degreesOfFreedom <= T_CRITICAL_95_TABLE[0][0]) {
    return T_CRITICAL_95_TABLE[0][1];
  }

  for (let index = 1; index < T_CRITICAL_95_TABLE.length; index += 1) {
    const [upperDf, upperT] = T_CRITICAL_95_TABLE[index];
    const [lowerDf, lowerT] = T_CRITICAL_95_TABLE[index - 1];
    if (degreesOfFreedom <= upperDf) {
      if (!Number.isFinite(upperDf)) return upperT;
      const weight = (degreesOfFreedom - lowerDf) / (upperDf - lowerDf);
      return lowerT + weight * (upperT - lowerT);
    }
  }

  return T_CRITICAL_95_TABLE[T_CRITICAL_95_TABLE.length - 1][1];
};

const computeCriticalTValue = (alpha, degreesOfFreedom) => {
  if (degreesOfFreedom <= 0 || alpha <= 0 || alpha >= 1) return Number.NaN;
  if (Math.abs(alpha - EFFECT_SIZE_ALPHA) > 1e-12) return Number.NaN;
  return interpolateCriticalTFromTable(degreesOfFreedom);
};

const expected = { 10: 2.228, 18: 2.101, 30: 2.042 };
let allPass = true;
for (const [df, exp] of Object.entries(expected)) {
  const got = computeCriticalTValue(EFFECT_SIZE_ALPHA, Number(df));
  const diff = Math.abs(got - exp);
  const pass = diff < 0.01;
  if (!pass) allPass = false;
  console.log(
    `df=${df}: got=${got.toFixed(4)}, expected≈${exp}, diff=${diff.toFixed(4)} → ${pass ? "PASS" : "FAIL"}`
  );
}
console.log(`\nOverall: ${allPass ? "PASS" : "FAIL"}`);
process.exit(allPass ? 0 : 1);
