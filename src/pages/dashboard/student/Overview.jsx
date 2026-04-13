import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../../api/axios";

const StatCard = ({ title, value, sub, accent, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{ ...card, borderColor: accent + "22" }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <div style={label}>{title}</div>
        <div style={{ color: "white", fontSize: "34px", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1, marginTop: 8 }}>
          {value ?? "—"}
        </div>
        {sub && <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 22, opacity: 0.6 }}>{icon}</div>
    </div>
    <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, marginTop: 18 }} />
  </motion.div>
);

export default function Overview() {
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/student/overview").then(r => r.data),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get("/student/analytics").then(r => r.data),
  });

  const overview  = overviewData || {};
  const analytics = analyticsData?.data?.analytics || analyticsData || {};
  const strong    = analytics?.strongSubjects || [];
  const weak      = analytics?.weakSubjects   || [];
  const trends    = analytics?.subjectTrends  || [];

  if (isLoading) return <div style={loading}>Loading overview...</div>;

  return (
    <div style={page}>
      <div style={pageTitle}>Overview</div>
      <div style={pageSub}>Your academic snapshot at a glance</div>

      {/* Stat cards */}
      <div style={grid3}>
        <StatCard title="AVERAGE SCORE"  value={overview.avgScore}    sub="Overall performance"   accent="#4f9cff" icon="◈" delay={0}    />
        <StatCard title="ATTENDANCE"     value={overview.attendance}  sub="Classes attended"      accent="#22c55e" icon="◷" delay={0.08} />
        <StatCard title="CLASS RANK"     value={overview.rank}        sub={overview.totalStudents ? `of ${overview.totalStudents} students` : ""} accent="#7c7cff" icon="⟁" delay={0.16} />
      </div>

      {/* Strong / Weak */}
      <div style={grid2}>
        <div style={{ ...card, borderColor: "rgba(34,197,94,0.12)" }}>
          <div style={label}>STRONG SUBJECTS</div>
          {strong.length > 0 ? (
            <div style={tagRow}>
              {strong.map(s => <span key={s} style={{ ...tag, background: "rgba(34,197,94,0.08)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>{s}</span>)}
            </div>
          ) : <div style={empty}>No data yet</div>}
        </div>

        <div style={{ ...card, borderColor: "rgba(239,68,68,0.12)" }}>
          <div style={label}>WEAK SUBJECTS</div>
          {weak.length > 0 ? (
            <div style={tagRow}>
              {weak.map(s => <span key={s} style={{ ...tag, background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>{s}</span>)}
            </div>
          ) : <div style={{ ...empty, color: "#22c55e" }}>All subjects on track ✓</div>}
        </div>
      </div>

      {/* Subject trend messages */}
      {trends.length > 0 && (
        <div style={card}>
          <div style={label}>PERFORMANCE SUMMARY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {trends.map((t, i) => {
              const color = t.trend === "improved" ? "#22c55e" : t.trend === "declined" ? "#ef4444" : "#4f9cff";
              const dot   = t.trend === "improved" ? "▲" : t.trend === "declined" ? "▼" : "●";
              return (
                <motion.div
                  key={t.subject}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span style={{ color, fontSize: 12, width: 14 }}>{dot}</span>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{t.message}</span>
                  <span style={{ marginLeft: "auto", color: "#334155", fontSize: 11 }}>{t.currentMarks}%</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      {analytics.recommendation && (
        <div style={{ ...card, borderColor: "rgba(124,124,255,0.12)", borderLeft: "3px solid #7c7cff" }}>
          <div style={label}>AI RECOMMENDATION</div>
          <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
            {analytics.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

const page      = { padding: "32px", maxWidth: 1100, margin: "0 auto" };
const pageTitle = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const pageSub   = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 28 };
const grid3     = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 };
const grid2     = { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 16 };
const card      = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px", marginBottom: 0 };
const label     = { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" };
const tagRow    = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 };
const tag       = { fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 8 };
const empty     = { color: "#334155", fontSize: 12, marginTop: 10, fontStyle: "italic" };
const loading   = { color: "#475569", padding: 40, textAlign: "center" };