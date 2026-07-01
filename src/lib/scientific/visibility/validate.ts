import {
  GUIDED_WORKFLOW_TOGGLE_KEYS_V1,
  VISIBILITY_KEYS_V1,
} from "@/lib/project/keys";

import { VISIBILITY_TOGGLE_KEYS, VISIBILITY_TOGGLE_REGISTRY } from "./registry";
import type { RegistryValidationIssue } from "./types";

export const validateRegistryParityWithProjectKeys =
  (): RegistryValidationIssue[] => {
    const issues: RegistryValidationIssue[] = [];

    for (const key of VISIBILITY_KEYS_V1) {
      if (!(key in VISIBILITY_TOGGLE_REGISTRY)) {
        issues.push({
          code: "REGISTRY-MISSING-PROJECT-KEY",
          message: `Registry missing project visibility key: ${key}`,
        });
      }
    }

    for (const key of VISIBILITY_TOGGLE_KEYS) {
      if (!(VISIBILITY_KEYS_V1 as readonly string[]).includes(key)) {
        issues.push({
          code: "REGISTRY-ORPHAN-KEY",
          message: `Registry contains key not in VISIBILITY_KEYS_V1: ${key}`,
        });
      }
    }

    if (VISIBILITY_TOGGLE_KEYS.length !== VISIBILITY_KEYS_V1.length) {
      issues.push({
        code: "REGISTRY-COUNT-MISMATCH",
        message: `Registry key count ${VISIBILITY_TOGGLE_KEYS.length} !== VISIBILITY_KEYS_V1 length ${VISIBILITY_KEYS_V1.length}`,
      });
    }

    return issues;
  };

export const validateWorkflowToggleSubset = (): RegistryValidationIssue[] => {
  const issues: RegistryValidationIssue[] = [];

  for (const key of GUIDED_WORKFLOW_TOGGLE_KEYS_V1) {
    if (!(key in VISIBILITY_TOGGLE_REGISTRY)) {
      issues.push({
        code: "WORKFLOW-KEY-MISSING-FROM-REGISTRY",
        message: `Workflow toggle key missing from registry: ${key}`,
      });
    }
  }

  return issues;
};

export const validateRegistryDefaultVisibleInvariant =
  (): RegistryValidationIssue[] => {
    const issues: RegistryValidationIssue[] = [];

    for (const key of VISIBILITY_TOGGLE_KEYS) {
      if (VISIBILITY_TOGGLE_REGISTRY[key].defaultVisible !== false) {
        issues.push({
          code: "REGISTRY-DEFAULT-NOT-OFF",
          message: `Registry entry ${key} must have defaultVisible: false`,
        });
      }
    }

    return issues;
  };

export const validateVisibilityRegistry = (): RegistryValidationIssue[] => [
  ...validateRegistryParityWithProjectKeys(),
  ...validateWorkflowToggleSubset(),
  ...validateRegistryDefaultVisibleInvariant(),
];

export const isVisibilityRegistryValid = (): boolean =>
  validateVisibilityRegistry().length === 0;
