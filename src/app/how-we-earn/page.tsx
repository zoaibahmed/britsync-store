"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const MARKUP_COVERAGE = [
  {
    num: "01",
    title: "Physical Atelier Verification",
    desc: "Deploying field auditors to remote mountain valleys to map satellite GPS boundaries, verify master lineage, and record physical guild accreditation."
  },
  {
    num: "02",
    title: "Atelier Documentaries & Copywriting",
    desc: "Hiring local craft historians, translators, and photographers to document the master creator's technique and oral tradition without digital friction for the artisan."
  },
  {
    num: "03",
    title: "Museum-Grade Customs & Logistics",
    desc: "Coordinating insured white-glove airfreight, custom wooden crating, tariffs, VAT processing, and UK customs clearance directly from the maker's workshop."
  },
  {
    num: "04",
    title: "Smart Escrow Protection",
    desc: "Holding 100% of patron payments in secure escrow, releasing the artisan's full requested price automatically upon verified UK delivery."
  },
  {
    num: "05",
    title: "Cryptographic Provenance Ledger",
    desc: "Sustaining digital infrastructure, encrypted NFC physical tags, and permanent provenance records for every registered creation."
  },
  {
    num: "06",
    title: "24/7 Mayfair Patron Concierge",
    desc: "Managing all collector inquiries, custom crating requests, translation, and white-glove delivery tracking."
  }
];

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  })
};

