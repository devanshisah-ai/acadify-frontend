import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import api from "../../../api/axios";

const trendIcon  = { improved: "▲", declined: "▼", stable: "●", new: "◆" };
const trendColor = { improved: "#22c55e", declined: "#ef4444", stable: "#4f9cff", new: "#7c7cff" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1425", border: "1px solid rgba(79,156,255,0.15)", borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ color: "#94a3b8", fontSize: 11 }}>{label}</div>
      <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>{payload[0].value}%</div>
    </div>
  );
};

export default function Analytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get("/student/analytics").then(r => r.data),
  });

  const analytics     = analyticsData?.data?.analytics || analyticsData || {};
  const trends        = analytics?.subjectTrends  || [];
  const semesterTrend = analytics?.semesterTrend  || [
    { semester: "Sem 1", marks: 70 },
    { semester: "Sem 2", marks: 75 },
    { semester: "Sem 3", marks: 80 },
  ];

  // Normalise semester chart data
  const semData = semesterTrend.map(s => ({
    semester: "Sem " + (s.semester ?? s.sem ?? "?"),
    marks: s.marks ?? parseFloat(((s.cgpa ?? 0) * 10).toFixed(1)),
  }));

  // Group trends
  const declined = trends.filter(t => t.trend === "declined");
  const improved = trends.filter(t => t.trend === "improved");
  const stable   = trends.filter(t => t.trend === "stable" || t.trend === "new");

  if (isLoading) return <div style={loading}>Loading analytics...</div>;

  return (
    <div style={page}>
      <div style={pageTitle}>Analytics</div>
      <div style={pageSub}>Detailed performance analysis with subject-wise trends</div>

      {/* Semester histogram */}
      <div style={card}>
        <div style={sLabel}>SEMESTER PROGRESSION</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={semData} barSize={44}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="semester" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="marks" radius={[6, 6, 0, 0]}>
              {semData.map((e, i) => (
                <Cell key={i} fill={e.marks >= 80 ? "#22c55e" : e.marks >= 60 ? "#4f9cff" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={legendRow}>
          {[["#22c55e","≥ 80%"],["#4f9cff","60–79%"],["#ef4444","< 60%"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:c }} />
              <span style={{ color:"#475569", fontSize:11 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject trend cards */}
      {trends.length > 0 && (
        <>
          {/* Declined */}
          {declined.length > 0 && (
            <div style={{ ...card, borderColor: "rgba(239,68,68,0.1)" }}>
              <div style={{ ...sLabel, color: "#ef4444" }}>NEEDS ATTENTION</div>
              <div style={trendGrid}>
                {declined.map((t, i) => <TrendCard key={t.subject} t={t} delay={i * 0.05} />)}
              </div>
            </div>
          )}

          {/* Stable */}
          {stable.length > 0 && (
            <div style={{ ...card, borderColor: "rgba(79,156,255,0.08)" }}>
              <div style={sLabel}>CONSISTENT PERFORMANCE</div>
              <div style={trendGrid}>
                {stable.map((t, i) => <TrendCard key={t.subject} t={t} delay={i * 0.05} />)}
              </div>
            </div>
          )}

          {/* Improved */}
          {improved.length > 0 && (
            <div style={{ ...card, borderColor: "rgba(34,197,94,0.1)" }}>
              <div style={{ ...sLabel, color: "#22c55e" }}>MOST IMPROVED</div>
              <div style={trendGrid}>
                {improved.map((t, i) => <TrendCard key={t.subject} t={t} delay={i * 0.05} />)}
              </div>
            </div>
          )}
        </>
      )}

      {trends.length === 0 && (
        <div style={{ ...card, textAlign: "center", color: "#334155", padding: "40px", fontStyle: "italic" }}>
          No trend data available yet. Marks from at least two semesters are needed.
        </div>
      )}

      {/* Overall recommendation */}
      {analytics.recommendation && (
        <div style={{ ...card, borderLeft: "3px solid #7c7cff", borderColor: "rgba(124,124,255,0.15)" }}>
          <div style={sLabel}>AI RECOMMENDATION</div>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, marginTop: 10 }}>
            {analytics.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

function TrendCard({ t, delay }) {
  const color = trendColor[t.trend] || "#4f9cff";
  const icon  = trendIcon[t.trend]  || "●";
  const hasPrev = t.previousMarks !== null && t.previousMarks !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ ...trendCard, borderColor: color + "22" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ color: "white", fontSize: 14, fontWeight: 600 }}>{t.subject}</div>
        <span style={{ color, fontSize: 12 }}>{icon}</span>
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${t.currentMarks}%` }}
            transition={{ delay: delay + 0.2, duration: 0.6 }}
            style={{ height: "100%", borderRadius: 3, background: color }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ color: "#334155", fontSize: 10 }}>0</span>
          <span style={{ color, fontSize: 11, fontWeight: 600 }}>{t.currentMarks}%</span>
          <span style={{ color: "#334155", fontSize: 10 }}>100</span>
        </div>
      </div>

      {hasPrev && (
        <div style={{ color: "#475569", fontSize: 11, marginBottom: 8 }}>
          Previous: {t.previousMarks}%
          <span style={{ color, marginLeft: 6 }}>
            {t.currentMarks > t.previousMarks ? `+${(t.currentMarks - t.previousMarks).toFixed(1)}` : (t.currentMarks - t.previousMarks).toFixed(1)}
          </span>
        </div>
      )}

      <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>{t.message}</div>
    </motion.div>
  );
}

const page      = { padding: "32px", maxWidth: 1100, margin: "0 auto" };
const pageTitle = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const pageSub   = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 24 };
const card      = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px", marginBottom: 16 };
const sLabel    = { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 4 };
const trendGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 14 };
const trendCard = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" };
const legendRow = { display: "flex", gap: 20, marginTop: 12, justifyContent: "center" };
const loading   = { color: "#475569", padding: 40, textAlign: "center" };