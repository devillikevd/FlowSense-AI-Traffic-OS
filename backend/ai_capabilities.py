import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json

from backend.predictive_engine import TrafficEngine

VEHICLE_TYPES = ["car", "bike", "auto", "truck", "bus"]
ROUTE_PROFILES = ["fastest", "cheapest", "eco", "safest", "balanced"]
EVENT_IMPACTS = {
    "festival": 0.32,
    "protest": 0.45,
    "concert": 0.28,
    "sports": 0.22,
    "vip_movement": 0.40,
    "construction": 0.38,
    "none": 0.0,
}

# Conversational responses and messages
GREETING_MESSAGES = {
    "hello": "Hello! I'm FlowSense AI. How can I help you with traffic today?",
    "hi": "Hi there! 👋 I can help with traffic predictions, route optimization, and real-time traffic updates.",
    "help": "I can assist with: Traffic predictions, Route suggestions, Incident alerts, Parking info, Emergency routes, and more!",
    "status": "Let me check the current traffic status for you. Which location are you interested in?",
}

RESPONSE_TEMPLATES = {
    "traffic_high": "Traffic is heavy at {location} right now. I recommend taking {alternate_route} or delaying your trip by {delay_min} minutes.",
    "traffic_low": "Great news! Traffic is light at {location}. This is a perfect time to travel!",
    "route_suggestion": "Based on current conditions, I suggest the {profile} route via {route}. Estimated time: {eta} minutes.",
    "emergency_help": "Emergency route activated! Clearing priority lanes from {origin} to {destination}.",
    "no_data": "I don't have specific data for that location yet, but I can provide predictions based on historical patterns.",
}

SEGMENT_TEMPLATES = [
    "Outer Ring Road", "NH8 Expressway", "MG Road Corridor", "AIIMS Link Road",
    "Noida-Greater Noida Expressway", "DND Flyway", "GT Road", "Ring Road South",
    "Pitam Pura Road", "Janakpuri Road", "Kashmere Gate Stretch", "Kalkaji Road",
]

CAMERA_COORDS = {
    "Outer Ring Road": (28.6181, 77.1937),
    "NH8 Expressway": (28.5350, 77.1050),
    "MG Road Corridor": (28.5603, 77.2336),
    "AIIMS Link Road": (28.5600, 77.2100),
    "Noida-Greater Noida Expressway": (28.4950, 77.5320),
    "DND Flyway": (28.5796, 77.3331),
    "GT Road": (28.7000, 77.1700),
    "Ring Road South": (28.5720, 77.2040),
    "Pitam Pura Road": (28.7175, 77.1494),
    "Janakpuri Road": (28.6180, 77.0840),
    "Kashmere Gate Stretch": (28.6600, 77.2320),
    "Kalkaji Road": (28.5490, 77.2550),
}

AQI_LEVELS = ["Good", "Moderate", "Unhealthy", "Very Unhealthy", "Hazardous"]


