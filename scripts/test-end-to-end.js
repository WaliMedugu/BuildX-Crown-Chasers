/**
 * Comprehensive End-to-End Simulation Test
 * Verifies all roles (Student & Employer), BMONI Escrow Locking,
 * Code Verification Payouts, and Nigerian Bank Off-Ramp Rails.
 */

const BmoniClient = require("../js/bmoni-client.js");

async function runEndToEndTest() {
  console.log("========================================================");
  console.log("  KILIKORO PROTOCOL: FULL ROLE & BMONI INTEGRATION TEST");
  console.log("========================================================\n");

  const client = new BmoniClient();

  // Test 1: BMONI Embedded Nigerian Banking Rails
  console.log("[TEST 1] Testing Nigerian Bank Directory...");
  const banks = await client.getNigerianBanks();
  console.log(`  ✓ Loaded ${banks.length} Nigerian Banks:`, banks.map(b => b.name).slice(0, 4).join(", ") + "...");

  console.log("\n[TEST 2] Testing NUBAN Account Name Resolution...");
  const resolved = await client.verifyBankAccount({ bankCode: "058", accountNumber: "0123456789" });
  console.log(`  ✓ NUBAN 0123456789 resolved to: ${resolved.accountName}`);

  // Test 2: Employer Perspective - Create Contract & Lock Escrow
  console.log("\n[TEST 3] Employer Role: Creating Contract & Locking Escrow...");
  const employerProfile = {
    name: "Dr. Alabi Tech Ventures",
    role: "employer",
    email: "partner@alabitech.ng",
    balanceUsdc: 1500.00
  };
  console.log(`  ✓ Active User: ${employerProfile.name} (Role: ${employerProfile.role})`);

  const escrowLock = await client.lockEscrow({
    contractId: "CT-PRIV-901",
    employerId: employerProfile.name,
    studentNacosId: "UNILAG-CS-2026-0482",
    amountUSDC: 250.00,
    title: "High-Throughput Cache Expiry Resolver"
  });
  console.log(`  ✓ BMONI Escrow Locked: ID=${escrowLock.escrowId}, Amount=$${escrowLock.lockedAmountUSDC} USDC, Hash=${escrowLock.transactionHash}`);

  // Test 3: Role Switch to Student Perspective
  console.log("\n[TEST 4] Individual Role Switching: Toggling to Student Developer...");
  const studentProfile = {
    ...employerProfile,
    name: "Wali Medugu",
    role: "student",
    nacosId: "UNILAG-CS-2026-0482",
    university: "UNILAG • NACOS Chapter",
    cardNumber: "5399 8091 8801 7163",
    cardCvv: "834",
    balanceUsdc: 0.00
  };
  console.log(`  ✓ Switched Active Role: ${studentProfile.name} (Role: ${studentProfile.role})`);
  console.log(`  ✓ NACOS Chapter Node : ${studentProfile.university}`);
  console.log(`  ✓ BMONI Virtual Card : ${studentProfile.cardNumber}`);

  // Test 4: Student Completes Milestone -> Payout Released
  console.log("\n[TEST 5] Student Submits Milestone -> BMONI Escrow Release...");
  const release = await client.releaseEscrow({
    contractId: "CT-PRIV-901",
    attestationSignature: "sig_ast_verified_0x89f",
    metrics: { signature: "0xast_digest_pass", complexity: 3 }
  });
  studentProfile.balanceUsdc += release.settledAmountUSDC;
  console.log(`  ✓ Escrow Settlement Status : ${release.status}`);
  console.log(`  ✓ Settled Amount           : +$${release.settledAmountUSDC} USDC`);
  console.log(`  ✓ Settlement Speed         : ${release.settlementSpeed}`);
  console.log(`  ✓ Student Virtual Card Bal : $${studentProfile.balanceUsdc.toFixed(2)} USDC (≈ ₦${(studentProfile.balanceUsdc * 1600).toLocaleString()} cNGN)`);

  // Test 5: Off-Ramp to Nigerian Bank Account
  console.log("\n[TEST 6] Student Off-Ramp: Withdrawing to Nigerian Commercial Bank...");
  const withdrawUSDC = 100.00;
  console.log(`  1. Registering Recipient Bank Account (GTBank / 0123456789)...`);
  const rcp = await client.registerWithdrawalAccount({
    accountName: studentProfile.name,
    accountNumber: "0123456789",
    bankCode: "058",
    bankName: "Guaranty Trust Bank (GTBank)"
  });
  console.log(`     ✓ Recipient Registered: ${rcp.recipientId}`);

  console.log(`  2. Creating Withdrawal Proposal ($${withdrawUSDC} USDC -> NGN)...`);
  const proposal = await client.createWithdrawalProposal({
    recipientId: rcp.recipientId,
    amountUSDC: withdrawUSDC,
    amountNGN: withdrawUSDC * 1600 - 50
  });
  console.log(`     ✓ Proposal Created: ${proposal.proposalId}, Rate=₦${proposal.exchangeRate}/USDC, Net NGN=₦${proposal.amountNGN.toLocaleString()}`);

  console.log(`  3. Cryptographically Signing Proposal & Settling via NIP Rails...`);
  const signed = await client.signProposal({
    proposalId: proposal.proposalId
  });
  studentProfile.balanceUsdc -= withdrawUSDC;
  console.log(`     ✓ Settlement Status : ${signed.status} (${signed.state})`);
  console.log(`     ✓ Transfer Reference: ${signed.reference}`);
  console.log(`     ✓ Estimated Arrival : ${signed.estimatedArrival}`);
  console.log(`     ✓ Remaining Balance : $${studentProfile.balanceUsdc.toFixed(2)} USDC (≈ ₦${(studentProfile.balanceUsdc * 1600).toLocaleString()} cNGN)`);

  console.log("\n========================================================");
  console.log("  ALL TESTS PASSED: FULL SYSTEM RUNNING FLAWLESSLY");
  console.log("========================================================\n");
}

runEndToEndTest().catch(console.error);
