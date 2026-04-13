import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import api from "../../../api/axios";

const gradeColor = (g) => {
  if (g === "A+" || g === "A") return "#22c55e";
  if (g === "B")  return "#4f9cff";
  if (g === "C")  return "#f59e0b";
  if (g === "D")  return "#fb923c";
  return "#ef4444";
};

const pctColor = (p) => p >= 75 ? "#22c55e" : p >= 50 ? "#4f9cff" : "#ef4444";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1425", border: "1px solid rgba(79,156,255,0.15)", borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>{payload[0].value}%</div>
    </div>
  );
};

export default function Marks() {
  const [semFilter, setSemFilter] = useState("all");

  const { data: marksData, isLoading } = useQuery({
    queryKey: ["marks"],
    queryFn: () => api.get("/student/marks").then(r => r.data),
  });

  const marks = Array.isArray(marksData) ? marksData : (marksData?.data || []);

  const semesters = [...new Set(marks.map(m => m.semester))].sort();
  const filtered  = semFilter === "all" ? marks : marks.filter(m => m.semester == semFilter);

  // Chart data — average per subject for selected filter
  const subjectMap = {};
  filtered.forEach(m => {
    if (!subjectMap[m.subject]) subjectMap[m.subject] = { total: 0, count: 0 };
    subjectMap[m.subject].total += m.percentage;
    subjectMap[m.subject].count += 1;
  });
  const chartData = Object.entries(subjectMap).map(([subject, d]) => ({
    subject: subject.length > 10 ? subject.slice(0, 10) + "…" : subject,
    pct: parseFloat((d.total / d.count).toFixed(1)),
  }));

  if (isLoading) return <div style={loading}>Loading marks...</div>;

  return (
    <div style={page}>
      <div style={pageTitle}>Marks</div>
      <div style={pageSub}>Detailed subject-wise performance</div>

      {/* Semester filter */}
      <div style={filterRow}>
        <button onClick={() => setSemFilter("all")} style={{ ...filterBtn, ...(semFilter === "all" ? filterActive : {}) }}>
          All Semesters
        </button>
        {semesters.map(s => (
          <button key={s} onClick={() => setSemFilter(s)} style={{ ...filterBtn, ...(semFilter == s ? filterActive : {}) }}>
            Sem {s}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>MARKS OVERVIEW</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={pctColor(entry.pct)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Marks table */}
      <div style={card}>
        <div style={sectionLabel}>SUBJECT BREAKDOWN</div>
        {filtered.length === 0 ? (
          <div style={empty}>No marks found for this selection.</div>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                {["Subject", "Marks", "Total", "Percentage", "Grade", "Semester"].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td style={td}>{m.subject}</td>
                  <td style={{ ...td, fontWeight: 600, color: "white" }}>{m.marks}</td>
                  <td style={{ ...td, color: "#475569" }}>{m.totalMarks || 100}</td>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ width: `${m.percentage}%`, height: "100%", borderRadius: 2, background: pctColor(m.percentage) }} />
                      </div>
                      <span style={{ color: pctColor(m.percentage), fontSize: 12, fontWeight: 600, minWidth: 36 }}>{m.percentage}%</span>
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ background: gradeColor(m.grade) + "18", color: gradeColor(m.grade), border: `1px solid ${gradeColor(m.grade)}33`, fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 6 }}>
                      {m.grade}
                    </span>
                  </td>
                  <td style={{ ...td, color: "#475569" }}>Sem {m.semester}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const page        = { padding: "32px", maxWidth: 1100, margin: "0 auto" };
const pageTitle   = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const pageSub     = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 24 };
const filterRow   = { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" };
const filterBtn   = { padding: "6px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", fontSize: 12, fontWeight: 500, cursor: "pointer" };
const filterActive= { background: "rgba(79,156,255,0.1)", border: "1px solid rgba(79,156,255,0.25)", color: "#4f9cff" };
const card        = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px", marginBottom: 16 };
const sectionLabel= { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 16 };
const table       = { width: "100%", borderCollapse: "collapse" };
const th          = { color: "#334155", fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const td          = { color: "#94a3b8", fontSize: 13, padding: "12px 12px" };
const empty       = { color: "#334155", fontSize: 13, padding: "24px 0", textAlign: "center", fontStyle: "italic" };
const loading     = { color: "#475569", padding: 40, textAlign: "center" };