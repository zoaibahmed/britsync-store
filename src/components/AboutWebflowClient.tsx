"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// 1. FEATURED GUILD ARTISANS DATA (ONLY USED IN SECTION 3 - NO DUPLICATION)
const BRITSYNC_MAKERS = [
  {
    id: "fatima-morocco",
    num: "01",
    name: "Fatima Ait-Ouahi",
    role: "Master Weaver & Guild Matriarch",
    location: "Aït Bouguemez Valley, High Atlas, Morocco",
    regionCode: "MAR-ATL-401",
    lineage: "7th Generation Lineage",
    craft: "High-Atlas Heritage Loom Weaving",
    coordinates: "31.6295° N, 7.9811° W",
    materials: ["100% Mountain Sheep Wool", "Wild Saffron Dyes", "Crushed Indigo Mineral"],
    story: "In the secluded high-altitude valleys of the High Atlas, Fatima leads a collective of 24 women weavers, preserving 200-year-old tribal Berber geometries transmitted orally without written notes.",
    quote: "Our loom carries the memory of seven generations. Each knot is a word spoken in a language that never dies.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.8%",
    status: "GI Appellation Protected",
    payoutModel: "100% Desired Price Paid via Escrow",
    britsyncRole: "Manages export logistics, custom wooden crating, and UK customs clearance."
  },
  {
    id: "soomro-pakistan",
    num: "02",
    name: "Aisha & Ghulam Soomro",
    role: "Master Blockprinters & Dye Alchemists",
    location: "Bhit Shah, Sindh Valley, Pakistan",
    regionCode: "PAK-SND-104",
    lineage: "5th Generation Guild Keepers",
    craft: "21-Step Natural Dye Ajrak Blockprinting",
    coordinates: "25.8072° N, 68.4907° E",
    materials: ["Handspun Indus Organic Cotton", "Fermented Indigo Pits", "Pomegranate Shell Extract"],
    story: "Maintaining the sacred 21-step natural vegetable dyeing ritual. Each Indus cotton textile undergoes weeks of river washing, mud-resist carving, and natural fermented indigo pit immersion.",
    quote: "Twenty-one stages of mud, river water, sun, and indigo. When you work with nature, fabric acquires a soul.",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    verificationScore: "100%",
    status: "Indus Heritage Registry Sealed",
    payoutModel: "Direct Local Guild Account Escrow",
    britsyncRole: "Handles professional photography, story copywriting, and European distribution."
  },
  {
    id: "zeynep-turkey",
    num: "03",
    name: "Zeynep Kilic",
    role: "Master Ceramicist & Quartz Glazer",
    location: "Iznik Atelier, Anatolia, Turkey",
    regionCode: "TUR-IZN-302",
    lineage: "4th Generation Kiln Master",
    craft: "Ottoman High-Quartz Silica Ceramics",
    coordinates: "40.4286° N, 29.7214° E",
    materials: ["85% Quartz Frit Clay", "Cobalt Oxide Mineral", "Pine Wood Kiln Fire"],
    story: "Recreating 16th-century Ottoman royal Iznik formulas containing over 85% pure quartz silica, fired in traditional pine wood kilns to achieve crystal-clear radiance.",
    quote: "Quartz is fire frozen into glass. Under 1,200 degrees of wood heat, history is sealed forever.",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.5%",
    status: "Anatolian Guild Certified",
    payoutModel: "Escrow Released Upon UK Collector Inspection",
    britsyncRole: "Deploys on-site GPS geofencing and physical material chemical testing."
  },
  {
    id: "rajesh-india",
    num: "04",
    name: "Rajesh Kumar",
    role: "Master Teak Carver & Brass Inlayer",
    location: "Saharanpur, Uttar Pradesh, India",
    regionCode: "IND-SAH-509",
    lineage: "6th Generation Lineage",
    craft: "Teakwood High-Relief & Brass Tarkashi",
    coordinates: "29.9640° N, 77.5460° E",
    materials: ["Reclaimed Seasoned Teak", "Pure Brass Sheet Wire", "Beeswax Polish"],
    story: "Hand-carving reclaimed teakwood with hand chisels and embedding solid brass wire Tarkashi inlay in solitary manual sessions that take up to 90 days per piece.",
    quote: "The chisel speaks only when the mind is still. Seasoned teak remembers every strike for centuries.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.7%",
    status: "Saharanpur Guild Sealed",
    payoutModel: "100% Desired Price Guaranteed",
    britsyncRole: "Manages white-glove insured airfreight logistics directly from workshop."
  }
];

