import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import api from "../../../api/axios";

const gradeColor = g =>
  g === "A+" || g === "A" ? "#22c55e" : g === "B" ? "#4f9cff" :
  g === "C" ? "#f59e0b" : g === "D" ? "#fb923c" : "#ef4444";

export default function Students() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data: classesData } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teacher/classes").then(r => r.data),
  });
  const classes = Array.isArray(classesData) ? classesData : (classesData?.data || []);

  const { data: studentsData } = useQuery({
    queryKey: ["class-students", selectedSubject],
    queryFn: () => api.get(`/teacher/class/students?subject_id=${selectedSubject}`).then(r =>
      Array.isArray(r.data) ? r.data : (r.data?.data || [])),
    enabled: !!selectedSubject,
  });
  const studentList = studentsData || [];

  const { data: perfData, isLoading: perfLoading } = useQuery({
    queryKey: ["student-perf", selectedStudent, selectedSubject],
    queryFn: () => {
      let url = `/teacher/student/performance?student_id=${selectedStudent}`;
      if (selectedSubject) url += `&subject_id=${selectedSubject}`;
      return api.get(url).then(r => r.data?.data || r.data);
    },
    enabled: !!selectedStudent,
  });

  const marks    = perfData?.marks || [];
  const chartData = marks.map(m => ({ subject: m.subject.slice(0,10), pct: m.percentage }));

  return (
    <div style={page}>
      <div style={pageTitle}>Students</div>
      <div style={pageSub}>Select a class then a student to view their performance</div>

      {/* Step 1 — Subject */}
      <div style={stepCard}>
        <div style={stepLabel}>STEP 1 — SELECT SUBJECT</div>
        <div style={subjectRow}>
          {classes.map(c => (
            <button key={c.subject_id}
              onClick={() => { setSelectedSubject(c.subject_id); setSelectedStudent(null); }}
              style={{ ...subjectBtn, ...(selectedSubject === c.subject_id ? subjectActive : {}) }}>
              {c.subject_name}
            </button>
          ))}
          {classes.length === 0 && <span style={{ color: "#334155", fontSize: 12 }}>No subjects assigned.</span>}
        </div>
      </div>

      {/* Step 2 — Student list */}
      {selectedSubject && (
        <div style={stepCard}>
          <div style={stepLabel}>STEP 2 — SELECT STUDENT</div>
          {studentList.length === 0 ? (
            <div style={{ color: "#334155", fontSize: 12 }}>No students found.</div>
          ) : (
            <div style={studentGrid}>
              {studentList.map(s => (
                <button key={s.student_id}
                  onClick={() => setSelectedStudent(s.student_id)}
                  style={{ ...studentBtn, ...(selectedStudent === s.student_id ? studentActive : {}) }}>
                  <div style={studentAvatar}>{s.name[0]}</div>
                  <div>
                    <div style={{ color: selectedStudent === s.student_id ? "white" : "#94a3b8", fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ color: "#475569", fontSize: 11 }}>{s.marks > 0 ? `${s.marks} marks` : "No marks"}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Student detail */}
      {selectedStudent && (
        perfLoading ? <div style={loading}>Loading student data...</div> : perfData && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div style={studentHeader}>
              <div style={bigAvatar}>{perfData.name?.[0]}</div>
              <div>
                <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>{perfData.name}</div>
                <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>Student ID: {perfData.studentId}</div>
              </div>
              <div style={headerStats}>
                <div style={headerStat}>
                  <div style={{ color: "#4f9cff", fontSize: 22, fontWeight: 700 }}>{perfData.avgPercentage}%</div>
                  <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.5px" }}>AVG SCORE</div>
                </div>
                <div style={headerStat}>
                  <div style={{ color: "#22c55e", fontSize: 22, fontWeight: 700 }}>{perfData.attendance}</div>
                  <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.5px" }}>ATTENDANCE</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div style={card}>
                <div style={sLabel}>SUBJECT PERFORMANCE</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                    <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                      <div style={{ background: "#0d1425", border: "1px solid rgba(79,156,255,0.15)", borderRadius: 8, padding: "8px 12px" }}>
                        <div style={{ color: "#94a3b8", fontSize: 11 }}>{label}</div>
                        <div style={{ color: "white", fontWeight: 700 }}>{payload[0].value}%</div>
                      </div>) : null} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="pct" radius={[4,4,0,0]}>
                      {chartData.map((e,i) => <Cell key={i} fill={e.pct>=75?"#22c55e":e.pct>=50?"#4f9cff":"#ef4444"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Marks table */}
            <div style={card}>
              <div style={sLabel}>MARKS BREAKDOWN</div>
              <table style={table}>
                <thead><tr>{["Subject","Marks","Total","Percentage","Grade","Semester"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {marks.map((m, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ ...td, color: "white", fontWeight: 500 }}>{m.subject}</td>
                      <td style={td}>{m.marks}</td>
                      <td style={{ ...td, color: "#475569" }}>{m.totalMarks}</td>
                      <td style={td}>
                        <span style={{ color: m.percentage>=75?"#22c55e":m.percentage>=50?"#4f9cff":"#ef4444", fontWeight: 600, fontSize: 12 }}>{m.percentage}%</span>
                      </td>
                      <td style={td}>
                        <span style={{ background: gradeColor(m.grade)+"18", color: gradeColor(m.grade), border: `1px solid ${gradeColor(m.grade)}33`, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{m.grade}</span>
                      </td>
                      <td style={{ ...td, color: "#475569" }}>Sem {m.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )
      )}
    </div>
  );
}

const page         = { padding: "32px", maxWidth: 1100, margin: "0 auto" };
const pageTitle    = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const pageSub      = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 24 };
const stepCard     = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "18px 20px", marginBottom: 16 };
const stepLabel    = { color: "#334155", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 12 };
const subjectRow   = { display: "flex", flexWrap: "wrap", gap: 8 };
const subjectBtn   = { padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", fontSize: 12, fontWeight: 500, cursor: "pointer" };
const subjectActive= { background: "rgba(79,156,255,0.08)", border: "1px solid rgba(79,156,255,0.25)", color: "white" };
const studentGrid  = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 };
const studentBtn   = { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", textAlign: "left" };
const studentActive= { background: "rgba(79,156,255,0.08)", border: "1px solid rgba(79,156,255,0.2)" };
const studentAvatar= { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4f9cff,#7c7cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 };
const studentHeader= { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 };
const bigAvatar    = { width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: 700, flexShrink: 0 };
const headerStats  = { marginLeft: "auto", display: "flex", gap: 24 };
const headerStat   = { textAlign: "center" };
const card         = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px", marginBottom: 16 };
const sLabel       = { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 14 };
const table        = { width: "100%", borderCollapse: "collapse" };
const th           = { color: "#334155", fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const td           = { color: "#94a3b8", fontSize: 13, padding: "11px 12px" };
const loading      = { color: "#475569", padding: 40, textAlign: "center" };