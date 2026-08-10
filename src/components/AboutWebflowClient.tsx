"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// 1. FEATURED GUILD ARTISANS DATA (USED IN SECTION 4)
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

// 2. STICKY SCROLL MANAGED COMMERCE PILLARS DATA
const SCROLL_PILLARS = [
  {
    id: "payout",
    num: "01",
    title: "Maker Autonomy & Zero Fees",
    subtitle: "100% Desired Payout Direct to Maker",
    desc: "Traditional platforms charge 20% fees and demand SEO, copywriting, and international shipping management. Britsync takes ZERO maker commissions. Artisans state their desired price, and Britsync adds a transparent managed markup on the buyer side to cover escrow, custom crating, and insured freight.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1400",
    badge: "0% Maker Commission",
    gps: "GPS: 31.6295° N, 7.9811° W",
    meta1: "100% Desired Price Paid",
    meta2: "Zero Tech Friction",
    meta3: "Smart Escrow Safety"
  },
  {
    id: "audit",
    num: "02",
    title: "Physical GPS Geofence Audits",
    subtitle: "Field Inspector Verification On-Site",
    desc: "Authenticity cannot be self-declared on a web form. Britsync field inspectors physically travel to isolated mountain ateliers, establishing satellite GPS geofencing boundaries around the studio, verifying 100% natural organic dyes, and securing physical guild master signatures.",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1400",
    badge: "Geofence Verified",
    gps: "GPS: 25.8072° N, 68.4907° E",
    meta1: "Satellite Boundary Locked",
    meta2: "Natural Dye Lab Tested",
    meta3: "Guild Master Sealed"
  },
  {
    id: "passport",
    num: "03",
    title: "Cryptographic Heritage Passports",
    subtitle: "Immutable Provenance Ledger Seal",
    desc: "Every creation registered on Britsync receives an unforgeable digital Cryptographic Heritage Passport. Embedded with encrypted NFC chips, it permanently logs the studio's satellite GPS coordinates, raw material composition, lineage score, and inspector signatures.",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1400",
    badge: "Ledger Sealed #BR-2026",
    gps: "GPS: 40.4286° N, 29.7214° E",
    meta1: "NFC Chip Embedded",
    meta2: "Immutable Ledger Hash",
    meta3: "Museum-Grade Record"
  }
];

// 3. CORE VALUES OF BRITSYNC (FOUNDER BIBLE)
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

