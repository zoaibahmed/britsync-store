"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// 1. FEATURED GUILD ARTISANS DATA (SECTION 5)
const BRITSYNC_MAKERS = [
  {
    id: "fatima-morocco",
    num: "01",
    name: "Fatima Aït-Ouahi",
    role: "Master Weaver & Guild Matriarch",
    location: "Aït Bouguemez Valley · High Atlas · Morocco",
    regionCode: "MAR-ATL-401",
    lineage: "7TH GENERATION LINEAGE",
    craft: "High-Atlas Heritage Loom Weaving",
    coordinates: "31.6295° N, 7.9811° W",
    locationBadge: "STUDIO LOCATION VERIFIED · High Atlas · Morocco",
    materials: [
      { name: "100% Mountain Sheep Wool", status: "Origin Verified" },
      { name: "Wild Saffron Dye", status: "Material Inspection Completed" },
      { name: "Natural Indigo Mineral", status: "Lab Tested Organic" }
    ],
    story: "Fatima leads a collective of 24 women weavers, preserving traditional Berber geometries and oral weaving techniques passed down through generations without written notes.",
    quote: "Our loom carries the memory of seven generations. Each knot is a word spoken in a language that never dies.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    status: "BRITSYNC GUILD APPELLATION · VERIFIED",
    payoutModel: "100% Desired Price Paid via Smart Escrow",
    britsyncRole: "Britsync handles export logistics, protective crating, and customs clearance so the atelier can remain focused on its craft."
  },
  {
    id: "soomro-pakistan",
    num: "02",
    name: "Aisha & Ghulam Soomro",
    role: "Master Blockprinters & Dye Alchemists",
    location: "Bhit Shah · Sindh Valley · Pakistan",
    regionCode: "PAK-SND-104",
    lineage: "5TH GENERATION GUILD KEEPERS",
    craft: "21-Step Natural Dye Ajrak Blockprinting",
    coordinates: "25.8072° N, 68.4907° E",
    locationBadge: "STUDIO LOCATION VERIFIED · Sindh Valley · Pakistan",
    materials: [
      { name: "Handspun Indus Cotton", status: "Origin Verified" },
      { name: "Fermented Indigo Pits", status: "Lab Tested Organic" },
      { name: "Pomegranate Shell Dye", status: "Material Inspection Completed" }
    ],
    story: "Aisha and Ghulam maintain the sacred 21-step natural vegetable dyeing ritual. Each Indus cotton textile undergoes weeks of river washing, mud-resist carving, and natural fermented indigo pit immersion.",
    quote: "Twenty-one stages of mud, river water, sun, and indigo. When you work with nature, fabric acquires a soul.",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    status: "BRITSYNC GUILD APPELLATION · VERIFIED",
    payoutModel: "Direct Local Guild Account Escrow",
    britsyncRole: "Britsync manages photography, storytelling, and European distribution so the master printers can focus entirely on their 21-stage craft."
  },
  {
    id: "zeynep-turkey",
    num: "03",
    name: "Zeynep Kilic",
    role: "Master Ceramicist & Quartz Glazer",
    location: "Iznik Atelier · Anatolia · Turkey",
    regionCode: "TUR-IZN-302",
    lineage: "4TH GENERATION KILN MASTER",
    craft: "Ottoman High-Quartz Silica Ceramics",
    coordinates: "40.4286° N, 29.7214° E",
    locationBadge: "STUDIO LOCATION VERIFIED · Iznik Atelier · Turkey",
    materials: [
      { name: "85% Quartz Frit Clay", status: "Purity Tested 85%+" },
      { name: "Cobalt Oxide Glaze", status: "Material Inspection Completed" },
      { name: "Pine Wood Firing", status: "Kiln Protocol Verified" }
    ],
    story: "Zeynep recreates 16th-century Ottoman royal Iznik formulas containing over 85% pure quartz silica, fired in traditional pine wood kilns to achieve crystal-clear radiance.",
    quote: "Quartz is fire frozen into glass. Under 1,200 degrees of wood heat, history is sealed forever.",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    status: "BRITSYNC GUILD APPELLATION · VERIFIED",
    payoutModel: "Escrow Released Upon UK Collector Inspection",
    britsyncRole: "Britsync deploys physical material testing and insured shock-proof crating so the ceramicist can remain focused on her firing formulas."
  },
  {
    id: "rajesh-india",
    num: "04",
    name: "Rajesh Kumar",
    role: "Master Teak Carver & Brass Inlayer",
    location: "Saharanpur · Uttar Pradesh · India",
    regionCode: "IND-SAH-509",
    lineage: "6TH GENERATION LINEAGE",
    craft: "Teakwood High-Relief & Brass Tarkashi",
    coordinates: "29.9640° N, 77.5460° E",
    locationBadge: "STUDIO LOCATION VERIFIED · Saharanpur · India",
    materials: [
      { name: "Reclaimed Seasoned Teak", status: "FSC Origin Verified" },
      { name: "Pure Brass Sheet Wire", status: "Purity Tested 99.9%" },
      { name: "Beeswax Polish", status: "Material Inspection Completed" }
    ],
    story: "Rajesh hand-carves reclaimed teakwood with hand chisels and embeds solid brass wire Tarkashi inlay in solitary manual sessions that take up to 90 days per piece.",
    quote: "The chisel speaks only when the mind is still. Seasoned teak remembers every strike for centuries.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    status: "BRITSYNC GUILD APPELLATION · VERIFIED",
    payoutModel: "100% Desired Price Guaranteed",
    britsyncRole: "Britsync handles climate-controlled export packaging and UK customs clearance so the master carver can focus on his 90-day chisel sessions."
  }
];

