import { useState, useEffect, useCallback } from "react";
import * as Demo from "../demoData";
import { Zap, RefreshCcw, CloudRain, Sun, CloudLightning, Cloud, Thermometer, Wind, Droplets, AlertTriangle, CheckCircle, Clock, Radio, Camera, Train, Fuel, Shield, Plane, Activity, TrendingUp, TrendingDown, Minus, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_COLORS = { Critical: "#ef4444", "Very High": "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#10b981", Moderate: "#f59e0b" };
const TREND_ICON = { worsening: <TrendingUp size={14} style={{color:"#f43f5e"}} />, improving: <TrendingDown size={14} style={{color:"#10b981"}} />, stable: <Minus size={14} style={{color:"#64748b"}} /> };
const WEATHER_ICON = { Clear: <Sun size={20} />, "Partly Cloudy": <Cloud size={20} />, Overcast: <Cloud size={20} />, Haze: <Cloud size={20} />, Fog: <Cloud size={20} />, "Light Rain": <CloudRain size={20} />, "Heavy Rain": <CloudRain size={20} />, Thunderstorm: <CloudLightning size={20} /> };
const EVENT_ICON = { government: "🏛️", sports: "🏏", infrastructure: "🚧", education: "🎓" };

function CommandCenter() {
  const [data, setData] = useState(Demo.getCommandCenter());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [clock, setClock] = useState(new Date());
  const [actionItems, setActionItems] = useState([]);
  const [expandedSection, setExpandedSection] = useState({});
  const [selectedTimelineZone, setSelectedTimelineZone] = useState(null);

  useEffect(() => { setActionItems(data.actionable_items || []); }, [data]);
  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!autoRefresh) return; const t = setInterval(() => setData(Demo.getCommandCenter()), 15000); return () => clearInterval(t); }, [autoRefresh]);

  const refresh = () => setData(Demo.getCommandCenter());
  const toggleAction = (id) => setActionItems(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "pending" ? "done" : "pending" } : a));
  const toggle = (key) => setExpandedSection(prev => ({ ...prev, [key]: !prev[key] }));
  const m = data.dashboard_metrics;
  const ri = data.rain_impact;

  const MetricCard = ({ label, value, suffix, icon, color }) => (
    <div className="cc-metric">
      <div className="cc-metric-icon" style={{ background: `${color}18`, color }}>{icon}</div>
      <div className="cc-metric-info"><span className="cc-metric-val">{value}{suffix}</span><span className="cc-metric-lbl">{label}</span></div>
    </div>
  );

  return (
    <motion.section key="command" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      {/* HEADER */}
      <div className="cc-header">
        <div>
          <h1 className="page-title"><Zap size={28} className="page-title-icon" /> Command Center</h1>
          <p className="page-subtitle">AI-driven city mobility control · Real-time forecasting & operations</p>
        </div>
        <div className="cc-header-actions">
          <span className="cc-clock">{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          <button className={`cc-auto-btn ${autoRefresh ? "on" : ""}`} onClick={() => setAutoRefresh(!autoRefresh)}>
            <Radio size={14} /> {autoRefresh ? "Live" : "Paused"}
          </button>
          <button className="action-btn" onClick={refresh}><RefreshCcw size={16} /> Refresh</button>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="cc-status-bar">
        <div className="cc-status-chip" style={{ borderColor: data.priority_corridor_status === "Critical" ? "#f43f5e" : "#10b981" }}>
          <span className="cc-status-dot" style={{ background: data.priority_corridor_status === "Critical" ? "#f43f5e" : "#10b981" }} />
          {data.priority_corridor_status}
        </div>
        <div className="cc-status-chip"><Activity size={14} /> {data.operational_focus}</div>
        <div className="cc-status-chip"><Clock size={14} /> Uptime {data.system_uptime}</div>
        <div className="cc-status-chip">
          {ri.will_rain_30 ? <CloudRain size={14} style={{color:"#3b82f6"}} /> : <Sun size={14} style={{color:"#f59e0b"}} />}
          {ri.will_rain_30 ? "Rain in 30 min" : ri.will_rain_60 ? "Rain in 60 min" : "Clear skies"}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="cc-kpi-grid">
        <MetricCard label="Active Alerts" value={m.active_alerts} icon={<AlertTriangle size={18} />} color="#f43f5e" />
        <MetricCard label="Avg Congestion" value={m.average_congestion} suffix="%" icon={<Activity size={18} />} color="#f97316" />
        <MetricCard label="Traffic Health" value={m.traffic_health_score} suffix="%" icon={<TrendingUp size={18} />} color="#10b981" />
        <MetricCard label="Avg Speed" value={m.avg_speed_kmh} suffix=" km/h" icon={<Zap size={18} />} color="#6366f1" />
        <MetricCard label="Smart Signals" value={`${m.smart_signals_online}/${m.total_signals}`} icon={<Radio size={18} />} color="#06b6d4" />
        <MetricCard label="Cameras Online" value={`${m.camera_coverage}/${m.total_cameras}`} icon={<Camera size={18} />} color="#8b5cf6" />
        <MetricCard label="Vehicles Tracked" value={m.vehicles_tracked?.toLocaleString()} icon={<MapPin size={18} />} color="#ec4899" />
        <MetricCard label="Response Rate" value={m.incident_response_rate} suffix="%" icon={<Shield size={18} />} color="#14b8a6" />
      </div>

      {/* RAIN & WEATHER FORECAST */}
      <div className="cc-section-grid cc-2col">
        <div className="glass-card cc-card">
          <div className="cc-card-header" onClick={() => toggle("weather")}>
            <h3><CloudRain size={18} style={{color:"#3b82f6"}} /> Weather & Rain Forecast</h3>
            {expandedSection.weather ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          <div className="cc-weather-timeline">
            {data.weather_timeline?.map((w, i) => (
              <div key={i} className={`cc-weather-slot ${w.rain_mm > 0 ? "rain" : ""}`}>
                <span className="cc-wt-time">{w.time}</span>
                <span className="cc-wt-icon">{WEATHER_ICON[w.condition] || <Cloud size={20} />}</span>
                <span className="cc-wt-temp">{w.temp}°C</span>
                <span className="cc-wt-cond">{w.condition}</span>
                {w.rain_mm > 0 && <span className="cc-wt-rain"><Droplets size={12} /> {w.rain_mm}mm</span>}
                <span className="cc-wt-detail"><Wind size={12} /> {w.wind_kmh} km/h</span>
                <span className="cc-wt-detail"><Droplets size={12} /> {w.humidity}%</span>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {(expandedSection.weather !== false) && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="cc-rain-impact">
                <div className={`cc-rain-banner ${ri.will_rain_30 ? "danger" : ri.will_rain_60 ? "warn" : "safe"}`}>
                  <p>{ri.advisory}</p>
                </div>
                <div className="cc-rain-stats">
                  <div><strong>{ri.rain_probability_30}%</strong><small>Rain in 30m</small></div>
                  <div><strong>{ri.rain_probability_60}%</strong><small>Rain in 60m</small></div>
                  <div><strong>{ri.congestion_increase}</strong><small>Congestion Impact</small></div>
                  <div><strong>{ri.waterlogging_risk}</strong><small>Waterlog Risk</small></div>
                </div>
                {ri.affected_zones?.length > 0 && <div className="cc-rain-zones"><strong>Vulnerable:</strong> {ri.affected_zones.join(" · ")}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* UPCOMING EVENTS */}
        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><Calendar size={18} style={{color:"#8b5cf6"}} /> Upcoming Events & Programs</h3></div>
          <div className="cc-events-list">
            {data.upcoming_events?.map((evt) => (
              <div key={evt.id} className="cc-event-item">
                <div className="cc-event-top">
                  <span className="cc-event-icon">{EVENT_ICON[evt.type] || "📌"}</span>
                  <div className="cc-event-info">
                    <strong>{evt.name}</strong>
                    <small>{evt.location} · {evt.time}</small>
                  </div>
                  <span className="cc-event-impact" style={{ color: SEVERITY_COLORS[evt.impact], background: `${SEVERITY_COLORS[evt.impact]}15` }}>{evt.impact}</span>
                </div>
                <div className="cc-event-roads">
                  <span className="cc-event-status" style={{ color: evt.status === "Ongoing" ? "#f59e0b" : evt.status === "Upcoming" ? "#f43f5e" : "#64748b" }}>{evt.status}</span>
                  {evt.roads_affected?.slice(0, 3).map((r, i) => <span key={i} className="cc-road-tag">{r}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRAFFIC PREDICTION TIMELINE */}
      <div className="glass-card cc-card">
        <div className="cc-card-header">
          <h3><TrendingUp size={18} style={{color:"#f97316"}} /> Traffic Prediction Timeline — Will there be traffic in 30-60 min?</h3>
        </div>
        <div className="cc-timeline-table-wrap">
          <table className="cc-timeline-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Now</th>
                <th>+30 min</th>
                <th>+60 min</th>
                <th>Trend</th>
                <th>Speed Now</th>
                <th>Speed +30m</th>
              </tr>
            </thead>
            <tbody>
              {data.traffic_timeline?.map((z) => (
                <tr key={z.zone} className={selectedTimelineZone === z.zone ? "cc-tl-active" : ""} onClick={() => setSelectedTimelineZone(z.zone === selectedTimelineZone ? null : z.zone)}>
                  <td className="cc-tl-zone">{z.zone}</td>
                  <td><span className="cc-tl-level" style={{ color: SEVERITY_COLORS[z.current], background: `${SEVERITY_COLORS[z.current]}18` }}>{z.current}</span></td>
                  <td><span className="cc-tl-level" style={{ color: SEVERITY_COLORS[z.in_30_min], background: `${SEVERITY_COLORS[z.in_30_min]}18` }}>{z.in_30_min}</span></td>
                  <td><span className="cc-tl-level" style={{ color: SEVERITY_COLORS[z.in_60_min], background: `${SEVERITY_COLORS[z.in_60_min]}18` }}>{z.in_60_min}</span></td>
                  <td>{TREND_ICON[z.trend]} <span className="cc-tl-trend-text">{z.trend}</span></td>
                  <td className="cc-tl-speed">{z.speed_kmh_now} km/h</td>
                  <td className="cc-tl-speed">{z.speed_kmh_30} km/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MIDDLE ROW: Predicted Issues + Camera Feed + Signal Grid */}
      <div className="cc-section-grid cc-3col">
        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><AlertTriangle size={18} style={{color:"#f43f5e"}} /> Predicted Issues</h3></div>
          {data.predicted_issues?.map((issue, i) => (
            <div key={i} className="cc-issue">
              <div className="cc-issue-top">
                <strong>{issue.zone}</strong>
                <span className="cc-tl-level" style={{ color: SEVERITY_COLORS[issue.risk], background: `${SEVERITY_COLORS[issue.risk]}18` }}>{issue.risk}</span>
              </div>
              <p>{issue.cause}</p>
              <small>{new Date(issue.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
            </div>
          ))}
        </div>

        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><Camera size={18} style={{color:"#8b5cf6"}} /> Live Camera Feed</h3></div>
          {data.camera_feed?.map((cam, i) => (
            <div key={i} className="cc-cam-item">
              <span className="cc-cam-dot" style={{ background: SEVERITY_COLORS[cam.severity] }} />
              <div className="cc-cam-info">
                <strong>{cam.location}</strong>
                <p>{cam.description}</p>
              </div>
              <span className="cc-tl-level" style={{ color: SEVERITY_COLORS[cam.severity], background: `${SEVERITY_COLORS[cam.severity]}18`, fontSize: ".7rem" }}>{cam.severity}</span>
            </div>
          ))}
        </div>

        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><Radio size={18} style={{color:"#06b6d4"}} /> Smart Signal Grid</h3></div>
          <div className="cc-signal-stats">
            <div><strong>{data.smart_signal_grid?.online}</strong><small>Online</small></div>
            <div><strong>{data.smart_signal_grid?.ai_mode}</strong><small>AI Mode</small></div>
            <div><strong>{data.smart_signal_grid?.maintenance}</strong><small>Maint.</small></div>
          </div>
          {data.smart_signal_grid?.corridors?.map((c, i) => (
            <div key={i} className="cc-signal-corridor">
              <span>{c.name}</span>
              <span className="cc-signal-status" style={{ color: c.status === "AI Active" ? "#10b981" : "#f59e0b" }}>{c.status}</span>
              <small>{c.optimization}</small>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW: Transit + Incidents + Flood/Airport */}
      <div className="cc-section-grid cc-3col">
        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><Train size={18} style={{color:"#06b6d4"}} /> Transit & EV</h3></div>
          <p><strong>Metro:</strong> {data.transit_load?.metro_load}</p>
          <p><strong>Bus:</strong> {data.transit_load?.bus_load}</p>
          <p className="text-muted">{data.transit_load?.advice}</p>
          <hr style={{border:"none",borderTop:"1px solid var(--border)",margin:"12px 0"}} />
          <strong style={{fontSize:".82rem"}}>EV Charging</strong>
          {data.ev_charging?.stations?.slice(0, 2).map((s, i) => (
            <div key={i} className="cc-ev-row"><span>{s.station}</span><small>{s.available_ports} ports · {s.wait_time_min}m wait</small></div>
          ))}
        </div>

        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><AlertTriangle size={18} style={{color:"#f59e0b"}} /> Incident Feed</h3></div>
          {data.incident_feed?.map((inc, i) => (
            <div key={i} className="cc-issue"><strong>{inc.segment}</strong><p>{inc.description}</p><small>{inc.updated_at}</small></div>
          ))}
        </div>

        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><Plane size={18} style={{color:"#14b8a6"}} /> Airport & Flood</h3></div>
          <div className="cc-mini-section">
            <strong>Airport Access</strong>
            <p>Index: {data.airport_access?.access_index} · Delay: {data.airport_access?.estimated_delay_min} min</p>
            <small>{data.airport_access?.recommended_corridor}</small>
            {data.airport_access?.terminal_status?.map((t, i) => (
              <div key={i} className="cc-term-row"><span>{t.terminal}</span><span style={{color: t.status === "Congested" ? "#f97316" : "#10b981"}}>{t.status} · {t.delay}</span></div>
            ))}
          </div>
          <hr style={{border:"none",borderTop:"1px solid var(--border)",margin:"10px 0"}} />
          <div className="cc-mini-section">
            <strong>Flood Risk: <span style={{color: SEVERITY_COLORS[data.flood_risk?.risk_level]}}>{data.flood_risk?.risk_level}</span></strong>
            <p className="text-muted">{data.flood_risk?.recommendation}</p>
          </div>
        </div>
      </div>

      {/* ACTION PLAN + RECOMMENDATIONS + SAFETY */}
      <div className="cc-section-grid cc-3col">
        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><CheckCircle size={18} style={{color:"#10b981"}} /> Action Plan</h3></div>
          <div className="cc-action-list">
            {actionItems.map((a) => (
              <div key={a.id} className={`cc-action-item ${a.status === "done" ? "done" : ""}`} onClick={() => toggleAction(a.id)}>
                <div className={`cc-action-check ${a.status === "done" ? "checked" : ""}`}>{a.status === "done" ? "✓" : ""}</div>
                <div className="cc-action-text">
                  <span>{a.action}</span>
                  <small style={{color: SEVERITY_COLORS[a.priority] || "#64748b"}}>{a.priority}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><Zap size={18} style={{color:"#6366f1"}} /> AI Recommendations</h3></div>
          <ul className="recommendations-list">
            {data.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>

        <div className="glass-card cc-card">
          <div className="cc-card-header"><h3><Shield size={18} style={{color:"#f43f5e"}} /> Public Safety Alerts</h3></div>
          {data.public_safety_alerts?.map((a, i) => (
            <div key={i} className="cc-safety-alert">
              <div className="cc-safety-top">
                <span className="cc-alert-id">{a.alert_id}</span>
                <span className="cc-tl-level" style={{ color: SEVERITY_COLORS[a.severity], background: `${SEVERITY_COLORS[a.severity]}18` }}>{a.severity}</span>
              </div>
              <p>{a.message}</p>
              <small style={{color: a.status === "Active" ? "#f43f5e" : "#64748b"}}>{a.status}</small>
            </div>
          ))}
          <hr style={{border:"none",borderTop:"1px solid var(--border)",margin:"12px 0"}} />
          <div className="cc-card-header"><h3><Fuel size={18} style={{color:"#f59e0b"}} /> Toll Forecast</h3></div>
          {data.toll_forecast?.plazas?.map((p, i) => (
            <div key={i} className="cc-issue"><strong>{p.name}</strong><p>{p.delay_min} min delay · {p.rate_change}</p></div>
          ))}
        </div>
      </div>

      {/* POLLUTION */}
      <div className="glass-card cc-card" style={{marginBottom: 20}}>
        <div className="cc-card-header"><h3><Droplets size={18} style={{color:"#ef4444"}} /> Pollution Hotspots</h3></div>
        <div className="cc-pollution-row">
          {data.pollution_hotspots?.map((h, i) => (
            <div key={i} className="cc-poll-card">
              <div className="cc-poll-top"><strong>{h.zone}</strong><span className="pollution-badge">AQI {h.aqi}</span></div>
              <p className="text-muted">{h.advice}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default CommandCenter;
