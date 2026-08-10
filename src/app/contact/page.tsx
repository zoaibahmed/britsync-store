"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const INQUIRY_TYPES = [
  { id: "patron", label: "Patron Acquisition & White-Glove Shipping" },
  { id: "guild", label: "Guild Onboarding & On-Site Verification" },
  { id: "order", label: "Order & Escrow Status Inquiry" },
  { id: "governance", label: "Geographic Indication & Legal Governance" },
];

const GLOBAL_HUBS = [
  {
    city: "London Headquarters",
    role: "Global Concierge & Logistics Command",
    address: "28 Grosvenor Street, Mayfair, London W1K 4QR, United Kingdom",
    email: "london@britsync.com",
    phone: "+44 (0)20 7946 0188",
    hours: "Monday – Friday: 09:00 – 18:00 GMT",
  },
  {
    city: "High Atlas Field Station",
    role: "North Africa Guild Verification Hub",
    address: "Aït Bouguemez Valley, Azilal Province, High Atlas, Morocco",
    email: "atlas.audit@britsync.com",
    phone: "+212 524 883 912",
    hours: "Field Inspectors On-Site 6 Days/Week",
  },
  {
    city: "Indus Valley Field Station",
    role: "South Asia Textile & Craft Hub",
    address: "Bhit Shah, Matiari District, Sindh, Pakistan",
    email: "indus.audit@britsync.com",
    phone: "+92 222 760 144",
    hours: "Field Inspectors On-Site 6 Days/Week",
  },
  {
    city: "Anatolia Field Station",
    role: "Middle East & Ceramic Audit Hub",
    address: "Atelier Quarter, Iznik, Bursa, Turkey",
    email: "iznik.audit@britsync.com",
    phone: "+90 224 757 2040",
    hours: "Field Inspectors On-Site 6 Days/Week",
  },
];

