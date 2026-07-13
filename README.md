# TaskFlow

A lightweight web application that helps individuals organize and track personal tasks.

**Showcasing Spec-Driven Development in Action for the Meetup**

---

## 📋 Overview

TaskFlow is a minimal yet powerful task management application designed to demonstrate **Spec-Driven Development (SDD)** principles in action. The project intentionally keeps the MVP focused, allowing you to see exactly how specifications drive technical decisions and implementation.

This repository serves as both a **working product** and an **educational resource** for understanding how to structure and execute spec-driven projects effectively.

---

## 🎯 What is Spec-Driven Development?

Spec-Driven Development is an approach where:

1. **Specifications are written first** - Define what the product should do before building it
2. **Clear separation of concerns** - Product specs define requirements; technical plans define implementation
3. **Single source of truth** - Specs are the authoritative definition of the product
4. **Traceability** - Code, tests, and technical decisions all trace back to specifications
5. **Implementation-agnostic** - Specs describe features without dictating technology choices

### Why SDD?

✅ **Reduces ambiguity** - Everyone knows exactly what's being built  
✅ **Minimizes rework** - Catch issues in specification phase, not coding phase  
✅ **Improves communication** - Product managers and engineers speak the same language  
✅ **Enables parallel work** - Specs done → code generation can begin while tech planning continues  
✅ **Facilitates testing** - Tests written directly from acceptance criteria  
✅ **More guardrails for AI-generated code** - Clear specifications provide guardrails for AI code generation, ensuring AI output is controlled, validated, and aligned with product requirements rather than relying on prompts alone

---

## 📁 Project Structure

```
sdd-meetup-demo/
├── specs/                    # Product specifications (business-oriented)
│   └── prd-001.md           # TaskFlow Product Requirements Document
│
├── tech-plans/              # Technical implementation plans
│   └── tech-plan-001.md     # TaskFlow Technical Architecture & Plan
│
├── src/                     # Source code (generated from specs)
│   ├── app.js               # Express application setup
│   ├── db.js                # Database initialization
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
│
├── public/                  # Static files
│   ├── css/
│   └── js/
│
├── views/                   # EJS templates
│   ├── auth/               # Auth pages (register, login)
│   ├── dashboard/          # Dashboard page
│   └── tasks/              # Task management pages
│
├── data/                    # SQLite database (generated)
│   └── taskflow.db
│
├── tests/                   # Test files
├── package.json             # Dependencies and scripts
├── server.js                # Entry point
├── .env.example             # Environment variables template
├── CONVENTIONS.md           # Development conventions & SDD guidelines
└── README.md                # This file
```

For detailed conventions, see [CONVENTIONS.md](CONVENTIONS.md).

---

## 🚀 TaskFlow Features (MVP v1.0)

### ✅ Included

- **User Registration** - Create account with email and password
- **User Authentication** - Secure login and session management
- **Dashboard** - View task summary and productivity stats
- **Task Creation** - Capture tasks with title and optional description
- **Task Tracking** - View all tasks and mark as completed
- **Logout** - Securely end session
- **Responsive Design** - Works on desktop, tablet, and mobile

### ❌ Not Included (MVP v1.0)

- Password reset, email verification
- Task editing or deletion
- Task priorities, due dates, categories
- Notifications, sharing, team features
- Advanced search and filtering

See [specs/prd-001.md](specs/prd-001.md) for full feature list and roadmap.

---

## 📖 How to Use This Repository

### For Product Managers & Stakeholders

1. **Start here:** [specs/prd-001.md](specs/prd-001.md)
   - Understand the product requirements
   - Review user personas and workflows
   - Check acceptance criteria

2. **Questions to ask:**
   - Are the features meeting user needs?
   - Are the acceptance criteria clear?
   - Do we agree on the success metrics?

### For Engineers & Technical Teams

1. **Start with:** [specs/prd-001.md](specs/prd-001.md)
   - Understand what the product must do
   - Review acceptance criteria (these become tests)
   - Note non-functional requirements

2. **Then review:** [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)
   - Understand the technical approach
   - See the architecture and technology stack
   - Review implementation timeline
   - Check your task assignments

