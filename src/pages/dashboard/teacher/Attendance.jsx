import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../../api/axios";

export default function TeacherAttendance() {
  const qc = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({}); // { student_id: "PRESENT"|"ABSENT" }
  const [saved, setSaved] = useState(false);

  const { data: classesData } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => api.get("/teacher/classes").then(r => r.data),
  });
  const classes = Array.isArray(classesData) ? classesData : (classesData?.data || []);

  const { data: listData, isLoading } = useQuery({
    queryKey: ["att-list", selectedSubject, date],
    queryFn: () => api.get(`/teacher/attendance/list?subject_id=${selectedSubject}&date=${date}`)
      .then(r => r.data?.data || r.data),
    enabled: !!selectedSubject,
    onSuccess: (d) => {
      // Pre-fill with existing statuses
      const map = {};
      (d?.students || []).forEach(s => {
        if (s.status !== "NOT_MARKED") map[s.student_id] = s.status;
      });
      setAttendance(map);
    },
  });
  const students = listData?.students || [];

  const mutation = useMutation({
    mutationFn: (records) => api.post("/teacher/attendance/mark", {
      subject_id: selectedSubject,
      date,
      records,
    }),
    onSuccess: () => {
      qc.invalidateQueries(["att-list"]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const toggle = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? undefined : status }));
  };

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s.student_id] = status; });
    setAttendance(map);
  };

  const handleSave = () => {
    const records = students
      .filter(s => attendance[s.student_id])
      .map(s => ({ student_id: s.student_id, status: attendance[s.student_id] }));
    if (records.length === 0) return;
    mutation.mutate(records);
  };

  const presentCount = Object.values(attendance).filter(v => v === "PRESENT").length;
  const absentCount  = Object.values(attendance).filter(v => v === "ABSENT").length;
  const unmarked     = students.length - presentCount - absentCount;

  return (
    <div style={page}>
      <div style={pageTitle}>Attendance</div>
      <div style={pageSub}>Mark attendance for your class</div>

      {/* Subject selector */}
      <div style={subjectRow}>
        {classes.map(c => (
          <button key={c.subject_id}
            onClick={() => { setSelectedSubject(c.subject_id); setAttendance({}); }}
            style={{ ...subjectBtn, ...(selectedSubject === c.subject_id ? subjectActive : {}) }}>
            {c.subject_name}
          </button>
        ))}
      </div>

      {selectedSubject && (
        <>
          {/* Date picker + controls */}
          <div style={controls}>
            <div style={dateWrapper}>
              <span style={dateLabel}>DATE</span>
              <input type="date" value={date}
                onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                style={dateInput} />
            </div>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={() => markAll("PRESENT")} style={markAllBtn("#22c55e")}>✓ Mark All Present</button>
              <button onClick={() => markAll("ABSENT")}  style={markAllBtn("#ef4444")}>✗ Mark All Absent</button>
            </div>
          </div>

          {/* Summary bar */}
          <div style={summaryBar}>
            <div style={summaryItem("#22c55e")}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{presentCount}</span>
              <span style={{ fontSize: 11 }}>Present</span>
            </div>
            <div style={summaryItem("#ef4444")}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{absentCount}</span>
              <span style={{ fontSize: 11 }}>Absent</span>
            </div>
            <div style={summaryItem("#475569")}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{unmarked}</span>
              <span style={{ fontSize: 11 }}>Unmarked</span>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {students.length > 0 && (
                <div style={pctBar}>
                  <div style={{ ...pctFill, width: `${(presentCount/students.length)*100}%` }} />
                </div>
              )}
              <div style={{ color: "#22c55e", fontSize: 12, fontWeight: 600, textAlign: "right", marginTop: 4 }}>
                {students.length > 0 ? Math.round((presentCount/students.length)*100) : 0}% present
              </div>
            </div>
          </div>

          {isLoading ? <div style={loading}>Loading students...</div> : (
            <>
              <div style={studentGrid}>
                {students.map((s, i) => {
                  const status = attendance[s.student_id];
                  return (
                    <motion.div key={s.student_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{
                        ...studentCard,
                        ...(status === "PRESENT" ? presentCard : {}),
                        ...(status === "ABSENT"  ? absentCard  : {}),
                      }}>
                      <div style={studentTop}>
                        <div style={{
                          ...avatar,
                          background: status === "PRESENT" ? "rgba(34,197,94,0.15)" :
                                      status === "ABSENT"  ? "rgba(239,68,68,0.15)" : "rgba(79,156,255,0.1)",
                          color: status === "PRESENT" ? "#22c55e" :
                                 status === "ABSENT"  ? "#ef4444" : "#4f9cff",
                        }}>
                          {s.name[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "white", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                          <div style={{ color: "#475569", fontSize: 11 }}>ID: {s.student_id}</div>
                        </div>
                      </div>
                      <div style={btnRow}>
                        <button onClick={() => toggle(s.student_id, "PRESENT")}
                          style={{ ...attBtn, ...(status === "PRESENT" ? presentBtnActive : {}) }}>
                          ✓ Present
                        </button>
                        <button onClick={() => toggle(s.student_id, "ABSENT")}
                          style={{ ...attBtn, ...(status === "ABSENT" ? absentBtnActive : {}) }}>
                          ✗ Absent
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Save button */}
              {students.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  {saved && (
                    <div style={successMsg}>✓ Attendance saved successfully!</div>
                  )}
                  <button onClick={handleSave}
                    disabled={mutation.isPending || Object.keys(attendance).length === 0}
                    style={{
                      ...saveBtn,
                      opacity: mutation.isPending || Object.keys(attendance).length === 0 ? 0.5 : 1,
                      cursor: mutation.isPending || Object.keys(attendance).length === 0 ? "not-allowed" : "pointer",
                    }}>
                    {mutation.isPending ? "Saving..." : `Save Attendance (${Object.keys(attendance).length} marked)`}
                  </button>
                </div>
              )}
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
const subjectBtn  = { padding: "10px 18px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 500 };
const subjectActive={ background: "rgba(79,156,255,0.08)", border: "1px solid rgba(79,156,255,0.25)", color: "white" };
const controls    = { display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" };
const dateWrapper = { display: "flex", flexDirection: "column", gap: 4 };
const dateLabel   = { color: "#334155", fontSize: 10, fontWeight: 700, letterSpacing: "1px" };
const dateInput   = { padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: 13, outline: "none" };
const markAllBtn  = c => ({ padding: "8px 14px", borderRadius: 8, background: c + "10", border: `1px solid ${c}33`, color: c, fontSize: 12, fontWeight: 600, cursor: "pointer" });
const summaryBar  = { display: "flex", alignItems: "center", gap: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 20px", marginBottom: 16 };
const summaryItem = c => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: c });
const pctBar      = { height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", width: 120 };
const pctFill     = { height: "100%", borderRadius: 3, background: "#22c55e", transition: "width 0.4s" };
const studentGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 };
const studentCard = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px" };
const presentCard = { borderColor: "rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.03)" };
const absentCard  = { borderColor: "rgba(239,68,68,0.2)",  background: "rgba(239,68,68,0.03)" };
const studentTop  = { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 };
const avatar      = { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 };
const btnRow      = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 };
const attBtn      = { padding: "6px 0", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#475569", fontSize: 11, fontWeight: 600, cursor: "pointer" };
const presentBtnActive = { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" };
const absentBtnActive  = { background: "rgba(239,68,68,0.12)",  border: "1px solid rgba(239,68,68,0.3)",  color: "#ef4444" };
const saveBtn     = { width: "100%", padding: 14, borderRadius: 10, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", border: "none", color: "white", fontSize: 14, fontWeight: 600 };
const successMsg  = { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 16px", color: "#22c55e", fontSize: 13, marginBottom: 10 };
const loading     = { color: "#475569", padding: 40, textAlign: "center" };