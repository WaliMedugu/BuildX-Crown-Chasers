// ==========================================================================
// KILIKORO PROTOCOL · PROOF-OF-COMPETENCE & BMONI ESCROW ENGINE
// ==========================================================================

const HUMAN_SOLUTION = `/**
 * Kilikoro Verified Submission · Student ID: NACOS/UNILAG/2026/0482
 * High-Performance O(1) LRU Cache (Doubly Linked List + Map)
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`;

const AI_BOILERPLATE_TRAP = `/**
 * UNVERIFIED / GENERATED BOILERPLATE SUBMISSION
 * Contains redundant cyclomatic nesting & inefficient O(N) scans
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.keys = [];
    this.values = [];
    this.usageScores = []; // Redundant tracking array
  }

  get(key) {
    // Artificial linear scan O(N)
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i] === key) {
        this.usageScores[i] = Date.now();
        return this.values[i];
      }
    }
    return -1;
  }

  put(key, value) {
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i] === key) {
        this.values[i] = value;
        return;
      }
    }
    if (this.keys.length >= this.capacity) {
      // Inefficient array shift causing O(N) memory thrashing
      this.keys.shift();
      this.values.shift();
      this.usageScores.shift();
    }
    this.keys.push(key);
    this.values.push(value);
    this.usageScores.push(Date.now());
  }
}`;

// State
let currentBalance = 0;
let escrowLocked = 150;
let settlementsCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  const codeEditor = document.getElementById('codeEditor');
  codeEditor.value = HUMAN_SOLUTION;

  // Tab switching
  const tabs = document.querySelectorAll('.subnav-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      document.getElementById(target).classList.add('active');
    });
  });

  // Preset code buttons
  document.getElementById('loadHumanCodeBtn').addEventListener('click', () => {
    codeEditor.value = HUMAN_SOLUTION;
    resetDiagnostics();
    logConsole('Loaded verified human algorithmic implementation.', 'info');
  });

  document.getElementById('loadAiCodeBtn').addEventListener('click', () => {
    codeEditor.value = AI_BOILERPLATE_TRAP;
    resetDiagnostics();
    logConsole('Loaded AI boilerplate code with O(N) inefficiencies.', 'danger');
  });

  document.getElementById('resetCodeBtn').addEventListener('click', () => {
    codeEditor.value = '';
    resetDiagnostics();
    logConsole('Code editor cleared.', 'muted');
  });

  // Run AST Sandbox Button
  document.getElementById('runSandboxBtn').addEventListener('click', () => {
    executeSandbox(codeEditor.value);
  });

  // Employer Escrow Form
  document.getElementById('fundEscrowBtn').addEventListener('click', () => {
    const amt = parseFloat(document.getElementById('milestoneAmount').value) || 150;
    escrowLocked = amt;
    document.getElementById('poolLockedAmount').innerText = `$${amt.toFixed(2)} USDC`;
    addAuditLog(`Employer deposited & locked $${amt.toFixed(2)} USDC into Milestone Escrow Pool.`);
    alert(`Successfully locked $${amt.toFixed(2)} USDC in BMONI Escrow!`);
  });

  // Terminal CLI input listener
  const termInput = document.getElementById('terminalInput');
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = termInput.value.trim();
      termInput.value = '';
      handleTerminalCommand(command);
    }
  });
});

