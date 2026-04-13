import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import api from "../../../api/axios";

const FILTERS = [
  { value: "all",   label: "All Students" },
  { value: "top10", label: "Top 10" },
  { value: "due",   label: "Due / Failing" },
];

const gradeColor = g =>
  g === "A+" || g === "A" ? "#22c55e" : g === "B" ? "#4f9cff" :
  g === "C" ? "#f59e0b" : g === "D" ? "#fb923c" : "#ef4444";

const Tooltip_ = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1425", border: "1px solid rgba(79,156,255,0.15)", borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ color: "#94a3b8", fontSize: 11 }}>{label}</div>
      <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{payload[0].value}%</div>
    </div>
  );
};

export default function Classes() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [semester, setSemester]               = useState("");
  const [filter, setFilter]                   = useState("all");

  const { data: classesData } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teacher/classes").then(r => r.data),
  });
  const classes = Array.isArray(classesData) ? classesData : (classesData?.data || []);

  const { data: perfData, isLoading } = useQuery({
    queryKey: ["class-perf", selectedSubject, semester, filter],
    queryFn: () => {
      if (!selectedSubject) return [];
      let url = `/teacher/class/performance?subject_id=${selectedSubject}&filter=${filter}`;
      if (semester) url += `&semester=${semester}`;
      return api.get(url).then(r => Array.isArray(r.data) ? r.data : (r.data?.data || []));
    },
    enabled: !!selectedSubject,
  });
  const students = perfData || [];

  const chartData = students.slice(0, 15).map(s => ({
    name: s.name.split(" ")[0],
    pct:  s.percentage,
  }));

  return (
    <div style={page}>
      <div style={pageTitle}>Classes</div>
      <div style={pageSub}>Select a subject to view class performance</div>

      {/* Subject selector */}
      <div style={subjectRow}>
        {classes.map(c => (
          <button key={c.subject_id}
            onClick={() => setSelectedSubject(c.subject_id)}
            style={{ ...subjectBtn, ...(selectedSubject === c.subject_id ? subjectActive : {}) }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.subject_name}</div>
          </button>
        ))}
        {classes.length === 0 && <div style={{ color: "#334155", fontSize: 13 }}>No subjects assigned yet.</div>}
      </div>

      {selectedSubject && (
        <>
          {/* Controls */}
          <div style={controls}>
            <select value={semester} onChange={e => setSemester(e.target.value)} style={select}>
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  style={{ ...filterBtn, ...(filter === f.value ? filterActive : {}) }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? <div style={loading}>Loading...</div> : (
            <>
              {/* Bar chart */}
              {chartData.length > 0 && (
                <div style={card}>
                  <div style={sLabel}>PERFORMANCE CHART</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0,100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                      <Tooltip content={<Tooltip_ />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="pct" radius={[4,4,0,0]}>
                        {chartData.map((e,i) => <Cell key={i} fill={e.pct>=75?"#22c55e":e.pct>=50?"#4f9cff":"#ef4444"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Table */}
              <div style={card}>
                <div style={sLabel}>STUDENT LIST ({students.length})</div>
                {students.length === 0 ? (
                  <div style={empty}>No students found for this filter.</div>
                ) : (
                  <table style={table}>
                    <thead>
                      <tr>{["Rank","Student","Marks","Percentage","Grade"].map(h=>(
                        <th key={h} style={th}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <motion.tr key={s.student_id}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ ...td, color: "#475569" }}>#{i+1}</td>
                          <td style={{ ...td, color: "white", fontWeight: 500 }}>{s.name}</td>
                          <td style={td}>{s.marks}</td>
                          <td style={td}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                                <div style={{ width: `${s.percentage}%`, height: "100%", borderRadius: 2, background: s.percentage>=75?"#22c55e":s.percentage>=50?"#4f9cff":"#ef4444" }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, minWidth: 36, color: s.percentage>=75?"#22c55e":s.percentage>=50?"#4f9cff":"#ef4444" }}>{s.percentage}%</span>
                            </div>
                          </td>
                          <td style={td}>
                            <span style={{ background: gradeColor(s.grade)+"18", color: gradeColor(s.grade), border: `1px solid ${gradeColor(s.grade)}33`, fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 6 }}>{s.grade}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const page        = { padding: "32px", maxWidth: 1100, margin: "0 auto" };
const pageTitle   = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const pageSub     = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 24 };
const subjectRow  = { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 };
const subjectBtn  = { padding: "10px 18px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", cursor: "pointer", textAlign: "left" };
const subjectActive={ background: "rgba(79,156,255,0.08)", border: "1px solid rgba(79,156,255,0.25)", color: "white" };
const controls    = { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" };
const select      = { padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: 12, outline: "none", cursor: "pointer" };
const filterBtn   = { padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", fontSize: 12, fontWeight: 500, cursor: "pointer" };
const filterActive= { background: "rgba(79,156,255,0.1)", border: "1px solid rgba(79,156,255,0.25)", color: "#4f9cff" };
const card        = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px", marginBottom: 16 };
const sLabel      = { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 14 };
const table       = { width: "100%", borderCollapse: "collapse" };
const th          = { color: "#334155", fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const td          = { color: "#94a3b8", fontSize: 13, padding: "11px 12px" };
const empty       = { color: "#334155", fontSize: 13, padding: "24px 0", textAlign: "center", fontStyle: "italic" };
const loading     = { color: "#475569", padding: 40, textAlign: "center" };