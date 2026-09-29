# Kilikoro Protocol — User Vision & Implementation Plan

---

## 1. User Voice Transcripts

### Audio File 1: Resume Fraud & Real GitHub Analysis
> *"Okay, okay. Now, something that I have to talk to you about. This looks like a vibe-coded website. Like the standard vibe-coded website itself. So let me not even talk.*
> 
> *What you're going to do is that: I love the idea, yeah, I love the solution, but how you're implementing it, I absolutely hate it from the bottom of my heart.*
> 
> *So you're going to have to do something for me. And that thing you're going to do, is that you're going to think of how you actually implement systems, or a system like this, that is usable, is functional, and actually looks like the solution to the problem statement. Not something that looks like...*
> 
> *Because the first thing I see when I look at this is: what's the difference between this thing that I'm looking at now and normal places where you look for... Like what happens when someone spends a lot of time on a job, and then you find out that, you know, another person has already finished it and gotten paid, etc.? Too many issues that I see. Honestly, this looks like a marketplace itself. I don't know. This thing that I'm looking at does not really solve... hold on, let me look at the problem statement. The original problem statement...*
> 
> *'Companies want to hire student developers, but resumes are filled with copy-pasted ChatGPT code that employers do not trust. When students do freelance work, employers often delay payments, dispute finished work, or lose money to bank transfer fees.'*
> 
> *Okay, number 1: how are we solving the 'companies want to hire student developers, but resumes are filled with copy-pasted ChatGPT code'?*
> 
> *This is not how we handle it. This is not how we handle it at all. How this will be handled will be through the CLI thing we're working on. And the CLI thing will be able to do this test on GitHub repos. So any GitHub repo, the test can be done through it. And we're not doing demos here. We're using live actual stuff. I'm going to drop my Claude API key in the chat now...*
> 
> *So I just put my Claude API key in the chat. Yeah, so it should be able to do this thing that we're talking about on GitHub repos. So, yeah.*
> 
> *As for 'resumes are filled with copy-pasted ChatGPT code that employers do not trust': we are going to make it so that the company can upload the CV or resume of the user to the thing that we've made, and then it will evaluate... it will do deep research on that data. It's going to go through all of the links in the resume, it's going to look up all of the names in the resume, it's going to look up all of the projects that the person claimed that they made to see if they actually made them, etc. Yeah, that's one way we could expand that."*

---

### Audio File 2: Public vs. Private Milestone Contracts & BMONI
> *"So yeah, that's how we can solve that problem. That's one way.*
> 
> *As for the terminal GitHub repo one, we can make it a terminal command: `kilikoro [something]` and then it will run a full analysis on that GitHub repo for the company.*
> 
> *And now for the second problem: 'When students do freelance work, employers often delay payments, dispute finished work, or lose money to bank transfer fees.'*
> 
> *Now, okay, now this is a good point. How would this really be solved?*
> 
> *Okay, how about this:*
> *I notice that the way you built the website, all of these contracts are public. But how about we make them sort of private? The user can create the contract, and they can choose to make it public, or they can contract it to a different user.*
> 
> *If they contract it to a different user, it won't be shown in the app. But if it's public, anyone can pick the project up and compete to be the person that wins or something like that.*
> 
> *If it's private, then immediately the person does the job, it has all of the features and it has been well made according to the specifications of the contractor, the money is immediately dispatched.*
> 
> *As for the bank transfer fees, because we're using BMONI, the bank transfer fees won't be as much, that kind of thing that, you know, we talked about.*
> 
> *As for 'companies want to hire developers, but resumes are filled with copy-pasted ChatGPT code', we still need to find a way to integrate BMONI into this: BMONI and NACOS into the hiring student developers part. I know you mentioned it before, but I need to make sure that it is revised.*
> 
> *Now, everything that I've said, just put it in an MD file, like the transcript of what I've said. Put it in an MD file, and under that, put the solution that you've thought of. Yeah."*

---

### Audio File 3: Simplicity & Real Production UX (KISS Principle)
> *"And as you're doing this, don't forget the rule: Keep It Simple, Stupid. Keep the UI simple and intuitive. Remove anything that production-ready websites and applications do not have — for example, explanations of what each screen does, complex words for things that can be said in layman's terms, etc.*
> 
> *Also, you might have to redo the entire website with this new information. Focus on what I told you. Don't go breaching into other things unless necessary."*