const CONTACT_FAQS = [
  {
    q: "What is the response time for patron inquiries?",
    a: "Our London Concierge team responds to all private patron inquiries, custom crating requests, and order status updates within 4 business hours."
  },
  {
    q: "How can master artisans or cooperatives apply for guild verification?",
    a: "You can submit an application via our 'Apply for Guild Curation' portal or contact our regional field audit stations directly. Field inspectors will schedule an initial genealogy review and material sampling."
  },
  {
    q: "Can I schedule a private viewing or white-glove inspection in the UK?",
    a: "Yes. For high-value heritage pieces, Britsync arranges private viewings at our Mayfair concierge studio or white-glove insured delivery directly to your residence."
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

export default function ContactPage() {
  const [selectedInquiry, setSelectedInquiry] = useState(INQUIRY_TYPES[0].id);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ ticketId: string; message: string } | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

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
        setFormData({ name: "", email: "", phone: "", country: "", message: "" });
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
              BRITSYNC CONCIERGE & GOVERNANCE • LONDON & GLOBAL ATELIERS
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
            Direct Access to Britsync Concierge<br />
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>& Guild Governance</span>
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
            Whether inquiring about private patron acquisitions, regional guild verification audits, Geographic Indication legal compliance, or order status — our London concierge and field audit teams are at your disposal.
          </motion.p>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. 3 INQUIRY CHANNELS CARDS
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "6rem 2rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.2rem" }}>
            {[
              {
                num: "01",
                title: "Patron Concierge",
                sub: "White-Glove Acquisitions & Shipping",
                desc: "Assistance with private collector viewings, custom wooden crating, insured airfreight logistics, and escrow payment support.",
                email: "patrons@britsync.com"
              },
              {
                num: "02",
                title: "Guild Accreditation",
                sub: "Artisan Verification & Audits",
                desc: "Inquiries from master creators, regional cooperatives, and historical craft guilds seeking GI provenance verification.",
                email: "guilds@britsync.com"
              },
              {
                num: "03",
                title: "Governance & Legal",
                sub: "Geographic Indication & Media",
                desc: "Institutional inquiries, legal compliance regarding Geographic Indications (GIs), press relations, and brand governance.",
                email: "governance@britsync.com"
              }
            ].map((chan, idx) => (
              <motion.div
                key={chan.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUpVariants}
                custom={idx}
                whileHover={{ y: -4 }}
                style={{
                  padding: "3rem 2.4rem",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, marginBottom: "0.8rem" }}>
                    CHANNEL {chan.num}
                  </div>
                  <h3 style={{ fontSize: "1.6rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.4rem", fontWeight: 400 }}>
                    {chan.title}
                  </h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--accent)", marginBottom: "1.2rem", fontWeight: 600 }}>
                    {chan.sub}
                  </div>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                    {chan.desc}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "1.4rem", marginTop: "2rem" }}>
                  <a
                    href={`mailto:${chan.email}`}
                    style={{
                      fontSize: "0.82rem",
                      fontFamily: "monospace",
                      color: "var(--text)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    ✉ {chan.email}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. INTERACTIVE CONTACT FORM & TICKET ISSUANCE
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
              CONCIERGE DISPATCH
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)", margin: "0 0 1rem" }}>
              Submit an Official Inquiry
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 300, maxWidth: "620px", margin: "0 auto" }}>
              Please select your inquiry type and complete the dispatch fields below. Every submission is assigned a tracked Britsync Concierge Ticket ID.
            </p>
          </div>

          {/* Form Container */}
          <div
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--glass-border)",
              borderTop: "4px solid var(--accent)",
              padding: "3.5rem",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Inquiry Selector Pills */}
            <div style={{ marginBottom: "2.8rem" }}>
              <label style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "1rem" }}>
                1. SELECT INQUIRY CATEGORY
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.9rem" }}>
                {INQUIRY_TYPES.map((type) => {
                  const isSelected = type.id === selectedInquiry;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedInquiry(type.id)}
                      style={{
                        padding: "1rem 1.2rem",
                        backgroundColor: isSelected ? "var(--surface)" : "var(--background)",
                        border: isSelected ? "1px solid var(--accent)" : "1px solid var(--glass-border)",
                        borderLeft: isSelected ? "4px solid var(--accent)" : "1px solid var(--glass-border)",
                        color: "var(--text)",
                        fontSize: "0.78rem",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form Fields */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.8rem" }}>
                <div>
                  <label style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.6rem", fontWeight: 600 }}>
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lord Edward Sterling"
                    style={{
                      width: "100%",
                      padding: "1rem 1.2rem",
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text)",
                      fontSize: "0.92rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.6rem", fontWeight: 600 }}>
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. e.sterling@mayfairpatrons.co.uk"
                    style={{
                      width: "100%",
                      padding: "1rem 1.2rem",
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text)",
                      fontSize: "0.92rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.8rem" }}>
                <div>
                  <label style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.6rem", fontWeight: 600 }}>
                    PHONE NUMBER (OPTIONAL)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+44 7700 900077"
                    style={{
                      width: "100%",
                      padding: "1rem 1.2rem",
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text)",
                      fontSize: "0.92rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.6rem", fontWeight: 600 }}>
                    COUNTRY OF RESIDENCE
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United Kingdom"
                    style={{
                      width: "100%",
                      padding: "1rem 1.2rem",
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text)",
                      fontSize: "0.92rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.6rem", fontWeight: 600 }}>
                  INQUIRY DETAILS *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your patron acquisition request, guild audit question, or governance inquiry..."
                  style={{
                    width: "100%",
                    padding: "1rem 1.2rem",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text)",
                    fontSize: "0.92rem",
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
                  padding: "1.25rem 3.5rem",
                  backgroundColor: "var(--accent)",
                  color: "var(--primary)",
                  border: "none",
                  fontSize: "0.78rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  alignSelf: "flex-start",
                  boxShadow: "var(--shadow-md)",
                  marginTop: "0.5rem"
                }}
              >
                {loading ? "Transmitting Inquiry..." : "Transmit Official Inquiry →"}
              </motion.button>
            </form>

            {/* Ticket Confirmation Modal Box */}
            <AnimatePresence>
              {ticketResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  style={{
                    marginTop: "2.5rem",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--accent)",
                    borderLeft: "6px solid var(--accent)",
                    padding: "2rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                    <span style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>
                      INQUIRY DISPATCH CONFIRMED
                    </span>
                    <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#10B981", fontWeight: 700 }}>
                      ● TICKET #{ticketResult.ticketId}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1.3rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.5rem", fontWeight: 400 }}>
                    Inquiry Received by Britsync Concierge
                  </h4>
                  <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", margin: 0, fontWeight: 300 }}>
                    {ticketResult.message} A copy has been dispatched to your email address with response priority assigned.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. GLOBAL OFFICE & FIELD AUDIT STATIONS
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "5.5rem" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
              GLOBAL FOOTPRINT
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)" }}>
              London Headquarters & Field Stations
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {GLOBAL_HUBS.map((hub, idx) => (
              <motion.div
                key={hub.city}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUpVariants}
                custom={idx}
                whileHover={{ y: -4 }}
                style={{
                  padding: "2.8rem 2.2rem",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--glass-border)",
                  borderTop: "3px solid var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.4rem", fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--text)", margin: "0 0 0.4rem", fontWeight: 400 }}>
                    {hub.city}
                  </h3>
                  <div style={{ fontSize: "0.72rem", color: "var(--accent)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "1.4rem", fontWeight: 700 }}>
                    {hub.role}
                  </div>
                  <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: "1.5rem", fontWeight: 300 }}>
                    📍 {hub.address}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem", fontFamily: "monospace" }}>
                  <span style={{ color: "var(--text)" }}>📞 {hub.phone}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>🕒 {hub.hours}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. CONTACT FAQ ACCORDION (QUIET & SOPHISTICATED)
          ════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "8.5rem 2rem",
          backgroundColor: "var(--surface)",
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, display: "block", marginBottom: "0.8rem" }}>
              CONCIERGE FAQ
            </span>
            <h2 style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 300, color: "var(--text)" }}>
              Contact & Inquiry Protocols
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {CONTACT_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <motion.div
                  key={faq.q}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUpVariants}
                  custom={idx}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--glass-border)",
                    borderLeft: isOpen ? "4px solid var(--accent)" : "1px solid var(--glass-border)",
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
                      style={{ marginTop: "1rem", fontSize: "0.95rem", lineHeight: 1.85, color: "var(--text-muted)", margin: "1rem 0 0", fontWeight: 300 }}
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

    </div>
  );
}
