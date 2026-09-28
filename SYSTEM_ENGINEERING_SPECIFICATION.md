# Kilikoro Protocol: Exhaustive System, UI/UX & Security Specification

---

## 1. System Mental Model (How Everything Connects)

Kilikoro is composed of 4 core building blocks that communicate seamlessly:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KILIKORO SYSTEM TOPOLOGY                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CLIENT INTERFACES: Web Hub (Browser SPA) & Developer CLI (Node.js)  │
│ 2. EXECUTION ENGINE: Isolated Worker Sandbox + Acorn AST Normalizer    │
│ 3. ESCROW STATE MACHINE: BMONI Stablecoin Vault & Release Oracle       │
│ 4. TRUST REGISTRY: NACOS Chapter Cryptographic Signature Attestations  │
└────────────────────────────────────────────────────────────────────────┘
```

* **Zero Magic Principle**: Nothing is left to vague assumptions. If a user clicks a button, a defined state transitions; if code runs, it is bounded by a timer; if money moves, it requires a verified cryptographic receipt.

---

## 2. Screen-by-Screen & Interaction Blueprint (Every Button, State & Gesture)

### Screen 1: The Dual-Portal Navigation & Header
* **Fixed Header (Top Bar)**:
  * **Logo**: `Kilikoro` icon (obsidian polygon with a glowing cyan center). Clicking always returns to the main dashboard.
  * **Network Status Pill**: Shows `BMONI Testnet • 12ms latency` (green dot if online, pulsing amber if offline/reconnecting).
  * **Portal Switcher Tabs**:
    * Tab 1: `Student Workspace` (Default for devs)
    * Tab 2: `Employer Cockpit` (For task creators and bounties)
    * Tab 3: `Public Verifier` (For recruiters and public audits)
  * **Student Profile Pill**: Displays NACOS Student ID (`UNILAG-CS-2026-0482`), university crest icon, and verified skill tier badge (`Level 3: Algorithms & Systems`).
  * **Theme / Sound Toggle**: Mute/unmute subtle audio clicks on successful code compile and payment unlock.

---

### Screen 2: Student Workspace (The Core Coding Terminal)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to Tasks]  Bounty #104: Optimize Cache Expiry ($150 USDC)   [Submit Code] │
├──────────────────────────┬─────────────────────────────────┬───────────────────────┤
│ LEFT: TASK SPECIFICATION │ CENTER: MONACO CODE EDITOR      │ RIGHT: BMONI CARD &   │
│ - Problem Description    │ - Language selector (JS/TS)     │ TEST RESULTS          │
│ - Input / Output samples │ - Line numbers, syntax theme    │ - 3D Virtual Card     │
│ - Complexity Constraint: │ - "Run Local Test" button       │ - Test Assertion Bars │
│   O(N log N) limit       │ - "Reset Code" button           │ - AST Complexity Tree │
│ - Max Memory: 64 MB      │ - Keyboard shortcut legend      │ - Live Payout Ledger  │
└──────────────────────────┴─────────────────────────────────┴───────────────────────┘
```

#### Detailed Interactions & Controls:
1. **[← Back to Tasks] Button**:
   * **Action**: Checks if code editor has unsaved changes. If dirty, triggers confirmation dialog: *"You have unsaved code changes. Leave anyway?"* (Cancel / Leave).
   * **Navigation**: Returns cleanly to the bounty list without reloading the page.
2. **Left Panel: Task Specification**:
   * **Tags**: Category tag (`Data Structures`), Payout badge (`$150.00 USDC / ₦240,000 cNGN`), Time remaining counter (`14 hrs left`).
   * **Collapsible Sections**: Problem Overview, Example Test Cases, Constraints ($N \le 10,000$).
   * **Copy Sample Button**: One-click copies example input/output directly to clipboard with a 2-second checkmark icon feedback.
