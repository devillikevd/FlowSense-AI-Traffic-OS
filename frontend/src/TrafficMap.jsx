import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

const COORDS = {
  "IGI Airport": [28.5562, 77.1000],
  "Connaught Place": [28.6328, 77.2197],
  "Cyber Hub": [28.5034, 77.0880],
  "Dwarka Mor": [28.6034, 77.0628],
  "Noida Sector 18": [28.5718, 77.3207],
  "Lajpat Nagar": [28.5672, 77.2522],
  "Nehru Place": [28.5533, 77.2594],
  Saket: [28.5245, 77.2137],
  Rohini: [28.7300, 77.1055],
  Pitampura: [28.7134, 77.1485],
  Vaishali: [28.6201, 77.3844],
  Indirapuram: [28.6405, 77.3673],
  "MG Road": [28.5603, 77.2336],
  AIIMS: [28.5672, 77.2100],
};

const COLOR_MAP = { "Very High": "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };
const HEAT_COLOR = { "Very High": "#f43f5e", High: "#fb923c", Medium: "#facc15", Low: "#22c55e" };

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function TrafficMap({ predictions, heatmapData, routePath, cameraAlerts, onMarkerClick, selectedLocation, routeSource, routeDestination, mapClickMode }) {
  const findNearest = (lat, lng) => {
    let nearest = null, minDist = Infinity;
    Object.entries(COORDS).forEach(([name, [la, lo]]) => {
      const dist = Math.hypot(lat - la, lng - lo);
      if (dist < minDist) { minDist = dist; nearest = name; }
    });
    return nearest;
  };

  const handleMapClick = (lat, lng) => {
    const location = findNearest(lat, lng);
    if (location) onMarkerClick(location);
  };

  const routeCoords = (routePath || []).map((loc) => COORDS[loc]).filter(Boolean);
  const cameraCoords = (cameraAlerts || []).map((alert) => ({
    ...alert, coords: alert.coords || COORDS[alert.location],
  })).filter((alert) => Boolean(alert.coords));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <MapContainer
        className="leaflet-map"
        center={[28.6139, 77.2090]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "520px", borderRadius: "16px", overflow: "hidden", cursor: mapClickMode ? "crosshair" : "grab" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
        {heatmapData?.heatmap_zones?.map((zone) => (
          <Circle key={`heat-${zone.location}`} center={zone.coords} radius={6000 + zone.intensity * 12000}
            pathOptions={{ color: "transparent", fillColor: HEAT_COLOR[zone.congestion_level] || "#22c55e", fillOpacity: 0.18 }} />
        ))}
        {routeCoords.length > 1 && (
          <Polyline positions={routeCoords} pathOptions={{ color: "#7c3aed", weight: 5, dashArray: "10,8", opacity: 0.9 }} />
        )}
        {cameraCoords.map((alert, idx) => (
          <CircleMarker key={`cam-${idx}`} center={alert.coords} radius={10}
            pathOptions={{ color: "#f59e0b", fillColor: "#fbbf24", fillOpacity: 0.9, weight: 2 }}>
            <Popup><div style={{ fontFamily: "Inter", padding: 4 }}>
              <strong>{alert.location}</strong>
              <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>{alert.severity}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{alert.description}</div>
            </div></Popup>
          </CircleMarker>
        ))}
        {routeSource && COORDS[routeSource] && (
          <CircleMarker center={COORDS[routeSource]} radius={22}
            pathOptions={{ color: "#fff", fillColor: "#10b981", fillOpacity: 0.95, weight: 3 }}>
            <Popup><div style={{ fontFamily: "Inter" }}><strong style={{ color: "#10b981" }}>SOURCE</strong><br />{routeSource}</div></Popup>
          </CircleMarker>
        )}
        {routeDestination && COORDS[routeDestination] && (
          <CircleMarker center={COORDS[routeDestination]} radius={22}
            pathOptions={{ color: "#fff", fillColor: "#f43f5e", fillOpacity: 0.95, weight: 3 }}>
            <Popup><div style={{ fontFamily: "Inter" }}><strong style={{ color: "#f43f5e" }}>DESTINATION</strong><br />{routeDestination}</div></Popup>
          </CircleMarker>
        )}
        {Object.entries(predictions || {}).map(([location, data]) => {
          const coord = COORDS[location];
          if (!coord) return null;
          const color = COLOR_MAP[data.congestion_level] || "#22c55e";
          const isSelected = selectedLocation === location;
          return (
            <CircleMarker key={location} center={coord} radius={isSelected ? 24 : 16}
              pathOptions={{ color: isSelected ? "#fff" : color, fillColor: color, fillOpacity: isSelected ? 0.95 : 0.7, weight: isSelected ? 3 : 1.5 }}
              eventHandlers={{ click: () => onMarkerClick(location) }}>
              <Popup><div style={{ fontFamily: "Inter", padding: 4 }}>
                <strong style={{ fontSize: 14 }}>{location}</strong>
                {routeSource === location && <div style={{ color: "#10b981", fontWeight: 700, fontSize: 11 }}>SOURCE</div>}
                {routeDestination === location && <div style={{ color: "#f43f5e", fontWeight: 700, fontSize: 11 }}>DESTINATION</div>}
                <div style={{ marginTop: 4, color, fontWeight: 700, fontSize: 13 }}>{data.congestion_level}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Confidence: {Math.round(data.confidence * 100)}%</div>
              </div></Popup>
            </CircleMarker>
          );
        })}
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </motion.div>
  );
}
