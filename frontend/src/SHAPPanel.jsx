import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ttStyle = {
  backgroundColor: "rgba(10,15,28,0.95)",
  border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: 12,
  padding: "10px 14px",
  color: "#e2e8f0",
  fontSize: 13,
};

export default function SHAPPanel({ topFactors, location }) {
  if (!topFactors || topFactors.length === 0) {
    return (
      <div className="glass-card shap-empty">
        <Brain size={32} className="shap-empty-icon" />
        <p>No SHAP explanation available for this location yet.</p>
        <small className="text-muted">Select a zone on the map to view AI signals</small>
      </div>
    );
  }

  const chartData = topFactors.map((item) => ({
    feature: item.feature.length > 16 ? `${item.feature.substring(0, 16)}…` : item.feature,
    impact: parseFloat(item.impact),
    fullName: item.feature,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card shap-panel"
    >
      <div className="shap-header">
        <div className="shap-title-row">
          <div className="shap-icon-wrap">
            <Brain size={20} />
          </div>
          <div>
            <h3>SHAP Analysis</h3>
            <p className="text-muted">{location} — key congestion drivers</p>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="feature"
              type="category"
              width={130}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={ttStyle}
              formatter={(value) => [`${value > 0 ? "+" : ""}${value}`, "Impact"]}
            />
            <Bar dataKey="impact" radius={[0, 8, 8, 0]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.impact > 0 ? "#f43f5e" : "#10b981"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="shap-legend">
        <span className="shap-legend-item">
          <span className="shap-dot red" /> Increases congestion
        </span>
        <span className="shap-legend-item">
          <span className="shap-dot green" /> Reduces congestion
        </span>
      </div>
    </motion.div>
  );
}
