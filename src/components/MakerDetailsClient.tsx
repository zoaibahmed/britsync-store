"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  Variants,
} from "framer-motion";
import { calculateSellingPrice } from "@/lib/pricing";

/* ─────────────────── INTERFACES ─────────────────── */
interface Product {
  id: string;
  name: string;
  category: string | { name: string };
  price: number;
  images: string;
  verificationStatus: string;
}
interface Story {
  id: string;
  title: string;
  excerpt: string;
  heroImage: string;
  craft: string;
  country: string;
}
interface SimilarMaker {
  id: string;
  businessName: string;
  founderName: string;
  country: string;
  verificationStatus: string;
  productCount: number;
  heroImage: string;
  logo: string;
}
interface Maker {
  id: string;
  businessName: string;
  founderName: string | null;
  founderStory: string | null;
  businessStory: string | null;
  country: string;
  verificationStatus: string;
  yearsInBusiness: number;
  employeeCount: number;
  coverImage: string | null;
  founderPhoto: string | null;
  impactStory: string | null;
  workshopGallery: string | null;
  teamPhotos: string | null;
  productionPhotos: string | null;
  lifestylePhotos: string | null;
}

/* ─────────────────── HELPERS ─────────────────── */
function parseGallery(s: string | null): string[] {
  try { return s ? JSON.parse(s) : []; } catch { return []; }
}
function getProductImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

/* ─────────────────── ANIMATION VARIANTS ─────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 1.0, ease: "easeOut" } },
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } },
};
const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } },
};
const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: "easeOut" } },
};

/* ─────────────────── WORD REVEAL ─────────────────── */
function WordReveal({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <motion.span
      style={{ display: "inline", ...style }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 28 },
            show: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.65, ease: "easeOut" } },
          }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ─────────────────── DARK LUXURY PRODUCT CARD ─────────────────── */
