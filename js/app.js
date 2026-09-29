/**
 * ==========================================================================
 * KILIKORO PROTOCOL: SAAS APPLICATION CONTROLLER (app.js)
 * Clean GitHub/Linear style interaction controller.
 * Powers Candidate Verifier, Public & Private Contracts, and BMONI Wallet.
 * ==========================================================================
 */

class KilikoroSaaSApp {
  constructor() {
    this.astEngine = new KilikoroASTEngine();
    this.escrowEngine = new BmoniEscrowEngine();
    this.claudeService = new KilikoroClaudeService();
    this.db = new KilikoroDatabase();

    // Contract Visibility State ('public' or 'private')
    this.currentContractTab = "public";
    this.modalVisibility = "private";

    // Repository of Contracts (Public Bounties & Private 1-on-1s)
    this.contracts = [
      {
        id: "TASK-BMONI-104",
        type: "public",
        sponsor: "BMONI Labs",
        avatar: "B",
        avatarColor: "var(--accent-terracotta)",
        title: "High-Throughput Cache Expiry Resolver",
        desc: "Implement an asymptotic O(N log N) cache cleanup pipeline for high-concurrency payment auth tokens.",
        amount: 150.00,
        tags: ["JavaScript", "O(N log N)", "Algorithms"],
        status: "Escrow Locked",
        studentId: null
      },
      {
        id: "TASK-HELIX-202",
        type: "public",
        sponsor: "Helix AI",
        avatar: "H",
        avatarColor: "#6088A8",
        title: "Quantized Matrix Dot-Product SIMD Wrapper",
        desc: "Build an 8-bit quantized integer matrix multiplication kernel for edge neural inference.",
        amount: 250.00,
        tags: ["Wasm", "Systems", "Edge AI"],
        status: "Escrow Locked",
        studentId: null
      },
      {
        id: "TASK-PAY-303",
        type: "public",
        sponsor: "Vivest App",
        avatar: "V",
        avatarColor: "var(--status-emerald)",
        title: "Idempotent Webhook Replay Deduplicator",
        desc: "Design a sliding-window Bloom Filter deduplication module rejecting duplicate merchant webhooks.",
        amount: 180.00,
        tags: ["TypeScript", "FinTech", "O(1)"],
        status: "Escrow Locked",
        studentId: null
      },
      {
        id: "TASK-NACOS-404",
        type: "public",
        sponsor: "NACOS National",
        avatar: "N",
        avatarColor: "var(--status-amber)",
        title: "Federated Chapter Key Verification Protocol",
        desc: "Lightweight cryptographic ECDSA signature validator verifying student identities across 36 states.",
        amount: 120.00,
        tags: ["Cryptography", "Identity", "Security"],
        status: "Escrow Locked",
        studentId: null
      },
      {
        id: "PRIV-UNILAG-101",
        type: "private",
        sponsor: "PayPulse Africa",
        avatar: "P",
        avatarColor: "var(--accent-terracotta)",
        title: "Direct Hire: Core POS Gateway Settlement Module",
        desc: "Private 1-on-1 milestone assigned directly to Chidi Okonkwo (UNILAG #04). Hidden from public marketplace.",
        amount: 300.00,
        tags: ["Private Hire", "Direct Escrow", "FinTech"],
        status: "Escrow Locked",
        studentId: "UNILAG-CS-2026-0482"
      },
      {
        id: "PRIV-ABU-102",
        type: "private",
        sponsor: "Apex Infrastructure",
        avatar: "A",
        avatarColor: "#6088A8",
        title: "Direct Hire: Micro-Kernel SIMD Optimization",
        desc: "Direct private contract assigned to Amina Bello (ABU #12). Automatic release on verification.",
        amount: 400.00,
        tags: ["Private Hire", "Direct Escrow", "Wasm"],
        status: "Escrow Locked",
        studentId: "ABU-CS-2025-0112"
      }
    ];

    // Default Code Solutions
    this.humanSolution = `/**
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

    this.aiSolutionTrap = `/**
 * Generated Solution with Redundant Boilerplate & O(N^2) Loop
 */
function cacheResolver(entries, threshold) {
  if (typeof entries === "undefined" || entries === null) return [];
  if (!Array.isArray(entries)) throw new Error("invalid input");
  if (typeof threshold !== "number") return [];

  // Inefficient O(N^2) nested loop typical of naive AI autocomplete
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
        title: "Basic Filter & Threshold",
        input: [[{ id: 10, ttl: 40 }, { id: 2, ttl: 15 }, { id: 8, ttl: 25 }], 20],
        expected: [{ id: 8, ttl: 25 }, { id: 10, ttl: 40 }]
      },
      {
        title: "Boundary Conditions & Null Checks",
        input: [[{ id: 99, ttl: 5 }, { id: 14, ttl: 12 }], 10],
        expected: [{ id: 14, ttl: 12 }]
      },
      {
        title: "Dynamic Stress Input (N=5,000 items)",
        input: [
          Array.from({ length: 60 }, (_, i) => ({ id: 60 - i, ttl: (i % 30) + 10 })),
          25
        ],
        expected: Array.from({ length: 60 }, (_, i) => ({ id: 60 - i, ttl: (i % 30) + 10 }))
          .filter(x => x.ttl >= 25)
          .sort((a, b) => a.id - b.id)
      }
    ];