export default function HowWeEarnPage() {
  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--text)", overflow: "hidden", minHeight: "100vh" }}>
      
      {/* ════════════════════════════════════════════════════════════
          1. LUXURY EDITORIAL HERO SECTION
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "11rem 2rem 6rem",
          backgroundColor: "var(--surface)",
          position: "relative",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(var(--accent) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            custom={0}
            style={{ display: "inline-block", marginBottom: "1.8rem" }}
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
              TRANSPARENT MANAGED COMMERCE • 0% MAKER COMMISSIONS
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            custom={1}
            style={{
              fontSize: "clamp(3rem, 5.8vw, 5.2rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              lineHeight: 1.08,
              color: "var(--text)",
              marginBottom: "1.8rem",
              letterSpacing: "-0.03em",
            }}
          >
            How Britsync Operates<br />
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>Our Zero-Fee Maker Model</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            custom={2}
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.85,
              color: "var(--text-muted)",
              marginBottom: "0",
              fontWeight: 300,
              maxWidth: "840px",
              margin: "0 auto"
            }}
          >
            Britsync is not a commission-based broker. We are a managed commerce platform that funds physical studio audits, artisan documentaries, customs clearance, and museum-grade logistics through a transparent buyer-side markup. The maker receives 100% of their requested price.
          </motion.p>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. THE 2-PILLAR FINANCIAL MODEL
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "7.5rem 2rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
              UNCOMPROMISED FAIRNESS
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)" }}>
              The Two Pillars of Britsync Economics
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "3rem" }}>
            
            {/* Pillar 1 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              custom={0}
              style={{
                padding: "3.5rem 3rem",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--glass-border)",
                borderTop: "4px solid var(--accent)",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <span style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
                PILLAR 01
              </span>
              <h3 style={{ fontSize: "1.8rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 1.2rem", fontWeight: 400 }}>
                100% Desired Artisan Payout
              </h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text-muted)", marginBottom: "2rem", fontWeight: 300 }}>
                Every master maker defines their own desired payout price. This is the exact, uncompromised amount they receive upon acquisition. Artisans pay ZERO listing fees, catalog fees, or sales commissions.
              </p>
              
              <div style={{ backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", padding: "1.4rem 1.6rem" }}>
                <span style={{ fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>
                  MAKER FEE DEDUCTED
                </span>
                <strong style={{ fontSize: "1.6rem", color: "var(--accent)", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  £0.00 (0% Commission)
                </strong>
              </div>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              custom={1}
              style={{
                padding: "3.5rem 3rem",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--glass-border)",
                borderTop: "4px solid var(--accent)",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <span style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
                PILLAR 02
              </span>
              <h3 style={{ fontSize: "1.8rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 1.2rem", fontWeight: 400 }}>
                Managed Registry Markup
              </h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text-muted)", marginBottom: "2rem", fontWeight: 300 }}>
                Britsync adds a transparent managed markup on top of the artisan&apos;s payout. Paid by the patron at checkout, this markup directly funds field audits, customs processing, insured crating, and white-glove delivery.
              </p>
              
              <div style={{ backgroundColor: "var(--background)", border: "1px solid var(--glass-border)", padding: "1.4rem 1.6rem" }}>
                <span style={{ fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>
                  PATRON MARKUP COVERAGE
                </span>
                <strong style={{ fontSize: "1.6rem", color: "var(--text)", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  100% Operations & Audit Funded
                </strong>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. WHAT DOES THE MARKUP FUND?
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
            <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
              OPERATIONAL COVERAGE
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)" }}>
              What Does the Managed Markup Fund?
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.2rem" }}>
            {MARKUP_COVERAGE.map((item, idx) => (
              <motion.div
                key={item.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUpVariants}
                custom={idx}
                whileHover={{ y: -4 }}
                style={{
                  padding: "2.8rem 2.2rem",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, marginBottom: "0.8rem" }}>
                  STAGE {item.num}
                </div>
                <h3 style={{ fontSize: "1.35rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 1rem", fontWeight: 400 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. FINANCIAL BREAKDOWN STAGE (ILLUSTRATIVE ACQUISITION)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem 10rem",
          backgroundColor: "var(--background)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          
          <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
            PRICING BREAKDOWN
          </span>
          <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)", margin: "0 0 1.2rem" }}>
            An Illustrative Patron Transaction
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 300, maxWidth: "660px", margin: "0 auto 4.5rem" }}>
            Here is how a £240 acquisition breaks down transparently between the maker payout and managed operational coverage:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem", alignItems: "center" }}>
            
            {/* Step 1: Artisan Payout */}
            <div style={{ padding: "2.5rem 2rem", backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)", borderTop: "3px solid var(--accent)" }}>
              <span style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.6rem" }}>
                1. MAKER PAYOUT
              </span>
              <div style={{ fontSize: "2.8rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 300, margin: "0.5rem 0" }}>
                £150
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 300 }}>
                100% of desired price paid via escrow
              </span>
            </div>

            {/* Step 2: Managed Operations */}
            <div style={{ padding: "2.5rem 2rem", backgroundColor: "var(--surface)", border: "1px solid var(--glass-border)", borderTop: "3px solid var(--accent)" }}>
              <span style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "0.6rem" }}>
                2. MANAGED COVERAGE
              </span>
              <div style={{ fontSize: "2.8rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", fontWeight: 300, margin: "0.5rem 0" }}>
                £90
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 300 }}>
                Audits, crating, airfreight & customs
              </span>
            </div>

            {/* Step 3: Patron Final Price */}
            <div style={{ padding: "2.5rem 2rem", backgroundColor: "var(--surface)", border: "1px solid var(--accent)", borderTop: "4px solid var(--accent)", boxShadow: "var(--shadow-md)" }}>
              <span style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.6rem" }}>
                3. PATRON ACQUISITION
              </span>
              <div style={{ fontSize: "2.8rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--accent)", fontWeight: 400, margin: "0.5rem 0" }}>
                £240
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 300 }}>
                Finalized checkout price
              </span>
            </div>

          </div>

          <div style={{ marginTop: "4.5rem" }}>
            <Link
              href="/collections"
              className="btn-accent"
              style={{
                textDecoration: "none",
                padding: "1.25rem 3.4rem",
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
          </div>

        </div>
      </section>

    </div>
  );
}
