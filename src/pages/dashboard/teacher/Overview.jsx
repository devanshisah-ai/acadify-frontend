import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../../api/axios";

const StatCard = ({ title, value, accent, icon, delay }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{ ...card, borderColor: accent + "22" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <div style={lbl}>{title}</div>
        <div style={{ color: "white", fontSize: 32, fontWeight: 700, letterSpacing: "-1px", marginTop: 8, lineHeight: 1 }}>{value ?? "—"}</div>
      </div>
      <span style={{ fontSize: 22, opacity: 0.6 }}>{icon}</span>
    </div>
    <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg,${accent},transparent)`, marginTop: 18 }} />
  </motion.div>
);

export default function TeacherOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-overview"],
    queryFn: () => api.get("/teacher/overview").then(r => r.data),
  });

  const d = data?.data || data || {};

  if (isLoading) return <div style={loading}>Loading overview...</div>;

  return (
    <div style={page}>
      <div style={title}>Overview</div>
      <div style={sub}>Your teaching dashboard at a glance</div>

      <div style={grid3}>
        <StatCard title="CLASSES TAUGHT"  value={d.totalClasses}  accent="#4f9cff" icon="⊙" delay={0}    />
        <StatCard title="TOTAL STUDENTS"  value={d.totalStudents} accent="#22c55e" icon="⊛" delay={0.08} />
        <StatCard title="PENDING DOUBTS"  value={d.pendingDoubts} accent="#f59e0b" icon="✦" delay={0.16} />
      </div>
    </div>
  );
}

const page  = { padding: "32px", maxWidth: 1100, margin: "0 auto" };
const title = { color: "white", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" };
const sub   = { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 28 };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 };
const card  = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px" };
const lbl   = { color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" };
const loading = { color: "#475569", padding: 40, textAlign: "center" };