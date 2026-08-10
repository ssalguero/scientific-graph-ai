/**
 * COLLAB-I6 — Supporting (Presence/Session/Activity/Notifications) readiness gate.
 *
 * Authority: COLLAB-P6 I6 · COLLAB-P2 · COLLAB-P3 C7–C10 · COLLAB-P5 ·
 * docs/COLLAB/implementation/COLLAB-I6-Supporting.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  COLLAB_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "../src/collab/internal/boundary-policy";
import {
  closeCollaborativeSession,
  createSupportingRegistry,
  emitNotification,
  openCollaborativeSession,
  recordActivity,
  setPresence,
} from "../src/collab/supporting";
import { asCollabPeerIdentityRef } from "../src/collab/membership/types";

const repoRoot = process.cwd();
const collabDir = join(repoRoot, "src/collab");
const supportingDir = join(collabDir, "supporting");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const toPosix = (p: string) => p.replace(/\\/g, "/");
const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(ts|tsx)$/.test(name)) out.push(child);
    }
  };
  walk(dir);
  return out;
};

const REQUIRED_FILES = [
  "src/collab/supporting/index.ts",
  "src/collab/supporting/status.ts",
  "src/collab/supporting/presence-identity.ts",
  "src/collab/supporting/activity-identity.ts",
  "src/collab/supporting/notification-identity.ts",
  "src/collab/supporting/session-identity.ts",
  "src/collab/supporting/accompaniment.ts",
  "src/collab/supporting/types.ts",
  "src/collab/supporting/registry.ts",
  "src/collab/supporting/operations.ts",
  "docs/COLLAB/implementation/COLLAB-I6-Supporting.md",
];

const FORBIDDEN_FUTURE_DIRS = [
  "src/collab/sharing",
  "src/collab/annotations",
  "src/collab/discussions",
  "src/collab/reviews",
  "src/collab/presence",
  "src/collab/sessions",
  "src/collab/activity",
  "src/collab/notifications",
  "src/collab/integration",
  "src/collab/hardening",
  "src/collab/contracts",
  "src/collab/governance",
  "src/collab/audit",
];

const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "realtime", re: /\b(WebSocket|CRDT|OperationalTransform|liveMultiplayer)\b/ },
  { id: "cursor-runtime", re: /\b(updateCursor|broadcastPresence)\b/ },
  { id: "speculative-revision", re: /\bsubmitRevision\b/ },
];

const PEER_IMPORT_RE =
  /from\s+["']@\/(engine|data|ai|ui|plugins|performance|components|app)(\/|["'])/;

const SUPPORTING_OPS_RE =
  /\b(setPresence|openCollaborativeSession|closeCollaborativeSession|recordActivity|emitNotification)\b/;

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "layout.dir.supporting",
  existsSync(supportingDir),
  "supporting package must exist",
);

const barrel = existsSync(join(collabDir, "index.ts"))
  ? readFileSync(join(collabDir, "index.ts"), "utf8")
  : "";
for (const symbol of COLLAB_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS) {
  assertCase(
    `barrel.export.${symbol}`,
    barrel.includes(symbol),
    `public barrel must re-export ${symbol}`,
  );
}
assertCase(
  "barrel.no.ops.leak",
  !SUPPORTING_OPS_RE.test(barrel),
  "public barrel must not expose supporting operations",
);

assertCase(
  "policy.forbids.supporting",
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes("@/collab/supporting"),
  "@/collab/supporting must be consumer-forbidden",
);

for (const [file, id] of [
  ["presence-identity.ts", "C7"],
  ["activity-identity.ts", "C8"],
  ["notification-identity.ts", "C9"],
  ["session-identity.ts", "C10"],
] as const) {
  const src = readFileSync(join(supportingDir, file), "utf8");
  assertCase(
    `identity.${id}`,
    src.includes(`"${id}"`) || src.includes(`'${id}'`),
    `${id} identity present in ${file}`,
  );
}

const sessionIdSrc = readFileSync(join(supportingDir, "session-identity.ts"), "utf8");
assertCase(
  "identity.session.not.engine",
  sessionIdSrc.includes("equalsEngineSession: false"),
  "Collaborative Session must not equal ENGINE Session",
);

const activityIdSrc = readFileSync(join(supportingDir, "activity-identity.ts"), "utf8");
assertCase(
  "identity.activity.not.science",
  activityIdSrc.includes("equalsScientificHistory: false"),
  "Activity Timeline must not equal Scientific History",
);

const accompaniment = readFileSync(join(supportingDir, "accompaniment.ts"), "utf8");
assertCase(
  "accompaniment.async",
  accompaniment.includes("COLLAB_I6_ASYNC_ONLY") &&
    accompaniment.includes("true"),
  "I6 must declare async-only",
);
assertCase(
  "deferred.archive",
  accompaniment.includes("Archive"),
  "Archive must remain explicitly deferred",
);

const statusSrc = readFileSync(join(supportingDir, "status.ts"), "utf8");
assertCase(
  "status.phase",
  statusSrc.includes("COLLAB-I6"),
  "phase marker must be COLLAB-I6",
);
assertCase(
  "status.complete",
  statusSrc.includes("SUPPORTING_COMPLETE"),
  "status must be SUPPORTING_COMPLETE",
);

// Behavioral smoke
const registry = createSupportingRegistry();
const peer = "data-entity-support-1";

const session = openCollaborativeSession(registry, {
  peerIdentityRef: peer,
  openedByActorId: "actor-editor",
  label: "Collab session A",
  now: "1970-01-01T00:00:00.000Z",
});
assertCase(
  "ops.session.open",
  session.ok && session.value.status === "open",
  session.ok ? "opened" : session.error,
);

let presenceOk = false;
let activityOk = false;
let notifyOk = false;
let closeOk = false;

if (session.ok) {
  const presence = setPresence(registry, {
    actorId: "actor-editor",
    peerIdentityRef: peer,
    sessionId: session.value.id,
    status: "active",
    now: "1970-01-01T00:00:01.000Z",
  });
  presenceOk = presence.ok;
  assertCase(
    "ops.presence",
    presence.ok,
    presence.ok ? "set" : presence.error,
  );

  const activity = recordActivity(registry, {
    actorId: "actor-editor",
    peerIdentityRef: peer,
    operation: "opened-collaborative-session",
    sessionId: session.value.id,
    now: "1970-01-01T00:00:02.000Z",
  });
  activityOk = activity.ok;
  assertCase(
    "ops.activity",
    activity.ok,
    activity.ok ? "recorded" : activity.error,
  );

  const note = emitNotification(registry, {
    recipientActorId: "actor-reviewer",
    peerIdentityRef: peer,
    eventKind: "session-opened",
    body: "A collaborative session was opened",
    now: "1970-01-01T00:00:03.000Z",
  });
  notifyOk = note.ok;
  assertCase(
    "ops.notification",
    note.ok,
    note.ok ? "emitted" : note.error,
  );

  const closed = closeCollaborativeSession(registry, {
    sessionId: session.value.id,
    actorId: "actor-editor",
    now: "1970-01-01T00:00:04.000Z",
  });
  closeOk = closed.ok && closed.value.status === "closed";
  assertCase(
    "ops.session.close",
    closeOk,
    closed.ok ? "closed" : closed.error,
  );

  const presenceOnClosed = setPresence(registry, {
    actorId: "actor-editor",
    peerIdentityRef: peer,
    sessionId: session.value.id,
  });
  assertCase(
    "ops.presence.closed.session.denied",
    !presenceOnClosed.ok,
    presenceOnClosed.ok ? "should deny" : presenceOnClosed.error,
  );
} else {
  assertCase("ops.presence", false, "skipped");
  assertCase("ops.activity", false, "skipped");
  assertCase("ops.notification", false, "skipped");
  assertCase("ops.session.close", false, "skipped");
  assertCase("ops.presence.closed.session.denied", false, "skipped");
}

const peerRef = asCollabPeerIdentityRef(peer);
assertCase(
  "ops.indexed",
  registry.listSessionsForPeer(peerRef).length >= 1 &&
    registry.listActivityForPeer(peerRef).length >= 1,
  "sessions and activity indexed by peer identity",
);

assertCase(
  "ops.smoke.complete",
  session.ok && presenceOk && activityOk && notifyOk && closeOk,
  "Session → Presence → Activity → Notification → Close smoke path",
);

const tsFiles = collectTsFiles(collabDir);
assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 140,
  `COLLAB through I10 should remain bounded (found ${tsFiles.length} .ts files)`,
);

for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN_SOURCE_PATTERNS) {
    const hit = re.test(src);
    assertCase(
      `no.forbidden.${id}.${rel}`,
      !hit,
      hit ? `forbidden pattern ${re} in ${rel}` : "clean",
    );
  }
  if (!rel.includes("src/collab/supporting/")) {
    const leak = SUPPORTING_OPS_RE.test(src);
    assertCase(
      `no.supporting.ops.leak.${rel}`,
      !leak,
      leak ? "supporting ops must stay inside supporting/" : "clean",
    );
  }
  if (
    !rel.includes("src/collab/governance-audit/") &&
    !rel.includes("src/collab/hardening-controls/")
  ) {
    const leak =
      /\b(recordGovernedAuditEntry|verifyAuditTrailIntegrity|archiveCollaborationContext)\b/.test(
        src,
      );
    assertCase(
      `no.gov.ops.leak.${rel}`,
      !leak,
      leak ? "governance ops must stay inside governance-audit/" : "clean",
    );
  }
  if (!rel.includes("src/collab/hardening-controls/")) {
    const hardLeak =
      /\b(verifyPermissionIntegrity|resistSharedAccessAbuse|verifySharedAccessAbuseResistance|verifyActivityTrailIntegrity|attestHardeningReadiness|verifyHardeningGates)\b/.test(
        src,
      );
    assertCase(
      `no.hard.ops.leak.${rel}`,
      !hardLeak,
      hardLeak ? "hardening ops must stay inside hardening-controls/" : "clean",
    );
  }
  assertCase(
    `no.peer.import.${rel}`,
    !PEER_IMPORT_RE.test(src) ||
      (rel.includes("src/collab/cross-domain/") &&
        !/from\s+["']@\/(ai|plugins|performance|components|app)/.test(src) &&
        !/from\s+["']@\/(engine|data|ui)\//.test(src)),
    PEER_IMPORT_RE.test(src) && !rel.includes("src/collab/cross-domain/")
      ? "peer import forbidden outside cross-domain"
      : "clean",
  );
}

for (const rel of FORBIDDEN_FUTURE_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel))
      ? "must not exist (DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE)"
      : "absent",
  );
}

assertCase(
  "i0.to.i5.intact",
  existsSync(join(collabDir, "foundation/identity.ts")) &&
    existsSync(join(collabDir, "infrastructure/status.ts")) &&
    existsSync(join(collabDir, "membership/operations.ts")) &&
    existsSync(join(collabDir, "permissions/evaluate.ts")) &&
    existsSync(join(collabDir, "annotation-discussion/operations.ts")) &&
    existsSync(join(collabDir, "review-management/operations.ts")),
  "I0–I5 baselines must remain present",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-collab-supporting: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-collab-supporting: ${results.length} checks PASS`);
