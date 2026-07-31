/**
 * Public API.
 *
 * Todas las exportaciones públicas del Design System
 * deberán salir exclusivamente desde este archivo.
 *
 * UX-3.1.2 curated surface: token data + types + contract version.
 * Validators are package-internal (not reexported here).
 * Application modules must not import @/ui until a later microfase authorizes wiring.
 */
export {
  primitive,
  semantic,
  TOKEN_CONTRACT_VERSION,
} from "./foundation/tokens";

export type {
  PrimitiveTokens,
  SemanticTokens,
  TokenRef,
} from "./foundation/tokens";