3. **Questions to ask:**
   - Are the acceptance criteria testable?
   - Do we have all information needed to build?
   - Are there ambiguities in the spec?

### For AI-Assisted Code Generation

1. **Use specs as source of truth** [specs/prd-001.md](specs/prd-001.md)
   - Feed acceptance criteria to AI code generators
   - Use non-functional requirements as quality gates
   - Reference specific requirements to guide AI output

2. **Validate against tech plan** [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)
   - Ensure generated code follows the architecture
   - Verify technology choices are respected
   - Check API contracts are implemented correctly

3. **Test against specs**
   - Write tests directly from acceptance criteria
   - Validate generated code passes all tests
   - Trace each line of code back to a requirement

### For Learning SDD

1. **Understand the philosophy:** [CONVENTIONS.md](CONVENTIONS.md)
   - Separation of concerns (specs vs tech-plans)
   - SDD workflow phases
   - Best practices and principles

2. **See it in action:**
   - Compare [specs/prd-001.md](specs/prd-001.md) (what to build)
   - With [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) (how to build)
   - Notice how tech-plan references and implements the spec

3. **Key insights:**
   - Specs don't mention database, API endpoints, or technology
   - Tech-plan translates product requirements into technical decisions
   - Multiple tech implementations could satisfy the same spec
   - Acceptance criteria are guardrails for code generation

---

## 🔄 SDD Workflow in TaskFlow

```
Phase 1: Product Specification
└─ Create specs/prd-001.md
   ├─ Define user needs and features
   ├─ Write acceptance criteria (guardrails for code)
   └─ Get stakeholder approval
       ↓
Phase 2: Technical Planning
└─ Create tech-plans/tech-plan-001.md
   ├─ Design architecture
   ├─ Choose technology stack
   ├─ Create implementation timeline
   └─ Get technical approval
       ↓
Phase 3: Implementation (with SDD guardrails)
└─ Code generation and development
   ├─ Use specs to guide AI/developer coding
   ├─ Tests written directly from acceptance criteria
   ├─ Each requirement traced in code
   └─ Continuous validation against specs
       ↓
Phase 4: Validation
└─ Testing and verification
   ├─ Acceptance testing against spec criteria
   ├─ Verify all requirements implemented
   ├─ Success metrics validation
   └─ Production deployment
       ↓
Phase 5: Iteration
└─ Enhancement planning
   ├─ Document learnings
   ├─ Create prd-002.md for new features
   └─ Repeat cycle
```

---

## 📚 Key Documents

### Product Specification

**[specs/prd-001.md](specs/prd-001.md)**

Contains the authoritative product definition:
- Executive summary
- Problem statement and user pain points
- User personas
- Functional requirements
- Acceptance criteria (validation checkpoints)
- Success metrics
- Feature roadmap

**Who reads this?**
- Product managers and stakeholders
- QA and testers
- Engineers (to understand requirements)
- AI code generators (to understand what to build)
- Anyone asking "what are we building?"

### Technical Plan

**[tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)**

Contains the implementation strategy:
- Technology stack decisions (Node.js, Express, SQLite)
- System architecture diagram
- Database schema design
- API contracts and endpoints
- Development milestones (8 phases, ~18 days)
- Resource allocation
- Testing strategy
- Deployment options

**Who reads this?**
- Engineers and architects
- DevOps and infrastructure teams
- Technical leads
- AI code generators (to understand how to build)
- Anyone asking "how will we build it?"

### Development Conventions

**[CONVENTIONS.md](CONVENTIONS.md)**

Contains SDD principles and guidelines:
- File organization and naming conventions
- Specs vs tech-plans separation
- SDD workflow and best practices
- Document lifecycle management

**Who reads this?**
- New team members
- Anyone setting up a new SDD project
- Teams wanting to understand the methodology

---

## 🛠️ Getting Started (Local Development)

### Prerequisites

- **Node.js** 22.15.0 or higher (you have this! ✓)
- **npm** 10.8.0 or higher (comes with Node.js)
- **Git** (for cloning and version control)
- **Text Editor** (VS Code recommended)

