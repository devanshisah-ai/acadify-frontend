import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../../api/axios";

export default function TeacherMarks() {
  const qc = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [semester, setSemester] = useState("1");
  const [editMap, setEditMap]   = useState({}); // { student_id: marksValue }
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);

  const { data: classesData } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teacher/classes").then(r => r.data),
  });
  const classes = Array.isArray(classesData) ? classesData : (classesData?.data || []);
  const selectedClass = classes.find(c => c.subject_id === selectedSubject);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["class-students", selectedSubject],
    queryFn: () => api.get(`/teacher/class/students?subject_id=${selectedSubject}`)
      .then(r => Array.isArray(r.data) ? r.data : (r.data?.data || [])),
    enabled: !!selectedSubject,
    onSuccess: (list) => {
      const map = {};
      list.forEach(s => { map[s.student_id] = s.marks > 0 ? String(s.marks) : ""; });
      setEditMap(map);
    },
  });
  const students = studentsData || [];
  const totalMarks = selectedClass?.total_marks || 100;

  const handleSaveAll = async () => {
    if (!selectedSubject) return;
    setSaving(true);
    try {
      const promises = students
        .filter(s => editMap[s.student_id] !== "" && editMap[s.student_id] !== undefined)
        .map(s => {
          const marks = parseFloat(editMap[s.student_id]);
          if (isNaN(marks)) return null;
          return api.post("/teacher/marks", {
            student_id: s.student_id,
            subject_id: selectedSubject,
            marks,
            semester: parseInt(semester),
          }).catch(() => null);
        })
        .filter(Boolean);

      await Promise.all(promises);
      qc.invalidateQueries(["class-students", selectedSubject]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const setMark = (studentId, val) => {
    const num = parseFloat(val);
    if (val !== "" && (isNaN(num) || num < 0 || num > totalMarks)) return;
    setEditMap(prev => ({ ...prev, [studentId]: val }));
  };

  const filledCount = students.filter(s => editMap[s.student_id] !== "" && editMap[s.student_id] !== undefined).length;
  const avgMark = filledCount > 0
    ? (students.reduce((a, s) => a + (parseFloat(editMap[s.student_id]) || 0), 0) / filledCount).toFixed(1)
    : "—";

  const getGrade = (marks) => {
    const pct = (marks / totalMarks) * 100;
    if (pct >= 90) return { g: "A+", c: "#22c55e" };
    if (pct >= 80) return { g: "A",  c: "#22c55e" };
    if (pct >= 70) return { g: "B",  c: "#4f9cff" };
    if (pct >= 60) return { g: "C",  c: "#f59e0b" };
    if (pct >= 50) return { g: "D",  c: "#fb923c" };
    return           { g: "F",  c: "#ef4444" };
  };

  return (
    <div style={page}>
      <div style={pageTitle}>Marks</div>
      <div style={pageSub}>Add or update marks for your students</div>

      {/* Subject selector */}
      <div style={subjectRow}>
        {classes.map(c => (
          <button key={c.subject_id}
            onClick={() => { setSelectedSubject(c.subject_id); setEditMap({}); }}
            style={{ ...subjectBtn, ...(selectedSubject === c.subject_id ? subjectActive : {}) }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.subject_name}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Out of {c.total_marks || 100}</div>
          </button>
        ))}
      </div>

      {selectedSubject && (
        <>
          {/* Controls */}
          <div style={controls}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={ctrlLabel}>SEMESTER</span>
              <select value={semester} onChange={e => setSemester(e.target.value)} style={select}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div style={statsPill}>
              <span style={{ color: "#475569", fontSize: 12 }}>{filledCount} / {students.length} filled</span>
              <span style={{ color: "#4f9cff", fontSize: 12, fontWeight: 600 }}>Avg: {avgMark}</span>
            </div>
          </div>

          {isLoading ? <div style={loading}>Loading students...</div> : (
            <div style={tableCard}>
              <table style={table}>
                <thead>
                  <tr>
                    {["Student", `Marks (out of ${totalMarks})`, "Percentage", "Grade"].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const val    = editMap[s.student_id] ?? "";
                    const num    = parseFloat(val);
                    const pct    = !isNaN(num) && num > 0 ? Math.round((num / totalMarks) * 1000) / 10 : null;
                    const grade  = pct !== null ? getGrade(num) : null;

                    return (
                      <motion.tr key={s.student_id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>

                        <td style={{ ...td }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={sAvatar}>{s.name[0]}</div>
                            <span style={{ color: "white", fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                          </div>
                        </td>

                        <td style={td}>
                          <input
                            type="number"
                            value={val}
                            onChange={e => setMark(s.student_id, e.target.value)}
                            placeholder={`0–${totalMarks}`}
                            min={0}
                            max={totalMarks}
                            style={marksInput}
                          />
                        </td>

                        <td style={td}>
                          {pct !== null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: grade?.c }} />
                              </div>
                              <span style={{ color: grade?.c, fontSize: 12, fontWeight: 600, minWidth: 36 }}>{pct}%</span>
                            </div>
                          ) : <span style={{ color: "#334155" }}>—</span>}
                        </td>

                        <td style={td}>
                          {grade ? (
                            <span style={{ background: grade.c + "18", color: grade.c, border: `1px solid ${grade.c}33`, fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 6 }}>
                              {grade.g}
                            </span>
                          ) : <span style={{ color: "#334155" }}>—</span>}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Save */}
          {students.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {saved && (
                <div style={successMsg}>✓ Marks saved successfully for {filledCount} students!</div>
              )}
              <button onClick={handleSaveAll}
                disabled={saving || filledCount === 0}
                style={{ ...saveBtn, opacity: saving || filledCount === 0 ? 0.5 : 1, cursor: saving || filledCount === 0 ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : `Save All Marks (${filledCount} students)`}
              </button>
            </div>
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
const controls    = { display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" };
const ctrlLabel   = { color: "#334155", fontSize: 10, fontWeight: 700, letterSpacing: "1px" };
const select      = { padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: 12, outline: "none", cursor: "pointer" };
const statsPill   = { display: "flex", gap: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 14px", marginLeft: "auto" };
const tableCard   = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" };
const table       = { width: "100%", borderCollapse: "collapse" };
const th          = { color: "#334155", fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" };
const td          = { color: "#94a3b8", fontSize: 13, padding: "10px 16px" };
const sAvatar     = { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4f9cff22,#7c7cff22)", border: "1px solid rgba(79,156,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f9cff", fontSize: 12, fontWeight: 700, flexShrink: 0 };
const marksInput  = { padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 13, width: 90, outline: "none", textAlign: "center" };
const saveBtn     = { width: "100%", padding: 14, borderRadius: 10, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", border: "none", color: "white", fontSize: 14, fontWeight: 600 };
const successMsg  = { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 16px", color: "#22c55e", fontSize: 13, marginBottom: 10 };
const loading     = { color: "#475569", padding: 40, textAlign: "center" };