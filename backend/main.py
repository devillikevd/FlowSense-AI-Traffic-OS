# backend/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime
import asyncio

from backend.predictive_engine import TrafficEngine
from backend.ai_capabilities import SmartCityIntelligence

app = FastAPI(title="FlowSense - AI Traffic OS")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Initializing FlowSense predictive engine...")
engine = TrafficEngine()
smart = SmartCityIntelligence(engine)

LABELS = ["High", "Low", "Medium", "Very High"]

LOCATIONS = list(engine.location_coords.keys())


def normalize_location(location: str) -> str:
    return location if location in LOCATIONS else "Connaught Place"


@app.get("/api/predict/{location}")
def predict(location: str, hour: int = 17, dow: int = 1):
    location = normalize_location(location)
    now = datetime.now().replace(hour=hour, minute=0, second=0, microsecond=0)
    prediction = engine.predict_location(location, now)
    return {
        "location": location,
        "hour": hour,
        "dow": dow,
        "congestion_level": prediction["congestion_level"],
        "confidence": prediction["confidence"],
        "top_factors": [],
    }


@app.get("/api/all_predictions")
def all_predictions(hour: int = 17, dow: int = 1):
    now = datetime.now().replace(hour=hour, minute=0, second=0, microsecond=0)
    return {loc: engine.predict_location(loc, now) for loc in LOCATIONS}


@app.get("/api/forecast/{location}")
def forecast(location: str):
    location = normalize_location(location)
    return engine.forecast_location(location)


@app.get("/api/route_optimize")
def route_optimize(origin: str = "Connaught Place", destination: str = "IGI Airport"):
    return engine.route_suggestions(origin, destination)


@app.get("/api/dynamic_reroute")
def dynamic_reroute(origin: str = "Connaught Place", destination: str = "IGI Airport"):
    return engine.dynamic_reroute(origin, destination)


@app.get("/api/traffic_heatmap")
def traffic_heatmap():
    return engine.heatmap_data()


@app.get("/api/departure_advice/{location}")
def departure_advice(location: str):
    location = normalize_location(location)
    return engine.best_departure_advice(location)


@app.get("/api/geolocate")
def geolocate(lat: float, lng: float):
    return engine.geolocate(lat, lng)


@app.get("/api/future_traffic/{location}")
def future_traffic(location: str):
    location = normalize_location(location)
    return smart.future_traffic_prediction(location)


@app.get("/api/segment_forecast/{location}")
def segment_forecast(location: str):
    location = normalize_location(location)
    return smart.road_segment_forecast(location)


@app.get("/api/signal_timing/{location}")
def signal_timing(location: str):
    location = normalize_location(location)
    return smart.signal_timing_optimization(location)


@app.get("/api/emergency_corridor")
def emergency_corridor(origin: str = "Connaught Place", destination: str = "IGI Airport"):
    return smart.emergency_corridor(origin, destination)


@app.get("/api/route_profiles")
def route_profiles(origin: str = "Connaught Place", destination: str = "IGI Airport"):
    return smart.route_profiles(origin, destination)


@app.get("/api/pollution_route/{location}")
def pollution_route(location: str):
    location = normalize_location(location)
    return smart.pollution_aware_route(location)


@app.get("/api/accident_hotspots/{location}")
def accident_hotspots(location: str):
    location = normalize_location(location)
    return smart.accident_hotspots(location)


@app.get("/api/parking/{location}")
def parking(location: str):
    location = normalize_location(location)
    return smart.parking_prediction(location)


@app.get("/api/road_quality/{location}")
def road_quality(location: str):
    location = normalize_location(location)
    return smart.road_quality_and_risk(location)


@app.get("/api/diversion/{location}")
def diversion(location: str):
    location = normalize_location(location)
    return smart.dynamic_diversion(location)


@app.get("/api/anomaly/{location}")
def anomaly(location: str):
    location = normalize_location(location)
    return smart.anomaly_detection(location)


@app.get("/api/assistant")
def assistant(origin: str = "Connaught Place", destination: str = "IGI Airport", user_id: str = "guest"):
    return smart.commuter_assistant(origin, destination, user_id)


