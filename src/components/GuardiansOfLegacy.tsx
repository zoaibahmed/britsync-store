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
  category: "weaving" | "blockprint" | "ceramics";
  image: string;
  portrait: string;
  gallery: string[];
  story: string;
  biography: string;
  signatureTechnique: string;
  verificationScore: number;
  yearsPreserving: number;
  materialsUsed: string[];
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
    category: "weaving",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1000",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1000",
    ],
    story: "Fatima guards a 200-year-old weaving pattern inherited through her lineage without written notes.",
    biography: "Born in the secluded Ait Bouguemez valley, Fatima learned the art of hand-carded sheep wool weaving at age eight from her grandmother. She leads a collective of 24 women, preserving rare geometric Berber motifs that document regional tribal histories.",
    signatureTechnique: "Double-Knotted High-Atlas Pile Weave with Saffron & Indigo Dye",
    verificationScore: 99.8,
    yearsPreserving: 42,
    materialsUsed: ["Pure Mountain Sheep Wool", "Natural Wild Saffron", "Crushed Indigo Mineral"],
  },
  {
    id: "aisha-pakistan",
    name: "Aisha & Ghulam Soomro",
    title: "Master Blockprinter & Indigo Alchemist",
    generation: "5th Gen Keepers",
    location: "Bhit Shah, Sindh Valley, Pakistan",
    regionCode: "PAK-SND-104",
    coordinates: "25.8072° N, 68.4907° E",
    craft: "Ajrak Blockprinting",
    category: "blockprint",
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1000",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1000",
    ],
    story: "Preserving the sacred 21-step natural vegetable dyeing sequence on organic handspun Indus cotton.",
    biography: "The Soomro family atelier in Bhit Shah is one of the last remaining sanctums practicing true 21-step Ajrak blockprinting. Each textile undergoes weeks of washing, mud-resist printing, and immersion in natural indigo pits.",
    signatureTechnique: "21-Stage Mud-Resist & Mineral Oxide Double-Sided Block Impression",
    verificationScore: 100,
    yearsPreserving: 38,
    materialsUsed: ["Handspun Indus Cotton", "Fermented Natural Indigo", "Pomegranate Shell Extract"],
  },
  {
    id: "zeynep-turkey",
    name: "Zeynep Kilic",
    title: "Master Ceramicist & Quartz Glazer",
    generation: "4th Gen Master",
    location: "Iznik Atelier, Anatolia, Turkey",
    regionCode: "TUR-IZN-302",
    coordinates: "40.4286° N, 29.7214° E",
    craft: "Quartz-Glazed Ceramics",
    category: "ceramics",
    image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1000",
    portrait: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000",
    ],
    story: "Zeynep fires ceramic masterworks containing 85%+ quartz silica using traditional wood-fired kilns.",
    biography: "Recreating 16th-century Ottoman Iznik formulas, Zeynep uses pure quartz silica clay requiring exact temperature curves reached in wood kilns. Her ceramics produce a glass-clear radiance that withstands centuries.",
    signatureTechnique: "High-Silica Underglaze Painting with Cobalt & Coral Red Minerals",
    verificationScore: 99.5,
    yearsPreserving: 29,
    materialsUsed: ["85% Quartz Frit Clay", "Cobalt Oxide Mineral", "Pine Wood Kiln Fire"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Heritage Keepers" },
  { id: "weaving", label: "Loom Weaving" },
  { id: "blockprint", label: "Blockprinting" },
  { id: "ceramics", label: "Quartz Ceramics" },
];

