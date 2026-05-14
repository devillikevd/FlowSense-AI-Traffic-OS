import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Eye } from "lucide-react";
import { motion } from "framer-motion";

const WEATHER_DATA = {
  condition: "Partly Cloudy",
  temp: 34,
  humidity: 62,
  windSpeed: 14,
  visibility: 8,
  aqi: 156,
  impact: "moderate",
  forecast: [
    { time: "Now", icon: "cloudy", temp: 34 },
    { time: "3 PM", icon: "sunny", temp: 36 },
    { time: "6 PM", icon: "cloudy", temp: 33 },
    { time: "9 PM", icon: "rain", temp: 28 },
  ],
};

const weatherIcons = {
  sunny: <Sun size={20} />,
  cloudy: <Cloud size={20} />,
  rain: <CloudRain size={20} />,
};

export default function WeatherPanel() {
  const { condition, temp, humidity, windSpeed, visibility, aqi, impact, forecast } = WEATHER_DATA;

  const impactColor =
    impact === "high" ? "var(--color-danger)" : impact === "moderate" ? "var(--color-warning)" : "var(--color-success)";

  return (
    <motion.div
      className="weather-panel glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="weather-header">
        <div className="weather-main">
          <Cloud size={36} className="weather-icon-main" />
          <div>
            <h3 className="weather-temp">{temp}°C</h3>
            <p className="weather-cond">{condition}</p>
          </div>
        </div>
        <div className="weather-impact-badge" style={{ background: `${impactColor}18`, color: impactColor }}>
          {impact === "high" ? "High Impact" : impact === "moderate" ? "Moderate Impact" : "Low Impact"}
        </div>
      </div>

      <div className="weather-stats">
        <div className="weather-stat">
          <Droplets size={16} />
          <span>{humidity}%</span>
          <small>Humidity</small>
        </div>
        <div className="weather-stat">
          <Wind size={16} />
          <span>{windSpeed} km/h</span>
          <small>Wind</small>
        </div>
        <div className="weather-stat">
          <Eye size={16} />
          <span>{visibility} km</span>
          <small>Visibility</small>
        </div>
        <div className="weather-stat">
          <Thermometer size={16} />
          <span style={{ color: aqi > 150 ? "var(--color-warning)" : "var(--color-success)" }}>{aqi}</span>
          <small>AQI</small>
        </div>
      </div>

      <div className="weather-forecast">
        {forecast.map((f, i) => (
          <div key={i} className="weather-fc-item">
            <span className="weather-fc-time">{f.time}</span>
            <div className="weather-fc-icon">{weatherIcons[f.icon]}</div>
            <span className="weather-fc-temp">{f.temp}°</span>
          </div>
        ))}
      </div>

      <p className="weather-note">
        Rain expected by 9 PM — congestion likely +25% on major corridors.
      </p>
    </motion.div>
  );
}
