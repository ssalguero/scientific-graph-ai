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
