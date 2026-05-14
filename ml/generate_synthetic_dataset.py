import json
import math
import os
import random
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

DELHI_NCR_LOCATIONS = {
    "Connaught Place": (28.6328, 77.2197),
    "Rajiv Chowk": (28.6314, 77.2167),
    "AIIMS": (28.5672, 77.2100),
    "Nehru Place": (28.5533, 77.2594),
    "Lajpat Nagar": (28.5672, 77.2522),
    "Saket": (28.5245, 77.2137),
    "Hauz Khas": (28.5497, 77.1995),
    "South Extension": (28.5568, 77.2188),
    "Jangpura": (28.5840, 77.2366),
    "Khan Market": (28.6213, 77.2213),
    "Karol Bagh": (28.6513, 77.1890),
    "Rajouri Garden": (28.6509, 77.1091),
    "Punjabi Bagh": (28.6889, 77.1311),
    "Janakpuri": (28.6135, 77.0563),
    "Dwarka Mor": (28.6034, 77.0628),
    "Shalimar Bagh": (28.6968, 77.1705),
    "Pitampura": (28.7134, 77.1485),
    "Rohini": (28.7300, 77.1055),
    "Inderlok": (28.6765, 77.1696),
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

WEATHER_STATES = ["Clear", "Cloudy", "Rain", "Heavy Rain", "Fog"]
EVENT_TYPES = [None, "festival", "concert", "protest", "sports", "metro_spillover", "holiday", "vip_movement"]

SEASONS = {
    "winter": [12, 1, 2],
    "spring": [3, 4, 5],
    "monsoon": [6, 7, 8, 9],
    "autumn": [10, 11],
}

LABEL_BANDS = [
    (0, 45, "Low"),
    (46, 65, "Medium"),
    (66, 80, "High"),
    (81, 100, "Very High"),
]

SEGMENT_TEMPLATES = [
    "Outer Ring Road", "NH8 Expressway", "MG Road Corridor", "AIIMS Link Road",
    "Noida-Greater Noida Expressway", "DND Flyway", "GT Road", "Ring Road South",
    "Pitam Pura Road", "Janakpuri Road", "Kashmere Gate Stretch", "Kalkaji Road",
    "NH24 Corridor", "Yamuna Marg", "Indirapuram Link Road", "Huda City Centre Approach",
]


def seasonal_weather(month: int) -> str:
    if month in SEASONS["monsoon"]:
        return random.choices(["Heavy Rain", "Rain", "Cloudy", "Clear"], weights=[25, 35, 20, 20])[0]
    if month in SEASONS["winter"]:
        return random.choices(["Fog", "Cloudy", "Clear"], weights=[30, 35, 35])[0]
    return random.choices(["Clear", "Cloudy", "Rain"], weights=[50, 30, 20])[0]


def event_for_timestamp(ts: datetime, location: str) -> Tuple[int, str]:
    event = None
    flag = 0
    if ts.weekday() in [4, 5] and random.random() < 0.08:
        event = random.choice(["festival", "sports", "concert"])
        flag = 1
    if location in ["Connaught Place", "Rajiv Chowk", "AIIMS"] and random.random() < 0.03:
        event = random.choice(["protest", "vip_movement"])
        flag = 1
    if ts.month == 10 and random.random() < 0.025:
        event = "festival"
        flag = 1
    return flag, event


def assign_congestion_level(score: float) -> str:
    for low, high, label in LABEL_BANDS:
        if low <= score <= high:
            return label
    return "Very High"


def build_profile(location: str, ts: datetime) -> dict:
    hour = ts.hour
    dow = ts.weekday()
    is_weekend = 1 if dow >= 5 else 0
    is_peak = 1 if hour in [7, 8, 9, 17, 18, 19, 20] else 0
    weather = seasonal_weather(ts.month)
    weather_risk = {"Clear": 0.0, "Cloudy": 0.1, "Rain": 0.45, "Heavy Rain": 0.75, "Fog": 0.5}[weather]
    accident = 1 if random.random() < 0.012 else 0
    metro_spill = 1 if location in ["Rajiv Chowk", "Connaught Place", "Noida Sector 18", "Gurugram Cyber Hub"] and random.random() < 0.14 else 0
    protest = 1 if random.random() < 0.01 else 0
    vip = 1 if random.random() < 0.008 else 0
    holiday = 1 if ts.month == 1 and ts.day in [1, 26] else 1 if ts.month == 8 and ts.day == 15 else 0
    event_flag, event_type = event_for_timestamp(ts, location)
    segment_name = random.choice(SEGMENT_TEMPLATES)
    base = 400 + (100 if location in ["Connaught Place", "Rajiv Chowk", "AIIMS", "Gurugram Cyber Hub", "Noida Sector 18"] else 0)
    periodicity = math.sin((hour + 2) / 24 * 2 * math.pi) * 90
    traffic_volume = int(max(120, base + periodicity + is_peak * 180 + event_flag * 120 + metro_spill * 80 + accident * 110 + vip * 50 + random.gauss(0, 35)))
    speed = int(max(12, 44 - (traffic_volume / 35) - weather_risk * 8 - event_flag * 4 - protest * 6 + random.gauss(0, 3)))
    congestion_score = min(100, max(0, traffic_volume / 7 + weather_risk * 28 + event_flag * 15 + accident * 12 + metro_spill * 10 + protest * 14 + vip * 9 - speed * 0.8 + is_peak * 8))
    congestion_level = assign_congestion_level(congestion_score)

    return {
        "Timestamp": ts,
        "Location": location,
        "Latitude": DELHI_NCR_LOCATIONS[location][0],
        "Longitude": DELHI_NCR_LOCATIONS[location][1],
        "Road Segment": segment_name,
        "Segment ID": f"SEG-{abs(hash(segment_name)) % 10000}",
        "hour": hour,
        "dow": dow,
        "is_weekend": is_weekend,
        "is_peak": is_peak,
        "sin_hour": math.sin(2 * math.pi * hour / 24),
        "cos_hour": math.cos(2 * math.pi * hour / 24),
        "Traffic Volume": traffic_volume,
        "Avg Speed (km/h)": speed,
        "accident_flag": accident,
        "event_flag": event_flag,
        "weather_risk": weather_risk,
        "weather_type": weather,
        "event_type": event_type or "none",
        "metro_spillover": metro_spill,
        "protest_flag": protest,
        "vip_movement": vip,
        "holiday_flag": holiday,
        "target": congestion_level,
    }


def generate_dataset(days: int = 30, frequency_minutes: int = 30):
    start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=days)
    end_date = start_date + timedelta(days=days)
    timestamps = []
    ts = start_date
    while ts < end_date:
        timestamps.append(ts)
        ts += timedelta(minutes=frequency_minutes)

    rows = []
    for location in DELHI_NCR_LOCATIONS:
        print(f"Generating data for {location}")
        previous_volume = None
        previous_speed = None
        for ts in timestamps:
            row = build_profile(location, ts)
            if previous_volume is not None:
                row["Traffic Volume_lag1"] = previous_volume
                row["Avg Speed (km/h)_lag1"] = previous_speed
            else:
                row["Traffic Volume_lag1"] = row["Traffic Volume"]
                row["Avg Speed (km/h)_lag1"] = row["Avg Speed (km/h)"]
            rows.append(row)
            previous_volume = row["Traffic Volume"]
            previous_speed = row["Avg Speed (km/h)"]

    df = pd.DataFrame(rows)
    df["Traffic Volume_roll3"] = df.groupby("Location")["Traffic Volume"].transform(lambda x: x.rolling(window=3, min_periods=1).mean().round())
    df["Avg Speed (km/h)_roll3"] = df.groupby("Location")["Avg Speed (km/h)"].transform(lambda x: x.rolling(window=3, min_periods=1).mean().round())
    df["target_label"] = df["target"].astype(str)

    output_pickle = os.path.join(OUTPUT_DIR, "delhi_ncr_synthetic.pkl")
    output_csv = os.path.join(OUTPUT_DIR, "delhi_ncr_synthetic.csv")
    df.to_pickle(output_pickle)
    df.to_csv(output_csv, index=False)

    with open(os.path.join(OUTPUT_DIR, "delhi_ncr_locations.json"), "w", encoding="utf-8") as f:
        json.dump({"locations": list(DELHI_NCR_LOCATIONS.keys())}, f, indent=2)

    print(f"Synthetic dataset generated: {output_pickle}")
    print(f"Synthetic dataset generated: {output_csv}")
    print(f"Locations list saved.")


if __name__ == "__main__":
    generate_dataset(days=21, frequency_minutes=30)