function DarkProductCard({ product, maker }: {
  product: { id: string; name: string; price: number; images: string[]; verificationStatus: string; category: string };
  maker: { businessName: string; country: string };
}) {
  const [hovered, setHovered] = useState(false);
  const img = product.images[0] || "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800";
  const img2 = product.images[1] || img;

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#141414",
          border: hovered ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius: "3px",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: hovered ? "0 20px 50px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", height: "280px", overflow: "hidden", background: "#0A0A0A" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("${img}")`,
            backgroundSize: "cover", backgroundPosition: "center",
            transition: "opacity 0.5s ease, transform 0.6s ease",
            opacity: hovered ? 0 : 1,
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("${img2}")`,
            backgroundSize: "cover", backgroundPosition: "center",
            transition: "opacity 0.5s ease, transform 0.6s ease",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "scale(1.02)" : "scale(1.08)",
          }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,14,0.7) 0%, transparent 55%)" }} />

          {/* Badge */}
          <div style={{
            position: "absolute", top: "1rem", left: "1rem",
            background: "rgba(14,14,14,0.85)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "#C9A84C", padding: "0.3rem 0.8rem", borderRadius: "20px",
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}>
            {product.verificationStatus === "ELITE" ? "⭐ Elite"
              : product.verificationStatus === "GI" ? "🏛️ GI"
              : "✓ Verified"}
          </div>
          {/* Passport chip */}
          <div style={{
            position: "absolute", top: "1rem", right: "1rem",
            background: "rgba(201,168,76,0.15)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(201,168,76,0.35)",
            color: "#C9A84C", padding: "0.3rem 0.65rem", borderRadius: "20px",
            fontSize: "0.6rem", fontWeight: 700,
          }}>
            🛡️ Passport
          </div>

          {/* Bottom category */}
          <div style={{
            position: "absolute", bottom: "0.8rem", left: "1rem",
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "2px",
            textTransform: "uppercase", color: "rgba(201,168,76,0.7)",
          }}>
            {product.category}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.4rem 1.5rem 1.6rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <h3 style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            fontSize: "1.3rem", fontWeight: 400, lineHeight: 1.2,
            color: "#F5F0E8", margin: 0,
          }}>
            {product.name}
          </h3>
          <div style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.4)", fontFamily: "var(--font-inter, system-ui)", letterSpacing: "0.5px" }}>
            {maker.businessName} · {maker.country}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.9rem", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.55rem", fontFamily: "var(--font-inter, system-ui)", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "0.2rem" }}>
                Acquisition
              </div>
              <div style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: "1.5rem", fontWeight: 300, color: "#C9A84C" }}>
                £{product.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{
              width: "38px", height: "38px", borderRadius: "50%",
              border: "1px solid rgba(201,168,76,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#C9A84C", fontSize: "1rem",
              transition: "all 0.3s",
              background: hovered ? "rgba(201,168,76,0.12)" : "transparent",
            }}>
              →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function MakerDetailsClient({
  maker,
  products,
  stories,
  similarMakers = [],
}: {
  maker: Maker;
  products: Product[];
  stories: Story | Story[];
  similarMakers?: SimilarMaker[];
}) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [certOpen, setCertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("workshop");

  const { scrollYProgress } = useScroll();
  const lineScale = useSpring(scrollYProgress, { stiffness: 80, damping: 30 });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(heroP, [0, 1], ["0%", "35%"]);
  const heroOpacity = useTransform(heroP, [0, 0.7], [1, 0]);
  const heroTextY = useTransform(heroP, [0, 1], ["0%", "-25%"]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const storiesList = Array.isArray(stories) ? stories : stories ? [stories] : [];
  const workshop = parseGallery(maker.workshopGallery);
  const team = parseGallery(maker.teamPhotos);
  const production = parseGallery(maker.productionPhotos);
  const lifestyle = parseGallery(maker.lifestylePhotos);
  const galleryMap: Record<string, string[]> = { workshop, team, production, lifestyle };
  const galleryPhotos: string[] = (galleryMap[activeTab] || []).length > 0
    ? galleryMap[activeTab]
    : ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600",
       "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800",
       "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800"];

  const cover = maker.coverImage || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600";
  const founderImg = maker.founderPhoto || "https://images.unsplash.com/photo-1570114668478-439564cbacda?auto=format&fit=crop&q=80&w=800";

  const spotlightProducts = products.slice(0, 3);
  const restProducts = products.slice(3);

  const mappedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: calculateSellingPrice(p.price),
    category: typeof p.category === "object" ? (p.category as any).name : p.category ?? "Craft",
    images: getProductImages(p.images),
    verificationStatus: p.verificationStatus,
  }));

  const mappedSpotlight = mappedProducts.slice(0, 3);
  const mappedRest = mappedProducts.slice(3);

  return (
    <>
      {/* ══════════════ GLOBAL STYLES ══════════════ */}
      <style>{`
        .mp * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Fonts via CSS variables */
        .mp-serif { font-family: var(--font-cormorant, Georgia, serif); }
        .mp-sans  { font-family: var(--font-inter, system-ui, sans-serif); }

        /* Utility */
        .mp-gold   { color: #C9A84C; }
        .mp-cream  { color: #F5F0E8; }
        .mp-muted  { color: rgba(245,240,232,0.45); }
        .mp-label  {
          font-family: var(--font-inter, system-ui);
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 5px; text-transform: uppercase;
          color: rgba(201,168,76,0.65); display: block;
          margin-bottom: 1rem;
        }
        .mp-divider { width: 48px; height: 1.5px; background: #C9A84C; }

        /* Buttons */
        .mp-btn-gold {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 2.2rem; border-radius: 40px; border: none;
          background: #C9A84C; color: #0E0E0E;
          font-family: var(--font-inter, system-ui);
          font-size: 0.68rem; font-weight: 800;
          letter-spacing: 2.5px; text-transform: uppercase;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 8px 28px rgba(201,168,76,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .mp-btn-gold:hover { transform: scale(1.04); box-shadow: 0 14px 38px rgba(201,168,76,0.5); }
        .mp-btn-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 2rem; border-radius: 40px;
          background: transparent; border: 1px solid rgba(201,168,76,0.4);
          color: #C9A84C;
          font-family: var(--font-inter, system-ui);
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }
        .mp-btn-ghost:hover { background: rgba(201,168,76,0.1); transform: scale(1.03); }
        .mp-btn-outline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.8rem; border-radius: 40px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2);
          color: rgba(245,240,232,0.8);
          font-family: var(--font-inter, system-ui);
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s;
          backdrop-filter: blur(10px);
        }
        .mp-btn-outline:hover { background: rgba(255,255,255,0.1); }

        /* Horizontal scroll */
        .mp-hscroll {
          display: flex; gap: 1.5rem;
          overflow-x: auto; padding: 2rem 5vw 3rem;
          scroll-snap-type: x mandatory;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .mp-hscroll::-webkit-scrollbar { display: none; }
        .mp-hscroll-item {
          flex: 0 0 300px; scroll-snap-align: start;
        }

        /* Product spotlight */
        .mp-spotlight {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .mp-spotlight[data-flip="true"] {
          grid-template-areas: "text img";
        }
        .mp-spotlight[data-flip="false"] {
          grid-template-areas: "img text";
        }
        .mp-spotlight-img  { grid-area: img;  min-height: 65vh; position: relative; overflow: hidden; }
        .mp-spotlight-text { grid-area: text; display: flex; flex-direction: column; justify-content: center; padding: 8vh 5vw; }

        /* Ticker */
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .mp-ticker { display: flex; width: max-content; animation: ticker 24s linear infinite; }

        /* Gallery grid */
        .mp-gallery {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto;
          gap: 6px;
        }
        .mp-gallery-hero { grid-column: 1 / 3; grid-row: 1; }
        .mp-gallery-side { grid-column: 3; grid-row: 1 / 3; }

        /* Timeline — uses data-odd attribute to avoid broken nth-child in React */
        .mp-timeline { position: relative; padding: 0 0 2rem; }

        /* Central vertical gold line */
        .mp-timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.35) 8%, rgba(201,168,76,0.35) 92%, transparent 100%);
          transform: translateX(-50%);
        }

        .mp-timeline-item {
          display: grid;
          grid-template-columns: 1fr 60px 1fr;
          align-items: flex-start;
          min-height: 140px;
          position: relative;
        }

        /* Odd items: content on RIGHT side (columns: empty | dot | content) */
        .mp-timeline-item[data-odd="true"]  .mp-tl-a { grid-column: 1; padding: 0 2rem 3rem; text-align: right; }
        .mp-timeline-item[data-odd="true"]  .mp-tl-b { grid-column: 2; display: flex; flex-direction: column; align-items: center; padding-top: 0.5rem; }
        .mp-timeline-item[data-odd="true"]  .mp-tl-c { grid-column: 3; padding: 0 2rem 3rem; }
        /* Even items: content on LEFT side (columns: content | dot | empty) */
        .mp-timeline-item[data-odd="false"] .mp-tl-a { grid-column: 1; padding: 0 2rem 3rem; }
        .mp-timeline-item[data-odd="false"] .mp-tl-b { grid-column: 2; display: flex; flex-direction: column; align-items: center; padding-top: 0.5rem; }
        .mp-timeline-item[data-odd="false"] .mp-tl-c { grid-column: 3; padding: 0 2rem 3rem; text-align: left; }

        .mp-tl-dot {
          width: 16px; height: 16px; border-radius: 50%;
          background: #C9A84C; border: 3px solid #0E0E0E;
          box-shadow: 0 0 0 5px rgba(201,168,76,0.15), 0 0 20px rgba(201,168,76,0.25);
          flex-shrink: 0; z-index: 1;
        }
        .mp-tl-connector {
          flex: 1; width: 1px;
          background: rgba(201,168,76,0.2);
          min-height: 90px;
        }

        /* Stat badge */
        .mp-stat-card {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.15);
          padding: 2rem; text-align: center;
        }

        /* Floating product image animation */
        @keyframes mp-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @media (max-width: 768px) {
          .mp-spotlight { grid-template-columns: 1fr !important; }
          .mp-spotlight[data-flip="true"],
          .mp-spotlight[data-flip="false"] {
            grid-template-areas: "img" "text" !important;
          }
          .mp-spotlight-img { min-height: 55vw; }
          .mp-hscroll-item  { flex: 0 0 82vw; }
          .mp-timeline::before { left: 24px; }
          .mp-timeline-item {
            grid-template-columns: 48px 1fr;
          }
          .mp-timeline-item[data-odd="true"]  .mp-tl-a,
          .mp-timeline-item[data-odd="false"] .mp-tl-c { display: none; }
          .mp-timeline-item[data-odd="true"]  .mp-tl-b,
          .mp-timeline-item[data-odd="false"] .mp-tl-b { grid-column: 1; }
          .mp-timeline-item[data-odd="true"]  .mp-tl-c,
          .mp-timeline-item[data-odd="false"] .mp-tl-a { grid-column: 2; text-align: left; padding-left: 1.5rem; }
          .mp-gallery  { grid-template-columns: 1fr 1fr; }
          .mp-gallery-hero { grid-column: 1 / -1; }
          .mp-gallery-side { grid-column: 1 / -1; grid-row: auto; }
        }
      `}</style>

      <div className="mp" style={{ background: "#0E0E0E", color: "#F5F0E8", overflowX: "hidden" }}>

        {/* SCROLL PROGRESS LINE */}
        <motion.div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg,#C9A84C,#F0D080,#C9A84C)",
          scaleX: lineScale, transformOrigin: "0%", zIndex: 9999,
        }} />

        {/* TOAST */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              style={{
                position: "fixed", top: "5.5rem", right: "2rem", zIndex: 9998,
                background: "#0D1A14", color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.45)",
                padding: "0.85rem 1.8rem", borderRadius: "40px",
                fontFamily: "var(--font-inter,system-ui)", fontSize: "0.68rem",
                fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
              }}
            >✨ {toast}</motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 1 — CINEMATIC HERO                       */}
        {/* ═══════════════════════════════════════════════ */}
        <div ref={heroRef} style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
          <motion.div style={{
            position: "absolute", inset: "-15%",
            backgroundImage: `url("${cover}")`,
            backgroundSize: "cover", backgroundPosition: "center",
            y: heroImgY,
          }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(14,14,14,1) 0%,rgba(14,14,14,0.55) 45%,rgba(14,14,14,0.1) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(14,14,14,0.55) 0%,transparent 65%)" }} />

          <motion.div style={{ position: "absolute", bottom: "7vh", left: 0, padding: "0 5vw", y: heroTextY, opacity: heroOpacity, maxWidth: "940px" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.45)",
                backdropFilter: "blur(12px)", padding: "0.4rem 1.2rem", borderRadius: "40px",
                marginBottom: "1.8rem",
                fontFamily: "var(--font-inter,system-ui)", fontSize: "0.6rem", fontWeight: 700,
                letterSpacing: "2.5px", textTransform: "uppercase", color: "#C9A84C",
              }}
            >
              {maker.verificationStatus === "ELITE" ? "⭐ Atelier Elite" : maker.verificationStatus === "GI" ? "🏛️ GI Protected" : "✓ Heritage Verified"}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.1 }}
              className="mp-serif mp-cream"
              style={{ fontSize: "clamp(3.8rem, 9vw, 11rem)", fontWeight: 300, lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: "2.2rem" }}
            >
              {maker.businessName}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.9 }}
              style={{ display: "flex", gap: "2.5rem", alignItems: "center", marginBottom: "2.8rem", flexWrap: "wrap" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid #C9A84C", overflow: "hidden", flexShrink: 0 }}>
                  <img src={founderImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <span className="mp-label" style={{ marginBottom: "0.1rem" }}>Custodian</span>
                  <span className="mp-serif mp-cream" style={{ fontSize: "1.1rem", display: "block" }}>{maker.founderName || "Master Artisan"}</span>
                </div>
              </div>
              <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.15)" }} />
              <div>
                <span className="mp-label" style={{ marginBottom: "0.1rem" }}>Origin</span>
                <span className="mp-serif mp-cream" style={{ fontSize: "1.1rem", display: "block" }}>📍 {maker.country}</span>
              </div>
              <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.15)" }} />
              <div>
                <span className="mp-label" style={{ marginBottom: "0.1rem" }}>Est.</span>
                <span className="mp-serif mp-cream" style={{ fontSize: "1.1rem", display: "block" }}>{maker.yearsInBusiness} Yrs Ago</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}
            >
              <a href="#collection" className="mp-btn-gold">Explore {products.length} Works ↓</a>
              <button
                className="mp-btn-outline"
                onClick={() => { setSaved(!saved); showToast(saved ? `Removed ${maker.businessName}` : `Following ${maker.businessName}`); }}
              >
                {saved ? "♥ Following" : "♡ Follow"}
              </button>
              <button className="mp-btn-ghost" onClick={() => setCertOpen(true)}>📜 Passport</button>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", textAlign: "center", color: "rgba(255,255,255,0.25)" }}
          >
            <div className="mp-sans" style={{ fontSize: "0.55rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.4rem" }}>Scroll</div>
            <div>↓</div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* TICKER STRIP                                   */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "#0E0E0E", borderTop: "1px solid rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.1)", overflow: "hidden" }}>
          <div className="mp-ticker">
            {["⭐ Atelier Elite", "🛡️ Cryptographic Passport", "📍 GPS Geofenced", "🤝 95% Patron Direct", "📜 GI Appellation", "🌍 Generational Heritage",
              "⭐ Atelier Elite", "🛡️ Cryptographic Passport", "📍 GPS Geofenced", "🤝 95% Patron Direct", "📜 GI Appellation", "🌍 Generational Heritage"].map((t, i) => (
              <span key={i} className="mp-sans mp-gold" style={{ display: "inline-block", padding: "1rem 2.8rem", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ZONES 2 + 3 — CHAPTER TITLE + STICKY BIOGRAPHY — ONE BACKGROUND   */}
        {/* Both inside one wrapper so there is zero visual seam between them   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ background: "#111" }}>

          {/* CHAPTER TITLE */}
          <div style={{ padding: "13vh 5vw 6vh" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <motion.span className="mp-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>The Artisan</motion.span>
              <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(3.5rem, 8vw, 10rem)", fontWeight: 300, lineHeight: 0.9, letterSpacing: "-0.02em" }}>
                <WordReveal text="A Legacy" />
                <br />
                <motion.em
                  initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.4, duration: 1 }}
                  style={{ color: "#C9A84C", fontStyle: "italic" }}
                >
                  forged by hand.
                </motion.em>
              </h2>
            </div>
          </div>

          {/* STICKY BIOGRAPHY — flex + align-items:flex-start required for sticky to work */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {/* LEFT — STICKY portrait */}
            <div style={{ position: "sticky", top: 0, width: "50%", flexShrink: 0, height: "100vh", overflow: "hidden" }}>
              <img src={founderImg} alt={maker.founderName || ""} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(17,17,17,0) 60%,#111 100%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(17,17,17,0.85) 0%,transparent 40%)" }} />

              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.9 }}
                style={{
                  position: "absolute", bottom: "3rem", left: "2.5rem",
                  background: "rgba(14,14,14,0.9)", border: "1px solid rgba(201,168,76,0.3)",
                  backdropFilter: "blur(20px)", padding: "1.6rem 2rem", borderRadius: "2px",
                }}
              >
                <div className="mp-serif mp-gold" style={{ fontSize: "clamp(3.5rem, 6vw, 6rem)", fontWeight: 300, lineHeight: 1 }}>{maker.yearsInBusiness}</div>
                <div className="mp-sans mp-gold" style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginTop: "0.3rem", opacity: 0.7 }}>Years of Craft</div>
              </motion.div>
            </div>

            {/* RIGHT — biography scrolls alongside */}
            <div style={{ flex: 1, padding: "11vh 5vw 11vh 4vw", display: "flex", flexDirection: "column", gap: "3.5rem" }}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeRight}>
                <div className="mp-divider" style={{ marginBottom: "2rem" }} />
                <p className="mp-serif mp-cream" style={{ fontSize: "clamp(1.25rem,2vw,1.8rem)", lineHeight: 1.75, fontWeight: 300, marginBottom: "1.8rem" }}>
                  {maker.founderStory || "Our studio atelier has operated for generations, combining hand-selected raw materials with ancient techniques passed down through centuries of family tradition."}
                </p>
                <p className="mp-sans mp-muted" style={{ fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "2rem" }}>
                  {maker.businessStory || "Every creation that leaves our atelier undergoes strict hand inspection to ensure durability, authenticity, and cultural integrity that stands apart from mass-produced goods."}
                </p>
                <div style={{ borderLeft: "2px solid rgba(201,168,76,0.4)", paddingLeft: "1.4rem" }}>
                  <p className="mp-serif" style={{ fontSize: "1.2rem", lineHeight: 1.75, color: "rgba(245,240,232,0.7)", fontStyle: "italic" }}>
                    "{maker.impactStory || "95% of every transaction flows directly to the artisan family. Every purchase is an act of cultural preservation."}"
                  </p>
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeRight}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(201,168,76,0.1)" }}
              >
                {[
                  { v: `${maker.yearsInBusiness}+`, l: "Years Active" },
                  { v: `${maker.employeeCount || 12}`, l: "Artisans" },
                  { v: `${products.length}`, l: "Masterworks" },
                  { v: "4.9 ★", l: "Rating" },
                ].map((s, i) => (
                  <div key={i} className="mp-stat-card">
                    <div className="mp-serif mp-gold" style={{ fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 300, lineHeight: 1 }}>{s.v}</div>
                    <div className="mp-sans mp-muted" style={{ fontSize: "0.58rem", letterSpacing: "3px", textTransform: "uppercase", marginTop: "0.4rem" }}>{s.l}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeRight}
                style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}
              >
                <a href="#collection" className="mp-btn-gold">Acquire Works</a>
                <button className="mp-btn-ghost" onClick={() => setCertOpen(true)}>View Passport</button>
              </motion.div>
            </div>
          </div>

        </div>{/* end zone 2+3 */}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ZONES 4 + 5 — COLLECTION TITLE + PRODUCT SPOTLIGHTS — ONE BG     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div id="collection" style={{ background: "#0E0E0E" }}>

          {/* COLLECTION CHAPTER TITLE */}
          <div style={{ padding: "13vh 5vw 0" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <motion.span className="mp-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Acquire Masterworks</motion.span>
              <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(3rem, 7vw, 9rem)", fontWeight: 300, lineHeight: 0.9, letterSpacing: "-0.02em" }}>
                <WordReveal text={maker.businessName} />
                <br />
                <motion.em
                  initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.4, duration: 1 }}
                  style={{ color: "#C9A84C" }}
                >
                  Collection.
                </motion.em>
              </h2>
            </div>
          </div>

          {/* PRODUCT SPOTLIGHTS — inside same #0E0E0E zone */}
          {mappedSpotlight.map((product, idx) => {
            const flip = idx % 2 !== 0;
            const overlayBg = idx === 1 ? "rgba(13,26,20,0.95)" : "#0E0E0E";
            const img = product.images[0] || "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200";

            return (
              <div key={product.id} style={{ background: idx === 1 ? "#0D1A14" : "#0E0E0E" }}>
                <div className="mp-spotlight" data-flip={String(flip)}>

                  {/* Image panel — float animation + scale-in reveal */}
                  <motion.div
                    className="mp-spotlight-img"
                    initial={{ opacity: 0, scale: 1.08 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.4, ease: [0.16,1,0.3,1] }}
                  >
                    {/* Floating image inside — subtle perpetual bob */}
                    <motion.img
                      src={img} alt={product.name}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: flip
                        ? `linear-gradient(to left, transparent 50%, ${idx === 1 ? "#0D1A14" : "#0E0E0E"} 100%)`
                        : `linear-gradient(to right, transparent 50%, ${idx === 1 ? "#0D1A14" : "#0E0E0E"} 100%)`,
                    }} />
                    {/* Product number */}
                    <div style={{
                      position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
                      fontFamily: "var(--font-cormorant,Georgia,serif)",
                      fontSize: "clamp(6rem,12vw,14rem)", fontWeight: 300,
                      color: "rgba(201,168,76,0.07)", lineHeight: 1,
                      userSelect: "none", pointerEvents: "none",
                    }}>
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </motion.div>

                  {/* Text panel — stagger from direction */}
                  <motion.div
                    className="mp-spotlight-text"
                    initial={{ opacity: 0, x: flip ? -80 : 80, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.0, ease: [0.16,1,0.3,1], delay: 0.15 }}
                  >
                    <span className="mp-label">{product.category} · No. {idx + 1}</span>
                    <h3 className="mp-serif mp-cream" style={{ fontSize: "clamp(2rem,4vw,5rem)", fontWeight: 300, lineHeight: 1.05, marginBottom: "1.4rem" }}>
                      {product.name}
                    </h3>
                    <div className="mp-divider" style={{ marginBottom: "1.8rem" }} />
                    <p className="mp-sans mp-muted" style={{ fontSize: "0.9rem", lineHeight: 1.9, marginBottom: "2.2rem" }}>
                      Handcrafted in {maker.country} by {maker.founderName || "Master Artisan"}.
                      Each acquisition includes a full cryptographic provenance passport.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.2rem" }}>
                      <div>
                        <span className="mp-label" style={{ marginBottom: "0.2rem" }}>Acquisition Price</span>
                        <motion.div
                          className="mp-serif mp-gold"
                          initial={{ opacity: 0, scale: 0.7 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4, duration: 0.7, ease: "backOut" }}
                          style={{ fontSize: "2.4rem", fontWeight: 300 }}
                        >
                          £{product.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </motion.div>
                      </div>
                      <div style={{ padding: "0.35rem 0.9rem", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "40px" }}>
                        <span className="mp-sans mp-gold" style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                          {product.verificationStatus}
                        </span>
                      </div>
                    </div>
                    <Link href={`/products/${product.id}`} className="mp-btn-gold" style={{ alignSelf: "flex-start" }}>
                      Acquire This Work →
                    </Link>
                  </motion.div>

                </div>
              </div>
            );
          })}

        </div>{/* end zones 4+5 */}

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 6 — HORIZONTAL SCROLL COLLECTION         */}
        {/* All remaining products as dark luxury cards    */}
        {/* ═══════════════════════════════════════════════ */}
        {mappedRest.length > 0 && (
          <div style={{ background: "#0A0A0A", paddingTop: "6vh" }}>
            <div style={{ padding: "0 5vw 3vh" }}>
              <motion.span className="mp-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Full Collection</motion.span>
              <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="mp-serif mp-cream" style={{ fontSize: "clamp(2rem,4vw,4.5rem)", fontWeight: 300 }}
              >
                All {products.length} Works
              </motion.h2>
            </div>
            <div className="mp-hscroll">
              {mappedRest.map((product, idx) => (
                <motion.div
                  key={product.id}
                  className="mp-hscroll-item"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: idx * 0.04, duration: 0.7 }}
                >
                  <DarkProductCard product={product} maker={{ businessName: maker.businessName, country: maker.country }} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 7 — TRANSPARENCY MANIFESTO               */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "#0D1A14", padding: "14vh 5vw", position: "relative", overflow: "hidden" }}>
          {/* Ghost background word */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            fontSize: "clamp(6rem,18vw,22rem)", fontFamily: "var(--font-cormorant,Georgia,serif)",
            fontWeight: 300, color: "rgba(201,168,76,0.03)", whiteSpace: "nowrap",
            pointerEvents: "none", userSelect: "none", lineHeight: 1,
          }}>PATRON</div>

          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} style={{ textAlign: "center", marginBottom: "9vh" }}>
              <span className="mp-label" style={{ display: "block", textAlign: "center" }}>Patron Direct Transparency</span>
              <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2.5rem,5vw,7rem)", fontWeight: 300, lineHeight: 1, marginBottom: "1.8rem" }}>
                <span className="mp-gold">95%</span> flows directly<br />
                to {maker.founderName || "the artisan"}.
              </h2>
              <p className="mp-sans mp-muted" style={{ fontSize: "0.95rem", maxWidth: "580px", margin: "0 auto", lineHeight: 1.9 }}>
                The Britsync Patron Direct Escrow ensures no intermediary takes more than 5%. Every purchase is a direct act of cultural support.
              </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: "rgba(201,168,76,0.1)" }}>
              {[
                { icon: "🏠", label: "Studio", value: maker.businessName },
                { icon: "📍", label: "Origin", value: maker.country },
                { icon: "💰", label: "Direct Payout", value: "95%" },
                { icon: "🟢", label: "Audit Grade", value: "A+" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
                  variants={i % 2 === 0 ? fadeLeft : fadeRight}
                  style={{ background: "#0D1A14", padding: "2.5rem 1.8rem", textAlign: "center" }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{item.icon}</div>
                  <span className="mp-label" style={{ display: "block", textAlign: "center" }}>{item.label}</span>
                  <div className="mp-serif mp-cream" style={{ fontSize: "1.2rem", fontWeight: 400 }}>{item.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 8 — HERITAGE TIMELINE                    */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "#0E0E0E", padding: "12vh 5vw" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ marginBottom: "8vh" }}>
              <span className="mp-label">Lineage & Milestones</span>
              <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2.5rem,5vw,6.5rem)", fontWeight: 300 }}>
                The Heritage<br /><em className="mp-gold">Timeline</em>
              </h2>
            </motion.div>

            {/* Fixed timeline using data-odd attribute */}
            <div className="mp-timeline">
              {[
                { year: `${maker.yearsInBusiness} Yrs Ago`, title: "Workshop Foundation", desc: "First guild tools forged. Workshop established with founding family traditions." },
                { year: "2nd Generation", title: "Master Apprenticeship", desc: "Techniques codified and passed down. Formula documentation preserved." },
                { year: "2023", title: "Britsync Registry", desc: "Passed geofence & ethics audit. Grade A+ certified on first review." },
                { year: "Present", title: "Elite Atelier Status", desc: "Global provenance passports. Patron direct escrow. Heritage elite tier." },
              ].map((item, i) => {
                const isOdd = i % 2 === 0; // 0,2 = odd items; 1,3 = even items
                return (
                  <div key={i} className="mp-timeline-item" data-odd={String(isOdd)}>
                    {/* Column A: right-side content for odd rows, empty for even rows */}
                    <div className="mp-tl-a">
                      {!isOdd && (
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeRight}>
                          <div className="mp-serif mp-gold" style={{ fontSize: "clamp(1.2rem,2vw,1.7rem)", fontWeight: 300, marginBottom: "0.4rem" }}>{item.year}</div>
                          <h4 className="mp-serif mp-cream" style={{ fontSize: "1.25rem", fontWeight: 400, marginBottom: "0.5rem" }}>{item.title}</h4>
                          <p className="mp-sans mp-muted" style={{ fontSize: "0.85rem", lineHeight: 1.8 }}>{item.desc}</p>
                        </motion.div>
                      )}
                    </div>

                    {/* Column B: gold dot + connector line */}
                    <div className="mp-tl-b">
                      <motion.div
                        className="mp-tl-dot"
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "backOut" }}
                      />
                      {i < 3 && <div className="mp-tl-connector" />}
                    </div>

                    {/* Column C: left-side content for odd rows, empty for even rows */}
                    <div className="mp-tl-c">
                      {isOdd && (
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeLeft}>
                          <div className="mp-serif mp-gold" style={{ fontSize: "clamp(1.2rem,2vw,1.7rem)", fontWeight: 300, marginBottom: "0.4rem" }}>{item.year}</div>
                          <h4 className="mp-serif mp-cream" style={{ fontSize: "1.25rem", fontWeight: 400, marginBottom: "0.5rem" }}>{item.title}</h4>
                          <p className="mp-sans mp-muted" style={{ fontSize: "0.85rem", lineHeight: 1.8 }}>{item.desc}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 9 — VISUAL ARCHIVE (gallery)             */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "#0A0A0A", padding: "10vh 5vw" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "4vh" }}
            >
              <div>
                <span className="mp-label">Visual Archive</span>
                <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2.5rem,5vw,6rem)", fontWeight: 300 }}>
                  Inside the<br /><em className="mp-gold">Atelier</em>
                </h2>
              </div>
              {/* Gallery tabs */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[
                  { id: "workshop", label: "Workshop" },
                  { id: "team", label: "Craftsmen" },
                  { id: "production", label: "Production" },
                  { id: "lifestyle", label: "Heritage" },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="mp-sans"
                    style={{
                      padding: "0.55rem 1.4rem", borderRadius: "40px", cursor: "pointer",
                      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "2px",
                      textTransform: "uppercase", border: "none",
                      background: activeTab === tab.id ? "#C9A84C" : "rgba(255,255,255,0.07)",
                      color: activeTab === tab.id ? "#0E0E0E" : "rgba(245,240,232,0.5)",
                      transition: "all 0.25s",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
                className="mp-gallery"
              >
                {galleryPhotos.slice(0, 5).map((img, i) => {
                  const isHero = i === 0;
                  const isSide = i === 1;
                  const classes = isHero ? "mp-gallery-hero" : isSide ? "mp-gallery-side" : "";
                  return (
                    <motion.div
                      key={img + i}
                      className={classes}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLightbox(img)}
                      style={{
                        cursor: "pointer", overflow: "hidden", borderRadius: "2px",
                        aspectRatio: isHero ? "16/9" : isSide ? "3/4" : "4/3",
                        position: "relative",
                      }}
                    >
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)" }} />
                      <div style={{ position: "absolute", bottom: "0.8rem", left: "1rem" }}>
                        <span className="mp-sans mp-gold" style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                          🔍 #{i + 1}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 10 — CERTIFICATIONS (ALL DARK)           */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "#0E0E0E", padding: "10vh 5vw" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: "center", marginBottom: "6vh" }}>
              <span className="mp-label" style={{ display: "block", textAlign: "center" }}>Provenance Registry</span>
              <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2.5rem,5vw,6rem)", fontWeight: 300 }}>
                Certifications &amp;<br /><em className="mp-gold">Audits</em>
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeLeft}
                style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "2px", padding: "3rem" }}
              >
                <h3 className="mp-serif mp-cream" style={{ fontSize: "1.6rem", fontWeight: 400, marginBottom: "2rem" }}>Audit History</h3>
                {[
                  { date: "Oct 2025", score: "98/100", status: "Current Elite Tier" },
                  { date: "Oct 2024", score: "97/100", status: "Annual Renewal" },
                  { date: "Sep 2023", score: "94/100", status: "Initial Approved" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.2rem", marginBottom: "1.2rem", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div>
                      <div className="mp-sans mp-cream" style={{ fontWeight: 600, fontSize: "0.92rem" }}>{r.date}</div>
                      <div className="mp-sans mp-muted" style={{ fontSize: "0.75rem", marginTop: "0.15rem" }}>{r.status}</div>
                    </div>
                    <div className="mp-serif mp-gold" style={{ fontSize: "1.6rem", fontWeight: 300 }}>{r.score}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeRight}
                style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "2px", padding: "3rem" }}
              >
                <h3 className="mp-serif mp-cream" style={{ fontSize: "1.6rem", fontWeight: 400, marginBottom: "2rem" }}>Active Compliance</h3>
                <div className="mp-sans mp-muted" style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  <p>✓ <span className="mp-cream" style={{ fontWeight: 600 }}>GI Status:</span> Protected Regional Appellation</p>
                  <p>✓ <span className="mp-cream" style={{ fontWeight: 600 }}>GPS Geofence:</span> Workshop verified on-site</p>
                  <p>✓ <span className="mp-cream" style={{ fontWeight: 600 }}>Cryptographic Ledger:</span> Provenance passports active</p>
                  <p>✓ <span className="mp-cream" style={{ fontWeight: 600 }}>Patron Escrow:</span> 95% direct payout guaranteed</p>
                </div>
                <button className="mp-btn-gold" onClick={() => setCertOpen(true)} style={{ marginTop: "2.5rem" }}>
                  📄 Provenance Passport
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 11 — PATRON REVIEWS (ALL DARK)           */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "#0A0A0A", padding: "10vh 5vw" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: "center", marginBottom: "6vh" }}>
              <span className="mp-label" style={{ display: "block", textAlign: "center" }}>Patron Voices</span>
              <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2.5rem,5vw,6rem)", fontWeight: 300 }}>
                Reviews &amp;<br /><em className="mp-gold">Ratings</em>
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "4rem", alignItems: "start" }}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeScale} style={{ textAlign: "center" }}>
                <div className="mp-serif mp-gold" style={{ fontSize: "clamp(4rem,8vw,7rem)", fontWeight: 300, lineHeight: 1 }}>4.9</div>
                <div style={{ color: "#C9A84C", fontSize: "1.1rem", margin: "0.4rem 0" }}>⭐⭐⭐⭐⭐</div>
                <div className="mp-sans mp-muted" style={{ fontSize: "0.75rem" }}>48 Verified</div>
              </motion.div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {[
                  { name: "Lord Alistair P.", date: "Nov 2025", text: "Acquired a masterpiece. The cryptographic passport and physical quality are unrivaled. Exceptional craft." },
                  { name: "Sophia K.", date: "Oct 2025", text: "Knowing 95% of my purchase funds the artisan family directly makes this creation priceless." },
                  { name: "Marcus V.", date: "Sep 2025", text: "Museum-grade quality. The provenance documentation exceeds every expectation." },
                ].map((r, i) => (
                  <motion.div key={i}
                    initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
                    variants={i % 2 === 0 ? fadeLeft : fadeRight}
                    style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "2px", padding: "1.8rem 2.2rem" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.7rem" }}>
                      <strong className="mp-sans mp-cream" style={{ fontSize: "0.92rem" }}>{r.name}</strong>
                      <span style={{ color: "#C9A84C" }}>⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="mp-serif mp-muted" style={{ fontSize: "1.1rem", lineHeight: 1.75, fontStyle: "italic", marginBottom: "0.6rem" }}>
                      "{r.text}"
                    </p>
                    <span className="mp-sans" style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.25)" }}>Verified Patron · {r.date}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 12 — ORIGIN MAP (ALL DARK)              */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "#0E0E0E", padding: "10vh 5vw" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "5vw", alignItems: "center" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeLeft}>
              <span className="mp-label">Geographic Provenance</span>
              <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2rem,4vw,5rem)", fontWeight: 300, marginBottom: "1.5rem" }}>
                Origin &amp;<br />Atelier Location
              </h2>
              <p className="mp-sans mp-muted" style={{ lineHeight: 1.9, marginBottom: "2rem", fontSize: "0.9rem" }}>
                Rooted in {maker.country}. Every check-in GPS-audited and logged — guaranteeing authentic regional provenance and cultural custodianship.
              </p>
              <div className="mp-sans mp-muted" style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.88rem" }}>
                <div><span className="mp-cream" style={{ fontWeight: 600 }}>Region:</span> {maker.country} Heritage District</div>
                <div><span className="mp-cream" style={{ fontWeight: 600 }}>GPS:</span> ✅ Verified On-Site</div>
                <div><span className="mp-cream" style={{ fontWeight: 600 }}>Escrow:</span> 95% Direct to Artisan</div>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeRight}
              style={{ borderRadius: "2px", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", position: "relative", aspectRatio: "4/3" }}
            >
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" alt="Map" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.2) 60%)" }} />
              <div style={{ position: "absolute", bottom: "2rem", left: "2rem" }}>
                <span className="mp-label">📍 Verified Atelier</span>
                <div className="mp-serif mp-cream" style={{ fontSize: "1.8rem", fontWeight: 300 }}>{maker.businessName}</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 13 — RELATED STORIES (ALL DARK)         */}
        {/* ═══════════════════════════════════════════════ */}
        {storiesList.length > 0 && (
          <div style={{ background: "#0A0A0A", padding: "10vh 5vw" }}>
            <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ marginBottom: "5vh" }}>
                <span className="mp-label">Artisan Chronicles</span>
                <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2.5rem,5vw,6rem)", fontWeight: 300 }}>
                  Related <em className="mp-gold">Stories</em>
                </h2>
              </motion.div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
                {storiesList.map((story, i) => (
                  <Link href={`/stories/${story.id}`} key={story.id} style={{ textDecoration: "none" }}>
                    <motion.div
                      initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
                      variants={i % 2 === 0 ? fadeLeft : fadeRight}
                      whileHover={{ y: -5 }}
                      style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}
                    >
                      <div style={{ height: "220px", overflow: "hidden" }}>
                        <img src={story.heroImage} alt={story.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} />
                      </div>
                      <div style={{ padding: "1.8rem" }}>
                        <span className="mp-label">{story.craft} · {story.country}</span>
                        <h3 className="mp-serif mp-cream" style={{ fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.7rem" }}>{story.title}</h3>
                        <p className="mp-sans mp-muted" style={{ fontSize: "0.85rem", lineHeight: 1.75 }}>{story.excerpt}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* SCENE 14 — SIMILAR ATELIERS (ALL DARK)        */}
        {/* ═══════════════════════════════════════════════ */}
        {similarMakers.length > 0 && (
          <div style={{ background: "#0E0E0E", padding: "8vh 5vw" }}>
            <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ marginBottom: "5vh" }}>
                <span className="mp-label">Heritage Registry</span>
                <h2 className="mp-serif mp-cream" style={{ fontSize: "clamp(2.5rem,5vw,6rem)", fontWeight: 300 }}>
                  Similar <em className="mp-gold">Ateliers</em>
                </h2>
              </motion.div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.5rem" }}>
                {similarMakers.map((sm, i) => (
                  <Link href={`/makers/${sm.id}`} key={sm.id} style={{ textDecoration: "none" }}>
                    <motion.div
                      initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
                      variants={[fadeLeft, fadeUp, fadeRight, fadeScale][i % 4]}
                      whileHover={{ y: -5 }}
                      style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}
                    >
                      <div style={{ height: "165px", overflow: "hidden" }}>
                        <img src={sm.heroImage} alt={sm.businessName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "1.3rem 1.5rem" }}>
                        <span className="mp-label" style={{ marginBottom: "0.3rem" }}>📍 {sm.country}</span>
                        <h3 className="mp-serif mp-cream" style={{ fontSize: "1.25rem", fontWeight: 400, marginBottom: "0.2rem" }}>{sm.businessName}</h3>
                        <div className="mp-sans mp-muted" style={{ fontSize: "0.75rem" }}>{sm.productCount} Masterworks</div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* FOOTER BRIDGE — dark → footer color gradient   */}
        {/* Prevents hard cut from dark page to white footer */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ background: "linear-gradient(180deg,#0E0E0E 0%,#FAF9F5 100%)", height: "120px" }} />

        {/* ══ CINEMATIC LIGHTBOX ══ */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)",
                backdropFilter: "blur(20px)", display: "flex",
                alignItems: "center", justifyContent: "center",
                zIndex: 100000, padding: "2rem", cursor: "pointer",
              }}
            >
              <motion.img
                src={lightbox} alt=""
                initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "2px", cursor: "default", boxShadow: "0 40px 80px rgba(0,0,0,0.9)" }}
              />
              <button onClick={() => setLightbox(null)} style={{
                position: "absolute", top: "2rem", right: "2rem",
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#F5F0E8", width: 46, height: 46, borderRadius: "50%",
                cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ PROVENANCE PASSPORT MODAL ══ */}
        <AnimatePresence>
          {certOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
                backdropFilter: "blur(15px)", display: "flex",
                alignItems: "center", justifyContent: "center",
                zIndex: 99999, padding: "2rem",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ maxWidth: "780px", width: "100%", maxHeight: "90vh", overflowY: "auto", background: "#141414", borderRadius: "2px", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1.4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <button onClick={() => window.print()} className="mp-btn-gold" style={{ fontSize: "0.62rem" }}>🖨️ Print / PDF</button>
                  <button onClick={() => setCertOpen(false)} className="mp-sans mp-muted" style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: "0.85rem" }}>Close</button>
                </div>

                <div style={{ padding: "4rem 3.5rem", textAlign: "center", margin: "1.5rem", border: "6px double rgba(201,168,76,0.4)" }}>
                  <span className="mp-label" style={{ display: "block", textAlign: "center", letterSpacing: "8px" }}>Britsync</span>
                  <div className="mp-sans mp-muted" style={{ fontSize: "0.5rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "3rem" }}>Global Heritage Registry</div>
                  <h1 className="mp-serif mp-cream" style={{ fontSize: "2.4rem", fontWeight: 300, fontStyle: "italic", marginBottom: "1.5rem" }}>
                    Registry of Heritage Provenance
                  </h1>
                  <div style={{ width: "50px", height: "1.5px", background: "#C9A84C", margin: "0 auto 2.5rem" }} />
                  <p className="mp-sans mp-muted" style={{ fontSize: "0.9rem", lineHeight: 1.9, maxWidth: "480px", margin: "0 auto 3rem" }}>
                    This document certifies that <span className="mp-cream" style={{ fontWeight: 600 }}>{maker.businessName}</span>, founded by <span className="mp-cream" style={{ fontWeight: 600 }}>{maker.founderName || "Master Artisan"}</span> in <span className="mp-cream" style={{ fontWeight: 600 }}>{maker.country}</span>, has passed geofence auditing, labor ethics, and materials authenticity verification.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", textAlign: "left", maxWidth: "520px", margin: "0 auto 3rem" }}>
                    {[
                      { l: "Maker ID", v: `BS-${maker.id.substring(0,6).toUpperCase()}` },
                      { l: "Origin", v: `${maker.country} (Reg.)` },
                      { l: "Audit Grade", v: "98/100 AQL" },
                      { l: "Status", v: "Elite Active" },
                    ].map((f, i) => (
                      <div key={i}>
                        <span className="mp-label" style={{ marginBottom: "0.3rem" }}>{f.l}</span>
                        <div className="mp-serif mp-cream" style={{ fontSize: "1.1rem" }}>{f.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
                    {["🛡️ Human Verified", "📍 GPS Audited", "⭐ Britsync Elite"].map((t, i) => (
                      <span key={i} className="mp-sans mp-gold" style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
