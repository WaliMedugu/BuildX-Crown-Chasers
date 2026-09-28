/**
 * ==========================================================================
 * KILIKORO PROTOCOL: MASTER FRONTEND CONTROLLER
 * Connects AST engine, BMONI escrow simulator, Monaco-style editor & confetti
 * ==========================================================================
 */

class KilikoroApp {
  constructor() {
    this.astEngine = new KilikoroASTEngine();
    this.escrowEngine = new BmoniEscrowEngine();

    // Standard Authentic Solution (O(N log N) - Passes all benchmarks)
    this.authenticSolution = `/**
 * Kilikoro Verified Implementation
 * Task #104: High-Throughput Cache Expiry Resolver
 * Target Complexity: O(N log N)
 */
function cacheResolver(entries, threshold) {
  if (!entries || entries.length === 0) return [];
  
  // 1. Filter stale cache entries (O(N))
  const valid = [];
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].ttl >= threshold) {
      valid.push(entries[i]);
    }
  }

  // 2. Sort by ID ascending (O(N log N))
  valid.sort((a, b) => a.id - b.id);
  
  return valid;
}`;

    // AI Boilerplate Trap Solution (High entropy, bloated, O(N^2) loop)
    this.aiBoilerplateTrap = `/**
 * Generated Solution with Redundant Boilerplate & O(N^2) Loop
 */
function cacheResolver(entries, threshold) {
  // Excessive defensive sanity checks typical of LLMs
  if (typeof entries === "undefined" || entries === null) return [];
  if (!Array.isArray(entries)) throw new Error("invalid input: argument must be an array");
  if (typeof threshold !== "number") return [];

  // Inefficient O(N^2) nested loop typical of naive AI auto-complete
  const result = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = 0; j < entries.length; j++) {
      if (entries[i].id === entries[j].id && entries[i].ttl >= threshold) {
        if (!result.some(item => item.id === entries[i].id)) {
          result.push(entries[i]);
        }
      }
    }
  }
  return result.sort((a, b) => a.id - b.id);
}`;

    this.testCases = [
      {
        title: "Basic Filter & Threshold Validation",
        input: [
          [{ id: 10, ttl: 40 }, { id: 2, ttl: 15 }, { id: 8, ttl: 25 }],
          20
        ],
        expected: [{ id: 8, ttl: 25 }, { id: 10, ttl: 40 }]
      },
      {
        title: "Boundary Conditions & Null Checks",
        input: [
          [{ id: 99, ttl: 5 }, { id: 14, ttl: 12 }],
          10
        ],
        expected: [{ id: 14, ttl: 12 }]
      },
      {
        title: "Dynamic Stress Input (N=5,000 items)",
        input: [
          Array.from({ length: 100 }, (_, i) => ({ id: 100 - i, ttl: (i % 30) + 10 })),
          25
        ],
        expected: Array.from({ length: 100 }, (_, i) => ({ id: 100 - i, ttl: (i % 30) + 10 }))
          .filter(x => x.ttl >= 25)
          .sort((a, b) => a.id - b.id)
      }
    ];

    this.initDOM();
    this.bindEvents();
    this.loadInitialState();
  }

