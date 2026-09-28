# Kilikoro Protocol · Team Crown Chasers

[![BuildX 2026](https://img.shields.io/badge/BuildX-2026-blue.svg)](https://hack.nacos.org.ng)
[![NACOS National](https://img.shields.io/badge/NACOS-National-green.svg)](https://nacos.org.ng)
[![BMONI Rails](https://img.shields.io/badge/BMONI-Stablecoin%20Escrow-orange.svg)](https://bmoni.com)
[![Status](https://img.shields.io/badge/Status-Live%20Prototype-success.svg)]()

> **Deterministic Proof-of-Competence Engine and Programmable BMONI Stablecoin Milestone Escrow for African Computing Students.**

---

## 🚀 Overview

**Kilikoro Protocol** solves the African Developer Credential & Payment crisis:
1. **The Problem:** 80,000+ computing students graduate annually in Nigeria, but resumes are filled with copy-pasted ChatGPT code that employers cannot trust. When students do freelance work, 40%+ experience payment delays or 12%+ wire remittance losses.
2. **The Solution:** 
   - **AST Sandboxing:** An in-browser parser inspects syntax trees and memory growth to differentiate authentic human logic from AI boilerplate.
   - **NACOS Cryptographic Attestations:** Issues on-chain proof-of-competence badges signed by the student's tertiary chapter key.
   - **BMONI Instant Escrow:** Employers lock funds in stablecoins; passing tests programmatically triggers instant payout to the student's virtual BMONI Mastercard in **under 2 seconds**.

---

## 🛠️ Architecture

* **Web Hub (`index.html`):** GitHub Primer dark-themed dual portal (Student Monaco Editor, AST diagnostic visualizer, BMONI Virtual Mastercard, and Employer Escrow Cockpit).
* **CLI Tool (`cli.js`):** Developer-native terminal runner for local testing and programmatic milestone submission.
* **Escrow Oracle (`app.js`):** State machine coordinating stablecoin escrow lock, test assertion evaluation, and Mastercard balance updates.

---

## 💻 Quick Start & Running Locally

### 1. Open the Web Application Prototype
Simply open `index.html` in any web browser:
```bash
# On Windows
start index.html
```

### 2. Run the Developer CLI
```bash
# View available commands
node cli.js help

# Run local AST stress test & complexity analysis
node cli.js test

# Submit solution & trigger instant BMONI card payout
node cli.js submit

# Check BMONI Virtual Mastercard balance
node cli.js wallet
```

---

## 👥 Team Crown Chasers (BuildX 2026)
* **Wali Medugu** & Team
* **Track:** Open Payments & FinTech / Digital Innovation
* **Supported by:** NACOS National, BMONI, iDICE ($618M FGN/AfDB Initiative), Oracle Academy.