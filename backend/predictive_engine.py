import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

LABELS = ["High", "Low", "Medium", "Very High"]

LOCATION_COORDS = {
    "Connaught Place": (28.6328, 77.2197),
    "Rajiv Chowk": (28.6314, 77.2167),
    "AIIMS": (28.5672, 77.2100),
    "Nehru Place": (28.5533, 77.2594),
    "Lajpat Nagar": (28.5672, 77.2522),
    "Saket": (28.5245, 77.2137),
    "Hauz Khas": (28.5497, 77.1995),
    "South Extension": (28.5568, 77.2188),
    "Khan Market": (28.6213, 77.2213),
    "Karol Bagh": (28.6513, 77.1890),
    "Rajouri Garden": (28.6509, 77.1091),
    "Punjabi Bagh": (28.6889, 77.1311),
    "Janakpuri": (28.6135, 77.0563),
    "Dwarka Mor": (28.6034, 77.0628),
    "Shalimar Bagh": (28.6968, 77.1705),
    "Pitampura": (28.7134, 77.1485),
    "Rohini": (28.7300, 77.1055),
    "Vaishali": (28.6201, 77.3844),
    "Noida Sector 18": (28.5718, 77.3207),
    "Noida City Centre": (28.5709, 77.3201),
    "Sector 62 Noida": (28.6925, 77.1547),
    "Gurugram Cyber Hub": (28.5034, 77.0880),
    "Gurugram Expressway": (28.4383, 77.0800),
    "Faridabad NIT": (28.4339, 77.3049),
    "Badarpur Border": (28.5185, 77.3087),
    "Ghaziabad Crossing": (28.6692, 77.4520),
    "Anand Vihar": (28.6464, 77.2970),
    "Preet Vihar": (28.6266, 77.2904),
    "Mayur Vihar": (28.6170, 77.2948),
    "Yamuna Sports Complex": (28.5978, 77.2621),
    "IGI Airport": (28.5562, 77.1000),
    "MG Road": (28.5603, 77.2336),
    "Cyber Hub": (28.5034, 77.0880),
    "Nizamuddin": (28.5817, 77.2475),
    "Mandi House": (28.6287, 77.2193),
    "Kalkaji": (28.5358, 77.2440),
    "Malviya Nagar": (28.5326, 77.2121),
    "Sanjay Gandhi Transport Nagar": (28.7155, 77.1686),
    "Karawal Nagar": (28.7087, 77.2701),
    "Seelampur": (28.6828, 77.2535),
    "Shahdara": (28.6982, 77.2616),
    "Laxmi Nagar": (28.6452, 77.2555),
}

ROUTE_TEMPLATES = [
    {
        "name": "CP → IGI Express",
        "path": ["Connaught Place", "MG Road", "IGI Airport"],
        "base_eta": 42,
        "priority_tags": ["airport", "priority_lane"],
    },
    {
        "name": "Noida City Centre → Cyber Hub",
        "path": ["Noida City Centre", "Sector 62 Noida", "Gurugram Cyber Hub"],
        "base_eta": 58,
        "priority_tags": ["expressway", "office_rush"],
    },
    {
        "name": "AIIMS → Rajiv Chowk",
        "path": ["AIIMS", "Mandi House", "Rajiv Chowk"],
        "base_eta": 35,
        "priority_tags": ["metro_spillover", "hospital"],
    },
    {
        "name": "Dwarka Mor → Rajouri Garden",
        "path": ["Dwarka Mor", "Janakpuri", "Rajouri Garden"],
        "base_eta": 40,
        "priority_tags": ["suburban"],
    },
    {
        "name": "Noida Sector 18 → Faridabad NIT",
        "path": ["Noida Sector 18", "Anand Vihar", "Faridabad NIT"],
        "base_eta": 65,
        "priority_tags": ["cross_city", "toll"],
    },
]

WEATHER_RISK_MAP = {
    "Clear": 0.0,
    "Cloudy": 0.1,
    "Rain": 0.5,
    "Heavy Rain": 0.8,
    "Fog": 0.6,
}


class FallbackTrafficModel:
    def predict(self, X):
        values = []
        for _, row in X.iterrows():
            score = 1
            score += int(row["is_peak"])
            score += int(row["Avg Speed (km/h)"] < 28)
            score += int(row["Traffic Volume"] > 820)
            values.append(min(max(score, 0), len(LABELS) - 1))
        return np.array(values)

    def predict_proba(self, X):
        rows = []
        for _, row in X.iterrows():
            base = 0.2 + 0.15 * int(row["is_peak"])
            rows.append([0.15, 0.25, 0.3, 0.3] if row["is_peak"] else [0.2, 0.35, 0.3, 0.15])
        return np.array(rows)