// 4. TRUST FAQ ACCORDION DATA
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
  const [activePillarIdx, setActivePillarIdx] = useState<number>(0);

  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stickyContainerRef,
    offset: ["start start", "end end"]
  });

  // Calculate current pillar index based on scroll position
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.33) {
        setActivePillarIdx(0);
      } else if (latest < 0.66) {
        setActivePillarIdx(1);
      } else {
        setActivePillarIdx(2);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const activeMaker = BRITSYNC_MAKERS[activeMakerIdx];
  const currentPillar = SCROLL_PILLARS[activePillarIdx];

  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--text)", overflow: "hidden" }}>
      
      {/* ════════════════════════════════════════════════════════════
          1. HERO HEADER SECTION: MANIFESTO & HEADING
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "11rem 2rem 5rem",
          backgroundColor: "var(--background)",
          position: "relative",
          textAlign: "center",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />

        <div style={{ maxWidth: "980px", margin: "0 auto", position: "relative", zIndex: 10 }}>
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
              marginBottom: "2rem",
              padding: "0.5rem 1.2rem",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent)" }} />
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.7rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
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
              fontSize: "clamp(3.2rem, 6vw, 5.6rem)",
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
              maxWidth: "820px",
              margin: "0 auto 3.2rem"
            }}
          >
            Britsync is the world&apos;s first **Managed Global Commerce Platform**. Traditional marketplaces force master creators in remote mountain valleys to become web designers, SEO marketers, and international shipping agents. Britsync abstracts 100% of non-creative friction: the maker focuses purely on crafting masterworks — we manage photography, storytelling, GPS geofenced audits, customs clearance, and global white-glove delivery.
          </motion.p>

          {/* Action Buttons */}
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
              <Link
                href="/how-we-earn"
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
                Zero-Fee Maker Model
              </Link>
            </motion.div>
          </motion.div>

          {/* Core Metrics Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            custom={4}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "2rem",
              borderTop: "1px solid var(--glass-border)",
              paddingTop: "2.5rem"
            }}
          >
            {[
              { val: "0%", label: "Maker Commissions" },
              { val: "100%", label: "Desired Price Paid" },
              { val: "45+", label: "Appellation Guilds" },
              { val: "100%", label: "Smart Escrow Safety" },
            ].map((m) => (
              <div key={m.label}>
                <div style={{ fontSize: "2rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 400 }}>{m.val}</div>
                <div style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.3rem" }}>{m.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. STICKY SCROLL SHOWCASE: THE 3 MANAGED COMMERCE PILLARS
          ════════════════════════════════════════════════════════════ */}
      <section
        ref={stickyContainerRef}
        style={{
          height: "300vh",
          position: "relative",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: "90px",
            height: "calc(100vh - 110px)",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          {/* Left Column: Pillar Navigation & Text Content */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontSize: "0.68rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, marginBottom: "1.2rem", display: "block" }}>
              ✦ SCROLL EXPLORATION • MANAGED ARCHITECTURE
            </span>

            {/* Pillar Selector Tabs */}
            <div style={{ display: "flex", gap: "0.6rem", marginBottom: "2.5rem" }}>
              {SCROLL_PILLARS.map((pil, idx) => {
                const isActive = idx === activePillarIdx;
                return (
                  <button
                    key={pil.id}
                    onClick={() => setActivePillarIdx(idx)}
                    style={{
                      padding: "0.6rem 1.2rem",
                      fontSize: "0.7rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "var(--primary)" : "var(--text-muted)",
                      backgroundColor: isActive ? "var(--accent)" : "var(--surface)",
                      border: isActive ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {pil.num}. {pil.id}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Pillar Text Stage */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPillar.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <span style={{ fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
                  {currentPillar.subtitle}
                </span>

                <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", fontWeight: 300, lineHeight: 1.1, marginBottom: "1.5rem" }}>
                  {currentPillar.title}
                </h2>

                <p style={{ fontSize: "1.05rem", lineHeight: 1.85, color: "var(--text-muted)", fontWeight: 300, marginBottom: "2.2rem" }}>
                  {currentPillar.desc}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                  <span style={{ fontSize: "0.78rem", backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)", padding: "0.5rem 1.1rem", color: "var(--text)" }}>
                    ✦ {currentPillar.meta1}
                  </span>
                  <span style={{ fontSize: "0.78rem", backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)", padding: "0.5rem 1.1rem", color: "var(--text)" }}>
                    ✦ {currentPillar.meta2}
                  </span>
                  <span style={{ fontSize: "0.78rem", backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)", padding: "0.5rem 1.1rem", color: "var(--text)" }}>
                    ✦ {currentPillar.meta3}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Dynamic High-Res Photo & Passport Badge Stage */}
          <div style={{ position: "relative" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPillar.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "relative",
                  height: "520px",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "4px solid var(--accent)",
                  boxShadow: "var(--shadow-lg)",
                  overflow: "hidden"
                }}
              >
                <img
                  src={currentPillar.image}
                  alt={currentPillar.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.9) contrast(1.05)" }}
                />

                {/* Top Badge */}
                <div style={{ position: "absolute", top: "1.8rem", left: "1.8rem", backgroundColor: "var(--accent)", color: "var(--primary)", padding: "0.45rem 1.1rem", fontSize: "0.72rem", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700 }}>
                  {currentPillar.badge}
                </div>

                {/* GPS Badge */}
                <div style={{ position: "absolute", bottom: "1.8rem", right: "1.8rem", backgroundColor: "rgba(10,10,12,0.88)", backdropFilter: "blur(12px)", padding: "0.6rem 1.2rem", border: "1px solid rgba(212,175,55,0.4)", color: "var(--accent)", fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600 }}>
                  {currentPillar.gps}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. THE SIX CORE VALUES OF BRITSYNC (FOUNDER BIBLE)
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
          4. MEET OUR LIVING GUILD ARTISANS (AUTHENTIC MAKERS SHOWCASE)
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
          5. PROVENANCE VERIFICATION BLUEPRINT (4 STAGES)
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
          6. TRUST FAQ ACCORDION
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
          7. CALL TO ACTION SECTION
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
