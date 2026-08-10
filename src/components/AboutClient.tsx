"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Icons } from "./Icons";

// Featured Artisans for About Us Page
const ARTISAN_CHRONICLES = [
  {
    id: "fatima-morocco",
    number: "01",
    name: "Fatima Ait-Ouahi",
    title: "Master Weaver & Guild Matriarch",
    location: "Aït Bouguemez Valley, High Atlas, Morocco",
    lineage: "7th Generation Lineage",
    craft: "High-Atlas Heritage Loom Weaving",
    coordinates: "31.6295° N, 7.9811° W",
    materials: ["Pure Mountain Wool", "Wild Saffron Dyes", "Crushed Indigo Mineral"],
    story: "In the secluded high-altitude valleys of the High Atlas, Fatima preserves 200-year-old tribal Berber weaving geometries transmitted purely by memory across seven generations of women weavers.",
    quote: "Our loom carries the memory of seven generations. Each knot is a word spoken in a language that never dies.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.8%",
    status: "GI Appellation Protected"
  },
  {
    id: "soomro-pakistan",
    number: "02",
    name: "Aisha & Ghulam Soomro",
    title: "Master Blockprinters & Dye Alchemists",
    location: "Bhit Shah, Sindh Valley, Pakistan",
    lineage: "5th Generation Guild Keepers",
    craft: "21-Step Natural Dye Ajrak Blockprinting",
    coordinates: "25.8072° N, 68.4907° E",
    materials: ["Handspun Indus Cotton", "Fermented Indigo Pits", "Pomegranate Shell Extract"],
    story: "Maintaining the sacred 21-step natural vegetable dyeing ritual. Each Indus cotton fabric undergoes weeks of river washing, mud-resist carving, and natural fermented indigo pit immersion.",
    quote: "Twenty-one stages of mud, river water, sun, and indigo. When you work with nature, fabric acquires a soul.",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    verificationScore: "100%",
    status: "Indus Heritage Registry Sealed"
  },
  {
    id: "zeynep-turkey",
    number: "03",
    name: "Zeynep Kilic",
    title: "Master Ceramicist & Quartz Glazer",
    location: "Iznik Atelier, Anatolia, Turkey",
    lineage: "4th Generation Kiln Master",
    craft: "Ottoman High-Quartz Silica Ceramics",
    coordinates: "40.4286° N, 29.7214° E",
    materials: ["85% Quartz Frit Clay", "Cobalt Oxide Mineral", "Pine Wood Kiln Fire"],
    story: "Recreating 16th-century Ottoman royal Iznik formulas containing over 85% pure quartz silica, fired in traditional pine wood kilns to achieve crystal-clear radiance.",
    quote: "Quartz is fire frozen into glass. Under 1,200 degrees of wood heat, history is sealed forever.",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.5%",
    status: "Anatolian Guild Certified"
  },
  {
    id: "rajesh-india",
    number: "04",
    name: "Rajesh Kumar",
    title: "Master Teak Carver & Brass Inlayer",
    location: "Saharanpur, Uttar Pradesh, India",
    lineage: "6th Generation Lineage",
    craft: "Teakwood High-Relief & Brass Tarkashi",
    coordinates: "29.9640° N, 77.5460° E",
    materials: ["Reclaimed Seasoned Teak", "Pure Brass Sheet Wire", "Beeswax Polish"],
    story: "Hand-carving reclaimed teakwood with hand chisels and embedding solid brass wire Tarkashi inlay in solitary manual sessions that take up to 90 days per piece.",
    quote: "The chisel speaks only when the mind is still. Seasoned teak remembers every strike for centuries.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    verificationScore: "99.7%",
    status: "Saharanpur Guild Sealed"
  }
];

