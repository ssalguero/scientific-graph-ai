import {
  GENERATION_UNAVAILABLE_MESSAGE,
  type GenerationPort,
  type GenerationResponse,
} from "./types";

/**
 * Honest fail-closed port. Not a generator. Product Face must not present
 * this text as conversational generation.
 */
export const unconfiguredGenerationPort: GenerationPort = {
  async generate(): Promise<GenerationResponse> {
    return {
      text: GENERATION_UNAVAILABLE_MESSAGE,
      source: "unconfigured",
    };
  },
};