export default function GuardiansOfLegacy() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianArtisan | null>(null);

  const filteredGuardians = activeCategory === "all"
    ? GUARDIANS
    : GUARDIANS.filter((g) => g.category === activeCategory);

  return (
    <section
      style={{
        padding: "9rem 2rem",
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--glass-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "450px",
          background: "radial-gradient(ellipse at center, rgba(212,175,55,0.035) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}
          >
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
              Artisan Curation & Lineage
            </span>
            <span style={{ width: "28px", height: "1px", backgroundColor: "var(--accent)" }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              marginBottom: "1.2rem",
            }}
          >
            Guardians of the Legacy
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.8,
              color: "var(--text-muted)",
              maxWidth: "620px",
              margin: "0 auto 3rem",
              fontWeight: 300,
            }}
          >
            Meet the master craftspeople safeguarding centuries of living heritage. Every masterwork is physically audited, cryptographically geofenced, and direct-patron protected.
          </motion.p>

          {/* Category tabs */}
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.6rem",
              padding: "0.4rem",
              backgroundColor: "rgba(10,10,12,0.03)",
              border: "1px solid var(--glass-border)",
              borderRadius: "50px",
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: "0.6rem 1.4rem",
                    borderRadius: "30px",
                    fontSize: "0.72rem",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--background)" : "var(--text)",
                    backgroundColor: isActive ? "var(--accent)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "2.5rem",
          }}
        >
          {filteredGuardians.map((maker, idx) => (
            <motion.div
              key={maker.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--glass-border)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "var(--shadow-md)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "box-shadow 0.4s ease, border-color 0.4s ease",
              }}
            >
              {/* Image Container */}
              <div
                style={{
                  position: "relative",
                  height: "340px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                <motion.img
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  src={maker.image}
                  alt={maker.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.9,
                  }}
                />

                {/* Vignette Shadow Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.25) 60%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Top Badges */}
                <div
                  style={{
                    position: "absolute",
                    top: "1.2rem",
                    left: "1.2rem",
                    right: "1.2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#FFFFFF",
                      backgroundColor: "rgba(10,10,12,0.75)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      padding: "0.35rem 0.8rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                    }}
                  >
                    {maker.generation}
                  </span>

                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--accent)",
                      backgroundColor: "rgba(10,10,12,0.85)",
                      backdropFilter: "blur(10px)",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "20px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      border: "1px solid rgba(212,175,55,0.3)",
                    }}
                  >
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
                    {maker.verificationScore}% Verified
                  </span>
                </div>

                {/* Bottom Overlay Title */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.4rem",
                    left: "1.4rem",
                    right: "1.4rem",
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      color: "var(--accent)",
                      fontSize: "0.68rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {maker.craft}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.6rem",
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      color: "#FFFFFF",
                      fontWeight: 300,
                      margin: 0,
                    }}
                  >
                    {maker.name}
                  </h3>
                </div>
              </div>

              {/* Body Content */}
              <div style={{ padding: "2.2rem 2rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <p
                  style={{
                    fontSize: "0.88rem",
                    lineHeight: 1.8,
                    color: "var(--text-muted)",
                    marginBottom: "1.8rem",
                    fontWeight: 300,
                    flex: 1,
                  }}
                >
                  {maker.story}
                </p>

                {/* Location */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "1.2rem",
                    borderTop: "1px solid var(--glass-border)",
                    marginBottom: "1.6rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Icons.MapPin size={13} style={{ color: "var(--accent)" }} />
                    {maker.location}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <button
                    onClick={() => setSelectedGuardian(maker)}
                    style={{
                      flex: 1,
                      padding: "0.85rem 1rem",
                      borderRadius: "8px",
                      backgroundColor: "rgba(212,175,55,0.08)",
                      border: "1px solid rgba(212,175,55,0.35)",
                      color: "var(--accent)",
                      fontSize: "0.72rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    View Lineage Audit &rarr;
                  </button>

                  <Link
                    href="/stories"
                    style={{
                      padding: "0.85rem 1.1rem",
                      borderRadius: "8px",
                      backgroundColor: "transparent",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text)",
                      fontSize: "0.72rem",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Stories
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── ARTISAN LINEAGE DRAWER ── */}
      <AnimatePresence>
        {selectedGuardian && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGuardian(null)}
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
                boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedGuardian(null)}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  display: "block",
                }}
              >
                {selectedGuardian.generation} — Cryptographic Audit
              </span>

              <h2
                style={{
                  fontSize: "2.4rem",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 300,
                  marginBottom: "0.5rem",
                  lineHeight: 1.2,
                }}
              >
                {selectedGuardian.name}
              </h2>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "2rem",
                  fontWeight: 300,
                }}
              >
                {selectedGuardian.title} • {selectedGuardian.location}
              </p>

              {/* Portrait */}
              <div
                style={{
                  position: "relative",
                  height: "280px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "2.5rem",
                  border: "1px solid rgba(212,175,55,0.2)",
                }}
              >
                <img
                  src={selectedGuardian.portrait}
                  alt={selectedGuardian.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.2rem",
                    left: "1.5rem",
                    right: "1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontWeight: 600,
                    }}
                  >
                    GPS: {selectedGuardian.coordinates}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: "rgba(212,175,55,0.2)",
                      border: "1px solid var(--accent)",
                      color: "var(--accent)",
                      padding: "0.3rem 0.8rem",
                      borderRadius: "20px",
                      fontWeight: 700,
                    }}
                  >
                    {selectedGuardian.yearsPreserving} Years Preserving Craft
                  </span>
                </div>
              </div>

              {/* Biography */}
              <div style={{ marginBottom: "2.5rem" }}>
                <h4
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "1rem",
                  }}
                >
                  Biography & Guild Lineage
                </h4>
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.85,
                    color: "rgba(255,255,255,0.82)",
                    fontWeight: 300,
                  }}
                >
                  {selectedGuardian.biography}
                </p>
              </div>

              {/* Technique & Materials */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "1.8rem",
                  marginBottom: "2.5rem",
                }}
              >
                <div style={{ marginBottom: "1.4rem" }}>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Signature Technique
                  </span>
                  <p style={{ fontSize: "0.9rem", color: "#FFFFFF", fontWeight: 400, margin: 0 }}>
                    {selectedGuardian.signatureTechnique}
                  </p>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      display: "block",
                      marginBottom: "0.6rem",
                    }}
                  >
                    Verified Raw Materials
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {selectedGuardian.materialsUsed.map((mat) => (
                      <span
                        key={mat}
                        style={{
                          fontSize: "0.7rem",
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.8)",
                          padding: "0.3rem 0.7rem",
                          borderRadius: "6px",
                        }}
                      >
                        ✓ {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ marginTop: "auto", display: "flex", gap: "1rem", paddingTop: "1.5rem" }}>
                <Link
                  href="/stories"
                  onClick={() => setSelectedGuardian(null)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "1rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--accent)",
                    color: "#000000",
                    fontSize: "0.75rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Explore Full Story & Masterpieces &rarr;
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
