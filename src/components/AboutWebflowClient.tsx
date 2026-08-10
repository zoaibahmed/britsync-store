"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Icons } from "./Icons";

// 1. MASTER ARTISAN CHRONICLES DATA
const ARTISAN_CHRONICLES = [
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
    altitude: "1,850m Above Sea Level",
    materials: ["100% Mountain Sheep Wool", "Wild Saffron Dyes", "Crushed Indigo Mineral"],
    story: "In the secluded high-altitude valleys of the High Atlas, Fatima preserves 200-year-old tribal Berber weaving geometries transmitted purely by memory across seven generations of women weavers.",
    quote: "Our loom carries the memory of seven generations. Each knot is a word spoken in a language that never dies.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.8%",
    status: "GI Appellation Protected",
    yearsActive: 42,
    artisansSupported: 24
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
    altitude: "34m Above Sea Level",
    materials: ["Handspun Indus Organic Cotton", "Fermented Indigo Pits", "Pomegranate Shell Extract"],
    story: "Maintaining the sacred 21-step natural vegetable dyeing ritual. Each Indus cotton fabric undergoes weeks of river washing, mud-resist carving, and natural fermented indigo pit immersion.",
    quote: "Twenty-one stages of mud, river water, sun, and indigo. When you work with nature, fabric acquires a soul.",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    verificationScore: "100%",
    status: "Indus Heritage Registry Sealed",
    yearsActive: 38,
    artisansSupported: 18
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
    altitude: "120m Above Sea Level",
    materials: ["85% Quartz Frit Clay", "Cobalt Oxide Mineral", "Pine Wood Kiln Fire"],
    story: "Recreating 16th-century Ottoman royal Iznik formulas containing over 85% pure quartz silica, fired in traditional pine wood kilns to achieve crystal-clear radiance.",
    quote: "Quartz is fire frozen into glass. Under 1,200 degrees of wood heat, history is sealed forever.",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.5%",
    status: "Anatolian Guild Certified",
    yearsActive: 29,
    artisansSupported: 12
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
    altitude: "269m Above Sea Level",
    materials: ["Reclaimed Seasoned Teak", "Pure Brass Sheet Wire", "Beeswax Polish"],
    story: "Hand-carving reclaimed teakwood with hand chisels and embedding solid brass wire Tarkashi inlay in solitary manual sessions that take up to 90 days per piece.",
    quote: "The chisel speaks only when the mind is still. Seasoned teak remembers every strike for centuries.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.7%",
    status: "Saharanpur Guild Sealed",
    yearsActive: 35,
    artisansSupported: 16
  },
  {
    id: "mateo-peru",
    num: "05",
    name: "Mateo Quispe",
    role: "Andean Master Wool Spinner & Weaver",
    location: "Sacred Valley, Cusco, Peru",
    regionCode: "PER-CUS-208",
    lineage: "8th Generation Incan Lineage",
    craft: "Alpaca Wool Tapestries",
    coordinates: "13.5319° S, 71.9675° W",
    altitude: "3,800m Above Sea Level",
    materials: ["Royal Baby Alpaca Fleece", "Sun-Dried Cochineal", "Volcanic Mineral Fixative"],
    story: "Living at 3,800m elevation in the Peruvian Andes, Mateo preserves pre-Columbian backstrap loom weaving dyed with cochineal insects and high-altitude flora.",
    quote: "In the high Andes, our looms align with the stars. Every warp strand links Earth to the mountain spirits.",
    image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
    verificationScore: "100%",
    status: "Incan Lineage Certified",
    yearsActive: 45,
    artisansSupported: 30
  }
];

// 2. TRUST MANIFESTO PILLARS
const MANIFESTO_PILLARS = [
  {
    id: "pillar-01",
    num: "I",
    title: "Cryptographic Provenance Passports",
    subtitle: "Digital Immutability",
    description: "Every masterwork is paired with a non-fungible cryptographic passport logging exact GPS studio coordinates, raw material testing receipts, inspector signatures, and ledger hashes.",
    detail: "Collectable items are engraved with tamper-proof micro serial numbers linked directly to the decentralised Britsync provenance registry."
  },
  {
    id: "pillar-02",
    num: "II",
    title: "Geographic Indication (GI) Protection",
    subtitle: "Appellation Rights",
    description: "We enforce legal regional appellation boundaries to prevent synthetic mass-market counterfeits from diluting authentic heritage craft lineages.",
    detail: "Only studios within certified physical GI coordinates (such as High Atlas Berber looms or Iznik high-silica kilns) can receive official registry accreditation."
  },
  {
    id: "pillar-03",
    num: "III",
    title: "Direct-to-Artisan Escrow Protocol",
    subtitle: "Zero Middleman Exploitation",
    description: "Patron funds remain secured in automated smart contract escrow until physical delivery is verified, releasing 95% of purchase value directly to the master creator.",
    detail: "Middleman trading cartels often extract 80%+ of value. Britsync completely rewrites this model to give creators full economic autonomy."
  },
  {
    id: "pillar-04",
    num: "IV",
    title: "Independent Studio & Material Audits",
    subtitle: "In-Person Field Inspections",
    description: "Regional field inspectors physically visit each studio, verifying 100% natural organic dyes, zero synthetic fiber blends, and fair living wage compliance.",
    detail: "Every batch of raw wool, clay frit, indigo, and teakwood undergoes chemical and physical purity testing before cataloging."
  }
];

