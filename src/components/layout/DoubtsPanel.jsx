import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function DoubtsPanel({ isOpen, onClose }) {
  const [tab,        setTab]        = useState("ask");
  const [question,   setQuestion]   = useState("");
  const [subjectId,  setSubjectId]  = useState("");
  const [teacherId,  setTeacherId]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);

  // ── Fetch all subjects enrolled by this student ───────────────────────────
  const { data: subjectsRaw = [] } = useQuery({
    queryKey: ["student-subjects"],
    queryFn: () => api.get("/student/subjects").then(r => r.data?.data || r.data || []),
    enabled: isOpen,
  });

  // ── Fetch all teachers — filtered client-side by selected subject ─────────
  const { data: teachersRaw = [] } = useQuery({
    queryKey: ["student-teachers"],
    queryFn: () => api.get("/student/teachers").then(r => r.data?.data || r.data || []),
    enabled: isOpen,
  });

  const { data: doubtsRaw, refetch: refetchDoubts } = useQuery({
    queryKey: ["doubts"],
    queryFn: () => api.get("/student/doubts").then(r => r.data),
    enabled: isOpen,
  });

  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const allTeachers = Array.isArray(teachersRaw) ? teachersRaw : (teachersRaw?.data || []);
  const doubts   = Array.isArray(doubtsRaw)   ? doubtsRaw   : (doubtsRaw?.data   || []);

  // Filter teachers to only those who teach the selected subject
  const filteredTeachers = subjectId
    ? allTeachers.filter(t => String(t.subject_id) === String(subjectId))
    : [];

  // Reset teacher when subject changes
  const handleSubjectChange = (e) => {
    setSubjectId(e.target.value);
    setTeacherId("");
  };

  const handleSubmit = async () => {
    if (!question.trim() || !subjectId) return;
    setSubmitting(true);
    try {
      await api.post("/student/doubt", {
        question,
        subject_id: parseInt(subjectId),
        teacher_id: teacherId ? parseInt(teacherId) : undefined,
      });
      setQuestion("");
      setSubjectId("");
      setTeacherId("");
      setSuccess(true);
      refetchDoubts();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s) => {
    if (s === "ANSWERED" || s === "answered") return "#22c55e";
    if (s === "PENDING"  || s === "pending")  return "#f59e0b";
    return "#64748b";
  };

  const canSubmit = !submitting && question.trim().length > 0 && subjectId !== "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div style={S.backdrop}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />

          {/* Panel */}
          <motion.div style={S.panel}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}>

            {/* Header */}
            <div style={S.header}>
              <div>
                <div style={S.headerTitle}>Ask a Doubt</div>
                <div style={S.headerSub}>Ask questions & track answers</div>
              </div>
              <button onClick={onClose} style={S.closeBtn}>✕</button>
            </div>

            {/* Tabs */}
            <div style={S.tabs}>
              {["ask", "history"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
                  {t === "ask" ? "✦ Ask Doubt" : `◈ My Doubts (${doubts.length})`}
                </button>
              ))}
            </div>

            <div style={S.body}>
              {tab === "ask" ? (
                <motion.div key="ask"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Subject — live from DB */}
                  <div>
                    <label style={S.label}>Subject <span style={S.req}>*</span></label>
                    {subjects.length === 0 ? (
                      <div style={S.emptyHint}>No subjects enrolled yet.</div>
                    ) : (
                      <select value={subjectId} onChange={handleSubjectChange} style={S.select}>
                        <option value="">— Select a subject —</option>
                        {subjects.map(s => (
                          <option key={s.subject_id} value={s.subject_id}>
                            {s.subject_name}{s.semester ? ` (Sem ${s.semester})` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Teacher — filtered by subject */}
                  <div>
                    <label style={S.label}>
                      Tag a Teacher
                      <span style={S.optional}> (optional)</span>
                    </label>
                    {!subjectId ? (
                      <div style={S.emptyHint}>Select a subject first to see its teachers.</div>
                    ) : filteredTeachers.length === 0 ? (
                      <div style={S.emptyHint}>No teacher assigned to this subject yet.</div>
                    ) : (
                      <select value={teacherId}
                        onChange={e => setTeacherId(e.target.value)} style={S.select}>
                        <option value="">Any available teacher</option>
                        {filteredTeachers.map(t => (
                          <option key={t.teacher_id} value={t.teacher_id}>
                            {t.name}{t.department ? ` — ${t.department}` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Question */}
                  <div>
                    <label style={S.label}>Your Question <span style={S.req}>*</span></label>
                    <textarea value={question}
                      onChange={e => setQuestion(e.target.value)}
                      placeholder="Describe your doubt in detail..."
                      style={S.textarea} rows={5} />
                    <div style={S.charCount}>{question.length} chars</div>
                  </div>

                  {/* Success banner */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={S.successMsg}>
                        ✓ Doubt submitted! A teacher will respond soon.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={handleSubmit} disabled={!canSubmit}
                    style={{ ...S.submitBtn, opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? "pointer" : "not-allowed" }}>
                    {submitting ? "Submitting..." : "Submit Doubt →"}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="history"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {doubts.length === 0 ? (
                    <div style={S.empty}>
                      <div style={S.emptyIcon}>◈</div>
                      <div>No doubts submitted yet</div>
                    </div>
                  ) : (
                    doubts.map((d, i) => (
                      <motion.div key={d.doubt_id || i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        style={S.doubtCard}>

                        <div style={S.doubtTop}>
                          {d.subject_name && (
                            <span style={S.subjectTag}>{d.subject_name}</span>
                          )}
                          <span style={{ ...S.statusDot, background: statusColor(d.status), marginLeft: "auto" }} />
                          <span style={{ ...S.statusText, color: statusColor(d.status) }}>
                            {d.status || "PENDING"}
                          </span>
                        </div>

                        {d.teacher_name && (
                          <div style={S.teacherTag}>👤 {d.teacher_name}</div>
                        )}

                        <p style={S.questionText}>{d.question}</p>

                        {d.answer ? (
                          <div style={S.answerBox}>
                            <div style={S.answerLabel}>Answer</div>
                            <p style={S.answerText}>{d.answer}</p>
                          </div>
                        ) : (
                          <p style={S.waitingText}>Waiting for teacher response...</p>
                        )}
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const S = {
  backdrop:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(4px)" },
  panel:       { position: "fixed", right: 0, top: 0, width: 420, maxWidth: "95vw", height: "100vh", background: "#0d1425", borderLeft: "1px solid rgba(79,156,255,0.1)", zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-12px 0 48px rgba(0,0,0,0.5)" },
  header:      { padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { color: "white", fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" },
  headerSub:   { color: "#4f9cff", fontSize: 12, fontWeight: 500, marginTop: 3 },
  closeBtn:    { background: "rgba(255,255,255,0.05)", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, padding: "8px 12px", borderRadius: 8 },
  tabs:        { display: "flex", padding: "12px 24px 0", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.05)" },
  tab:         { padding: "8px 16px 12px", background: "none", border: "none", color: "#475569", fontSize: 13, fontWeight: 500, cursor: "pointer", borderBottom: "2px solid transparent", transition: "all 0.2s" },
  tabActive:   { color: "#4f9cff", borderBottom: "2px solid #4f9cff" },
  body:        { flex: 1, overflowY: "auto", padding: 24 },
  label:       { display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", marginBottom: 8, textTransform: "uppercase" },
  req:         { color: "#ef4444", marginLeft: 2 },
  optional:    { color: "#475569", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 },
  select:      { width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: 13, outline: "none", cursor: "pointer", boxSizing: "border-box" },
  emptyHint:   { color: "#334155", fontSize: 12, fontStyle: "italic", padding: "8px 0" },
  textarea:    { width: "100%", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: 13, resize: "vertical", outline: "none", lineHeight: 1.6, fontFamily: "inherit", boxSizing: "border-box" },
  charCount:   { color: "#334155", fontSize: 11, textAlign: "right", marginTop: 4 },
  submitBtn:   { width: "100%", padding: 14, borderRadius: 10, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", border: "none", color: "white", fontSize: 14, fontWeight: 600, letterSpacing: "0.3px", transition: "all 0.2s" },
  successMsg:  { padding: "12px 16px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: 13, fontWeight: 500 },
  empty:       { textAlign: "center", color: "#334155", padding: "60px 20px", fontSize: 14 },
  emptyIcon:   { fontSize: 40, marginBottom: 16, color: "#1e293b" },
  doubtCard:   { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 },
  doubtTop:    { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  subjectTag:  { background: "rgba(79,156,255,0.08)", border: "1px solid rgba(79,156,255,0.15)", color: "#4f9cff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.5px" },
  teacherTag:  { color: "#475569", fontSize: 11, marginBottom: 8 },
  statusDot:   { width: 6, height: 6, borderRadius: "50%" },
  statusText:  { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  questionText:{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: 0 },
  answerBox:   { marginTop: 12, padding: 12, borderRadius: 8, background: "rgba(34,197,94,0.04)", borderLeft: "3px solid #22c55e" },
  answerLabel: { color: "#22c55e", fontSize: 10, fontWeight: 700, letterSpacing: "1px", marginBottom: 6 },
  answerText:  { color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 },
  waitingText: { color: "#334155", fontSize: 12, marginTop: 10, fontStyle: "italic" },
};