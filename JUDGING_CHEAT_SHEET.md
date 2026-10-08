# Kilikoro — Teammate Quick-Reference Judging Cheat Sheet

> **How to use this**: Keep this open during presentations and judge Q&A. When a judge asks a question, look at the matching category below for quick 1–2 sentence bullet points you can read out loud.

---

## The 30-Second Elevator Pitch (If anyone asks "What is Kilikoro?")
"Kilikoro is a developer verification and milestone escrow platform for student engineers. Employers use it to fact-check resumes and inspect real GitHub code so they don't get tricked by ChatGPT copies, and students use it to get paid instantly onto virtual debit cards without delayed payments or bank wire fees."

---

## 1. Problem Understanding (The "Why")
* **The Employer Problem**: Resumes and portfolios are flooded with unverified AI-generated code. Companies spend 60+ engineering hours and millions of Naira filtering applicants.
* **The Developer Problem**: 40%+ of student freelancers face delayed payments, unpaid work, or lose 10–14% to international bank wire fees.
* **Our Core Insight**: "We are not anti-AI—AI is a tool. We don't punish students for using AI; we verify if the code actually works, handles errors, and scales."

---

## 2. Innovation (What Makes Us Unique)
* **Real Evidence Over Multiple-Choice**: Unlike LeetCode/HackerRank (which test puzzle trivia easily solved by ChatGPT), Kilikoro inspects real GitHub repositories, commit trees, and live codebases.
* **Proof-of-Competence Escrow**: We connect code verification directly to instant financial payouts. The moment code passes tests, funds unlock automatically.
* **Dual Interface**: A clean web app for recruiters/students PLUS a developer terminal CLI (`kilikoro scan <repo-url>`).

---

## 3. Technical Implementation (How It Works Under the Hood)
* **GitHub & Resume Inspection**: Scrapes real GitHub commit history, tests live code with Anthropic Claude API + AST parser to check code cleanliness, cyclomatic complexity, and detect exposed secrets.
* **Isolated Browser Sandbox**: Runs student submissions inside isolated Web Workers with a 3-second timeout and 64MB memory limit to prevent browser freezing and malicious code execution.
* **BMONI FinTech Rails**: Pre-funded stablecoin escrow. Once tests pass, BMONI issues a virtual Mastercard in <2 seconds. Funds can be spent online immediately or withdrawn to any Nigerian bank.
* **Live Supabase Sync**: Real-time cloud database tracking all bounties, submissions, and contract states with zero mock data.

---

## 4. Impact & Scalability (The Business & Growth)
* **Monetization (3 Streams)**:
  1. **2.5% Escrow Fee**: Saves employers 75% compared to Upwork/Fiverr's 10–20% cuts.
  2. **$199/mo Enterprise API**: For HR teams and tech agencies wanting automated candidate code screening.
  3. **0.6% Card Interchange**: Earned when students spend their virtual card balances.
* **Campus Distribution Moat (Zero-CAC)**: Partnered with NACOS National across 100+ universities. Every computing student gets an active profile from day one.

---

## 5. User Experience (UX & Design)
* **Keep It Simple (KISS)**: No bloated crypto jargon. Plain English terms like "Lock Escrow", "Scan Repository", and "Claim Payout".
* **Dual-Mode Contracts**:
  * *Private Direct Contracts*: 1-on-1 confidential hiring.
  * *Public Bounties*: Open community challenges.
* **Campus Resiliency (Offline-Ready)**:
  * Auto-saves student code every 1.5 seconds (in case of laptop battery or power cut).
  * Runs tests offline in browser memory.
  * Queues submissions in local outbox if hostel Wi-Fi drops.

---

## 6. Presentation & Demo Walkthrough (Live Steps)
1. **Show Bounties / Private Contracts**: Open dashboard to show active categories and live Supabase sync.
2. **Run AST Code Verification**: Submit a solution, run tests, and watch the green indicators verify the logic and complexity.
3. **Trigger Instant Payout**: Watch the BMONI virtual card flip and balance update from $0 to $150 in under 2 seconds.
4. **Demonstrate CLI**: Run `kilikoro scan <url>` in terminal to show instant repo hygiene and security scanning.