### Quick Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/orwanec/sdd-meetup-demo.git
cd sdd-meetup-demo

# 2. Install dependencies
npm install

# 3. Setup environment file
cp .env.example .env

# 4. Start the development server
npm start

# The app will be available at http://localhost:3000
```

### First Time Usage

1. Go to `http://localhost:3000`
2. Click **Register** to create an account
3. Enter an email and password (password must be 8+ characters)
4. You'll be redirected to login
5. Login with your credentials
6. Create your first task on the dashboard!

### Verify Installation

```bash
# Check Node version (should be 22.15.0+)
node --version

# Check npm version
npm --version

# Install dependencies (if not done above)
npm install

# Run the application
npm start

# Expected output:
# Server running on http://localhost:3000
# Database initialized at data/taskflow.db
```

---

## 📊 Project Status

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Product Specification | ✅ Complete | [specs/prd-001.md](specs/prd-001.md) | Product requirements finalized |
| Technical Plan | ✅ Complete | [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) | Architecture and milestones defined, ready for next context |
| Implementation | ⏳ Pending | `/src` | Ready to begin (see next step explanation) |
| Tests | ⏳ Pending | `/tests` | Planned for testing milestone |

---

## 🎓 Learning Objectives

By studying TaskFlow, you'll learn:

1. **How to write effective product specs**
   - Focus on user needs, not implementation
   - Be specific about requirements
   - Write testable acceptance criteria (guardrails for code)

2. **How to create technical plans**
   - Translate requirements into architecture
   - Make explicit technology decisions
   - Create realistic timelines

3. **How to organize SDD projects**
   - Separate product and technical concerns
   - Maintain traceability
   - Document assumptions and constraints

4. **SDD workflow in practice**
   - Specs before code
   - Clear handoff from product to engineering
   - Testing directly from acceptance criteria

5. **How SDD improves AI code generation**
   - Specs provide clear requirements and guardrails
   - Acceptance criteria serve as validation checkpoints
   - Traceability ensures code maps to requirements
   - Controlled generation reduces hallucinations

---

## 🔄 Why a New Context Window for Implementation?

This is a **critical aspect of Spec-Driven Development** that demonstrates why SDD is superior for complex projects, especially when working with AI assistance:

### The Problem with Single-Context Implementation

**If we implemented everything in one context window:**

#### 1. **Context Pollution & Token Waste**
The AI assistant would have to juggle multiple concerns simultaneously:
- Spec requirements (what to build)
- Technical architecture decisions (how to build it)
- Implementation code (building it)
- Test writing (validating it)
- All in one conversation, consuming massive token budget

**Impact:** Less tokens available per task → lower quality decisions

#### 2. **Loss of Traceability**
With 8 implementation milestones across ~18 days of development:
- Each code decision would need to reference the spec
- Architecture decisions would drift from the plan
- No clear audit trail of why decisions were made
- Future maintenance becomes difficult
- Can't explain to stakeholders "why did we do it this way?"

**Impact:** Code becomes unmaintainable → technical debt accumulates

#### 3. **Quality Degradation Over Time**
As the context fills up:
- Early architectural decisions get "forgotten" by the AI
- Consistency drifts (naming conventions, design patterns, code structure)
- AI has less "room" for detailed, thoughtful code generation
- Later milestones suffer as context fills
- Increases hallucinations and errors

**Impact:** First milestones good → Last milestones poor quality

#### 4. **Impossible for Real Teams**
In production development:
- Different people work on different milestones
- Code review happens at natural boundaries between features
- Stakeholders don't need to see implementation details
- Product team doesn't need technical deep-dives
- You can't have 20 people in one context window

**Impact:** Doesn't match real-world workflow

### The SDD Solution: Multiple Focused Context Windows

**By separating into distinct phases with fresh contexts:**

#### Phase 1 ✅ **COMPLETE** (This Current Context)

**Input:** Domain/problem understanding  
**Output:** Product specification (`prd-001.md`)  
**Artifacts:** 9 features, 8 requirements sections, 15 acceptance criteria, user personas  
**Size:** ~400 lines, focused on WHAT to build  
**Result:** Clear, executable requirements that never change

