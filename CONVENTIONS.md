# Development Conventions & File Organization

This document outlines the conventions and file organization structure used in TaskFlow project for Spec-Driven Development (SDD).

---

## Overview

TaskFlow follows a **Spec-Driven Development** approach, where specifications are defined upfront before implementation. This ensures clarity, alignment, and reduces rework.

---

## Directory Structure

```
sdd-meetup-demo/
├── specs/                    # Product specifications (business-oriented)
│   ├── prd-001.md           # Product Requirements Document
│   ├── prd-002.md           # Future PRDs for new features
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

### File Structure

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

### File Structure

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

## Spec-Driven Development Workflow

### Phase 1: Product Specification
1. Create `specs/prd-{number}.md` with product requirements
2. Define user needs, features, and acceptance criteria
3. Get product stakeholder approval
4. **No technical decisions included**

### Phase 2: Technical Planning
1. Create `tech-plans/tech-plan-{number}.md` based on approved PRD
2. Reference which PRD this implements (e.g., "Implements prd-001")
3. Design architecture and make technology choices
4. Create detailed implementation plan with timelines
5. Get technical lead approval

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

### Cursor enforcement (project rules)

This repo keeps always-on agent guidance in `.cursor/rules/`. Relevant rules:

- `.cursor/rules/test-first.mdc` — test-first (red → green → refactor)
- `.cursor/rules/small-prs.mdc` — small PR expectations and “split” triggers

### Phase 4: Validation
1. Verify implementation matches product spec
2. Conduct acceptance testing against spec criteria
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
