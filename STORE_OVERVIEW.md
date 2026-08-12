# 🏛️ BRITSYNC STORE — MANAGED TRUST MARKETPLACE & GLOBAL HERITAGE GUILD REGISTRY

## 1. Executive Summary & Brand Purpose
**Britsync** ([nobleshop.co.uk](https://nobleshop.co.uk)) is an ultra-luxurious, managed global commerce platform and cryptographic heritage registry. It connects discerning patrons worldwide directly with verified master artisans, craft guilds, and historical ateliers.

Unlike conventional e-commerce sites (such as Etsy or Amazon), Britsync eliminates speculative middlemen, counterfeit mass-productions, and predatory platform markups by implementing a **Patron Direct Escrow Model**.

---

## 2. Core Value Proposition & Principles

1. **95% Patron Direct Payout**:
   - **95%** of every transaction flows directly into the verified local bank or digital wallet of the master artisan.
   - **5%** is retained by Britsync to maintain digital infrastructure, on-site physical geofence auditing, and cryptographic provenance passports.

2. **On-Site Geofence & Physical Verification**:
   - Every registered atelier undergoes physical geofencing and on-site audit by certified regional inspectors (`INSPECTOR` role).
   - Audits verify workshop existence, labor ethics, non-exploitation, and raw material authenticity.

3. **Cryptographic Provenance Passports**:
   - Every creation listed on Britsync is issued a unique digital & NFC physical **Provenance Passport** (`/passport/[id]`).
   - The passport logs creation date, master craftsman signature, geographic village/GPS coordinates, audit grade, and cryptographic ledger hash.

4. **Zero-Gradient Mayfair Aesthetic**:
   - Designed strictly following high-fashion, ultra-luxury Mayfair typography (Playfair Display & Outfit serif headers, rich gold accents `#D4AF37`, deep dark theme & immaculate light theme adaptation, and zero gradient distortions).

---

## 3. Platform Workflow & Governance Model

```
[Master Artisan / Maker]
       │
       ├── 1. Fills Registration Form & Bio
       ├── 2. Receives 6-Digit Verification OTP via Gmail
       ├── 3. Inputs OTP → Profile Created with status 'PENDING_AUDIT'
       │
[Britsync CEO / Governance Board (/dashboard/ceo)]
       │
       ├── 4. Reviews Atelier Dossier, Geofence & Craft History
       ├── 5. Clicks "Approve Atelier Accreditation"
       ├── 6. Dispatches Official Accreditation Email via Gmail SMTP
       │
[Accredited Maker Dashboard (/dashboard/maker)]
       │
       ├── 7. Maker Unlocks Full Catalog Publishing
       ├── 8. Lists Masterwork Creations & Assigns Provenance Passports
       │
[Global Patron / Buyer (/products, /makers/[id])]
       │
       ├── 9. Purchases Masterwork → Funds Secured in Patron Direct Escrow
       └── 10. Item Shipped → Escrow Released (95% to Maker, 5% Platform)
```

---

## 4. User Roles & System Access

| Role | Access URL | Permissions & Capabilities |
| :--- | :--- | :--- |
| **BUYER / PATRON** | `/products`, `/categories/*`, `/checkout` | Browse verified masterworks, inspect provenance passports, order custom artisan pieces, and track shipping. |
| **MAKER / ARTISAN** | `/dashboard/maker`, `/makers/[id]` | Manage products, track pending audit status, upload workshop photos, withdraw earned escrow payouts, and manage custom orders. |
| **INSPECTOR** | `/dashboard/inspector` | Conduct physical geofence audits, upload workshop inspection notes, and issue Grade A+ compliance certificates. |
| **CEO / ADMIN** | `/dashboard/ceo` | Executive intelligence center, review pending artisan applications, approve makers with automated Gmail dispatch, reply to client inquiries, and export financial audit reports. |

---

## 5. Security & Verification Engine
- **Email Verification**: 6-digit OTP security code generated and dispatched via Gmail SMTP (`nodemailer`) upon registration.
- **Session Security**: HTTP-only JWT session cookies with role-based route protection.
- **Audit Storage**: Persistent inquiries inbox (`contact_inquiries.json`) and OTP code engine (`otp_codes.json`).
- **Database Engine**: Prisma ORM over SQLite/PostgreSQL supporting Users, MakerProfiles, InspectorProfiles, Products, Orders, Wallets, and VerificationRequests.

---

## 6. Official Domain & Support
- **Website Domain**: [https://nobleshop.co.uk](https://nobleshop.co.uk)
- **Headquarters**: Mayfair, London, W1K
- **Registry Support**: `britsync.registry@gmail.com`
