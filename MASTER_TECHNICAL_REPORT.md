# Kilikoro Protocol: Master Technical Architecture & Engineering Deep-Dive Report
**Project:** Kilikoro Protocol (BuildX 2026 - Team Crown Chasers)  
**Classification:** Complete Software Architecture & System Blueprint  

---

## 1. The High-Level Architecture & Mechanical Loop

At its core, Kilikoro is an **automated trust and payment protocol for software developers**. It solves a fundamental breakdown in the hiring and freelance market: *employers cannot trust self-reported code quality because of AI copy-pasting, and student developers cannot trust employers to pay them on time without disputes.*

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KILIKORO MECHANICAL LOOP                        │
├────────────────────────────────────────────────────────────────────────┤
│ STEP 1: Employer locks capital into a BMONI Stablecoin Escrow Vault.  │
│ STEP 2: Student pulls task specs via Web or `kilikoro` CLI.            │
│ STEP 3: Student submits code to an isolated browser/node Sandbox.      │
│ STEP 4: AST Analyzer decomposes code skeleton & measures complexity.   │
│ STEP 5: Test Harness executes inputs (N=10 to N=10,000) under 64MB cap.│
│ STEP 6: Cryptographic Execution Receipt is generated & signed.         │
│ STEP 7: BMONI Oracle triggers instant (<2s) payout to Virtual Card.   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The AST Analysis Engine (How We Actually Inspect Code)

### What Happens When Code is Submitted?
When a developer writes code, text characters alone do not convey the computational structure. A developer could name a variable `totalCount` or `x`; an AI model might write verbose boilerplate with redundant try-catch blocks.

Kilikoro parses the raw source code into an **Abstract Syntax Tree (AST)** using a lightweight, deterministic parser (`acorn` or `@babel/parser`).

### The 4-Stage AST Inspection Pipeline:

```
[Raw JavaScript Source]
         │
         ▼
[Stage 1: Lexical Tokenization & Syntax Tree Generation]
         │
         ▼
[Stage 2: AST Normalization & Identifier Canonicalization]
         │
         ▼
[Stage 3: Cyclomatic Complexity & Syntactic Entropy Scoring]
         │
         ▼
[Stage 4: Asymptotic Big-O Growth Detection via Dynamic Input Stress]
```

#### Stage 1: Tokenization
The parser converts source code into an AST node hierarchy. For example:
```javascript
function findTarget(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
```
Becomes an AST JSON tree:
* `FunctionDeclaration` (`id: "findTarget"`)
  * `BlockStatement`
    * `ForStatement` (`init: VariableDeclaration`, `test: BinaryExpression`, `update: UpdateExpression`)
      * `IfStatement` (`test: BinaryExpression`, `consequent: ReturnStatement`)

#### Stage 2: AST Normalization (Anti-Obfuscation)
Students frequently attempt to disguise ChatGPT code by renaming variables or re-ordering functions.
* **The Normalizer**: Walks the AST and renames every identifier into canonical sequentially indexed keys:
  * Variable declarations become `_v0`, `_v1`, `_v2`.
  * Parameter identifiers become `_p0`, `_p1`.
  * Function declarations become `_fn0`.
* This ensures that two pieces of code with identical logic produce an **identical structural hash**, completely defeating variable-renaming tricks.

#### Stage 3: Cyclomatic Complexity & Entropy Scoring
* **Cyclomatic Complexity ($M$)**: Measured by counting decision points:
  $$M = E - N + 2P$$
  Where $E$ = number of edges, $N$ = number of nodes, $P$ = number of connected components (or simply: $1 + \text{number of `if`, `while`, `for`, `case`, `&&`, `||`}$).
* **AI Boilerplate Detection**: AI-generated code features abnormally low syntactic entropy combined with high nesting depth and redundant defensive wrappers (e.g., unnecessary `typeof` checks). If the structural entropy falls within known LLM template centroids with $>90\%$ confidence, the engine flags it for algorithmic review.

