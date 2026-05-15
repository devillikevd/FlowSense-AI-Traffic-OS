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

# Hindi/Hinglish keyword mappings for traffic domain
HINGLISH_KEYWORDS = {
    # Greetings
    "namaste": "greeting", "shukriya": "greeting", "dhanyavaad": "greeting",
    
    # Route/Direction queries
    "route": "route", "raasta": "route", "path": "route", "rasta": "route",
    "se": "from", "tak": "to", "ko": "to", "jaana": "to",
    "kaise jaun": "route", "kaise pauhu": "route",
    
    # Traffic
    "traffic": "traffic", "trap": "traffic", "congestion": "congestion", "bheed": "congestion",
    "jam": "traffic", "jammed": "traffic", "slow": "slow", "fast": "fast",
    
    # Parking
    "parking": "parking", "gaadi": "parking", "gari": "parking", "ghar": "parking",
    "jagh": "place", "jagah": "place", "khaana": "place", "khaane": "food", "khane": "food",
    
    # Time
    "time": "time", "samay": "time", "jaldi": "fast", "der": "delay",
    
    # Location indicators
    "pass": "near", "paas": "near", "ke": "", "mein": "in", "main": "in",
    "pe": "at", "par": "at", "side": "side", "ओर": "side",
    
    # Metro/Transport
    "metro": "metro", "sunder": "metro", "bus": "bus", "auto": "auto",
    "car": "car", "bike": "bike", "taxi": "taxi",
}

# Hindi location name mappings
HINDI_LOCATION_MAP = {
    "cp": "Connaught Place",
    "chandni": "Rajiv Chowk",
    "aiims": "AIIMS",
    "nehru": "Nehru Place",
    "lajpat": "Lajpat Nagar",
    "saket": "Saket",
    "khas": "Hauz Khas",
    "khan": "Khan Market",
    "karol": "Karol Bagh",
    "rajouri": "Rajouri Garden",
    "punjabi": "Punjabi Bagh",
    "janakpuri": "Janakpuri",
    "dwarka": "Dwarka Mor",
    "rohini": "Rohini",
    "noida": "Noida City Centre",
    "gurgaon": "Gurugram Cyber Hub",
    "airport": "IGI Airport",
    "igi": "IGI Airport",
}

# Conversational responses and messages (English & Hindi)
GREETING_MESSAGES = {
    "hello": "Hello! I'm FlowSense AI. How can I help you with traffic today?",
    "hi": "Hi there! 👋 I can help with traffic predictions, route optimization, and real-time traffic updates.",
    "help": "I can assist with: Traffic predictions, Route suggestions, Incident alerts, Parking info, Emergency routes, and more!",
    "status": "Let me check the current traffic status for you. Which location are you interested in?",
    "namaste": "नमस्ते! 👋 मैं FlowSense AI हूं। मैं आपको ट्रैफिक के बारे में मदद कर सकता हूं।",
}

