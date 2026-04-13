import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/useAuth";

export default function Sidebar({ onOpenDoubts }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  // ── ADMIN has no sidebar — render nothing ─────────────────────────────────
  if (user?.role === "ADMIN") return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getNavItems = () => ({
    STUDENT: [
      { path: "overview",   label: "Overview",   icon: "⊞" },
      { path: "marks",      label: "Marks",      icon: "◈" },
      { path: "attendance", label: "Attendance", icon: "◷" },
      { path: "analytics",  label: "Analytics",  icon: "⟁" },
    ],
    TEACHER: [
      { path: "overview",   label: "Overview",      icon: "⊞" },
      { path: "doubts",     label: "Answer Doubts", icon: "✦" },
      { path: "classes",    label: "Classes",        icon: "⊙" },
      { path: "students",   label: "Students",      icon: "⊛" },
      { path: "attendance", label: "Attendance",    icon: "◷" },
      { path: "marks",      label: "Marks",         icon: "◈" },
    ],
  })[user?.role] || [];

  const navItems = getNavItems();
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <>
      <motion.aside style={S.sidebar}
        initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}>

        {/* Brand */}
        <div style={S.brand}>
          <div style={S.brandLogo}>A</div>
          <div>
            <div style={S.brandName}>acadify</div>
            <div style={S.brandRole}>
              {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "—"} Portal
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={S.nav}>
          <div style={S.navSection}>MENU</div>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              style={({ isActive }) => ({ ...S.navItem, ...(isActive ? S.navItemActive : {}) })}>
              {({ isActive }) => (<>
                {isActive && <motion.div layoutId="activeIndicator" style={S.activeIndicator} />}
                <span style={S.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </>)}
            </NavLink>
          ))}

          {/* Student-only: floating doubts panel trigger */}
          {user?.role === "STUDENT" && (
            <>
              <div style={{ ...S.navSection, marginTop: 24 }}>SUPPORT</div>
              <button onClick={onOpenDoubts} style={S.navButtonDoubts}>
                <span style={S.navIcon}>✦</span>
                <span>Ask a Doubt</span>
                <span style={S.navBadge}>NEW</span>
              </button>
            </>
          )}
        </nav>

        {/* Profile footer */}
        <div style={S.footer}>
          <button onClick={() => setShowProfile(v => !v)} style={S.profileToggle}>
            <div style={S.avatar}>{initials}</div>
            <div style={S.profileInfo}>
              <div style={S.profileName}>{user?.name || "User"}</div>
              <div style={S.profileEmail}>{user?.email || ""}</div>
            </div>
            <span style={{ color: "#4f9cff", fontSize: 11 }}>{showProfile ? "▲" : "▼"}</span>
          </button>
        </div>
      </motion.aside>

      {/* Profile panel */}
      <AnimatePresence>
        {showProfile && (
          <motion.div style={S.profilePanel}
            initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>

            <div style={S.panelHeader}>
              <div style={S.panelAvatar}>{initials}</div>
              <button onClick={() => setShowProfile(false)} style={S.panelClose}>✕</button>
            </div>

            <div style={S.panelBody}>
              <div style={S.panelName}>{user?.name || "—"}</div>
              <div style={S.panelRoleBadge}>{user?.role || "—"}</div>
              <div style={S.divider} />

              {[
                { label: "Email",   value: user?.email },
                { label: "Role",    value: user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase() },
                { label: "User ID", value: user?.id || user?.userId || "—" },
                { label: "Status",  value: "Active ✓" },
              ].map(({ label, value }) => (
                <div key={label} style={S.detailRow}>
                  <span style={S.detailLabel}>{label}</span>
                  <span style={S.detailValue}>{value || "—"}</span>
                </div>
              ))}

              <div style={S.divider} />
              <button onClick={handleLogout} style={S.logoutBtn}>Sign Out</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfile && (
          <motion.div style={S.overlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowProfile(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

const S = {
  sidebar:        { width: 240, minWidth: 240, height: "100vh", background: "#0a0f1e", borderRight: "1px solid rgba(79,156,255,0.08)", display: "flex", flexDirection: "column", position: "sticky", top: 0, zIndex: 10 },
  brand:          { padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 },
  brandLogo:      { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18 },
  brandName:      { color: "white", fontWeight: 600, fontSize: 18, letterSpacing: "-0.5px" },
  brandRole:      { color: "#4f9cff", fontSize: 11, fontWeight: 500, marginTop: 1 },
  nav:            { flex: 1, padding: "20px 12px", overflowY: "auto" },
  navSection:     { color: "#334155", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", padding: "0 12px", marginBottom: 8 },
  navItem:        { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, color: "#64748b", fontSize: 13, fontWeight: 500, textDecoration: "none", marginBottom: 2, position: "relative", transition: "all 0.2s" },
  navItemActive:  { color: "#f9fafb", background: "rgba(79,156,255,0.1)" },
  activeIndicator:{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", background: "#4f9cff", borderRadius: "0 2px 2px 0" },
  navIcon:        { fontSize: 14, width: 18, textAlign: "center" },
  navButtonDoubts:{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, color: "#4f9cff", fontSize: 13, fontWeight: 500, background: "rgba(79,156,255,0.06)", border: "1px solid rgba(79,156,255,0.12)", width: "100%", cursor: "pointer", textAlign: "left", marginBottom: 2 },
  navBadge:       { marginLeft: "auto", background: "rgba(79,156,255,0.2)", color: "#4f9cff", fontSize: 9, fontWeight: 700, letterSpacing: "0.5px", padding: "2px 6px", borderRadius: 4 },
  footer:         { padding: 12, borderTop: "1px solid rgba(255,255,255,0.05)" },
  profileToggle:  { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" },
  avatar:         { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4f9cff22,#7c7cff22)", border: "1px solid rgba(79,156,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f9cff", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  profileInfo:    { flex: 1, minWidth: 0, textAlign: "left" },
  profileName:    { color: "white", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  profileEmail:   { color: "#64748b", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  profilePanel:   { position: "fixed", left: 240, top: 0, width: 280, height: "100vh", background: "#0d1425", borderRight: "1px solid rgba(79,156,255,0.1)", zIndex: 50, display: "flex", flexDirection: "column", boxShadow: "8px 0 32px rgba(0,0,0,0.4)" },
  panelHeader:    { padding: 24, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  panelAvatar:    { width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22, fontWeight: 700 },
  panelClose:     { color: "#64748b", background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", fontSize: 14, padding: "6px 10px", borderRadius: 6 },
  panelBody:      { padding: 24, flex: 1, overflowY: "auto" },
  panelName:      { color: "white", fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 8 },
  panelRoleBadge: { display: "inline-block", background: "rgba(79,156,255,0.1)", border: "1px solid rgba(79,156,255,0.2)", color: "#4f9cff", fontSize: 11, fontWeight: 600, letterSpacing: "1px", padding: "4px 10px", borderRadius: 6 },
  divider:        { height: 1, background: "rgba(255,255,255,0.05)", margin: "20px 0" },
  detailRow:      { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  detailLabel:    { color: "#475569", fontSize: 12, fontWeight: 500 },
  detailValue:    { color: "#cbd5e1", fontSize: 12, fontWeight: 500, textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  logoutBtn:      { width: "100%", padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  overlay:        { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 },
};