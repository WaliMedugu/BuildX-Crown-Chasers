# Kilikoro Protocol 🚀
**BuildX 2026 Innovation Challenge Submission**  
*Team Crown Chasers | NACOS National*  
*Tracks: Open Payments & FinTech / Digital Innovation*  

---

## Overview

**Kilikoro Protocol** is a deterministic proof-of-competence engine and programmable stablecoin milestone escrow platform built for Nigerian computing students.

It solves the African Developer Credential Paradox:
1. **The Code X-Ray (Anti-AI Sandbox)**: Parses code directly into an Abstract Syntax Tree (AST), checking structural cyclomatic complexity, syntactic entropy, and dynamic Big-O scaling ($N = 10 \to 10,000$) to mathematically differentiate authentic human logic from ChatGPT boilerplate.
2. **NACOS Cryptographic Attestations**: Mints a verifiable proof-of-competence credential signed by the student's NACOS Chapter key.
3. **Instant BMONI Stablecoin Settlement**: When code passes all assertions, funds unlock in under 2 seconds directly to the student's **BMONI Virtual Mastercard**.

---

## Design System (Claude / Anthropic Theme)
The application adheres strictly to the **Anthropic / Claude design aesthetic**:
* Warm terracotta accents (`#D97757`) and refined obsidian charcoal (`#191918`, `#141413`).
* Editorial typography (`Newsreader` serif headers paired with `Inter` and `JetBrains Mono`).
* Minimalist pill badges, rounded geometries (10–14px), and interactive 3D virtual debit card.

---

## Project Structure
```
BuildX-Crown-Chasers/
├── index.html                           # Master Single Page Application
├── css/
│   └── claude-theme.css                 # Complete Claude / Anthropic Design System
├── js/
│   ├── ast-engine.js                    # AST parser, cyclomatic scorer, AI entropy & Big-O tester
│   ├── escrow-simulator.js              # BMONI stablecoin escrow vault & oracle state machine
│   └── app.js                           # UI controller, Monaco editor sync, 3D card flip & confetti
├── kilikoro.js                          # Developer CLI runner (node kilikoro.js test)
├── package.json                         # Project metadata and run scripts
├── project_management_tasks.csv         # Team task tracker (17 tasks)
├── project_management_tasks.tsv         # Google Sheets 1-click paste tracker
├── MASTER_TECHNICAL_REPORT.md           # 8-chapter master engineering specification
└── SYSTEM_ENGINEERING_SPECIFICATION.md  # Screen-by-screen, try-catch & security blueprint
```

---

## Getting Started

### 1. Web Portal (Browser)
Simply open `index.html` in any modern web browser, or run a local server:
```bash
# Using Node.js serve
npx serve -l 3000 .

# Or using Python
python -m http.server 3000
```
Then navigate to `http://localhost:3000`.

### 2. Developer CLI (`kilikoro-cli`)
You can run the terminal developer workflow directly:
```bash
# Run local AST inspection & assertion sandbox
node kilikoro.js test

# Submit solution & trigger instant BMONI escrow release
node kilikoro.js submit

# Check BMONI Virtual Mastercard balance
node kilikoro.js balance
```

---

## Live Demo Walkthrough (90 Seconds)
1. **The AI Trap**: In the Student Workspace, click `AI Boilerplate Trap` $\to$ click `Run Tests`. Watch the AST visualizer flag high AI template pattern (red) and reject the submission.
2. **The Authentic Pass**: Click `Authentic Code` $\to$ click `Run Tests`. Watch all 3 assertion bars turn green, verifying $O(N \log N)$ complexity and authentic human syntax.
3. **Instant Settlement**: Click `Submit & Claim`. Watch the BMONI Oracle verify the signature and update the metallic BMONI Virtual Mastercard balance from `$0.00` to `$150.00 USDC` (`₦240,000 cNGN`) in 1.8 seconds with celebration confetti!

---

## License
MIT License • Team Crown Chasers • BuildX 2026