import {
  LayoutDashboard,
  Route,
  MessageSquare,
  Brain,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, subtitle: "Live pulse" },
  { id: "analytics", label: "Analytics", icon: BarChart3, subtitle: "Deep trends" },
  { id: "command", label: "Command Center", icon: Zap, subtitle: "City AI hub" },
  { id: "routes", label: "Route Lab", icon: Route, subtitle: "AI routes" },
  { id: "assistant", label: "Assistant", icon: MessageSquare, subtitle: "Ask AI" },
  { id: "insights", label: "Insights", icon: Brain, subtitle: "Explainable AI" },
  { id: "settings", label: "Settings", icon: Settings, subtitle: "Preferences" },
];

export default function Sidebar({ activePage, onPageChange, collapsed, onToggleCollapse }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Zap size={22} />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="sidebar-brand-text"
          >
            <span className="sidebar-brand-name">FlowSense</span>
            <span className="sidebar-brand-tag">AI Traffic OS</span>
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <hr className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onPageChange(item.id)}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  className="sidebar-active-bg"
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="sidebar-nav-icon">
                <Icon size={20} />
              </div>
              {!collapsed && (
                <motion.div
                  className="sidebar-nav-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <span className="sidebar-nav-label">{item.label}</span>
                  <span className="sidebar-nav-sub">{item.subtitle}</span>
                </motion.div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button className="sidebar-collapse-btn" onClick={onToggleCollapse}>
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Status */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-status-dot" />
          <span>System Online · v2.0</span>
        </div>
      )}
    </aside>
  );
}
