"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Icons } from "./Icons";

// Artisan Data tailored for About Us page
const FEATURED_ARTISANS = [
  {
    id: "fatima-atlas",
    name: "Fatima Ait-Ouahi",
    role: "Master Weaver & Guild Elder",
    location: "Aït Bouguemez Valley, High Atlas, Morocco",
    lineage: "7th Generation Lineage",
    craft: "High-Atlas Heritage Loom Weaving",
    coordinates: "31.6295° N, 7.9811° W",
    materials: ["100% Mountain Sheep Wool", "Wild Saffron Dyes", "Natural Indigo Mineral"],
    impact: "Provides living wages for 24 women weavers in secluded mountain villages.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1000",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    quote: "Our loom carries the memory of seven generations. Every knot is an unwritten word spoken in pure wool.",
    provenanceScore: "99.8%",
    verifiedStatus: "GI Protected • Moroccan Craft Guild Certified"
  },
  {
    id: "soomro-sindh",
    name: "Aisha & Ghulam Soomro",
    role: "Master Ajrak Blockprinters",
    location: "Bhit Shah, Sindh Valley, Pakistan",
    lineage: "5th Generation Guild Keepers",
    craft: "21-Step Natural Dye Ajrak Blockprinting",
    coordinates: "25.8072° N, 68.4907° E",
    materials: ["Handspun Indus Organic Cotton", "Fermented Indigo Pits", "Pomegranate Shell Extract"],
    impact: "Preserving a 4,000-year-old Indus Valley dye chemistry sequence against synthetic factory printing.",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1000",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    quote: "Twenty-one steps of mud, sun, river water, and indigo. You cannot rush what nature creates in patience.",
    provenanceScore: "100%",
    verifiedStatus: "Indus Heritage League Verified"
  },
  {
    id: "zeynep-iznik",
    name: "Zeynep Kilic",
    role: "Master Ceramicist & Quartz Glazer",
    location: "Iznik Atelier, Anatolia, Turkey",
    lineage: "4th Generation Kiln Master",
    craft: "Ottoman High-Quartz Silica Ceramics",
    coordinates: "40.4286° N, 29.7214° E",
    materials: ["85% Quartz Frit Clay", "Cobalt Oxide Mineral", "Pine Wood Kiln Fire"],
    impact: "Recreating 16th-century Ottoman royal formulas using traditional pine wood wood-fired kilns.",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1000",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    quote: "Quartz is fire frozen into glass. Under 1,200 degrees of heat, our glazes lock history for centuries.",
    provenanceScore: "99.5%",
    verifiedStatus: "Anatolia Heritage Board Seal"
  },
  {
    id: "rajesh-teak",
    name: "Rajesh Kumar",
    title: "Master Teak Carver & Brass Inlayer",
    location: "Saharanpur, Uttar Pradesh, India",
    lineage: "6th Generation Lineage",
    craft: "Hand-Relief Teak & Brass Tarkashi Inlay",
    coordinates: "29.9640° N, 77.5460° E",
    materials: ["Reclaimed Seasoned Teak", "Pure Brass Sheet Wire", "Organic Beeswax Polish"],
    impact: "Sustaining zero-emission manual chiseling techniques that take up to 90 days per furniture piece.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    quote: "The chisel speaks only when the mind is quiet. Wood remembers every single stroke for generations.",
    provenanceScore: "99.7%",
    verifiedStatus: "Saharanpur Guild Master Certified"
  }
];

