import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GUEST_AUTH_UNAVAILABLE_NOTICE } from "../src/lib/guestAuthUnavailable";

type CaseResult = { id: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];
const repoRoot = process.cwd();
const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");

const authSlotMatch = pageSource.match(
  /data-auth-shell-slot[\s\S]{0,1200}?<\/div>/
);
const authSlot = authSlotMatch?.[0] ?? "";

results.push({
  id: "f08.notice.copy",
  pass: GUEST_AUTH_UNAVAILABLE_NOTICE.includes("aún no están disponibles"),
});

results.push({
  id: "f08.slot.present",
  pass: authSlot.includes("Iniciar sesión") && authSlot.includes("Registrarse"),
  detail: authSlot ? "slot found" : "slot missing",
});

const loginButton = authSlot.match(
  /<button[\s\S]*?>\s*Iniciar sesión\s*<\/button>/
)?.[0];
const registerButton = authSlot.match(
  /<button[\s\S]*?>\s*Registrarse\s*<\/button>/
)?.[0];

results.push({
  id: "f08.login.onclick",
  pass: Boolean(loginButton?.includes("onClick")),
});

results.push({
  id: "f08.register.onclick",
  pass: Boolean(registerButton?.includes("onClick")),
});

results.push({
  id: "f08.page.uses.notice",
  pass: pageSource.includes("GUEST_AUTH_UNAVAILABLE_NOTICE"),
});

results.push({
  id: "f08.no.auth.stack",
  pass:
    !pageSource.includes("supabase.auth") &&
    !pageSource.includes("signInWith") &&
    !pageSource.includes("createUserWithEmail"),
});

const summary = {
  phase: "f08-guest-auth-cta-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
