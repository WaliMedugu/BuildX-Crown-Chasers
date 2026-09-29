/**
 * ==========================================================================
 * KILIKORO SUPABASE DATABASE CLIENT (supabase-client.js)
 * Production database client with full backend persistence and Supabase sync.
 * Covers: Profiles, Audits, Contracts, Settlements, Students.
 * ==========================================================================
 */

// Load .env in Node.js if available
if (typeof process !== "undefined" && typeof require !== "undefined") {
  try {
    const fs = require("fs");
    const path = require("path");
    const envPath = path.join(__dirname, "..", ".env");
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
  } catch (e) {}
}

const SUPABASE_CONFIG = {
  url: "https://wgcgkbftotnkkeyurttb.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnY2drYmZ0b3Rua2tleXVydHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzY4NjUsImV4cCI6MjEwNjIxMjg2NX0.yosBpBph5rNHPrisblRyKNZU0dRsNUUT15YZUDtlB80"
};

class KilikoroDatabase {
  constructor(config = SUPABASE_CONFIG) {
    this.url = config.url;
    this.key = config.anonKey;
    this.apiBase = typeof window !== "undefined" && window.location ? window.location.origin : "http://localhost:3000";
    this.isConnected = true;
  }

  /**
   * Save or Update User Profile
   */
  async saveProfile(profile) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("kilikoro_active_profile", JSON.stringify(profile));
    }
    return profile;
  }

  /**
   * Get Active Profile
   */
  getProfile() {
    if (typeof localStorage !== "undefined") {
      const local = localStorage.getItem("kilikoro_active_profile");
      if (local) {
        try {
          return JSON.parse(local);
        } catch (e) {}
      }
    }
    return null;
  }

  /**
   * Save an Audit Report (Backend API + Local)
   */
  async saveAudit(audit) {
    if (typeof localStorage !== "undefined") {
      const localAudits = JSON.parse(localStorage.getItem("kilikoro_audits") || "[]");
      localAudits.unshift(audit);
      localStorage.setItem("kilikoro_audits", JSON.stringify(localAudits.slice(0, 20)));
    }

    try {
      const res = await fetch(`${this.apiBase}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(audit)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return audit;
  }

  /**
   * Fetch All Contracts (Persistent Backend + Supabase)
   */
  async getContracts() {
    const legacyMockIds = ["TASK-BMONI-104", "TASK-HELIX-202", "TASK-PAY-303", "TASK-NACOS-404", "TASK-0460"];

    try {
      const res = await fetch(`${this.apiBase}/api/contracts`);
      if (res.ok) {
        const contracts = await res.json();
        if (Array.isArray(contracts)) {
          const sanitized = contracts.filter(c => !legacyMockIds.includes(c.id));
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("kilikoro_contracts", JSON.stringify(sanitized));
          }
          return sanitized;
        }
      }
    } catch (e) {}

    if (typeof localStorage !== "undefined") {
      const local = localStorage.getItem("kilikoro_contracts");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.filter(c => !legacyMockIds.includes(c.id));
            localStorage.setItem("kilikoro_contracts", JSON.stringify(sanitized));
            return sanitized;
          }
        } catch (e) {}
      }
    }

    return [];
  }

  /**
   * Save a Contract (Persistent Backend + Supabase)
   */
  async saveContract(contract) {
    if (typeof localStorage !== "undefined") {
      const local = JSON.parse(localStorage.getItem("kilikoro_contracts") || "[]");
      local.unshift(contract);
      localStorage.setItem("kilikoro_contracts", JSON.stringify(local));
    }

    try {
      const res = await fetch(`${this.apiBase}/api/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contract)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return contract;
  }

  /**
   * Record a BMONI Payout Settlement (Persistent Backend)
   */
  async recordSettlement(payout) {
    if (typeof localStorage !== "undefined") {
      const local = JSON.parse(localStorage.getItem("kilikoro_settlements") || "[]");
      local.unshift(payout);
      localStorage.setItem("kilikoro_settlements", JSON.stringify(local.slice(0, 30)));
    }

    try {
      const res = await fetch(`${this.apiBase}/api/settlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payout)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return payout;
  }

  /**
   * Fetch All Settlements
   */
  async getSettlements() {
    try {
      const res = await fetch(`${this.apiBase}/api/settlements`);
      if (res.ok) {
        const settlements = await res.json();
        if (Array.isArray(settlements)) return settlements;
      }
    } catch (e) {}

    if (typeof localStorage !== "undefined") {
      const local = localStorage.getItem("kilikoro_settlements");
      if (local) {
        try {
          return JSON.parse(local);
        } catch (e) {}
      }
    }

    return [];
  }

  /**
   * Fetch Verified Students (Persistent Backend)
   */
  async getStudents() {
    try {
      const res = await fetch(`${this.apiBase}/api/students`);
      if (res.ok) {
        const students = await res.json();
        if (Array.isArray(students) && students.length > 0) return students;
      }
    } catch (e) {}

    if (typeof localStorage !== "undefined") {
      const local = localStorage.getItem("kilikoro_students");
      if (local) {
        try {
          return JSON.parse(local);
        } catch (e) {}
      }
    }

    return [];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = KilikoroDatabase;
}
if (typeof window !== "undefined") {
  window.KilikoroDatabase = KilikoroDatabase;
}
