/**
 * SCI-37B-H1 — tie epsilon + competition ranking unit gate.
 * Mirrors src/app/page.tsx (VARIABLE_IMPORTANCE_TIE_EPSILON, areVariableImportanceScoresTied, rank loop).
 */

type CaseResult = { id: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];

const VARIABLE_IMPORTANCE_TIE_EPSILON = 1e-6;

const areVariableImportanceScoresTied = (left: number, right: number) =>
  Math.abs(left - right) <= VARIABLE_IMPORTANCE_TIE_EPSILON;

function assignCompetitionRanks(normalizedScores: number[]): number[] {
  const entries = normalizedScores.map((normalizedScore) => ({
    normalizedScore,
    rank: 0,
  }));

  entries.forEach((entry, index) => {
    const previous = entries[index - 1];
    entry.rank =
      previous &&
      areVariableImportanceScoresTied(
        entry.normalizedScore,
        previous.normalizedScore
      )
        ? previous.rank
        : index + 1;
  });

  return entries.map((entry) => entry.rank);
}

function countRankOne(ranks: number[]) {
  return ranks.filter((rank) => rank === 1).length;
}

function assertRanks(
  id: string,
  normalizedScores: number[],
  expectedRanks: number[]
) {
  const ranks = assignCompetitionRanks(normalizedScores);
  results.push({
    id,
    pass:
      ranks.length === expectedRanks.length &&
      ranks.every((rank, index) => rank === expectedRanks[index]),
    detail: ranks.join(","),
  });
}

function assertTopTie(
  id: string,
  normalizedScores: number[],
  expectTied: boolean
) {
  const ranks = assignCompetitionRanks(normalizedScores);
  const tiedTop = countRankOne(ranks) > 1;
  results.push({
    id,
    pass: tiedTop === expectTied,
    detail: `rank1Count=${countRankOne(ranks)} ranks=${ranks.join(",")}`,
  });
}

// Caso 1 — empate exacto
assertRanks("tie.exact", [100, 100, 90], [1, 1, 3]);

// Caso 2 — dentro de epsilon
assertRanks("tie.within-epsilon", [100, 100.0000005, 90], [1, 1, 3]);

// Caso 3 — fuera de epsilon
assertRanks("tie.above-epsilon", [100, 100.00001, 90], [1, 2, 3]);

// Caso 4 — múltiples co-líderes (competition ranking 1,1,1,4)
const multiLeaderRanks = assignCompetitionRanks([100, 100, 100, 50]);
results.push({
  id: "tie.multiple-co-leaders",
  pass:
    countRankOne(multiLeaderRanks) === 3 &&
    multiLeaderRanks[0] === 1 &&
    multiLeaderRanks[1] === 1 &&
    multiLeaderRanks[2] === 1 &&
    multiLeaderRanks[3] === 4,
  detail: multiLeaderRanks.join(","),
});

// Caso 5 — control negativo (líder único)
assertTopTie("tie.single-leader", [100, 80, 60], false);

// Precheck Dataset5 — gap artificial Tratamiento2 vs Control1 (~3.96e-5) no debe empatar
assertTopTie("dataset5.no-artificial-top-tie", [100, 99.99996, 99.598, 99.598], false);

// Precheck Dataset6 — líder único estable
assertTopTie("dataset6.single-leader", [100, 96.341463, 96.341463, 0], false);

results.push({
  id: "epsilon.value",
  pass: VARIABLE_IMPORTANCE_TIE_EPSILON === 1e-6,
  detail: String(VARIABLE_IMPORTANCE_TIE_EPSILON),
});

const summary = {
  phase: "variable-importance-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
