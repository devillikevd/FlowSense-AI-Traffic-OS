# ml/train.py
import pandas as pd
import xgboost as xgb
import optuna
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score
import json
import os

# Load data
print("Loading processed data...")
df = pd.read_pickle("data/processed.pkl")

# Features
FEATURES = [
    "hour", "dow", "is_weekend", "is_peak",
    "sin_hour", "cos_hour",
    "Traffic Volume", "Avg Speed (km/h)",
    "accident_flag", "event_flag", "weather_risk",
    "Traffic Volume_lag1", "Traffic Volume_roll3",
    "Avg Speed (km/h)_lag1", "Avg Speed (km/h)_roll3"
]

available_features = [f for f in FEATURES if f in df.columns]
print(f"Using {len(available_features)} features")

X = df[available_features].fillna(0)
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

print(f"Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

# ==================== Objective Function ====================
def objective(trial):
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 300, 800),
        "max_depth": trial.suggest_int("max_depth", 4, 9),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
        "subsample": trial.suggest_float("subsample", 0.7, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.7, 1.0),
        "random_state": 42,
        "eval_metric": "mlogloss",
        "tree_method": "hist"
    }
    
    model = xgb.XGBClassifier(**params)
    
    # New way for early stopping in XGBoost 2.0+
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )
    
    preds = model.predict(X_test)
    return f1_score(y_test, preds, average="macro")


# ==================== Optuna Tuning ====================
print("🔄 Starting Optuna tuning (30 trials)... This may take 15-25 minutes.")
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=30, show_progress_bar=True)

print(f"\n✅ Best F1 Score: {study.best_value:.4f}")
print("Best Params:", study.best_params)

# ==================== Train Final Model ====================
final_model = xgb.XGBClassifier(**study.best_params, random_state=42)
final_model.fit(X_train, y_train)

# Evaluation
y_pred = final_model.predict(X_test)

print("\n" + "="*65)
print("FINAL MODEL PERFORMANCE")
print("="*65)
print(classification_report(y_test, y_pred, 
                          target_names=['High', 'Low', 'Medium', 'Very High']))

# Save everything
os.makedirs("ml", exist_ok=True)
joblib.dump(final_model, "ml/model.pkl")
joblib.dump(available_features, "ml/features.pkl")

with open("ml/best_params.json", "w") as f:
    json.dump(study.best_params, f, indent=2)

print("\n🎉 Training Completed Successfully!")
print("Model saved as: ml/model.pkl")