3. **Center Panel: Code Editor (Monaco Editor)**:
   * **Editor Toolbar**:
     * Language dropdown (JavaScript / TypeScript / Python).
     * Format Code button (Prettier-integrated).
     * Font size adjuster ($12px \to 18px$).
     * Fullscreen toggle button.
   * **Empty State**: Displays starter code boilerplate with clear `TODO` comments.
   * **Safety Features**: Autosaves draft to browser `localStorage` every 1,500ms so a student never loses work if their laptop battery dies or power drops.
4. **Bottom Drawer: Test Runner & Output Console**:
   * **Status Banner**: Displays current phase (`Ready`, `Executing...`, `Passed`, `Failed`).
   * **Assertion Meters**: 3 distinct visual bars (Test 1: Basic Input, Test 2: Edge Cases, Test 3: Large Dataset $N=10,000$).
   * **Console Log Output**: Styled like a UNIX terminal (black background, monospace font) displaying `stdout`, memory consumption (`Heap: 18.4 MB`), and wall-clock execution time (`Time: 32ms`).
5. **Right Panel: The BMONI Virtual Mastercard**:
   * **Visual Styling**: Sleek metallic brushed titanium card with gold chip and Mastercard brand logos.
   * **Balance Display**: Live balance in USDC and cNGN with an eye toggle (Show/Hide balance).
   * **Card Controls**:
     * `Flip Card`: Rotates card in 3D to show CVV and expiration date.
     * `Freeze Card`: Instant one-click toggle to lock card in case of lost credentials.
     * `Transaction History`: Mini drawer showing latest payouts and campus store POS transactions.

---

### Screen 3: Employer Cockpit (Task Creator & Escrow Vault)

#### Detailed Interactions & Controls:
1. **Create Milestone Task Form**:
   * **Inputs**: Task Title, Detailed Description, Category selector, Due Date picker.
   * **Reward Amount**: Dollar input ($) with live conversion to stablecoins (USDC) and Nigerian Naira (cNGN) based on live exchange rates.
   * **Test Case Configurator**: Interface where the employer adds input JSON, expected output JSON, and max allowed execution time (e.g., `100ms`).
2. **Escrow Lock Modal**:
   * **Trigger**: Clicking `[Deposit & Lock Escrow]`.
   * **Details Shown**: Milestone Payout ($150.00) + Kilikoro 2.5% Protocol Fee ($3.75) = Total Locked: `$153.75 USDC`.
   * **Simulation / API Bridge**: Shows BMONI wallet connection button. When clicked, demonstrates a simulated 2-second cryptographic signature locking funds into escrow.
   * **Escrow Status Pill**: Changes from `DRAFT` to `ESCROW LOCKED` with a gold padlock icon.
3. **Live Submissions & Candidate Review Table**:
   * **Columns**: Student Name, NACOS Chapter, Submission Time, AST Originality Score (%), Test Pass Ratio (12/12), Cryptographic Hash, Actions.
   * **Audit Modal**: Clicking any student row opens a side sheet showing their code's AST syntax breakdown, memory usage chart, and verification certificate.

---

### Screen 4: Public Verifier (Recruiter / Public Proof-of-Skill)
* **Search Bar**: Centered search input supporting:
  * Student NACOS ID (e.g., `NACOS/UNILAG/2026/0482`)
  * Cryptographic Hash (e.g., `0x8f2a...`)
  * QR Code Scan (activates laptop/phone camera to scan physical student badge).
* **Verification Certificate Display**:
  * Issued by: `NACOS National Root Key • Chapter Node #04 (UNILAG)`
  * Candidate: Verified Student Builder
  * Authenticity Score: `99.2% (Deterministic Human Syntax)`
  * Algorithmic Speed Grade: `Grade A (Asymptotic O(N log N))`
  * Milestone Track Record: `3 Funded Tasks Completed • $450 USDC Total Earned`

---

## 3. The Developer CLI Specification (`kilikoro-cli`)

For developers working inside VS Code or Linux/macOS/Windows terminals:

### Command Matrix & Behavior:

| Command | Arguments / Flags | What It Does | Error / Resilience Handling |
| :--- | :--- | :--- | :--- |
| `kilikoro auth login` | `--nacos-id <id>`, `--key <key>` | Authenticates developer and binds BMONI wallet address to `~/.kilikoro/config.json`. | Flags invalid ID format; securely prompts for password/key with hidden typing. |
| `kilikoro pull` | `<task-id>` | Creates a local directory `./task-<id>/` containing `problem.md`, `solution.js`, and `test_harness.js`. | If directory already exists, warns before overwriting; falls back to offline cache if network fails. |
| `kilikoro test` | `--profile`, `--verbose` | Runs the local sandbox: compiles code, builds AST, measures memory heap, runs edge test cases. | Catches infinite loops after 3,000ms; prints line-by-line syntax errors with code snippets. |
| `kilikoro submit` | `--message <commit-msg>` | Signs the code bundle cryptographically, dispatches to Kilikoro verifier, triggers BMONI escrow payout. | Validates that local tests pass first; if failed, rejects submission locally without wasting network bandwidth. |
| `kilikoro balance` | None | Queries live BMONI wallet balance and virtual card status. | Displays cached balance if offline with a "last updated 5 mins ago" warning. |

---

## 4. Try/Catch, Network & Fault-Tolerance Architecture

