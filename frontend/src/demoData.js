// ═══════════════════════════════════════════════════════
// FlowSense Demo Data Engine — Full Delhi-NCR Mock Data
// ═══════════════════════════════════════════════════════

export const ZONE_COORDS = {
  "Connaught Place": [28.6328, 77.2197],
  "IGI Airport": [28.5562, 77.1000],
  "Cyber Hub": [28.5034, 77.0880],
  "Dwarka Mor": [28.6034, 77.0628],
  "Noida Sector 18": [28.5718, 77.3207],
  "Lajpat Nagar": [28.5672, 77.2522],
  "Nehru Place": [28.5533, 77.2594],
  "Saket": [28.5245, 77.2137],
  "Rohini": [28.7300, 77.1055],
  "Pitampura": [28.7134, 77.1485],
  "Vaishali": [28.6201, 77.3844],
  "Indirapuram": [28.6405, 77.3673],
  "MG Road": [28.5603, 77.2336],
  "AIIMS": [28.5672, 77.2100],
};

const ZONE_NAMES = Object.keys(ZONE_COORDS);

// ── Zone Adjacency Graph (weighted by typical travel difficulty) ──
const GRAPH = {
  "Connaught Place": { "Lajpat Nagar": 4, "AIIMS": 3, "Pitampura": 6, "Rohini": 7, "MG Road": 3, "Nehru Place": 5 },
  "IGI Airport": { "Dwarka Mor": 3, "Saket": 5, "Cyber Hub": 6, "AIIMS": 6 },
  "Cyber Hub": { "IGI Airport": 6, "Dwarka Mor": 5, "Saket": 4, "MG Road": 7 },
  "Dwarka Mor": { "IGI Airport": 3, "Cyber Hub": 5, "Rohini": 6, "Connaught Place": 8 },
  "Noida Sector 18": { "Vaishali": 3, "Indirapuram": 3, "Nehru Place": 5, "MG Road": 6, "Lajpat Nagar": 6 },
  "Lajpat Nagar": { "Connaught Place": 4, "Nehru Place": 2, "MG Road": 2, "AIIMS": 3, "Saket": 4, "Noida Sector 18": 6 },
  "Nehru Place": { "Lajpat Nagar": 2, "Saket": 3, "MG Road": 2, "Connaught Place": 5, "Noida Sector 18": 5 },
  "Saket": { "AIIMS": 2, "Nehru Place": 3, "Lajpat Nagar": 4, "IGI Airport": 5, "Cyber Hub": 4 },
  "Rohini": { "Pitampura": 2, "Dwarka Mor": 6, "Connaught Place": 7 },
  "Pitampura": { "Rohini": 2, "Connaught Place": 6, "Vaishali": 8 },
  "Vaishali": { "Indirapuram": 2, "Noida Sector 18": 3, "Pitampura": 8, "Connaught Place": 9 },
  "Indirapuram": { "Vaishali": 2, "Noida Sector 18": 3, "Nehru Place": 7 },
  "MG Road": { "Connaught Place": 3, "Lajpat Nagar": 2, "Nehru Place": 2, "AIIMS": 2, "Noida Sector 18": 6, "Cyber Hub": 7 },
  "AIIMS": { "Connaught Place": 3, "Saket": 2, "Lajpat Nagar": 3, "MG Road": 2, "IGI Airport": 6 },
};

// ── Dijkstra Pathfinding ──
export function findBestRoute(source, destination, congestionData = {}) {
  if (source === destination) return { path: [source], cost: 0 };
  const dist = {};
  const prev = {};
  const visited = new Set();
  ZONE_NAMES.forEach(z => { dist[z] = Infinity; prev[z] = null; });
  dist[source] = 0;

  while (true) {
    let u = null;
    let minD = Infinity;
    for (const z of ZONE_NAMES) {
      if (!visited.has(z) && dist[z] < minD) { minD = dist[z]; u = z; }
    }
    if (!u || u === destination) break;
    visited.add(u);
    const neighbors = GRAPH[u] || {};
    for (const [v, w] of Object.entries(neighbors)) {
      const cong = congestionData[v]?.congestion_level;
      const penalty = cong === "Very High" ? 8 : cong === "High" ? 4 : cong === "Medium" ? 1 : 0;
      const alt = dist[u] + w + penalty;
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
    }
  }

  const path = [];
  let cur = destination;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  if (path[0] !== source) return { path: [source, destination], cost: 99 };
  return { path, cost: dist[destination] };
}