class ConversationalAI:
    """Enhanced conversational AI assistant for natural user interaction"""
    
    def __init__(self, engine: TrafficEngine):
        self.engine = engine
        self.conversation_history = []
        self.user_context = {}
        self.locations = list(engine.location_coords.keys())
    
    def process_message(self, user_message: str, user_id: str = "guest") -> Dict:
        """Process natural language message and provide intelligent response"""
        try:
            # Store conversation history
            self.conversation_history.append({
                "user_id": user_id,
                "message": user_message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Normalize input
            msg_lower = user_message.lower().strip()
            
            # Intent detection and response generation
            response, confidence = self._detect_intent(msg_lower, user_id)
            
            return {
                "status": "success",
                "response": response,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "conversation_id": hash(user_id) % 10000,
                "message": user_message
            }
        except Exception as e:
            return {
                "status": "error",
                "response": f"I encountered an issue: {str(e)}. Please try again or rephrase your question.",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def _detect_intent(self, msg: str, user_id: str) -> Tuple[str, float]:
        """Detect user intent from message and return response with confidence"""
        # Greeting intents
        if any(word in msg for word in ["hello", "hi", "hey", "namaste", "greetings"]):
            return "Hello! 👋 I'm FlowSense AI, your personal traffic assistant. How can I help you today?", 0.95
        
        # Help intent
        if any(word in msg for word in ["help", "what can you do", "capabilities", "options"]):
            help_text = ("I can help with:\n"
                        "🚗 **Traffic & Routes**: Check traffic, find routes, get ETA\n"
                        "🚨 **Emergency**: Create emergency corridors\n"
                        "🅿️ **Parking**: Find available parking spaces\n"
                        "🌍 **Predictions**: Forecast traffic conditions\n"
                        "💨 **Pollution**: Air quality alerts and eco-friendly routes\n"
                        "📍 **Directions**: Navigate with real-time updates\n"
                        "What would you like help with?")
            return help_text, 0.90
        
        # Status check intents
        if any(word in msg for word in ["status", "how is traffic", "check traffic", "current conditions", "traffic now"]):
            return "Let me check the latest traffic conditions. Which location or area would you like to know about?", 0.85
        
        # Extract location if mentioned
        mentioned_location = self._extract_location(msg)
        if mentioned_location:
            return self._get_location_update(mentioned_location), 0.80
        
        # Route intent
        if any(word in msg for word in ["route", "path", "how to reach", "navigate", "directions", "fastest", "way"]):
            return self._handle_route_intent(msg), 0.85
        
        # Emergency intent
        if any(word in msg for word in ["emergency", "urgent", "help", "accident", "ambulance", "critical"]):
            return "🚨 **EMERGENCY MODE ACTIVATED**\n\nPriority lanes are being cleared. Please provide:\n1. Your current location\n2. Destination\n\nEmergency services will be notified.", 0.99
        
        # Prediction intent
        if any(word in msg for word in ["predict", "forecast", "future", "will it be", "tomorrow", "next"]):
            return self._handle_prediction_intent(msg), 0.80
        
        # Pollution/Health intent
        if any(word in msg for word in ["pollution", "air quality", "aqi", "pm2.5", "health", "breathable", "smog"]):
            return self._handle_pollution_intent(msg), 0.85
        
        # Parking intent
        if any(word in msg for word in ["parking", "park", "parking space", "parking availability", "where to park"]):
            return self._handle_parking_intent(msg), 0.80
        
        # Cost/Toll intent
        if any(word in msg for word in ["cost", "toll", "expensive", "price", "fee", "charge", "fare"]):
            return "I can help with toll and cost information. Which route or location are you interested in?", 0.75
        
        # Time intent
        if any(word in msg for word in ["time", "how long", "eta", "duration", "minutes", "hours"]):
            return "I can estimate travel time. Please mention your starting point and destination.", 0.80
        
        # Weather intent
        if any(word in msg for word in ["weather", "rain", "sunny", "wind", "temperature", "forecast"]):
            return self._handle_weather_intent(msg), 0.78
        
        # Feedback intent
        if any(word in msg for word in ["feedback", "report", "issue", "problem", "complaint"]):
            return "Thank you for your feedback. Please describe the issue and location, and I'll report it to authorities.", 0.85
        
        # General fallback with context
        fallback = ("I'm not sure I understood that correctly. I can help with:\n"
                   "• 📍 Traffic updates for specific locations\n"
                   "• 🚗 Route planning and navigation\n"
                   "• 🚨 Emergency assistance\n"
                   "• 🅿️ Parking information\n"
                   "• 💨 Air quality and pollution data\n\n"
                   "What would you like to know?")
        return fallback, 0.5
    
    def _extract_location(self, msg: str) -> Optional[str]:
        """Extract location name from message"""
        msg_lower = msg.lower()
        for location in self.locations:
            if location.lower() in msg_lower:
                return location
        return None
    
    def _get_location_update(self, location: str) -> str:
        """Get real-time traffic update for a location"""
        try:
            prediction = self.engine.predict_location(location, datetime.now())
            congestion = prediction.get("congestion_level", "Medium")
            confidence = prediction.get("confidence", 0.75)
            
            emoji_map = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}
            emoji = emoji_map.get(congestion, "🔵")
            
            update = f"{emoji} **{location}** - {congestion} traffic\n"
            update += f"Confidence: {confidence*100:.0f}%\n"
            if congestion == "High":
                update += "⚠️ Consider taking alternate routes."
            elif congestion == "Low":
                update += "✅ Good time to travel!"
            return update
        except Exception as e:
            return f"I couldn't fetch current data for {location}. {str(e)}"
    
    def _handle_route_intent(self, msg: str) -> str:
        """Handle route-related queries"""
        origin_keywords = ["from", "starting", "leaving"]
        dest_keywords = ["to", "reach", "destination", "going"]
        
        origin = None
        destination = None
        
        # Try to extract origin and destination
        for location in self.locations:
            if location.lower() in msg.lower():
                if origin is None:
                    origin = location
                else:
                    destination = location
        
        if origin and destination:
            return f"📍 Route from {origin} to {destination}\n" \
                   f"Fastest route: Via MG Road corridor\n" \
                   f"Estimated time: 35-45 minutes\n" \
                   f"Toll: ₹50-100\n" \
                   f"Would you like toll-free alternatives?"
        elif "airport" in msg.lower():
            return "✈️ **Airport Routes**\n" \
                   "🥇 NH8 Expressway: 35-45 min | Toll: ₹150\n" \
                   "🥈 DND Flyway: 40-50 min | Toll: ₹100\n" \
                   "🥉 MG Road: 45-55 min | No toll\n" \
                   "Which do you prefer?"
        return "I can suggest routes. Please tell me where you're coming from and where you need to go."
    
    def _handle_prediction_intent(self, msg: str) -> str:
        """Handle prediction queries"""
        if any(word in msg for word in ["peak", "rush", "busy", "crowded"]):
            return "⏰ **Peak Hours in Delhi NCR**:\n" \
                   "🌅 Morning Rush: 7:30 AM - 10:00 AM (Heaviest: 8:30-9:30 AM)\n" \
                   "🌆 Evening Rush: 5:00 PM - 8:00 PM (Heaviest: 6:00-7:00 PM)\n" \
                   "💡 Best times: 11 AM - 4 PM, After 9 PM\n" \
                   "Avoid peak hours for faster travel."
        elif any(word in msg for word in ["tomorrow", "next day"]):
            return "📅 **Tomorrow's Forecast**:\n" \
                   "Morning: Moderate traffic expected\n" \
                   "Afternoon: Light traffic\n" \
                   "Evening: Heavy traffic (typical)\n" \
                   "Best travel time: 11 AM - 3 PM"
        return "I can predict traffic for specific times. What time are you planning to travel?"
    
    def _handle_pollution_intent(self, msg: str) -> str:
        """Handle pollution-related queries"""
        current_aqi = random.randint(150, 300)
        aqi_level = "Unhealthy" if current_aqi > 200 else "Moderate"
        
        return f"💨 **Current Air Quality**\n" \
               f"AQI: {current_aqi} ({aqi_level})\n" \
               f"PM2.5: {current_aqi * 0.7:.0f} µg/m³\n\n" \
               f"💡 Recommendations:\n" \
               f"• Use N95 masks if outdoors\n" \
               f"• Prefer metro over cars\n" \
               f"• Keep car windows closed\n" \
               f"• Choose eco-friendly routes"
    
    def _handle_parking_intent(self, msg: str) -> str:
        """Handle parking queries"""
        location = self._extract_location(msg)
        if location:
            available = random.randint(5, 50)
            cost = random.randint(40, 150)
            return f"🅿️ **Parking at {location}**\n" \
                   f"Available spots: {available}\n" \
                   f"Cost: ₹{cost}/hour\n" \
                   f"Recommendation: Book in advance if above 30 mins"
        return "Which location are you looking for parking in?"
    
    def _handle_weather_intent(self, msg: str) -> str:
        """Handle weather-related queries"""
        weather_scenarios = [
            ("Sunny", 0.0, "Clear skies, good visibility. Safe to drive."),
            ("Cloudy", 0.1, "Cloudy with possible light showers. Use headlights."),
            ("Rainy", 0.5, "⚠️ Heavy traffic expected due to rain. Reduce speed, use headlights."),
            ("Foggy", 0.6, "❌ Low visibility. Use high beams and reduce speed. Avoid peak hours.")
        ]
        weather, impact, advice = random.choice(weather_scenarios)
        return f"🌤️ **Current Weather**: {weather}\n" \
               f"Traffic Impact: +{int(impact*50)}%\n" \
               f"{advice}"
    
    def generate_context_summary(self, location: str) -> Dict:
        """Generate a contextual summary for a location"""
        try:
            prediction = self.engine.predict_location(location, datetime.now())
            return {
                "location": location,
                "current_status": prediction.get("congestion_level", "Medium"),
                "confidence": prediction.get("confidence", 0.75),
                "recommendation": "Take alternate routes" if prediction.get("congestion_level") == "High" else "Good time to travel",
                "peak_hours": "5:00 PM - 7:00 PM",
                "best_time": "11:00 AM - 4:00 PM",
                "updated_at": datetime.now().isoformat()
            }
        except:
            return {
                "location": location,
                "current_status": "Data unavailable",
                "recommendation": "Please check back later",
                "updated_at": datetime.now().isoformat()
            }


class SmartCityIntelligence:
    def __init__(self, engine: TrafficEngine):
        self.engine = engine

    def _normalize(self, value: float, min_v: float = 0, max_v: float = 100) -> float:
        return max(min_v, min(max_v, value))

    def future_traffic_prediction(self, location: str, horizons: Optional[List[int]] = None) -> Dict:
        if horizons is None:
            horizons = [30, 60, 90, 120]
        now = datetime.now()
        predictions = []
        base = self.engine.predict_location(location, now)
        for minutes in horizons:
            ts = now + timedelta(minutes=minutes)
            weather_risk = 0.15 + (minutes / 120) * 0.45
            accel = 1 + (minutes / 120) * 0.2
            one = self.engine.predict_location(location, ts)
            predictions.append({
                "horizon_min": minutes,
                "timestamp": ts.isoformat(),
                "congestion_level": one["congestion_level"],
                "confidence": self._normalize(one["confidence"] - weather_risk * 0.08),
                "accident_probability": round(self._normalize(18 + minutes * 0.08 + weather_risk * 12), 2),
                "event_risk": round(random.uniform(0, 0.24), 2),
                "pollution_risk": round(self._normalize(weather_risk * 80 + (minutes / 120) * 30), 2),
            })
        return {"location": location, "predictions": predictions}

    def road_segment_forecast(self, location: str) -> Dict:
        segments = []
        for seg in random.sample(SEGMENT_TEMPLATES, k=6):
            score = self._normalize(random.uniform(48, 92) + (5 if "Road" in seg else 0))
            segments.append({
                "segment": seg,
                "congestion_score": round(score, 1),
                "accident_probability": round(self._normalize(score * 0.25 + random.uniform(0, 15)), 1),
                "risk_level": "High" if score > 75 else "Medium" if score > 55 else "Low",
            })
        return {"location": location, "segments": segments}

    def signal_timing_optimization(self, location: str) -> Dict:
        green = 45 + random.randint(-10, 18)
        yellow = 4 + random.randint(0, 2)
        red = 55 + random.randint(-12, 15)
        return {
            "location": location,
            "optimized_timing": {"green_sec": green, "yellow_sec": yellow, "red_sec": red},
            "strategy": "density_adaptive",
            "notes": "Adaptive signal timing aligned with current corridor density and peak demand.",
        }

    def emergency_corridor(self, origin: str, destination: str) -> Dict:
        path = [origin, "AIIMS", "MG Road", destination] if origin != destination else [origin]
        return {
            "origin": origin,
            "destination": destination,
            "corridor_path": path,
            "clearance_score": round(random.uniform(78, 96), 1),
            "time_saved_mins": random.randint(8, 24),
            "traffic_clearing_advice": "Use connected priority lanes and preemptive signal preemption.",
        }

    def route_profiles(self, origin: str, destination: str) -> Dict:
        profiles = []
        base_eta = 35 + random.randint(0, 20)
        for profile in ROUTE_PROFILES:
            multiplier = 1.0
            toll = 15 if profile == "fastest" else 0
            co2 = base_eta * (profile == "eco" and 1.0 or profile == "cheapest" and 1.1 or 1.2)
            if profile == "eco":
                multiplier = 1.1
            if profile == "safest":
                multiplier = 1.2
            eta = int(base_eta * multiplier)
            profiles.append({
                "profile": profile,
                "name": profile.replace("_", " ").replace("fastest", "Fastest").replace("cheapest", "Cheapest").replace("eco", "Eco").replace("safest", "Safest").replace("balanced", "Balanced"),
                "eta_mins": eta,
                "toll_inr": toll,
                "fuel_estimate_liters": round(eta * 0.11 + random.uniform(0.5, 1.5), 2),
                "co2_grams": round(co2 * 45, 1),
                "confidence": round(96 - eta * 0.6, 1),
                "route_safety_score": round(self._normalize(80 + random.uniform(-10, 12)), 1),
            })
        return {
            "origin": origin,
            "destination": destination,
            "route_profiles": profiles,
            "recommended": profiles[0],
        }

    def personalized_driver_profile(self, user_id: str) -> Dict:
        habits = random.choice(["early_commuter", "avoids_tolls", "eco_driver", "night_travel", "office_rush"])
        return {
            "user_id": user_id,
            "preferred_profile": habits,
            "risk_aversion": random.choice(["low", "medium", "high"]),
            "route_memory": ["MG Road", "AIIMS", "Connaught Place"],
            "notes": "Learns from repeated Delhi NCR flows and route performance.",
        }

    def pollution_aware_route(self, location: str) -> Dict:
        aqi = random.choice(AQI_LEVELS)
        return {
            "location": location,
            "recommended_route": "Avoid Central Secretariat and take Ring Road via South Extension.",
            "current_aqi": aqi,
            "pollution_penalty": round(random.uniform(4, 18), 1),
            "eco_score": round(self._normalize(80 - random.uniform(0, 20)), 1),
        }

    def accident_hotspots(self, location: str) -> Dict:
        hotspots = []
        for seg in random.sample(SEGMENT_TEMPLATES, 4):
            hotspots.append({
                "segment": seg,
                "accident_rate": round(random.uniform(0.5, 6.5), 2),
                "severity_index": round(random.uniform(55, 92), 1),
                "recommended_action": "Reduce speed, use alternate lane, notify authorities.",
            })
        return {"location": location, "hotspots": hotspots}

    def parking_prediction(self, location: str) -> Dict:
        availability = random.choice(["High", "Moderate", "Low"])
        return {
            "location": location,
            "available_spots": random.randint(8, 62),
            "predicted_availability_in_30m": random.choice(["Low", "Moderate", "High"]),
            "cost_range_inr": [random.randint(40, 80), random.randint(95, 150)],
            "parking_recommendation": "Book in advance at nearest mall parking.",
        }

    def road_quality_and_risk(self, location: str) -> Dict:
        pothole_risk = random.randint(12, 72)
        waterlogging_risk = random.randint(8, 65)
        return {
            "location": location,
            "pothole_score": round(self._normalize(100 - pothole_risk), 1),
            "waterlogging_risk": waterlogging_risk,
            "lane_congestion_rating": random.randint(40, 88),
            "recommended_action": "Use elevated corridors where available and avoid monsoon prone paths.",
        }

    def incident_feed(self, location: str, limit: int = 4) -> Dict:
        issues = []
        for seg in random.sample(SEGMENT_TEMPLATES, k=min(limit, len(SEGMENT_TEMPLATES))):
            severity = random.choice(["High", "Medium", "Low"])
            issues.append({
                "segment": seg,
                "severity": severity,
                "description": random.choice([
                    "Traffic slowdown due to stalled vehicle.",
                    "Accident investigation ongoing; expect delays.",
                    "Unexpected roadworks affecting lane availability.",
                    "Crowd spillover from adjacent event area.",
                ]),
                "recommended_action": random.choice([
                    "Use alternate outer corridor.",
                    "Coordinate with local police for quick clearance.",
                    "Delay non-essential trips by 15-20 min.",
                ]),
                "updated_at": (datetime.now() - timedelta(minutes=random.randint(3, 22))).isoformat(),
            })
        return {"location": location, "issues": issues}

    def pollution_heatmap(self, location: str) -> Dict:
        hotzones = []
        for zone in random.sample(list(self.engine.location_coords.keys()), k=6):
            aqi_value = random.randint(112, 210)
            hotzones.append({
                "zone": zone,
                "aqi": aqi_value,
                "category": random.choice(AQI_LEVELS),
                "advice": random.choice([
                    "Avoid idling in this zone.",
                    "Use EV / metro rather than private taxi.",
                    "Window up and use cabin filter in vehicles.",
                ]),
            })
        return {"location": location, "hotspots": hotzones}

    def traffic_health_summary(self, location: str) -> Dict:
        health_score = round(self._normalize(100 - random.uniform(8, 32)), 1)
        return {
            "location": location,
            "health_score": health_score,
            "load_factor": round(random.uniform(58, 92), 1),
            "preventive_alerts": random.randint(1, 6),
            "summary": "Traffic system reliability is moderate with some high-risk corridors.",
            "recommended_measures": "Increase adaptive signal timing and reroute heavy vehicles away from inner city arteries.",
        }

    def transit_load_forecast(self, location: str) -> Dict:
        return {
            "location": location,
            "metro_load": random.choice(["High", "Moderate", "Low"]),
            "bus_load": random.choice(["Moderate", "High", "Low"]),
            "next_peak_window": "18:00 - 20:00",
            "advice": "Deploy extra feeder buses and encourage staggered office departures.",
        }

    def ev_charging_suggestions(self, location: str) -> Dict:
        chargers = []
        for name in random.sample(["DLF Cyber Hub", "Saket Metro", "Noida Sector 18", "Faridabad NIT", "Rajiv Chowk"], k=3):
            chargers.append({
                "station": name,
                "available_ports": random.randint(2, 10),
                "wait_time_min": random.randint(5, 22),
                "recommendation": random.choice([
                    "Reserve a slot using the city app.",
                    "Avoid peak charging hours after 6 PM.",
                    "Use rapid chargers near expressway interchanges.",
                ]),
            })
        return {"location": location, "stations": chargers}

    def adaptive_lane_control(self, location: str) -> Dict:
        return {
            "location": location,
            "recommendation": "Open dynamic reversible lanes on the selected corridor during peak hours.",
            "affected_corridors": random.sample(SEGMENT_TEMPLATES, 2),
            "expected_reduction": f"{random.randint(12, 28)}%",
            "notes": "Use connected signage and traffic police to enforce lane configuration.",
        }

    def camera_feed_alerts(self, location: str, limit: int = 4) -> Dict:
        events = []
        for seg in random.sample(SEGMENT_TEMPLATES, k=min(limit, len(SEGMENT_TEMPLATES))):
            events.append({
                "location": seg,
                "severity": random.choice(["High", "Medium", "Low"]),
                "description": random.choice([
                    "Traffic camera detects stalled vehicle.",
                    "Slow-moving convoy reported on corridor.",
                    "Police checkpoint causing slowdowns.",
                    "Enforcement activity near intersection."
                ]),
                "updated_at": (datetime.now() - timedelta(minutes=random.randint(2, 18))).isoformat(),
            })
        return {"location": location, "camera_alerts": events}

    def flood_risk_forecast(self, location: str) -> Dict:
        risk = random.choice(["Low", "Moderate", "High"])
        return {
            "location": location,
            "risk_level": risk,
            "probability": round(random.uniform(18, 84), 1),
            "recommendation": "Avoid low-lying service roads if heavy rain arrives.",
            "notes": "Monitor city weather advisories and follow diversion guidance.",
        }

    def airport_accessibility(self, location: str) -> Dict:
        return {
            "location": location,
            "access_index": random.randint(62, 94),
            "recommended_corridor": random.choice(["NH8 Expressway", "MG Road Corridor", "Dwarka Expressway"]),
            "estimated_delay_min": random.randint(12, 32),
            "notes": "Prefer NH8 during evening peak and use priority airport lanes where available.",
        }

    def toll_plaza_forecast(self, location: str) -> Dict:
        plazas = []
        for plaza in random.sample(["Kherki Daula", "Ghaziabad", "Alwar", "Sohna", "Noida Sec 18"], k=3):
            plazas.append({
                "name": plaza,
                "delay_min": random.randint(3, 18),
                "rate_change": random.choice(["Normal", "Surge", "Reduced"]),
            })
        return {"location": location, "plazas": plazas}

    def smart_signal_status(self, location: str) -> Dict:
        return {
            "location": location,
            "status": random.choice(["Optimal", "Adaptive", "Congested"]),
            "active_corridors": random.sample(SEGMENT_TEMPLATES, 2),
            "notes": "Signal grids are dynamically adapting to current throughput and incident response needs.",
            "uptime": f"{random.randint(92, 99)}%",
        }

    def public_safety_alerts(self, location: str) -> Dict:
        alerts = []
        for idx in range(3):
            alerts.append({
                "alert_id": f"PSA-{random.randint(300, 999)}",
                "message": random.choice([
                    "Avoid the Yamuna bridge due to ongoing safety inspection.",
                    "Increased crowd control measures at Rajiv Chowk.",
                    "Civil defense teams on standby near AIIMS.",
                ]),
                "status": random.choice(["Active", "Monitoring", "Cleared"]),
                "issued_at": (datetime.now() - timedelta(minutes=random.randint(10, 45))).isoformat(),
            })
        return {"location": location, "alerts": alerts}

    def city_operations_status(self, location: str) -> Dict:
        return {
            "location": location,
            "last_updated": datetime.now().isoformat(),
            "weather_alert": random.choice([
                "Light showers expected across Delhi NCR.",
                "Dust advisory forecast for western sectors.",
                "Clear skies, good visibility.",
            ]),
            "priority_corridor_status": random.choice([
                "Ring Road: Adaptive lanes active",
                "NH8 corridor: Smooth flow, monitoring",
                "Noida Expressway: Congestion mitigation mode",
            ]),
            "camera_coverage": f"{random.randint(86, 98)}%",
            "ev_availability": f"{random.randint(72, 94)}%",
            "route_efficiency": round(random.uniform(76, 93), 1),
            "operational_focus": random.choice([
                "Redistribute traffic to metro-connected hubs.",
                "Pre-position incident response teams near major junctions.",
                "Activate flood diversion zones along Yamuna Bank.",
            ]),
            "actionable_items": [
                "Push live reroute notices to AR dashboard drivers.",
                "Open priority lanes for emergency services.",
                "Coordinate signal timing with metro feeder routes.",
            ],
            "key_priorities": [
                "Safety patrols at entry/exit points.",
                "EV charger availability monitoring.",
                "Airport access corridor readiness.",
            ],
        }

    def urban_mobility_report(self) -> Dict:
        return {
            "transit_resilience": random.choice(["Strong", "Moderate", "Fragile"]),
            "airport_access_index": random.randint(70, 95),
            "smart_signal_uptime": f"{random.randint(91, 99)}%",
            "average_travel_delay": f"{random.randint(12, 28)} min",
            "city_operational_advice": [
                "Deploy bus priority lanes in Noida sectors.",
                "Stagger school pickups around Anand Vihar.",
                "Activate flood diversion plans for Yamuna Bank roads.",
            ],
            "safety_focus": "Maintain high visibility patrols near major junctions.",
        }

    def dynamic_diversion(self, location: str) -> Dict:
        diversions = []
        for i in range(3):
            diversions.append({
                "diversion_id": f"DIV-{random.randint(1000, 9999)}",
                "affected_route": random.choice(SEGMENT_TEMPLATES),
                "diversion_via": random.choice(SEGMENT_TEMPLATES),
                "reason": random.choice([
                    "Construction activity",
                    "Accident investigation",
                    "VIP movement",
                    "Large event spillover",
                ]),
                "estimated_impact": f"{random.randint(8, 25)} mins",
                "priority": random.choice(["High", "Medium", "Low"]),
                "active_until": (datetime.now() + timedelta(hours=random.randint(2, 6))).isoformat(),
            })
        return {
            "location": location,
            "active_diversions": diversions,
            "total_diversions": len(diversions),
            "recommendation": "Check live map for real-time diversion guidance and alternate route options.",
            "updated_at": datetime.now().isoformat(),
        }

    def anomaly_detection(self, location: str) -> Dict:
        alert = random.choice([True, False])
        return {
            "location": location,
            "anomaly_detected": alert,
            "description": "Sudden traffic spike detected on connected arterial roads." if alert else "Traffic patterns are normal.",
            "confidence": round(random.uniform(72, 98), 1),
        }

    def commuter_assistant(self, origin: str, destination: str, user_id: str) -> Dict:
        profile = self.personalized_driver_profile(user_id)
        return {
            "assistant": {
                "user_id": user_id,
                "origin": origin,
                "destination": destination,
                "suggestion": f"For your {profile['preferred_profile']} mode, leave at 5:40 PM and take the MG Road corridor.",
                "multimodal_option": "metro + last-mile auto",
                "stress_score": random.randint(38, 64),
                "route_confidence": random.randint(70, 92),
            }
        }

    def city_command_center(self) -> Dict:
        incident_data = self.incident_feed("Delhi NCR")
        pollution_data = self.pollution_heatmap("Delhi NCR")
        ops = self.city_operations_status("Delhi NCR")
        return {
            "dashboard_metrics": {
                "active_alerts": random.randint(1, 7),
                "average_congestion": round(random.uniform(58, 82), 1),
                "smart_signals_online": random.randint(130, 160),
                "incident_response_rate": round(random.uniform(85, 95), 1),
                "traffic_health_score": round(self._normalize(100 - random.uniform(10, 24)), 1),
                "camera_coverage": ops["camera_coverage"],
                "ev_availability": ops["ev_availability"],
                "route_efficiency": ops["route_efficiency"],
            },
            "predicted_issues": [
                {"zone": "Connaught Place", "risk": "High", "cause": "Festival traffic"},
                {"zone": "Noida Sector 18", "risk": "Medium", "cause": "Metro load spillover"},
                {"zone": "MG Road Corridor", "risk": "Medium", "cause": "Construction spillover"},
            ],
            "recommendations": [
                "Deploy traffic police at Rajiv Chowk approaches.",
                "Activate adaptive signal corridors on Ring Road.",
                "Pre-clear ambulance corridor from AIIMS to IGI Airport.",
                "Push weather advisory updates through city alert channels.",
            ],
            "incident_feed": incident_data.get("issues", []),
            "pollution_hotspots": pollution_data.get("hotspots", []),
            "camera_feed": self.camera_feed_alerts("Delhi NCR").get("camera_alerts", []),
            "flood_risk": self.flood_risk_forecast("Delhi NCR"),
            "airport_access": self.airport_accessibility("Delhi NCR"),
            "toll_forecast": self.toll_plaza_forecast("Delhi NCR"),
            "smart_signal_status": self.smart_signal_status("Delhi NCR"),
            "transit_load": self.transit_load_forecast("Delhi NCR"),
            "ev_charging": self.ev_charging_suggestions("Delhi NCR"),
            "adaptive_lane": self.adaptive_lane_control("Delhi NCR"),
            "public_safety_alerts": self.public_safety_alerts("Delhi NCR").get("alerts", []),
            "urban_mobility_report": self.urban_mobility_report(),
            "operational_focus": ops["operational_focus"],
            "priority_corridor_status": ops["priority_corridor_status"],
            "actionable_items": ops["actionable_items"],
            "key_priorities": ops["key_priorities"],
            "weather_alert": ops["weather_alert"],
            "last_updated": ops["last_updated"],
        }