In real-world Nigerian environments, power drops and intermittent 2G/3G/4G connectivity happen. The platform must be bulletproof against these realities:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FAULT-TOLERANCE DEFENSE LAYERS                    │
├────────────────────────────────────────────────────────────────────────┤
│ 1. OFFLINE-FIRST CACHING: IndexedDB stores active code and task state  │
│ 2. RESILIENT RETRIES: Exponential backoff with jitter on network drop  │
│ 3. IDEMPOTENT SETTLEMENT: Unique nonce prevents double-claim payouts   │
│ 4. GRACEFUL DEGRADATION: Full test runner executes 100% in browser     │
└────────────────────────────────────────────────────────────────────────┘
```

### Specific Failure Modes & Built-in Defenses:

1. **Failure Mode: Internet connection drops mid-coding**:
   * *System Behavior*: Monaco editor autosaves to `IndexedDB`. The network status pill changes to amber: *"Offline Mode - Code saved locally"*.
   * *Resolution*: When connection returns, background sync silently verifies state without interrupting the user.
2. **Failure Mode: Internet drops right as user clicks [Submit]**:
   * *System Behavior*: The submission packet is queued in an offline IndexedDB outbox.
   * *Resolution*: As soon as network ping succeeds, the submission is automatically dispatched with its original timestamp.
3. **Failure Mode: Student submits an Infinite Loop (`while(true)`)**:
   * *System Behavior*: The execution sandbox runs inside an isolated Web Worker with a strict `3,000ms` hard timeout.
   * *Resolution*: The main browser thread never freezes. At 3,001ms, the worker is terminated via `worker.terminate()`, and the UI displays: *"Error: Execution timed out (3,000ms limit exceeded). Check for infinite loops in lines 14-22."*
4. **Failure Mode: Out-of-Memory Bomb (Allocating 10GB array)**:
   * *System Behavior*: Sandbox limits maximum memory allocation to `64MB`.
   * *Resolution*: Catches heap overflow gracefully and returns: *"Error: Memory limit exceeded (Allocated > 64MB). Optimize data structure space complexity."*

---

## 5. Security & Anti-Cheat Countermeasures

Hackathons and freelance platforms suffer from cheat attempts. Here is how Kilikoro mathematically prevents them:

### Threat 1: Malicious Code Trying to Hack the Host Machine
* **Attack**: Student writes code containing `process.exit()`, `require('fs')`, or `window.localStorage.clear()`.
* **Defense**:
  1. The code is executed inside a scoped context with `window`, `document`, `process`, `fetch`, and `XMLHttpRequest` completely blocked or mocked.
  2. The AST parser does a pre-execution security scan; any access to `eval`, `Function`, `__proto__`, or `constructor` causes immediate rejection before execution begins.

### Threat 2: Student Copies Directly from ChatGPT
* **Attack**: Student pastes an AI-generated solution with renamed variables.
* **Defense**:
  1. **AST Normalization**: All variable and function names are normalized into canonical nodes (`var_0`, `var_1`, `func_0`).
  2. **Syntax Entropy & Boilerplate Signature**: AI models consistently generate specific syntax markers (e.g., overly verbose try-catch wrappers, standardized guard clauses, distinct nesting patterns). If syntax entropy matches known LLM templates above 90%, it flags: *"High AI Pattern Detected. Please implement your custom algorithm."*
  3. **Dynamic Asymptotic Stress-Testing**: The sandbox runs the function with $N=10, 100, 1000, 10000$. If a student uses an easy $O(N^2)$ brute-force solution copied from AI, the time curve spikes exponentially and fails the $O(N \log N)$ benchmark requirement.

### Threat 3: Client-Side Tampering (Editing Frontend JS to "Fake" a Pass)
* **Attack**: A tech-savvy student opens Chrome DevTools, edits the JavaScript variables, and tries to trigger the BMONI payout directly.
* **Defense**:
  * The frontend is only a display. The **BMONI Escrow Release Oracle** requires a cryptographically signed execution receipt produced by the sandbox engine. If the signature doesn't match the test digest, the escrow smart contract rejects the payout call instantly.

### Threat 4: Replay Attacks (Trying to claim the same bounty payout twice)
* **Attack**: Intercepting a valid payout API request and sending it again to get double payment.
* **Defense**:
  * Every payout requires a unique **Milestone Nonce** (e.g., `NONCE-UNILAG-B104-SUB902`). Once settled, that nonce is permanently recorded as `SETTLED` in the ledger. Any subsequent request with that nonce is discarded.

---

## 6. Complete Data Models & State Schema

### A. The Task Model (JSON):
```json
{
  "taskId": "task-bmoni-104",
  "title": "Optimize High-Frequency Cache Expiry",
  "category": "Algorithms",
  "reward": {
    "amountUSDC": 150.00,
    "amountCNGN": 240000.00
  },
  "constraints": {
    "maxTimeMs": 50,
    "maxMemoryMB": 64,
    "targetComplexity": "O(N log N)"
  },
  "testCases": [
    { "input": [10, 5, 2, 8, 7], "expected": [2, 5, 7, 8, 10], "hidden": false },
    { "input": [1000, 500, 200], "expected": [200, 500, 1000], "hidden": false },
    { "inputGenerator": "stress_10k_elements", "hidden": true }
  ]
}
```

### B. The Escrow State Machine:
```json
{
  "escrowId": "escrow-90218",
  "taskId": "task-bmoni-104",
  "employerId": "emp-fintech-lagos",
  "totalLockedUSDC": 153.75,
  "developerPayoutUSDC": 150.00,
  "protocolFeeUSDC": 3.75,
  "state": "ESCROW_LOCKED", 
  "assignedDeveloperId": "nacos-unilag-0482",
  "timestampLocked": "2026-09-28T22:30:00Z",
  "payoutTransactionHash": null
}
```

### C. The Cryptographic Attestation Output:
```json
{
  "attestationId": "attest-77492-unilag",
  "developer": "Chidi Okonkwo (NACOS/UNILAG/2026/0482)",
  "chapterKey": "0x4b9f...unilag_node_01",
  "taskCompleted": "task-bmoni-104",
  "metrics": {
    "testsPassed": "3/3 (100%)",
    "runtimeMs": 32,
    "complexityVerified": "O(N log N)",
    "originalityScore": 98.4
  },
  "payoutStatus": "SETTLED_TO_BMONI_CARD",
  "signature": "MEQCIG9f...3d91kZ"
}
```