// ── Generate zone predictions ──
function rand(min, max) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const BASE_CONGESTION = {
  "Connaught Place": "Very High", "IGI Airport": "High", "Cyber Hub": "High",
  "Dwarka Mor": "Medium", "Noida Sector 18": "High", "Lajpat Nagar": "Medium",
  "Nehru Place": "Medium", "Saket": "Low", "Rohini": "Medium",
  "Pitampura": "Low", "Vaishali": "Medium", "Indirapuram": "Low",
  "MG Road": "High", "AIIMS": "Very High",
};

const SHAP_FACTORS_MAP = {
  "Very High": [
    { feature: "Hour of Day (Peak)", impact: 0.42 }, { feature: "Vehicle Density", impact: 0.38 },
    { feature: "Event Nearby", impact: 0.25 }, { feature: "Weather (Rain)", impact: 0.18 },
    { feature: "Road Width", impact: -0.15 }, { feature: "Signal Timing", impact: -0.12 },
  ],
  "High": [
    { feature: "Vehicle Density", impact: 0.35 }, { feature: "Hour of Day", impact: 0.28 },
    { feature: "Construction Zone", impact: 0.20 }, { feature: "Metro Proximity", impact: -0.18 },
    { feature: "Alt. Route Available", impact: -0.14 }, { feature: "Avg Speed", impact: -0.10 },
  ],
  "Medium": [
    { feature: "Hour of Day", impact: 0.22 }, { feature: "School Zone", impact: 0.15 },
    { feature: "Vehicle Density", impact: 0.12 }, { feature: "Signal Optimization", impact: -0.20 },
    { feature: "Road Width", impact: -0.10 }, { feature: "Flyover Access", impact: -0.08 },
  ],
  "Low": [
    { feature: "Off-Peak Hour", impact: -0.30 }, { feature: "Low Density", impact: -0.22 },
    { feature: "Good Weather", impact: -0.12 }, { feature: "Weekend Effect", impact: -0.10 },
    { feature: "Smart Signal", impact: -0.08 }, { feature: "Vehicle Density", impact: 0.05 },
  ],
};

export function generatePredictions(prev = null) {
  const predictions = {};
  ZONE_NAMES.forEach(name => {
    const base = BASE_CONGESTION[name];
    const levels = ["Low", "Medium", "High", "Very High"];
    let level = base;
    if (prev && prev[name]) {
      const idx = levels.indexOf(prev[name].congestion_level);
      const shift = Math.random() < 0.15 ? (Math.random() < 0.5 ? 1 : -1) : 0;
      level = levels[Math.max(0, Math.min(3, idx + shift))];
    }
    const confMap = { "Low": 0.92, "Medium": 0.87, "High": 0.84, "Very High": 0.81 };
    predictions[name] = {
      congestion_level: level,
      confidence: confMap[level] + rand(-0.03, 0.03),
      top_factors: SHAP_FACTORS_MAP[level],
    };
  });
  return predictions;
}

// ── Future Traffic ──
export function getFutureTraffic(location) {
  const base = BASE_CONGESTION[location] || "Medium";
  const levels = ["Low", "Medium", "High", "Very High"];
  const baseIdx = levels.indexOf(base);
  return {
    location,
    predictions: [30, 60, 90, 120].map(h => {
      const shift = Math.random() < 0.4 ? (Math.random() < 0.5 ? 1 : -1) : 0;
      const idx = Math.max(0, Math.min(3, baseIdx + shift));
      return { horizon_min: h, congestion_level: levels[idx], accident_probability: rand(2, 18) };
    }),
  };
}

// ── Signal Timing ──
export function getSignalTiming(location) {
  return {
    location,
    optimized_timing: { green_sec: Math.round(rand(35, 65)), yellow_sec: 5, red_sec: Math.round(rand(30, 55)) },
    notes: `AI-optimized cycle for ${location} based on current vehicle queue length.`,
  };
}

// ── Segment Forecast ──
export function getSegmentForecast(location) {
  const segments = [
    { segment: `${location} → Ring Road`, risk_level: pick(["Low", "Medium", "High"]), delay_min: rand(2, 15) },
    { segment: `${location} → Outer Ring`, risk_level: pick(["Low", "Medium"]), delay_min: rand(1, 8) },
    { segment: `${location} → NH-48`, risk_level: pick(["Medium", "High"]), delay_min: rand(5, 20) },
  ];
  return { location, segments };
}

// ── Pollution Route ──
export function getPollutionRoute(location) {
  const aqiMap = { "Connaught Place": 186, "AIIMS": 172, "IGI Airport": 145, "Cyber Hub": 132 };
  return {
    location,
    current_aqi: aqiMap[location] || Math.round(rand(80, 200)),
    eco_score: Math.round(rand(55, 92)),
    recommended_route: `Use ${pick(["metro", "bike lane", "EV corridor"])} via ${pick(["Ring Road", "Mathura Road", "Outer Ring"])} to reduce exposure.`,
  };
}

