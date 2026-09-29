/**
 * ==========================================================================
 * KILIKORO SUPABASE DATABASE CLIENT (supabase-client.js)
 * Persistent storage for audits, public/private contracts, and BMONI payouts.
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
        const [k, ...v] = line.split("=");
        if (k && v.length) process.env[k.trim()] = v.join("=").trim();
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
  }

  async fetchFromSupabase(endpoint, options = {}) {
    const url = `${this.url}/rest/v1/${endpoint}`;
    const headers = {
      "apikey": this.key,
      "Authorization": `Bearer ${this.key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        throw new Error(`Supabase Error (${res.status}): ${await res.text()}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[Supabase Client] ${endpoint}:`, err.message);
      return null;
    }
  }

  /**
   * Save a completed Code Audit Report
   */
  async saveAudit(audit) {
    return await this.fetchFromSupabase("audits", {
      method: "POST",
      body: JSON.stringify({
        repo_url: audit.repo,
        score: audit.score,
        security_status: audit.securityStatus,
        production_readiness: audit.productionReadiness,
        summary: audit.summary,
        created_at: new Date().toISOString()
      })
    });
  }

  /**
   * Save a new Public or Private Contract
   */
  async saveContract(contract) {
    return await this.fetchFromSupabase("contracts", {
      method: "POST",
      body: JSON.stringify({
        contract_id: contract.id,
        type: contract.type,
        sponsor: contract.sponsor,
        title: contract.title,
        description: contract.desc,
        amount_usdc: contract.amount,
        student_id: contract.studentId,
        status: contract.status,
        created_at: new Date().toISOString()
      })
    });
  }

  /**
   * Record a BMONI Stablecoin Payout Settlement
   */
  async recordSettlement(payout) {
    return await this.fetchFromSupabase("settlements", {
      method: "POST",
      body: JSON.stringify({
        tx_hash: payout.transactionHash,
        attestation_id: payout.attestationId,
        amount_usdc: payout.settledAmountUSDC,
        card_id: payout.cardId,
        latency_ms: payout.settlementLatencyMs,
        created_at: new Date().toISOString()
      })
    });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = KilikoroDatabase;
}
if (typeof window !== "undefined") {
  window.KilikoroDatabase = KilikoroDatabase;
}