// 2. MANAGED COMMERCE PARADIGM STAGES (SECTION 2)
const MANAGED_STAGES = [
  {
    id: "payout",
    num: "01",
    stepLabel: "01 — MAKER AUTONOMY",
    title: "Maker Payout Guarantee",
    subtitle: "100% of the desired payout goes directly to the atelier.",
    tag: "MAKER AUTONOMY",
    desc: "Authenticity starts with fairness. Traditional platforms take 20%+ fees and force remote creators to manage marketing and export logistics. On Britsync, 100% of the maker's requested price is paid directly to their studio account with ZERO commissions.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1400",
    badge: "100% DESIRED PAYOUT",
    gps: "GPS: 31.6295° N, 7.9811° W (High Atlas, Morocco)",
    checks: [
      { title: "DESIRED MAKER PRICE GUARANTEED", detail: "0% commission deducted from artisan payout" },
      { title: "MANAGED LOGISTICS & CUSTOMS", detail: "Britsync handles 100% of crating, tariffs & delivery" },
      { title: "SMART ESCROW PROTECTION", detail: "Funds held securely and released upon patron delivery" }
    ]
  },
  {
    id: "audit",
    num: "02",
    stepLabel: "02 — PHYSICAL VERIFICATION",
    title: "Verified Maker Studios",
    subtitle: "GPS location, materials, and physical signatures are independently verified.",
    tag: "PHYSICAL VERIFICATION",
    desc: "Authenticity isn't self-declared on a website. Britsync field inspectors physically visit remote ateliers to map satellite GPS boundaries, test organic natural materials, and record physical signatures with local craft guilds.",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1400",
    badge: "STUDIO GEOFENCE VERIFIED",
    gps: "GPS: 25.8072° N, 68.4907° E (Sindh Valley, Pakistan)",
    checks: [
      { title: "STUDIO LOCATION CONFIRMED", detail: "Exact satellite GPS coordinates locked and audited" },
      { title: "MATERIALS INDEPENDENTLY TESTED", detail: "100% natural dyes and organic fibers chemical report" },
      { title: "INSPECTOR SIGNATURE RECORDED", detail: "Physical field auditor & guild master accreditation" }
    ]
  },
  {
    id: "passport",
    num: "03",
    stepLabel: "03 — DIGITAL PROVENANCE",
    title: "Provenance Passport",
    subtitle: "Every verified piece receives a permanent authenticity record.",
    tag: "DIGITAL PROVENANCE",
    desc: "Every creation carries an unforgeable Digital Provenance Passport. Embedded with an encrypted NFC seal, it links physical items directly to permanent studio GPS coordinates, raw material reports, and guild certificates.",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1400",
    badge: "PASSPORT ISSUED #BR-2026",
    gps: "GPS: 40.4286° N, 29.7214° E (Iznik Atelier, Turkey)",
    checks: [
      { title: "PERMANENT DIGITAL PASSPORT", detail: "Unforgeable record linked directly to physical piece" },
      { title: "NFC CHIP INTEGRATION", detail: "Scan physical item with phone to inspect origin data" },
      { title: "MUSEUM-GRADE CERTIFICATE", detail: "Immutable ledger block hash (#BR-2026-HERITAGE)" }
    ]
  }
];

// 3. FINANCIAL TRANSPARENCY COVERAGE (SECTION 3)
const MARKUP_COVERAGE = [
  {
    num: "01",
    title: "Physical Atelier Verification",
    desc: "Deploying field auditors to remote mountain valleys to map satellite GPS boundaries, verify master lineage, and record physical guild accreditation."
  },
  {
    num: "02",
    title: "Atelier Documentaries & Photography",
    desc: "Hiring local craft historians, translators, and photographers to document the master creator's technique and oral tradition without digital friction."
  },
  {
    num: "03",
    title: "Museum-Grade Logistics & Customs",
    desc: "Coordinating insured white-glove airfreight, custom wooden crating, tariffs, VAT processing, and UK customs clearance directly from the atelier."
  },
  {
    num: "04",
    title: "Smart Escrow Protection",
    desc: "Holding 100% of patron payments in secure escrow, releasing the artisan's full requested price automatically upon verified UK delivery."
  },
  {
    num: "05",
    title: "Digital Provenance Ledgers",
    desc: "Sustaining digital infrastructure, encrypted NFC physical tags, and permanent provenance records for every registered creation."
  },
  {
    num: "06",
    title: "24/7 Mayfair Patron Concierge",
    desc: "Managing all collector inquiries, custom crating requests, translation, and white-glove delivery tracking."
  }
];