class TrafficEngine:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        workspace = os.path.dirname(base_dir)
        try:
            self.model = joblib.load(os.path.join(workspace, "ml", "model.pkl"))
            self.features = joblib.load(os.path.join(workspace, "ml", "features.pkl"))
        except Exception as exc:
            print("Warning: Unable to load trained traffic model, using fallback model.", exc)
            self.model = FallbackTrafficModel()
            self.features = None
        self.location_coords = LOCATION_COORDS
        self.labels = LABELS

    def _nearest_location(self, lat: float, lng: float) -> str:
        best = None
        best_dist = float("inf")
        for loc, (la, lo) in self.location_coords.items():
            dist = (lat - la) ** 2 + (lng - lo) ** 2
            if dist < best_dist:
                best_dist = dist
                best = loc
        return best

    def _is_peak(self, hour: int) -> int:
        return 1 if hour in [7, 8, 9, 17, 18, 19, 20] else 0

    def _make_features(
        self,
        location: str,
        timestamp: datetime,
        accident_flag: int = 0,
        event_flag: int = 0,
        weather_risk: float = 0.0,
        traffic_volume: int = 750,
        avg_speed: int = 35,
        lag1_volume: int = 740,
        roll3_volume: int = 755,
        lag1_speed: int = 34,
        roll3_speed: int = 36,
    ) -> pd.DataFrame:
        hour = timestamp.hour
        dow = timestamp.weekday()
        base = {
            "hour": hour,
            "dow": dow,
            "is_weekend": 1 if dow >= 5 else 0,
            "is_peak": self._is_peak(hour),
            "sin_hour": np.sin(2 * np.pi * hour / 24),
            "cos_hour": np.cos(2 * np.pi * hour / 24),
            "Traffic Volume": traffic_volume,
            "Avg Speed (km/h)": avg_speed,
            "accident_flag": accident_flag,
            "event_flag": event_flag,
            "weather_risk": weather_risk,
            "Traffic Volume_lag1": lag1_volume,
            "Traffic Volume_roll3": roll3_volume,
            "Avg Speed (km/h)_lag1": lag1_speed,
            "Avg Speed (km/h)_roll3": roll3_speed,
        }
        df = pd.DataFrame([base])
        return df[self.features] if self.features is not None else df

    def predict_location(self, location: str, timestamp: Optional[datetime] = None) -> Dict:
        if timestamp is None:
            timestamp = datetime.now()
        if location not in self.location_coords:
            location = self._nearest_location(28.6139, 77.2090)

        X = self._make_features(location, timestamp)
        pred_class = int(self.model.predict(X)[0])
        proba = self.model.predict_proba(X)[0]
        return {
            "location": location,
            "timestamp": timestamp.isoformat(),
            "congestion_level": self.labels[pred_class],
            "confidence": round(float(proba.max()), 3),
            "predicted_horizon": 0,
        }

    def forecast_location(self, location: str, now: Optional[datetime] = None) -> Dict:
        if now is None:
            now = datetime.now()
        horizons = [5, 15, 30, 60]
        result = {"location": location, "forecasts": []}

        for minutes in horizons:
            future_ts = now + timedelta(minutes=minutes)
            decay = 1 - min(minutes / 180.0, 0.8)
            weather_risk = 0.2 + 0.3 * (minutes / 60)
            traffic_volume = int(780 + 35 * np.sin(2 * np.pi * future_ts.hour / 24) + minutes * 0.4)
            avg_speed = max(18, int(36 - minutes * 0.08))
            forecast = self._make_features(
                location,
                future_ts,
                accident_flag=0,
                event_flag=0,
                weather_risk=min(weather_risk, 0.8),
                traffic_volume=traffic_volume,
                avg_speed=avg_speed,
                lag1_volume=traffic_volume - 10,
                roll3_volume=traffic_volume - 4,
                lag1_speed=max(16, avg_speed + 1),
                roll3_speed=max(18, avg_speed + 2),
            )
            class_idx = int(self.model.predict(forecast)[0])
            score = round(float(self.model.predict_proba(forecast)[0][class_idx]), 3)
            result["forecasts"].append({
                "horizon_min": minutes,
                "timestamp": future_ts.isoformat(),
                "congestion_level": self.labels[class_idx],
                "confidence": score,
            })
        return result

    def route_suggestions(self, origin: str, destination: str, now: Optional[datetime] = None) -> Dict:
        if now is None:
            now = datetime.now()
        if origin not in self.location_coords:
            origin = self._nearest_location(*self.location_coords.get(origin, (28.6139, 77.2090)))
        if destination not in self.location_coords:
            destination = self._nearest_location(*self.location_coords.get(destination, (28.6139, 77.2090)))

        routes = []
        for template in ROUTE_TEMPLATES:
            score = 100 - (now.hour % 24) - len(template["path"]) * 2
            congestion_risk = sum(
                [self.predict_location(path_point, now)["confidence"] for path_point in template["path"]]
            ) / len(template["path"])
            eta = int(template["base_eta"] * (1 + congestion_risk * 0.18))
            routes.append({
                "name": template["name"],
                "path": template["path"],
                "eta_mins": eta,
                "risk_score": round(congestion_risk * 100, 0),
                "ai_score": min(100, max(45, int(score - congestion_risk * 20))),
                "recommended": template["path"][0] == origin or origin in template["path"],
            })

        routes = sorted(routes, key=lambda x: (x["risk_score"], x["eta_mins"]))
        return {"origin": origin, "destination": destination, "generated_at": now.isoformat(), "routes": routes}

    def heatmap_data(self, now: Optional[datetime] = None) -> Dict:
        if now is None:
            now = datetime.now()
        zones = []
        intensity_map = {"Low": 0.25, "Medium": 0.55, "High": 0.8, "Very High": 0.98}
        for loc in self.location_coords:
            prediction = self.predict_location(loc, now)
            zones.append({
                "location": loc,
                "timestamp": now.isoformat(),
                "congestion_level": prediction["congestion_level"],
                "confidence": prediction["confidence"],
                "intensity": intensity_map.get(prediction["congestion_level"], 0.4),
                "coords": self.location_coords[loc],
            })
        return {"timestamp": now.isoformat(), "heatmap_zones": zones}

    def dynamic_reroute(self, origin: str, destination: str, now: Optional[datetime] = None) -> Dict:
        if now is None:
            now = datetime.now()
        options = self.route_suggestions(origin, destination, now)["routes"]
        recommendation = min(options, key=lambda item: (item["risk_score"], item["eta_mins"]))
        avoided_zones = [zone for zone in recommendation["path"] if self.predict_location(zone, now)["congestion_level"] in ["High", "Very High"]]
        alternatives = [
            {"name": opt["name"], "eta_mins": opt["eta_mins"], "risk_score": opt["risk_score"], "ai_score": opt["ai_score"], "path": opt["path"]}
            for opt in options
        ]
        return {
            "origin": origin,
            "destination": destination,
            "recommended_route": recommendation["path"],
            "recommended_name": recommendation["name"],
            "eta_mins": recommendation["eta_mins"],
            "risk_score": recommendation["risk_score"],
            "ai_score": recommendation["ai_score"],
            "avoided_zones": avoided_zones,
            "alternatives": alternatives,
            "generated_at": now.isoformat(),
            "advice": "This reroute avoids the most congested corridors based on current live zone predictions.",
        }

    def best_departure_advice(self, location: str, now: Optional[datetime] = None) -> Dict:
        if now is None:
            now = datetime.now()
        base = self.forecast_location(location, now)
        later = self.forecast_location(location, now + timedelta(minutes=20))
        current = base["forecasts"][0]
        later_pred = later["forecasts"][0]
        advice = {
            "location": location,
            "current_level": current["congestion_level"],
            "current_confidence": current["confidence"],
            "later_level": later_pred["congestion_level"],
            "later_confidence": later_pred["confidence"],
            "leave_now_eta_delta": int((later_pred["confidence"] - current["confidence"]) * 15),
            "message": "If you leave now, you may save time compared to delaying 20 minutes.",
        }
        if later_pred["confidence"] > current["confidence"]:
            advice["message"] = "Traffic is expected to worsen in 20 minutes. Leave now for the best ETA."
        else:
            advice["message"] = "Traffic may ease if you delay departure. Leave in 20 minutes for a smoother ride."
        return advice

    def live_zone_summary(self) -> Dict:
        now = datetime.now()
        data = {loc: self.predict_location(loc, now) for loc in self.location_coords}
        return {"timestamp": now.isoformat(), "zones": data}

    def resolve_text_location(self, text: str) -> Dict:
        normalized = text.strip().lower()
        if not normalized:
            return {"text": text, "resolved_zone": "Connaught Place", "confidence": 0.45, "message": "No location text provided, defaulting to Connaught Place."}

        exact = {loc.lower(): loc for loc in self.location_coords}
        if normalized in exact:
            return {"text": text, "resolved_zone": exact[normalized], "confidence": 0.98, "message": "Exact zone matched."}

        candidates = [loc for loc in self.location_coords if normalized in loc.lower()]
        if candidates:
            return {"text": text, "resolved_zone": candidates[0], "confidence": 0.92, "message": "Matched by zone name substring."}

        tokens = normalized.split()
        best = None
        best_score = -1
        for loc in self.location_coords:
            loc_tokens = loc.lower().split()
            score = sum(1 for token in tokens if token in loc_tokens)
            score += 0.5 if any(token in loc.lower() for token in tokens) else 0
            if score > best_score:
                best_score = score
                best = loc
        if best_score > 0:
            return {"text": text, "resolved_zone": best, "confidence": min(0.9, 0.6 + best_score * 0.15), "message": "Resolved location from nearby Delhi NCR zone."}

        fallback = self._nearest_location(28.6139, 77.2090)
        return {"text": text, "resolved_zone": fallback, "confidence": 0.35, "message": "Unable to resolve text precisely; using default zone."}

    def geolocate(self, lat: float, lng: float) -> Dict:
        nearest = self._nearest_location(lat, lng)
        return {"latitude": lat, "longitude": lng, "nearest_zone": nearest, "zone_coords": self.location_coords[nearest]}