---

#### Phase 2 ✅ **COMPLETE** (This Current Context)

**Input:** Product specification  
**Output:** Technical plan with detailed milestones (`tech-plan-001.md`)  
**Artifacts:** Architecture diagrams, database schema, API endpoints, 8 implementation milestones  
**Size:** ~600 lines, focused on HOW to build it  
**Result:** Precise roadmap that code generation can follow exactly

---

#### Phase 3 ➜ **NEXT** (New Context Needed)

**Input:** Technical plan + specification  
**Output:** Implemented code for Milestone 1 (Foundation Setup)  
**Focus:** Single focused task - just set up project structure & database  
**Size:** ~500 lines of code, one milestone only  
**Benefits:**
- ✅ Clean slate = zero context pollution
- ✅ Single focus = better code quality
- ✅ Smaller token usage per milestone
- ✅ Easy to review each milestone independently
- ✅ Can debug/refactor one milestone without affecting others

**References:** Tech-plan for architecture, spec for requirements

---

#### Phase 4 ➜ **THEN**

**Input:** Milestone 1 code + Tech plan + Tests  
**Output:** Milestone 2 (Authentication System)  
**Focus:** Just auth logic - register, login, password hashing  
**Size:** ~1000 lines of code, one feature only  
**Benefits:**
- ✅ Fresh context, no old code to confuse AI
- ✅ Can deep-dive into security considerations
- ✅ Clear test requirements from spec
- ✅ Easy to validate against acceptance criteria

---

### Why This Matters: Concrete Comparison

```
❌ SINGLE CONTEXT (All-in-One):
┌─────────────────────────────────────────────────┐
│ Spec (400 lines) + Plan (600 lines)             │
│ + Milestone 1 code (500 lines)                  │
│ + Milestone 2 code (1000 lines)                 │
│ + Milestone 3 code (800 lines)                  │
│ + Milestone 4 code (1200 lines)                 │
│ + Milestone 5 code (600 lines)                  │
│ + Milestone 6 code (400 lines)                  │
│ + Milestone 7 code (900 lines)                  │
│ + Milestone 8 code (500 lines)                  │
│ + Tests (1500 lines)                            │
│ + Debugging/fixes (500 lines)                   │
│ ─────────────────────────────────────────────── │
│ = ~9000 lines in ONE context window             │
│                                                  │
│ Problems:                                       │
│ • Context gets polluted → loses focus           │
│ • Early decisions forgotten → inconsistency     │
│ • Token budget exhausted → lower quality        │
│ • Can't parallelize → serial workflow           │
│ • Hard to review/approve → all-or-nothing      │
│ • One bug in MS-3 requires re-doing MS-4,5,6   │
└─────────────────────────────────────────────────┘

✅ SDD MULTIPLE CONTEXTS (Spec-Driven):
┌──────────────────┐
│ Spec + Plan      │  Phase 1-2: Requirements & Design
│ ~1000 lines      │  Result: Clear roadmap ✓
└──────────────────┘
         ↓
    [Approval]
         ↓
┌──────────────────┐
│ Milestone 1      │  Fresh context: Foundation
│ ~500 lines       │  Result: Clean architecture ✓
│ + tests          │
└──────────────────┘
         ↓
┌──────────────────┐
│ Milestone 2      │  Fresh context: Auth
│ ~1000 lines      │  Result: Secure, tested ✓
│ + tests          │
└──────────────────┘
         ↓
┌──────────────────┐
│ Milestone 3      │  Fresh context: Dashboard
│ ~800 lines       │  Result: Polished UI ✓
│ + tests          │
└──────────────────┘
         ↓
    [and so on...]

Benefits:
✅ Each context ~1000-1500 lines = optimal quality
✅ Each milestone independently reviewable
✅ Early mistakes don't cascade
✅ Can parallelize different milestones
✅ Better token efficiency overall
✅ Clear approval gates between phases
✅ Real-world team workflow pattern
```

### Real-World Example: Task Authentication

