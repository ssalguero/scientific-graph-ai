export type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

export type AssertCase = (id: string, condition: boolean, detail?: string) => void;

export const createAssertCase = (results: CaseResult[]): AssertCase => {
  return (id: string, condition: boolean, detail?: string) => {
    results.push({ id, pass: condition, detail });
  };
};

export const summarizeCaseResults = (
  results: readonly CaseResult[]
): { passCount: number; failCount: number; failures: CaseResult[] } => {
  const failures = results.filter((result) => !result.pass);
  return {
    passCount: results.length - failures.length,
    failCount: failures.length,
    failures,
  };
};
