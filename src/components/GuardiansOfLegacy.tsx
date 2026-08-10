"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Icons } from "./Icons";

export interface GuardianArtisan {
  id: string;
  name: string;
  title: string;
  generation: string;
  location: string;
  regionCode: string;
  coordinates: string;
  craft: string;
  image: string;
  portrait: string;
  story: string;
  biography: string;
  signatureTechnique: string;
  verificationScore: number;
  yearsPreserving: number;
  materialsUsed: string[];
  atelierQuote: string;
}

const GUARDIANS: GuardianArtisan[] = [
  {
    id: "fatima-morocco",
    name: "Fatima Ait-Ouahi",
    title: "Master Weaver & Guild Matriarch",
    generation: "7th Gen Lineage",
    location: "Ait Bouguemez Valley, High Atlas, Morocco",
    regionCode: "MAR-ATL-401",
    coordinates: "31.6295° N, 7.9811° W",
    craft: "Heritage Loom Weaving",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    story: "Guarding a 200-year-old Berber weaving pattern inherited orally without written notes.",
    biography: "In the high secluded valley of Ait Bouguemez, Fatima leads a collective of 24 women weavers. She uses pure mountain sheep wool dyed with saffron, wild indigo, and pomegranate skins to document regional tribal lineage.",
    signatureTechnique: "Double-Knotted High-Atlas Pile Weave with Saffron & Indigo Dye",
    verificationScore: 99.8,
    yearsPreserving: 42,
    materialsUsed: ["Pure Mountain Wool", "Wild Saffron", "Crushed Indigo Mineral"],
    atelierQuote: "Our threads carry the voices of seven generations. Each knot is a word in a language that never dies.",
  },
  {
    id: "aisha-pakistan",
    name: "Aisha & Ghulam Soomro",
    title: "Master Blockprinters & Indigo Alchemists",
    generation: "5th Gen Guild Keepers",
    location: "Bhit Shah, Sindh Valley, Pakistan",
    regionCode: "PAK-SND-104",
    coordinates: "25.8072° N, 68.4907° E",
    craft: "Ajrak Blockprinting",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    story: "Preserving the sacred 21-step natural vegetable dyeing sequence on organic handspun Indus cotton.",
    biography: "The Soomro family atelier in Bhit Shah is one of the last sanctums practicing true 21-step Ajrak blockprinting. Each textile undergoes weeks of river washing, mud-resist carving, and natural indigo pit immersion.",
    signatureTechnique: "21-Stage Mud-Resist & Mineral Oxide Double-Sided Block Impression",
    verificationScore: 100,
    yearsPreserving: 38,
    materialsUsed: ["Handspun Indus Cotton", "Fermented Natural Indigo", "Pomegranate Shell Extract"],
    atelierQuote: "Water, sun, mud, and indigo. When you work with nature for 21 steps, the fabric acquires a soul.",
  },
  {
    id: "zeynep-turkey",
    name: "Zeynep Kilic",
    title: "Master Ceramicist & Quartz Glazer",
    generation: "4th Gen Master Guild",
    location: "Iznik Atelier, Anatolia, Turkey",
    regionCode: "TUR-IZN-302",
    coordinates: "40.4286° N, 29.7214° E",
    craft: "Quartz-Glazed Ceramics",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    story: "Firing ceramic masterworks containing 85%+ quartz silica using traditional pine wood kilns.",
    biography: "Recreating 16th-century Ottoman Iznik formulas, Zeynep uses pure quartz silica clay requiring exact heat curves reached only in pine wood kilns. Her ceramics produce a glass-clear radiance that withstands centuries.",
    signatureTechnique: "High-Silica Underglaze Painting with Cobalt & Coral Red Minerals",
    verificationScore: 99.5,
    yearsPreserving: 29,
    materialsUsed: ["85% Quartz Frit Clay", "Cobalt Oxide Mineral", "Pine Wood Kiln Fire"],
    atelierQuote: "Quartz is fire frozen in stone. When glazes reach 1,200 degrees, history is sealed forever under glass.",
  },
  {
    id: "rajesh-india",
    name: "Rajesh Kumar",
    title: "Master Teak Carver & Brass Inlayer",
    generation: "6th Gen Wood Carver",
    location: "Saharanpur, Uttar Pradesh, India",
    regionCode: "IND-SAH-509",
    coordinates: "29.9640° N, 77.5460° E",
    craft: "Teakwood Relief & Brass Tarkashi",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    story: "Hand-carving reclaimed seasoned teak with brass wire Tarkashi inlay without power tools.",
    biography: "Rajesh represents six generations of Saharanpur woodcraft royalty. Using handmade chisels and brass wire inlay techniques, he crafts furniture pieces that take up to 90 days of solitary manual carving.",
    signatureTechnique: "Hand-Chiseled High Relief with Flush Brass Wire Hammering",
    verificationScore: 99.7,
    yearsPreserving: 35,
    materialsUsed: ["Reclaimed Seasoned Teak", "Pure Brass Sheet Wire", "Organic Beeswax Polish"],
    atelierQuote: "The chisel speaks only when the mind is still. Wood remembers every stroke for centuries.",
  },
  {
    id: "mateo-peru",
    name: "Mateo Quispe",
    title: "Andean Master Wool Spinner & Weaver",
    generation: "8th Gen Incan Lineage",
    location: "Sacred Valley, Cusco, Peru",
    regionCode: "PER-CUS-208",
    coordinates: "13.5319° S, 71.9675° W",
    craft: "Alpaca Wool Tapestries",
    image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1200",
    portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
    story: "Spinning ultra-fine Royal Alpaca fleece dyed with cochineal insects and high-altitude flora.",
    biography: "Living at 3,800m elevation in the Peruvian Andes, Mateo preserves pre-Columbian backstrap loom weaving. His dyes are harvested from cochineal, Qolle flowers, and volcanic minerals found only in the high valley.",
    signatureTechnique: "Double-Faced Backstrap Loom Tapestry with Cochineal Crimson Dye",
    verificationScore: 100,
    yearsPreserving: 45,
    materialsUsed: ["Royal Baby Alpaca Fleece", "Sun-Dried Cochineal", "Volcanic Mineral Fixative"],
    atelierQuote: "In the high Andes, our looms align with the stars. Every warp strand links Earth to the mountain spirits.",
  }
];

