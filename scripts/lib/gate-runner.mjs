import { spawnSync } from "child_process";

import { ROOT } from "./validation-env.mjs";

/**
 * @param {string} [root]
 */
export const createGateRunner = (root = ROOT) => {
  /** @type {Array<{ id: string; pass: boolean; exitCode: number | null; durationMs: number; stderr?: string }>} */
  const steps = [];

  /**
   * @param {string} id
   * @param {string} command
   * @param {string[]} args
   * @param {{ env?: NodeJS.ProcessEnv; cwd?: string }} [options]
   */
  const run = (id, command, args, options = {}) => {
    const startedAt = Date.now();
    const result = spawnSync(command, args, {
      cwd: options.cwd ?? root,
      encoding: "utf8",
      shell: true,
      env: { ...process.env, ...options.env },
    });
    const pass = result.status === 0;
    const step = {
      id,
      pass,
      exitCode: result.status,
      durationMs: Date.now() - startedAt,
    };

    if (!pass) {
      const stderr = (result.stderr || result.stdout || "").trim();
      if (stderr) {
        step.stderr = stderr.slice(0, 500);
      }
    }

    steps.push(step);
    return pass;
  };

  const allPassed = () => steps.every((step) => step.pass);

  /**
   * @param {Record<string, unknown>} meta
   */
  const finish = (meta = {}) => ({
    ...meta,
    pass: allPassed(),
    steps,
  });

  return { run, steps, allPassed, finish };
};
