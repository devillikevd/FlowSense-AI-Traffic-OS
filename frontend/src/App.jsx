import { useEffect, useState, useCallback, useRef } from "react";
import TrafficMap from "./TrafficMap";
import SHAPPanel from "./SHAPPanel";
import ParticleCanvas from "./components/ParticleCanvas";
import Sidebar from "./components/Sidebar";
import NotificationCenter from "./components/NotificationCenter";
import WeatherPanel from "./components/WeatherPanel";
import AnalyticsView from "./components/AnalyticsView";
import CommandCenter from "./components/CommandCenter";
import SettingsPanel from "./components/SettingsPanel";
import AnimatedCounter from "./components/AnimatedCounter";
import * as Demo from "./demoData";
import {
  AlertTriangle, TrendingUp, Download, Play, Send, Siren,
  Sun, Moon, Clock as ClockIcon, MapPin, Activity, Gauge, Radio,
  Zap, RefreshCcw, Navigation, CornerDownRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const [predictions, setPredictions] = useState({});
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Connaught Place");
  const [userCoords, setUserCoords] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [departureAdvice, setDepartureAdvice] = useState(null);
  const [smartData, setSmartData] = useState({});
  const [commandCenter, setCommandCenter] = useState(Demo.getCommandCenter());
  const [manualCommands, setManualCommands] = useState({});
  const [commandLoading, setCommandLoading] = useState({});
  const [routeProfiles, setRouteProfiles] = useState(null);
  const [incidentFeed, setIncidentFeed] = useState(null);
  const [pollutionHeatmap, setPollutionHeatmap] = useState(null);
  const [trafficHealth, setTrafficHealth] = useState(null);
  const [transitLoad, setTransitLoad] = useState(null);
  const [evCharging, setEvCharging] = useState(null);
  const [adaptiveLane, setAdaptiveLane] = useState(null);
  const [cameraAlerts, setCameraAlerts] = useState(null);
  const [smartSignal, setSmartSignal] = useState(null);
  const [urbanReport, setUrbanReport] = useState(null);
  const [floodRisk, setFloodRisk] = useState(null);
  const [airportAccess, setAirportAccess] = useState(null);
  const [tollForecast, setTollForecast] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [reroute, setReroute] = useState(null);
  const [wsStatus, setWsStatus] = useState("Disconnected");
  const [liveSummary, setLiveSummary] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { type: "bot", text: "Namaste! Delhi-NCR traffic ke liye koi sawaal poochen." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [emergencyRoute, setEmergencyRoute] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(12);
  const [routeSource, setRouteSource] = useState("Connaught Place");
  const [routeDestination, setRouteDestination] = useState("IGI Airport");
  const [mapClickMode, setMapClickMode] = useState(null); // 'source' | 'destination' | null
  const [computedRoute, setComputedRoute] = useState(null);

  // ═══ DEMO DATA ENGINE (no backend needed) ═══
  const loadAllData = (location, prevPreds = null) => {
    const preds = Demo.generatePredictions(prevPreds);
    setPredictions(preds);
    setLastUpdated(new Date());
    setWsStatus("Connected");
    setUserLocation("Connaught Place");
    setUserCoords({ lat: 28.6328, lng: 77.2197 });
    setSmartData({
      future: Demo.getFutureTraffic(location),
      segment: Demo.getSegmentForecast(location),
      signal: Demo.getSignalTiming(location),
      pollution: Demo.getPollutionRoute(location),
      parking: Demo.getParking(location),
    });
    setIncidentFeed(Demo.getIncidentFeed());
    setTrafficHealth(Demo.getTrafficHealth());
    setPollutionHeatmap(Demo.getPollutionHeatmap());
    setAdaptiveLane(Demo.getAdaptiveLane());
    setTransitLoad(Demo.getTransitLoad());
    setEvCharging(Demo.getEvCharging());
    setCameraAlerts(Demo.getCameraAlerts());
    setFloodRisk(Demo.getFloodRisk());
    setAirportAccess(Demo.getAirportAccess());
    setTollForecast(Demo.getTollForecast());
    setSmartSignal(Demo.getSmartSignal());
    setCommandCenter(Demo.getCommandCenter());
    setUrbanReport(Demo.getUrbanReport());
    setForecast(Demo.getForecast(location));
    setDepartureAdvice(Demo.getDepartureAdvice(location));
    setHeatmapData(Demo.getHeatmapData(preds));
    const rp = Demo.getRouteProfiles(routeSource, routeDestination, preds);
    setRouteProfiles(rp);
    setRoutes(rp.route_profiles);
    setSelectedRoute(rp.recommended);
    setReroute(Demo.getDynamicReroute(routeSource, routeDestination, preds));
    setLiveSummary(Demo.getLiveSummary(preds));
    return preds;
  };

  const refreshData = () => {
    const preds = Demo.generatePredictions(predictions);
    setPredictions(preds);
    setLastUpdated(new Date());
    setHeatmapData(Demo.getHeatmapData(preds));
    setLiveSummary(Demo.getLiveSummary(preds));
    setTrafficHealth(Demo.getTrafficHealth());
  };

  const refreshCommandCenter = () => {
    setCommandCenter(Demo.getCommandCenter());
    setLastUpdated(new Date());
  };

  const fetchManualCommand = async (commandType) => {
    setCommandLoading(prev => ({ ...prev, [commandType]: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      let data;
      switch (commandType) {
        case "publicSafety":
          data = {
            alerts: [
              { message: "VIP movement on Rajpath — diversions active", status: "Active" },
              { message: "Marathon event near India Gate — road closures", status: "Scheduled" }
            ]
          };
          break;
        case "smartSignal":
          data = {
            status: "All signals operational",
            active_corridors: ["Ring Road", "MG Road", "NH-48"]
          };
          break;
        case "urbanMobility":
          data = {
            city_operational_advice: ["Increase metro frequency on Blue Line", "Deploy additional traffic units"],
            safety_focus: "Monitor high-risk zones"
          };
          break;
        default:
          data = { error: "Unknown command" };
      }
      setManualCommands(prev => ({ ...prev, [commandType]: data }));
    } catch (error) {
      setManualCommands(prev => ({ ...prev, [commandType]: { error: "Failed to fetch" } }));
    } finally {
      setCommandLoading(prev => ({ ...prev, [commandType]: false }));
    }
  };

  const computeRoute = (src, dst) => {
    if (!src || !dst || src === dst) return;
    const rp = Demo.getRouteProfiles(src, dst, predictions);
    setRouteProfiles(rp);
    setRoutes(rp.route_profiles);
    setSelectedRoute(rp.recommended);
    setReroute(Demo.getDynamicReroute(src, dst, predictions));
    setComputedRoute(rp.recommended);
  };

  const handleMapMarkerClick = (loc) => {
    if (mapClickMode === "source") {
      setRouteSource(loc);
      setMapClickMode("destination");
    } else if (mapClickMode === "destination") {
      setRouteDestination(loc);
      setMapClickMode(null);
      computeRoute(routeSource, loc);
    } else {
      setSelectedLocation(loc);
    }
  };

  const detectCurrentLocation = () => {
    setUserLocation("Connaught Place");
    setUserCoords({ lat: 28.6328, lng: 77.2197 });
  };

  useEffect(() => {
    loadAllData(selectedLocation);
    const iv = setInterval(refreshData, refreshInterval * 1000);
    return () => clearInterval(iv);
  }, [refreshInterval]);

  useEffect(() => {
    if (!selectedLocation) return;
    setSmartData({
      future: Demo.getFutureTraffic(selectedLocation),
      segment: Demo.getSegmentForecast(selectedLocation),
      signal: Demo.getSignalTiming(selectedLocation),
      pollution: Demo.getPollutionRoute(selectedLocation),
      parking: Demo.getParking(selectedLocation),
    });
    setForecast(Demo.getForecast(selectedLocation));
    setDepartureAdvice(Demo.getDepartureAdvice(selectedLocation));
  }, [selectedLocation]);

  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const liveUpdateTime = liveSummary?.timestamp ? new Date(liveSummary.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

  const locData = predictions[selectedLocation] || null;
  const factors = locData?.top_factors || [];
  const zones = Object.entries(predictions || {});
  const zoneCount = zones.length;
  const highCount = zones.filter(([, d]) => d.congestion_level === "Very High" || d.congestion_level === "High").length;
  const avgConf = zones.length ? Math.round(zones.reduce((s, [, d]) => s + (d.confidence || 0), 0) / zones.length * 100) : 0;
  const futureTraffic = smartData.future;
  const segmentForecast = smartData.segment;
  const signalTiming = smartData.signal;
  const pollutionRoute = smartData.pollution;
  const parkingPrediction = smartData.parking;
  const allZoneNames = Object.keys(Demo.ZONE_COORDS);

  const handleLocationSelect = (loc) => { setSelectedLocation(loc); };
  const toggleTheme = () => setDarkMode((c) => !c);

  const chatEndRef = useRef(null);
  const handleChatSubmit = (e) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q) return;
    setChatMessages((p) => [...p, { type: "user", text: q }]);
    setChatInput("");
    setChatLoading(true);
    setTimeout(() => {
      setChatMessages((p) => [...p, { type: "bot", text: Demo.chatResponse(q) }]);
      setChatLoading(false);
    }, 800 + Math.random() * 600);
  };
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, chatLoading]);

  const downloadPDF = async () => {
    try {
      const el = document.getElementById("dash-export");
      if (!el) return;
      const c = await html2canvas(el, { backgroundColor: null, scale: 2 });
      const pdf = new jsPDF("landscape", "pt", "a4");
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, w, (c.height * w) / c.width);
      pdf.save("flowsense-report.pdf");
    } catch (e) { console.error("PDF export failed", e); }
  };

  const getEmergencyRoute = () => {
    const src = routeSource || selectedLocation || "Connaught Place";
    const dst = routeDestination || "IGI Airport";
    setEmergencyRoute(Demo.getEmergencyRoute(src, dst, predictions));
    setActivePage("routes");
  };

  const getLevelClass = (lvl) => lvl === "Very High" ? "veryhigh" : lvl?.toLowerCase() || "low";

  const getCommandBadgeClass = (value) => {
    if (!value) return "muted";
    const v = value.toLowerCase();
    if (v.includes("urgent") || v.includes("critical") || v.includes("high") || v.includes("alert")) return "danger";
    if (v.includes("warning") || v.includes("medium") || v.includes("monitor")) return "warning";
    if (v.includes("green") || v.includes("online") || v.includes("available") || v.includes("operational") || v.includes("active") || v.includes("safe")) return "success";
    return "muted";
  };

  return (
    <div className={`app-root theme-${darkMode ? "dark" : "light"}`}>
      <ParticleCanvas />
      <Sidebar activePage={activePage} onPageChange={setActivePage} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="app-body">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <h2>{activePage === "dashboard" ? "Dashboard" : activePage === "analytics" ? "Analytics" : activePage === "routes" ? "Route Lab" : activePage === "assistant" ? "Assistant" : activePage === "insights" ? "Insights" : "Settings"}</h2>
              <p>Delhi-NCR AI Traffic Intelligence</p>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="status-pill"><span className="pulse" /> Live{liveUpdateTime ? ` · ${liveUpdateTime}` : ""}</span>
            <span className="time-badge"><ClockIcon size={14} /> {currentTime}</span>
            <button className="action-btn sm" onClick={detectCurrentLocation} title="Detect my location">
              <MapPin size={14} /> Detect me
            </button>
            <span className={`status-pill ${wsStatus === "Connected" ? "green" : wsStatus === "Error" ? "red" : "muted"}`}>
              <span className="pulse" /> {wsStatus}
            </span>
            <NotificationCenter />
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-btn" onClick={downloadPDF} title="Export PDF">
              <Download size={18} />
            </button>
          </div>
        </header>

        <main className="main-content" id="dash-export">
          <AnimatePresence mode="wait">
            {/* ═══ DASHBOARD ═══ */}
            {activePage === "dashboard" && (
              <motion.section key="dash" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="page-header">
                  <div>
                    <h1 className="page-title"><Activity size={28} className="page-title-icon" /> Traffic Pulse</h1>
                    <p className="page-subtitle">Real-time AI congestion insights · Updated {lastUpdated?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "--"}</p>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="glass-card lift stat-card">
                    <div className="stat-icon indigo"><Gauge size={20} /></div>
                    <div className="stat-label">AI Confidence</div>
                    <div className="stat-value"><AnimatedCounter value={avgConf} suffix="%" /></div>
                    <span className="stat-change up">↑ 2.3%</span>
                  </div>
                  <div className="glass-card lift stat-card">
                    <div className="stat-icon rose"><AlertTriangle size={20} /></div>
                    <div className="stat-label">High Alert Zones</div>
                    <div className="stat-value"><AnimatedCounter value={highCount} /></div>
                    <span className="stat-change down">↑ 1 zone</span>
                  </div>
                  <div className="glass-card lift stat-card">
                    <div className="stat-icon cyan"><Radio size={20} /></div>
                    <div className="stat-label">Live Zones</div>
                    <div className="stat-value"><AnimatedCounter value={zoneCount} /></div>
                    <span className="stat-change up">All active</span>
                  </div>
                  <div className="glass-card lift stat-card">
                    <div className="stat-icon emerald"><TrendingUp size={20} /></div>
                    <div className="stat-label">Current Status</div>
                    <div className="stat-value" style={{ fontSize: "1.2rem" }}>{locData?.congestion_level || "—"}</div>
                    <span className="stat-change up">{selectedLocation}</span>
                  </div>
                </div>

                <div className="glass-card lift route-planner-bar">
                  <div className="route-planner-header">
                    <div><h3><Navigation size={18} /> AI Route Planner</h3><p className="text-muted">Select source & destination — or click markers on the map</p></div>
                    <div className="route-planner-actions">
                      {mapClickMode && <span className="map-click-hint pulse-text">🎯 Click a zone on map to set {mapClickMode}</span>}
                      <button className="action-btn sm" onClick={() => setMapClickMode(mapClickMode ? null : 'source')}>
                        <MapPin size={14} /> {mapClickMode ? 'Cancel' : 'Pick on Map'}
                      </button>
                    </div>
                  </div>
                  <div className="route-planner-controls">
                    <div className="route-input-group">
                      <label><span className="dot green" /> Source</label>
                      <select value={routeSource} onChange={(e) => setRouteSource(e.target.value)}>
                        {allZoneNames.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </div>
                    <CornerDownRight size={20} className="route-arrow" />
                    <div className="route-input-group">
                      <label><span className="dot red" /> Destination</label>
                      <select value={routeDestination} onChange={(e) => setRouteDestination(e.target.value)}>
                        {allZoneNames.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </div>
                    <button className="action-btn" onClick={() => computeRoute(routeSource, routeDestination)}>
                      <Navigation size={16} /> Find Best Route
                    </button>
                  </div>
                  {computedRoute && (
                    <div className="route-result">
                      <div className="route-result-stats">
                        <div className="rr-stat"><span>ETA</span><strong>{computedRoute.eta_mins} min</strong></div>
                        <div className="rr-stat"><span>Toll</span><strong>₹{computedRoute.toll_inr}</strong></div>
                        <div className="rr-stat"><span>CO₂</span><strong>{computedRoute.co2_grams}g</strong></div>
                        <div className="rr-stat"><span>AI Score</span><strong className="score-good">{computedRoute.ai_score}%</strong></div>
                      </div>
                      <div className="route-result-path">
                        <strong>Optimal Path:</strong> {computedRoute.path?.join(' → ') || `${routeSource} → ${routeDestination}`}
                      </div>
                    </div>
                  )}
                </div>

                <div className="insights-row">
                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Live Location Intelligence</h3>
                        <p className="text-muted">Detected zone and best departure advice</p>
                      </div>
                      <span className="badge emerald">{userLocation || "Location unknown"}</span>
                    </div>
                    <div className="insight-body">
                      <p><strong>Nearest Delhi-NCR zone:</strong> {userLocation || "Detecting..."}</p>
                      <p><strong>Coordinates:</strong> {userCoords ? `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}` : "Awaiting browser geolocation"}</p>
                      <p><strong>Forecast horizon:</strong> {forecast?.forecasts?.map((f) => `${f.horizon_min}m:${f.congestion_level}`).join(" • ") || "Forecast not available"}</p>
                      <p className="text-muted">{departureAdvice?.message || "Tap Detect me to generate departure advice and smart reroutes."}</p>
                    </div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>30–120 min Traffic Forecast</h3>
                        <p className="text-muted">Hyperlocal future congestion outlook</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      {futureTraffic?.predictions ? (
                        futureTraffic.predictions.map((item) => (
                          <div key={item.horizon_min} className="forecast-chip">
                            <strong>{item.horizon_min} min</strong> — {item.congestion_level} · Acc. {item.accident_probability}%
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Loading future traffic data...</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Smart Route Signals</h3>
                        <p className="text-muted">Optimized green light timing</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      {signalTiming ? (
                        <div>
                          <p><strong>Green:</strong> {signalTiming.optimized_timing.green_sec}s</p>
                          <p><strong>Yellow:</strong> {signalTiming.optimized_timing.yellow_sec}s</p>
                          <p><strong>Red:</strong> {signalTiming.optimized_timing.red_sec}s</p>
                          <p className="text-muted">{signalTiming.notes}</p>
                        </div>
                      ) : (
                        <p className="text-muted">Loading signal optimization...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Eco & Safety Routing</h3>
                        <p className="text-muted">Weather, pollution and parking guidance</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      <p><strong>Air quality advice:</strong> {pollutionRoute?.current_aqi || "Loading..."}</p>
                      <p><strong>Eco score:</strong> {pollutionRoute?.eco_score !== undefined ? `${pollutionRoute.eco_score}%` : "--"}</p>
                      <p><strong>Parking:</strong> {parkingPrediction ? `${parkingPrediction.available_spots} spots` : "Loading..."}</p>
                      {segmentForecast?.segments ? (
                        <div className="segment-summary">
                          <strong>Top risk:</strong> {segmentForecast.segments[0]?.segment || "--"} ({segmentForecast.segments[0]?.risk_level || "--"})
                        </div>
                      ) : null}
                      <p className="text-muted">{pollutionRoute?.recommended_route || parkingPrediction?.parking_recommendation || "Fetching route intelligence..."}</p>
                    </div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Camera Alert Radar</h3>
                        <p className="text-muted">Live traffic camera incident summary</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      {cameraAlerts?.camera_alerts?.length ? (
                        cameraAlerts.camera_alerts.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="incident-item">
                            <strong>{item.location}</strong>
                            <p>{item.description}</p>
                            <small>{item.updated_at}</small>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Loading camera feed alerts...</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Flood Risk</h3>
                        <p className="text-muted">Monsoon and waterlogging forecast</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      <p><strong>Risk level:</strong> {floodRisk?.risk_level || "Loading..."}</p>
                      <p><strong>Probability:</strong> {floodRisk?.probability || "--"}%</p>
                      <p className="text-muted">{floodRisk?.recommendation || "Fetching flood advisory..."}</p>
                    </div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Airport Access</h3>
                        <p className="text-muted">IGI access and ingress conditions</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      <p><strong>Access index:</strong> {airportAccess?.access_index || "Loading..."}</p>
                      <p><strong>Recommended route:</strong> {airportAccess?.recommended_corridor || "--"}</p>
                      <p className="text-muted">{airportAccess?.notes || "Loading airport access advisory..."}</p>
                    </div>
                  </div>

                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Toll Forecast</h3>
                        <p className="text-muted">Expected toll plaza delays and surge pricing</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      {tollForecast?.plazas?.length ? (
                        tollForecast.plazas.slice(0, 2).map((plaza, idx) => (
                          <div key={idx} className="incident-item">
                            <strong>{plaza.name}</strong>
                            <p>{plaza.delay_min} min delay · {plaza.rate_change}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Loading toll forecast data...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dash-grid-3">
                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>City Health Score</h3>
                        <p className="text-muted">Aggregated traffic system health</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      <p><strong>Network health:</strong> {trafficHealth?.health_score ? `${trafficHealth.health_score}%` : "Loading..."}</p>
                      <p><strong>Load factor:</strong> {trafficHealth?.load_factor ? `${trafficHealth.load_factor}%` : "--"}</p>
                      <p className="text-muted">{trafficHealth?.recommended_measures || "Collecting system health signals..."}</p>
                    </div>
                  </div>

                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Incident Feed</h3>
                        <p className="text-muted">Current city alerts and disruption points</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      {incidentFeed?.issues?.length ? (
                        incidentFeed.issues.slice(0, 3).map((issue, idx) => (
                          <div key={idx} className="incident-item">
                            <strong>{issue.segment}</strong>
                            <p>{issue.description}</p>
                            <small>{issue.updated_at}</small>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Loading incident updates...</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Pollution Hotspots</h3>
                        <p className="text-muted">AI air quality alerts by zone</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      {pollutionHeatmap?.hotspots?.length ? (
                        pollutionHeatmap.hotspots.slice(0, 3).map((hot, idx) => (
                          <div key={idx} className="pollution-item">
                            <strong>{hot.zone}</strong> <span className="pollution-badge">AQI {hot.aqi}</span>
                            <p>{hot.advice}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Loading pollution intelligence...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dash-grid-3">
                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Transit Load</h3>
                        <p className="text-muted">Metro and bus ridership pressure</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      <p><strong>Metro:</strong> {transitLoad?.metro_load || "Loading..."}</p>
                      <p><strong>Bus:</strong> {transitLoad?.bus_load || "Loading..."}</p>
                      <p className="text-muted">{transitLoad?.advice || "Collecting transit forecasts..."}</p>
                    </div>
                  </div>

                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>EV Charging</h3>
                        <p className="text-muted">Available stations and wait times</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      {evCharging?.stations?.length ? (
                        evCharging.stations.slice(0, 2).map((station, idx) => (
                          <div key={idx} className="pollution-item">
                            <strong>{station.station}</strong>
                            <p className="text-muted">Ports {station.available_ports} · Wait {station.wait_time_min}m</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Loading charging availability...</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card lift insight-card">
                    <div className="insight-header">
                      <div>
                        <h3>Adaptive Lane Control</h3>
                        <p className="text-muted">Dynamic lane recommendations</p>
                      </div>
                    </div>
                    <div className="insight-body">
                      <p><strong>Corridors:</strong> {adaptiveLane?.affected_corridors?.join(", ") || "Loading..."}</p>
                      <p><strong>Reduction:</strong> {adaptiveLane?.expected_reduction || "--"}</p>
                      <p className="text-muted">{adaptiveLane?.notes || "Analyzing real-time lane capacity..."}</p>
                    </div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="glass-card map-card">
                    <div className="map-header">
                      <div>
                        <h3>Live Congestion Map</h3>
                        <p className="text-muted">Tap markers to inspect zones</p>
                      </div>
                      <div className="legend-row">
                        <span className="legend-chip low">Low</span>
                        <span className="legend-chip medium">Medium</span>
                        <span className="legend-chip high">High</span>
                        <span className="legend-chip veryhigh">Critical</span>
                      </div>
                    </div>
                    <TrafficMap
                      predictions={predictions}
                      heatmapData={heatmapData}
                      routePath={reroute?.recommended_route}
                      cameraAlerts={cameraAlerts?.camera_alerts}
                      selectedLocation={selectedLocation}
                      onMarkerClick={handleMapMarkerClick}
                      routeSource={routeSource}
                      routeDestination={routeDestination}
                      mapClickMode={mapClickMode}
                    />
                  </div>

                  <div className="zone-panel">
                    <div className="glass-card">
                      <h3>Selected Zone</h3>
                      <div className="zone-selected">
                        <div className="zone-name"><MapPin size={16} style={{ display: "inline", verticalAlign: "middle" }} /> {selectedLocation}</div>
                        <div className={`zone-level ${getLevelClass(locData?.congestion_level)}`}>{locData?.congestion_level || "No data"}</div>
                        <div className="zone-confidence">Confidence: {locData?.confidence ? `${Math.round(locData.confidence * 100)}%` : "--"}</div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <button className="action-btn" onClick={getEmergencyRoute} style={{ width: "100%" }}>
                          <Siren size={16} /> Emergency Route
                        </button>
                      </div>
                    </div>

                    <div className="glass-card">
                      <h3>All Zones</h3>
                      <div className="zone-list">
                        {zones.map(([name, data]) => (
                          <div key={name} className={`zone-item ${selectedLocation === name ? "active" : ""}`} onClick={() => handleLocationSelect(name)}>
                            <span className="zone-item-name">{name}</span>
                            <span className={`zone-badge ${data.congestion_level?.replace(" ", "")}`}>{data.congestion_level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="glass-card lift reroute-card">
                    <div className="insight-header">
                      <div>
                        <h3>Dynamic Reroute</h3>
                        <p className="text-muted">AI path correction for current congestion.</p>
                      </div>
                      <button className="action-btn sm" onClick={() => { setReroute(Demo.getDynamicReroute(routeSource, routeDestination, predictions)); }}>Refresh</button>
                    </div>
                    {reroute ? (
                      <div className="insight-body">
                        <p><strong>Suggested path:</strong> {reroute.recommended_route?.join(" → ") || "N/A"}</p>
                        <p><strong>ETA:</strong> {reroute.eta_mins} min · <strong>Risk:</strong> {reroute.risk_score}%</p>
                        <p><strong>Avoided zones:</strong> {reroute.avoided_zones?.join(", ") || "None"}</p>
                        <p className="text-muted">{reroute.advice || "Reroute based on current Delhi-NCR zone congestion."}</p>
                      </div>
                    ) : (
                      <p className="text-muted">Loading reroute recommendation…</p>
                    )}
                  </div>
                </div>

                <div className="dash-grid">
                  <SHAPPanel topFactors={factors} location={selectedLocation} />
                  <WeatherPanel />
                </div>
              </motion.section>
            )}

            {/* ═══ ANALYTICS ═══ */}
            {activePage === "analytics" && <AnalyticsView />}

            {/* ═══ COMMAND CENTER ═══ */}
            {activePage === "command" && <CommandCenter />}

            {/* ═══ ROUTES ═══ */}
            {activePage === "routes" && (
              <motion.section key="routes" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h1 className="page-title"><MapPin size={28} className="page-title-icon" /> Route Lab</h1>
                    <p className="page-subtitle">Compare AI-optimized travel plans for time, cost & emissions</p>
                  </div>
                  <button className="action-btn" onClick={downloadPDF}><Download size={16} /> Export</button>
                </div>

                <div className="route-grid">
                  {(routeProfiles?.route_profiles?.length ? routeProfiles.route_profiles : routes.length ? routes : [{ name: "AI Recommended", eta_mins: 52, toll_inr: 80, co2_grams: 2480, ai_score: 94 }]).map((rt) => (
                    <div key={rt.name} className={`glass-card lift route-card ${selectedRoute?.name === rt.name ? "selected" : ""}`} onClick={() => setSelectedRoute(rt)}>
                      <div className="route-top">
                        <h4>{rt.name}</h4>
                        <span className={`score-pill ${rt.ai_score > 90 ? "score-good" : rt.ai_score > 70 ? "score-warn" : "score-bad"}`}>{rt.ai_score}%</span>
                      </div>
                      <div className="route-eta">{rt.eta_mins} <span style={{ fontSize: ".9rem", color: "var(--text3)", fontWeight: 400 }}>min</span></div>
                      <div className="route-meta">
                        <span>₹{rt.toll_inr} toll</span>
                        <span>{rt.co2_grams}g CO₂</span>
                      </div>
                      {routeProfiles?.recommended?.name === rt.name && <span className="route-badge">Recommended</span>}
                    </div>
                  ))}
                </div>

                <div className="glass-card emergency-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3>Emergency Response</h3>
                      <p className="text-muted">Immediate clearance corridor</p>
                    </div>
                    <button className="action-btn danger" onClick={getEmergencyRoute}><Play size={16} /> Request Corridor</button>
                  </div>
                  {emergencyRoute ? (
                    <div>
                      <p style={{ fontWeight: 700 }}>{emergencyRoute.name} — ETA {emergencyRoute.eta_mins} min</p>
                      <div className="path-tags">
                        <span className="path-chip">CO₂ {emergencyRoute.co2_grams}g</span>
                        <span className="path-chip">AI score {emergencyRoute.ai_score}%</span>
                        <span className="path-chip">{emergencyRoute.notes}</span>
                      </div>
                      <p className="text-muted" style={{ marginTop: 12 }}>Path: {emergencyRoute.path.join(" → ")}</p>
                    </div>
                  ) : <p className="text-muted">Request an emergency route to reveal priority corridors.</p>}
                </div>
              </motion.section>
            )}

            {/* ═══ ASSISTANT ═══ */}
            {activePage === "assistant" && (
              <motion.section key="asst" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="page-header">
                  <div>
                    <h1 className="page-title"><Send size={28} className="page-title-icon" /> Traffic Assistant</h1>
                    <p className="page-subtitle">Ask about routes, peak hours, or weather impacts</p>
                  </div>
                </div>
                <div className="assistant-grid">
                  <div className="glass-card">
                    <div className="chat-log">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`chat-msg ${m.type}`}>{m.text}</div>
                      ))}
                      {chatLoading && <div className="chat-msg bot" style={{ opacity: 0.8 }}><div className="typing-dots"><span /><span /><span /></div></div>}
                      <div ref={chatEndRef} />
                    </div>
                    <form className="chat-footer" onSubmit={handleChatSubmit}>
                      <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about IGI Airport traffic, best routes..." />
                      <button type="submit" className="action-btn" disabled={chatLoading}><Send size={16} /></button>
                    </form>
                  </div>
                  <div className="glass-card">
                    <h3 style={{ margin: "0 0 12px" }}>Quick Prompts</h3>
                    <div className="quick-prompts">
                      {["Best time to travel to Cyber Hub", "Current congestion at CP", "Rain impact on traffic", "Fastest route to IGI Airport", "Toll charges update", "EV charging stations nearby", "Metro load status", "Parking near Saket", "Flood risk areas", "Weekend traffic prediction"].map((p) => (
                        <button key={p} className="quick-prompt-btn" onClick={() => setChatInput(p)}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ═══ INSIGHTS ═══ */}
            {activePage === "insights" && (
              <motion.section key="insights" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="page-header">
                  <div>
                    <h1 className="page-title"><TrendingUp size={28} className="page-title-icon" /> Explainable AI</h1>
                    <p className="page-subtitle">Understand the factors behind congestion predictions</p>
                  </div>
                </div>
                <div className="dash-grid">
                  <SHAPPanel topFactors={factors} location={selectedLocation} />
                  <div className="glass-card zone-panel">
                    <h3>Zone: {selectedLocation}</h3>
                    <div className="zone-selected">
                      <div className={`zone-level ${getLevelClass(locData?.congestion_level)}`}>{locData?.congestion_level || "Unknown"}</div>
                      <div className="zone-confidence">Confidence: {locData?.confidence ? `${Math.round(locData.confidence * 100)}%` : "--"}</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <h3>Switch Zone</h3>
                      <div className="zone-list">
                        {zones.slice(0, 8).map(([name, data]) => (
                          <div key={name} className={`zone-item ${selectedLocation === name ? "active" : ""}`} onClick={() => handleLocationSelect(name)}>
                            <span className="zone-item-name">{name}</span>
                            <span className={`zone-badge ${data.congestion_level?.replace(" ", "")}`}>{data.congestion_level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ═══ SETTINGS ═══ */}
            {activePage === "settings" && (
              <SettingsPanel darkMode={darkMode} onToggleTheme={toggleTheme} refreshInterval={refreshInterval} onRefreshChange={setRefreshInterval} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
