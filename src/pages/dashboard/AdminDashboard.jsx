import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api from "../../api/axios";

// ─── Static course list ───────────────────────────────────────────────────────
const COURSES = [
  "B.Tech / BE", "B.Arch", "MBBS", "BAMS / BHMS / BUMS", "B.Sc Nursing",
  "B.Pharm", "B.Sc (General) – Maths / Physics / Chemistry",
  "B.Sc (General) – CS / Stats / Biotechnology", "B.Sc (Hons)",
  "B.Sc Agriculture", "B.Com", "BBA", "BMS", "BBI", "B.Stat",
  "BJMC", "LLB / Law", "B.Des", "BCA", "BTTM", "Digital Marketing",
];

const fetchSubjects = () => api.get("/admin/subjects").then(r => r.data?.data || []);
const fetchTeachers = () => api.get("/admin/teachers").then(r => r.data?.data || []);

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminOverview"],
    queryFn: () => api.get("/admin/overview").then(res => res.data),
  });

  const { data: subjects = [], refetch: refetchSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
  });
  const { data: teachers = [], refetch: refetchTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });

  const dashboard = data?.data || {};

  const [studentForm,      setStudentForm]      = useState({ name: "", email: "", course: "" });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [teacherForm,      setTeacherForm]      = useState({ name: "", email: "", dept: "" });
  const [subjectForm,      setSubjectForm]      = useState({ subject_name: "", credits: "", semester: "" });
  const [assignForm,       setAssignForm]       = useState({ course: "", subject_id: "", teacher_id: "" });

  // ── Toast notifications ───────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const showToast = (msg, ok = true) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, ok }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const toggleSubject = (id) =>
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  // ── ADD STUDENT ───────────────────────────────────────────────────────────
  const addStudent = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.course)
      return showToast("Name, email and course are required", false);
    try {
      const res = await api.post("/admin/add-student", { ...studentForm, subject_ids: selectedSubjects });
      setStudentForm({ name: "", email: "", course: "" });
      setSelectedSubjects([]);
      showToast(res.data?.message || "Student created! Default password: Student@123");
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to add student", false);
    }
  };

  // ── ADD TEACHER ───────────────────────────────────────────────────────────
  const addTeacher = async () => {
    if (!teacherForm.name || !teacherForm.email || !teacherForm.dept)
      return showToast("Name, email and subject are required", false);
    try {
      const res = await api.post("/admin/add-teacher", teacherForm);
      setTeacherForm({ name: "", email: "", dept: "" });
      showToast(res.data?.message || "Teacher created! Default password: Teacher@123");
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
      refetchTeachers();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to add teacher", false);
    }
  };

  // ── CREATE SUBJECT ────────────────────────────────────────────────────────
  const createSubject = async () => {
    if (!subjectForm.subject_name || !subjectForm.semester)
      return showToast("Subject name and semester are required", false);
    try {
      const res = await api.post("/admin/create-subject", subjectForm);
      setSubjectForm({ subject_name: "", credits: "", semester: "" });
      showToast(res.data?.message || "Subject created successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
      refetchSubjects();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create subject", false);
    }
  };

  // ── ASSIGN TEACHER ────────────────────────────────────────────────────────
  const assignTeacher = async () => {
    if (!assignForm.subject_id || !assignForm.teacher_id)
      return showToast("Please select both a subject and a teacher", false);
    try {
      const res = await api.post("/admin/assign-teacher", assignForm);
      setAssignForm({ course: "", subject_id: "", teacher_id: "" });
      showToast(res.data?.message || "Teacher assigned successfully!");
      refetchSubjects();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to assign teacher", false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

  if (isLoading) return <div style={s.loading}>Loading dashboard…</div>;
  if (error)     return <div style={s.loading}>Error loading dashboard</div>;

  return (
    <div style={s.root}>

      {/* ── Toast Stack ── */}
      <div style={s.toastStack}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...s.toast, ...(t.ok ? s.toastOk : s.toastErr) }}>
            <span style={s.toastIcon}>{t.ok ? "✓" : "✕"}</span>
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Top Navbar ── */}
      <header style={s.navbar}>
        <div style={s.brand}>
          <div style={s.brandLogo}>A</div>
          <div>
            <div style={s.brandName}>acadify</div>
            <div style={s.brandSub}>Admin Portal</div>
          </div>
        </div>
        <div style={s.navRight}>
          <button style={s.profileBtn} onClick={() => setShowProfile(v => !v)}>
            <div style={s.avatar}>{initials}</div>
            <div style={s.profileMeta}>
              <div style={s.profileName}>{user?.name || "Admin"}</div>
              <div style={s.profileEmail}>{user?.email || ""}</div>
            </div>
            <span style={s.chevron}>{showProfile ? "▲" : "▼"}</span>
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      {/* ── Profile Dropdown ── */}
      {showProfile && (
        <>
          <div style={s.profileDropdown}>
            <div style={s.dropAvatar}>{initials}</div>
            <div style={s.dropName}>{user?.name || "—"}</div>
            <div style={s.dropBadge}>ADMIN</div>
            <div style={s.dropDivider} />
            {[
              { label: "Email",   value: user?.email },
              { label: "User ID", value: user?.id || user?.userId || "—" },
              { label: "Status",  value: "Active ✓" },
            ].map(({ label, value }) => (
              <div key={label} style={s.dropRow}>
                <span style={s.dropLabel}>{label}</span>
                <span style={s.dropValue}>{value || "—"}</span>
              </div>
            ))}
          </div>
          <div style={s.dropOverlay} onClick={() => setShowProfile(false)} />
        </>
      )}

      {/* ── Page Content ── */}
      <main style={s.page}>
        <h1 style={s.title}>Admin Dashboard</h1>

        {/* Overview cards */}
        <div style={s.row}>
          <StatCard label="Students"       value={dashboard.totalStudents} icon="🎓" />
          <StatCard label="Teachers"       value={dashboard.totalTeachers} icon="👨‍🏫" />
          <StatCard label="Subjects"       value={dashboard.totalCourses}  icon="📚" />
          <StatCard label="Pending Doubts" value={dashboard.pendingDoubts} icon="❓" />
        </div>

        {/* ── Add Student ── */}
        <Section title="➕ Add Student">
          <p style={s.hint}>Default password: <strong>Student@123</strong></p>
          <Input placeholder="Full Name"
            value={studentForm.name}
            onChange={v => setStudentForm({ ...studentForm, name: v })} />
          <Input placeholder="Email"
            value={studentForm.email}
            onChange={v => setStudentForm({ ...studentForm, email: v })} />

          <label style={s.label}>Course / Stream</label>
          <select style={s.select} value={studentForm.course}
            onChange={e => setStudentForm({ ...studentForm, course: e.target.value })}>
            <option value="">— Select a course —</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={s.label}>
            Enroll in Subjects
            <span style={s.badge}>{selectedSubjects.length} selected</span>
          </label>
          {subjects.length === 0 ? (
            <p style={s.noData}>No subjects yet. Create subjects first.</p>
          ) : (
            <div style={s.subjectGrid}>
              {subjects.map(sub => {
                const active = selectedSubjects.includes(sub.subject_id);
                return (
                  <button key={sub.subject_id} onClick={() => toggleSubject(sub.subject_id)}
                    style={{ ...s.chip, ...(active ? s.chipActive : {}) }}>
                    {active ? "✓ " : ""}{sub.subject_name}
                    {sub.semester && <span style={s.semBadge}>Sem {sub.semester}</span>}
                  </button>
                );
              })}
            </div>
          )}
          <Btn label="Add Student" onClick={addStudent} />
        </Section>

        {/* ── Add Teacher ── */}
        <Section title="➕ Add Teacher">
          <p style={s.hint}>Default password: <strong>Teacher@123</strong></p>

          <Input placeholder="Full Name"
            value={teacherForm.name}
            onChange={v => setTeacherForm({ ...teacherForm, name: v })} />
          <Input placeholder="Email"
            value={teacherForm.email}
            onChange={v => setTeacherForm({ ...teacherForm, email: v })} />

          <label style={s.label}>Subject</label>
          <select style={s.select} value={teacherForm.dept}
            onChange={e => setTeacherForm({ ...teacherForm, dept: e.target.value })}>
            <option value="">— Select a subject —</option>
            {subjects.map(sub => (
              <option key={sub.subject_id} value={sub.subject_name}>
                {sub.subject_name}{sub.semester ? ` (Sem ${sub.semester})` : ""}
              </option>
            ))}
          </select>

          <Btn label="Add Teacher" onClick={addTeacher} />
        </Section>

        {/* ── Create Subject ── */}
        <Section title="📚 Create Subject">
          <Input placeholder="Subject Name"
            value={subjectForm.subject_name}
            onChange={v => setSubjectForm({ ...subjectForm, subject_name: v })} />
          <Input placeholder="Semester (e.g. 1)" type="number"
            value={subjectForm.semester}
            onChange={v => setSubjectForm({ ...subjectForm, semester: v })} />
          <Input placeholder="Credits (optional)" type="number"
            value={subjectForm.credits}
            onChange={v => setSubjectForm({ ...subjectForm, credits: v })} />
          <Btn label="Create Subject" onClick={createSubject} />
        </Section>

        {/* ── Assign Teacher to Subject ── */}
        <Section title="🔗 Assign Teacher to Subject">

          <label style={s.label}>Course / Stream</label>
          <select style={s.select} value={assignForm.course}
            onChange={e => setAssignForm({ ...assignForm, course: e.target.value })}>
            <option value="">— Select a course —</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={s.label}>Subject</label>
          <select style={s.select} value={assignForm.subject_id}
            onChange={e => setAssignForm({ ...assignForm, subject_id: e.target.value })}>
            <option value="">— Select a subject —</option>
            {subjects.map(sub => (
              <option key={sub.subject_id} value={sub.subject_id}>
                {sub.subject_name}{sub.semester ? ` (Sem ${sub.semester})` : ""}
              </option>
            ))}
          </select>

          <label style={s.label}>Teacher</label>
          <select style={s.select} value={assignForm.teacher_id}
            onChange={e => setAssignForm({ ...assignForm, teacher_id: e.target.value })}>
            <option value="">— Select a teacher —</option>
            {teachers.map(t => (
              <option key={t.teacher_id} value={t.teacher_id}>
                {t.name}
              </option>
            ))}
          </select>

          <Btn label="Assign Teacher" onClick={assignTeacher} />
        </Section>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon }) => (
  <div style={s.statCard}>
    <span style={s.statIcon}>{icon}</span>
    <p style={s.statValue}>{value ?? "—"}</p>
    <p style={s.statLabel}>{label}</p>
  </div>
);