#### Stage 4: Dynamic Asymptotic Big-O Detection
Static analysis cannot catch every inefficiency. Kilikoro injects 4 dynamic inputs of increasing magnitudes:
* $N_1 = 10$ items
* $N_2 = 100$ items
* $N_3 = 1,000$ items
* $N_4 = 10,000$ items
The engine records wall-clock execution time and instruction ticks across each tier:
* If $T(N)$ scales linearly ($\approx 10\times$ increase for $10\times$ items), it confirms $O(N)$ or $O(N \log N)$.
* If $T(N)$ scales quadratically ($\approx 100\times$ increase for $10\times$ items), it detects an $O(N^2)$ brute-force loop and rejects the submission with a detailed complexity graph.

---

## 3. The Execution Sandbox (Safe, Isolated & Uncrashable)

### The Sandbox Problem:
If you let random users run code on your server or in your browser, malicious developers can:
1. Write `while(true) {}` to freeze the browser or lock the CPU.
2. Allocate a 10GB array to crash system memory (Out of Memory error).
3. Try to access `window.localStorage` or steal cookies.
4. Try to make rogue network requests (`fetch('evil.com')`).

### How Kilikoro Solves This: The Dual-Sandbox Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DUAL-SANDBOX ARCHITECTURE                       │
├───────────────────────────────────┬────────────────────────────────────┤
│ TIER A: IN-BROWSER WEB WORKER     │ TIER B: ISOLATED NODE/WASM RUNNER  │
│ (Used for instant UI feedback)    │ (Used by CLI & Final Verification) │
│ - Spawns a dedicated Web Worker   │ - Runs in child process / V8 vm    │
│ - Zero DOM / Window access        │ - Memory capped via --max-old-space│
│ - AbortController hard 3,000ms    │ - Process stripped of filesystem   │
│ - Stripped Global Scope           │ - Signals exit code & runtime stats│
└───────────────────────────────────┴────────────────────────────────────┘
```

#### The Stripped Global Scope:
Before executing user code inside the Worker, the global context is neutralized:
```javascript
const blockedGlobals = [
  'window', 'document', 'fetch', 'XMLHttpRequest', 'WebSocket',
  'localStorage', 'sessionStorage', 'indexedDB', 'location', 'navigator'
];
for (const key of blockedGlobals) {
  try { Object.defineProperty(self, key, { value: undefined, writable: false }); } catch(e) {}
}
```

#### The Hard Timeout Guard:
```javascript
const executionTimeout = setTimeout(() => {
  worker.terminate();
  reject(new Error("EXECUTION_TIMEOUT: Code exceeded 3,000ms wall-clock limit."));
}, 3000);
```

---

## 4. The BMONI Smart Escrow & Payment Engine

### The Escrow Lifecycle (Zero Human Delays):

```
[Employer: Post Task] ──► [Locks $150 USDC in Escrow Vault] 
                                    │
                                    ▼
                          [State: ESCROW_LOCKED]
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
  [Submission Passes Tests]                       [Deadline Passes / Incomplete]
            │                                               │
            ▼                                               ▼
[Sandbox Signs Attestation Digest]                [Funds Return to Employer]
            │
            ▼
[BMONI Oracle Calls Release API]
            │
            ▼
