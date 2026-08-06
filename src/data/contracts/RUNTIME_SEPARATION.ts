/**
 * DATA Domain — Runtime Separation Rule (DATA-I1).
 *
 * DATA-I1 establishes only the public technical surface.
 * No runtime implementation shall appear before the corresponding
 * implementation stage defined in DATA-P7.
 *
 * Forbidden here (deferred to DATA-I2+): adapters, DI, providers, registries,
 * lifecycle, validation behavior, repository behavior, metadata behavior,
 * transformation logic, or any scientific runtime.
 *
 * @packageDocumentation
 */

export {};
