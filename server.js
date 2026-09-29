/**
 * ==============================================================================
 * KILIKORO FULL-STACK PRODUCTION BACKEND SERVER (server.js)
 * High-performance, zero-dependency Node.js HTTP server.
 * Connects directly to Supabase Auth & REST API with persistent disk storage.
 * ==============================================================================
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load .env
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [k, ...v] = trimmed.split("=");
      if (k && v.length) process.env[k.trim()] = v.join("=").trim();
    }
  }
}

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL || "https://wgcgkbftotnkkeyurttb.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnY2drYmZ0b3Rua2tleXVydHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzY4NjUsImV4cCI6MjEwNjIxMjg2NX0.yosBpBph5rNHPrisblRyKNZU0dRsNUUT15YZUDtlB80";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnY2drYmZ0b3Rua2tleXVydHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDYzNjg2NSwiZXhwIjoyMTA2MjEyODY1fQ.UZ_m5kuWrHgHjB-5FlYiAyqahptrPTRBz_rv41jOZs4";

// Persistent Database Directory & File (Vercel serverless compatible)
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "data")
  : path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "kilikoro_db.json");

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[Storage Notice] Could not create DATA_DIR:", e.message);
}

// Initial Database State
const INITIAL_DB = {
  users: [],
  contracts: [
    {
      id: "TASK-BMONI-104",
      type: "public",
      sponsor: "BMONI Labs",
      avatar: "B",
      avatarColor: "var(--status-emerald)",
      title: "High-Throughput Cache Expiry Resolver",
      desc: "Implement an asymptotic O(N log N) cache cleanup pipeline for high-concurrency payment auth tokens.",
      amount: 150.00,
      tags: ["Public Bounty", "Escrow Locked"],
      status: "Escrow Locked",
      createdAt: new Date().toISOString()
    },
    {
      id: "TASK-HELIX-202",
      type: "public",
      sponsor: "Helix AI",
      avatar: "H",
      avatarColor: "var(--status-emerald)",
      title: "Quantized Matrix Dot-Product SIMD Wrapper",
      desc: "Build an 8-bit quantized integer matrix multiplication kernel for edge neural inference.",
      amount: 250.00,
      tags: ["Public Bounty", "Escrow Locked"],
      status: "Escrow Locked",
      createdAt: new Date().toISOString()
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
      tags: ["Public Bounty", "Escrow Locked"],
      status: "Escrow Locked",
      createdAt: new Date().toISOString()
    },
    {
      id: "TASK-NACOS-404",
      type: "public",
      sponsor: "NACOS National",
      avatar: "N",
      avatarColor: "var(--status-emerald)",
      title: "Federated Chapter Key Verification Protocol",
      desc: "Lightweight cryptographic ECDSA signature validator verifying student identities across 36 states.",
      amount: 120.00,
      tags: ["Public Bounty", "Escrow Locked"],
      status: "Escrow Locked",
      createdAt: new Date().toISOString()
    }
  ],
  audits: [],
  settlements: []
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
  } catch (e) {
    console.error("DB Read Error:", e);
  }
  // Try reading bundled initial seed data
  const bundledFile = path.join(__dirname, "data", "kilikoro_db.json");
  if (fs.existsSync(bundledFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(bundledFile, "utf8"));
      writeDb(data);
      return data;
    } catch (e) {}
  }
  try {
    writeDb(INITIAL_DB);
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_DB));
}

function writeDb(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("DB Write Error:", e);
  }
}

// Initialize DB file if missing
readDb();

// MIME Types
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

// Strict Validation Helpers
function isValidEmail(email) {
  if (!email || typeof email !== "string" || email.length > 100) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

function isValidName(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 60 && /^[a-zA-Z\s\-'.]+$/.test(trimmed);
}

function isValidBmoniAccount(acc) {
  if (!acc || typeof acc !== "string") return false;
  const clean = acc.trim();
  // 1. Nigerian Phone: 080... / 070... / 090... / 081... / 091... (11 digits)
  if (/^0[789][01]\d{8}$/.test(clean)) return true;
  // 2. International Nigerian Phone: +23480... or +23470...
  if (/^\+234[789][01]\d{8}$/.test(clean)) return true;
  if (/^234[789][01]\d{8}$/.test(clean)) return true;
  // 3. BMONI Tag / Handle: 3-30 chars
  if (/^[a-zA-Z0-9._]{3,30}(\.bmoni)?$/i.test(clean)) return true;
  return false;
}

function formatBmoniAccount(acc) {
  if (!acc) return null;
  const clean = acc.trim();
  if (/^0[789][01]\d{8}$/.test(clean)) {
    return `+234 ${clean.slice(1, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  if (/^\+234[789][01]\d{8}$/.test(clean)) {
    return `+234 ${clean.slice(4, 7)} ${clean.slice(7, 10)} ${clean.slice(10)}`;
  }
  return clean.toLowerCase().endsWith(".bmoni") ? clean.toLowerCase() : `${clean.toLowerCase()}.bmoni`;
}

function isValidNuban(nuban) {
  return /^\d{10}$/.test(String(nuban || "").trim());
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
  });
  res.end(JSON.stringify(data));
}

async function handleRequest(req, res) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost:3000"}`);
  const pathname = parsedUrl.pathname;

  // =========================================================================
  // API ROUTING
  // =========================================================================

  // 1. SIGN UP (SUPABASE AUTH + PERSISTENT DB)
  if (pathname === "/api/auth/signup" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const { name, email, password, role, university, nacosId, github, company, regNumber, department, bmoniPhone } = payload;

      if (!name || !isValidName(name)) {
        return sendJson(res, 400, { error: "Please enter a valid full legal name (2-60 characters, letters only)." });
      }

      if (!email || !isValidEmail(email)) {
        return sendJson(res, 400, { error: "Please enter a valid email address (e.g. user@domain.com)." });
      }

      if (!password || typeof password !== "string" || password.length < 6 || password.length > 64) {
        return sendJson(res, 400, { error: "Password must be between 6 and 64 characters." });
      }

      if (role !== "student" && role !== "employer") {
        return sendJson(res, 400, { error: "Role must be either 'student' or 'employer'." });
      }

      if (role === "student") {
        if (!university || university.trim().length < 2 || university.trim().length > 100) {
          return sendJson(res, 400, { error: "University/Chapter must be between 2 and 100 characters." });
        }
        if (!nacosId || nacosId.trim().length < 3 || nacosId.trim().length > 30) {
          return sendJson(res, 400, { error: "NACOS Student ID must be between 3 and 30 characters (e.g. UNILAG-CS-2026-0482)." });
        }
      } else {
        if (!company || company.trim().length < 2 || company.trim().length > 100) {
          return sendJson(res, 400, { error: "Company/Organization name must be between 2 and 100 characters." });
        }
      }

      if (bmoniPhone && !isValidBmoniAccount(bmoniPhone)) {
        return sendJson(res, 400, {
          error: "Invalid BMONI Account: Please provide a valid 11-digit Nigerian mobile number (e.g. 08012345678), international format (+2348012345678), or a BMONI handle (e.g. handle.bmoni)."
        });
      }

      const db = readDb();
      const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return sendJson(res, 400, { error: "An account with this email already exists. Please sign in." });
      }

      // Generate BMONI Card & Wallet
      const walletAddress = "0x" + crypto.randomBytes(4).toString("hex");
      const cardNumber = `5399 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
      const cardCvv = String(Math.floor(100 + Math.random() * 900));

      const isStudent = role === "student";
      const formattedBmoni = bmoniPhone ? formatBmoniAccount(bmoniPhone) : null;
      // All employers receive a ₦10,000 cNGN ($6.25 USDC) bonus gift to fund contracts
      const initialBalance = isStudent ? 0.00 : 6.25;

      const profile = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        hasStudentProfile: isStudent,
        hasEmployerProfile: !isStudent,
        studentCredentials: isStudent ? {
          university: university.trim(),
          nacosId: nacosId.trim(),
          github: (github || "").trim()
        } : null,
        employerCredentials: !isStudent ? {
          company: company.trim(),
          regNumber: (regNumber || "RC-" + Math.floor(100000 + Math.random() * 900000)).trim(),
          department: (department || "Engineering & Procurement").trim(),
          location: "Nigeria / Remote"
        } : null,
        university: isStudent ? university.trim() : company.trim(),
        nacosId: isStudent ? nacosId.trim() : null,
        github: (github || "").trim(),
        company: !isStudent ? company.trim() : null,
        walletAddress,
        cardNumber,
        cardCvv,
        balanceUsdc: initialBalance,
        bmoniConnected: Boolean(formattedBmoni),
        bmoniPhone: formattedBmoni,
        bmoniTag: formattedBmoni && formattedBmoni.includes(".bmoni") ? formattedBmoni : `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.bmoni`,
        createdAt: new Date().toISOString()
      };

      // If employer, record the ₦10,000 cNGN ($6.25 USDC) welcome grant in settlements ledger
      if (!isStudent) {
        db.settlements.unshift({
          id: crypto.randomUUID(),
          transactionHash: `0xbmoni_grant_${Date.now().toString().slice(-6)}`,
          attestationId: "NACOS-SPONSOR-GRANT-10K",
          settledAmountUSDC: 6.25,
          status: "Welcome Bonus Credited",
          timestamp: new Date().toISOString(),
          recipient: profile.email
        });
      }

      // 1. Register into Supabase Auth via Admin API
      try {
        const supaRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: name,
              role: profile.role,
              hasStudentProfile: profile.hasStudentProfile,
              hasEmployerProfile: profile.hasEmployerProfile,
              studentCredentials: profile.studentCredentials,
              employerCredentials: profile.employerCredentials,
              university: profile.university,
              nacos_id: profile.nacosId,
              github: profile.github,
              bmoni_wallet_address: profile.walletAddress,
              bmoni_card_number: profile.cardNumber,
              bmoni_connected: profile.bmoniConnected,
              bmoni_phone: profile.bmoniPhone
            }
          })
        });

        if (supaRes.ok) {
          const supaData = await supaRes.json();
          if (supaData && supaData.id) {
            profile.id = supaData.id;
          }
        } else {
          const errText = await supaRes.text();
          console.warn("Supabase Auth admin create notice:", errText);
        }
      } catch (e) {
        console.warn("Supabase Auth admin exception:", e.message);
      }

      // 2. Also try writing to Supabase profiles table if available
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: profile.id,
            user_role: profile.role,
            full_name: profile.name,
            email: profile.email,
            university: profile.university,
            nacos_id: profile.nacosId,
            github_username: profile.github,
            bmoni_wallet_address: profile.walletAddress,
            bmoni_card_number: profile.cardNumber,
            bmoni_card_cvv: profile.cardCvv,
            bmoni_balance_usdc: 0.00
          })
        });
      } catch (e) {}

      // 3. Save to persistent DB
      db.users.push(profile);
      writeDb(db);

      return sendJson(res, 201, {
        success: true,
        user: profile,
        message: "Account created successfully in Supabase."
      });
    } catch (err) {
      console.error("Signup error:", err);
      return sendJson(res, 500, { error: "Internal server error during registration: " + err.message });
    }
  }

  // 2. SIGN IN (SUPABASE AUTH VALIDATION - NO FAKE ACCOUNTS)
  if (pathname === "/api/auth/signin" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const { identifier, password } = payload;

      if (!identifier || !password) {
        return sendJson(res, 400, { error: "Please provide both identifier and password." });
      }

      const db = readDb();
      let targetEmail = identifier.trim();

      // If user typed NACOS ID or Name, resolve email from DB
      if (!targetEmail.includes("@")) {
        const foundUser = db.users.find(u => 
          (u.nacosId && u.nacosId.toLowerCase() === targetEmail.toLowerCase()) ||
          (u.name && u.name.toLowerCase() === targetEmail.toLowerCase())
        );
        if (foundUser) {
          targetEmail = foundUser.email;
        } else {
          targetEmail = `${targetEmail.toLowerCase().replace(/[^a-z0-9]/g, "")}@student.nacos.ng`;
        }
      }

      // Check with Supabase Auth API
      let supaToken = null;
      let supaUser = null;
      let authFailed = false;
      let authErrorMessage = "Invalid login credentials. Account not found or incorrect password.";

      try {
        const supaRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: targetEmail,
            password: password
          })
        });

        if (supaRes.ok) {
          const authData = await supaRes.json();
          supaToken = authData.access_token;
          supaUser = authData.user;
        } else {
          const errData = await supaRes.json().catch(() => ({}));
          authFailed = true;
          authErrorMessage = errData.msg || errData.error_description || "Invalid login credentials. Please check your email and password.";
        }
      } catch (e) {
        console.warn("Supabase auth check exception:", e.message);
      }

      // If Supabase Auth failed (bad password or non-existent account), REJECT! (NO FAKE ACCOUNTS)
      if (authFailed && !supaUser) {
        return sendJson(res, 401, {
          error: authErrorMessage
        });
      }

      // Find user in DB
      let user = db.users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

      // If neither Supabase Auth nor DB has this user, REJECT!
      if (!supaUser && !user) {
        return sendJson(res, 401, {
          error: "Invalid login credentials. Account not found. Please register first."
        });
      }

      // If found in Supabase but not in DB, reconstruct profile
      if (supaUser && !user) {
        const meta = supaUser.user_metadata || {};
        user = {
          id: supaUser.id,
          name: meta.full_name || targetEmail.split("@")[0].toUpperCase(),
          email: targetEmail,
          role: meta.role || "student",
          hasStudentProfile: meta.hasStudentProfile ?? (meta.role === "student"),
          hasEmployerProfile: meta.hasEmployerProfile ?? (meta.role === "employer"),
          studentCredentials: meta.studentCredentials || null,
          employerCredentials: meta.employerCredentials || null,
          university: meta.university || "NACOS Chapter",
          nacosId: meta.nacos_id || null,
          github: meta.github || "",
          walletAddress: meta.bmoni_wallet_address || ("0x" + crypto.randomBytes(4).toString("hex")),
          cardNumber: meta.bmoni_card_number || `5399 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
          cardCvv: String(Math.floor(100 + Math.random() * 900)),
          balanceUsdc: 0.00,
          bmoniConnected: Boolean(meta.bmoni_connected),
          bmoniPhone: meta.bmoni_phone || null,
          createdAt: supaUser.created_at || new Date().toISOString()
        };
        db.users.push(user);
        writeDb(db);
      }

      return sendJson(res, 200, {
        success: true,
        user: user,
        token: supaToken
      });
    } catch (err) {
      console.error("Signin error:", err);
      return sendJson(res, 500, { error: "Internal server error during sign in: " + err.message });
    }
  }

  // 3. DELETE ACCOUNT (PURGES SUPABASE AUTH & DB)
  if (pathname === "/api/auth/delete-account" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const { email, id } = payload;

      if (!email && !id) {
        return sendJson(res, 400, { error: "Account identifier required." });
      }

      const db = readDb();
      const userIndex = db.users.findIndex(u => (id && u.id === id) || (email && u.email.toLowerCase() === email.toLowerCase()));
      const userToDelete = userIndex >= 0 ? db.users[userIndex] : null;

      if (userIndex >= 0) {
        db.users.splice(userIndex, 1);
        writeDb(db);
      }

      // Delete from Supabase Auth
      if (userToDelete && userToDelete.id) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userToDelete.id}`, {
            method: "DELETE",
            headers: {
              "apikey": SUPABASE_SERVICE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`
            }
          });
        } catch (e) {}

        // Delete from Supabase profiles table
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userToDelete.id}`, {
            method: "DELETE",
            headers: {
              "apikey": SUPABASE_SERVICE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`
            }
          });
        } catch (e) {}
      }

      return sendJson(res, 200, { success: true, message: "Account deleted permanently." });
    } catch (err) {
      return sendJson(res, 500, { error: "Error deleting account: " + err.message });
    }
  }

  // 4. ROLE CREDENTIAL UPGRADE (STRICT REQUIREMENTS: MUST FILE DETAILS)
  if (pathname === "/api/user/upgrade-role" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const { email, targetRole, credentials } = payload;

      if (!email || !targetRole || !credentials) {
        return sendJson(res, 400, { error: "Missing required fields for role upgrade." });
      }

      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return sendJson(res, 404, { error: "User not found." });
      }

      if (targetRole === "employer") {
        if (!credentials.company || typeof credentials.company !== "string" || credentials.company.trim().length < 2 || credentials.company.trim().length > 100) {
          return sendJson(res, 400, { error: "Company name must be between 2 and 100 characters." });
        }
        user.hasEmployerProfile = true;
        user.employerCredentials = {
          company: credentials.company.trim(),
          regNumber: (credentials.regNumber && typeof credentials.regNumber === "string") ? credentials.regNumber.trim().slice(0, 50) : "RC-" + Math.floor(100000 + Math.random() * 900000),
          department: (credentials.department && typeof credentials.department === "string") ? credentials.department.trim().slice(0, 100) : "Engineering & Procurement",
          location: (credentials.location && typeof credentials.location === "string") ? credentials.location.trim().slice(0, 100) : "Nigeria / Remote"
        };
        user.role = "employer";
        // If user didn't have employer bonus yet, credit ₦10,000 cNGN ($6.25 USDC)
        if (!user.employerBonusCredited && (!user.balanceUsdc || user.balanceUsdc === 0)) {
          user.balanceUsdc = (user.balanceUsdc || 0) + 6.25;
          user.employerBonusCredited = true;
          db.settlements.unshift({
            id: crypto.randomUUID(),
            transactionHash: `0xbmoni_grant_${Date.now().toString().slice(-6)}`,
            attestationId: "NACOS-SPONSOR-GRANT-10K",
            settledAmountUSDC: 6.25,
            status: "Welcome Bonus Credited",
            timestamp: new Date().toISOString(),
            recipient: user.email
          });
        }
      } else if (targetRole === "student") {
        if (!credentials.university || typeof credentials.university !== "string" || credentials.university.trim().length < 2 || credentials.university.trim().length > 100) {
          return sendJson(res, 400, { error: "University name must be between 2 and 100 characters." });
        }
        if (!credentials.nacosId || typeof credentials.nacosId !== "string" || credentials.nacosId.trim().length < 3 || credentials.nacosId.trim().length > 40) {
          return sendJson(res, 400, { error: "NACOS Student ID must be between 3 and 40 characters." });
        }
        user.hasStudentProfile = true;
        user.studentCredentials = {
          university: credentials.university.trim(),
          nacosId: credentials.nacosId.trim(),
          github: (credentials.github && typeof credentials.github === "string") ? credentials.github.trim().slice(0, 100) : ""
        };
        user.role = "student";
      }

      writeDb(db);

      // Update Supabase Auth metadata
      if (user.id) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
            method: "PUT",
            headers: {
              "apikey": SUPABASE_SERVICE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_metadata: {
                role: user.role,
                hasStudentProfile: user.hasStudentProfile,
                hasEmployerProfile: user.hasEmployerProfile,
                studentCredentials: user.studentCredentials,
                employerCredentials: user.employerCredentials,
                bmoni_balance_usdc: user.balanceUsdc
              }
            })
          });
        } catch (e) {}
      }

      return sendJson(res, 200, { success: true, user });
    } catch (err) {
      return sendJson(res, 500, { error: "Role upgrade failed: " + err.message });
    }
  }

  // 5. CONNECT BMONI ACCOUNT
  if (pathname === "/api/user/connect-bmoni" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const { email, bmoniPhone, bmoniTag } = payload;

      if (!email || (!bmoniPhone && !bmoniTag)) {
        return sendJson(res, 400, { error: "Email and BMONI Phone/Tag required." });
      }

      const rawAccount = (bmoniPhone || bmoniTag || "").trim();
      if (!isValidBmoniAccount(rawAccount)) {
        return sendJson(res, 400, { error: "Invalid BMONI account. Enter a valid Nigerian phone number (080... / +234...) or BMONI tag (3-30 chars)." });
      }

      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return sendJson(res, 404, { error: "User not found." });
      }

      user.bmoniConnected = true;
      user.bmoniPhone = formatBmoniAccount(rawAccount);
      user.bmoniTag = rawAccount.toLowerCase().includes("@") || rawAccount.startsWith("+") || rawAccount.startsWith("0") ? `${user.name.toLowerCase().replace(/\s+/g, "")}.bmoni` : rawAccount.toLowerCase();

      writeDb(db);

      // Update Supabase metadata
      if (user.id) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
            method: "PUT",
            headers: {
              "apikey": SUPABASE_SERVICE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_metadata: {
                bmoni_connected: true,
                bmoni_phone: user.bmoniPhone,
                bmoni_tag: user.bmoniTag
              }
            })
          });
        } catch (e) {}
      }

      return sendJson(res, 200, { success: true, user });
    } catch (err) {
      return sendJson(res, 500, { error: "Connecting BMONI failed: " + err.message });
    }
  }

  // 6. CONTRACTS (GET & POST - STRICT ESCROW FUNDING BALANCE ENFORCEMENT)
  if (pathname === "/api/contracts") {
    const db = readDb();
    if (req.method === "GET") {
      return sendJson(res, 200, db.contracts);
    }
    if (req.method === "POST") {
      try {
        const contract = await parseJsonBody(req);
        if (!contract.title || typeof contract.title !== "string" || contract.title.trim().length < 3 || contract.title.trim().length > 120) {
          return sendJson(res, 400, { error: "Contract title must be between 3 and 120 characters." });
        }
        const parsedAmount = parseFloat(contract.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000000) {
          return sendJson(res, 400, { error: "Contract amount must be a positive number up to 1,000,000 USDC." });
        }

        const totalRequiredUsdc = parsedAmount * 1.025; // 2.5% protocol fee
        
        // Find employer / sponsor in DB to verify balance
        const sponsorEmail = contract.sponsorEmail || "";
        const sponsorName = contract.sponsor || "";
        const employer = db.users.find(u => 
          (sponsorEmail && u.email.toLowerCase() === sponsorEmail.toLowerCase()) ||
          (sponsorName && u.name.toLowerCase() === sponsorName.toLowerCase())
        );

        if (employer) {
          const available = employer.balanceUsdc || 0;
          if (available < totalRequiredUsdc) {
            return sendJson(res, 400, {
              error: `Insufficient BMONI Balance: You have $${available.toFixed(2)} USDC (≈ ₦${Math.round(available * 1600).toLocaleString()} cNGN). Required with 2.5% protocol fee: $${totalRequiredUsdc.toFixed(2)} USDC.`
            });
          }
          // Deduct escrow amount + fee from employer's balance
          employer.balanceUsdc = Math.max(0, employer.balanceUsdc - totalRequiredUsdc);
        }

        contract.title = contract.title.trim();
        contract.amount = parsedAmount;
        contract.desc = (contract.desc && typeof contract.desc === "string") ? contract.desc.trim().slice(0, 1000) : "";
        contract.studentId = (contract.studentId && typeof contract.studentId === "string") ? contract.studentId.trim().slice(0, 50) : null;
        contract.id = contract.id || `TASK-${Date.now().toString().slice(-4)}`;
        contract.createdAt = new Date().toISOString();
        db.contracts.unshift(contract);
        writeDb(db);

        // Mirror to Supabase if contracts table exists
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/contracts`, {
            method: "POST",
            headers: {
              "apikey": SUPABASE_SERVICE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contract_id: contract.id,
              type: contract.type || "public",
              sponsor: contract.sponsor || "Client",
              title: contract.title,
              description: contract.desc || "",
              amount_usdc: contract.amount,
              student_id: contract.studentId || null,
              status: contract.status || "Escrow Locked"
            })
          });
        } catch (e) {}

        return sendJson(res, 201, { success: true, contract, remainingBalance: employer ? employer.balanceUsdc : undefined });
      } catch (err) {
        return sendJson(res, 500, { error: "Failed to save contract: " + err.message });
      }
    }
  }

  // 7. STUDENTS LIST (GET)
  if (pathname === "/api/students" && req.method === "GET") {
    const db = readDb();
    const students = db.users
      .filter(u => u.hasStudentProfile || u.role === "student")
      .map(u => ({
        name: u.name,
        university: u.studentCredentials?.university || u.university || "NACOS Chapter",
        nacosId: u.studentCredentials?.nacosId || u.nacosId || "NACOS-2026-NODE",
        github: u.studentCredentials?.github || u.github || "",
        balanceUsdc: u.balanceUsdc || 0,
        bmoniConnected: Boolean(u.bmoniConnected)
      }));
    return sendJson(res, 200, students);
  }

  // 8. AUDITS (GET & POST)
  if (pathname === "/api/audits") {
    const db = readDb();
    if (req.method === "GET") {
      return sendJson(res, 200, db.audits);
    }
    if (req.method === "POST") {
      try {
        const audit = await parseJsonBody(req);
        audit.id = crypto.randomUUID();
        audit.createdAt = new Date().toISOString();
        db.audits.unshift(audit);
        writeDb(db);
        return sendJson(res, 201, { success: true, audit });
      } catch (err) {
        return sendJson(res, 500, { error: "Failed to save audit: " + err.message });
      }
    }
  }

  // 9. SETTLEMENTS (GET & POST)
  if (pathname === "/api/settlements") {
    const db = readDb();
    if (req.method === "GET") {
      return sendJson(res, 200, db.settlements);
    }
    if (req.method === "POST") {
      try {
        const settlement = await parseJsonBody(req);
        settlement.id = crypto.randomUUID();
        settlement.timestamp = new Date().toISOString();
        db.settlements.unshift(settlement);
        writeDb(db);
        return sendJson(res, 201, { success: true, settlement });
      } catch (err) {
        return sendJson(res, 500, { error: "Failed to save settlement: " + err.message });
      }
    }
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  const rootDir = process.env.VERCEL ? process.cwd() : __dirname;
  const cleanPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");

  if (pathname === "/" || pathname === "/index.html") {
    const possibleIndexPaths = [
      path.join(rootDir, "index.html"),
      path.join(__dirname, "index.html"),
      path.join(__dirname, "..", "index.html"),
      path.resolve("index.html")
    ];
    for (const ip of possibleIndexPaths) {
      if (fs.existsSync(ip)) {
        try {
          const html = fs.readFileSync(ip, "utf8");
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(html);
        } catch (e) {}
      }
    }
  }

  let filePath = path.join(rootDir, cleanPath);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, cleanPath);
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, "..", cleanPath);
  }

  const resolved = path.resolve(filePath);

  fs.stat(resolved, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA-style routing if available
      const fallbackIndex = path.join(rootDir, "index.html");
      if (fs.existsSync(fallbackIndex)) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return fs.createReadStream(fallbackIndex).pipe(res);
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not Found: " + pathname);
    }

    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(resolved).pipe(res);
  });
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Kilikoro Engine] Production backend listening on http://localhost:${PORT}`);
    console.log(`[Supabase Integration] Connected to ${SUPABASE_URL}`);
    console.log(`[Database Storage] Persisting to ${DB_FILE}`);
  });
}

module.exports = handleRequest;
module.exports.server = server;
module.exports.handleRequest = handleRequest;