[Balance Credits Student Mastercard] (<2 seconds)
```

### BMONI State Machine Definitions:
1. `DRAFT`: Task created by employer; funds not yet committed.
2. `ESCROW_LOCKED`: Capital deposited ($150 USDC + 2.5% protocol fee). BMONI vault holds funds under smart contract lock.
3. `EVALUATING`: Submission received; sandbox is currently executing assertions.
4. `VERIFIED_PASS`: All 3 assertion suites passed; cryptographic hash generated.
5. `SETTLED`: BMONI payment API confirmed; virtual Mastercard credited; milestone closed.
6. `REFUNDED`: No valid solution submitted within deadline; 100% of principal returned to employer.

---

## 5. Screen-by-Screen User Journey (Every Interaction Detailed)

### Screen 1: Home / Task Directory
* **Purpose**: Student views open bounties and their funded stablecoin rewards.
* **Key Elements**:
  * Filter pills: `All`, `Algorithms`, `FinTech`, `Data Structures`, `Highest Reward`.
  * Task Card:
    * Title: *"Build High-Throughput Memory Cache"*
    * Reward: `$150.00 USDC` (`₦240,000 cNGN`)
    * Sponsor: `BMONI FinTech Labs`
    * Constraint: `O(N log N) • Max 50ms • JavaScript`
    * Status: `Active Escrow (1 Funded Spot)`
    * Button: `[Accept & Open Terminal]`

---

### Screen 2: Student Coding Workspace (The Main Hub)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to Tasks]   Task #104: High-Throughput Cache ($150 USDC)      [Submit Solution]│
├────────────────────────────┬───────────────────────────────┬───────────────────────────┤
│ TASK REQUIREMENTS          │ MONACO CODE EDITOR            │ LIVE BMONI VIRTUAL CARD   │
│ - Problem description      │ - Language dropdown (JS/TS)   │ - Metallic 3D card        │
│ - Input/Output examples    │ - Code editor area            │ - Real-time balance       │
│ - Memory: Max 64MB         │ - [Run Tests] (Ctrl+Enter)    │ - Flip for CVV / Details  │
│ - Target: O(N log N)       │ - [Reset Code]                ├───────────────────────────┤
│                            │                               │ TEST RUNNER & AST METER   │
│                            │                               │ - Test 1: Basic    [PASS] │
│                            │                               │ - Test 2: Edge     [PASS] │
│                            │                               │ - Test 3: Stress   [PASS] │
│                            │                               │ - Memory: 18.4MB | 32ms   │
└────────────────────────────┴───────────────────────────────┴───────────────────────────┘
```

#### Detailed Element States:
1. **[Run Tests] Button**:
   * Default: Dark cyan button with play icon.
   * On Click: Changes to loading state (`"Executing Sandbox..."` with spinning loader), disables editor to prevent race conditions.
   * On Finish: Plays subtle audio chime; test bars light up green or red.
2. **The 3 Test Bars**:
   * Test 1 (Basic assertions): Instant (5ms).
   * Test 2 (Boundary edge cases): Instant (8ms).
   * Test 3 (Stress dataset $N=10,000$): Takes ~25ms; confirms asymptotic curve.
3. **The BMONI Virtual Mastercard**:
   * Default balance: `$0.00 USDC`.
   * On Successful Submit: The card pulses with an emerald green border; the numbers roll up dynamically from `$0.00` to `$150.00 USDC` with confetti feedback.

---

### Screen 3: Employer Escrow Cockpit
* **Purpose**: Enables clients to fund milestones, configure test assertions, and review verified candidates.
* **Key Elements**:
  * Task Creation Form: Title, Description, Reward input ($), and Test Assertion Configurator.
  * Escrow Deposit Modal: Displays breakdown: `$150.00 Payout` + `$3.75 Platform Fee (2.5%)` = `$153.75 Total`.
  * Candidate Review Ledger: Lists submitted students, NACOS Chapter ID, AST originality score, and test execution duration.

---

### Screen 4: Public Verification Portal
* **Purpose**: Anyone (recruiter, company, judge) can verify a student's skills cryptographically.
* **Key Elements**:
  * Search bar for Student ID or Attestation Hash.
  * Certificate Card: Displays student name, university chapter, algorithm verified, AST originality rating, and digital signature from `NACOS-ROOT-KEY`.

---

## 6. The Developer CLI (`kilikoro-cli`) Architecture

The CLI is a terminal-native tool built in Node.js, providing developer ergonomics for students who code in VS Code, Neovim, or terminal:

### Directory Structure of a Pulled Task:
```
my-task-104/
├── problem.md           # Problem specification & constraints
├── solution.js          # Where the student writes their algorithm
└── test_harness.js      # Local test runner with sample inputs
```

