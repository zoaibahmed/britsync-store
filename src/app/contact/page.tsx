"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const INQUIRY_TYPES = [
  { id: "patron", label: "Patron Acquisition" },
  { id: "guild", label: "Guild & Audit" },
  { id: "order", label: "Order & Shipping" },
  { id: "general", label: "General Inquiry" },
];

const GLOBAL_HUBS = [
  {
    city: "London Headquarters",
    role: "Mayfair Concierge",
    address: "28 Grosvenor Street, Mayfair, London W1K 4QR",
    email: "concierge@britsync.com",
    phone: "+44 (0)20 7946 0188",
  },
  {
    city: "High Atlas Station",
    role: "Morocco Guild Hub",
    address: "Aït Bouguemez Valley, High Atlas, Morocco",
    email: "atlas@britsync.com",
  },
  {
    city: "Indus Valley Station",
    role: "Pakistan Guild Hub",
    address: "Bhit Shah, Sindh Valley, Pakistan",
    email: "indus@britsync.com",
  },
  {
    city: "Anatolia Station",
    role: "Turkey Ceramic Hub",
    address: "Atelier Quarter, Iznik, Turkey",
    email: "iznik@britsync.com",
  },
];

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  })
};

export default function ContactPage() {
  const [selectedInquiry, setSelectedInquiry] = useState(INQUIRY_TYPES[0].id);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ ticketId: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          inquiryType: INQUIRY_TYPES.find((t) => t.id === selectedInquiry)?.label,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTicketResult({
          ticketId: data.ticketId,
          message: data.message,
        });
        setFormData({ name: "", email: "", country: "", message: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--text)", overflow: "hidden", minHeight: "100vh" }}>
      
      {/* ════════════════════════════════════════════════════════════
          1. CLEAN LUXURY HERO SECTION
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "11rem 2rem 5rem",
          backgroundColor: "var(--surface)",
          position: "relative",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(var(--accent) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            custom={0}
            style={{ display: "inline-block", marginBottom: "1.5rem" }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.8rem",
                padding: "0.5rem 1.4rem",
                backgroundColor: "var(--background)",
                border: "1px solid var(--accent)",
                color: "var(--accent)",
                fontSize: "0.68rem",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                fontWeight: 700,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "var(--accent)" }} />
              BRITSYNC CONCIERGE • MAYFAIR, LONDON
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            custom={1}
            style={{
              fontSize: "clamp(3rem, 5.5vw, 4.8rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "var(--text)",
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Contact Britsync Concierge
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            custom={2}
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.85,
              color: "var(--text-muted)",
              marginBottom: "0",
              fontWeight: 300,
              maxWidth: "760px",
              margin: "0 auto"
            }}
          >
            Whether inquiring about private patron acquisitions, custom wooden crating, guild verification audits, or order status — our London concierge team is at your service.
          </motion.p>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. SIMPLE 2-COLUMN LUXURY STAGE: FORM + CHANNELS
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "6rem 2rem 8rem",
          backgroundColor: "var(--background)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "4rem", alignItems: "start" }}>
            
            {/* Left Column: Direct Channels & Hubs */}
            <div>
              <span style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
                DIRECT CONTACT
              </span>
              <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)", margin: "0 0 1.2rem" }}>
                Atelier Concierge
              </h2>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text-muted)", marginBottom: "2.5rem", fontWeight: 300 }}>
                Our Mayfair London Concierge team handles all collector inquiries, custom crating logistics, and private viewings. All dispatches receive priority responses within 4 business hours.
              </p>

              {/* Hub Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {GLOBAL_HUBS.map((hub) => (
                  <div
                    key={hub.city}
                    style={{
                      padding: "1.6rem 1.8rem",
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--glass-border)",
                      borderLeft: "4px solid var(--accent)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <h3 style={{ fontSize: "1.15rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: 0, fontWeight: 400 }}>
                        {hub.city}
                      </h3>
                      <span style={{ fontSize: "0.65rem", letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>
                        {hub.role}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 0.8rem", fontWeight: 300 }}>
                      📍 {hub.address}
                    </p>
                    <a
                      href={`mailto:${hub.email}`}
                      style={{
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                        color: "var(--accent)",
                        textDecoration: "none",
                        fontWeight: 600
                      }}
                    >
                      ✉ {hub.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Clean Luxury Form */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--glass-border)",
                borderTop: "4px solid var(--accent)",
                padding: "3rem",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <span style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.6rem" }}>
                OFFICIAL INQUIRY DISPATCH
              </span>
              <h3 style={{ fontSize: "1.8rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 1.8rem", fontWeight: 400 }}>
                Transmit an Inquiry
              </h3>

              {/* Category Selector Pills */}
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ fontSize: "0.65rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.8rem", fontWeight: 600 }}>
                  INQUIRY CATEGORY
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.6rem" }}>
                  {INQUIRY_TYPES.map((type) => {
                    const isSelected = type.id === selectedInquiry;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedInquiry(type.id)}
                        style={{
                          padding: "0.75rem 0.9rem",
                          backgroundColor: isSelected ? "var(--background)" : "var(--surface)",
                          border: isSelected ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                          color: isSelected ? "var(--accent)" : "var(--text)",
                          fontSize: "0.72rem",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          fontWeight: isSelected ? 700 : 400,
                          letterSpacing: "1px"
                        }}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                <div>
                  <label style={{ fontSize: "0.65rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
                    style={{
                      width: "100%",
                      padding: "0.9rem 1.1rem",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text)",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1.2rem" }}>
                  <div>
                    <label style={{ fontSize: "0.65rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@domain.com"
                      style={{
                        width: "100%",
                        padding: "0.9rem 1.1rem",
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text)",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.65rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                      COUNTRY
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. United Kingdom"
                      style={{
                        width: "100%",
                        padding: "0.9rem 1.1rem",
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text)",
                        fontSize: "0.9rem",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.65rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    INQUIRY MESSAGE *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your patron request, guild question, or order inquiry..."
                    style={{
                      width: "100%",
                      padding: "0.9rem 1.1rem",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text)",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical"
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    padding: "1.15rem 2.8rem",
                    backgroundColor: "var(--accent)",
                    color: "var(--primary)",
                    border: "none",
                    fontSize: "0.75rem",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "var(--shadow-md)",
                    marginTop: "0.4rem",
                    width: "100%"
                  }}
                >
                  {loading ? "Transmitting..." : "TRANSMIT INQUIRY →"}
                </motion.button>
              </form>

              {/* Confirmation State */}
              <AnimatePresence>
                {ticketResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    style={{
                      marginTop: "2rem",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--accent)",
                      borderLeft: "4px solid var(--accent)",
                      padding: "1.6rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "0.62rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>
                        DISPATCH CONFIRMED
                      </span>
                      <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#10B981", fontWeight: 700 }}>
                        ● TICKET #{ticketResult.ticketId}
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1.15rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.4rem", fontWeight: 400 }}>
                      Inquiry Received
                    </h4>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                      {ticketResult.message} Priority assigned for London Concierge dispatch.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
