# AI Revenue Recovery OS — Project Plan

A realistic build plan for the MVP → Pilot → Production journey, an AI-augmented development
organization, and the delivery workflow. Cost figures referenced here are detailed in the
accompanying `AI_Revenue_Recovery_OS_Product_Cost_Model.xlsx` and investment report.

---

## 1. Project management platform

**Recommendation: GitHub Projects** (with GitHub Issues) for the MVP and pilot.

| Option | Fit | Verdict |
|---|---|---|
| **GitHub Projects** | Native to the code; free/low-cost; issues, boards, automations, roadmap; AI PM agent can operate via GitHub API | **Recommended** — lowest friction for a lean, code-centric team already on GitHub |
| Linear | Excellent UX & velocity; paid per seat | Strong alternative if the team scales past ~10 |
| Jira | Powerful, enterprise-standard; heavier | Adopt later if enterprise/payer customers require it |
| Azure DevOps | Tight Azure/CI-CD integration | Consider once deep in Azure DevOps pipelines |

**Backlog structure:** Epics → Features → User Stories → Tasks, plus Bugs, Security Findings,
Compliance Tasks, Architecture Decision Records (ADRs), and Technical Debt.

**AI Project Manager agent** (human PM approves major changes) maintains the backlog, creates
tasks, flags blockers, tracks dependencies, prepares sprint plans and weekly reports, tracks
milestones, and surfaces schedule risk.

---

## 2. Development workflow

```
Requirement → AI Product Manager → User Story → AI Architect → Architecture
           → AI Developer → Code → AI QA → AI Security → Pull Request
           → Human Review → CI/CD → Staging → Automated Testing
           → Human Approval → Production
```

**Human-in-the-loop gates:** every PR is human-reviewed; production deployment, production DB/IAM/
security/PHI-policy changes, and any regulated decision require explicit human approval.

### Git & CI/CD

- **Branches:** `main` (protected) · `develop` · `feature/*` · `bugfix/*` · `security/*`.
- **Rules:** protected `main`, mandatory PR + passing tests, code review, deployment approval.
- **Pipeline scanning:** SAST · DAST · SCA · secret scanning · container scanning · IaC scanning ·
  dependency scanning. Fail-closed on high-severity findings.

---

## 3. Development organization

**Human roles (12):** CTO/Architect · Product Manager · Healthcare/RCM Business Analyst ·
Backend · Frontend · AI Engineer · Integration (EDI/FHIR) · DevOps/SRE · Security · QA · Data ·
Compliance (often fractional/contract).

**Team sizing:**

| Model | Team | Notes |
|---|---|---|
| **Lean MVP** | ~5 FTE | CTO/Architect, 2 full-stack, 1 AI/integration, 1 part-time DevOps/Security; fractional PM/BA/Compliance |
| **Balanced MVP** | ~8 FTE | + dedicated Frontend, Integration, QA |
| **Production** | ~12–15 FTE | Full roster + dedicated Security and Data Engineering |

**Recommended baseline:** **5 human technical users × Claude Max 20x** for AI-augmented
engineering (see §5). AI agents are tools operated by humans — **not** one subscription per agent.

---

## 4. AI agent workforce

Twenty specialized agents operated by the human team through AI coding/agent tools:

Product Manager · Project Manager · Business Analyst · Healthcare RCM · Payer Research ·
Architecture · Backend Dev · Frontend Dev · AI Engineer · EDI · FHIR · Integration · Database ·
QA · Security · DevOps · FinOps · Documentation · Compliance Research · Test Data.

**Governance:** each agent has an identity + scoped tool/data/tenant/action permissions and full
audit; least privilege; high-risk actions gated by human approval. Development uses synthetic/
de-identified data only.

---

## 5. AI productivity impact

AI augments the team; it does **not** replace developers. Modeled uplift scenarios applied to
development throughput (code, testing, documentation, research, security, PM):

| Scenario | Effective capacity of a 5-FTE team | Interpretation |
|---|---|---|
| **+10%** | ~5.5 FTE-equivalent | Conservative |
| **+20%** | ~6.0 FTE-equivalent | Realistic-low |
| **+30%** | ~6.5 FTE-equivalent | **Planning baseline** |
| **+40%** | ~7.0 FTE-equivalent | Optimistic |

Impact is largest on boilerplate code, test generation, documentation, payer/policy research and
first-draft security reviews; smallest on novel architecture and regulated decision design.

---