// ── Parking ──
export function getParking(location) {
  return {
    location,
    available_spots: Math.round(rand(5, 85)),
    total_spots: 120,
    parking_recommendation: `Best parking near ${location}: ${pick(["underground lot", "multi-level", "street parking"])} — ₹${Math.round(rand(20, 80))}/hr.`,
  };
}

// ── Incident Feed ──
export function getIncidentFeed() {
  return {
    issues: [
      { segment: "ITO Flyover", description: "Minor accident — 1 lane blocked", updated_at: "3 min ago" },
      { segment: "Ashram Chowk", description: "Waterlogging due to overnight rain", updated_at: "12 min ago" },
      { segment: "Dhaula Kuan Underpass", description: "Heavy vehicle breakdown — clearing in progress", updated_at: "18 min ago" },
      { segment: "Rajiv Chowk Metro Gate 3", description: "Crowd surge — pedestrian overflow on road", updated_at: "25 min ago" },
    ],
  };
}

// ── Traffic Health ──
export function getTrafficHealth() {
  return {
    health_score: Math.round(rand(58, 82)),
    load_factor: Math.round(rand(45, 78)),
    recommended_measures: "Activate adaptive signal timing on Ring Road. Deploy traffic police at Ashram junction.",
  };
}

// ── Pollution Heatmap ──
export function getPollutionHeatmap() {
  return {
    hotspots: [
      { zone: "Anand Vihar", aqi: 312, advice: "Avoid outdoor activities. Use N95 masks." },
      { zone: "ITO", aqi: 245, advice: "Moderate risk. Close car windows." },
      { zone: "Dwarka Sec 21", aqi: 178, advice: "Acceptable for short exposure." },
      { zone: "Rohini Sec 3", aqi: 156, advice: "Use public transport to reduce emissions." },
    ],
  };
}

// ── Adaptive Lane ──
export function getAdaptiveLane() {
  return {
    affected_corridors: ["Ring Road (South)", "NH-48 Gurugram", "DND Flyway"],
    expected_reduction: "18% congestion decrease",
    notes: "AI recommends reversible lane on Ring Road southbound during evening peak.",
  };
}

// ── Transit Load ──
export function getTransitLoad() {
  return {
    metro_load: `${Math.round(rand(72, 96))}% capacity`,
    bus_load: `${Math.round(rand(55, 88))}% capacity`,
    advice: "Blue Line crowded at Rajiv Chowk. Consider Yellow Line via Hauz Khas.",
  };
}

// ── EV Charging ──
export function getEvCharging() {
  return {
    stations: [
      { station: "Saket EESL Hub", available_ports: Math.round(rand(1, 6)), wait_time_min: Math.round(rand(5, 25)) },
      { station: "CP Tata Power", available_ports: Math.round(rand(0, 4)), wait_time_min: Math.round(rand(8, 35)) },
      { station: "Dwarka Sec 21 ChargeZone", available_ports: Math.round(rand(2, 8)), wait_time_min: Math.round(rand(3, 15)) },
    ],
  };
}

// ── Camera Alerts ──
export function getCameraAlerts() {
  return {
    camera_alerts: [
      { location: "Connaught Place", description: "Overcrowding detected at Rajiv Chowk crossing", severity: "High", updated_at: new Date().toISOString(), coords: [28.6328, 77.2197] },
      { location: "AIIMS", description: "Ambulance corridor violation detected", severity: "Critical", updated_at: new Date().toISOString(), coords: [28.5672, 77.2100] },
      { location: "IGI Airport", description: "Unauthorized parking on Terminal 3 ramp", severity: "Medium", updated_at: new Date().toISOString(), coords: [28.5562, 77.1000] },
    ],
  };
}

// ── Flood Risk ──
export function getFloodRisk() {
  return {
    risk_level: pick(["Moderate", "Low", "High"]),
    probability: Math.round(rand(15, 55)),
    recommendation: "Avoid underpasses near Minto Bridge and Pul Prahladpur during heavy rain.",
  };
}

// ── Airport Access ──
export function getAirportAccess() {
  return {
    access_index: `${Math.round(rand(65, 92))}/100`,
    recommended_corridor: "NH-48 via Dhaula Kuan → Aerocity (least congestion)",
    notes: "T3 pickup area clearing. Allow 15 min extra for T1 domestic.",
  };
}

// ── Toll Forecast ──
export function getTollForecast() {
  return {
    plazas: [
      { name: "Kherki Daula Toll", delay_min: Math.round(rand(5, 22)), rate_change: "+₹15 surge pricing" },
      { name: "DND Flyway Toll", delay_min: Math.round(rand(3, 12)), rate_change: "Standard ₹53" },
      { name: "Rajnigandha Flyover", delay_min: Math.round(rand(2, 8)), rate_change: "Standard ₹40" },
    ],
  };
}

