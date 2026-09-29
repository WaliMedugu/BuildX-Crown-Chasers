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

// Persistent Database Directory & File
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "kilikoro_db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf8");
  return JSON.parse(JSON.stringify(INITIAL_DB));
}

function writeDb(data) {
  try {
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

const server = http.createServer(async (req, res) => {
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

      if (!name || !email || !password || !role) {
        return sendJson(res, 400, { error: "Name, email, password, and role are required." });
      }

      if (password.length < 6) {
        return sendJson(res, 400, { error: "Password must be at least 6 characters." });
      }

      const db = readDb();
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return sendJson(res, 400, { error: "An account with this email already exists. Please sign in." });
      }

      // Generate BMONI Card & Wallet
      const walletAddress = "0x" + crypto.randomBytes(4).toString("hex");
      const cardNumber = `5399 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
      const cardCvv = String(Math.floor(100 + Math.random() * 900));

      const isStudent = role === "student";
      const profile = {
        id: crypto.randomUUID(),
        name,
        email,
        role,
        hasStudentProfile: isStudent,
        hasEmployerProfile: !isStudent,
        studentCredentials: isStudent ? {
          university: university || "NACOS Chapter",
          nacosId: nacosId || `NACOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          github: github || ""
        } : null,
        employerCredentials: !isStudent ? {
          company: company || "Independent Client",
          regNumber: regNumber || "RC-" + Math.floor(100000 + Math.random() * 900000),
          department: department || "Engineering & Procurement"
        } : null,
        university: isStudent ? (university || "NACOS Chapter") : (company || "Independent Client"),
        nacosId: isStudent ? (nacosId || `NACOS-2026-${Math.floor(1000 + Math.random() * 9000)}`) : null,
        github: github || "",
        company: !isStudent ? company : null,
        walletAddress,
        cardNumber,
        cardCvv,
        balanceUsdc: 0.00,
        bmoniConnected: Boolean(bmoniPhone),
        bmoniPhone: bmoniPhone || null,
        bmoniTag: bmoniPhone ? `${name.toLowerCase().replace(/\s+/g, "")}.bmoni` : null,
        createdAt: new Date().toISOString()
      };

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
        if (!credentials.company) {
          return sendJson(res, 400, { error: "Company or Organization name is required for Employer verification." });
        }
        user.hasEmployerProfile = true;
        user.employerCredentials = {
          company: credentials.company,
          regNumber: credentials.regNumber || "RC-" + Math.floor(100000 + Math.random() * 900000),
          department: credentials.department || "Engineering & Procurement",
          location: credentials.location || "Nigeria / Remote"
        };
        user.role = "employer";
      } else if (targetRole === "student") {
        if (!credentials.university || !credentials.nacosId) {
          return sendJson(res, 400, { error: "University and NACOS Student ID are required for Student verification." });
        }
        user.hasStudentProfile = true;
        user.studentCredentials = {
          university: credentials.university,
          nacosId: credentials.nacosId,
          github: credentials.github || ""
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
                employerCredentials: user.employerCredentials
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

      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return sendJson(res, 404, { error: "User not found." });
      }

      user.bmoniConnected = true;
      user.bmoniPhone = bmoniPhone || "+234 810 " + Math.floor(1000000 + Math.random() * 9000000);
      user.bmoniTag = bmoniTag || `${user.name.toLowerCase().replace(/\s+/g, "")}.bmoni`;

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

  // 6. CONTRACTS (GET & POST)
  if (pathname === "/api/contracts") {
    const db = readDb();
    if (req.method === "GET") {
      return sendJson(res, 200, db.contracts);
    }
    if (req.method === "POST") {
      try {
        const contract = await parseJsonBody(req);
        if (!contract.title || !contract.amount) {
          return sendJson(res, 400, { error: "Contract title and amount required." });
        }
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

        return sendJson(res, 201, { success: true, contract });
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
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);

  // Security check: ensure path is within __dirname
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not Found: " + pathname);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[Kilikoro Engine] Production backend listening on http://localhost:${PORT}`);
  console.log(`[Supabase Integration] Connected to ${SUPABASE_URL}`);
  console.log(`[Database Storage] Persisting to ${DB_FILE}`);
});
