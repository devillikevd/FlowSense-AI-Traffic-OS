import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_ALERTS = [
  { id: 1, type: "danger", title: "Very High Congestion", message: "Connaught Place experiencing severe delays", time: "2 min ago", read: false },
  { id: 2, type: "warning", title: "Weather Alert", message: "Heavy rain expected in Gurugram sector — plan ahead", time: "8 min ago", read: false },
  { id: 3, type: "info", title: "Route Updated", message: "AI Recommended route recalculated for DND Flyway", time: "15 min ago", read: false },
  { id: 4, type: "success", title: "Model Refreshed", message: "Prediction engine updated with latest traffic feed", time: "22 min ago", read: true },
];

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const panelRef = useRef(null);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => setAlerts(alerts.map((a) => ({ ...a, read: true })));
  const dismiss = (id) => setAlerts(alerts.filter((a) => a.id !== id));

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const iconMap = {
    danger: <AlertTriangle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
    success: <CheckCircle size={16} />,
  };

  return (
    <div className="notif-center" ref={panelRef}>
      <button className="notif-bell" onClick={() => setOpen(!open)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-dropdown glass-card"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notif-header">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <button className="notif-mark-read" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="notif-list">
              {alerts.length === 0 && <p className="notif-empty">No notifications</p>}
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  className={`notif-item ${alert.type} ${alert.read ? "read" : ""}`}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className={`notif-icon ${alert.type}`}>{iconMap[alert.type]}</div>
                  <div className="notif-body">
                    <strong>{alert.title}</strong>
                    <p>{alert.message}</p>
                    <span className="notif-time">{alert.time}</span>
                  </div>
                  <button className="notif-dismiss" onClick={() => dismiss(alert.id)}>
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
