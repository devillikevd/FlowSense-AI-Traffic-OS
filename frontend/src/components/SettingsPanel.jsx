import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Monitor, Bell, RefreshCw, Palette, Globe, Shield } from "lucide-react";

export default function SettingsPanel({ darkMode, onToggleTheme, refreshInterval, onRefreshChange }) {
  const [notifSound, setNotifSound] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mapStyle, setMapStyle] = useState("dark");

  return (
    <motion.section key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Settings size={28} className="page-title-icon" /> Settings</h1>
          <p className="page-subtitle">Customize your FlowSense experience</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Appearance */}
        <div className="glass-card settings-section">
          <div className="settings-section-header">
            <Palette size={20} />
            <h3>Appearance</h3>
          </div>
          <div className="settings-row">
            <div className="settings-label">
              <Monitor size={16} />
              <div><strong>Dark Mode</strong><p className="text-muted">Toggle dark/light theme</p></div>
            </div>
            <button className={`toggle-switch ${darkMode ? "on" : ""}`} onClick={onToggleTheme}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-label">
              <Globe size={16} />
              <div><strong>Map Style</strong><p className="text-muted">Choose map appearance</p></div>
            </div>
            <select className="settings-select" value={mapStyle} onChange={(e) => setMapStyle(e.target.value)}>
              <option value="dark">Dark</option>
              <option value="satellite">Satellite</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card settings-section">
          <div className="settings-section-header">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>
          <div className="settings-row">
            <div className="settings-label">
              <Bell size={16} />
              <div><strong>Alert Sounds</strong><p className="text-muted">Play sound on new alerts</p></div>
            </div>
            <button className={`toggle-switch ${notifSound ? "on" : ""}`} onClick={() => setNotifSound(!notifSound)}>
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="glass-card settings-section">
          <div className="settings-section-header">
            <RefreshCw size={20} />
            <h3>Data & Refresh</h3>
          </div>
          <div className="settings-row">
            <div className="settings-label">
              <RefreshCw size={16} />
              <div><strong>Auto Refresh</strong><p className="text-muted">Automatically update data</p></div>
            </div>
            <button className={`toggle-switch ${autoRefresh ? "on" : ""}`} onClick={() => setAutoRefresh(!autoRefresh)}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-label">
              <Shield size={16} />
              <div><strong>Refresh Interval</strong><p className="text-muted">Seconds between updates</p></div>
            </div>
            <select className="settings-select" value={refreshInterval} onChange={(e) => onRefreshChange(Number(e.target.value))}>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          </div>
        </div>

        {/* About */}
        <div className="glass-card settings-section">
          <div className="settings-section-header">
            <Shield size={20} />
            <h3>About</h3>
          </div>
          <div className="about-info">
            <p><strong>FlowSense AI</strong> v2.0</p>
            <p className="text-muted">Delhi-NCR Traffic Intelligence Platform</p>
            <p className="text-muted">Powered by GNN + Temporal Fusion Transformer + XGBoost</p>
            <div className="about-tech-tags">
              <span className="tech-tag">FastAPI</span>
              <span className="tech-tag">React</span>
              <span className="tech-tag">SHAP</span>
              <span className="tech-tag">WebSocket</span>
              <span className="tech-tag">Leaflet</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