// 4. CORE VALUES OF BRITSYNC (SECTION 4)
const CORE_VALUES = [
  {
    num: "I",
    title: "Quality over Quantity",
    desc: "We curate limited-run and one-of-a-kind works made by identifiable artisans. Every piece has a maker, a place, and a reason to exist."
  },
  {
    num: "II",
    title: "Story over Product",
    desc: "A piece is more than a physical object. We preserve the lineage, technique, place, and human time behind every work."
  },
  {
    num: "III",
    title: "Trust over Price",
    desc: "Our patrons aren't simply buying an object. They're investing in verified provenance, maker integrity, and a story they can trust."
  },
  {
    num: "IV",
    title: "People over Technology",
    desc: "Technology stays in the background. We handle the digital infrastructure, payments, logistics, and verification so our artisans can focus on their craft."
  },
  {
    num: "V",
    title: "Authenticity over Scale",
    desc: "We will never grow by lowering our standards. Every new artisan, region, and guild must meet the same rigorous physical verification process."
  },
  {
    num: "VI",
    title: "Partnerships over Fast Sales",
    desc: "We build long-term relationships with master creators, supporting their ateliers, families, and the communities that keep their craft alive."
  }
];

// 5. PROVENANCE PROTOCOL STAGES (SECTION 6)
const PROTOCOL_STAGES = [
  {
    step: "STAGE 01",
    title: "Maker & Guild Verification",
    subtech: "Genealogy & Guild Audit",
    question: "Who made it?",
    detail: "We verify the maker's lineage, apprenticeship history, oral traditions, and recognized guild affiliations."
  },
  {
    step: "STAGE 02",
    title: "Material Verification",
    subtech: "Natural Material Analysis",
    question: "What is it made from?",
    detail: "Materials are examined through laboratory and field testing to verify natural fibers, dyes, minerals, and declared components."
  },
  {
    step: "STAGE 03",
    title: "Studio Location Verification",
    subtech: "GPS Geofence Boundary",
    question: "Where was it made?",
    detail: "Field inspectors verify the atelier's physical location and establish a GPS boundary around the verified workspace."
  },
  {
    step: "STAGE 04",
    title: "Digital Provenance Record",
    subtech: "Cryptographic Record",
    question: "How can I verify it later?",
    detail: "Each verified creation receives a unique identifier linked to its maker, materials, origin, and verification history."
  }
];

// 6. QUESTIONS OF TRUST FAQ DATA (SECTION 7)
const TRUST_FAQS = [
  {
    q: "What makes Britsync different from traditional marketplaces?",
    a: "Britsync is a managed commerce platform. Instead of asking artisans to manage photography, digital storefronts, international logistics, and customer operations themselves, Britsync handles the commercial infrastructure around their work. The maker remains focused on the craft."
  },
  {
    q: "How does Britsync give makers 100% of their desired payout?",
    a: "Artisans state their exact desired payout price. Britsync adds a transparent managed markup on the buyer side to cover logistics, insurance, verification, and operations. 100% of the maker's requested price is held in escrow and released directly to their account upon delivery."
  },
  {
    q: "How does Britsync verify authenticity?",
    a: "Every eligible creation passes through our 4-stage provenance protocol: Maker & Guild Verification, Material Verification, Studio Location Verification, and a Digital Provenance Record."
  },
  {
    q: "What is a Britsync Provenance Passport?",
    a: "A permanent digital record connecting a verified creation to its maker, origin, materials, and verification history. Where applicable, cryptographic identifiers and NFC technology make the record easy to access and difficult to alter."
  },
  {
    q: "How does Britsync handle Geographic Indications (GIs)?",
    a: "Where a maker or region holds a recognized Geographic Indication, Britsync records and respects that designation as part of the provenance record. Britsync's own verification system does not replace government or legally recognized GI certification."
  }
];

// Motion Variants for Animations
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  })
};

