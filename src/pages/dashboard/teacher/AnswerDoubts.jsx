import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";

export default function AnswerDoubts() {
  const qc = useQueryClient();
  const [answering, setAnswering] = useState(null); // doubt object
  const [answerText, setAnswerText] = useState("");
  const [filter, setFilter] = useState("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-doubts"],
    queryFn: () => api.get("/teacher/doubts").then(r => r.data),
  });

  const doubts = Array.isArray(data) ? data : (data?.data || []);
  const filtered = filter === "ALL" ? doubts : doubts.filter(d => d.status === filter);

  const mutation = useMutation({
    mutationFn: ({ doubt_id, answer }) =>
      api.post("/teacher/doubt/answer", { doubt_id, answer }),
    onSuccess: () => {
      qc.invalidateQueries(["teacher-doubts"]);
      setAnswering(null);
      setAnswerText("");
    },
  });

  const handleSubmit = () => {
    if (!answerText.trim() || !answering) return;
    mutation.mutate({ doubt_id: answering.doubt_id, answer: answerText });
  };

  if (isLoading) return <div style={loading}>Loading doubts...</div>;

  return (
    <div style={page}>
      <div style={pageTitle}>Answer Doubts</div>
      <div style={pageSub}>Respond to student questions tagged to you</div>

      {/* Filter tabs */}
      <div style={tabs}>
        {["PENDING", "ANSWERED", "ALL"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...tab, ...(filter === f ? tabActive : {}) }}>
            {f === "PENDING" ? `⏳ Pending (${doubts.filter(d=>d.status==="PENDING").length})`
             : f === "ANSWERED" ? `✓ Answered` : "All"}
          </button>
        ))}
      </div>

      {/* Doubt cards */}
      {filtered.length === 0 ? (
        <div style={empty}>No {filter.toLowerCase()} doubts found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((d, i) => (
            <motion.div key={d.doubt_id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ ...doubtCard, ...(d.status === "ANSWERED" ? answeredCard : {}) }}>

              <div style={doubtTop}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={studentBadge}>{d.student?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{d.student}</div>
                    {d.subject && <div style={{ color: "#4f9cff", fontSize: 11 }}>{d.subject}</div>}
                  </div>
                </div>
                <span style={{
                  ...statusTag,
                  background: d.status === "ANSWERED" ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
                  color: d.status === "ANSWERED" ? "#22c55e" : "#f59e0b",
                  border: `1px solid ${d.status === "ANSWERED" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                }}>
                  {d.status}
                </span>
              </div>

              <p style={questionText}>{d.question}</p>

              {d.answer && (
                <div style={answerBox}>
                  <div style={answerLabel}>Your Answer</div>
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{d.answer}</p>
                </div>
              )}

              {d.status === "PENDING" && (
                <button onClick={() => { setAnswering(d); setAnswerText(""); }}
                  style={answerBtn}>
                  Answer this doubt →
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Answer modal */}
      <AnimatePresence>
        {answering && (
          <>
            <motion.div style={backdrop}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAnswering(null)} />
            <motion.div style={modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}>

              <div style={modalHeader}>
                <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Answer Doubt</div>
                <button onClick={() => setAnswering(null)} style={closeBtn}>✕</button>
              </div>

              <div style={modalBody}>
                <div style={qLabel}>QUESTION FROM {answering.student?.toUpperCase()}</div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                  {answering.question}
                </p>

                <div style={qLabel}>YOUR ANSWER</div>
                <textarea
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  style={textarea}
                  rows={5}
                />

                <button onClick={handleSubmit}
                  disabled={mutation.isPending || !answerText.trim()}
                  style={{
                    ...submitBtn,
                    opacity: mutation.isPending || !answerText.trim() ? 0.5 : 1,
                    cursor: mutation.isPending || !answerText.trim() ? "not-allowed" : "pointer",
                  }}>
                  {mutation.isPending ? "Submitting..." : "Submit Answer →"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const page        = { padding: "32px", maxWidth: 900, margin: "0 auto" };
const pageTitle   = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const pageSub     = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 24 };
const tabs        = { display: "flex", gap: 8, marginBottom: 20 };
const tab         = { padding: "7px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", fontSize: 12, fontWeight: 500, cursor: "pointer" };
const tabActive   = { background: "rgba(79,156,255,0.1)", border: "1px solid rgba(79,156,255,0.25)", color: "#4f9cff" };
const doubtCard   = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px" };
const answeredCard= { borderColor: "rgba(34,197,94,0.08)" };
const doubtTop    = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 };
const studentBadge= { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4f9cff,#7c7cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 };
const statusTag   = { fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", padding: "3px 8px", borderRadius: 6 };
const questionText= { color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: "0 0 12px 0" };
const answerBox   = { background: "rgba(34,197,94,0.04)", borderLeft: "3px solid #22c55e", borderRadius: "0 8px 8px 0", padding: "10px 14px", marginBottom: 12 };
const answerLabel = { color: "#22c55e", fontSize: 10, fontWeight: 700, letterSpacing: "1px", marginBottom: 6 };
const answerBtn   = { padding: "8px 16px", borderRadius: 8, background: "rgba(79,156,255,0.08)", border: "1px solid rgba(79,156,255,0.2)", color: "#4f9cff", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const backdrop    = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, backdropFilter: "blur(4px)" };
const modal       = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, maxWidth: "90vw", background: "#0d1425", border: "1px solid rgba(79,156,255,0.15)", borderRadius: 16, zIndex: 101, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" };
const modalHeader = { padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" };
const modalBody   = { padding: 24 };
const closeBtn    = { background: "rgba(255,255,255,0.05)", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, padding: "6px 10px", borderRadius: 6 };
const qLabel      = { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 };
const textarea    = { width: "100%", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: 13, resize: "vertical", outline: "none", lineHeight: 1.6, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 16 };
const submitBtn   = { width: "100%", padding: 13, borderRadius: 10, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", border: "none", color: "white", fontSize: 14, fontWeight: 600, transition: "all 0.2s" };
const empty       = { color: "#334155", padding: "48px 0", textAlign: "center", fontSize: 13, fontStyle: "italic" };
const loading     = { color: "#475569", padding: 40, textAlign: "center" };