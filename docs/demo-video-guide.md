# Cyphra — Final MVP Demo Video Guide & Walkthrough Script

## 1. Video Overview & Hosting Link

- **Direct Cloudinary Video Stream**: [https://res.cloudinary.com/wt88ln1l/video/upload/v1789666881/Screen_Recording_2026-09-17_230655.mp4](https://res.cloudinary.com/wt88ln1l/video/upload/v1789666881/Screen_Recording_2026-09-17_230655.mp4)
- **Target Network**: Midnight Preprod (`0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f`)
- **DApp Production URL**: [https://cyphra-two.vercel.app](https://cyphra-two.vercel.app)
- **Resolution**: 1080p Full HD (60 FPS)

---

## 2. Step-by-Step Video Walkthrough Script

| Scene & Timestamp | Action on Screen | Audio / Commentary Script |
|---|---|---|
| **0:00 - 0:25** | Landing page showcase & Midnight positioning | *"Welcome to Cyphra, the privacy-first confidential payment layer built natively on the Midnight Network. Cyphra enables true financial sovereignty by eliminating surveillance on digital asset transfers using zero-knowledge cryptography."* |
| **0:25 - 0:50** | 1AM Wallet connection on Preprod | *"We click 'Connect 1AM Wallet'. The 1AM DApp Connector v4 prompts for authorization. Notice the network guard automatically confirms we are connected to the live Midnight Preprod ledger."* |
| **0:50 - 1:20** | Dual balance & Shielding deposit | *"On our Dashboard, we see our Unshielded public NIGHT balance alongside our Shielded Private Note Commitments. We deposit 50 NIGHT into our private shield. The 1AM extension balances the transaction, and the deposit() circuit commits our note on-chain."* |
| **1:20 - 2:00** | Confidential P2P Transfer | *"Now we navigate to 'Send'. We paste a Midnight Preprod address (`mn_addr_preprod1...`), enter 25 NIGHT, and add an encrypted memo. Notice the live validation, available balance, MAX button, and network fee breakdown. We click 'Review Confidential Payment' then 'Confirm & Sign'."* |
| **2:00 - 2:40** | Multi-stage Prover Pipeline | *"Watch the zero-knowledge proving pipeline execute: witness synthesis, Groth16 circuit generation, 1AM DUST balancing, and Midnight consensus confirmation. The transaction hash is displayed with a 1-click copy button and direct Midnight Explorer link."* |
| **2:40 - 3:15** | Invoice Creation (`cyphra:pay`) & QR | *"Next, we create a payment request under 'Request'. We enter 100 NIGHT with a description. Instantly, a cryptographic payment URI and QR code are generated. Payers can scan or load this link to settle confidentially."* |
| **3:15 - 3:50** | Selective Auditor Disclosure | *"Under 'Activity', we inspect our decrypted transaction ledger. For regulatory compliance, we open 'Selective Auditor Disclosure', enter an auditor's address, and generate a verified time-bounded viewing proof without ever revealing our spend keys."* |
| **3:50 - 4:15** | Preprod Explorer Verification & Wrap-up | *"Finally, we verify our contract deployment on the Midnight Preprod Explorer at `0xcc4a29303...`. Cyphra is completely live and open source on GitHub. Thank you!"* |

---

## 3. Production Verification

- [x] Tested on Google Chrome with 1AM Wallet Extension v4.x
- [x] Tested on Midnight Preprod network with live RPC (`rpc.preprod.midnight.network`)
- [x] Verified zero-knowledge note commitment creation and nullifier verification
- [x] Verified responsive UI on desktop and mobile viewports
