import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, MapPin } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";

const HOURLY_DATA = Array.from({ length: 24 }, (_, i) => {
  const peak = (i >= 7 && i <= 10) || (i >= 17 && i <= 20) ? 1 : 0;
  const base = 300 + Math.sin((i / 24) * Math.PI * 2) * 150;
  return {
    label: `${i < 10 ? "0" : ""}${i}:00`,
    volume: Math.round(base + peak * 400 + Math.random() * 80),
    speed: Math.round(45 - peak * 18 + Math.random() * 8),
  };
});

const ZONE_DATA = [
  { zone: "CP", congestion: 87 },
  { zone: "Cyber Hub", congestion: 72 },
  { zone: "IGI", congestion: 65 },
  { zone: "Noida 18", congestion: 58 },
  { zone: "Dwarka", congestion: 45 },
  { zone: "Rohini", congestion: 52 },
];

const WEEKLY_DATA = [
  { day: "Mon", morning: 82, evening: 90 },
  { day: "Tue", morning: 78, evening: 85 },
  { day: "Wed", morning: 80, evening: 88 },
  { day: "Thu", morning: 76, evening: 84 },
  { day: "Fri", morning: 85, evening: 95 },
  { day: "Sat", morning: 45, evening: 60 },
  { day: "Sun", morning: 30, evening: 42 },
];

const PEAK_MATRIX = [
  { period: "6-8 AM", mon: 65, tue: 62, wed: 68, thu: 60, fri: 72, sat: 30, sun: 20 },
  { period: "8-10 AM", mon: 92, tue: 88, wed: 90, thu: 85, fri: 95, sat: 45, sun: 28 },
  { period: "12-2 PM", mon: 55, tue: 52, wed: 58, thu: 50, fri: 60, sat: 65, sun: 55 },
  { period: "4-6 PM", mon: 78, tue: 75, wed: 80, thu: 72, fri: 85, sat: 50, sun: 35 },
  { period: "6-8 PM", mon: 95, tue: 90, wed: 92, thu: 88, fri: 98, sat: 60, sun: 40 },
  { period: "8-10 PM", mon: 70, tue: 65, wed: 72, thu: 62, fri: 80, sat: 55, sun: 38 },
];

const ttStyle = {
  backgroundColor: "rgba(10,15,28,0.95)", border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: 12, padding: "10px 14px", color: "#e2e8f0", fontSize: 13,
};

function HeatCell({ value }) {
  const i = Math.min(value / 100, 1);
  const bg = i > 0.8 ? `rgba(239,68,68,${0.15+i*0.4})` : i > 0.6 ? `rgba(249,115,22,${0.15+i*0.35})` : i > 0.4 ? `rgba(251,191,36,${0.1+i*0.25})` : `rgba(34,197,94,${0.1+i*0.2})`;
  return <td className="heat-cell" style={{ background: bg }}>{value}</td>;
}

export default function AnalyticsView() {
  return (
    <motion.section key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><BarChart3 size={28} className="page-title-icon" /> Analytics</h1>
          <p className="page-subtitle">Deep traffic pattern analysis across Delhi-NCR</p>
        </div>
      </div>

      <div className="analytics-grid-2">
        <div className="glass-card chart-card">
          <div className="chart-header">
            <div><h3>Hourly Traffic Volume</h3><p className="text-muted">24-hour vehicle count</p></div>
            <div className="chart-badge"><TrendingUp size={14} /> Today</div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={HOURLY_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs><linearGradient id="vG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(148,163,184,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2.5} fill="url(#vG)" dot={false} activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="chart-header">
            <div><h3>Average Speed</h3><p className="text-muted">km/h across zones</p></div>
            <div className="chart-badge cyan"><Clock size={14} /> Hourly</div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={HOURLY_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs><linearGradient id="sG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(148,163,184,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={ttStyle} />
                <Area type="monotone" dataKey="speed" stroke="#06b6d4" strokeWidth={2.5} fill="url(#sG)" dot={false} activeDot={{ r: 5, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="analytics-grid-2">
        <div className="glass-card chart-card">
          <div className="chart-header">
            <div><h3>Zone Congestion</h3><p className="text-muted">Current index by zone</p></div>
            <div className="chart-badge rose"><MapPin size={14} /> Live</div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ZONE_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.06)" vertical={false} />
                <XAxis dataKey="zone" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="congestion" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {ZONE_DATA.map((e, i) => <Cell key={i} fill={e.congestion > 80 ? "#f43f5e" : e.congestion > 60 ? "#f59e0b" : "#10b981"} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="chart-header"><div><h3>Weekly Pattern</h3><p className="text-muted">Morning vs Evening peaks</p></div></div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={WEEKLY_DATA} cx="50%" cy="50%" outerRadius="68%">
                <PolarGrid stroke="rgba(148,163,184,0.12)" />
                <PolarAngleAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Morning" dataKey="morning" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Evening" dataKey="evening" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card chart-card">
        <div className="chart-header"><div><h3>Peak Hours Heatmap</h3><p className="text-muted">Congestion intensity by time and day</p></div></div>
        <div className="heatmap-wrapper">
          <table className="heatmap-table">
            <thead><tr><th>Period</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr></thead>
            <tbody>
              {PEAK_MATRIX.map((r) => (
                <tr key={r.period}><td className="heat-label">{r.period}</td><HeatCell value={r.mon} /><HeatCell value={r.tue} /><HeatCell value={r.wed} /><HeatCell value={r.thu} /><HeatCell value={r.fri} /><HeatCell value={r.sat} /><HeatCell value={r.sun} /></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
}