**Single context problem:**
- Line 500: Define auth service
- Line 1200: Write auth tests
- Line 2400: Implement Dashboard (uses auth)
- Line 3800: Implement Tasks (uses auth)
- Line 4500: **BUG found in auth logic** 
- Problem: Dashboard and Tasks code already written, now needs revision
- Solution: Fix auth, re-test everything (time waste)

**SDD multiple context solution:**
- Context 1: Auth implemented, tested, approved ✓
- Context 2: Dashboard implemented, references proven auth ✓
- Context 3: Tasks implemented, references proven auth ✓
- Bug fix: Update auth in Context 1, regenerate Contexts 2-3 cleanly

---

### The SDD Principle: Separation of Concerns

| Phase | Context | Input Size | Output Size | Focus | Quality Driver |
|-------|---------|-----------|-----------|-------|-----------------|
| 1 | Product | Problem | PRD ~400 lines | **What** to build | Clear requirements |
| 2 | Planning | PRD | Plan ~600 lines | **How** to build | Architecture |
| 3 | Code (MS-1) | Plan | Foundation ~500 lines | Database setup | Single concern |
| 4 | Code (MS-2) | Plan + Tests | Auth ~1000 lines | Single feature | Acceptance criteria |
| 5 | Code (MS-3) | Plan + Tests | Dashboard ~800 lines | Single feature | Spec requirements |
| 6 | Code (MS-4) | Plan + Tests | Tasks ~1200 lines | Single feature | User workflows |
| 7 | Code (MS-5) | Plan + Tests | Styling ~600 lines | Single concern | Design specs |
| 8 | Code (MS-6) | Plan + Tests | Security ~400 lines | Single concern | Security requirements |
| 9 | Tests (MS-7) | All code | Tests ~1500 lines | Validation | Acceptance criteria |
| 10 | Docs (MS-8) | All code | Docs ~500 lines | Maintenance | Traceability |

**Total: ~9000 lines across 10 focused contexts**  
vs. **~9000 lines in 1 bloated context (poor quality)**

---

### Benefits of New Context for Implementation Phase

✅ **Focused Attention**  
- AI focuses on one milestone at a time  
- No "context fatigue" from reading everything  
- Can write better, more thoughtful code

✅ **Better Code Quality**  
- Each piece is well-designed and tested  
- Less technical debt  
- Code follows patterns consistently  

✅ **Token Efficiency**  
- Smaller focused conversations use fewer tokens overall  
- Can allocate tokens to quality within each context  
- Doesn't waste tokens on unnecessary context

✅ **Easy Code Review**  
- Each milestone is independently reviewable  
- Clear change boundaries  
- Stakeholders can approve one milestone at a time  

✅ **Parallel Work**  
- Different team members can work on different milestones  
- Or same person completes one before starting next  
- No merge conflicts or blocking dependencies within milestone

✅ **Traceability**  
- Each code section clearly links to spec requirements  
- Easy to answer: "Why is this code here?"  
- Can trace bugs back to requirements

✅ **Error Recovery**  
- If Milestone 3 has issues, only that context needs revision  
- Doesn't invalidate Milestones 1-2  
- Can restart Milestone 3 fresh if needed

✅ **Documentation**  
- Clear handoff between phases creates natural documentation  
- Each milestone has explicit success criteria  
- Easy to track progress

✅ **Real-world Scalability**  
- Matches how actual development teams work  
- Different specialists can own different milestones  
- Product owner can review specs separately from tech reviews  
- QA can test each milestone independently

---

### Why This Demonstrates SDD Excellence

This TaskFlow project is the **perfect teaching example** because:

1. **It shows the workflow in action** - Phases 1 & 2 complete, Phase 3 clearly outlined
2. **It prevents quality degradation** - Each milestone gets fresh context
3. **It enables collaboration** - Different people/contexts for different concerns
4. **It maximizes clarity** - Spec → Plan → Code with clear handoffs
5. **It supports AI generation** - Guardrails in specs guide each context
6. **It's maintainable** - Clear traceability makes future changes safe

---

## 🚀 Next Steps: Implementation Phase

