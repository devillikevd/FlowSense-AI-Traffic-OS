# ml/preprocess.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os
import json

# Create data folder if not exists
os.makedirs("data", exist_ok=True)

print("🚀 Loading dataset...")

# Read the Excel file
df = pd.read_excel("data/TrafficCongestion_MultiLocation_7000Rows.xlsx")

print(f"Original shape: {df.shape}")

# Basic preprocessing
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
df = df.sort_values(["Location", "Timestamp"]).reset_index(drop=True)

# Feature Engineering
df["hour"] = df["Timestamp"].dt.hour
df["dow"] = df["Timestamp"].dt.dayofweek
df["is_weekend"] = (df["dow"] >= 5).astype(int)
df["is_peak"] = df["hour"].isin([7,8,9,17,18,19,20]).astype(int)

# Cyclical time features
df["sin_hour"] = np.sin(2 * np.pi * df["hour"] / 24)
df["cos_hour"] = np.cos(2 * np.pi * df["hour"] / 24)

# Binary flags
df["accident_flag"] = (df["Accident"] == "Yes").astype(int)
df["event_flag"] = (df["Event"] == "Yes").astype(int)

# Weather risk
weather_map = {"Clear": 0.0, "Cloudy": 0.1, "Rain": 0.4, "Fog": 0.3, "Heavy Rain": 0.8}
df["weather_risk"] = df["Weather"].map(weather_map).fillna(0.0)

# Lag and Rolling features
for col in ["Traffic Volume", "Avg Speed (km/h)"]:
    df[f"{col}_lag1"] = df.groupby("Location")[col].shift(1)
    df[f"{col}_roll3"] = df.groupby("Location")[col].transform(
        lambda x: x.rolling(window=3, min_periods=1).mean()
    )

# Target encoding
le = LabelEncoder()
df["target"] = le.fit_transform(df["Congestion Level"])

# Fill missing values (from lag features)
df.fillna(0, inplace=True)

# Save processed data
df.to_pickle("data/processed.pkl")

# Save label mapping
label_mapping = {int(i): str(cls) for i, cls in enumerate(le.classes_)}
with open("data/label_mapping.json", "w") as f:
    json.dump(label_mapping, f, indent=2)

print("✅ Preprocessing Completed Successfully!")
print(f"Final shape: {df.shape}")
print("Target Classes:", le.classes_)
print("\n✅ Files saved:")
print("   → data/processed.pkl")
print("   → data/label_mapping.json")