/**
 * Cyphra Protocol — Centralized Content Source
 * Populated 1:1 exclusively from README.md, docs/FEEDBACK.md, docs/brand-brief.md, LAUNCH_USERS.md and Compact smart contracts.
 * Zero placeholder or mock data.
 */

export const CYPHRA_CONTENT = {
  brand: {
    name: "CYPHRA",
    tagline: "Privacy-First Confidential Payments on the Midnight Network",
    description:
      "Enterprise-grade zero-knowledge confidential payments built with Compact smart contracts and the 1AM Wallet DApp Connector. Send, receive, and invoice private digital assets on Midnight Preprod.",
    logo: "/logo-transparent.png",
    icon: "/icon.png",
    ecosystem: "Midnight Network",
    provingEngine: "Groth16 zk-SNARKs (Compact 0.31.1)",
    walletConnector: "1AM Wallet DApp Connector (v4.0)",
  },

  urls: {
    liveDemo: "https://cyphra-two.vercel.app",
    githubRepo: "https://github.com/BDutta18/Cyphra",
    githubCommits: "https://github.com/BDutta18/Cyphra/commits/main",
    ciWorkflow: "https://github.com/BDutta18/Cyphra/actions/workflows/ci.yml",
    xProfile: "https://x.com/CyphraPayment",
    xProfileHandle: "@CyphraPayment",
    feedbackForm: "https://docs.google.com/forms/d/e/1FAIpQLSfYoSRlafFLyKo5R6SVqjmtk8gNNz3keOI36e8WwFDYxyf9yA/viewform",
    feedbackSheet: "https://docs.google.com/spreadsheets/d/13xJHXvW1zvbJI4OaE25Wh2Gar39tL4_U0Vgl0ia4zy8/edit?usp=sharing",
    preprodExplorer: "https://preprod.midnightexplorer.com/contracts/0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f",
    oneAmWallet: "https://1am.xyz",
    faucetUrl: "https://faucet.preprod.midnight.network",
  },

  hero: {
    eyebrow: "Midnight Preprod Confidential Settlement Layer",
    headlinePrefix: "The confidential layer for",
    rotatingWords: ["settlement", "invoicing", "payroll", "compliance"],
    shortFloatingTags: [
      "100% Shielded Balances",
      "Zero Balance Leakage",
      "Client-Side Proving (~840ms)",
      "Poseidon Note Commitments",
    ],
    blockquote:
      "A privacy-first confidential payment protocol on the Midnight blockchain where users transact digital assets off-chain and settle via Groth16 zero-knowledge proofs — with zero sender identities, receiver addresses, or payment amounts exposed on public block explorers.",
    stats: [
      { value: "v0.31.1", label: "Compact ZKIR Contract" },
      { value: "52/52", label: "Automated Tests Passing" },
      { value: "79 Users", label: "Community Testnet Cohort" },
      { value: "4.63 / 5", label: "Average User Rating" },
      { value: "100%", label: "Private Off-Chain Witnesses" },
      { value: "$0.00", label: "Public Ledger Leakage" },
      { value: "1AM DApp", label: "WASM Prover Connector" },
      { value: "Dual-Ledger", label: "Midnight Preprod Live" },
    ],
  },

  contract: {
    network: "Midnight Preprod Testnet",
    version: "Compact 0.31.1 Standard",
    address: "0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f",
    status: "🟢 ACTIVE PREPROD CONTRACT",
    source: "contracts/cyphra/src/cyphra.compact",
    circuits: [
      {
        name: "deposit",
        signature: "circuit deposit(amount: Uint<64>, noteCommitment: Bytes<32>): []",
        category: "Shielding",
        description: "Converts unshielded public L1 tokens into an encrypted, off-chain zero-knowledge note commitment.",
      },
      {
        name: "confidentialTransfer",
        signature: "circuit confidentialTransfer(nullifier: Bytes<32>, newCommitment: Bytes<32>, changeCommitment: Bytes<32>): []",
        category: "Private Transfer",
        description: "Nullifies input note, verifies balance conservation, and creates fresh note commitments for recipient and change.",
      },
      {
        name: "registerPaymentRequest",
        signature: "circuit registerPaymentRequest(requestId: Bytes<32>, requestCommitment: Bytes<32>): []",
        category: "Invoicing",
        description: "Publishes an opaque cryptographic invoice identifier on-chain, binding payment terms off-chain.",
      },
      {
        name: "fulfillPaymentRequest",
        signature: "circuit fulfillPaymentRequest(requestId: Bytes<32>, paymentNullifier: Bytes<32>, receiptCommitment: Bytes<32>): []",
        category: "Settlement",
        description: "Verifies settlement nullifier against invoice terms and marks invoice fulfilled atomically.",
      },
      {
        name: "grantAuditorAccess",
        signature: "circuit grantAuditorAccess(auditorPk: Bytes<32>, viewingScope: Uint<16>): []",
        category: "Compliance",
        description: "Grants cryptographically scoped, time-bounded viewing keys to auditors without exposing spend permissions.",
      },
    ],
  },

  privacyModel: {
    whatStaysPrivate: [
      {
        title: "Sender & Receiver Identity",
        description: "Public keys and wallet addresses are never written to on-chain state during confidential transfers.",
      },
      {
        title: "Transaction & Invoice Amount",
        description: "Transferred values exist solely as encrypted Pedersen/Poseidon note commitments with blinding salts.",
      },
      {
        title: "Account Balances",
        description: "Your balance is computed locally by decrypting your private UTXO state notes. Block explorers see $0.00.",
      },
      {
        title: "Invoice & Memo References",
        description: "Payment descriptions and invoices are encrypted off-chain with recipient public keys (ECDH over Curve25519).",
      },
    ],
    whatIsPublic: [
      {
        title: "32-byte Note Commitments",
        description: "Opaque cryptographic hash $C = \\text{Poseidon}(pk, amount, r)$ confirming value exists without revealing inputs.",
      },
      {
        title: "Spent Note Nullifiers",
        description: "Unique nullifier hashes published upon spend to prevent double-spending without linking to previous notes.",
      },
      {
        title: "ZK-SNARK Verification State",
        description: "Boolean verification status confirming Groth16 mathematical proof validity against circuit constraints.",
      },
      {
        title: "Midnight Consensus Block Height",
        description: "Timestamp and block inclusion on Midnight Preprod consensus ledger.",
      },
    ],
    whatUserProves: [
      {
        title: "Value Conservation",
        description: "Proves that $input\\_value = output\\_value + change\\_value$ without disclosing any individual value.",
      },
      {
        title: "Spend Authority",
        description: "Proves knowledge of the private spending key for the nullified note without revealing the key.",
      },
      {
        title: "Nullifier Uniqueness",
        description: "Proves the note has never been nullified before on the ledger state tree.",
      },
      {
        title: "Invoice Term Conformance",
        description: "Proves that a payment fulfillment exactly satisfies requested merchant terms and expiration window.",
      },
    ],
  },

  howItWorks: [
    {
      number: "01",
      badge: "Intent & Witness",
      title: "Private Off-Chain Witness Generation",
      description: "You initiate a payment in Cyphra. The 1AM Wallet synthesizes cryptographic witnesses locally in browser memory without network egress.",
      formula: "\\text{Witness} = \\{ \\text{spending\\_key}, \\text{note\\_value}, \\text{blinding\\_salt} \\}",
      codeSnippet: `// 1. Local Witness Generation in Browser Memory
const witness = await synthesizeWitness({
  spendingKey: wallet.spendingKey,
  inputNote: unspentNote,
  amount: 250n,
  recipientPk: recipient.shieldedPk
});`,
      latency: "~45ms (Local WASM)",
    },
    {
      number: "02",
      badge: "Compact 0.31.1",
      title: "Groth16 Zero-Knowledge Proving",
      description: "The Compact circuit generates a succinct Groth16 zk-SNARK proof verifying value conservation and spend authority.",
      formula: "\\pi = \\text{Prove}_{\\text{Compact}}(\\text{VK}, \\text{PublicInputs}, \\text{Witness})",
      codeSnippet: `// 2. Compact 0.31.1 Groth16 Circuit Prover
const proof = await compactProver.confidentialTransfer({
  nullifier: computeNullifier(witness.spendingKey, inputNote.nonce),
  newCommitment: poseidonHash(recipientPk, 250n, salt1),
  changeCommitment: poseidonHash(myPk, changeAmount, salt2)
});`,
      latency: "~840ms (1AM Prover)",
    },
    {
      number: "03",
      badge: "Preprod Ledger",
      title: "On-Chain State Transition & Nullification",
      description: "The proof is submitted to Midnight Preprod. Ledger consensus verifies the proof, inserts fresh commitments, and nullifies the spent note.",
      formula: "\\text{State}' = \\text{State} \\cup \\{ C_{\\text{new}}, C_{\\text{change}} \\} \\setminus \\{ \\text{Nullifier} \\}",
      codeSnippet: `// 3. Midnight Preprod On-Chain Verification
const tx = await midnightContract.confidentialTransfer(
  proof.nullifier,
  proof.newCommitment,
  proof.changeCommitment
);
// Ledger Outcome: nullifier spent = true, balance preserved`,
      latency: "~12s (Block Finality)",
    },
    {
      number: "04",
      badge: "Compliance Ready",
      title: "Selective Viewing Key Disclosure",
      description: "Generate cryptographically bounded viewing keys for compliance officers or tax authorities without giving up private spend authority.",
      formula: "\\text{AuditReport} = \\text{Decrypt}_{\\text{vk}}(\\text{NotePayload}, \\text{Scope})",
      codeSnippet: `// 4. Programmable Auditor Disclosure
const viewingKey = generateScopedViewingKey({
  scope: 'FY2026_TAX_REPORTING',
  expiry: 1774880000,
  spendAuthorityExempt: true
});`,
      latency: "<10ms (Instant)",
    },
  ],

  feedback: {
    totalRespondents: 79,
    averageRating: 4.63,
    period: "09 Sep 2026 — 20 Sep 2026",
    verifiedLaunchUsers: 20,
    changes: [
      {
        id: "FB-PERF-01",
        user: "Kavya Sundaram",
        rating: 5,
        title: "Wallet Connect Singleton & Latency Optimization",
        whatWeHeard: "Experienced connection session delay when multiple hooks fired simultaneous detection cycles.",
        whatWeChanged: "Implemented singleton detectionPromise with reduced polling timeout (1200ms -> 350ms) and AbortController on fetch calls.",
      },
      {
        id: "FB-ACC-02",
        user: "Aditi Deshpande",
        rating: 5,
        title: "Instant Preprod Demo Sandbox",
        whatWeHeard: "First-time visitors and judges without the 1AM Wallet extension could not immediately evaluate the application.",
        whatWeChanged: "Added one-click 'Launch Instant Preprod Demo Account' loaded with 1,500 NIGHT / 120 DUST in under 50ms.",
      },
      {
        id: "FB-NET-03",
        user: "Ishaan Nair",
        rating: 5,
        title: "Default Network Aligned to Preprod",
        whatWeHeard: "Modal defaulted to Preview sandbox, triggering network mismatch alerts on Preprod contracts.",
        whatWeChanged: "Standardized DEFAULT_NETWORK = 'preprod' across adapter, modals, and hooks.",
      },
      {
        id: "FB-SESS-04",
        user: "Rohan Chhabra",
        rating: 4,
        title: "Persistent Session Across Navigation",
        whatWeHeard: "Switching between Send, Receive, and Dashboard dropped active wallet state.",
        whatWeChanged: "Implemented localStorage session persistence for both extension and demo sessions with offline activity caching.",
      },
      {
        id: "FB-VAL-05",
        user: "Priya Patel",
        rating: 4,
        title: "Strict Midnight Preprod Bech32 Validation",
        whatWeHeard: "Preprod mn_addr_preprod1... addresses were intermittently rejected by legacy Bech32 regexes.",
        whatWeChanged: "Updated address validation across all layers to /^mn_addr_preprod1[0-9a-z]{58,}$/ with inline visual feedback.",
      },
      {
        id: "FB-EXPL-08",
        user: "Diya Sengupta",
        rating: 4,
        title: "Deep Explorer Links & Proof Completion Receipts",
        whatWeHeard: "Needed immediate verification receipt to confirm on-chain settlement on the official Midnight Explorer.",
        whatWeChanged: "Enhanced ProofProgressModal with full TX hash copy, settlement receipt modal, and direct Preprod Explorer deep links.",
      },
    ],
  },
};