// 3. TRUST FAQ ACCORDION DATA
const TRUST_FAQS = [
  {
    q: "How does Britsync protect master artisans from middleman exploitation?",
    a: "Traditional craft commerce involves up to 5 tiers of brokers, exporters, and wholesalers who take up to 80% of profits. Britsync operates a managed direct-to-artisan bridge: 95% of every transaction goes straight into the master artisan's studio account upon verified delivery."
  },
  {
    q: "What is a Cryptographic Heritage Passport?",
    a: "It is an unalterable digital authenticity seal issued for every masterpiece. It includes satellite GPS geofence coordinates of the studio, laboratory material purity reports, artisan signatures, and an immutable ledger block hash."
  },
  {
    q: "How are Geographic Indication (GI) appellations enforced?",
    a: "Geographic Indication is a legal IP standard that protects products possessing specific qualities tied to their geographical origin. Britsync establishes satellite geofencing around certified historical valleys to guarantee that only authentic regional studios receive GI badges."
  },
  {
    q: "What happens if a masterpiece is damaged during global shipping?",
    a: "Britsync provides full white-glove international insurance and climate-controlled transport. In the rare event of transit damage, patron funds remain protected in smart contract escrow and full refunds or studio remakes are guaranteed."
  }
];

export default function AboutWebflowClient() {
  const [activeArtisanIdx, setActiveArtisanIdx] = useState<number>(0);
  const [selectedAuditArtisan, setSelectedAuditArtisan] = useState<typeof ARTISAN_CHRONICLES[0] | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeManifestoPillar, setActiveManifestoPillar] = useState<string>("pillar-01");

  const activeArtisan = ARTISAN_CHRONICLES[activeArtisanIdx];

  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--text)", overflow: "hidden" }}>
      
      {/* ════════════════════════════════════════════════════════════
          1. HERO SECTION (RICH 2-COLUMN LUXURY VISUAL LAYOUT)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "10rem 2rem 7rem",
          backgroundColor: "var(--background)",
          position: "relative",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />

        <div
          style={{
            maxWidth: "1350px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "4.5rem",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Left Column: Editorial Headline & Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
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
                SOVEREIGN REGISTRY FOR HERITAGE CRAFT
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontSize: "clamp(2.8rem, 5vw, 4.6rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                lineHeight: 1.08,
                color: "var(--text)",
                marginBottom: "1.8rem",
                letterSpacing: "-0.025em",
              }}
            >
              Sustaining the World&apos;s<br />
              <span style={{ fontStyle: "italic", color: "var(--accent)" }}>Rarest Human Masterworks</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.85,
                color: "var(--text-muted)",
                marginBottom: "2.8rem",
                fontWeight: 300,
              }}
            >
              Britsync is a global curation platform and digital provenance registry. We bridge secluded mountain ateliers and historic craft guilds directly with international collectors — protecting ancient lineages through cryptographic passports, legal Geographic Indication (GI) protection, and direct artisan escrow.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", marginBottom: "3rem" }}
            >
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
                }}
              >
                Explore Registered Masterpieces &rarr;
              </Link>

              <Link
                href="/gi-certified"
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
                }}
              >
                GI Appellations Guide
              </Link>
            </motion.div>

            {/* Quick Metrics */}
            <div style={{ display: "flex", gap: "2rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1.8rem" }}>
              {[
                { val: "100%", label: "Hand-Audited Ateliers" },
                { val: "45+", label: "Protected Appellations" },
                { val: "£1.25M+", label: "Direct Patron Payouts" },
              ].map((m) => (
                <div key={m.label}>
                  <div style={{ fontSize: "1.6rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 400 }}>{m.val}</div>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.2rem" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual Masterpiece Passport Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--glass-border)",
              borderTop: "4px solid var(--accent)",
              padding: "2.5rem",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Top Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--accent)", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="glow-dot" /> PROVENANCE PASSPORT #BR-2026-HERITAGE
              </span>
              <span style={{ fontSize: "0.65rem", backgroundColor: "rgba(212,175,55,0.12)", color: "var(--accent)", padding: "0.3rem 0.8rem", border: "1px solid rgba(212,175,55,0.3)", fontWeight: 700 }}>
                99.8% VERIFIED
              </span>
            </div>

            {/* Showcase Image */}
            <div style={{ position: "relative", height: "300px", overflow: "hidden", marginBottom: "1.8rem", border: "1px solid var(--glass-border)" }}>
              <img
                src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1000"
                alt="High Atlas Loom Weaving"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", bottom: "1rem", left: "1rem", backgroundColor: "rgba(10,10,12,0.85)", backdropFilter: "blur(8px)", padding: "0.4rem 1rem", border: "1px solid rgba(212,175,55,0.3)", color: "#FAF9F6", fontSize: "0.68rem", letterSpacing: "1.5px", fontFamily: "monospace" }}>
                GPS: 31.6295° N, 7.9811° W
              </div>
            </div>

            {/* Title & Description */}
            <h3 style={{ fontSize: "1.5rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.5rem", fontWeight: 400 }}>
              High-Atlas Berber Loom Tapestry
            </h3>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.65, color: "var(--text-muted)", margin: "0 0 1.5rem", fontWeight: 300 }}>
              Hand-loomed in Ait Bouguemez Valley, Morocco by 7th generation matriarch Fatima Ait-Ouahi. 100% organic wool dyed with wild saffron and indigo.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "1.2rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Cryptographic Seal: <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>0x7D3A...99E1</strong>
              </span>
              <Link href="/stories/fatima-atlas-kilims" style={{ fontSize: "0.72rem", color: "var(--accent)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
                Inspect Ledger &rarr;
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. THE FOUR COLUMNS OF TRUST ARCHITECTURE
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "5.5rem" }}>
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
              OUR FOUR FOUNDATIONAL COLUMNS
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
              The Architecture of Provenance
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2.2rem" }}>
            {MANIFESTO_PILLARS.map((pillar) => {
              const isSelected = activeManifestoPillar === pillar.id;
              return (
                <div
                  key={pillar.id}
                  onClick={() => setActiveManifestoPillar(pillar.id)}
                  style={{
                    padding: "3.2rem 2.4rem",
                    backgroundColor: isSelected ? "var(--surface-muted)" : "var(--background)",
                    border: isSelected ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                    borderTop: "3px solid var(--accent)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "310px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-playfair), Georgia, serif",
                          fontSize: "1.8rem",
                          color: "var(--accent)",
                          fontWeight: 300,
                        }}
                      >
                        {pillar.num}.
                      </span>
                      <span style={{ fontSize: "0.62rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>
                        {pillar.subtitle}
                      </span>
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
                      {pillar.title}
                    </h3>
                    <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                      {pillar.description}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      style={{ marginTop: "1.4rem", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)", fontSize: "0.82rem", color: "var(--accent)" }}
                    >
                      ✦ {pillar.detail}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. MASTER ARTISAN CHRONICLES (INTERACTIVE VISUAL STAGE)
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
          <div style={{ marginBottom: "4.5rem" }}>
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
                LIVING GUILD CHRONICLES
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
                {ARTISAN_CHRONICLES.map((artisan, idx) => {
                  const isActive = idx === activeArtisanIdx;
                  return (
                    <button
                      key={artisan.id}
                      onClick={() => setActiveArtisanIdx(idx)}
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
                      {artisan.num}. {artisan.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Feature Display Stage */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeArtisan.id}
              initial={{ opacity: 0, y: 20 }}
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
              {/* Left Column: Portrait */}
              <div style={{ position: "relative", height: "500px", border: "1px solid var(--glass-border)" }}>
                <img
                  src={activeArtisan.image}
                  alt={activeArtisan.name}
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
                  GPS: {activeArtisan.coordinates}
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
                  {activeArtisan.lineage}
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
                    &ldquo;{activeArtisan.quote}&rdquo;
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
                    {activeArtisan.status} • {activeArtisan.verificationScore} VERIFIED
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
                  {activeArtisan.name}
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
                  {activeArtisan.role} &bull; {activeArtisan.location}
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
                      marginBottom: "0.6rem",
                    }}
                  >
                    HERITAGE CRAFT TECHNIQUE
                  </span>
                  <p style={{ fontSize: "1.05rem", color: "var(--text)", margin: 0, fontWeight: 300 }}>
                    {activeArtisan.craft}
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
                    {activeArtisan.materials.map((mat) => (
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
                  {activeArtisan.story}
                </p>

                <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => setSelectedAuditArtisan(activeArtisan)}
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
                  </button>

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
          4. PROVENANCE VERIFICATION PROTOCOL (4 STAGES)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "5.5rem" }}>
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
          </div>

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
            ].map((stg) => (
              <div
                key={stg.step}
                style={{
                  padding: "2.8rem 2.2rem",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. ETHICAL ARTISAN COMMITMENT & IMPACT METRICS
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "8.5rem 2rem", backgroundColor: "var(--background)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ maxWidth: "1250px", margin: "0 auto" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "4.5rem", alignItems: "center" }}>
            <div>
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
                DIRECT PATRONAGE PACT
              </span>
              <h2
                style={{
                  fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 300,
                  color: "var(--text)",
                  marginBottom: "1.5rem",
                  lineHeight: 1.15,
                }}
              >
                Protecting Master Creators from Exploitation
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "var(--text-muted)", marginBottom: "1.5rem", fontWeight: 300 }}>
                Traditional artisan trade is plagued by multi-tiered middleman networks that extract up to 80% of value while underpaying the actual creator. Britsync completely rewrites this model.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "var(--text-muted)", marginBottom: "2rem", fontWeight: 300 }}>
                Our managed infrastructure provides end-to-end white-glove international shipping, multi-currency escrow processing, and legal appellation protection — so master artisans receive their full desired price directly upon delivery.
              </p>

              <div style={{ display: "flex", gap: "1.8rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1.8rem" }}>
                <div>
                  <div style={{ fontSize: "2.2rem", fontFamily: "var(--font-playfair), serif", color: "var(--accent)", fontWeight: 400 }}>95%</div>
                  <div style={{ fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.2rem" }}>Direct Escrow Payout</div>
                </div>
                <div style={{ width: "1px", backgroundColor: "var(--glass-border)" }} />
                <div>
                  <div style={{ fontSize: "2.2rem", fontFamily: "var(--font-playfair), serif", color: "var(--accent)", fontWeight: 400 }}>0%</div>
                  <div style={{ fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.2rem" }}>Middleman Markup</div>
                </div>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {[
                { val: "100%", label: "Hand-Audited Ateliers" },
                { val: "45+", label: "Protected Appellations" },
                { val: "£1.25M+", label: "Direct Patron Payouts" },
                { val: "15,000+", label: "Issued Passports" },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: "2.4rem 1.8rem",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--glass-border)",
                    borderLeft: "3px solid var(--accent)",
                  }}
                >
                  <div style={{ fontSize: "2.4rem", fontFamily: "var(--font-playfair), serif", color: "var(--accent)", fontWeight: 400, marginBottom: "0.4rem" }}>
                    {m.val}
                  </div>
                  <div style={{ fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
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
          
          <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
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
              Trust & Curation Governance
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {TRUST_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.q}
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
                </div>
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
        <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative", zIndex: 10 }}>
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
              }}
            >
              Explore Registered Masterpieces &rarr;
            </Link>
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
              }}
            >
              Apply for Guild Curation
            </Link>
          </div>
        </div>
      </section>

      {/* STUDIO AUDIT MODAL DRAWER */}
      <AnimatePresence>
        {selectedAuditArtisan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAuditArtisan(null)}
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
                onClick={() => setSelectedAuditArtisan(null)}
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
                {selectedAuditArtisan.name}
              </h2>

              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
                {selectedAuditArtisan.role} &bull; {selectedAuditArtisan.location}
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
                  src={selectedAuditArtisan.portrait}
                  alt={selectedAuditArtisan.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.8rem" }}>
                  Technique & Heritage Protocol
                </h4>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text)", fontWeight: 300 }}>
                  {selectedAuditArtisan.craft}
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
                    <span style={{ color: "var(--accent)" }}>{selectedAuditArtisan.coordinates}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>LINEAGE SCORE:</span>
                    <span style={{ color: "#10B981" }}>{selectedAuditArtisan.verificationScore} AUDITED</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GUILD CERTIFICATION:</span>
                    <span style={{ color: "var(--text)" }}>{selectedAuditArtisan.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>ALTITUDE:</span>
                    <span style={{ color: "var(--text-muted)" }}>{selectedAuditArtisan.altitude}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
                <Link
                  href="/collections"
                  onClick={() => setSelectedAuditArtisan(null)}
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
