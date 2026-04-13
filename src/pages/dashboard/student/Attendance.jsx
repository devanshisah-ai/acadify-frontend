import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../../api/axios";

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Attendance() {
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  const { data, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => api.get("/student/attendance").then(r => r.data),
  });

  const records   = data?.records || [];
  const pct       = data?.percentage   ?? null;
  const totalDays = data?.totalDays    ?? 0;
  const present   = data?.presentDays  ?? 0;
  const absent    = data?.absentDays   ?? 0;

  // Build lookup: "yyyy-MM-dd" → status
  const statusMap = {};
  records.forEach(r => { statusMap[r.date] = r.status; });

  // Calendar helpers
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth= new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells      = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const pad = n => String(n).padStart(2, "0");
  const dateKey = d => `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const attColor = pct >= 75 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";

  if (isLoading) return <div style={loading}>Loading attendance...</div>;

  return (
    <div style={page}>
      <div style={pageTitle}>Attendance</div>
      <div style={pageSub}>Day-by-day presence and absence record</div>

      {/* Summary cards */}
      <div style={summaryRow}>
        {[
          { label: "ATTENDANCE %",   value: pct !== null ? `${pct}%` : "N/A", color: attColor },
          { label: "TOTAL DAYS",     value: totalDays, color: "#4f9cff" },
          { label: "DAYS PRESENT",   value: present,   color: "#22c55e" },
          { label: "DAYS ABSENT",    value: absent,     color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...summaryCard, borderColor: color + "22" }}>
            <div style={sLabel}>{label}</div>
            <div style={{ color, fontSize: 30, fontWeight: 700, letterSpacing: "-0.5px", marginTop: 8 }}>{value}</div>
            <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg,${color},transparent)`, marginTop: 14 }} />
          </div>
        ))}
      </div>

      {/* Low attendance warning */}
      {pct !== null && pct < 75 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={warning}
        >
          ⚠ Your attendance is below 75%. This may affect your eligibility for exams.
        </motion.div>
      )}

      {/* Calendar */}
      <div style={calendarCard}>
        {/* Month nav */}
        <div style={calHeader}>
          <button onClick={prevMonth} style={navBtn}>←</button>
          <div style={monthTitle}>{MONTHS[viewMonth]} {viewYear}</div>
          <button onClick={nextMonth} style={navBtn}>→</button>
        </div>

        {/* Day labels */}
        <div style={dayGrid}>
          {DAYS.map(d => (
            <div key={d} style={dayLabel}>{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div style={dayGrid}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const key    = dateKey(day);
            const status = statusMap[key];
            const isToday= day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.008 }}
                style={{
                  ...dateCell,
                  ...(status === "PRESENT" ? presentCell : {}),
                  ...(status === "ABSENT"  ? absentCell  : {}),
                  ...(isToday             ? todayCell   : {}),
                  ...(status === undefined ? noDataCell  : {}),
                }}
                title={status ? `${key}: ${status}` : key}
              >
                {day}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={legend}>
          {[
            ["#22c55e", "rgba(34,197,94,0.12)", "Present"],
            ["#ef4444", "rgba(239,68,68,0.12)",  "Absent"],
            ["#4f9cff", "rgba(79,156,255,0.12)", "Today"],
            ["#475569", "rgba(255,255,255,0.04)","No data"],
          ].map(([border, bg, lbl]) => (
            <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: bg, border: `1px solid ${border}` }} />
              <span style={{ color: "#475569", fontSize: 11 }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent absences list */}
      {absent > 0 && (
        <div style={recentCard}>
          <div style={sLabel}>RECENT ABSENCES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {records
              .filter(r => r.status === "ABSENT")
              .slice(0, 20)
              .map(r => (
                <span key={r.date} style={absenceTag}>{r.date}</span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const page       = { padding: "32px", maxWidth: 1100, margin: "0 auto" };
const pageTitle  = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const pageSub    = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 24 };
const summaryRow = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 };
const summaryCard= { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px" };
const sLabel     = { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" };
const warning    = { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 16px", color: "#f59e0b", fontSize: 13, marginBottom: 16 };
const calendarCard={ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px", marginBottom: 16 };
const calHeader  = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 };
const monthTitle = { color: "white", fontSize: 16, fontWeight: 700 };
const navBtn     = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#94a3b8", fontSize: 14, padding: "6px 14px", borderRadius: 8, cursor: "pointer" };
const dayGrid    = { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 };
const dayLabel   = { color: "#334155", fontSize: 11, fontWeight: 600, textAlign: "center", padding: "4px 0" };
const dateCell   = { aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "#475569", cursor: "default", border: "1px solid transparent" };
const presentCell= { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" };
const absentCell = { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" };
const todayCell  = { border: "1px solid rgba(79,156,255,0.5)", color: "#4f9cff" };
const noDataCell = { background: "rgba(255,255,255,0.02)" };
const legend     = { display: "flex", gap: 20, marginTop: 16, justifyContent: "center", flexWrap: "wrap" };
const recentCard = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(239,68,68,0.08)", borderRadius: 12, padding: "18px 20px" };
const absenceTag = { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 6 };
const loading    = { color: "#475569", padding: 40, textAlign: "center" };