// 2. CORE VALUES OF BRITSYNC (FOUNDER BIBLE)
const CORE_VALUES = [
  {
    num: "I",
    title: "Quality over Quantity",
    desc: "We curate limited-run and one-of-a-kind masterpieces. We strictly reject industrial mass production and factory assembly lines."
  },
  {
    num: "II",
    title: "Story over Product",
    desc: "A product is a physical artifact; its story is its soul. We preserve and sell generational lineage, ancient technique, and dedicated human time."
  },
  {
    num: "III",
    title: "Trust over Price",
    desc: "Our patrons buy absolute trust. We enforce physical geofenced studio audits, inspector signatures, and cryptographic provenance passports."
  },
  {
    num: "IV",
    title: "People over Technology",
    desc: "Technology is an invisible enabler for our artisans. We design interfaces requiring zero digital friction, handling 100% of tech and logistics."
  },
  {
    num: "V",
    title: "Authenticity over Scale",
    desc: "We scale by onboarding new verified artisan regions and guilds, never by diluting our rigorous physical audit standards."
  },
  {
    num: "VI",
    title: "Partnerships over Fast Sales",
    desc: "We build lifelong relationships with master creators, supporting their ateliers, families, and local mountain communities."
  }
];

// 3. TRUST FAQ ACCORDION DATA
const TRUST_FAQS = [
  {
    q: "What makes Britsync different from platforms like Etsy or Amazon Handmade?",
    a: "Etsy and Amazon require master creators to act as web developers, SEO copywriters, English customer service reps, and international shipping managers — creating an insurmountable barrier for isolated artisans. Britsync is a Managed Commerce Platform: the maker focuses solely on crafting their masterwork, while Britsync manages 100% of photography, storytelling, GPS audits, customs clearance, and global shipping."
  },
  {
    q: "How does Britsync ensure artisans receive fair payouts with zero fees?",
    a: "We charge ZERO fees or commissions to the maker. The artisan states their desired price. Britsync adds a transparent managed markup on the buyer side to cover logistics, insurance, and audit operations. Upon verified delivery, 100% of the maker's desired price is released automatically via smart escrow."
  },
  {
    q: "What is a Cryptographic Heritage Passport?",
    a: "It is a digital authenticity seal issued for every registered piece. It logs the studio's exact satellite GPS geofence coordinates, laboratory material purity reports (e.g. 100% natural wool, 85%+ quartz clay), field inspector signatures, and an immutable ledger block hash."
  },
  {
    q: "How are Geographic Indication (GI) appellations protected?",
    a: "Geographic Indication is a legal standard protecting goods possessing qualities specific to their geographical origin. Britsync enforces physical satellite geofencing around certified historical valleys to guarantee that factory counterfeit knock-offs cannot receive accreditation."
  }
];