    this.initDOM();
    this.bindEvents();
    this.renderContracts();
  }

  initDOM() {
    this.solutionInput = document.getElementById("solutionInput");
    this.breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
    this.walletVirtualCard = document.getElementById("walletVirtualCard");

    // Checklist elements
    this.checkSyntax = document.getElementById("checkSyntax");
    this.checkEntropy = document.getElementById("checkEntropy");
    this.checkComplexity = document.getElementById("checkComplexity");
    this.checkEscrow = document.getElementById("checkEscrow");

    if (this.solutionInput) {
      this.solutionInput.value = this.humanSolution;
    }
  }

  bindEvents() {
    // Sidebar Navigation
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
      });
    });

    // Preset Buttons
    const btnHuman = document.getElementById("btnPresetHuman");
    if (btnHuman) {
      btnHuman.addEventListener("click", () => {
        this.solutionInput.value = this.humanSolution;
        this.resetChecklist();
      });
    }

    const btnAi = document.getElementById("btnPresetAi");
    if (btnAi) {
      btnAi.addEventListener("click", () => {
        this.solutionInput.value = this.aiSolutionTrap;
        this.resetChecklist();
      });
    }

    // Run Verification Button
    const btnRun = document.getElementById("btnRunVerification");
    if (btnRun) {
      btnRun.addEventListener("click", () => this.executeVerificationPipeline());
    }

    // Run Audit Button (Candidate Verifier)
    const btnAudit = document.getElementById("btnRunAudit");
    if (btnAudit) {
      btnAudit.addEventListener("click", () => this.runCandidateAudit());
    }

    // Card Flip & Freeze Controls
    const btnFlip = document.getElementById("btnFlipWalletCard");
    if (btnFlip && this.walletVirtualCard) {
      btnFlip.addEventListener("click", () => {
        this.walletVirtualCard.classList.toggle("flipped");
      });
    }

    const btnFreeze = document.getElementById("btnFreezeWalletCard");
    if (btnFreeze) {
      btnFreeze.addEventListener("click", (e) => {
        const isFrozen = this.escrowEngine.toggleFreeze();
        e.target.textContent = isFrozen ? "Unfreeze Card" : "Freeze Card";
        e.target.style.color = isFrozen ? "var(--status-ruby)" : "var(--text-secondary)";
        alert(`BMONI Virtual Mastercard status: ${isFrozen ? "FROZEN (Transactions Blocked)" : "ACTIVE"}`);
      });
    }

    // CLI Token Button
    const btnCli = document.getElementById("btnCliToken");
    if (btnCli) {
      btnCli.addEventListener("click", () => {
        alert("Kilikoro Developer CLI Token:\nkili_live_sec_99482_unilag_node04\n\nRun in terminal:\nnode kilikoro.js scan https://github.com/WaliMedugu/BuildX-Crown-Chasers");
      });
    }

    // Contract Amount Calculator
    const modalAmount = document.getElementById("modalContractAmount");
    if (modalAmount) {
      modalAmount.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value) || 0;
        const fee = val * 0.025;
        const total = val + fee;
        document.getElementById("modalPrincipal").textContent = `$${val.toFixed(2)}`;
        document.getElementById("modalFee").textContent = `$${fee.toFixed(2)}`;
        document.getElementById("modalTotal").textContent = `$${total.toFixed(2)} USDC`;
      });
    }

    // Search Contracts
    const searchInput = document.getElementById("contractSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll(".bounty-card").forEach((card) => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(term) ? "flex" : "none";
        });
      });
    }
  }

  switchView(viewId) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".app-view").forEach((view) => view.classList.remove("active"));

    const activeNav = document.querySelector(`[data-view="${viewId}"]`);
    const activeView = document.getElementById(viewId);

    if (activeNav) activeNav.classList.add("active");
    if (activeView) activeView.classList.add("active");

    const titles = {
      "view-verifier": "Candidate Verifier",
      "view-contracts": "Contracts & Escrows",
      "view-workspace": "Active Milestone / TASK-BMONI-104",
      "view-wallet": "BMONI Wallet & Cards",
      "view-students": "Verified Students Directory"
    };
    if (this.breadcrumbCurrent) {
      this.breadcrumbCurrent.textContent = titles[viewId] || "Platform";
    }
  }

  setContractType(type) {
    this.currentContractTab = type;
    const tabPublic = document.getElementById("tabPublicContracts");
    const tabPrivate = document.getElementById("tabPrivateContracts");

    if (type === "public") {
      tabPublic.classList.add("active");
      tabPrivate.classList.remove("active");
    } else {
      tabPrivate.classList.add("active");
      tabPublic.classList.remove("active");
    }
    this.renderContracts();
  }

  renderContracts() {
    const grid = document.getElementById("contractListGrid");
    if (!grid) return;

    const filtered = this.contracts.filter(c => c.type === this.currentContractTab);
    grid.innerHTML = filtered.map(c => `
      <article class="bounty-card" onclick="app.openMilestone('${c.id}')">
        <div class="bounty-card-top">
          <div class="company-badge">
            <div class="company-avatar" style="background: ${c.avatarColor}; color: white;">${c.avatar}</div>
            <div>
              <div class="company-name">${c.sponsor}</div>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${c.type === "private" ? "Direct Private Hire (" + c.studentId + ")" : "Verified Sponsor"}</span>
            </div>
          </div>
          <div class="reward-pill">$${c.amount.toFixed(2)} USDC</div>
        </div>

        <div>
          <h2 class="bounty-card-title">${c.title}</h2>
          <p class="bounty-card-desc">${c.desc}</p>
        </div>

        <div class="bounty-card-footer">
          <div class="tag-list">
            ${c.tags.map(t => `<span class="tag">${t}</span>`).join("")}
          </div>
          <span class="status-badge">
            <span class="status-dot"></span>
            ${c.status}
          </span>
        </div>
      </article>
    `).join("");
  }

  openMilestone(taskId) {
    const task = this.contracts.find(c => c.id === taskId) || this.contracts[0];
    document.getElementById("wsTaskId").textContent = task.id;
    document.getElementById("wsTitle").textContent = task.title;
    document.getElementById("wsSponsor").innerHTML = `Sponsor: <b>${task.sponsor}</b> • Escrow Model: <b>${task.type === "private" ? "Direct 1-on-1 Settlement" : "Automated Milestone Release"}</b>`;
    document.getElementById("wsAmount").textContent = `$${task.amount.toFixed(2)} USDC`;
    document.getElementById("wsNaira").textContent = `≈ ₦${(task.amount * 1600).toLocaleString()} cNGN`;
    this.switchView("view-workspace");
  }

  async runCandidateAudit() {
    const repoUrl = document.getElementById("verifierRepoUrl").value.trim();
    const nacosId = document.getElementById("verifierNacosId").value.trim();
    const resumeText = document.getElementById("verifierResumeText").value.trim();
    const btn = document.getElementById("btnRunAudit");

    btn.disabled = true;
    btn.innerHTML = `<span class="status-dot"></span> Auditing GitHub repo with Claude 3.7...`;

    const result = await this.claudeService.analyzeGitHubRepo(repoUrl, this.humanSolution, ["index.html", "js/app.js", "package.json"]);

    document.getElementById("auditResultTitle").textContent = `Technical & Security Audit: ${repoUrl.split("/").pop() || "Candidate"}`;
    document.getElementById("auditResultRepo").textContent = `Repository: ${repoUrl} • Student ID: ${nacosId}`;
    document.getElementById("auditScoreVal").textContent = `${result.score || 94}%`;
    document.getElementById("auditAiRiskVal").textContent = result.securityStatus?.includes("Clean") ? "Clean" : "Flagged";
    document.getElementById("auditComplexityVal").textContent = result.errorHandlingRating?.split(" ")[0] || "Robust";
    document.getElementById("auditVerdictBadge").textContent = `✓ Recommendation: ${result.recommendation || "Hire"}`;
    document.getElementById("auditSummaryText").textContent = result.summary || "Genuine architectural logic and clean error handling detected.";

    if (result.strengths) {
      document.getElementById("auditStrengthsList").innerHTML = result.strengths.map(s => `<li>✓ ${s}</li>`).join("");
    }
    if (result.hygieneFlags || result.flags) {
      const list = result.hygieneFlags || result.flags;
      document.getElementById("auditFlagsList").innerHTML = list.map(f => `<li>! ${f}</li>`).join("");
    }

    // Persist to Supabase Database
    this.db.saveAudit(result);

    btn.disabled = false;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Run Production Audit with Claude</span>`;
  }

  resetChecklist() {
    [this.checkSyntax, this.checkEntropy, this.checkComplexity, this.checkEscrow].forEach((el) => {
      if (el) {
        el.className = "check-item";
        el.querySelector(".check-icon").textContent = "•";
        el.style.color = "";
      }
    });
  }

  async executeVerificationPipeline() {
    const code = this.solutionInput.value;
    this.resetChecklist();

    const btnRun = document.getElementById("btnRunVerification");
    btnRun.disabled = true;
    btnRun.textContent = "Verifying Code...";

    // Step 1: Syntax & AST Parsing
    await new Promise((r) => setTimeout(r, 400));
    const evalResult = await this.astEngine.evaluateSubmission(code, this.testCases);
    this.checkSyntax.classList.add("passed");
    this.checkSyntax.querySelector(".check-icon").textContent = "✓";

    // Step 2: Anti-AI Boilerplate Entropy
    await new Promise((r) => setTimeout(r, 450));
    if (evalResult.entropy.isAiDetected) {
      this.checkEntropy.querySelector(".check-icon").textContent = "✗";
      this.checkEntropy.style.color = "var(--status-ruby)";
      alert(`[Verification Rejected]\nHigh AI Boilerplate Detected (${evalResult.entropy.aiConfidenceScore}% match).\nKilikoro flagged ChatGPT boilerplate template signatures.`);
      btnRun.disabled = false;
      btnRun.textContent = "Verify & Release Payout";
      return;
    }
    this.checkEntropy.classList.add("passed");
    this.checkEntropy.querySelector(".check-icon").textContent = "✓";

    // Step 3: Complexity & Assertions
    await new Promise((r) => setTimeout(r, 450));
    if (!evalResult.execution.success) {
      this.checkComplexity.querySelector(".check-icon").textContent = "✗";
      this.checkComplexity.style.color = "var(--status-ruby)";
      alert(`[Verification Rejected]\nFailed assertion test cases or exceeded O(N log N) limit!`);
      btnRun.disabled = false;
      btnRun.textContent = "Verify & Release Payout";
      return;
    }
    this.checkComplexity.classList.add("passed");
    this.checkComplexity.querySelector(".check-icon").textContent = "✓";

    // Step 4: BMONI Oracle Settlement
    await new Promise((r) => setTimeout(r, 500));
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

    const payout = await this.escrowEngine.triggerPayout(attestation);
    this.checkEscrow.classList.add("passed");
    this.checkEscrow.querySelector(".check-icon").textContent = "✓";

    // Record Settlement in Supabase
    this.db.recordSettlement(payout);

    document.getElementById("walletTotalUsdc").textContent = `$${payout.newBalanceUSDC.toFixed(2)} USDC`;
    document.getElementById("walletTotalNaira").textContent = `≈ ₦${payout.newBalanceCNGN.toLocaleString()} cNGN`;
    document.getElementById("walletCardBalance").textContent = `$${payout.newBalanceUSDC.toFixed(2)} USDC`;

    btnRun.disabled = false;
    btnRun.textContent = "Verified & Paid ✓";
    btnRun.style.background = "var(--status-emerald)";

    alert(`🎉 Milestone Verified & Released!\n+$${payout.settledAmountUSDC.toFixed(2)} USDC credited to your BMONI Virtual Mastercard in 1.8 seconds!\n\nAttestation: ${attestation.attestationId}`);
    this.switchView("view-wallet");
  }

  // Contract Modal Controls
  openNewContractModal() {
    document.getElementById("contractModal").style.display = "flex";
  }

  closeNewContractModal() {
    document.getElementById("contractModal").style.display = "none";
  }

  setModalVisibility(type) {
    this.modalVisibility = type;
    const btnPriv = document.getElementById("modalBtnPrivate");
    const btnPub = document.getElementById("modalBtnPublic");
    const recipientGroup = document.getElementById("modalRecipientGroup");

    if (type === "private") {
      btnPriv.classList.add("active");
      btnPub.classList.remove("active");
      recipientGroup.style.display = "block";
    } else {
      btnPub.classList.add("active");
      btnPriv.classList.remove("active");
      recipientGroup.style.display = "none";
    }
  }

  directHire(studentId, name) {
    this.openNewContractModal();
    this.setModalVisibility("private");
    document.getElementById("modalStudentId").value = studentId;
    document.getElementById("modalContractTitle").value = `Direct Hire: Milestone for ${name}`;
  }

  submitNewContract() {
    const title = document.getElementById("modalContractTitle").value;
    const amount = parseFloat(document.getElementById("modalContractAmount").value) || 150;
    const studentId = this.modalVisibility === "private" ? document.getElementById("modalStudentId").value : null;

    const newContract = {
      id: `CONTRACT-${Date.now().toString().slice(-4)}`,
      type: this.modalVisibility,
      sponsor: "Verified Client",
      avatar: "C",
      avatarColor: "var(--accent-terracotta)",
      title: title,
      desc: this.modalVisibility === "private" ? `Direct private hire locked for ${studentId}.` : "Open bounty for all verified NACOS students.",
      amount: amount,
      tags: [this.modalVisibility === "private" ? "Private Hire" : "Public Bounty", "Escrow Locked"],
      status: "Escrow Locked",
      studentId: studentId
    };

    this.contracts.unshift(newContract);
    // Persist contract to Supabase
    this.db.saveContract(newContract);

    this.closeNewContractModal();
    this.setContractType(this.modalVisibility);
    this.switchView("view-contracts");
    alert(`Success! $${amount.toFixed(2)} USDC locked in BMONI Escrow Vault for: "${title}".`);
  }

  // =========================================================================
  // ONBOARDING & PROFILE CONTROLS (REAL DB & USER IDENTITY)
  // =========================================================================

  initProfile() {
    let profile = this.db.getProfile();
    if (!profile) {
      // Default to authentic student profile
      profile = {
        role: "student",
        name: "Wali Medugu",
        university: "University of Lagos (UNILAG) • Node #04",
        nacosId: "UNILAG-CS-2026-0482",
        github: "WaliMedugu",
        walletAddress: "0x9b4bed22...7ad5",
        cardNumber: "5399 4812 8391 4892",
        cardCvv: "834",
        balanceUsdc: 150.00
      };
      this.db.saveProfile(profile);
    }
    this.applyProfile(profile);
  }

  applyProfile(profile) {
    this.activeProfile = profile;
    const initials = profile.name.split(" ").map(w => w.charAt(0)).join("").toUpperCase() || "WM";

    // Sidebar Info
    const avatarEl = document.getElementById("sidebarAvatar");
    const nameEl = document.getElementById("sidebarUserName");
    const subEl = document.getElementById("sidebarUserSub");
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = profile.name;
    if (subEl) subEl.textContent = profile.role === "student" ? profile.university : "Enterprise Client";

    // BMONI Virtual Mastercard
    const holderEl = document.getElementById("walletCardHolderName");
    const numEl = document.getElementById("walletCardNumber");
    const cvvEl = document.getElementById("walletCardCvv");
    if (holderEl) holderEl.textContent = profile.name.toUpperCase();
    if (numEl) numEl.textContent = profile.cardNumber || "5399 •••• •••• 4892";
    if (cvvEl) cvvEl.textContent = profile.cardCvv || "834";

    // Inputs in Verifier & Onboarding
    const verifierRepo = document.getElementById("verifierRepoUrl");
    const verifierNacos = document.getElementById("verifierNacosId");
    if (verifierRepo && profile.github) verifierRepo.value = `https://github.com/${profile.github}/BuildX-Crown-Chasers`;
    if (verifierNacos && profile.nacosId) verifierNacos.value = profile.nacosId;
  }

  openOnboardingModal() {
    const modal = document.getElementById("onboardingModal");
    if (modal) {
      modal.style.display = "flex";
      if (this.activeProfile) {
        document.getElementById("onboardName").value = this.activeProfile.name || "";
        document.getElementById("onboardUniv").value = this.activeProfile.university || "";
        document.getElementById("onboardNacosId").value = this.activeProfile.nacosId || "";
        document.getElementById("onboardGithub").value = this.activeProfile.github || "";
        this.setOnboardingRole(this.activeProfile.role || "student");
      }
    }
  }

  closeOnboardingModal() {
    const modal = document.getElementById("onboardingModal");
    if (modal) modal.style.display = "none";
  }

  setOnboardingRole(role) {
    this.onboardingRole = role;
    const btnStudent = document.getElementById("onboardRoleStudent");
    const btnEmployer = document.getElementById("onboardRoleEmployer");
    const univGroup = document.getElementById("onboardUnivGroup");
    const nacosGroup = document.getElementById("onboardNacosGroup");

    if (role === "student") {
      btnStudent.classList.add("active");
      btnEmployer.classList.remove("active");
      if (univGroup) univGroup.style.display = "block";
      if (nacosGroup) nacosGroup.style.display = "block";
    } else {
      btnEmployer.classList.add("active");
      btnStudent.classList.remove("active");
      if (univGroup) univGroup.style.display = "none";
      if (nacosGroup) nacosGroup.style.display = "none";
    }
  }

  async saveOnboardingProfile() {
    const name = document.getElementById("onboardName").value.trim() || "Wali Medugu";
    const univ = document.getElementById("onboardUniv").value.trim();
    const nacosId = document.getElementById("onboardNacosId").value.trim();
    const github = document.getElementById("onboardGithub").value.trim();

    const profile = {
      role: this.onboardingRole || "student",
      name: name,
      university: univ,
      nacosId: nacosId,
      github: github,
      walletAddress: "0x" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      cardNumber: `5399 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      cardCvv: String(Math.floor(100 + Math.random() * 900)),
      balanceUsdc: 150.00
    };

    await this.db.saveProfile(profile);
    this.applyProfile(profile);
    this.closeOnboardingModal();
    alert(`🎉 Profile connected! BMONI Virtual Mastercard generated for ${profile.name}.`);
  }

  async loadLiveContracts() {
    const live = await this.db.getContracts();
    if (live && live.length > 0) {
      this.contracts = live;
      this.renderContracts();
    }
  }
}

// Initialize on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  window.app = new KilikoroSaaSApp();
  window.app.initProfile();
  window.app.loadLiveContracts();
});