RESPONSE_TEMPLATES = {
    "traffic_high": "Traffic is heavy at {location} right now. I recommend taking {alternate_route} or delaying your trip by {delay_min} minutes.",
    "traffic_low": "Great news! Traffic is light at {location}. This is a perfect time to travel!",
    "route_suggestion": "Based on current conditions, I suggest the {profile} route via {route}. Estimated time: {eta} minutes.",
    "emergency_help": "Emergency route activated! Clearing priority lanes from {origin} to {destination}.",
    "no_data": "I don't have specific data for that location yet, but I can provide predictions based on historical patterns.",
    "hindi_route": "{origin} se {destination} jane ke liye: {route_info}. Samay: {eta} minutes.",
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
    """Enhanced conversational AI assistant for natural user interaction with Hindi/Hinglish support"""
    
    def __init__(self, engine: TrafficEngine):
        self.engine = engine
        self.conversation_history = []
        self.user_context = {}
        self.locations = list(engine.location_coords.keys())
        self.use_hindi = False
    
    def process_message(self, user_message: str, user_id: str = "guest") -> Dict:
        """Process natural language message and provide intelligent response"""
        try:
            # Store conversation history
            self.conversation_history.append({
                "user_id": user_id,
                "message": user_message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Detect language (English or Hindi/Hinglish)
            is_hindi = self._detect_language(user_message)
            self.use_hindi = is_hindi
            
            # Normalize input
            msg_lower = user_message.lower().strip()
            
            # Intent detection and response generation
            response, confidence = self._detect_intent(msg_lower, user_id, is_hindi)
            
            return {
                "status": "success",
                "response": response,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "conversation_id": hash(user_id) % 10000,
                "message": user_message,
                "language": "hindi" if is_hindi else "english"
            }
        except Exception as e:
            return {
                "status": "error",
                "response": f"I encountered an issue: {str(e)}. Please try again or rephrase your question.",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def _detect_language(self, text: str) -> bool:
        """Detect if text is in Hindi/Hinglish"""
        # Hindi/Devanagari unicode range
        devanagari_chars = set('अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षत्रज्ञ')
        
        # Check for Devanagari characters
        if any(char in devanagari_chars for char in text):
            return True
        
        # Check for common Hinglish keywords
        hinglish_indicators = ["mein", "ke", "se", "tak", "kaise", "kya", "aur", "jo", "na", "h", "hai", "nahi"]
        text_words = text.lower().split()
        hindi_word_count = sum(1 for word in text_words if word in hinglish_indicators)
        
        return hindi_word_count > 1
    
    def _extract_hindi_locations(self, msg: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract origin and destination from Hindi/Hinglish message"""
        msg_lower = msg.lower()
        origin = None
        destination = None
        
        # Check Hindi location mappings
        for hindi_name, english_name in HINDI_LOCATION_MAP.items():
            if hindi_name in msg_lower:
                if origin is None:
                    origin = english_name
                else:
                    destination = english_name
        
        # Also check full location names
        for location in self.locations:
            if location.lower() in msg_lower:
                if origin is None:
                    origin = location
                else:
                    destination = location
        
        return origin, destination
    
    def _detect_intent(self, msg: str, user_id: str, is_hindi: bool = False) -> Tuple[str, float]:
        """Detect user intent from message and return response with confidence"""
        msg_lower = msg.lower()
        
        # Try to detect route queries first (both English and Hinglish)
        if any(word in msg_lower for word in ["route", "raasta", "rasta", "path", "se", "tak", "ke liye"]):
            origin, destination = self._extract_hindi_locations(msg)
            if origin and destination:
                return self._handle_hindi_route(origin, destination, is_hindi), 0.90
            elif origin or destination:
                return f"I can help with that! {'Bilkul!' if is_hindi else ''} Which location are you traveling to/from?", 0.75
        
        # Parking queries
        if any(word in msg_lower for word in ["parking", "jagh", "jagah", "khaana", "khaane", "khane", "gaadi", "gari"]):
            origin, _ = self._extract_hindi_locations(msg)
            if origin:
                return self._handle_hindi_parking(origin, is_hindi), 0.85
            return "Parking ke liye kaun si jagah mein check karna hai?" if is_hindi else "Which location are you looking for parking in?", 0.75
        
        # Traffic status queries
        if any(word in msg_lower for word in ["traffic", "trap", "jam", "congestion", "bheed", "kaise hai"]):
            origin, _ = self._extract_hindi_locations(msg)
            if origin:
                return self._get_location_update(origin), 0.85
            return "Kaun si jagah ke liye traffic check karna hai?" if is_hindi else "Which location would you like to check traffic for?", 0.75
        
        # Greeting intents
        if any(word in msg_lower for word in ["hello", "hi", "hey", "namaste", "greetings", "shukriya"]):
            return "नमस्ते! 👋 मैं FlowSense AI हूं। आपको ट्रैफिक में कैसे मदद कर सकता हूं?" if is_hindi else "Hello! 👋 I'm FlowSense AI. How can I help with traffic?", 0.95
        
        # Help intent
        if any(word in msg_lower for word in ["help", "kya", "kaise", "batao", "bataye"]):
            if is_hindi:
                help_text = ("मैं यह सब कर सकता हूं:\n"
                           "🚗 **ट्रैफिक & रूट**: ट्रैफिक चेक करना, रूट सुझाना\n"
                           "🅿️ **पार्किंग**: पार्किंग जानकारी\n"
                           "🚨 **इमरजेंसी**: इमरजेंसी रूट बनाना\n"
                           "💨 **वायु गुणवत्ता**: प्रदूषण अलर्ट\n\n"
                           "मैं आपको कैसे मदद कर सकता हूं?")
            else:
                help_text = ("I can help with:\n"
                           "🚗 **Traffic & Routes**: Check traffic, find routes, get ETA\n"
                           "🚨 **Emergency**: Create emergency corridors\n"
                           "🅿️ **Parking**: Find available parking spaces\n"
                           "🌍 **Predictions**: Forecast traffic conditions\n"
                           "💨 **Pollution**: Air quality alerts\n"
                           "What would you like help with?")
            return help_text, 0.90
        
        # Default fallback
        fallback = ("Delhi-NCR के ट्रैफिक के बारे में पूछिए! 🚗 जैसे: \"CP से Airport कैसे जाऊं\", \"Saket to Rohini\", \"Parking कहां है\", आदि।" 
                   if is_hindi 
                   else "I can help with traffic in Delhi-NCR. Ask about routes, parking, traffic updates, and more!")
        return fallback, 0.50
    
    def _handle_hindi_route(self, origin: str, destination: str, is_hindi: bool) -> str:
        """Handle route queries in Hindi/Hinglish"""
        # Get route suggestions from engine
        try:
            suggestions = self.engine.route_suggestions(origin, destination)
            
            if is_hindi:
                response = f"{origin} se {destination} jane ke liye:\n\n"
                response += f"🥇 **Fastest Route**: {suggestions.get('fastest_route', 'MG Road')}\n"
                response += f"   Samay: {random.randint(30, 50)} minutes\n"
                response += f"   Toll: ₹{random.randint(50, 150)}\n\n"
                response += f"🥈 **Sasta Route**: {suggestions.get('cheapest_route', 'Ring Road')}\n"
                response += f"   Samay: {random.randint(40, 60)} minutes\n"
                response += f"   Toll: ₹{random.randint(0, 50)}\n\n"
                response += f"💚 **Eco Route**: Metro + Local\n"
                response += f"   Samay: {random.randint(45, 75)} minutes\n"
                response += f"   Healthy aur Budget-friendly!\n\n"
                response += "Kaun sa route pasand hai?"
            else:
                response = f"From {origin} to {destination}:\n\n"
                response += f"🥇 Fastest: {suggestions.get('fastest_route', 'MG Road')} ({random.randint(30, 50)} min)\n"
                response += f"🥈 Cheapest: {suggestions.get('cheapest_route', 'Ring Road')} ({random.randint(40, 60)} min)\n"
                response += f"💚 Eco: Metro + Local ({random.randint(45, 75)} min)\n\n"
                response += "Which route would you prefer?"
            
            return response
        except:
            if is_hindi:
                return f"{origin} se {destination} jane ke liye multiple routes available hain. Metro best option hai current traffic mein!"
            else:
                return f"Multiple routes available from {origin} to {destination}. Metro is a good option right now!"
    
    def _handle_hindi_parking(self, location: str, is_hindi: bool) -> str:
        """Handle parking queries in Hindi"""
        available = random.randint(5, 50)
        cost = random.randint(40, 150)
        
        if is_hindi:
            return (f"🅿️ **{location} mein Parking**\n\n"
                   f"उपलब्ध स्पॉट: {available}\n"
                   f"कीमत: ₹{cost}/hour\n"
                   f"समय: Peak hours (6-9 PM) mein book kar lo!\n"
                   f"Recommendation: Advance mein book karna better hai")
        else:
            return (f"🅿️ **Parking at {location}**\n\n"
                   f"Available spots: {available}\n"
                   f"Cost: ₹{cost}/hour\n"
                   f"Tip: Book in advance during peak hours")
    
    def _extract_location(self, msg: str) -> Optional[str]:
        """Extract location name from message"""
        msg_lower = msg.lower()
        
        # First try Hindi mappings
        for hindi_name, english_name in HINDI_LOCATION_MAP.items():
            if hindi_name in msg_lower:
                return english_name
        
        # Then try full location names
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
            
            if self.use_hindi:
                congestion_hindi = {"High": "बहुत भारी", "Medium": "सामान्य", "Low": "हल्का"}
                update = f"{emoji} **{location}** - {congestion_hindi.get(congestion, 'Unknown')} ट्रैफिक\n"
                update += f"विश्वास: {confidence*100:.0f}%\n"
                if congestion == "High":
                    update += "⚠️ अलग रूट लेने की सलाह दी जाती है।"
                elif congestion == "Low":
                    update += "✅ यात्रा करने का अच्छा समय है!"
            else:
                update = f"{emoji} **{location}** - {congestion} traffic\n"
                update += f"Confidence: {confidence*100:.0f}%\n"
                if congestion == "High":
                    update += "⚠️ Consider taking alternate routes."
                elif congestion == "Low":
                    update += "✅ Good time to travel!"
            
            return update
        except Exception as e:
            return error_msg
    
    def generate_context_summary(self, location: str) -> Dict:
        """Generate a contextual summary for a location"""
        try:
            prediction = self.engine.predict_location(location, datetime.now())
            hindi_status = {"High": "बहुत भारी", "Medium": "सामान्य", "Low": "हल्का"}
            congestion = prediction.get("congestion_level", "Medium")
            
            return {
                "location": location,
                "current_status": hindi_status.get(congestion, "Unknown") if self.use_hindi else congestion,
                "confidence": prediction.get("confidence", 0.75),
                "recommendation": ("अलग रूट लेने की सलाह दी जाती है।" if self.use_hindi else "Take alternate routes") if congestion == "High" else ("यात्रा करने का अच्छा समय है!" if self.use_hindi else "Good time to travel"),
                "peak_hours": "5:00 PM - 7:00 PM",
                "best_time": "11:00 AM - 4:00 PM",
                "updated_at": datetime.now().isoformat()
            }
        except:
            return {
                "location": location,
                "current_status": "Data unavailable" if not self.use_hindi else "डेटा उपलब्ध नहीं",
                "recommendation": "Please check back later" if not self.use_hindi else "बाद में कोशिश करें",
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
