const logGamma = (value: number): number => {
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.984369578019571e-6, 1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return (
      Math.log(Math.PI / Math.sin(Math.PI * value)) - logGamma(1 - value)
    );
  }

  let z = value - 1;
  let sum = coefficients[0];
  for (let index = 1; index < 9; index += 1) {
    sum += coefficients[index] / (z + index);
  }

  const t = z + 7.5;
  return (
    0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(sum)
  );
};

// Fracción continua de la beta incompleta (método de Lentz modificado).
const betacf = (a: number, b: number, x: number): number => {
  const maxIterations = 200;
  const epsilon = 3e-12;
  const floor = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < floor) d = floor;
  d = 1 / d;
  let h = d;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const twoIteration = 2 * iteration;
    let coefficient =
      (iteration * (b - iteration) * x) /
      ((qam + twoIteration) * (a + twoIteration));
    d = 1 + coefficient * d;
    if (Math.abs(d) < floor) d = floor;
    c = 1 + coefficient / c;
    if (Math.abs(c) < floor) c = floor;
    d = 1 / d;
    h *= d * c;

    coefficient =
      (-(a + iteration) * (qab + iteration) * x) /
      ((a + twoIteration) * (qap + twoIteration));
    d = 1 + coefficient * d;
    if (Math.abs(d) < floor) d = floor;
    c = 1 + coefficient / c;
    if (Math.abs(c) < floor) c = floor;
    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) < epsilon) break;
  }

  return h;
};

const regularizedIncompleteBeta = (
  a: number,
  b: number,
  x: number
): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const lnBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;

  if (x < (a + 1) / (a + b + 2)) {
    return front * betacf(a, b, x);
  }

  return (
    1 -
    (Math.exp(Math.log(1 - x) * b + Math.log(x) * a - lnBeta) / b) *
      betacf(b, a, 1 - x)
  );
};

export const approximateTwoTailedTPValue = (
  tStatistic: number,
  degreesOfFreedom: number
): number => {
  if (!Number.isFinite(tStatistic) || degreesOfFreedom <= 0) {
    return Number.NaN;
  }

  const absoluteT = Math.abs(tStatistic);
  if (absoluteT === 0) return 1;

  const x = degreesOfFreedom / (degreesOfFreedom + absoluteT * absoluteT);
  return regularizedIncompleteBeta(degreesOfFreedom / 2, 0.5, x);
};

export const approximateUpperTailFPValue = (
  fStatistic: number,
  dfBetween: number,
  dfWithin: number
): number => {
  if (
    !Number.isFinite(fStatistic) ||
    fStatistic < 0 ||
    dfBetween <= 0 ||
    dfWithin <= 0
  ) {
    return Number.NaN;
  }

  if (fStatistic === 0) return 1;

  const x = (dfBetween * fStatistic) / (dfBetween * fStatistic + dfWithin);
  const cumulativeProbability = regularizedIncompleteBeta(
    dfBetween / 2,
    dfWithin / 2,
    x
  );

  return 1 - cumulativeProbability;
};

export const approximateStandardNormalCdf = (z: number): number => {
  const absoluteZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absoluteZ);
  const density = 0.3989423 * Math.exp((-absoluteZ * absoluteZ) / 2);
  const probability =
    density *
    t *
    (0.3193815 +
      t *
        (-0.3565638 +
          t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - probability : probability;
};

export const approximateTwoTailedNormalPValue = (zScore: number): number => {
  if (!Number.isFinite(zScore)) return Number.NaN;
  const absoluteZ = Math.abs(zScore);
  return 2 * (1 - approximateStandardNormalCdf(absoluteZ));
};

const regularizedLowerIncompleteGamma = (shape: number, x: number): number => {
  if (x <= 0) return 0;

  let term = 1 / shape;
  let sum = term;

  for (let index = 1; index < 200; index += 1) {
    term *= x / (shape + index);
    sum += term;
    if (Math.abs(term) < 1e-12 * Math.abs(sum)) break;
  }

  return Math.exp(-x + shape * Math.log(x) - logGamma(shape)) * sum;
};

export const approximateUpperTailChiSquarePValue = (
  chiSquare: number,
  degreesOfFreedom: number
): number => {
  if (!Number.isFinite(chiSquare) || chiSquare < 0 || degreesOfFreedom <= 0) {
    return Number.NaN;
  }

  const cumulativeProbability = regularizedLowerIncompleteGamma(
    degreesOfFreedom / 2,
    chiSquare / 2
  );

  return Math.max(0, Math.min(1, 1 - cumulativeProbability));
};
