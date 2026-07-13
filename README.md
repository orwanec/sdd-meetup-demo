# TaskFlow

A lightweight web application that helps individuals organize and track personal tasks.

**Showcasing Spec-Driven Development in Action for the Meetup**

---

## 📋 Overview

TaskFlow is a minimal yet powerful task management application designed to demonstrate **Spec-Driven Development (SDD)** principles in action. The project intentionally keeps the MVP focused, allowing users to create, complete, and manage their daily tasks without unnecessary complexity.

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
✅ **More guardrails for AI-generated code** - Clear specifications provide guardrails for AI code generation, ensuring AI output is controlled, validated, and aligned with product requirements rather than hallucinated or off-target. Acceptance criteria become checkpoints to verify AI-generated code meets actual requirements.

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
├── tests/                   # Test files
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
- Technology stack decisions
- System architecture
- Database design
- API contracts and endpoints
- Development phases and timeline
- Resource allocation
- Testing strategy

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

## 🛠️ Getting Started

### Prerequisites

- Git
- Text editor (VS Code recommended)
- Markdown preview capability

### Setup

```bash
# Clone the repository
git clone https://github.com/orwanec/sdd-meetup-demo.git
cd sdd-meetup-demo

# Read the conventions
cat CONVENTIONS.md

# Review the product spec
cat specs/prd-001.md

# Review the technical plan
cat tech-plans/tech-plan-001.md
```

### For Development

See [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) for:
- Technology stack setup
- Development environment configuration
- Build and run instructions
- Testing procedures

---

## 📊 Project Status

| Component | Status | Location |
|-----------|--------|----------|
| Product Specification | ✅ Complete | [specs/prd-001.md](specs/prd-001.md) |
| Technical Plan | ⏳ In Progress | [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md) |
| Implementation | ⏳ Pending | `/src` |
| Tests | ⏳ Pending | `/tests` |

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
- [Product Requirements Document Template](specs/prd-001.md)
- [Technical Plan Template](tech-plans/tech-plan-001.md)

### Meetup Presentation

This repository accompanies the "Spec-Driven Development in Action" meetup presentation.

**Topics Covered:**
- Why SDD matters for modern development
- How to separate product specs from technical plans
- Best practices for specification writing
- Real-world workflow and tools
- SDD as guardrails for AI-assisted code generation
- Common pitfalls and how to avoid them

---

## 📝 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-13 | Initial README and project setup |

---

## ❓ Questions?

### For Product Questions
- Review [specs/prd-001.md](specs/prd-001.md)
- Check the "Out of Scope" section
- See "Future Enhancements" for roadmap

### For Technical Questions
- Review [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)
- Check [CONVENTIONS.md](CONVENTIONS.md) for file organization

### For SDD Methodology Questions
- See [CONVENTIONS.md](CONVENTIONS.md)
- Review the workflow in this README
- Study the spec vs tech-plan comparison

### For AI Code Generation Questions
- Review acceptance criteria in [specs/prd-001.md](specs/prd-001.md)
- Check architecture in [tech-plans/tech-plan-001.md](tech-plans/tech-plan-001.md)
- Ensure generated code is tested against requirements

---

## 📜 License

[Add appropriate license here]

---

**Happy learning! Let's build better products with Spec-Driven Development.** 🚀