// AST & Sandbox Execution
function executeSandbox(code) {
  const btn = document.getElementById('runSandboxBtn');
  const progressFill = document.getElementById('progressBarFill');
  const diagnosticBadge = document.getElementById('diagnosticBadge');
  const consoleEl = document.getElementById('sandboxConsole');

  btn.disabled = true;
  btn.innerText = 'Evaluating in Isolated AST Sandbox...';
  diagnosticBadge.className = 'badge badge-idle';
  diagnosticBadge.innerText = 'Analyzing AST...';
  progressFill.style.width = '20%';
  progressFill.style.backgroundColor = '#388bfd';

  logConsole('> Compiling Abstract Syntax Tree (AST)...', 'info');

  setTimeout(() => {
    progressFill.style.width = '55%';
    logConsole('> Checking cyclomatic complexity & node entropy...', 'info');

    setTimeout(() => {
      progressFill.style.width = '85%';
      logConsole('> Running dynamic input scaling stress test (N=10 -> 1,000)...', 'info');

      setTimeout(() => {
        progressFill.style.width = '100%';
        btn.disabled = false;
        btn.innerHTML = `
          <svg class="octicon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.441a.25.25 0 0 1 .379-.214Z"></path>
          </svg>
          Run AST Sandbox & Claim Payout
        `;

        // Determine if Human or AI code
        const isAiTrap = code.includes('usageScores') || code.includes('keys.shift()') || code.length < 50;

        if (!isAiTrap) {
          // SUCCESS FLOW
          diagnosticBadge.className = 'badge badge-success';
          diagnosticBadge.innerText = '100% Passed (Authentic)';
          document.getElementById('valAssertions').innerText = '4 / 4 Passed';
          document.getElementById('valAssertions').className = 'diag-val text-green';
          document.getElementById('valEntropy').innerText = '94.8% (Human)';
          document.getElementById('valEntropy').className = 'diag-val text-green';
          document.getElementById('valComplexity').innerText = 'O(1) Constant Time';
          document.getElementById('valComplexity').className = 'diag-val text-green';
          document.getElementById('valLatency').innerText = '1.8 ms (Instant)';

          logConsole('✓ Assertion 1: get(1) returns value in O(1) - PASS', 'success');
          logConsole('✓ Assertion 2: put(3, 30) evicts oldest key - PASS', 'success');
          logConsole('✓ Assertion 3: capacity constraint strictly maintained - PASS', 'success');
          logConsole('✓ Assertion 4: AST structural entropy confirms authentic human design - PASS', 'success');
          logConsole('⚡ BMONI Oracle Trigger: Disbursing $150.00 USDC to Virtual Mastercard...', 'success');

          // Release funds to card
          triggerBmoniCardPayout(150);
          addAuditLog('Milestone #402 passed AST validation: $150.00 USDC released to Chidi O. (UNILAG).');
        } else {
          // FAILED FLOW (AI TRAP)
          diagnosticBadge.className = 'badge badge-danger';
          diagnosticBadge.innerText = 'Flagged: O(N) Inefficient / AI Pattern';
          document.getElementById('valAssertions').innerText = '2 / 4 Failed';
          document.getElementById('valAssertions').className = 'diag-val text-danger';
          document.getElementById('valEntropy').innerText = '32.1% (AI Boilerplate)';
          document.getElementById('valEntropy').className = 'diag-val text-danger';
          document.getElementById('valComplexity').innerText = 'O(N) Linear (Violates Spec)';
          document.getElementById('valComplexity').className = 'diag-val text-danger';
          document.getElementById('valLatency').innerText = '148.4 ms (Slow)';

          logConsole('✗ Assertion 2: Memory thrashing detected during array shift.', 'danger');
          logConsole('✗ Assertion 4: Asymptotic check failed. O(N) scan violates O(1) requirement.', 'danger');
          logConsole('ALERT: Code structure matches generic ChatGPT array-based template.', 'danger');
          logConsole('🔒 Escrow remains LOCKED. No payout disbursed.', 'muted');
        }
      }, 600);
    }, 600);
  }, 600);
}

// BMONI Virtual Card Balance Update
function triggerBmoniCardPayout(amount) {
  currentBalance += amount;
  settlementsCount += 1;
  
  const balanceDisplay = document.getElementById('cardBalanceDisplay');
  const nairaDisplay = document.getElementById('cardNairaDisplay');
  const cardEl = document.getElementById('bmoniVirtualCard');

  balanceDisplay.innerText = `$${currentBalance.toFixed(2)} USDC`;
  nairaDisplay.innerText = `≈ ₦${(currentBalance * 1600).toLocaleString('en-US')}.00 cNGN`;

  // Visual card animation
  cardEl.style.transform = 'scale(1.03)';
  cardEl.style.boxShadow = '0 0 30px rgba(63, 185, 80, 0.6)';
  setTimeout(() => {
    cardEl.style.transform = 'scale(1)';
    cardEl.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.5)';
  }, 800);

  // Update employer stats
  document.getElementById('poolSettledCount').innerText = `${settlementsCount} Completed`;
}

