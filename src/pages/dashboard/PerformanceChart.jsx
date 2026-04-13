import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d1425",
      border: "1px solid rgba(79,156,255,0.15)",
      borderRadius: "10px",
      padding: "10px 14px",
    }}>
      <div style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "3px" }}>{label}</div>
      <div style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>{payload[0].value}%</div>
    </div>
  );
};

export default function PerformanceChart({ data }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding: "24px",
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ color: "white", fontSize: "16px", fontWeight: "700", margin: 0 }}>
          Semester Performance
        </h2>
        <p style={{ color: "#475569", fontSize: "12px", marginTop: "4px" }}>
          Marks per semester
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="semester"
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="marks" radius={[6, 6, 0, 0]}>
            {(data || []).map((entry, i) => (
              <Cell
                key={i}
                fill={entry.marks >= 80 ? "#22c55e" : entry.marks >= 60 ? "#4f9cff" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginTop: "12px", justifyContent: "center" }}>
        {[["#22c55e", "≥ 80%"], ["#4f9cff", "60–79%"], ["#ef4444", "< 60%"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: c }} />
            <span style={{ color: "#475569", fontSize: "11px" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}