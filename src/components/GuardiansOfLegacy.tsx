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
    generation: "7th Generation Lineage",
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
    generation: "5th Generation Guild Keepers",
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
    generation: "4th Generation Master Guild",
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
          background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
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
              Living Guild Stage — No Card Container
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
                      padding: "0.5rem 1.2rem",
                      borderRadius: "30px",
                      fontSize: "0.72rem",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "var(--background)" : "var(--text)",
                      backgroundColor: isActive ? "var(--accent)" : "rgba(10,10,12,0.04)",
                      border: isActive ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                      cursor: "pointer",
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    0{idx + 1}. {g.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════
            EDITORIAL STAGE (NO CARDS)
        ═════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArtisan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: "2.5rem",
              alignItems: "center",
              minHeight: "560px",
            }}
          >
            {/* Left Column: Huge Portrait Stage (Columns 1 to 6) */}
            <div
              style={{
                gridColumn: "span 6",
                position: "relative",
                height: "560px",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
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

              {/* Edge Gradient Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.3) 50%, transparent 100%), linear-gradient(to right, rgba(10,10,12,0.4) 0%, transparent 60%)",
                }}
              />

              {/* Floating Geofence Tag Top Right */}
              <div
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  backgroundColor: "rgba(10,10,12,0.78)",
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
                  backgroundColor: "rgba(212,175,55,0.15)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--accent)",
                  padding: "0.5rem 1.1rem",
                  borderRadius: "30px",
                  color: "var(--accent)",
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
                  color: "#FFFFFF",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "1.15rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.92)",
                    marginBottom: "0.8rem",
                    fontWeight: 300,
                  }}
                >
                  "{activeArtisan.atelierQuote}"
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
                  — {activeArtisan.name}, {activeArtisan.yearsPreserving} Years at Atelier
                </span>
              </div>
            </div>

            {/* Right Column: Editorial Details (Columns 7 to 12) */}
            <div
              style={{
                gridColumn: "span 6",
                display: "flex",
                flexDirection: "column",
                paddingLeft: "1rem",
              }}
            >
              {/* Region Code & Verification */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.2rem" }}>
                <span
                  style={{
                    fontSize: "0.65rem",
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
                    backgroundColor: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: "var(--accent)",
                    padding: "0.25rem 0.7rem",
                    borderRadius: "20px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
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
                  fontSize: "clamp(2rem, 3.2vw, 3rem)",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.015em",
                }}
              >
                {activeArtisan.name}
              </h3>

              <span
                style={{
                  fontSize: "0.85rem",
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
                  opacity: 0.88,
                }}
              >
                {activeArtisan.biography}
              </p>

              {/* Verified Materials Grid */}
              <div style={{ marginBottom: "2.5rem" }}>
                <span
                  style={{
                    fontSize: "0.62rem",
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
                        fontSize: "0.72rem",
                        backgroundColor: "rgba(10,10,12,0.04)",
                        border: "1px solid var(--glass-border)",
                        padding: "0.4rem 0.9rem",
                        borderRadius: "30px",
                        color: "var(--text)",
                        fontWeight: 400,
                      }}
                    >
                      ✦ {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <button
                  onClick={() => setShowDrawer(true)}
                  style={{
                    padding: "1rem 2rem",
                    borderRadius: "50px",
                    backgroundColor: "var(--accent)",
                    color: "#000000",
                    border: "none",
                    fontSize: "0.75rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 10px 25px rgba(212,175,55,0.25)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  Inspect Cryptographic Lineage Audit &rarr;
                </button>

                <Link
                  href="/stories"
                  style={{
                    padding: "1rem 1.8rem",
                    borderRadius: "50px",
                    border: "1px solid var(--glass-border)",
                    backgroundColor: "transparent",
                    color: "var(--text)",
                    fontSize: "0.75rem",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontWeight: 500,
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
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
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
                    padding: "1.2rem",
                    borderRadius: "12px",
                    backgroundColor: isActive ? "rgba(212,175,55,0.06)" : "transparent",
                    border: isActive ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
                    transition: "all 0.4s ease",
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
                    <span style={{ fontSize: "0.65rem", opacity: 0.5 }}>{g.regionCode}</span>
                  </div>
                  <h4
                    style={{
                      fontSize: "1.05rem",
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      margin: "0 0 0.3rem",
                      fontWeight: isActive ? 400 : 300,
                      color: isActive ? "var(--text)" : "var(--text-muted)",
                    }}
                  >
                    {g.name}
                  </h4>
                  <span style={{ fontSize: "0.75rem", opacity: 0.6, display: "block" }}>{g.craft}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════
          FULL AUDIT DRAWER MODAL
      ═════════════════════════════════════════ */}
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
              backgroundColor: "rgba(0,0,0,0.85)",
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
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(680px, 92vw)",
                height: "100%",
                backgroundColor: "var(--primary)",
                color: "#FFFFFF",
                overflowY: "auto",
                padding: "3.5rem 3rem",
                display: "flex",
                flexDirection: "column",
                position: "relative",
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
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                ✕
              </button>

              <span
                style={{
                  fontSize: "0.62rem",
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
                }}
              >
                {activeArtisan.name}
              </h2>

              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>
                {activeArtisan.title} • {activeArtisan.location}
              </p>

              <div
                style={{
                  position: "relative",
                  height: "280px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "2.5rem",
                }}
              >
                <img
                  src={activeArtisan.portrait}
                  alt={activeArtisan.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
                  Technique & Heritage Protocol
                </h4>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(255,255,255,0.85)", fontWeight: 300 }}>
                  {activeArtisan.signatureTechnique}
                </p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
                <Link
                  href="/stories"
                  onClick={() => setShowDrawer(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "1rem",
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
