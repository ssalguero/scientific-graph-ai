export type ContractFoundationCaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

export type ContractFoundationAssertCase = (
  id: string,
  pass: boolean,
  detail?: string
) => void;

export const createContractFoundationAssertCase = (
  results: ContractFoundationCaseResult[]
): ContractFoundationAssertCase => (id, pass, detail) => {
  results.push({ id, pass, ...(detail ? { detail } : {}) });
};