---

## 2. Real-World Solution Architecture

Kilikoro is a **dual-tool system** built specifically for hiring companies and Nigerian student developers:

```
+-----------------------------------------------------------------------------------+
|                                 KILIKORO SYSTEM                                   |
+-----------------------------------------------------------------------------------+
|  1. CANDIDATE VERIFIER (CLI & WEB)         |  2. CONTRACT ESCROW (PUBLIC & PRIVATE)|
|  - Real GitHub Repo Analyzer               |  - Private Contracts (Direct Hire)    |
|  - Deep Resume & Portfolio Fact-Checker    |  - Public Bounties (Open Challenges)  |
|  - Powered by Claude 3.7 API & AST Engine  |  - Instant BMONI Card Settlement      |
|  - NACOS Student ID Verification           |  - Low Transaction Fees (cNGN / USD)  |
+-----------------------------------------------------------------------------------+
```

---

### Solution 1: Solving Resume & Code Trust (No More ChatGPT Copies)

1. **Terminal Command (`kilikoro scan <github-url>`)**:
   - Takes any live GitHub repository URL.
   - Fetches repository files and commits via GitHub API.
   - Runs code inspection using Claude API (`claude-3-7-sonnet-20250219`):
     - Detects copy-pasted AI boilerplate vs. authentic architectural design.
     - Inspects commit frequency, branch hygiene, and author authenticity.
     - Produces a clear **Integrity & Skill Score (0–100%)**.

2. **Web Resume Fact-Checker (Employer Portal)**:
   - Employers upload a PDF/text resume or paste a student's GitHub link and NACOS Matric number.
   - Claude API extracts claimed skills, project links, and repositories.
   - Verifies links, tests project repositories, and generates a simple, 1-page **Verification Report**:
     - *NACOS Verification*: Confirms active student status.
     - *Repo Authenticity*: Verifies the student actually wrote the code (not just forked/cloned).
     - *Skill Level*: Evaluates algorithm structure, error handling, and clean code.

---

### Solution 2: Solving Freelance Payment Delays & Bank Fees

1. **Two Contract Modes**:
   - **Private Direct Contract**: An employer hires a specific student directly. The project is locked between the two parties (hidden from public view). When the student delivers the work and tests pass, funds release instantly.
   - **Public Bounty**: An open competition where any verified student can solve a milestone and claim the reward upon automated verification.

2. **BMONI Stablecoin Escrow Rails**:
   - Employer locks funds in escrow (USDC / cNGN).
   - Once automated criteria or client sign-off is complete, funds disburse in **under 3 seconds** to the student's **BMONI Virtual Mastercard**.
   - Zero international wire delays, zero high bank transfer cuts.

---

## 3. Implementation Plan (Simple & Actionable)

```
[Phase 1] CLI Scanner & Claude API Integration
  |-- Connect Claude API (sk-ant-api03-...)
  |-- Add `kilikoro scan <repo-url>` command
  `-- Add `kilikoro verify-resume <file>` command

[Phase 2] Web App Clean Redesign (Simple, Intuitive, No Explanatory Fluff)
  |-- Clean, modern UI (GitHub + Linear simplicity, Claude color palette)
  |-- Screen 1: Candidate Verification (Resume Upload & GitHub Scanner)
  |-- Screen 2: Contracts & Escrow (Public Bounties vs. Private Direct Hire)
  |-- Screen 3: BMONI Wallet & Virtual Mastercard
  `-- Screen 4: Verified Student Profiles (NACOS ID Badge)

[Phase 3] Live Verification & Testing
  |-- Test real GitHub repo scanning
  |-- Test Private Contract escrow creation & release
  `-- Verify zero console errors & push to GitHub
```

### Key Design Rules Applied:
- **No explanatory text boxes** ("This screen does xyz..."). The UI speaks for itself.
- **No complex academic jargon**. Plain words like "Scan Repository", "Create Private Job", "Release Payment".
- **Zero fake browser terminals**. The CLI lives in the terminal; the web app is a sleek dashboard.