The technical plan is now complete and ready for implementation. The next step requires:

### What Happens Next

1. **New Context Window** for **Phase 3: Implementation**
   - Provides fresh, clean context
   - References completed tech-plan and spec
   - Starts with Milestone 1 (Foundation Setup)
   - No pollution from previous work

2. **What to provide in next context:**
   ```
   "You are continuing TaskFlow development in Phase 3.
   
   Phase 1-2 COMPLETE:
   - specs/prd-001.md (product requirements)
   - tech-plans/tech-plan-001.md (technical architecture)
   
   NOW IMPLEMENT: Milestone 1 - Foundation Setup
   - Initialize Node.js project
   - Setup Express server structure
   - Create database initialization
   - Reference tech-plan for architecture
   - Trace each implementation back to spec requirements"
   ```

3. **Expected output from next context:**
   - Complete Foundation Setup (Milestone 1)
   - `package.json` with dependencies
   - Database initialization script
   - Express app skeleton
   - Entry point (`server.js`)
   - Ready to run: `npm start`

---

## 📖 Development Commands

Once implementation begins:

```bash
# Start development server (auto-reload with nodemon)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Seed database with test data
npm run seed

# Lint code
npm run lint

# Build for production (if applicable)
npm run build
```

---

## 🤝 Contributing

This is a demonstration project for a meetup. However, if you'd like to contribute or suggest improvements to the SDD approach:

1. **For product feedback** - Open an issue with "spec:" prefix
2. **For technical feedback** - Open an issue with "tech:" prefix
3. **For methodology feedback** - Open an issue with "sdd:" prefix

---

## 📚 Resources

### SDD Reading

- [Spec-Driven Development Best Practices](CONVENTIONS.md)
- [Product Requirements Document](specs/prd-001.md)
- [Technical Plan Template](tech-plans/tech-plan-001.md)

### Related Topics

- [Why Multiple Context Windows Matter for SDD](README.md#why-a-new-context-window-for-implementation)
- [Implementation Milestones](tech-plans/tech-plan-001.md#6-implementation-milestones)
- [Architecture Overview](tech-plans/tech-plan-001.md#2-architecture-overview)

### Meetup Presentation

This repository accompanies the "Spec-Driven Development in Action" meetup presentation.

**Topics Covered:**
- Why SDD matters for modern development
- How to separate product specs from technical plans
- Best practices for specification writing
- Real-world workflow and tools
- **SDD as guardrails for AI-assisted code generation**
- **Why multiple context windows improve code quality**
- Common pitfalls and how to avoid them

---

## ❓ Questions?

### For Product Questions
- Review [specs/prd-001.md](specs/prd-001.md)
- Check the "Out of Scope" section
- See "Future Enhancements" for roadmap

### For Technical Questions
- Review [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)
- Check [CONVENTIONS.md](CONVENTIONS.md) for file organization
- See development commands above

### For SDD Methodology Questions
- See [CONVENTIONS.md](CONVENTIONS.md)
- Review the workflow in this README
- Study the spec vs tech-plan comparison
- **Check "Why a New Context Window for Implementation?" section** ← **CRITICAL READ**

### For AI Code Generation Questions
- Review acceptance criteria in [specs/prd-001.md](specs/prd-001.md)
- Check architecture in [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)
- Ensure generated code is tested against requirements
- Read about context windows in [README.md#why-a-new-context-window-for-implementation](README.md#why-a-new-context-window-for-implementation)

---

## 📜 License

[Add appropriate license here]

---

## 📝 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-13 | Initial README with project setup |
| 1.1 | 2026-07-13 | Added Technical Plan (tech-plan-001.md) |
| 1.2 | 2026-07-13 | Added comprehensive explanation of why new context windows are essential for SDD |

---

**Happy learning! Let's build better products with Spec-Driven Development.** 🚀

**Current Status:** ✅ Specification Complete → ✅ Technical Plan Complete → ➜ Ready for Implementation (Phase 3)

**Next Action:** [Proceed to Milestone 1 Implementation](tech-plans/tech-plan-001.md#milestone-1-foundation-setup-days-1-2) in new context window