@app.get("/api/live_summary")
def live_summary():
    return engine.live_zone_summary()


@app.get("/api/incident_feed/{location}")
def incident_feed(location: str):
    location = normalize_location(location)
    return smart.incident_feed(location)


@app.get("/api/pollution_heatmap/{location}")
def pollution_heatmap(location: str):
    location = normalize_location(location)
    return smart.pollution_heatmap(location)


@app.get("/api/traffic_health/{location}")
def traffic_health(location: str):
    location = normalize_location(location)
    return smart.traffic_health_summary(location)


@app.get("/api/transit_load/{location}")
def transit_load(location: str = "Delhi NCR"):
    return smart.transit_load_forecast(location)


@app.get("/api/ev_charging/{location}")
def ev_charging(location: str = "Delhi NCR"):
    return smart.ev_charging_suggestions(location)


@app.get("/api/adaptive_lane/{location}")
def adaptive_lane(location: str):
    location = normalize_location(location)
    return smart.adaptive_lane_control(location)


@app.get("/api/camera_alerts/{location}")
def camera_alerts(location: str):
    location = normalize_location(location)
    return smart.camera_feed_alerts(location)


@app.get("/api/flood_risk/{location}")
def flood_risk(location: str):
    location = normalize_location(location)
    return smart.flood_risk_forecast(location)


@app.get("/api/airport_access/{location}")
def airport_access(location: str):
    location = normalize_location(location)
    return smart.airport_accessibility(location)


@app.get("/api/toll_forecast/{location}")
def toll_forecast(location: str):
    location = normalize_location(location)
    return smart.toll_plaza_forecast(location)


@app.get("/api/smart_signal_status/{location}")
def smart_signal_status(location: str):
    location = normalize_location(location)
    return smart.smart_signal_status(location)


@app.get("/api/urban_mobility_report")
def urban_mobility_report():
    return smart.urban_mobility_report()


@app.get("/api/public_safety/{location}")
def public_safety(location: str = "Delhi NCR"):
    if location != "Delhi NCR":
        location = normalize_location(location)
    return smart.public_safety_alerts(location)


@app.get("/api/command_center")
def command_center():
    return smart.city_command_center()


@app.get("/api/routes")
def route_compare():
    return route_optimize()


# Smart Chatbot (No API Key)
@app.get("/api/chat")
def chat(q: str, origin: str = "Connaught Place", destination: str = "IGI Airport", user_id: str = "guest"):
    q_lower = q.lower()
    assistant_data = smart.commuter_assistant(origin, destination, user_id)["assistant"]
    if any(x in q_lower for x in ["igi", "airport"]):
        return {
            "answer": "IGI Airport pe subah 7-10 AM aur shaam 5-9 PM bahut heavy traffic rehta hai. Best time: 11 AM - 3 PM.",
            "assistant": assistant_data,
        }
    if any(x in q_lower for x in ["connaught", "cp"]):
        return {
            "answer": "Connaught Place almost hamesha High congestion mein rehta hai. Evening 6-10 PM avoid karo.",
            "assistant": assistant_data,
        }
    if "rain" in q_lower or "barish" in q_lower:
        return {
            "answer": "Barish mein Delhi-NCR traffic Very High ho jata hai. Major delays expected.",
            "assistant": assistant_data,
        }
    if "best time" in q_lower:
        return {
            "answer": "Delhi-NCR mein sabse best travel time 10 AM - 4 PM hai.",
            "assistant": assistant_data,
        }
    return {
        "answer": f"{assistant_data['suggestion']} Route confidence {assistant_data['route_confidence']}% and stress score {assistant_data['stress_score']}.",
        "assistant": assistant_data,
    }


@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    await websocket.accept()
    print("✅ New client connected.")
    try:
        while True:
            live_data = engine.live_zone_summary()
            await websocket.send_json(live_data)
            await asyncio.sleep(10)
    except Exception:
        print("Client disconnected.")


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/")
def root():
    return {"message": "FlowSense API Running 🚀"}