/**
 * DATA Domain — Transient View helper (DATA-P6).
 *
 * Non-authoritative projection. May be discarded. Must never be written back
 * as competing truth or promoted to Authoritative.
 *
 * @packageDocumentation
 */

import { DataRegistryRole } from "./roles";

export interface TransientView<T> {
  readonly role: typeof DataRegistryRole.TransientView;
  readonly projection: T;
}

export function asTransientView<T>(projection: T): TransientView<T> {
  return {
    role: DataRegistryRole.TransientView,
    projection,
  };
}