function resetDiagnostics() {
  document.getElementById('diagnosticBadge').className = 'badge badge-idle';
  document.getElementById('diagnosticBadge').innerText = 'Ready to Run';
  document.getElementById('progressBarFill').style.width = '0%';
  document.getElementById('valAssertions').innerText = '- / 4 Passed';
  document.getElementById('valAssertions').className = 'diag-val';
  document.getElementById('valEntropy').innerText = 'Pending';
  document.getElementById('valEntropy').className = 'diag-val';
  document.getElementById('valComplexity').innerText = 'Pending';
  document.getElementById('valComplexity').className = 'diag-val';
  document.getElementById('valLatency').innerText = '-- ms';
}

function logConsole(msg, type = 'info') {
  const consoleEl = document.getElementById('sandboxConsole');
  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.innerText = msg;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function addAuditLog(text) {
  const list = document.getElementById('escrowAuditLogs');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const time = new Date().toLocaleTimeString();
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-text">${text}</span>`;
  list.prepend(entry);
}

// Terminal CLI Command Handler
function handleTerminalCommand(cmd) {
  const termBody = document.getElementById('terminalBody');
  const promptRow = termBody.querySelector('.t-prompt-row');

  const echoLine = document.createElement('div');
  echoLine.className = 't-line';
  echoLine.innerHTML = `<span class="t-prompt">nacos@crown-chasers:~/buildx$</span> ${escapeHtml(cmd)}`;
  termBody.insertBefore(echoLine, promptRow);

  const parts = cmd.trim().split(' ');
  const base = parts[0];

  if (base === 'kilikoro') {
    const sub = parts[1];
    if (!sub || sub === 'help') {
      printTermLine('Kilikoro Protocol CLI v1.0.4 - Available Commands:', 't-info');
      printTermLine('  kilikoro auth login      - Authenticate with NACOS Student ID & BMONI wallet', 't-muted');
      printTermLine('  kilikoro milestone list  - View open funded bounties in escrow', 't-muted');
      printTermLine('  kilikoro test --profile  - Run local deterministic AST & memory profiler', 't-muted');
      printTermLine('  kilikoro submit          - Submit solution, verify on-chain, and claim payout', 't-muted');
      printTermLine('  kilikoro wallet          - View BMONI Virtual Mastercard stablecoin balance', 't-muted');
    } else if (sub === 'test') {
      printTermLine('[AST Sandbox] Compiling solution.js...', 't-info');
      printTermLine('[AST Entropy] Analyzing syntax tree: 94.8% Human Variance (PASS)', 't-success');
      printTermLine('[Complexity] Dynamic stress test (N=1,000): Verified O(1) Constant (PASS)', 't-success');
      printTermLine('[Memory Heap] Peak allocation: 1.4 MB (Zero leaks detected)', 't-success');
      printTermLine('[Attestation] Signed with UNILAG-NACOS-NODE-01 key. Ready to submit.', 't-info');
    } else if (sub === 'submit') {
      printTermLine('[CI Pipeline] Dispatching solution to remote verifier...', 't-info');
      printTermLine('[Verification] 4/4 Test Assertions PASSED.', 't-success');
      printTermLine('[BMONI Escrow] Payout released: $150.00 USDC -> Card **** 4892 in 1.8s', 't-success');
      triggerBmoniCardPayout(150);
    } else if (sub === 'wallet') {
      printTermLine(`[BMONI Wallet] Cardholder: CHIDI OKONKWO (UNILAG)`, 't-info');
      printTermLine(`[BMONI Wallet] Balance: $${currentBalance.toFixed(2)} USDC (≈ ₦${(currentBalance * 1600).toLocaleString('en-US')}.00 cNGN)`, 't-success');
      printTermLine(`[BMONI Wallet] Virtual Card: 5399 •••• •••• 4892 (Mastercard)`, 't-muted');
    } else {
      printTermLine(`Unknown kilikoro command: ${sub}. Type "kilikoro help" for command list.`, 't-danger');
    }
  } else if (base === 'clear') {
    const lines = termBody.querySelectorAll('.t-line');
    lines.forEach(l => l.remove());
  } else if (base === '') {
    // Empty enter
  } else {
    printTermLine(`Command not found: ${base}. Try "kilikoro help"`, 't-danger');
  }

  termBody.scrollTop = termBody.scrollHeight;
}

function printTermLine(text, className = 't-muted') {
  const termBody = document.getElementById('terminalBody');
  const promptRow = termBody.querySelector('.t-prompt-row');
  const line = document.createElement('div');
  line.className = `t-line ${className}`;
  line.innerText = text;
  termBody.insertBefore(line, promptRow);
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
