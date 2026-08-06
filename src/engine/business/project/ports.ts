/**
 * ENGINE Domain — Project persistence port (business → coordination).
 * OWNERSHIP: ENGINE defines the port; coordination adapters implement it.
 * Does not own IndexedDB / file I/O — adapters delegate to existing application libs.
 */

import type {
  CloseProjectInput,
  CloseProjectResult,
  CreateProjectInput,
  CreateProjectResult,
  OpenProjectInput,
  OpenProjectResult,
  SaveProjectInput,
  SaveProjectResult,
} from "./types";

/**
 * Temporary DATA/platform port for local project create/open/save/close.
 * Implemented by LocalProjectAdapter (ENGINE-4).
 */
export interface ProjectPersistencePort {
  create(input: CreateProjectInput): Promise<CreateProjectResult>;
  open(input: OpenProjectInput): Promise<OpenProjectResult>;
  save(input: SaveProjectInput): Promise<SaveProjectResult>;
  close(input: CloseProjectInput): Promise<CloseProjectResult>;
}