// ── Smart Signal ──
export function getSmartSignal() {
  return {
    status: "Operational — AI mode active",
    notes: "42 intersections running adaptive timing. 3 under maintenance.",
    active_corridors: ["Ring Road", "Vikas Marg", "Mathura Road", "Outer Ring"],
  };
}

// ── Command Center ──
export function getCommandCenter() {
  const now = new Date();
  const hour = now.getHours();
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  const isNight = hour >= 22 || hour <= 5;

  // Weather & Rain prediction timeline
  const weatherConditions = ["Clear", "Partly Cloudy", "Overcast", "Light Rain", "Heavy Rain", "Thunderstorm", "Haze", "Fog"];
  const currentWeather = pick(["Clear", "Partly Cloudy", "Haze", "Overcast"]);
  const rainChance30 = Math.round(rand(10, 65));
  const rainChance60 = Math.round(rand(20, 80));
  const rainChance120 = Math.round(rand(15, 90));
  const willRain30 = rainChance30 > 50;
  const willRain60 = rainChance60 > 50;

  // Traffic timeline per zone (30/60 min)
  const trafficTimeline = ZONE_NAMES.map(zone => {
    const base = BASE_CONGESTION[zone];
    const levels = ["Low", "Medium", "High", "Very High"];
    const baseIdx = levels.indexOf(base);
    const shift30 = isPeak ? Math.min(3, baseIdx + (Math.random() < 0.5 ? 1 : 0)) : Math.max(0, baseIdx + (Math.random() < 0.3 ? -1 : 0));
    const shift60 = isPeak ? Math.min(3, baseIdx + (Math.random() < 0.6 ? 1 : 0)) : Math.max(0, baseIdx + (Math.random() < 0.4 ? -1 : 0));
    const rainPenalty30 = willRain30 ? Math.min(3, 1) : 0;
    const rainPenalty60 = willRain60 ? Math.min(3, 1) : 0;
    return {
      zone,
      current: base,
      in_30_min: levels[Math.min(3, shift30 + rainPenalty30)],
      in_60_min: levels[Math.min(3, shift60 + rainPenalty60)],
      trend: shift30 > baseIdx ? "worsening" : shift30 < baseIdx ? "improving" : "stable",
      speed_kmh_now: Math.round(rand(8, 55)),
      speed_kmh_30: Math.round(rand(6, 50)),
      speed_kmh_60: Math.round(rand(5, 48)),
    };
  });

  // Upcoming events & programs
  const upcomingEvents = [
    { id: "EVT-001", name: "Republic Day Rehearsal", location: "Rajpath / Kartavya Path", time: "6:00 AM - 10:00 AM", impact: "High", roads_affected: ["India Gate", "C-Hexagon", "Rajpath"], status: "Scheduled", type: "government" },
    { id: "EVT-002", name: "IPL Match — Arun Jaitley Stadium", location: "Feroz Shah Kotla", time: "7:30 PM - 11:00 PM", impact: "Very High", roads_affected: ["ITO", "Bahadur Shah Zafar Marg", "Daryaganj"], status: "Upcoming", type: "sports" },
    { id: "EVT-003", name: "Delhi Half Marathon", location: "JLN Stadium → India Gate", time: "5:30 AM - 9:30 AM", impact: "Very High", roads_affected: ["Lodhi Road", "Bhairon Marg", "Mathura Road"], status: "Tomorrow", type: "sports" },
    { id: "EVT-004", name: "Metro Maintenance — Blue Line", location: "Rajiv Chowk ↔ Dwarka", time: "11:00 PM - 5:00 AM", impact: "Medium", roads_affected: ["Increased road traffic during maintenance window"], status: "Tonight", type: "infrastructure" },
    { id: "EVT-005", name: "School Zone Rush — Summer Camps", location: "Multiple zones", time: "8:00 AM - 10:00 AM", impact: "Medium", roads_affected: ["Pitampura", "Rohini", "Dwarka Mor"], status: "Daily", type: "education" },
    { id: "EVT-006", name: "Construction — Pragati Maidan Flyover", location: "Pragati Maidan", time: "All Day", impact: "High", roads_affected: ["Mathura Road", "Bhairon Marg", "Ring Road"], status: "Ongoing", type: "infrastructure" },
  ].slice(0, Math.round(rand(3, 6)));

  // Weather forecast timeline
  const weatherTimeline = [
    { time: "Now", temp: Math.round(rand(28, 42)), condition: currentWeather, humidity: Math.round(rand(35, 75)), wind_kmh: Math.round(rand(5, 25)), rain_mm: 0 },
    { time: "+30 min", temp: Math.round(rand(27, 41)), condition: willRain30 ? pick(["Light Rain", "Overcast"]) : pick(["Clear", "Partly Cloudy"]), humidity: Math.round(rand(40, 80)), wind_kmh: Math.round(rand(8, 30)), rain_mm: willRain30 ? Math.round(rand(2, 15)) : 0 },
    { time: "+60 min", temp: Math.round(rand(26, 40)), condition: willRain60 ? pick(["Heavy Rain", "Thunderstorm", "Light Rain"]) : pick(["Clear", "Haze"]), humidity: Math.round(rand(45, 88)), wind_kmh: Math.round(rand(10, 35)), rain_mm: willRain60 ? Math.round(rand(5, 30)) : 0 },
    { time: "+2 hrs", temp: Math.round(rand(25, 39)), condition: rainChance120 > 50 ? pick(["Heavy Rain", "Thunderstorm"]) : pick(["Clear", "Partly Cloudy"]), humidity: Math.round(rand(40, 85)), wind_kmh: Math.round(rand(5, 28)), rain_mm: rainChance120 > 50 ? Math.round(rand(8, 40)) : 0 },
  ];

  const rainImpact = {
    will_rain_30: willRain30,
    will_rain_60: willRain60,
    rain_probability_30: rainChance30,
    rain_probability_60: rainChance60,
    rain_probability_120: rainChance120,
    congestion_increase: willRain30 ? "+25-40%" : willRain60 ? "+15-25%" : "No increase expected",
    waterlogging_risk: willRain60 ? pick(["High — Minto Bridge, Pul Prahladpur", "Moderate — ITO underpass, Dhaula Kuan"]) : "Low",
    advisory: willRain30 
      ? "⚠️ Rain expected in 30 min. Pre-position tow vehicles. Avoid underpasses. Expect +25% congestion on major corridors."
      : willRain60 
        ? "🌧️ Rain likely within 1 hour. Monitor drainage systems. Alert commuters via dynamic message signs."
        : "☀️ No rain expected in the next hour. Current conditions favorable for normal traffic flow.",
    affected_zones: willRain30 ? ["Minto Bridge", "Pul Prahladpur", "ITO Underpass", "Dhaula Kuan"] : [],
  };

  return {
    priority_corridor_status: isPeak ? "Critical" : isNight ? "Standby" : "Active",
    operational_focus: isPeak ? "Peak hour management" : isNight ? "Night operations" : "City resilience",
    system_uptime: `${Math.round(rand(99.2, 99.9))}%`,
    last_sync: now.toISOString(),
    dashboard_metrics: {
      active_alerts: Math.round(rand(8, 24)),
      average_congestion: Math.round(rand(isPeak ? 62 : 35, isPeak ? 85 : 60)),
      smart_signals_online: Math.round(rand(38, 48)),
      total_signals: 48,
      incident_response_rate: Math.round(rand(82, 97)),
      camera_coverage: Math.round(rand(120, 180)),
      total_cameras: 180,
      ev_availability: Math.round(rand(65, 85)),
      traffic_health_score: Math.round(rand(isPeak ? 55 : 72, isPeak ? 75 : 92)),
      route_efficiency: Math.round(rand(75, 95)),
      vehicles_tracked: Math.round(rand(24000, 68000)),
      avg_speed_kmh: Math.round(rand(isPeak ? 12 : 28, isPeak ? 25 : 45)),
    },
    traffic_timeline: trafficTimeline,
    weather_timeline: weatherTimeline,
    rain_impact: rainImpact,
    upcoming_events: upcomingEvents,
    predicted_issues: [
      { zone: "Connaught Place", risk: "Very High", cause: "Evening rush + metro maintenance", updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
      { zone: "AIIMS", risk: "High", cause: "Hospital OPD peak + ambulance corridors", updated_at: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
      { zone: "Cyber Hub", risk: "High", cause: "Office dispersal 6-8 PM wave", updated_at: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
      { zone: "Noida Sector 18", risk: "Medium", cause: "Mall weekend rush + construction on sector road", updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
    ],
    incident_feed: getIncidentFeed().issues,
    pollution_hotspots: getPollutionHeatmap().hotspots,
    public_safety_alerts: [
      { alert_id: "PSA-001", message: "VIP movement on Rajpath — diversions active 5-7 PM", severity: "High", status: "Active" },
      { alert_id: "PSA-002", message: "Marathon event near India Gate — road closures till 10 AM", severity: "Medium", status: "Scheduled" },
      { alert_id: "PSA-003", message: "Construction debris on NH-48 — cleanup underway", severity: "Low", status: "In Progress" },
    ],
    transit_load: getTransitLoad(),
    ev_charging: getEvCharging(),
    adaptive_lane: getAdaptiveLane(),
    camera_feed: [
      { location: "ITO Junction", severity: "High", description: "Heavy congestion detected — 4 lanes blocked", updated_at: new Date().toISOString(), feed_active: true },
      { location: "Rajiv Chowk", severity: "Medium", description: "Pedestrian overflow on road", updated_at: new Date().toISOString(), feed_active: true },
      { location: "Dwarka Mor", severity: "Low", description: "Normal traffic flow", updated_at: new Date().toISOString(), feed_active: true },
      { location: "AIIMS Flyover", severity: "High", description: "Ambulance corridor active", updated_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(), feed_active: true },
      { location: "Ashram Chowk", severity: "Critical", description: "Signal failure — manual control active", updated_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(), feed_active: true },
    ],
    smart_signal_grid: {
      total: 48,
      online: Math.round(rand(42, 48)),
      ai_mode: Math.round(rand(35, 45)),
      maintenance: Math.round(rand(0, 5)),
      corridors: [
        { name: "Ring Road", signals: 12, status: "AI Active", optimization: "+18% throughput" },
        { name: "Vikas Marg", signals: 8, status: "AI Active", optimization: "+12% throughput" },
        { name: "Mathura Road", signals: 6, status: "Scheduled", optimization: "Pending activation" },
        { name: "Outer Ring", signals: 10, status: "AI Active", optimization: "+22% throughput" },
      ],
    },
    flood_risk: {
      risk_level: willRain60 ? "High" : willRain30 ? "Moderate" : "Low",
      probability: willRain60 ? Math.round(rand(45, 75)) : Math.round(rand(5, 30)),
      recommendation: willRain60 
        ? "Deploy pumps at Minto Bridge & Pul Prahladpur. Close underpass entries preemptively."
        : "Monitor Yamuna levels. Current drainage capacity adequate.",
      vulnerable_points: ["Minto Bridge", "Pul Prahladpur", "ITO Underpass", "Ring Road Depression", "Dhaula Kuan Underpass"],
    },
    airport_access: {
      access_index: `${Math.round(rand(65, 92))}/100`,
      recommended_corridor: "NH-48 via Dhaula Kuan → Aerocity",
      estimated_delay_min: Math.round(rand(8, 25)),
      terminal_status: [
        { terminal: "T1 Domestic", status: "Normal", delay: `${Math.round(rand(5, 15))} min` },
        { terminal: "T3 International", status: isPeak ? "Congested" : "Normal", delay: `${Math.round(rand(10, 30))} min` },
      ],
      notes: "T3 pickup area clearing. Allow extra time for T1 domestic during peak.",
    },
    toll_forecast: getTollForecast(),
    recommendations: [
      "Deploy 4 additional traffic units to ITO junction during 5-7 PM",
      "Activate contraflow on Ring Road southbound from 4:30 PM",
      "Increase metro frequency on Blue Line by 20% during evening rush",
      "Open auxiliary lanes on DND Flyway for NCR-bound traffic",
      "Issue weather advisory — rain expected, pre-position tow vehicles at underpasses",
    ],
    actionable_items: [
      { id: 1, action: "Activate adaptive signals on Ring Road corridor", priority: "High", status: "pending" },
      { id: 2, action: "Deploy traffic police at Ashram Chowk (signal failure)", priority: "Critical", status: "pending" },
      { id: 3, action: "Open emergency lane on DND for NCR traffic", priority: "Medium", status: "pending" },
      { id: 4, action: "Alert Metro control — increase Blue Line frequency", priority: "High", status: "pending" },
      { id: 5, action: "Pre-position tow vehicles at 5 waterlogging-prone underpasses", priority: willRain60 ? "Critical" : "Low", status: "pending" },
      { id: 6, action: "Activate dynamic message signs for weather advisory", priority: willRain30 ? "High" : "Low", status: "pending" },
    ],
  };
}

// ── Urban Mobility Report ──
export function getUrbanReport() {
  return {
    transit_resilience: `${Math.round(rand(72, 88))}/100`,
    airport_access_index: `${Math.round(rand(70, 92))}/100`,
    smart_signal_uptime: `${Math.round(rand(90, 99))}%`,
  };
}

// ── Live Summary ──
export function getLiveSummary(predictions) {
  return { timestamp: new Date().toISOString(), zones: predictions };
}

// ── Forecast ──
export function getForecast(location) {
  const levels = ["Low", "Medium", "High", "Very High"];
  return {
    location,
    forecasts: [15, 30, 60].map(h => ({
      horizon_min: h,
      congestion_level: pick(levels),
    })),
  };
}

// ── Departure Advice ──
export function getDepartureAdvice(location) {
  const msgs = [
    `Best departure from ${location}: Leave before 7:30 AM or after 10:30 AM to avoid peak.`,
    `Evening rush at ${location} peaks 5:30-7:30 PM. Delay departure if possible.`,
    `Current conditions favorable. Depart now for smooth travel from ${location}.`,
  ];
  return { message: pick(msgs) };
}

// ── Heatmap Data (for map overlay) ──
export function getHeatmapData(predictions) {
  const intensityMap = { "Very High": 0.95, "High": 0.7, "Medium": 0.4, "Low": 0.15 };
  return {
    heatmap_zones: ZONE_NAMES.map(name => ({
      location: name,
      coords: ZONE_COORDS[name],
      congestion_level: predictions[name]?.congestion_level || "Low",
      intensity: intensityMap[predictions[name]?.congestion_level] || 0.15,
    })),
  };
}

// ── Dynamic Reroute ──
export function getDynamicReroute(source, destination, predictions) {
  const result = findBestRoute(source, destination, predictions);
  const avoidedZones = ZONE_NAMES.filter(z =>
    predictions[z]?.congestion_level === "Very High" && !result.path.includes(z)
  );
  return {
    recommended_route: result.path,
    eta_mins: Math.round(result.cost * 3.5 + rand(5, 15)),
    risk_score: Math.round(rand(8, 35)),
    avoided_zones: avoidedZones.length ? avoidedZones : ["None — route is optimal"],
    advice: `AI-optimized route via ${result.path.slice(1, -1).join(", ") || "direct"} avoiding heavy congestion zones.`,
  };
}

// ── Route Profiles ──
export function getRouteProfiles(source, destination, predictions) {
  const fastest = findBestRoute(source, destination, predictions);
  const makeCost = (base) => Math.round(base * 3.5 + rand(5, 15));
  const profiles = [
    {
      name: "⚡ Fastest Route",
      eta_mins: makeCost(fastest.cost),
      toll_inr: Math.round(rand(60, 140)),
      co2_grams: Math.round(rand(2200, 3200)),
      ai_score: Math.round(rand(88, 97)),
      path: fastest.path,
    },
    {
      name: "💰 Economical Route",
      eta_mins: makeCost(fastest.cost) + Math.round(rand(8, 18)),
      toll_inr: Math.round(rand(0, 40)),
      co2_grams: Math.round(rand(1800, 2600)),
      ai_score: Math.round(rand(75, 88)),
      path: fastest.path,
    },
    {
      name: "🌿 Eco-Friendly Route",
      eta_mins: makeCost(fastest.cost) + Math.round(rand(5, 14)),
      toll_inr: Math.round(rand(20, 70)),
      co2_grams: Math.round(rand(1200, 1900)),
      ai_score: Math.round(rand(80, 92)),
      path: fastest.path,
    },
  ];
  const recommended = profiles.reduce((best, p) => p.ai_score > best.ai_score ? p : best, profiles[0]);
  return { route_profiles: profiles, recommended };
}

// ── Emergency Route ──
export function getEmergencyRoute(source, destination, predictions) {
  const result = findBestRoute(source, destination, predictions);
  return {
    name: "🚨 Emergency Corridor",
    eta_mins: Math.round(result.cost * 2 + rand(3, 8)),
    toll_inr: 0,
    co2_grams: Math.round(rand(900, 1500)),
    ai_score: Math.round(rand(90, 99)),
    path: result.path,
    notes: "Priority lanes engaged. Traffic signals overridden. Ambulance corridor activated.",
  };
}

// ── Chat Bot ──
export function chatResponse(query) {
  const q = query.toLowerCase();
  if (q.includes("best time") || q.includes("when"))
    return "Delhi-NCR ka best travel time: Subah 6-7 AM ya raat 9 PM ke baad. Peak hours 8:30-10:30 AM aur 5:30-8 PM avoid karein. Saturday subah sabse smooth hota hai.";
  if (q.includes("cp") || q.includes("connaught"))
    return "Connaught Place mein abhi Very High congestion hai. Rajiv Chowk side se avoid karein. Metro best option hai — Yellow/Blue Line direct connectivity hai. Parking underground lot mein available — ₹60/hr.";
  if (q.includes("airport") || q.includes("igi"))
    return "IGI Airport ke liye abhi NH-48 via Dhaula Kuan best hai. T3 pe 15 min extra rakhein. Toll: ₹53 (DND) ya ₹0 (Dwarka route). T1 Domestic mein abhi 8 min delay hai.";
  if (q.includes("rain") || q.includes("weather") || q.includes("barish"))
    return "🌧️ Aaj raat 9 PM ke baad baarish expected hai. Minto Bridge, Pul Prahladpur underpasses avoid karein. Congestion +25% ho sakta hai major corridors pe. Waterlogging risk: ITO underpass, Dhaula Kuan.";
  if (q.includes("fastest") || q.includes("route") || q.includes("rasta"))
    return "Fastest route ke liye Dashboard pe Source aur Destination select karein — AI automatically best path calculate karega with toll, ETA, aur CO2 analysis. Route Lab mein 3 options milenge.";
  if (q.includes("aiims"))
    return "AIIMS zone mein Very High congestion — hospital OPD rush + ambulance movement. Ring Road se bypass karein. Green Corridor active hai emergency ke liye. Speed: 8 km/h current.";
  if (q.includes("noida") || q.includes("sector 18"))
    return "Noida Sector 18 mein High congestion. DND se jaayein toh ₹53 toll lagega. Kalindi Kunj free hai but 20 min extra lagenge. Mall traffic 6 PM ke baad spike karta hai.";
  if (q.includes("compare") || q.includes("dwarka") || q.includes("gurgaon") || q.includes("gurugram"))
    return "Dwarka route: Toll-free, 45 min avg. Gurugram route: NH-48 via Dhaula Kuan, 35 min but ₹140 toll. AI recommendation: Time priority → Gurugram, Budget → Dwarka.";
  if (q.includes("metro"))
    return "🚇 Metro best option hai peak hours mein! Blue Line: Dwarka ↔ Noida (50 min). Yellow Line: Samaypur Badli ↔ HUDA (65 min). Current load: 88% capacity. Rajiv Chowk interchange pe 5 min extra rakhein.";
  if (q.includes("pollution") || q.includes("aqi"))
    return "🏭 Delhi AQI abhi 186 (Unhealthy). Anand Vihar sabse kharab (312). Mask lagaaein. EV/Metro use karein. Outdoor exercise avoid karein. Eco route Dashboard mein available hai.";
  if (q.includes("toll") || q.includes("fastag"))
    return "💳 Toll update: Kherki Daula — ₹150 (surge +₹15), 12 min delay. DND Flyway — ₹53, 5 min delay. Rajnigandha — ₹40, 3 min delay. FASTag recommended sabhi plazas pe.";
  if (q.includes("ev") || q.includes("electric") || q.includes("charging"))
    return "⚡ EV Charging: Saket EESL Hub — 4 ports, 12 min wait. CP Tata Power — 2 ports, 20 min wait. Dwarka ChargeZone — 6 ports, 5 min wait. All CCS2 + CHAdeMO supported.";
  if (q.includes("parking") || q.includes("park"))
    return "🅿️ Parking: CP underground — 42 spots, ₹60/hr. Saket Select City — 85 spots, ₹40/hr. Nehru Place multi-level — 28 spots, ₹30/hr. AI recommends early arrival for CP.";
  if (q.includes("flood") || q.includes("waterlog") || q.includes("paani"))
    return "🌊 Flood alert: Minto Bridge, Pul Prahladpur aur ITO underpass mein waterlogging risk hai agar baarish hoti hai. Yamuna level monitoring active. Alternate routes use karein.";
  if (q.includes("emergency") || q.includes("ambulance") || q.includes("accident"))
    return "🚨 Emergency corridor: Dashboard → Route Lab → 'Request Corridor' button dabaaein. Green corridor activate hoga with signal override. Current response time: 4 min average.";
  if (q.includes("signal") || q.includes("traffic light"))
    return "🚦 Smart Signals: 45/48 online, 42 AI mode mein. Ring Road pe +18% throughput improvement. Vikas Marg +12%. 3 signals maintenance mein hain — ITO, Pragati Maidan, Moolchand.";
  if (q.includes("bus") || q.includes("dtc"))
    return "🚌 DTC Bus load: 72% capacity. Blue Line feeder buses Rajiv Chowk se available. Cluster buses Dwarka-Gurugram corridor pe 15 min frequency. Evening rush mein 20 min delay possible.";
  if (q.includes("construction") || q.includes("road work"))
    return "🚧 Active construction: Pragati Maidan Flyover (all day), NH-48 near Mahipalpur (night), Barapullah Phase 3 (ongoing). Expect +15 min delays near these zones.";
  if (q.includes("weekend") || q.includes("saturday") || q.includes("sunday"))
    return "📅 Weekend traffic: Saturday subah 30% less congestion. Sunday sabse smooth — avg speed 38 km/h. Mall areas (Saket, Noida 18) mein evening rush expect karein.";
  return `Delhi-NCR traffic ke baare mein aur specific sawal puchein! 🚗\n\nJaise: "Best time to travel to CP", "Airport ka fastest route", "Toll charges kitne hain", "Rain ka traffic pe impact", "Parking CP mein", "Metro ki load", etc.`;
}
