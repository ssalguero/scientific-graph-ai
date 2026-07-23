/**
 * D67.3 — Session Restore Foundation · Restore Validator.
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Pure inspection of SessionPersistenceRecord[] — no mutation, no register,
 * no throw, no schemaVersion, no IO, no React.
 */

import type { SessionPersistenceRecord } from "../persistence/SessionPersistenceTypes";
import type { RestoreError } from "./RestoreErrors";

/** API Freeze — pure record validator surface. */
export interface RestoreValidator {
  validate(
    records: readonly SessionPersistenceRecord[]
  ): readonly RestoreError[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isRecordShape(value: unknown): value is SessionPersistenceRecord {
  return isPlainObject(value) && "definition" in value && "state" in value;
}

/**
 * Creates a pure RestoreValidator.
 * Never mutates input, never registers, never throws.
 */
export function createRestoreValidator(): RestoreValidator {
  return {
    validate(records) {
      const errors: RestoreError[] = [];

      if (!Array.isArray(records)) {
        errors.push({
          kind: "MissingSnapshot",
          message: "Restore payload is missing or not an array of records",
        });
        return errors;
      }

      if (records.length === 0) {
        errors.push({
          kind: "MissingSnapshot",
          message: "Restore payload is empty",
        });
        return errors;
      }

      const seenIds = new Map<string, number>();

      for (let index = 0; index < records.length; index += 1) {
        const record = records[index] as unknown;

        if (!isRecordShape(record)) {
          errors.push({
            kind: "CorruptedSnapshot",
            message:
              "SessionPersistenceRecord must be an object with definition and state",
            index,
          });
          continue;
        }

        const { definition, state } = record;

        if (!isPlainObject(definition)) {
          errors.push({
            kind: "CorruptedSnapshot",
            message: "definition must be a plain object",
            index,
          });
          continue;
        }

        if (!isPlainObject(state)) {
          errors.push({
            kind: "CorruptedSnapshot",
            message: "state must be a plain object",
            index,
          });
          continue;
        }

        const sessionId =
          typeof definition.id === "string" ? definition.id : undefined;

        if (typeof definition.id !== "string" || definition.id.length === 0) {
          errors.push({
            kind: "ValidationFailure",
            message: "definition.id is required and must be a non-empty string",
            index,
            field: "definition.id",
            ...(sessionId !== undefined ? { sessionId } : {}),
          });
        } else {
          const prior = seenIds.get(definition.id);
          if (prior !== undefined) {
            errors.push({
              kind: "ValidationFailure",
              message: `Duplicate definition.id "${definition.id}" in restore batch (first at index ${prior})`,
              index,
              sessionId: definition.id,
              field: "definition.id",
            });
          } else {
            seenIds.set(definition.id, index);
          }
        }

        if (typeof definition.createdAt !== "number") {
          errors.push({
            kind: "ValidationFailure",
            message: "definition.createdAt is required and must be a number",
            index,
            field: "definition.createdAt",
            ...(sessionId !== undefined ? { sessionId } : {}),
          });
        }

        if (typeof state.updatedAt !== "number") {
          errors.push({
            kind: "ValidationFailure",
            message: "state.updatedAt is required and must be a number",
            index,
            field: "state.updatedAt",
            ...(sessionId !== undefined ? { sessionId } : {}),
          });
        }

        if (!Array.isArray(state.windowIds)) {
          errors.push({
            kind: "ValidationFailure",
            message: "state.windowIds is required and must be an array",
            index,
            field: "state.windowIds",
            ...(sessionId !== undefined ? { sessionId } : {}),
          });
        }

        if (
          definition.metadata !== undefined &&
          !isPlainObject(definition.metadata)
        ) {
          errors.push({
            kind: "ValidationFailure",
            message: "definition.metadata must be a plain object when present",
            index,
            field: "definition.metadata",
            ...(sessionId !== undefined ? { sessionId } : {}),
          });
        }
      }

      return errors;
    },
  };
}
