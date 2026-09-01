import { createHttpGenerationPort } from "./http-adapter";
import { unconfiguredGenerationPort } from "./unconfigured-port";
import type { GenerationPort } from "./types";

/**
 * Vendor-agnostic factory. Product Face does not import a provider SDK.
 * Real generation requires SGAI_GENERATION_URL and SGAI_GENERATION_API_KEY.
 * Without them the port is unconfigured — never a local pseudo-LLM.
 */
export function createGenerationPort(): GenerationPort {
  return createHttpGenerationPort() ?? unconfiguredGenerationPort;
}

export { unconfiguredGenerationPort };
