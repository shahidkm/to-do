import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Performance", path: "/performance-dashboard" },
  { label: "Rewards", path: "/reward-dashboard" },
  { label: "Plans", path: "/plans" },
  { label: "Inspirations", path: "/inspirations" },
  { label: "Previous", path: "/previous-todos" },
  { label: "Achievements", path: "/achievements" },
  { label: "Friends", path: "/freinds" },
  { label: "Money Vault", path: "/money" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

.nb-wrap {
  font-family: 'Rajdhani', sans-serif;
  position: relative;
  z-index: 100;
}

/* Glassmorphism bar */
.nb-bar {
  background: rgba(6, 9, 19, 0.85);
  border-bottom: 1px solid rgba(0, 229, 255, 0.15);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(0,229,255,0.08) inset;
}

/* Logo */
.nb-logo {
  font-family: 'Orbitron', monospace;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.12em;
  background: linear-gradient(90deg, #00e5ff 0%, #fff 45%, #7c4dff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: nbShimmer 3.5s linear infinite;
  cursor: pointer;
  transition: transform 0.2s;
  text-decoration: none;
}
.nb-logo:hover { transform: scale(1.04); }

@keyframes nbShimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

/* Desktop nav link */
.nb-link {
  font-family: 'Rajdhani', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(180, 210, 255, 0.7);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 7px 14px;
  border-radius: 10px;
  position: relative;
  transition: color 0.2s, background 0.2s, transform 0.15s;
  white-space: nowrap;
}
.nb-link::after {
  content: '';
  position: absolute;
  bottom: 4px; left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%; height: 2px;
  background: linear-gradient(90deg, #00e5ff, #7c4dff);
  border-radius: 2px;
  transition: transform 0.2s cubic-bezier(.22,1,.36,1);
}
.nb-link:hover {
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.07);
  transform: translateY(-1px);
}
.nb-link:hover::after { transform: translateX(-50%) scaleX(1); }

/* Active link */
.nb-link.nb-active {
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.22);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.15);
}
.nb-link.nb-active::after { transform: translateX(-50%) scaleX(1); }

/* Hamburger button */
.nb-burger {
  background: rgba(0, 229, 255, 0.07);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  color: #00e5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.nb-burger:hover {
  background: rgba(0, 229, 255, 0.14);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.25);
  transform: scale(1.06);
}

/* Mobile dropdown */
.nb-mobile {
  background: rgba(6, 9, 19, 0.98);
  border-top: 1px solid rgba(0, 229, 255, 0.1);
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 10px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: nbDropDown 0.28s cubic-bezier(.22,1,.36,1) both;
}
@keyframes nbDropDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Mobile link */
.nb-mob-link {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.07em;
  color: rgba(180, 210, 255, 0.7);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 12px;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.nb-mob-link::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #00e5ff, #7c4dff);
  border-radius: 0 2px 2px 0;
  transform: scaleY(0);
  transition: transform 0.2s cubic-bezier(.22,1,.36,1);
}
.nb-mob-link:hover {
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.07);
  transform: translateX(4px);
}
.nb-mob-link:hover::before { transform: scaleY(1); }
.nb-mob-link.nb-active {
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.09);
  border: 1px solid rgba(0, 229, 255, 0.18);
}
.nb-mob-link.nb-active::before { transform: scaleY(1); }

/* Dot indicator (active) */
.nb-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 8px #00e5ff;
  flex-shrink: 0;
  margin-left: auto;
}

/* Scan line on the bar */
@keyframes nbScan {
  0%   { left: -20%; }
  100% { left: 110%; }
}
.nb-scan::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 18%;
  background: linear-gradient(90deg, transparent, rgba(0,229,255,0.06), transparent);
  animation: nbScan 5s linear infinite;
  pointer-events: none;
}
`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <style>{CSS}</style>
      <div className="nb-wrap">
        <div className="nb-bar nb-scan" style={{ position: "relative" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

            {/* ── LOGO ─────────────────────────────────────────────────── */}
            <span className="nb-logo" onClick={() => handleNavigate("/")}>
              ◈ SHAHID KM
            </span>

            {/* ── DESKTOP LINKS ─────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="nb-desktop-links">
              {NAV_LINKS.map(({ label, path }) => (
                <button
                  key={path}
                  className={`nb-link ${isActive(path) ? "nb-active" : ""}`}
                  onClick={() => handleNavigate(path)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── HAMBURGER ────────────────────────────────────────────── */}
            <button
              className="nb-burger nb-mobile-only"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                /* X icon */
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN ───────────────────────────────────────────── */}
        {isOpen && (
          <div className="nb-mobile">
            {NAV_LINKS.map(({ label, path }) => (
              <button
                key={path}
                className={`nb-mob-link ${isActive(path) ? "nb-active" : ""}`}
                onClick={() => handleNavigate(path)}
              >
                <span style={{
                  fontFamily: "Orbitron, monospace",
                  fontSize: 9,
                  color: isActive(path) ? "#00e5ff" : "rgba(0,229,255,0.3)",
                  letterSpacing: "0.1em",
                  minWidth: 18,
                }}>
                  {String(NAV_LINKS.findIndex(l => l.path === path) + 1).padStart(2, "0")}
                </span>
                {label}
                {isActive(path) && <span className="nb-dot" />}
              </button>
            ))}
          </div>
        )}

        {/* Responsive hide/show via inline media query */}
        <style>{`
          .nb-desktop-links { display: flex; }
          .nb-mobile-only   { display: none; }
          @media (max-width: 860px) {
            .nb-desktop-links { display: none !important; }
            .nb-mobile-only   { display: flex !important; }
          }
        `}</style>
      </div>
    </>
  );
}