const Section = ({ title, children }) => (
  <>
    <h2 style={s.sectionTitle}>{title}</h2>
    <div style={s.card}>{children}</div>
  </>
);

const Input = ({ placeholder, value, onChange, type = "text" }) => (
  <input type={type} placeholder={placeholder} value={value}
    onChange={e => onChange(e.target.value)} style={s.input} />
);

const Btn = ({ label, onClick }) => (
  <button onClick={onClick} style={s.btn}>{label}</button>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root:         { minHeight: "100vh", background: "#060d1f", display: "flex", flexDirection: "column" },
  loading:      { padding: 40, color: "white", textAlign: "center" },

  toastStack:   { position: "fixed", top: 80, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" },
  toast:        { display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", minWidth: 280, maxWidth: 380 },
  toastOk:      { background: "#14532d", border: "1px solid #166534" },
  toastErr:     { background: "#7f1d1d", border: "1px solid #991b1b" },
  toastIcon:    { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: "rgba(255,255,255,0.15)" },

  navbar:       { height: 64, background: "#0a0f1e", borderBottom: "1px solid rgba(79,156,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 100 },
  brand:        { display: "flex", alignItems: "center", gap: 12 },
  brandLogo:    { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18 },
  brandName:    { color: "white", fontWeight: 700, fontSize: 17, letterSpacing: "-0.5px" },
  brandSub:     { color: "#4f9cff", fontSize: 10, fontWeight: 500 },
  navRight:     { display: "flex", alignItems: "center", gap: 12 },
  profileBtn:   { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "7px 12px", cursor: "pointer" },
  avatar:       { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4f9cff33,#7c7cff33)", border: "1px solid rgba(79,156,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f9cff", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  profileMeta:  { textAlign: "left" },
  profileName:  { color: "white", fontSize: 12, fontWeight: 600 },
  profileEmail: { color: "#64748b", fontSize: 10 },
  chevron:      { color: "#4f9cff", fontSize: 10 },
  logoutBtn:    { padding: "8px 16px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  profileDropdown: { position: "fixed", top: 72, right: 24, width: 260, background: "#0d1425", border: "1px solid rgba(79,156,255,0.12)", borderRadius: 14, zIndex: 200, padding: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" },
  dropAvatar:   { width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4f9cff,#7c7cff)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: 700, margin: "0 auto 12px" },
  dropName:     { color: "white", fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 6 },
  dropBadge:    { display: "block", textAlign: "center", background: "rgba(79,156,255,0.1)", border: "1px solid rgba(79,156,255,0.2)", color: "#4f9cff", fontSize: 10, fontWeight: 700, letterSpacing: "1px", padding: "3px 10px", borderRadius: 6, width: "fit-content", margin: "0 auto" },
  dropDivider:  { height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" },
  dropRow:      { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  dropLabel:    { color: "#475569", fontSize: 12 },
  dropValue:    { color: "#cbd5e1", fontSize: 12, fontWeight: 500 },
  dropOverlay:  { position: "fixed", inset: 0, zIndex: 199 },

  page:         { padding: "32px 28px", maxWidth: 960, width: "100%" },
  title:        { fontSize: 24, fontWeight: 700, color: "white", marginBottom: 24 },
  row:          { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 },
  statCard:     { background: "#1e293b", padding: "20px 24px", borderRadius: 12, flex: "1 1 160px", textAlign: "center" },
  statIcon:     { fontSize: 26 },
  statValue:    { fontSize: 30, fontWeight: 700, color: "white", margin: "6px 0 2px" },
  statLabel:    { color: "#94a3b8", fontSize: 13, margin: 0 },
  sectionTitle: { marginTop: 32, marginBottom: 6, fontSize: 17, fontWeight: 600, color: "white" },
  card:         { background: "#1e293b", padding: 20, borderRadius: 12 },
  hint:         { color: "#94a3b8", fontSize: 13, marginBottom: 8 },
  label:        { display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 13, marginTop: 14, marginBottom: 6 },
  noData:       { color: "#64748b", fontSize: 13, fontStyle: "italic", marginTop: 6 },
  input:        { display: "block", padding: "9px 12px", marginTop: 10, borderRadius: 6, width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155", boxSizing: "border-box", fontSize: 14 },
  select:       { display: "block", padding: "9px 12px", borderRadius: 6, width: "100%", background: "#0f172a", color: "white", border: "1px solid #334155", boxSizing: "border-box", fontSize: 14, cursor: "pointer" },
  badge:        { marginLeft: "auto", background: "#2563eb", color: "white", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600 },
  subjectGrid:  { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip:         { padding: "6px 12px", borderRadius: 6, fontSize: 13, border: "1px solid #334155", background: "#0f172a", color: "#94a3b8", cursor: "pointer" },
  chipActive:   { background: "#1d4ed8", border: "1px solid #3b82f6", color: "white" },
  semBadge:     { marginLeft: 6, fontSize: 11, color: "#93c5fd", background: "#1e3a5f", padding: "1px 5px", borderRadius: 4 },
  btn:          { marginTop: 16, background: "#2563eb", padding: "9px 20px", borderRadius: 6, color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 },
};