### CLI Execution Workflow:
1. `kilikoro pull task-104` $\to$ Downloads task files locally.
2. Developer edits `solution.js` in their favorite editor.
3. `kilikoro test --profile` $\to$ Executes local AST parser and runs inputs.
   * Output:
     ```bash
     [AST Checker]  Analyzing syntax structure... [OK] Human Logic
     [Complexity]   Dynamic scaling N=10..10000... [OK] O(N log N)
     [Assertions]   3/3 Test Suites Passed (32ms, 18.2MB Heap)
     ```
4. `kilikoro submit` $\to$ Signs bundle, sends digest to verifier, releases BMONI escrow:
   ```bash
   [Kilikoro]     Submitting verified solution...
   [Attestation]  Receipt signed: 0x4f8a...92b1
   [BMONI Escrow] Payout released! $150.00 USDC credited to Virtual Card (**** 4892)
   ```

---

## 7. Edge Cases, Try/Catch Handlers & Security Defenses

### Failure Matrix & Defensive Engineering:

| Edge Case / Threat | Real-World Scenario | Defensive Engineering Architecture |
| :--- | :--- | :--- |
| **Power / Battery Outage** | Student laptop dies while typing code. | Monaco editor autosaves to `localStorage` every 1.5 seconds. Upon reopening, draft is fully restored with a *"Draft restored from local backup"* notice. |
| **Network Loss During Coding** | Wi-Fi cuts out in Nigerian university hostel. | Sandbox runs 100% locally in browser memory. Testing still works without internet. |
| **Network Loss on Submit** | Wi-Fi cuts out at the exact second user clicks [Submit]. | Submission packet is cached in an IndexedDB Outbox. Background worker listens for `window.online` and automatically submits with the original timestamp. |
| **Hostile Code: Infinite Loop** | Student submits `while(true) {}`. | Web Worker is bounded by an `AbortController` and 3,000ms timer. Worker is killed; browser never freezes. |
| **Hostile Code: Memory Explosion** | Student submits `new Array(1e9)`. | Sandbox enforces a 64MB memory heap ceiling; gracefully catches out-of-memory error without browser tab crashing. |
| **Hostile Code: System Tampering** | Code tries to run `eval()`, `fetch()`, or access `localStorage`. | Stripped execution scope removes all web APIs and evaluates inside a locked proxy sandbox. |
| **ChatGPT Copy-Paste** | Student renames ChatGPT variable names to appear original. | AST Normalization canonicalizes all variable identifiers, and dynamic input stress tests reveal brute-force $O(N^2)$ algorithmic structures. |
| **Client-Side DevTools Tampering** | Student alters frontend JavaScript variables to fake a passing score. | BMONI Escrow Oracle requires an authentic cryptographic digest signed by the execution engine. Client state modification is rejected by the smart contract. |
| **Replay Attack on Escrow** | Hacker intercepts payout API call and attempts to send it twice. | Every milestone release burns a single-use cryptographic Nonce. Replay requests are immediately rejected as duplicate transactions. |

---

## 8. Data Models & API Specifications

### Task Schema:
```json
{
  "taskId": "task-bmoni-104",
  "title": "Optimize High-Frequency Cache Expiry",
  "category": "Algorithms",
  "reward": { "amountUSDC": 150.00, "amountCNGN": 240000.00 },
  "constraints": { "maxTimeMs": 50, "maxMemoryMB": 64, "targetComplexity": "O(N log N)" },
  "testCases": [
    { "input": [10, 5, 2, 8, 7], "expected": [2, 5, 7, 8, 10], "hidden": false },
    { "input": [1000, 500, 200], "expected": [200, 500, 1000], "hidden": false },
    { "inputGenerator": "stress_10k_elements", "hidden": true }
  ]
}
```

### Escrow State Model:
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
  "nonce": "NONCE-UNILAG-B104-9921"
}
```