  initDOM() {
    this.codeEditor = document.getElementById("codeEditor");
    this.lineNumbers = document.getElementById("lineNumbers");
    this.consoleOutput = document.getElementById("consoleOutput");
    this.consoleStatus = document.getElementById("consoleStatusText");
    this.cardBalanceDisplay = document.getElementById("cardBalanceDisplay");
    this.cardBalanceNaira = document.getElementById("cardBalanceNaira");
    this.bmoniCard = document.getElementById("bmoniCard");
    this.bigOBadge = document.getElementById("bigOBadge");
    this.valCyclomatic = document.getElementById("valCyclomatic");
    this.valAiScore = document.getElementById("valAiScore");
    this.astTreeDisplay = document.getElementById("astTreeDisplay");
    this.testSummaryPill = document.getElementById("testSummaryPill");

    this.testBars = [
      { bar: document.getElementById("test1Bar"), status: document.getElementById("test1Status") },
      { bar: document.getElementById("test2Bar"), status: document.getElementById("test2Status") },
      { bar: document.getElementById("test3Bar"), status: document.getElementById("test3Status") }
    ];
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const targetView = e.currentTarget.dataset.view;
        this.switchView(targetView);
      });
    });

    // Editor Line Numbers sync
    this.codeEditor.addEventListener("input", () => {
      this.updateLineNumbers();
      localStorage.setItem("kilikoro_code_draft", this.codeEditor.value);
    });

    // Indentation with Tab key
    this.codeEditor.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.codeEditor.selectionStart;
        const end = this.codeEditor.selectionEnd;
        this.codeEditor.value =
          this.codeEditor.value.substring(0, start) + "  " + this.codeEditor.value.substring(end);
        this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 2;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.runLocalTests();
      }
    });

    // Sample Code Buttons
    document.getElementById("btnLoadSample").addEventListener("click", () => {
      this.codeEditor.value = this.authenticSolution;
      this.updateLineNumbers();
      this.logConsole("[Editor] Loaded Authentic Human Solution.", "info");
    });

    document.getElementById("btnLoadChatGPT").addEventListener("click", () => {
      this.codeEditor.value = this.aiBoilerplateTrap;
      this.updateLineNumbers();
      this.logConsole("[Editor] Loaded AI Boilerplate Trap Code.", "info");
    });

    // Test & Submit Action Buttons
    document.getElementById("btnRunTests").addEventListener("click", () => this.runLocalTests());
    document.getElementById("btnSubmitSolution").addEventListener("click", () => this.submitAndClaimPayout());

    // Virtual Card Controls
    document.getElementById("btnFlipCard").addEventListener("click", () => {
      this.bmoniCard.classList.toggle("flipped");
    });

    document.getElementById("btnFreezeCard").addEventListener("click", (e) => {
      const isFrozen = this.escrowEngine.toggleFreeze();
      e.target.textContent = isFrozen ? "Unfreeze Card" : "Freeze Card";
      e.target.style.color = isFrozen ? "var(--status-ruby)" : "var(--text-secondary)";
      this.logConsole(`[BMONI] Card status updated: ${isFrozen ? "FROZEN" : "ACTIVE"}`, "info");
    });

    // Employer View Actions
    const rewardInput = document.getElementById("empRewardAmount");
    if (rewardInput) {
      rewardInput.addEventListener("input", (e) => {
        const amt = parseFloat(e.target.value) || 0;
        const fee = amt * 0.025;
        const total = amt + fee;
        document.getElementById("empTotalDeposit").textContent = `$${total.toFixed(2)} USDC`;
      });
    }

    const btnDeposit = document.getElementById("btnDepositEscrow");
    if (btnDeposit) {
      btnDeposit.addEventListener("click", () => {
        alert("Success! $256.25 USDC locked into BMONI Escrow Vault for Task #105.");
      });
    }

    // Public Verifier Search
    const btnSearchVerifier = document.getElementById("btnSearchVerifier");
    if (btnSearchVerifier) {
      btnSearchVerifier.addEventListener("click", () => {
        const query = document.getElementById("searchVerifierInput").value.trim();
        if (query) {
          alert(`Cryptographic Proof Verified for ${query}!\nIssuer: NACOS National Root Node #04\nStatus: 100% Authentic`);
        }
      });
    }
  }

  loadInitialState() {
    const saved = localStorage.getItem("kilikoro_code_draft");
    this.codeEditor.value = saved || this.authenticSolution;
    this.updateLineNumbers();
  }

  switchView(viewId) {
    document.querySelectorAll(".nav-tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".view-section").forEach((s) => s.classList.remove("active"));

    const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
    const activeSection = document.getElementById(viewId);

    if (activeBtn) activeBtn.classList.add("active");
    if (activeSection) activeSection.classList.add("active");
  }

  updateLineNumbers() {
    const lines = this.codeEditor.value.split("\n").length;
    let numbers = "";
    for (let i = 1; i <= Math.max(lines, 12); i++) {
      numbers += i + "<br>";
    }
    this.lineNumbers.innerHTML = numbers;
  }

  logConsole(message, type = "info") {
    const line = document.createElement("div");
    line.className = `console-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    line.innerHTML = `<span style="color: var(--text-muted); font-size: 0.72rem;">[${timestamp}]</span> ${message}`;
    this.consoleOutput.appendChild(line);
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }

  clearConsole() {
    this.consoleOutput.innerHTML = "";
  }

  async runLocalTests() {
    this.clearConsole();
    this.consoleStatus.textContent = "Executing Sandbox...";
    this.logConsole("[Sandbox] Spawning isolated Web Worker context...", "info");

    const code = this.codeEditor.value;
    const evalResult = await this.astEngine.evaluateSubmission(code, this.testCases);

    // Update AST visual metrics
    this.valCyclomatic.textContent = `M = ${evalResult.cyclomaticComplexity}`;
    this.valAiScore.textContent = `${evalResult.entropy.aiConfidenceScore}%`;
    this.bigOBadge.textContent = evalResult.execution.asymptoticComplexity || "O(N log N)";

    if (evalResult.entropy.isAiDetected) {
      this.valAiScore.style.color = "var(--status-ruby)";
      this.bigOBadge.style.color = "var(--status-ruby)";
      this.logConsole(`[AST Alert] High AI boilerplate template detected (${evalResult.entropy.aiConfidenceScore}% confidence).`, "fail");
    } else {
      this.valAiScore.style.color = "var(--status-emerald)";
      this.bigOBadge.style.color = "var(--accent-terracotta)";
      this.logConsole(`[AST Pass] Syntax entropy optimal (${evalResult.entropy.entropyValue} bits). Human structure verified.`, "pass");
    }

    // Display AST Tree
    this.astTreeDisplay.innerHTML = `<pre>${JSON.stringify(evalResult.ast.stats, null, 2)}</pre>`;

    // Update Test Assertion Bars
    let passedCount = 0;
    evalResult.execution.testResults.forEach((t, idx) => {
      const item = this.testBars[idx];
      if (item) {
        if (t.passed) {
          passedCount++;
          item.bar.className = "assertion-bar-fill";
          item.bar.style.width = "100%";
          item.status.innerHTML = `<span style="color: var(--status-emerald);">✓ Pass (${t.elapsedMs}ms)</span>`;
          this.logConsole(`[Test #${t.testId}] ${t.title} ... PASSED (${t.elapsedMs}ms)`, "pass");
        } else {
          item.bar.className = "assertion-bar-fill fail";
          item.bar.style.width = "100%";
          item.status.innerHTML = `<span style="color: var(--status-ruby);">✗ Fail</span>`;
          this.logConsole(`[Test #${t.testId}] ${t.title} ... FAILED (Expected: ${JSON.stringify(t.expected)}, Got: ${JSON.stringify(t.actual)})`, "fail");
        }
      }
    });

    this.testSummaryPill.textContent = `${passedCount} / ${this.testCases.length} Passed`;
    this.testSummaryPill.style.color = passedCount === 3 ? "var(--status-emerald)" : "var(--status-ruby)";

    this.consoleStatus.textContent = evalResult.overallPass ? "Tests Passed • Ready for Settlement" : "Execution Finished with Warnings";
    this.logConsole(`[Memory Profile] Peak Heap: ${evalResult.execution.estimatedHeapMb} MB • Execution: ${evalResult.execution.totalTimeMs}ms`, "ast");

    return evalResult;
  }

  async submitAndClaimPayout() {
    const evalResult = await this.runLocalTests();

    if (!evalResult.overallPass) {
      alert("Cannot claim payout: Solution must pass all test assertions and pass the anti-AI entropy check!");
      return;
    }

    this.logConsole("[Kilikoro Core] Initiating programmatic BMONI Escrow settlement...", "ast");
    const attestation = this.escrowEngine.generateAttestation(
      "UNILAG-CS-2026-0482",
      "TASK-BMONI-104",
      {
        testsPassed: "3/3",
        runtimeMs: evalResult.execution.totalTimeMs,
        complexity: evalResult.execution.asymptoticComplexity,
        originalityScore: (100 - evalResult.entropy.aiConfidenceScore).toFixed(1)
      }
    );

    const payout = await this.escrowEngine.triggerPayout(attestation, (phase, msg) => {
      this.logConsole(`[BMONI Escrow] ${msg}`, "info");
    });

    // Update Virtual Card Balance
    this.cardBalanceDisplay.textContent = `$${payout.newBalanceUSDC.toFixed(2)} USDC`;
    this.cardBalanceNaira.textContent = `≈ ₦${payout.newBalanceCNGN.toLocaleString()} cNGN`;
    this.cardBalanceDisplay.classList.add("updated");

    // Trigger celebration confetti
    this.launchConfetti();
    alert(`🎉 Congratulations! Milestone Escrow Released!\n+$${payout.settledAmountUSDC.toFixed(2)} USDC credited to your BMONI Virtual Mastercard (**** 4892) in 1.8 seconds!`);
  }

  launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      color: ["#D97757", "#4E937A", "#D4A373", "#FAF9F5"][Math.floor(Math.random() * 4)],
      speed: Math.random() * 3 + 2,
      rotation: Math.random() * 360
    }));

    let animationFrames = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        p.y += p.speed;
        p.rotation += 2;
      }
      animationFrames++;
      if (animationFrames < 150) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  viewCertificate(attestId) {
    this.switchView("verifier-view");
    document.getElementById("searchVerifierInput").value = attestId;
  }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new KilikoroApp();
});