export default function AboutClient() {
  const [activeArtisanIdx, setActiveArtisanIdx] = useState<number>(0);
  const [selectedAuditArtisan, setSelectedAuditArtisan] = useState<typeof FEATURED_ARTISANS[0] | null>(null);

  const currentArtisan = FEATURED_ARTISANS[activeArtisanIdx];

  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--text)", overflow: "hidden" }}>
      
      {/* 1. LUXURY EDITORIAL HERO SECTION */}
      <section
        style={{
          padding: "10rem 2rem 7rem",
          backgroundColor: "#0A0A0C",
          color: "#FAF9F6",
          textAlign: "center",
          position: "relative",
          borderBottom: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        {/* Subtle grid background */}
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.12, pointerEvents: "none" }} />
        
        <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 1.4rem",
              borderRadius: "30px",
              backgroundColor: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "var(--accent)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              marginBottom: "1.8rem",
            }}
          >
            <span className="glow-dot" /> SOVEREIGN CUSTODIANS OF LIVING HERITAGE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              lineHeight: 1.08,
              color: "#FAF9F6",
              marginBottom: "1.8rem",
              letterSpacing: "-0.02em",
            }}
          >
            Preserving Human Masterwork<br />
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>In a Mass-Produced World</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.85,
              color: "rgba(250,249,246,0.82)",
              maxWidth: "800px",
              margin: "0 auto 3rem",
              fontWeight: 300,
            }}
          >
            Britsync is a global curation platform and digital provenance registry. We bridge isolated mountain ateliers and historic artisan guilds directly with international collectors — protecting ancient craft lineages through cryptographic passports, legal Geographic Indications (GI), and direct patron escrow.
          </motion.p>

          {/* Key Metrics Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              padding: "2rem",
              borderRadius: "20px",
              backgroundColor: "rgba(18,18,22,0.9)",
              border: "1px solid rgba(212,175,55,0.25)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            {[
              { val: "100%", label: "Hand-Audited Ateliers" },
              { val: "45+", label: "Protected Regions & Valleys" },
              { val: "£1.25M+", label: "Direct Patron Payouts" },
              { val: "15,000+", label: "Issued Digital Passports" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2.4rem",
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    color: "var(--accent)",
                    fontWeight: 400,
                    marginBottom: "0.2rem",
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "rgba(250,249,246,0.65)",
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. DEDICATED MASTER ARTISANS SHOWCASE SECTION */}
      <section
        style={{
          padding: "8rem 2rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.72rem",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "0.6rem",
              }}
            >
              MEET THE LIVING CUSTODIANS
            </span>
            <h2
              style={{
                fontSize: "clamp(2.4rem, 4vw, 3.5rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                color: "var(--text)",
                marginBottom: "1rem",
              }}
            >
              The Artisans Behind the Masterpieces
            </h2>
            <p
              style={{
                maxWidth: "640px",
                margin: "0 auto",
                fontSize: "1rem",
                color: "var(--text-muted)",
                lineHeight: 1.8,
                fontWeight: 300,
              }}
            >
              Every registered piece on Britsync carries the soul, oral history, and physical fingerprint of a master artisan. Meet the guardians keeping centuries of tradition alive.
            </p>

            {/* Interactive Tab Switcher */}
            <div
              style={{
                display: "flex",
                gap: "0.8rem",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "3rem",
              }}
            >
              {FEATURED_ARTISANS.map((artisan, idx) => {
                const isActive = idx === activeArtisanIdx;
                return (
                  <button
                    key={artisan.id}
                    onClick={() => setActiveArtisanIdx(idx)}
                    style={{
                      padding: "0.7rem 1.6rem",
                      borderRadius: "30px",
                      fontSize: "0.75rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--primary)" : "var(--text)",
                      backgroundColor: isActive ? "var(--accent)" : "var(--surface)",
                      border: isActive ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: isActive ? "var(--shadow-md)" : "none",
                    }}
                  >
                    0{idx + 1}. {artisan.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Feature Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentArtisan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "4rem",
                alignItems: "center",
                backgroundColor: "var(--surface)",
                padding: "3.5rem",
                borderRadius: "24px",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Left Column: Studio Photo */}
              <div
                style={{
                  position: "relative",
                  height: "480px",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <img
                  src={currentArtisan.image}
                  alt={currentArtisan.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.92) contrast(1.05)",
                  }}
                />

                {/* Floating GPS Tag */}
                <div
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "1.5rem",
                    backgroundColor: "rgba(10,10,12,0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "30px",
                    color: "#FFFFFF",
                    fontSize: "0.68rem",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Icons.MapPin size={12} style={{ color: "var(--accent)" }} />
                  {currentArtisan.coordinates}
                </div>

                {/* Lineage Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    left: "1.5rem",
                    backgroundColor: "var(--accent)",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "30px",
                    color: "var(--primary)",
                    fontSize: "0.68rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {currentArtisan.lineage}
                </div>

                {/* Artisan Quote Banner */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.5rem",
                    left: "1.5rem",
                    right: "1.5rem",
                    backgroundColor: "rgba(10,10,12,0.85)",
                    backdropFilter: "blur(14px)",
                    padding: "1.4rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(212,175,55,0.25)",
                    color: "#FFFFFF",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "1.02rem",
                      lineHeight: 1.55,
                      color: "rgba(255,255,255,0.92)",
                      margin: 0,
                      fontWeight: 300,
                    }}
                  >
                    &ldquo;{currentArtisan.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Right Column: Artisan Details & Impact */}
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
                    {currentArtisan.verifiedStatus}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "clamp(2rem, 3.5vw, 3rem)",
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontWeight: 300,
                    lineHeight: 1.15,
                    marginBottom: "0.4rem",
                    color: "var(--text)",
                  }}
                >
                  {currentArtisan.name}
                </h3>

                <span
                  style={{
                    fontSize: "0.92rem",
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: "1.8rem",
                    fontWeight: 400,
                  }}
                >
                  {currentArtisan.role} &bull; {currentArtisan.location}
                </span>

                <div style={{ marginBottom: "2rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "0.6rem",
                    }}
                  >
                    CRAFT DISCIPLINE
                  </span>
                  <p style={{ fontSize: "1.05rem", color: "var(--text)", margin: 0, fontWeight: 400 }}>
                    {currentArtisan.craft}
                  </p>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "0.6rem",
                    }}
                  >
                    PRESERVED ORGANIC MATERIALS
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {currentArtisan.materials.map((mat) => (
                      <span
                        key={mat}
                        style={{
                          fontSize: "0.78rem",
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--glass-border)",
                          padding: "0.4rem 0.9rem",
                          borderRadius: "20px",
                          color: "var(--text)",
                        }}
                      >
                        ✦ {mat}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "2.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "0.6rem",
                    }}
                  >
                    COMMUNITY & CULTURAL IMPACT
                  </span>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                    {currentArtisan.impact}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => setSelectedAuditArtisan(currentArtisan)}
                    style={{
                      padding: "1.1rem 2.2rem",
                      borderRadius: "50px",
                      backgroundColor: "var(--accent)",
                      color: "var(--primary)",
                      border: "none",
                      fontSize: "0.75rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    Inspect Studio Provenance Audit &rarr;
                  </button>

                  <Link
                    href="/makers"
                    style={{
                      padding: "1.1rem 2rem",
                      borderRadius: "50px",
                      border: "1px solid var(--glass-border)",
                      backgroundColor: "var(--background)",
                      color: "var(--text)",
                      fontSize: "0.75rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View All Guild Makers
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 3. HOW BRITSYNC PROTECTS ARTISANS (DIRECT-TO-ARTISAN COMMITMENT) */}
      <section style={{ padding: "8rem 2rem", backgroundColor: "var(--surface)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.72rem",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "0.6rem",
              }}
            >
              ETHICAL GUARANTEE & FAIR PATRONAGE
            </span>
            <h2
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                color: "var(--text)",
              }}
            >
              How Britsync Empowers Master Creators
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2.5rem" }}>
            {[
              {
                icon: "💰",
                title: "95% Direct Escrow Payout",
                desc: "We eliminate exploitative middleman networks. 95% of every transaction goes directly to the master artisan's studio account upon verified delivery.",
              },
              {
                icon: "🌐",
                title: "Full Logistics & Insurance",
                desc: "Isolated mountain ateliers often cannot arrange international shipping or customs. Britsync manages end-to-end white-glove transport and insurance.",
              },
              {
                icon: "📲",
                title: "Digital Cataloging Support",
                desc: "Our field agents assist master creators (many of whom are elderly oral tradition keepers) in creating digital inventory and issuing provenance passports.",
              },
              {
                icon: "🏛️",
                title: "Geographic Indication Enforcement",
                desc: "We legally register and enforce regional appellations, ensuring counterfeit factory knock-offs cannot dilute the value of genuine heritage craft.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "2.6rem 2.2rem",
                  borderRadius: "20px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ fontSize: "2.2rem" }}>{item.icon}</div>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "1.35rem",
                    fontWeight: 400,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.92rem", lineHeight: 1.75, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE PROVENANCE PROTOCOL (STEP-BY-STEP VERIFICATION) */}
      <section style={{ padding: "8rem 2rem", backgroundColor: "#0A0A0C", color: "#FAF9F6", borderBottom: "1px solid rgba(212,175,55,0.3)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.72rem",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                fontWeight: 700,
                display: "block",
                marginBottom: "0.6rem",
              }}
            >
              TRUST ARCHITECTURE
            </span>
            <h2 style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "#FAF9F6" }}>
              The 4-Stage Provenance Protocol
            </h2>
            <p style={{ maxWidth: "600px", margin: "1rem auto 0", opacity: 0.75, fontSize: "0.95rem", lineHeight: 1.7, color: "#FAF9F6" }}>
              Every masterpiece must pass four independent audits before receiving the Britsync Authenticity Seal.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem" }}>
            {[
              {
                step: "STAGE 01",
                title: "Genealogy & Guild Audit",
                detail: "Historical review of oral tradition patterns, master builder apprenticeship records, and regional guild accreditation.",
              },
              {
                step: "STAGE 02",
                title: "Natural Material Analysis",
                detail: "Chemical and physical verification of 100% natural organic dyes, high-silica quartz, and unadulterated natural fibers.",
              },
              {
                step: "STAGE 03",
                title: "GPS Geofence Boundary",
                detail: "Field inspectors map exact satellite GPS geofencing coordinates around the physical studio where crafting takes place.",
              },
              {
                step: "STAGE 04",
                title: "Cryptographic Ledger Block",
                detail: "Minting an unalterable serial hash and pairing with an encrypted NFC passport stored permanently on the Britsync ledger.",
              },
            ].map((stg) => (
              <div
                key={stg.step}
                style={{
                  padding: "2.6rem 2rem",
                  borderRadius: "18px",
                  backgroundColor: "rgba(18,18,22,0.9)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderTop: "4px solid var(--accent)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--accent)",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "0.8rem",
                  }}
                >
                  {stg.step}
                </span>
                <h3 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.35rem", color: "#FAF9F6", fontWeight: 400, marginBottom: "0.8rem" }}>
                  {stg.title}
                </h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "rgba(250,249,246,0.72)", margin: 0, fontWeight: 300 }}>
                  {stg.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section
        style={{
          padding: "9rem 2rem",
          backgroundColor: "#0A0A0C",
          color: "#FAF9F6",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "840px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <span
            style={{
              color: "var(--accent)",
              fontSize: "0.75rem",
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              fontWeight: 700,
              display: "block",
              marginBottom: "1.2rem",
            }}
          >
            BECOME A CUSTODIAN OF GENERATIONAL CRAFT
          </span>
          <h2
            style={{
              fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              color: "var(--accent)",
              marginBottom: "1.8rem",
            }}
          >
            Support Living Masterpieces
          </h2>
          <p
            style={{
              fontSize: "1.08rem",
              lineHeight: 1.85,
              opacity: 0.85,
              color: "rgba(250,249,246,0.85)",
              marginBottom: "3.5rem",
              fontWeight: 300,
            }}
          >
            Whether acquiring a hand-loomed Berber Kilim, an Indus Ajrak blockprint, or an Ottoman Iznik quartz vessel, you are directly investing in human heritage and regional craft preservation.
          </p>

          <div style={{ display: "flex", gap: "1.4rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/collections"
              className="btn-accent"
              style={{
                textDecoration: "none",
                padding: "1.2rem 3.2rem",
                borderRadius: "50px",
                fontSize: "0.78rem",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                fontWeight: 700,
                backgroundColor: "var(--accent)",
                color: "#000000",
                boxShadow: "0 10px 30px rgba(212,175,55,0.3)",
              }}
            >
              Explore Registered Collections &rarr;
            </Link>
            <Link
              href="/become-a-maker"
              style={{
                textDecoration: "none",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#FAF9F6",
                padding: "1.2rem 3.2rem",
                borderRadius: "50px",
                fontSize: "0.78rem",
                letterSpacing: "2.5px",
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
              backgroundColor: "rgba(10,10,12,0.88)",
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
                backgroundColor: "#0A0A0C",
                color: "#FAF9F6",
                overflowY: "auto",
                padding: "3.5rem 3rem",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                borderLeft: "1px solid rgba(212,175,55,0.3)",
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
                {selectedAuditArtisan.name}
              </h2>

              <p style={{ fontSize: "0.85rem", color: "rgba(250,249,246,0.6)", marginBottom: "2rem" }}>
                {selectedAuditArtisan.role} &bull; {selectedAuditArtisan.location}
              </p>

              <div
                style={{
                  height: "260px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "2.5rem",
                  border: "1px solid rgba(212,175,55,0.2)",
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
                <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "rgba(250,249,246,0.85)", fontWeight: 300 }}>
                  {selectedAuditArtisan.craft}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  padding: "1.5rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  marginBottom: "2rem",
                }}
              >
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Cryptographic Ledger Metadata
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GPS COORDINATES:</span>
                    <span style={{ color: "var(--accent)" }}>{selectedAuditArtisan.coordinates}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>LINEAGE SCORE:</span>
                    <span style={{ color: "#10B981" }}>{selectedAuditArtisan.provenanceScore} AUDITED</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GUILD CERTIFICATION:</span>
                    <span style={{ color: "#FAF9F6" }}>{selectedAuditArtisan.verifiedStatus}</span>
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
                    borderRadius: "50px",
                    backgroundColor: "var(--accent)",
                    color: "#000000",
                    fontSize: "0.75rem",
                    letterSpacing: "2px",
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
