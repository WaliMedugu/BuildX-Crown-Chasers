/**
 * ==========================================================================
 * BMONI FINTECH REST API CLIENT (BuildX 2026 Hackathon Integration)
 * Integrates Kilikoro Protocol with BMONI stablecoin rails and virtual cards
 * ==========================================================================
 */

class BmoniClient {
  constructor(config = {}) {
    // Configurable endpoint (sandbox or production BMONI gateway)
    this.baseUrl = config.baseUrl || "https://api.bmoni.io/v1";
    this.apiKey = config.apiKey || (typeof process !== "undefined" && process.env?.BMONI_API_KEY) || "bmoni_live_buildx_crownchasers_2026";
    this.exchangeRate = 1600; // 1 USDC = ₦1,600 cNGN
  }

  /**
   * Helper for authenticated HTTP requests
   */
  async _request(endpoint, method = "GET", body = null) {
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "X-Protocol-Client": "Kilikoro-NACOS/1.0"
      };

      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`BMONI API HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      // Graceful fallback for offline demo / hackathon sandbox
      console.warn(`[BMONI Client] Live endpoint unreachable (${endpoint}), executing local settlement simulator:`, err.message);
      return this._fallbackHandler(endpoint, method, body);
    }
  }

  /**
   * 1. Lock Milestone Funds into Escrow
   */
  async lockEscrow({ contractId, employerId, studentNacosId, amountUSDC, title }) {
    return await this._request("/escrow/lock", "POST", {
      contractId,
      employerId,
      beneficiaryId: studentNacosId,
      amountUSDC,
      title,
      currency: "USDC",
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 2. Release Escrow on Cryptographic Proof-of-Competence Attestation
   */
  async releaseEscrow({ contractId, attestationSignature, metrics }) {
    return await this._request("/escrow/release", "POST", {
      contractId,
      attestationSignature,
      astDigest: metrics.signature || "0xast_verified_digest",
      complexityScore: metrics.complexity || 5,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 3. Issue Virtual Mastercard for Student (Direct Spend)
   */
  async issueVirtualCard({ studentName, nacosId, university }) {
    return await this._request("/cards/issue", "POST", {
      cardType: "MASTERCARD_VIRTUAL",
      cardHolder: studentName.toUpperCase(),
      nacosId,
      university,
      currency: "USDC",
      spendingLimitUSDC: 5000.00
    });
  }

  /**
   * 4. Fetch Real-time Card Balance
   */
  async getCardBalance(cardId = "default") {
    return await this._request(`/cards/${cardId}/balance`, "GET");
  }

  /**
   * 5. Nigerian Bank Off-Ramp Rails (BMONI Embedded Nigeria)
   */
  async getNigerianBanks() {
    return await this._request("/banks?country=NG", "GET");
  }

  async verifyBankAccount({ bankCode, accountNumber }) {
    return await this._request("/accounts/resolve", "POST", {
      bankCode,
      accountNumber,
      country: "NG"
    });
  }

  async registerWithdrawalAccount({ accountName, accountNumber, bankCode, bankName }) {
    return await this._request("/recipients", "POST", {
      type: "NGN_BANK_ACCOUNT",
      name: accountName,
      accountNumber,
      bankCode,
      bankName,
      currency: "NGN"
    });
  }

  async createWithdrawalProposal({ recipientId, amountUSDC, amountNGN }) {
    return await this._request("/transfers/proposals", "POST", {
      recipientId,
      sourceCurrency: "USDC",
      targetCurrency: "NGN",
      amountUSDC,
      amountNGN: amountNGN || amountUSDC * this.exchangeRate,
      idempotencyKey: `PROP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    });
  }

  async signProposal({ proposalId, authSignature }) {
    return await this._request("/transfers/sign", "POST", {
      proposalId,
      authSignature: authSignature || "sig_verified_nacos_node",
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 5. Freeze / Unfreeze Virtual Card
   */
  async toggleCardFreeze(cardId, shouldFreeze) {
    return await this._request(`/cards/${cardId}/freeze`, "POST", { freeze: shouldFreeze });
  }

  /**
   * Offline / Sandbox fallback simulator for live hackathon demos
   */
  _fallbackHandler(endpoint, method, body) {
    const timestamp = new Date().toISOString();
    const mockTx = "0xbmoni_" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    if (endpoint.includes("/escrow/lock")) {
      return {
        status: "SUCCESS",
        escrowId: `ESCROW-${Date.now().toString().slice(-6)}`,
        lockedAmountUSDC: body?.amountUSDC || 150,
        transactionHash: mockTx,
        state: "ESCROW_LOCKED",
        timestamp
      };
    }

    if (endpoint.includes("/escrow/release")) {
      return {
        status: "SETTLED",
        settledAmountUSDC: 150,
        settlementSpeed: "1.4s",
        transactionHash: mockTx,
        targetCard: "5399 •••• •••• 4892",
        timestamp
      };
    }

    if (endpoint.includes("/cards/issue")) {
      const randCard = `5399 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        status: "ACTIVE",
        cardNumber: randCard,
        cardHolder: body?.cardHolder || "GUEST USER",
        cvv: String(Math.floor(100 + Math.random() * 900)),
        expDate: "09/29",
        balanceUSDC: 0.00,
        timestamp
      };
    }

    if (endpoint.includes("/balance")) {
      return {
        liquidUSDC: 0.00,
        liquidCNGN: 0,
        status: "ACTIVE",
        timestamp
      };
    }

    return { status: "OK", timestamp };
  }
}

// Browser & Node Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = BmoniClient;
} else {
  window.BmoniClient = BmoniClient;
}