// Motion Variants for Staggered Animations with Typed Ease Tuple
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
  const [activeHeroTab, setActiveHeroTab] = useState<"artisan" | "ecosystem" | "patron">("ecosystem");

  const activeMaker = BRITSYNC_MAKERS[activeMakerIdx];

  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--text)", overflow: "hidden" }}>
      
      {/* ════════════════════════════════════════════════════════════
          1. HERO SECTION: MANAGED GLOBAL COMMERCE PARADIGM
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "10.5rem 2rem 7.5rem",
          backgroundColor: "var(--background)",
          position: "relative",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />

        <div
          style={{
            maxWidth: "1380px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "5rem",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Left Column: Manifesto & Brand Vision */}
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              custom={0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.8rem",
                marginBottom: "1.8rem",
              }}
            >
              <span style={{ width: "32px", height: "1px", backgroundColor: "var(--accent)" }} />
              <span
                style={{
                  color: "var(--accent)",
                  fontSize: "0.68rem",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                THE MANAGED GLOBAL COMMERCE PLATFORM
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              custom={1}
              style={{
                fontSize: "clamp(2.8rem, 5.2vw, 4.8rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                lineHeight: 1.08,
                color: "var(--text)",
                marginBottom: "1.8rem",
                letterSpacing: "-0.025em",
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
                fontSize: "1.1rem",
                lineHeight: 1.85,
                color: "var(--text-muted)",
                marginBottom: "2.8rem",
                fontWeight: 300,
              }}
            >
              Britsync is the world&apos;s first **Managed Global Commerce Platform**. We remove 100% of digital, financial, and logistical friction for master artisans in remote mountain valleys and historic craft guilds. The maker focuses purely on crafting masterworks — Britsync manages photography, storytelling, GPS geofenced audits, customs clearance, and white-glove UK/EU delivery.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              custom={3}
              style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", marginBottom: "3rem" }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/collections"
                  className="btn-accent"
                  style={{
                    textDecoration: "none",
                    padding: "1.2rem 3rem",
                    borderRadius: "0px",
                    fontSize: "0.75rem",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    fontWeight: 600,
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
                  href="/how-we-earn"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text)",
                    padding: "1.2rem 3rem",
                    borderRadius: "0px",
                    fontSize: "0.75rem",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "inline-block"
                  }}
                >
                  Zero-Fee Maker Thesis
                </Link>
              </motion.div>
            </motion.div>

            {/* Core Platform Counters */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              custom={4}
              style={{ display: "flex", gap: "2.2rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1.8rem" }}
            >
              {[
                { val: "0%", label: "Maker Commissions or SaaS Fees" },
                { val: "100%", label: "Desired Price Paid to Artisan" },
                { val: "45+", label: "Protected Appellation Guilds" },
              ].map((m) => (
                <div key={m.label}>
                  <div style={{ fontSize: "1.6rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 400 }}>{m.val}</div>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.2rem" }}>{m.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Managed Commerce Ecosystem Interactive Visual Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--glass-border)",
              borderTop: "4px solid var(--accent)",
              padding: "2.5rem",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Ecosystem Header Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.8rem" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--accent)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="glow-dot" /> BRITSYNC COMMERCE ARCHITECTURE
              </span>
              <span style={{ fontSize: "0.65rem", backgroundColor: "rgba(212,175,55,0.12)", color: "var(--accent)", padding: "0.3rem 0.8rem", border: "1px solid rgba(212,175,55,0.3)", fontWeight: 700 }}>
                MANAGED PARADIGM
              </span>
            </div>

            {/* Interactive Paradigm Switcher */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.8rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
              {[
                { id: "ecosystem", label: "01. The Ecosystem Bridge" },
                { id: "artisan", label: "02. Artisan Autonomy" },
                { id: "patron", label: "03. Patron Escrow Trust" },
              ].map((tab) => {
                const isActive = activeHeroTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveHeroTab(tab.id as typeof activeHeroTab)}
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.68rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "var(--primary)" : "var(--text-muted)",
                      backgroundColor: isActive ? "var(--accent)" : "transparent",
                      border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Ecosystem Content Stage */}
            <AnimatePresence mode="wait">
              {activeHeroTab === "ecosystem" && (
                <motion.div
                  key="ecosystem"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <div style={{ backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", padding: "1.8rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                      <div>
                        <div style={{ fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>THE ARTISAN</div>
                        <div style={{ fontSize: "0.95rem", color: "var(--text)", fontWeight: 500 }}>Focuses 100% on Crafting</div>
                      </div>
                      <div style={{ color: "var(--accent)", fontSize: "1.3rem" }}>&rarr;</div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>THE PATRON</div>
                        <div style={{ fontSize: "0.95rem", color: "var(--text)", fontWeight: 500 }}>Receives Absolute Trust</div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px dashed var(--glass-border)", paddingTop: "1rem", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                      ✦ <strong>Britsync Invisible Engine:</strong> Professional Storytelling • GPS Geofenced Audits • Custom Wooden Crating • Customs Tariffs & VAT • Cryptographic Passports
                    </div>
                  </div>

                  <p style={{ fontSize: "0.88rem", lineHeight: 1.65, color: "var(--text-muted)", margin: "0 0 1.2rem", fontWeight: 300 }}>
                    Unlike Shopify or Etsy, Britsync eliminates the technical digital divide. Artisans simply create — we manage the rest.
                  </p>
                </motion.div>
              )}

              {activeHeroTab === "artisan" && (
                <motion.div
                  key="artisan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <div style={{ backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", padding: "1.8rem", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, marginBottom: "0.6rem" }}>
                      ZERO FEES & 100% DESIRED PRICE
                    </div>
                    <h4 style={{ fontSize: "1.15rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.8rem", fontWeight: 400 }}>
                      Empowering Studio Autonomy
                    </h4>
                    <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                      The maker quotes their desired price per creation. Britsync adds a transparent managed markup on the buyer side to cover logistics and escrow, delivering 100% of the desired payout directly to the maker.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeHeroTab === "patron" && (
                <motion.div
                  key="patron"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <div style={{ backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", padding: "1.8rem", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, marginBottom: "0.6rem" }}>
                      SMART ESCROW & PASSPORT VERIFICATION
                    </div>
                    <h4 style={{ fontSize: "1.15rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.8rem", fontWeight: 400 }}>
                      Museum-Grade Patron Guarantee
                    </h4>
                    <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                      Every masterpiece carries an immutable Cryptographic Provenance Passport with physical satellite GPS geofencing and chemical laboratory material test receipts.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "1.2rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Registry Protocol: <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>#BR-2026-MANAGED-COMMERCE</strong>
              </span>
              <Link href="/how-we-earn" style={{ fontSize: "0.72rem", color: "var(--accent)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
                Read Founder Bible &rarr;
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. THE SIX CORE VALUES OF BRITSYNC (FOUNDER BIBLE)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
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
                whileHover={{ y: -6, borderColor: "var(--accent)" }}
                style={{
                  padding: "3rem 2.4rem",
                  backgroundColor: "var(--background)",
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
                      marginBottom: "1rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {val.title}
                  </h3>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                    {val.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. MEET OUR LIVING GUILD ARTISANS (AUTHENTIC MAKERS SHOWCASE)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "9.5rem 2rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
          
          {/* Section Header */}
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

              {/* Selector Tabs */}
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
                        backgroundColor: isActive ? "var(--accent)" : "var(--surface)",
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

          {/* Interactive Feature Display Stage */}
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
                backgroundColor: "var(--surface)",
                padding: "3.8rem",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-lg)"
              }}
            >
              {/* Left Column: Studio Portrait */}
              <div style={{ position: "relative", height: "500px", border: "1px solid var(--glass-border)" }}>
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

                {/* GPS Coordinates Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "1.5rem",
                    backgroundColor: "rgba(10,10,12,0.85)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    padding: "0.5rem 1.1rem",
                    color: "var(--accent)",
                    fontSize: "0.68rem",
                    fontFamily: "monospace",
                    letterSpacing: "1.5px",
                    fontWeight: 600,
                  }}
                >
                  GPS: {activeMaker.coordinates}
                </div>

                {/* Lineage Badge */}
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

                {/* Quote Overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.5rem",
                    left: "1.5rem",
                    right: "1.5rem",
                    backgroundColor: "rgba(10,10,12,0.85)",
                    backdropFilter: "blur(12px)",
                    padding: "1.5rem",
                    border: "1px solid rgba(212,175,55,0.25)",
                    color: "#FFFFFF"
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "1.05rem",
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.92)",
                      margin: 0,
                      fontWeight: 300,
                    }}
                  >
                    &ldquo;{activeMaker.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Right Column: Details */}
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
                    {activeMaker.status} • {activeMaker.verificationScore} VERIFIED
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)",
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
                    fontSize: "0.92rem",
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: "2rem",
                    fontWeight: 400,
                  }}
                >
                  {activeMaker.role} &bull; {activeMaker.location}
                </span>

                <div style={{ marginBottom: "1.8rem" }}>
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

                <div style={{ marginBottom: "2.2rem" }}>
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
                    AUDITED NATURAL MATERIALS
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                    {activeMaker.materials.map((mat) => (
                      <span
                        key={mat}
                        style={{
                          fontSize: "0.78rem",
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--glass-border)",
                          padding: "0.45rem 1rem",
                          color: "var(--text)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        ✦ {mat}
                      </span>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "var(--text-muted)", marginBottom: "2.5rem", fontWeight: 300 }}>
                  {activeMaker.story}
                </p>

                <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAuditMaker(activeMaker)}
                    style={{
                      padding: "1.15rem 2.5rem",
                      backgroundColor: "var(--accent)",
                      color: "var(--primary)",
                      border: "none",
                      fontSize: "0.75rem",
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Inspect Studio Provenance Audit &rarr;
                  </motion.button>

                  <Link
                    href="/makers"
                    style={{
                      padding: "1.15rem 2.2rem",
                      border: "1px solid var(--glass-border)",
                      backgroundColor: "var(--background)",
                      color: "var(--text)",
                      fontSize: "0.75rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    All Guild Makers
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. PROVENANCE VERIFICATION BLUEPRINT (4 STAGES)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
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
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)" }}>
              The 4-Stage Provenance Protocol
            </h2>
            <p style={{ maxWidth: "620px", margin: "1rem auto 0", opacity: 0.72, fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text-muted)", fontWeight: 300 }}>
              Four independent audit checkpoints executed before any creation receives the Britsync Provenance Seal.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem" }}>
            {[
              {
                step: "STAGE 01",
                title: "Genealogy & Guild Audit",
                detail: "Historical board review of oral tradition pattern transmission, master builder apprenticeship records, and regional guild accreditation.",
              },
              {
                step: "STAGE 02",
                title: "Natural Material Analysis",
                detail: "Laboratory and field chemical analysis verifying 100% natural organic dyes, high-silica quartz, and zero synthetic fiber blends.",
              },
              {
                step: "STAGE 03",
                title: "GPS Geofence Boundary",
                detail: "Field inspectors establish exact satellite GPS geofencing coordinates around the physical workshop where crafting takes place.",
              },
              {
                step: "STAGE 04",
                title: "Cryptographic Ledger Block",
                detail: "Minting a unique serial hash paired with an encrypted NFC passport stored permanently on the Britsync ledger.",
              },
            ].map((stg, idx) => (
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
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
                  transition: "border-color 0.3s ease, transform 0.3s ease"
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--accent)",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "1rem",
                  }}
                >
                  {stg.step}
                </span>
                <h3 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.35rem", color: "var(--text)", fontWeight: 400, marginBottom: "1rem" }}>
                  {stg.title}
                </h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                  {stg.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. TRUST FAQ ACCORDION
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
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)" }}>
              Managed Commerce Governance
            </h2>
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
                    border: isOpen ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
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
                      style={{ marginTop: "1rem", fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-muted)", margin: "1rem 0 0", fontWeight: 300 }}
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
          6. CALL TO ACTION SECTION
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
                    <span style={{ opacity: 0.6 }}>LINEAGE SCORE:</span>
                    <span style={{ color: "#10B981" }}>{selectedAuditMaker.verificationScore} AUDITED</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GUILD CERTIFICATION:</span>
                    <span style={{ color: "var(--text)" }}>{selectedAuditMaker.status}</span>
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