export default function GuardiansOfLegacy() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  const activeArtisan = GUARDIANS[activeIndex];

  return (
    <section
      style={{
        padding: "8rem 2rem",
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--glass-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "30%",
          width: "700px",
          height: "400px",
          backgroundColor: "rgba(212,175,55,0.03)",
          filter: "blur(60px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1350px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ marginBottom: "4rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}
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
              LIVING GUILD STAGE — HERITAGE GUARDIANS
            </span>
          </motion.div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "2rem",
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontSize: "clamp(2.4rem, 4.5vw, 4rem)",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 300,
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.02em",
                color: "var(--text)"
              }}
            >
              Guardians of the Legacy
            </motion.h2>

            {/* Quick Selector Pills */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {GUARDIANS.map((g, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      padding: "0.6rem 1.3rem",
                      borderRadius: "30px",
                      fontSize: "0.72rem",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--primary)" : "var(--text)",
                      backgroundColor: isActive ? "var(--accent)" : "var(--surface)",
                      border: isActive ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: isActive ? "var(--shadow-md)" : "none"
                    }}
                  >
                    0{idx + 1}. {g.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* EDITORIAL STAGE */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArtisan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "3.5rem",
              alignItems: "center",
              minHeight: "560px",
            }}
          >
            {/* Left Column: Portrait Showcase */}
            <div
              style={{
                position: "relative",
                height: "520px",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-lg)"
              }}
            >
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

              {/* Edge Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.35)",
                }}
              />

              {/* Floating Geofence Tag Top Right */}
              <div
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  backgroundColor: "rgba(10,10,12,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(212,175,55,0.4)",
                  padding: "0.5rem 1rem",
                  borderRadius: "30px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#FFFFFF",
                  fontSize: "0.68rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                <Icons.MapPin size={12} style={{ color: "var(--accent)" }} />
                {activeArtisan.coordinates}
              </div>

              {/* Lineage Badge Top Left */}
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
                {activeArtisan.generation}
              </div>

              {/* Atelier Quote Bottom Overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  left: "2rem",
                  right: "2rem",
                  backgroundColor: "rgba(10,10,12,0.82)",
                  backdropFilter: "blur(12px)",
                  padding: "1.5rem 1.8rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(212,175,55,0.25)",
                  color: "#FFFFFF",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "1.05rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.92)",
                    marginBottom: "0.6rem",
                    fontWeight: 300,
                  }}
                >
                  &ldquo;{activeArtisan.atelierQuote}&rdquo;
                </p>
                <span
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    fontWeight: 600,
                  }}
                >
                  — {activeArtisan.name}, {activeArtisan.yearsPreserving} Years Preserving Craft
                </span>
              </div>
            </div>

            {/* Right Column: Editorial Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Region Code & Verification */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    fontWeight: 700,
                  }}
                >
                  {activeArtisan.regionCode} • {activeArtisan.craft}
                </span>

                <span
                  style={{
                    fontSize: "0.65rem",
                    backgroundColor: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: "var(--accent)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent)",
                      boxShadow: "0 0 8px var(--accent)",
                    }}
                  />
                  {activeArtisan.verificationScore}% Cryptographically Verified
                </span>
              </div>

              {/* Master Name */}
              <h3
                style={{
                  fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.015em",
                  color: "var(--text)"
                }}
              >
                {activeArtisan.name}
              </h3>

              <span
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  marginBottom: "1.8rem",
                  fontWeight: 400,
                  display: "block",
                }}
              >
                {activeArtisan.title} — {activeArtisan.location}
              </span>

              {/* Narrative Story */}
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.85,
                  color: "var(--text)",
                  marginBottom: "2.2rem",
                  fontWeight: 300,
                  opacity: 0.9,
                }}
              >
                {activeArtisan.biography}
              </p>

              {/* Verified Materials Grid */}
              <div style={{ marginBottom: "2.5rem" }}>
                <span
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "0.8rem",
                  }}
                >
                  Audited Natural Ingredients
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {activeArtisan.materialsUsed.map((mat) => (
                    <span
                      key={mat}
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--glass-border)",
                        padding: "0.45rem 1rem",
                        borderRadius: "30px",
                        color: "var(--text)",
                        fontWeight: 500,
                      }}
                    >
                      ✦ {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowDrawer(true)}
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
                    transition: "all 0.3s ease",
                  }}
                >
                  Inspect Cryptographic Lineage Audit &rarr;
                </button>

                <Link
                  href="/stories"
                  style={{
                    padding: "1.1rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                    fontSize: "0.75rem",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  All Stories
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Lineage Timeline Progress Bar */}
        <div style={{ marginTop: "5rem", borderTop: "1px solid var(--glass-border)", paddingTop: "2.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {GUARDIANS.map((g, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={g.id}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    cursor: "pointer",
                    padding: "1.4rem",
                    borderRadius: "16px",
                    backgroundColor: isActive ? "var(--surface)" : "transparent",
                    border: isActive ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: isActive ? "var(--accent)" : "var(--text-muted)",
                        fontWeight: 700,
                      }}
                    >
                      0{idx + 1}. {g.generation}
                    </span>
                    <span style={{ fontSize: "0.65rem", opacity: 0.5, color: "var(--text)" }}>{g.regionCode}</span>
                  </div>
                  <h4
                    style={{
                      fontSize: "1.05rem",
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      margin: "0 0 0.3rem",
                      fontWeight: isActive ? 500 : 300,
                      color: "var(--text)",
                    }}
                  >
                    {g.name}
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>{g.craft}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FULL AUDIT DRAWER MODAL */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDrawer(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(10,10,12,0.85)",
              backdropFilter: "blur(12px)",
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
                width: "min(680px, 92vw)",
                height: "100%",
                backgroundColor: "#0A0A0C",
                color: "#FAF9F6",
                overflowY: "auto",
                padding: "3.5rem 3rem",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                borderLeft: "1px solid rgba(212,175,55,0.3)"
              }}
            >
              <button
                onClick={() => setShowDrawer(false)}
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
                {activeArtisan.generation} — Cryptographic Audit Report
              </span>

              <h2
                style={{
                  fontSize: "2.4rem",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 300,
                  marginBottom: "0.5rem",
                  color: "#FAF9F6"
                }}
              >
                {activeArtisan.name}
              </h2>

              <p style={{ fontSize: "0.85rem", color: "rgba(250,249,246,0.6)", marginBottom: "2rem" }}>
                {activeArtisan.title} • {activeArtisan.location}
              </p>

              <div
                style={{
                  position: "relative",
                  height: "280px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "2.5rem",
                  border: "1px solid rgba(212,175,55,0.2)"
                }}
              >
                <img
                  src={activeArtisan.portrait}
                  alt={activeArtisan.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Technique & Heritage Protocol
                </h4>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(250,249,246,0.85)", fontWeight: 300 }}>
                  {activeArtisan.signatureTechnique}
                </p>
              </div>

              <div style={{ marginBottom: "2.5rem", backgroundColor: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.2)" }}>
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Cryptographic Ledger Status
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>REGIONAL CODE:</span>
                    <span style={{ color: "var(--accent)" }}>{activeArtisan.regionCode}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>GPS STAMP:</span>
                    <span style={{ color: "#FAF9F6" }}>{activeArtisan.coordinates}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ opacity: 0.6 }}>LINEAGE VERIFICATION:</span>
                    <span style={{ color: "#10B981" }}>{activeArtisan.verificationScore}% AUDITED</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
                <Link
                  href="/stories"
                  onClick={() => setShowDrawer(false)}
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
    </section>
  );
}
