import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DoubtsPanel from "./DoubtsPanel";

export default function DashboardLayout() {
  const [doubtsOpen, setDoubtsOpen] = useState(false);

  return (
    <div style={styles.layout}>
      <Sidebar onOpenDoubts={() => setDoubtsOpen(true)} />

      <main style={styles.main}>
        <Outlet />
      </main>

      <DoubtsPanel
        isOpen={doubtsOpen}
        onClose={() => setDoubtsOpen(false)}
      />
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#0b1020",
  },
  main: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },
};