export default function AboutWebflowClient() {
  const [activeMakerIdx, setActiveMakerIdx] = useState<number>(0);
  const [selectedAuditMaker, setSelectedAuditMaker] = useState<typeof BRITSYNC_MAKERS[0] | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(1);

  const activeMaker = BRITSYNC_MAKERS[activeMakerIdx];
  const currentStage = MANAGED_STAGES[activeStageIdx];

  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--text)", overflow: "hidden" }}>
      
      {/* ════════════════════════════════════════════════════════════
          1. LUXURY EDITORIAL HERO WITH RICH ARCHITECTURAL BACKDROP
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "11rem 2rem 7rem",
          backgroundColor: "var(--surface)",
          position: "relative",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(var(--accent) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1240px", margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            custom={0}
            style={{ display: "inline-block", marginBottom: "2rem" }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.8rem",
                padding: "0.55rem 1.5rem",
                backgroundColor: "var(--background)",
                border: "1px solid var(--accent)",
                color: "var(--accent)",
                fontSize: "0.7rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 700,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent)" }} />
              BRITSYNC • THE MANAGED GLOBAL COMMERCE PLATFORM
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            custom={1}
            style={{
              fontSize: "clamp(3.2rem, 6.2vw, 5.8rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              lineHeight: 1.05,
              color: "var(--text)",
              marginBottom: "2rem",
              letterSpacing: "-0.03em",
            }}
          >
            Preserving Human Heritage<br />
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>Through Managed Commerce</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            custom={2}
            style={{
              fontSize: "1.18rem",
              lineHeight: 1.9,
              color: "var(--text-muted)",
              marginBottom: "3.2rem",
              fontWeight: 300,
              maxWidth: "860px",
              margin: "0 auto 3.2rem"
            }}
          >
            Britsync is the world&apos;s first **Managed Global Commerce Platform**. Traditional marketplaces assume isolated master creators in mountain valleys are digital marketers, SEO copywriters, and international shipping agents. Britsync abstracts 100% of non-creative friction: the maker focuses purely on crafting masterworks — we manage photography, storytelling, GPS geofenced audits, customs clearance, and global white-glove delivery.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            custom={3}
            style={{ display: "flex", gap: "1.4rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/collections"
                className="btn-accent"
                style={{
                  textDecoration: "none",
                  padding: "1.25rem 3.4rem",
                  borderRadius: "0px",
                  fontSize: "0.78rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  backgroundColor: "var(--accent)",
                  color: "var(--primary)",
                  border: "1px solid var(--accent)",
                  boxShadow: "var(--shadow-md)",
                  display: "inline-block"
                }}
              >
                Explore Registered Masterpieces &rarr;
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a
                href="#transparency"
                style={{
                  textDecoration: "none",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text)",
                  padding: "1.25rem 3.4rem",
                  borderRadius: "0px",
                  fontSize: "0.78rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "inline-block"
                }}
              >
                Zero-Fee Maker Model
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            custom={4}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "2rem",
              backgroundColor: "var(--background)",
              border: "1px solid var(--glass-border)",
              borderTop: "3px solid var(--accent)",
              padding: "2.5rem 2rem",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {[
              { val: "0%", label: "Maker Commissions or SaaS Fees" },
              { val: "100%", label: "Desired Price Paid to Artisan" },
              { val: "45+", label: "Protected Appellation Guilds" },
              { val: "100%", label: "Smart Escrow Payout Safety" },
            ].map((m) => (
              <div key={m.label}>
                <div style={{ fontSize: "2.2rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 400 }}>{m.val}</div>
                <div style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.4rem" }}>{m.label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. BENEFIT-DRIVEN MANAGED ARCHITECTURE & VERIFICATION REPORT STAGE
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "7.5rem 2rem 8.5rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
              THE MANAGED ARCHITECTURE
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)", margin: "0 0 1rem" }}>
              A Trust Layer for Makers & Patrons
            </h2>
            <p style={{ fontSize: "1.08rem", color: "var(--text-muted)", fontWeight: 300, maxWidth: "680px", margin: "0 auto" }}>
              Three layers protect makers, verify provenance, and give patrons confidence.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "4.5rem", alignItems: "center" }}>
            
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "1.8rem" }}>
              <div
                style={{
                  position: "absolute",
                  left: "2.4rem",
                  top: "3rem",
                  bottom: "3rem",
                  width: "2px",
                  backgroundColor: "var(--glass-border)",
                  zIndex: 0,
                }}
              />

              {MANAGED_STAGES.map((stg, idx) => {
                const isActive = idx === activeStageIdx;
                return (
                  <motion.div
                    key={stg.id}
                    onClick={() => setActiveStageIdx(idx)}
                    whileHover={{ x: 6 }}
                    style={{
                      position: "relative",
                      zIndex: 2,
                      padding: "2rem 2.2rem 2rem 4rem",
                      backgroundColor: isActive ? "var(--surface)" : "var(--background)",
                      border: isActive ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                      borderLeft: isActive ? "6px solid var(--accent)" : "1px solid var(--glass-border)",
                      cursor: "pointer",
                      transition: "all 0.35s ease",
                      boxShadow: isActive ? "var(--shadow-md)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>
                        {stg.stepLabel}
                      </span>
                      {isActive && (
                        <span style={{ fontSize: "0.62rem", backgroundColor: "rgba(212,175,55,0.15)", color: "var(--accent)", padding: "0.25rem 0.75rem", border: "1px solid rgba(212,175,55,0.4)", fontWeight: 700, letterSpacing: "1.5px" }}>
                          ● ACTIVE STAGE
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "1.4rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.4rem", fontWeight: 400 }}>
                      {stg.title}
                    </h3>
                    <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                      {stg.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ position: "relative" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStage.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--glass-border)",
                    borderTop: "4px solid var(--accent)",
                    padding: "2.8rem",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block" }}>
                        BRITSYNC VERIFICATION REPORT
                      </span>
                      <span style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--text)", fontWeight: 600 }}>
                        AUDIT RECORD #{currentStage.id.toUpperCase()}-2026
                      </span>
                    </div>
                    <span style={{ fontSize: "0.65rem", backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981", padding: "0.4rem 0.9rem", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 700, letterSpacing: "1.5px" }}>
                      ● STATUS — VERIFIED
                    </span>
                  </div>

                  <div style={{ position: "relative", height: "260px", overflow: "hidden", marginBottom: "1.8rem", border: "1px solid var(--glass-border)" }}>
                    <img
                      src={currentStage.image}
                      alt={currentStage.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.92)" }}
                    />
                    <div style={{ position: "absolute", top: "0.9rem", left: "0.9rem", backgroundColor: "var(--accent)", color: "var(--primary)", padding: "0.4rem 0.9rem", fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
                      {currentStage.badge}
                    </div>
                    <div style={{ position: "absolute", bottom: "0.9rem", right: "0.9rem", backgroundColor: "rgba(10,10,12,0.88)", backdropFilter: "blur(10px)", padding: "0.45rem 1rem", border: "1px solid rgba(212,175,55,0.3)", color: "var(--accent)", fontSize: "0.72rem", fontFamily: "monospace" }}>
                      {currentStage.gps}
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.5rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.8rem", fontWeight: 400 }}>
                    {currentStage.title}
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.75, color: "var(--text-muted)", marginBottom: "1.8rem", fontWeight: 300 }}>
                    {currentStage.desc}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1.6rem" }}>
                    {currentStage.checks.map((chk) => (
                      <div key={chk.title} style={{ backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", padding: "1rem 1.2rem", display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                        <span style={{ color: "#10B981", fontSize: "1.1rem", lineHeight: 1, marginTop: "0.1rem" }}>✓</span>
                        <div>
                          <div style={{ fontSize: "0.78rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text)", fontWeight: 700 }}>
                            {chk.title}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem", fontWeight: 300 }}>
                            {chk.detail}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. INTEGRATED TRANSPARENCY & ZERO-FEE MODEL SECTION
          ════════════════════════════════════════════════════════════ */}
      <section
        id="transparency"
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1340px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
              100% FINANCIAL TRANSPARENCY
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4.2vw, 3.6rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)", margin: "0 0 1rem" }}>
              How We Earn: The Zero-Fee Maker Model
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", fontWeight: 300, maxWidth: "760px", margin: "0 auto" }}>
              Britsync takes 0% commission from artisans. Instead of forcing creators to act as shipping managers and copywriters, we cover operations through a transparent buyer-side markup.
            </p>
          </div>

          {/* 2 Pillars Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "3rem", marginBottom: "5rem" }}>
            
            <div style={{ padding: "3rem", backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", borderTop: "4px solid var(--accent)" }}>
              <span style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.6rem" }}>
                PILLAR 01
              </span>
              <h3 style={{ fontSize: "1.6rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 1rem", fontWeight: 400 }}>
                100% Desired Artisan Payout
              </h3>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-muted)", marginBottom: "1.8rem", fontWeight: 300 }}>
                Every master maker defines their own desired payout price. This is the exact, uncompromised amount they receive upon acquisition. Artisans pay ZERO listing fees or platform sales commissions.
              </p>
              <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)", padding: "1.2rem 1.5rem" }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>
                  MAKER COMMISSION DEDUCTED
                </span>
                <strong style={{ fontSize: "1.5rem", color: "var(--accent)", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  £0.00 (0% Fee)
                </strong>
              </div>
            </div>

            <div style={{ padding: "3rem", backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", borderTop: "4px solid var(--accent)" }}>
              <span style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.6rem" }}>
                PILLAR 02
              </span>
              <h3 style={{ fontSize: "1.6rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 1rem", fontWeight: 400 }}>
                Managed Operational Markup
              </h3>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-muted)", marginBottom: "1.8rem", fontWeight: 300 }}>
                Britsync adds a transparent managed markup on top of the artisan&apos;s payout. Paid by the patron at checkout, this markup directly finances field audits, customs processing, insured crating, and white-glove delivery.
              </p>
              <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)", padding: "1.2rem 1.5rem" }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>
                  BUYER MARKUP COVERAGE
                </span>
                <strong style={{ fontSize: "1.5rem", color: "var(--text)", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  100% Operations & Audit Funded
                </strong>
              </div>
            </div>

          </div>

          {/* Illustrative Financial Breakdown */}
          <div style={{ textAlign: "center", backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", padding: "3.5rem 2.5rem" }}>
            <span style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.6rem" }}>
              TRANSPARENT TRANSACTION EXAMPLE
            </span>
            <h3 style={{ fontSize: "1.8rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.8rem", fontWeight: 400 }}>
              How a £240 Masterpiece Payout Breaks Down
            </h3>
            <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", marginBottom: "2.8rem", fontWeight: 300, maxWidth: "600px", margin: "0 auto 2.8rem" }}>
              Here is how a £240 acquisition breaks down transparently between the maker payout and managed operational coverage:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.8rem", alignItems: "center" }}>
              <div style={{ padding: "2rem 1.5rem", backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)" }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                  1. MAKER PAYOUT
                </span>
                <div style={{ fontSize: "2.4rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 300, margin: "0.4rem 0" }}>
                  £150
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 300 }}>
                  100% of desired price paid via escrow
                </span>
              </div>

              <div style={{ padding: "2rem 1.5rem", backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)" }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                  2. MANAGED COVERAGE
                </span>
                <div style={{ fontSize: "2.4rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", fontWeight: 300, margin: "0.4rem 0" }}>
                  £90
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 300 }}>
                  Audits, crating, airfreight & customs
                </span>
              </div>

              <div style={{ padding: "2rem 1.5rem", backgroundColor: "var(--surface)", border: "1px solid var(--accent)", borderTop: "3px solid var(--accent)" }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                  3. PATRON ACQUISITION
                </span>
                <div style={{ fontSize: "2.4rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 400, margin: "0.4rem 0" }}>
                  £240
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 300 }}>
                  Final checkout price
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. THE SIX CORE VALUES OF BRITSYNC (UNDERSTATED LUXURY RESTRAINT)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariants}
            style={{ textAlign: "center", marginBottom: "5.5rem" }}
          >
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.7rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "0.8rem",
              }}
            >
              OUR SIX CORE PLATFORM PRINCIPLES
            </span>
            <h2
              style={{
                fontSize: "clamp(2.4rem, 4vw, 3.5rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                color: "var(--text)",
                margin: 0,
              }}
            >
              The Britsync Values
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.2rem" }}>
            {CORE_VALUES.map((val, idx) => (
              <motion.div
                key={val.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeInUpVariants}
                custom={idx}
                whileHover={{ y: -3 }}
                style={{
                  padding: "3rem 2.4rem",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "260px",
                  transition: "border-color 0.3s ease, transform 0.3s ease"
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: "1.8rem",
                      color: "var(--accent)",
                      marginBottom: "1rem",
                      fontWeight: 300,
                    }}
                  >
                    {val.num}.
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: "1.35rem",
                      fontWeight: 400,
                      color: "var(--text)",
                      marginBottom: "1.2rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {val.title}
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                    {val.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. MEET OUR LIVING GUILD ARTISANS (REFINED HIGH-TRUST SECTION)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "9.5rem 2rem",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariants}
            style={{ marginBottom: "4.5rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}>
              <span style={{ width: "28px", height: "1px", backgroundColor: "var(--accent)" }} />
              <span
                style={{
                  color: "var(--accent)",
                  fontSize: "0.7rem",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                LIVING GUILD MAKERS
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 300,
                  color: "var(--text)",
                  margin: 0,
                  lineHeight: 1.12,
                }}
              >
                The Artisans Behind the Masterpieces
              </h2>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {BRITSYNC_MAKERS.map((maker, idx) => {
                  const isActive = idx === activeMakerIdx;
                  return (
                    <button
                      key={maker.id}
                      onClick={() => setActiveMakerIdx(idx)}
                      style={{
                        padding: "0.65rem 1.4rem",
                        fontSize: "0.72rem",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? "var(--primary)" : "var(--text)",
                        backgroundColor: isActive ? "var(--accent)" : "var(--background)",
                        border: isActive ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {maker.num}. {maker.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMaker.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "4.5rem",
                alignItems: "center",
                backgroundColor: "var(--background)",
                padding: "3.8rem",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-lg)"
              }}
            >
              <div style={{ position: "relative", height: "520px", border: "1px solid var(--glass-border)" }}>
                <img
                  src={activeMaker.image}
                  alt={activeMaker.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.92) contrast(1.05)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "1.5rem",
                    backgroundColor: "rgba(10,10,12,0.88)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    padding: "0.5rem 1.1rem",
                    color: "var(--accent)",
                    fontSize: "0.68rem",
                    letterSpacing: "1.5px",
                    fontWeight: 600,
                  }}
                >
                  ✦ {activeMaker.locationBadge}
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    left: "1.5rem",
                    backgroundColor: "var(--accent)",
                    padding: "0.5rem 1.1rem",
                    color: "var(--primary)",
                    fontSize: "0.68rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {activeMaker.lineage}
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "1.5rem",
                    left: "1.5rem",
                    right: "1.5rem",
                    backgroundColor: "rgba(10,10,12,0.88)",
                    backdropFilter: "blur(12px)",
                    padding: "1.6rem",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: "#FFFFFF"
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "1.1rem",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.95)",
                      margin: 0,
                      fontWeight: 300,
                    }}
                  >
                    &ldquo;{activeMaker.quote}&rdquo;
                  </p>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {activeMaker.status}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "clamp(2.4rem, 4vw, 3.5rem)",
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontWeight: 300,
                    lineHeight: 1.1,
                    marginBottom: "0.5rem",
                    color: "var(--text)",
                  }}
                >
                  {activeMaker.name}
                </h3>

                <span
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: "2rem",
                    fontWeight: 400,
                  }}
                >
                  {activeMaker.role} &bull; {activeMaker.location}
                </span>

                <div style={{ marginBottom: "2rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "0.8rem",
                    }}
                  >
                    VERIFIED MATERIALS
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {activeMaker.materials.map((mat) => (
                      <div
                        key={mat.name}
                        style={{
                          fontSize: "0.85rem",
                          backgroundColor: "var(--surface)",
                          border: "1px solid var(--glass-border)",
                          padding: "0.6rem 1.1rem",
                          color: "var(--text)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span>✦ <strong>{mat.name}</strong></span>
                        <span style={{ fontSize: "0.68rem", color: "var(--accent)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{mat.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "0.6rem",
                    }}
                  >
                    BRITSYNC MANAGED SUPPORT
                  </span>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text)", margin: 0, fontWeight: 300 }}>
                    {activeMaker.britsyncRole}
                  </p>
                </div>

                <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "var(--text-muted)", marginBottom: "2.5rem", fontWeight: 300 }}>
                  {activeMaker.story}
                </p>

                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAuditMaker(activeMaker)}
                    style={{
                      padding: "1.2rem 3rem",
                      backgroundColor: "var(--accent)",
                      color: "var(--primary)",
                      border: "none",
                      fontSize: "0.78rem",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "var(--shadow-md)"
                    }}
                  >
                    INSPECT PROVENANCE &rarr;
                  </motion.button>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.6rem" }}>
                    Studio • Materials • Lineage • Inspector
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. PROVENANCE VERIFICATION BLUEPRINT (4 STAGES)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariants}
            style={{ textAlign: "center", marginBottom: "5.5rem" }}
          >
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.7rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "0.8rem",
              }}
            >
              VERIFICATION BLUEPRINT
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)", margin: "0 0 1rem" }}>
              The 4-Stage Provenance Protocol
            </h2>
            <p style={{ maxWidth: "680px", margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.8, color: "var(--text-muted)", fontWeight: 300 }}>
              Four verification checkpoints completed before a creation receives the Britsync Provenance Seal.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem", position: "relative" }}>
            {PROTOCOL_STAGES.map((stg, idx) => (
              <motion.div
                key={stg.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeInUpVariants}
                custom={idx}
                whileHover={{ y: -6, borderColor: "var(--accent)" }}
                style={{
                  padding: "2.8rem 2.2rem",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
                  transition: "border-color 0.3s ease, transform 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--accent)", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 700 }}>
                      {stg.step}
                    </span>
                    {idx < 3 && (
                      <span style={{ fontSize: "0.85rem", color: "var(--accent)", opacity: 0.6 }}>→</span>
                    )}
                  </div>

                  <h3 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.35rem", color: "var(--text)", fontWeight: 400, marginBottom: "0.4rem" }}>
                    {stg.title}
                  </h3>

                  <div style={{ fontSize: "0.72rem", color: "var(--accent)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 600 }}>
                    {stg.subtech}
                  </div>

                  <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                    {stg.detail}
                  </p>
                </div>

                <div style={{ borderTop: "1px dashed var(--glass-border)", paddingTop: "1rem", marginTop: "1.8rem", fontSize: "0.75rem", color: "var(--text)", fontWeight: 600, letterSpacing: "1px" }}>
                  ✦ QUESTION ANSWERED: <span style={{ color: "var(--accent)", fontWeight: 400 }}>{stg.question}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. QUESTIONS OF TRUST FAQ ACCORDION (QUIET & SOPHISTICATED)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInUpVariants}
            style={{ textAlign: "center", marginBottom: "4.5rem" }}
          >
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.7rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "0.8rem",
              }}
            >
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)", margin: "0 0 1rem" }}>
              Questions of Trust
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 300, maxWidth: "640px", margin: "0 auto" }}>
              The practical answers behind Britsync&apos;s maker, provenance, and commerce model.
            </p>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {TRUST_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <motion.div
                  key={faq.q}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeInUpVariants}
                  custom={idx}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--glass-border)",
                    borderLeft: isOpen ? "4px solid var(--accent)" : "1px solid var(--glass-border)",
                    padding: "1.8rem 2.2rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.2rem", fontWeight: 400, color: "var(--text)", margin: 0 }}>
                      {faq.q}
                    </h3>
                    <span style={{ color: "var(--accent)", fontSize: "1.4rem", fontWeight: 300 }}>{isOpen ? "−" : "+"}</span>
                  </div>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      style={{ marginTop: "1rem", fontSize: "0.95rem", lineHeight: 1.85, color: "var(--text-muted)", margin: "1rem 0 0", fontWeight: 300 }}
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          8. CALL TO ACTION SECTION
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "10rem 2rem",
          backgroundColor: "var(--background)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          style={{ maxWidth: "860px", margin: "0 auto", position: "relative", zIndex: 10 }}
        >
          <span
            style={{
              color: "var(--accent)",
              fontSize: "0.72rem",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 700,
              display: "block",
              marginBottom: "1.4rem",
            }}
          >
            BECOME A PATRON OF GENERATIONAL CRAFT
          </span>
          <h2
            style={{
              fontSize: "clamp(2.5rem, 4.8vw, 4.2rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              color: "var(--accent)",
              marginBottom: "2rem",
              lineHeight: 1.12,
            }}
          >
            Sustain Living Masterpieces
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.9,
              opacity: 0.85,
              color: "var(--text-muted)",
              marginBottom: "3.8rem",
              fontWeight: 300,
            }}
          >
            Whether acquiring a hand-loomed Berber Kilim, an Indus Ajrak blockprint, or an Ottoman Iznik quartz ceramic, you are directly sustaining living master ateliers and keeping centuries of human artistry alive.
          </p>

          <div style={{ display: "flex", gap: "1.4rem", justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/collections"
                className="btn-accent"
                style={{
                  textDecoration: "none",
                  padding: "1.25rem 3.4rem",
                  borderRadius: "0px",
                  fontSize: "0.78rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  backgroundColor: "var(--accent)",
                  color: "var(--primary)",
                  border: "1px solid var(--accent)",
                  boxShadow: "var(--shadow-md)",
                  display: "inline-block"
                }}
              >
                Explore Registered Masterpieces &rarr;
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/become-a-maker"
                style={{
                  textDecoration: "none",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text)",
                  padding: "1.25rem 3.4rem",
                  borderRadius: "0px",
                  fontSize: "0.78rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "inline-block"
                }}
              >
                Apply for Guild Curation
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* STUDIO AUDIT MODAL DRAWER */}
      <AnimatePresence>
        {selectedAuditMaker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAuditMaker(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(10,10,12,0.85)",
              backdropFilter: "blur(14px)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(640px, 92vw)",
                height: "100%",
                backgroundColor: "var(--background)",
                color: "var(--text)",
                overflowY: "auto",
                padding: "3.8rem 3rem",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                borderLeft: "1px solid var(--glass-border)",
              }}
            >
              <button
                onClick={() => setSelectedAuditMaker(null)}
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "2rem",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                ✕
              </button>

              <span
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  fontWeight: 700,
                  marginBottom: "0.8rem",
                }}
              >
                STUDIO PROVENANCE AUDIT REPORT
              </span>

              <h2
                style={{
                  fontSize: "2.4rem",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 300,
                  marginBottom: "0.4rem",
                  color: "var(--text)",
                }}
              >
                {selectedAuditMaker.name}
              </h2>

              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
                {selectedAuditMaker.role} &bull; {selectedAuditMaker.location}
              </p>

              <div
                style={{
                  height: "260px",
                  border: "1px solid var(--glass-border)",
                  overflow: "hidden",
                  marginBottom: "2.5rem",
                }}
              >
                <img
                  src={selectedAuditMaker.portrait}
                  alt={selectedAuditMaker.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.8rem" }}>
                  Technique & Heritage Protocol
                </h4>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text)", fontWeight: 300 }}>
                  {selectedAuditMaker.craft}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "1.6rem",
                  border: "1px solid var(--glass-border)",
                  marginBottom: "2.5rem",
                }}
              >
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Cryptographic Ledger Metadata
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GPS STAMP:</span>
                    <span style={{ color: "var(--accent)" }}>{selectedAuditMaker.coordinates}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>LINEAGE STATUS:</span>
                    <span style={{ color: "#10B981" }}>{selectedAuditMaker.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>MAKER PAYOUT:</span>
                    <span style={{ color: "var(--accent)" }}>{selectedAuditMaker.payoutModel}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
                <Link
                  href="/collections"
                  onClick={() => setSelectedAuditMaker(null)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "1.1rem",
                    backgroundColor: "var(--accent)",
                    color: "var(--primary)",
                    fontSize: "0.75rem",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Explore Atelier Masterpieces &rarr;
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