export default function AboutClient() {
  const [activeArtisanIdx, setActiveArtisanIdx] = useState<number>(0);
  const [selectedDrawerArtisan, setSelectedDrawerArtisan] = useState<typeof ARTISAN_CHRONICLES[0] | null>(null);

  const activeArtisan = ARTISAN_CHRONICLES[activeArtisanIdx];

  return (
    <div style={{ backgroundColor: "#08080A", color: "#FAF9F6", overflow: "hidden" }}>
      
      {/* 1. LUXURY HERO SECTION */}
      <section
        style={{
          padding: "11rem 2rem 8rem",
          backgroundColor: "#08080A",
          position: "relative",
          borderBottom: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none" }} />
        
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.8rem",
              marginBottom: "2rem",
            }}
          >
            <span style={{ width: "30px", height: "1px", backgroundColor: "var(--accent)" }} />
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.68rem",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              SOVEREIGN CUSTODIANS OF LIVING HERITAGE
            </span>
            <span style={{ width: "30px", height: "1px", backgroundColor: "var(--accent)" }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(3rem, 5.8vw, 5.2rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              lineHeight: 1.08,
              color: "#FAF9F6",
              marginBottom: "2.2rem",
              letterSpacing: "-0.02em",
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
              fontSize: "1.18rem",
              lineHeight: 1.9,
              color: "rgba(250,249,246,0.78)",
              maxWidth: "820px",
              margin: "0 auto 3.5rem",
              fontWeight: 300,
            }}
          >
            Britsync is a global curation platform and digital provenance registry. We bridge isolated mountain ateliers and historic craft guilds directly with international collectors — safeguarding ancient lineages through cryptographic passports, legal Geographic Indication (GI) appellation protection, and direct patron escrow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: "flex", gap: "1.2rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link
              href="/collections"
              className="btn-accent"
              style={{
                textDecoration: "none",
                padding: "1.2rem 3.2rem",
                borderRadius: "0px",
                fontSize: "0.75rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontWeight: 600,
                backgroundColor: "var(--accent)",
                color: "#08080A",
                border: "1px solid var(--accent)",
                boxShadow: "0 12px 35px rgba(212,175,55,0.22)",
              }}
            >
              Explore Registered Masterpieces &rarr;
            </Link>

            <Link
              href="/gi-certified"
              style={{
                textDecoration: "none",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#FAF9F6",
                padding: "1.2rem 3.2rem",
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

        </div>
      </section>

      {/* 2. THE FOUR COLUMNS OF TRUST ARCHITECTURE */}
      <section
        style={{
          padding: "8rem 2rem",
          backgroundColor: "#0D0D11",
          borderBottom: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          
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
              THE FOUR FOUNDATIONAL COLUMNS
            </span>
            <h2
              style={{
                fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                color: "#FAF9F6",
                margin: 0,
              }}
            >
              The Architecture of Provenance
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "2.2rem" }}>
            {[
              {
                num: "I",
                title: "Cryptographic Passports",
                desc: "Every registered creation receives an immutable digital passport logging studio GPS coordinates, raw material test certificates, and ledger block hash.",
              },
              {
                num: "II",
                title: "Geographic Indication (GI)",
                desc: "We enforce strict legal regional appellation boundaries to prevent factory counterfeits from diluting authentic heritage craft lineages.",
              },
              {
                num: "III",
                title: "Direct Artisan Escrow",
                desc: "Smart contracts hold patron funds safely until delivery confirmation, releasing 95% of purchase value directly to the master creator's studio.",
              },
              {
                num: "IV",
                title: "Independent Studio Audits",
                desc: "Regional field inspectors physically audit ateliers, verifying 100% natural organic dyes, non-synthetic raw materials, and fair living wages.",
              },
            ].map((pillar) => (
              <div
                key={pillar.num}
                style={{
                  padding: "3rem 2.4rem",
                  backgroundColor: "#08080A",
                  border: "1px solid rgba(212,175,55,0.22)",
                  borderTop: "3px solid var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "280px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: "1.8rem",
                      color: "var(--accent)",
                      marginBottom: "1.2rem",
                      fontWeight: 300,
                    }}
                  >
                    {pillar.num}.
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: "1.35rem",
                      fontWeight: 400,
                      color: "#FAF9F6",
                      marginBottom: "1rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "rgba(250,249,246,0.7)", margin: 0, fontWeight: 300 }}>
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DEDICATED MASTER ARTISANS SHOWCASE */}
      <section
        style={{
          padding: "9rem 2rem",
          backgroundColor: "#08080A",
          borderBottom: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
          
          {/* Section Header */}
          <div style={{ marginBottom: "4.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}>
              <span style={{ width: "24px", height: "1px", backgroundColor: "var(--accent)" }} />
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
                  color: "#FAF9F6",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                The Artisans Behind the Masterpieces
              </h2>

              {/* Minimal Luxury Selector Tabs */}
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
                        color: isActive ? "#08080A" : "#FAF9F6",
                        backgroundColor: isActive ? "var(--accent)" : "rgba(255,255,255,0.03)",
                        border: isActive ? "1px solid var(--accent)" : "1px solid rgba(212,175,55,0.2)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {artisan.number}. {artisan.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Feature Display */}
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
                gap: "4rem",
                alignItems: "center",
                backgroundColor: "#0D0D11",
                padding: "3.8rem",
                border: "1px solid rgba(212,175,55,0.25)",
              }}
            >
              {/* Left Image Showcase */}
              <div style={{ position: "relative", height: "500px", border: "1px solid rgba(212,175,55,0.2)" }}>
                <img
                  src={activeArtisan.image}
                  alt={activeArtisan.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.9) contrast(1.05)",
                  }}
                />

                {/* GPS Coordinates Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "1.5rem",
                    backgroundColor: "rgba(8,8,10,0.9)",
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
                    color: "#08080A",
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
                    backgroundColor: "rgba(8,8,10,0.88)",
                    backdropFilter: "blur(12px)",
                    padding: "1.5rem",
                    border: "1px solid rgba(212,175,55,0.25)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "1.05rem",
                      lineHeight: 1.6,
                      color: "rgba(250,249,246,0.92)",
                      margin: 0,
                      fontWeight: 300,
                    }}
                  >
                    &ldquo;{activeArtisan.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Right Column Details */}
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
                    color: "#FAF9F6",
                  }}
                >
                  {activeArtisan.name}
                </h3>

                <span
                  style={{
                    fontSize: "0.92rem",
                    color: "rgba(250,249,246,0.6)",
                    display: "block",
                    marginBottom: "2rem",
                    fontWeight: 400,
                  }}
                >
                  {activeArtisan.title} &bull; {activeArtisan.location}
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
                  <p style={{ fontSize: "1.05rem", color: "#FAF9F6", margin: 0, fontWeight: 300 }}>
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
                          backgroundColor: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(212,175,55,0.25)",
                          padding: "0.45rem 1rem",
                          color: "#FAF9F6",
                          letterSpacing: "0.5px",
                        }}
                      >
                        ✦ {mat}
                      </span>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(250,249,246,0.72)", marginBottom: "2.5rem", fontWeight: 300 }}>
                  {activeArtisan.story}
                </p>

                <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => setSelectedDrawerArtisan(activeArtisan)}
                    style={{
                      padding: "1.1rem 2.4rem",
                      backgroundColor: "var(--accent)",
                      color: "#08080A",
                      border: "none",
                      fontSize: "0.75rem",
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Inspect Provenance Audit &rarr;
                  </button>

                  <Link
                    href="/makers"
                    style={{
                      padding: "1.1rem 2.2rem",
                      border: "1px solid rgba(212,175,55,0.3)",
                      backgroundColor: "transparent",
                      color: "#FAF9F6",
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

      {/* 4. PROVENANCE VERIFICATION PROTOCOL (4 STAGES) */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "#0D0D11",
          borderBottom: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
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
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "#FAF9F6" }}>
              The 4-Stage Provenance Protocol
            </h2>
            <p style={{ maxWidth: "620px", margin: "1rem auto 0", opacity: 0.72, fontSize: "0.95rem", lineHeight: 1.8, color: "#FAF9F6", fontWeight: 300 }}>
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
                  backgroundColor: "#08080A",
                  border: "1px solid rgba(212,175,55,0.22)",
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
                <h3 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.35rem", color: "#FAF9F6", fontWeight: 400, marginBottom: "1rem" }}>
                  {stg.title}
                </h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "rgba(250,249,246,0.7)", margin: 0, fontWeight: 300 }}>
                  {stg.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ETHICAL ARTISAN COMMITMENT & IMPACT METRICS */}
      <section style={{ padding: "8.5rem 2rem", backgroundColor: "#08080A", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
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
                  color: "#FAF9F6",
                  marginBottom: "1.5rem",
                  lineHeight: 1.15,
                }}
              >
                Protecting Master Creators from Exploitation
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "rgba(250,249,246,0.72)", marginBottom: "1.5rem", fontWeight: 300 }}>
                Traditional artisan trade is plagued by multi-tiered middleman networks that extract up to 80% of value while underpaying the actual creator. Britsync completely rewrites this model.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "rgba(250,249,246,0.72)", marginBottom: "2rem", fontWeight: 300 }}>
                Our managed infrastructure provides end-to-end white-glove international shipping, multi-currency escrow processing, and legal appellation protection — so master artisans receive their full desired price directly upon delivery.
              </p>

              <div style={{ display: "flex", gap: "1.5rem", borderTop: "1px solid rgba(212,175,55,0.2)", paddingTop: "1.8rem" }}>
                <div>
                  <div style={{ fontSize: "2rem", fontFamily: "var(--font-playfair), serif", color: "var(--accent)", fontWeight: 400 }}>95%</div>
                  <div style={{ fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(250,249,246,0.6)", marginTop: "0.2rem" }}>Direct Escrow Payout</div>
                </div>
                <div style={{ width: "1px", backgroundColor: "rgba(212,175,55,0.2)" }} />
                <div>
                  <div style={{ fontSize: "2rem", fontFamily: "var(--font-playfair), serif", color: "var(--accent)", fontWeight: 400 }}>0%</div>
                  <div style={{ fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(250,249,246,0.6)", marginTop: "0.2rem" }}>Middleman Markup</div>
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
                    backgroundColor: "#0D0D11",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderLeft: "3px solid var(--accent)",
                  }}
                >
                  <div style={{ fontSize: "2.4rem", fontFamily: "var(--font-playfair), serif", color: "var(--accent)", fontWeight: 400, marginBottom: "0.4rem" }}>
                    {m.val}
                  </div>
                  <div style={{ fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(250,249,246,0.65)", fontWeight: 600 }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section
        style={{
          padding: "10rem 2rem",
          backgroundColor: "#08080A",
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
              opacity: 0.82,
              color: "rgba(250,249,246,0.85)",
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
                color: "#08080A",
                border: "1px solid var(--accent)",
                boxShadow: "0 12px 35px rgba(212,175,55,0.25)",
              }}
            >
              Explore Registered Masterpieces &rarr;
            </Link>
            <Link
              href="/become-a-maker"
              style={{
                textDecoration: "none",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#FAF9F6",
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
        {selectedDrawerArtisan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDrawerArtisan(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(8,8,10,0.92)",
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
                backgroundColor: "#08080A",
                color: "#FAF9F6",
                overflowY: "auto",
                padding: "3.8rem 3rem",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                borderLeft: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              <button
                onClick={() => setSelectedDrawerArtisan(null)}
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "2rem",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "#FAF9F6",
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
                  color: "#FAF9F6",
                }}
              >
                {selectedDrawerArtisan.name}
              </h2>

              <p style={{ fontSize: "0.88rem", color: "rgba(250,249,246,0.6)", marginBottom: "2rem" }}>
                {selectedDrawerArtisan.title} &bull; {selectedDrawerArtisan.location}
              </p>

              <div
                style={{
                  height: "260px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  overflow: "hidden",
                  marginBottom: "2.5rem",
                }}
              >
                <img
                  src={selectedDrawerArtisan.portrait}
                  alt={selectedDrawerArtisan.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.8rem" }}>
                  Technique & Heritage Protocol
                </h4>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "rgba(250,249,246,0.85)", fontWeight: 300 }}>
                  {selectedDrawerArtisan.craft}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  padding: "1.6rem",
                  border: "1px solid rgba(212,175,55,0.2)",
                  marginBottom: "2.5rem",
                }}
              >
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Cryptographic Ledger Metadata
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GPS STAMP:</span>
                    <span style={{ color: "var(--accent)" }}>{selectedDrawerArtisan.coordinates}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>LINEAGE SCORE:</span>
                    <span style={{ color: "#10B981" }}>{selectedDrawerArtisan.verificationScore} AUDITED</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GUILD CERTIFICATION:</span>
                    <span style={{ color: "#FAF9F6" }}>{selectedDrawerArtisan.status}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
                <Link
                  href="/collections"
                  onClick={() => setSelectedDrawerArtisan(null)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "1.1rem",
                    backgroundColor: "var(--accent)",
                    color: "#08080A",
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