## 6. Milestone roadmap (M0–M12)

Durations below are the **realistic** case. Aggressive ≈ 0.8×, Conservative ≈ 1.3× (see §7).

| # | Milestone | Duration | Depends on | Human focus | Key AI agents | Deliverables | Acceptance criteria | Top risk |
|---|---|---|---|---|---|---|---|---|
| **M0** | Discovery | 2 wk | — | CTO, PM, BA | Product Mgr, Payer Research, RCM | Product/workflow requirements, payer/API research, security requirements, architecture principles | Signed-off scope & principles | Scope creep |
| **M1** | Architecture + Security foundation | 3 wk | M0 | CTO, DevOps, Security | Architecture, DevOps, Security | Azure foundation, Entra ID, networking, tenant model, security baseline, CI/CD, repo | Environments provisioned; pipeline green | Cloud misconfig |
| **M2** | Multi-tenant core | 4 wk | M1 | Backend, DevOps | Backend, Database, QA | Tenant mgmt, RBAC, orgs, users, audit, admin | Tenant isolation tests pass | Isolation defects |
| **M3** | Eligibility + Benefits | 4 wk | M2 | Backend, Integration | EDI, Integration, Backend | Eligibility, benefits, 270/271, integration framework, payer config | Live sandbox eligibility check | Clearinghouse onboarding |
| **M4** | Claim Status | 3 wk | M3 | Backend, Integration | EDI, Backend | 276/277, claim timeline, claim-status agent | Real-time status via API | Payer variability |
| **M5** | Prior Authorization | 4 wk | M3 | Integration, AI | FHIR, Integration, AI | 278/FHIR architecture, PA workflow, payer rules, document workflow | PA required-check + submission (sandbox) | 278 adoption gaps |
| **M6** | Denial Intelligence | 4 wk | M4 | AI, Backend | AI, EDI, RCM | 835/CARC/RARC ingestion, denial analysis, recovery recommendation | Root cause + recovery for sample denials | Model accuracy |
| **M7** | Appeals | 3 wk | M6 | AI, Backend | AI, Documentation | Appeal workflow, AI draft, human approval, tracking | Draft appeal + human sign-off | No universal API |
| **M8** | Payer Intelligence | 4 wk | M3–M7 | AI, Data, BA | Payer Research, AI, Database | Payer DB, policies, RAG, recommendation engine | Cited payer recommendations | Data freshness |
| **M9** | AI Workforce | 3 wk | M8 | AI, Backend | AI, Security, DevOps | Agent orchestration, registry, tool permissions, agent audit | Governed agent actions with audit | Agent over-permissioning |
| **M10** | Security / HIPAA hardening | 4 wk | M1–M9 | Security, DevOps, Compliance | Security, Compliance Research | Risk assessment, pen test, PHI controls, security monitoring, audit | Pen-test findings remediated | Findings backlog |
| **M11** | Pilot | 4 wk | M10 | All | QA, Test Data, RCM | Design partner, approved/synthetic data, prod-like env, metrics | Pilot KPIs met | Partner readiness |
| **M12** | Production readiness | 4 wk | M11 | DevOps, Security | DevOps, Security, FinOps | HA, DR, monitoring, runbooks, support, release | Go-live checklist complete | Ops maturity |

**Total (realistic): ~46 weeks (~10.5 months)** of milestone work; MVP-capable product emerges by
**~M8–M9**, pilot by **~M11**.

---

## 7. Timeline scenarios

| Scenario | Factor | MVP (through M9) | Pilot (M11) | Production (M12) |
|---|---|---|---|---|
| **Aggressive** | 0.8× | ~26 wk | ~30 wk | ~37 wk |
| **Realistic** | 1.0× | ~32 wk | ~40 wk | ~46 wk |
| **Conservative** | 1.3× | ~42 wk | ~52 wk | ~60 wk |

Aggressive assumes strong AI uplift, no payer-onboarding delays, and a ready design partner —
treat it as best-case, not the plan of record. **Plan against the realistic case.**

---

## 8. Delivery principles

- Build the **common platform foundation** from day one (multi-tenant, orchestration, audit,
  security) — but **do not over-engineer the MVP** (shared DB + RLS, Container Apps, no premium
  networking until production).
- **Provider/RCM first**, payer capabilities after validation.
- Human approval on every regulated or high-risk action; synthetic data only in development.
- Optimize for time-to-pilot and time-to-revenue without compromising security or auditability.
