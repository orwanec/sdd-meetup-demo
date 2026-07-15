# Development Conventions & File Organization

This document outlines the conventions and file organization structure used in TaskFlow project for Spec-Driven Development (SDD).

---

## Overview

TaskFlow follows a **Spec-Driven Development** approach, where specifications are defined upfront before implementation. This ensures clarity, alignment, and reduces rework.

**For humans and AI agents:** the [SDD Workflow for Agents](#sdd-workflow-for-agents) section in this file is the canonical guide for creating PRDs, tech plans, and validating implementation — regardless of which tool you use.

---

## Directory Structure

```
sdd-meetup-demo/
├── specs/                    # Product specifications (business-oriented)
│   ├── prd-001.md           # Product Requirements Document (MVP)
│   ├── prd-002.md           # Product Requirements Document (Password Reset)
│   └── README.md            # Specs directory guide
│
├── tech-plans/              # Technical implementation plans
│   ├── tech-plan-001.md     # Technical architecture & implementation plan
│   ├── tech-plan-002.md     # Future technical plans
│   └── README.md            # Tech plans directory guide
│
├── src/                     # Source code (generated from specs)
├── tests/                   # Test files
├── CONVENTIONS.md           # This file - development conventions
├── README.md                # Project overview
└── .github/workflows/       # CI/CD pipelines

```

---

## File Naming Convention

All specification and planning documents follow a **sequential numbering scheme**:

### Format: `{type}-{number}.md`

- **`{type}`:** Category of the document
  - `prd` = Product Requirements Document
  - `tech-plan` = Technical Implementation Plan

- **`{number}`:** Chronological sequence starting from `001`
  - `prd-001.md` (first PRD)
  - `prd-002.md` (second PRD - new feature)
  - `tech-plan-001.md` (first tech plan)
  - `tech-plan-002.md` (second tech plan)

### Examples

```
✅ Correct:
  - specs/prd-001.md
  - specs/prd-002.md
  - tech-plans/tech-plan-001.md
  - tech-plans/tech-plan-002.md

❌ Incorrect:
  - specs/product-requirements.md
  - tech-plans/architecture.md
  - specs/prd_v1.md
```

---

## Specs Directory (`/specs/`)

**Purpose:** Contains product-focused specifications with no technical implementation details.

**Audience:** Product managers, stakeholders, users, QA

### What Goes Here

✅ **Include:**
- Product requirements
- Features and functionality
- User personas and pain points
- User workflows and journeys
- Acceptance criteria
- Business success metrics
- Out of scope items
- Future enhancements (product roadmap)
- Business constraints

❌ **Exclude:**
- Technical architecture
- Implementation timelines and milestones
- Technology stack decisions
- Database design
- API endpoints and contracts
- Code structure
- Infrastructure details

### PRD File Structure

Each PRD should include:
1. Project Overview
2. Executive Summary
3. Problem Statement & User Pain Points
4. Objectives & Goals
5. Target Audience / Personas
6. Core Features
7. User Workflows
8. Detailed Requirements
9. Acceptance Criteria
10. Non-Functional Requirements (user-focused)
11. Out of Scope
12. Success Criteria
13. Release Scope
14. Future Enhancements
15. Risks & Mitigation
16. Assumptions & Constraints
17. Approval & Sign-Off
18. Appendix

---

## Tech Plans Directory (`/tech-plans/`)

**Purpose:** Contains technical implementation details, architecture, timelines, and development strategies. Implements the product spec defined in `/specs/`.

**Audience:** Engineers, architects, DevOps, technical leads

### What Goes Here

✅ **Include:**
- Technical architecture and design
- Technology stack decisions
- Implementation timelines and milestones
- Development phases and sprints
- Database schema and data models
- API design and contracts (endpoints, request/response)
- System dependencies
- Performance requirements (technical)
- Security implementation details
- Deployment strategy
- Testing strategy
- Resource allocation

❌ **Exclude:**
- Business requirements (see `/specs/`)
- User workflows (see `/specs/`)
- Marketing or business strategy

### Tech Plan File Structure

Each tech plan should include:
1. Overview / Executive Summary
2. Implementation of (reference prd-001, prd-002, etc.)
3. Technical Stack
4. Architecture & Design
5. Data Models & Database Design
6. API Contracts & Endpoints
7. Implementation Plan
8. Development Phases & Milestones
9. Resource Requirements
10. Testing Strategy
11. Performance & Scalability
12. Security Considerations
13. Dependencies & Integration Points
14. Risks & Mitigation (technical)
15. Assumptions & Constraints
16. Approval & Sign-Off

---

## SDD Workflow for Agents

This section is the **canonical SDD guide** for humans and AI agents — Cursor, Claude Code, Copilot, or any other tool. Tool-specific rules (e.g. `.cursor/rules/`) mirror this document but do not replace it.

**Before creating or editing any SDD artifact**, read this section and the most recent example of that artifact type in the repo.

| Action | Read first | Output location |
|--------|------------|-----------------|
| Create a PRD | This section + latest PRD in `specs/` | `specs/prd-{NNN}.md` |
| Create a tech plan | This section + the PRD it implements + latest tech plan | `tech-plans/tech-plan-{NNN}.md` |
| Implement a feature | Approved PRD + matching tech plan | `src/`, `tests/` |

---

### Creating a PRD

Use this workflow when adding a new feature or materially changing product scope.

#### Step 1 — Gather context

1. Read this file (`CONVENTIONS.md`), especially [Specs Directory](#specs-directory-specs) and [Key Principles](#key-principles).
2. Read the latest PRD in `specs/` (e.g. `prd-001.md`) as the **structure and tone template** — do not invent a new format from memory.
3. Read any upstream PRDs the feature builds on (e.g. password reset builds on `prd-001` auth scope).
4. Collect input from the requester: user story, acceptance criteria, constraints.

#### Step 2 — Create the file

1. Pick the next sequential number: `specs/prd-002.md`, `specs/prd-003.md`, etc.
2. Add a status header at the top: `**Status:** Draft`
3. Fill every section listed in [PRD File Structure](#prd-file-structure) above.
   - If a section does not apply, write `N/A — [reason]` rather than omitting it.
4. Keep the document **implementation-agnostic** — no stack, database schema, API routes, or code structure.

#### Step 3 — Required content

Every PRD must include at minimum:

- **User story** — "As a … I want … so that …"
- **Detailed requirements** — numbered subsections (e.g. §7.1, §7.2) with validation rules and behavior
- **Acceptance criteria** — checkbox list (`- [ ]`) that QA and tests can trace to
- **Out of scope** — explicit boundaries to prevent scope creep
- **Related documents** — links to prior PRDs in the Appendix

Reuse product facts from earlier PRDs (personas, password rules, etc.) instead of redefining them inconsistently.

#### Step 4 — Review and approve

1. Self-check against [Best Practices](#best-practices) and [Anti-Drift Rules](#anti-drift-rules) below.
2. Get product stakeholder sign-off (Approval & Sign-Off table).
3. Set `**Status:** Active` — the PRD is now the maintained source of truth for *what* to build.

#### Step 5 — After implementation (do not skip)

1. Run the [Cross-Check Protocol](#cross-check-protocol) against the running code.
2. Update the PRD only if product requirements changed during delivery; note changes in Document History.
3. Do **not** freeze the PRD — it stays `Active` and evolvable.

---

### Creating a Tech Plan

Use this workflow after the PRD is `Active`.

#### Step 1 — Gather context

1. Read this file and the PRD being implemented (all acceptance criteria, not just a summary).
2. Read the latest tech plan in `tech-plans/` as the structure template.
3. Inspect the current codebase — frozen specs may have stale file paths or class names.

#### Step 2 — Create the file

1. Pick the next sequential number: `tech-plans/tech-plan-002.md`, etc.
2. Add `**Status:** Draft` at the top.
3. Open with **Implementation of** — a link to the PRD (e.g. "Implements [prd-002](../specs/prd-002.md)").
4. Fill every section listed in [Tech Plan File Structure](#tech-plan-file-structure) above.

#### Step 3 — Approve and implement

1. Get technical lead sign-off.
2. Set `**Status:** Active` while work is in progress.
3. When fully delivered, set `**Status:** Implemented (YYYY-MM-DD)` and **freeze** the plan — do not edit it again. New work in the same area needs a new PRD and tech plan.

---

### Anti-Drift Rules

These apply to every agent and contributor:

- **Never skip PRD sections** — use `N/A — [reason]` if truly irrelevant.
- **Never implement requirements that differ from the PRD without updating the PRD first.** If the same feature’s requirements change (including when something is infeasible), **revise the existing PRD** (Document History + re-approval). **Create a new numbered PRD** only for new scope or follow-up work after the original feature is delivered.
- **Never put implementation details in PRDs** or business requirements in tech plans.
- **Always keep code and spec aligned** — if they diverge, fix the code or update the PRD; do not leave them out of sync.
- **Always verify API contracts** match actual behavior after backend changes.
- **Trust frozen specs for decisions and rationale**; **verify file paths and code patterns** against the current codebase.

---

### Cross-Check Protocol

After implementing a feature, before marking work complete:

1. Read the PRD — **all** acceptance criteria, not only the ones touched in the current slice.
2. For each acceptance criterion, verify pass/fail in the running code or test suite.
3. Report pass/fail per criterion.
4. Fix code or update the PRD for any failure.

---

### Spec Lifecycle & Status Headers

Every spec artifact must include a `**Status:**` line near the top.

| Artifact | Draft | Active | Implemented (frozen) |
|----------|-------|--------|----------------------|
| PRD | Initial writing / review | Approved source of truth | N/A — PRDs stay Active |
| Tech plan | Initial writing / review | Work in progress | Delivery complete — do not edit |

When reading a spec with `Status: Implemented`:

- **Trust:** decisions, rationale, PRD rule mappings, acceptance criteria
- **Do not trust:** file paths, class names, method signatures — verify in code
- **Never edit** a frozen plan; create a new PRD + tech plan for follow-up work

---

## Spec-Driven Development Workflow

### Phase 1: Product Specification
1. Follow [Creating a PRD](#creating-a-prd) above
2. Define user needs, features, and acceptance criteria
3. Get product stakeholder approval → set `Status: Active`
4. **No technical decisions included**

### Phase 2: Technical Planning
1. Follow [Creating a Tech Plan](#creating-a-tech-plan) above
2. Reference which PRD this implements (e.g., "Implements prd-002")
3. Design architecture and make technology choices
4. Create detailed implementation plan with timelines
5. Get technical lead approval → set `Status: Active`, then `Implemented (YYYY-MM-DD)` when done

### Phase 3: Implementation
1. Developers follow the spec and tech plan
2. Code generated from specifications
3. Tests written to match acceptance criteria from spec
4. Implementation tracked against specifications

---

## Testing Convention (Test-First)

For any feature change or bugfix, default to **red → green → refactor**:

1. **Red**: write/update a test that fails and captures the intended behavior (ideally mapped to acceptance criteria).
2. **Green**: implement the smallest change that makes the test pass.
3. **Refactor**: clean up only after tests are green.

**Definition of done (testing):**
- `npm test` passes locally/CI.
- Add/adjust tests in the same PR as the behavior change.
- Prefer a mix of unit tests (`tests/unit/**`) and integration tests (`tests/integration/**`) when applicable.

---

## Pull Request Convention (Small PRs)

Default expectation: **one intent per PR** and keep it easy to review.

**Stop conditions (split the PR):**
- The PR contains multiple unrelated changes (you need “and” to describe it).
- It spans multiple subsystems without a single unifying goal.
- The reviewer must understand more than one area to verify the primary change.

**Practical heuristics:**
- If the PR touches **>10 files**, strongly consider splitting.
- Prefer follow-up PRs for broad refactors, renames, dependency upgrades, formatting, and drive-by cleanup.

### Agent guidance

**Canonical source:** [SDD Workflow for Agents](#sdd-workflow-for-agents) in this file — use it for any human or AI contributor.

Cursor users also get always-on rules in `.cursor/rules/` that mirror parts of this document:

- `.cursor/rules/test-first.mdc` — test-first (red → green → refactor)
- `.cursor/rules/small-prs.mdc` — small PR expectations and “split” triggers

### Phase 4: Validation
1. Follow the [Cross-Check Protocol](#cross-check-protocol) against the PRD acceptance criteria
2. Verify implementation matches product spec
3. Validate against success metrics
4. Deploy to production

### Phase 5: Iteration
1. Document learnings and feedback
2. Create new PRDs for enhancements (`prd-002.md`)
3. Create new tech plans for new features (`tech-plan-002.md`)
4. Repeat the cycle

---

## Key Principles

### 1. Separation of Concerns
- **Specs** = What to build (business/user perspective)
- **Tech Plans** = How to build it (technical perspective)
- Each document is focused and maintainable
- Specs remain stable; tech plans can change based on technical constraints

### 2. Single Source of Truth
- Product spec is the authoritative definition of what the product should do
- Tech plan is the authoritative definition of how to build it
- Implementation must trace back to spec requirements
- Avoid duplicating requirements across documents

### 3. Specs are Implementation-Agnostic
- Specs describe the user experience and requirements
- Specs do NOT dictate how it's built
- Multiple different tech implementations could satisfy the same spec
- This enables flexibility and future technology changes

### 4. Clarity & Simplicity
- Write for the intended audience (specs for PMs/stakeholders, tech plans for engineers)
- Use plain language, avoid unnecessary jargon
- Include examples and user workflows in specs
- Include technical diagrams and code examples in tech plans

### 5. Traceability
- Tech plans reference which specs they implement
- Code maps to requirements in specs
- Tests validate acceptance criteria from specs
- Sequential numbering makes evolution clear

---

## Document Lifecycle

### Version Control

Each document should include a version history table:

```markdown
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-13 | Initial version |
| 1.1 | 2026-07-14 | Updated based on feedback |
```

### Status Tracking

Include approval status:

```markdown
| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | [Name] | [Date] | Pending/Approved |
| Technical Lead | [Name] | [Date] | Pending/Approved |
```

### Changes & Updates

When updating a document:
1. Increment version number (1.0 → 1.1 → 2.0)
2. Add entry to document history
3. Note what changed and why
4. Get re-approval if significant changes

---

## Best Practices

### ✅ Do's

- Keep specs focused on user value and requirements
- Keep tech plans focused on implementation strategy
- Use clear, descriptive headings
- Include examples and workflows
- Get stakeholder/technical sign-off
- Maintain clear document history
- Use consistent formatting and structure
- Reference related documents appropriately
- Make specs implementation-agnostic

### ❌ Don'ts

- Don't mix technical and product content
- Don't include implementation details in specs
- Don't include business requirements in tech plans
- Don't include vague or incomplete requirements
- Don't skip acceptance criteria
- Don't ignore documented constraints
- Don't create parallel document versions
- Don't forget to update version history
- Don't make specs dependent on specific technologies

---

## Cross-Reference Conventions

### From Tech Plans to Specs

In **tech-plans/tech-plan-001.md**, always reference which spec you're implementing:

```markdown
## Implementation of

This technical plan implements the requirements from [Product Requirements Document prd-001](../specs/prd-001.md).
```

### From Code to Specs

In comments or documentation, trace implementation back to requirements:

```javascript
// Implements: prd-001, section 7.2 - User Login
// Acceptance Criteria: User can login with email and password
```

---

## Lightweight Approach

To keep the project focused and maintainable:

1. **One spec per product release** - Don't over-spec
2. **One tech plan per product spec** - One implementation strategy per feature set
3. **Minimal bureaucracy** - Avoid excessive approval gates
4. **Clear naming** - Use simple, sequential numbering (001, 002, 003)
5. **Lean documentation** - Include what matters, avoid fluff

---

## Questions & Support

For questions about these conventions, refer to:
- Project README.md - Overview and getting started
- Individual spec files - Product details
- Individual tech plan files - Technical details
- GitHub Issues - For discussions and clarifications

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-13 | Initial conventions document created |
| 1.1 | 2026-07-13 | Added test-first workflow and small PR conventions |
| 1.2 | 2026-07-15 | Added agent-agnostic SDD workflow (PRD, tech plan, anti-drift, cross-check) |
| 1.3 | 2026-07-15 | Clarified anti-drift rule: revise existing PRD vs create new numbered PRD |
