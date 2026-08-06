# DATA-I9 Hardening Diagnostics

**Authority:** DATA-P10 · DATA-I9  
**Rule:** Diagnostics report compliance. They never reinterpret architecture.

## Diagnostic channels

| Channel | Source |
|---------|--------|
| Per-gate JSON summary | `scripts/validate-data-g*.ts` stdout |
| Boundary diagnostics | DATA-G3 → I8 boundary results |
| Policy unit | `validate:data-boundary-unit` |
| Gate registry unit | `validate:data-hardening-unit` |
| Aggregate stop-on-fail | `scripts/validate-data.ts` |

## Failure interpretation

| Event | Meaning | Action |
|-------|---------|--------|
| Gate FAIL | Stage incomplete | Fix evidence/code alignment; do not redesign freezes |
| Conceptual conflict | Plan vs implementation disagreement | STOP — escalate; no code “fix” that changes freeze |
| Doc contradiction | Docs disagree with Freeze Authority | Freeze wins; amend docs |

## Hardening Visibility Rule

Hardening validates implementation.  
Hardening never changes implementation.  
Quality Gates verify.  
They never redefine architecture.  
Certification consumes evidence.  
It never generates architecture.
