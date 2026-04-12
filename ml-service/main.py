from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="Fitness Tracker ML API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Models ────────────────────────────────────────────────────────────

class CalorieRequest(BaseModel):
    age: int
    weight: float
    height: float
    gender: str
    activity_level: str

class WorkoutRequest(BaseModel):
    fitness_goal: str
    bmi: float
    activity_level: str

class HRVRequest(BaseModel):
    sleep_hours: float
    sleep_quality: str   # poor, fair, good, excellent
    workout_intensity: str  # low, medium, high
    resting_hr: float = 60.0

class PerformanceRequest(BaseModel):
    total_sessions: int
    avg_calories_burned: float
    avg_sleep_hours: float
    streak_days: int
    activity_level: str

class WorkoutPlanRequest(BaseModel):
    fitness_goal: str
    activity_level: str
    available_days: int = 4
    focus_areas: list = []

# ─── Model Loading ─────────────────────────────────────────────────────────────

CALORIE_MODEL_PATH = "calorie_model.pkl"
WORKOUT_MODEL_PATH = "workout_model.pkl"

def get_calorie_model():
    if not os.path.exists(CALORIE_MODEL_PATH):
        from model_training import train_models
        train_models()
    return joblib.load(CALORIE_MODEL_PATH)

def get_workout_model():
    if not os.path.exists(WORKOUT_MODEL_PATH):
        from model_training import train_models
        train_models()
    return joblib.load(WORKOUT_MODEL_PATH)

# ─── Existing Endpoints ────────────────────────────────────────────────────────

@app.post("/predict-calories")
async def predict_calories(req: CalorieRequest):
    model, encoder = get_calorie_model()
    try:
        gender_encoded = 1 if req.gender.lower() == "male" else 0
        activity_mapping = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "very_active": 1.9}
        activity = activity_mapping.get(req.activity_level.lower(), 1.2)
        features = pd.DataFrame([{
            'age': req.age, 'weight': req.weight, 'height': req.height,
            'gender': gender_encoded, 'activity_level': activity
        }])
        prediction = model.predict(features)[0]
        return {"target_calories": round(prediction)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend-workout")
async def recommend_workout(req: WorkoutRequest):
    model, le_goal, le_activity, le_workout = get_workout_model()
    try:
        goal_encoded = le_goal.transform([req.fitness_goal.lower()])[0]
        activity_encoded = le_activity.transform([req.activity_level.lower()])[0]
        features = pd.DataFrame([{
            'fitness_goal': goal_encoded, 'bmi': req.bmi, 'activity_level': activity_encoded
        }])
        prediction_encoded = model.predict(features)[0]
        prediction = le_workout.inverse_transform([prediction_encoded])[0]
        return {"recommended_workoutType": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── NEW: HRV Prediction ───────────────────────────────────────────────────────

@app.post("/predict-hrv")
async def predict_hrv(req: HRVRequest):
    """
    Predicts HRV score (ms) based on sleep and workout data.
    Uses a rule-based heuristic model (no training data needed).
    """
    quality_score = {"poor": 0.5, "fair": 0.7, "good": 0.9, "excellent": 1.0}.get(req.sleep_quality.lower(), 0.7)
    intensity_penalty = {"low": 0, "medium": -5, "high": -10}.get(req.workout_intensity.lower(), 0)
    
    # Base HRV formula: higher sleep = higher HRV, lower resting HR = higher HRV
    base_hrv = 40 + (req.sleep_hours * 5 * quality_score)
    hr_bonus = max(0, (70 - req.resting_hr))  # lower resting HR = bonus
    hrv_score = int(base_hrv + hr_bonus + intensity_penalty + np.random.randint(-3, 4))
    hrv_score = max(20, min(120, hrv_score))

    status = "Optimal" if hrv_score > 70 else "Moderate" if hrv_score > 50 else "Low"
    return {
        "hrv_score": hrv_score,
        "status": status,
        "recommendation": "Recover well tonight." if hrv_score < 60 else "Ready for high intensity."
    }

# ─── NEW: Sleep Quality Score ──────────────────────────────────────────────────

@app.post("/predict-sleep-quality")
async def predict_sleep_quality(req: HRVRequest):
    """Predicts sleep quality score 0–100."""
    ideal_hours = 8.0
    duration_score = max(0, 100 - abs(req.sleep_hours - ideal_hours) * 20)
    quality_mult = {"poor": 0.4, "fair": 0.65, "good": 0.85, "excellent": 1.0}.get(req.sleep_quality.lower(), 0.7)
    score = int(duration_score * quality_mult)
    score = max(0, min(100, score))
    return {"sleep_quality_score": score, "ideal_hours": ideal_hours, "actual_hours": req.sleep_hours}

# ─── NEW: Performance Index ────────────────────────────────────────────────────

@app.post("/predict-performance")
async def predict_performance(req: PerformanceRequest):
    """Predicts overall performance index 0–100."""
    activity_mult = {"sedentary": 0.5, "light": 0.7, "moderate": 0.85, "active": 1.0, "very_active": 1.1}.get(req.activity_level.lower(), 0.85)
    
    session_score = min(40, req.total_sessions * 2)
    calorie_score = min(25, req.avg_calories_burned / 20)
    sleep_score = min(20, (req.avg_sleep_hours / 8) * 20)
    streak_score = min(15, req.streak_days)
    
    raw = (session_score + calorie_score + sleep_score + streak_score) * activity_mult
    index = round(min(100, max(0, raw)), 1)

    trend = "+2.3%" if index > 80 else "+0.8%" if index > 60 else "-1.2%"
    return {"performance_index": index, "trend": trend, "grade": "A" if index > 85 else "B" if index > 70 else "C"}

# ─── NEW: Personalized Workout Plan ───────────────────────────────────────────

@app.post("/generate-workout-plan")
async def generate_workout_plan(req: WorkoutPlanRequest):
    """Generates a weekly workout plan based on goal and activity level."""
    plans = {
        "weight_loss": {
            "name": "Fat Burning Protocol",
            "sessions": [
                {"day": "Monday", "type": "HIIT", "duration": 45, "exercises": ["Burpees 4x15", "Mountain Climbers 4x30s", "Jump Squats 4x15", "Plank 4x1min"]},
                {"day": "Wednesday", "type": "Cardio", "duration": 50, "exercises": ["Treadmill Run 5km", "Cycling 20min", "Jump Rope 10min"]},
                {"day": "Friday", "type": "Strength", "duration": 60, "exercises": ["Goblet Squats 3x12", "Deadlift 3x10", "Push-ups 3x15", "Rows 3x12"]},
                {"day": "Sunday", "type": "Mobility", "duration": 30, "exercises": ["Yoga Flow 30min"]},
            ]
        },
        "muscle_gain": {
            "name": "Hypertrophy Phase II",
            "sessions": [
                {"day": "Monday", "type": "Push", "duration": 75, "exercises": ["Barbell Bench Press 4x8-10", "Overhead Press 3x12", "Incline DB Flys 3x15", "Tricep Pushdowns 3x15"]},
                {"day": "Tuesday", "type": "Pull", "duration": 70, "exercises": ["Barbell Rows 4x8", "Pull-ups 4x8", "Face Pulls 3x15", "Bicep Curls 3x12"]},
                {"day": "Thursday", "type": "Legs", "duration": 80, "exercises": ["Back Squat 5x5", "Romanian Deadlift 4x8", "Leg Press 3x12", "Calf Raises 4x20"]},
                {"day": "Saturday", "type": "Shoulders", "duration": 60, "exercises": ["Lateral Raises 4x15", "Arnold Press 3x12", "Rear Delt Flys 3x15", "Shrugs 3x15"]},
            ]
        },
        "maintenance": {
            "name": "Power-Building Core",
            "sessions": [
                {"day": "Monday", "type": "Full Body", "duration": 60, "exercises": ["Deadlift 3x5", "Bench Press 3x8", "Pull-ups 3x8", "Core Work 15min"]},
                {"day": "Wednesday", "type": "Cardio", "duration": 40, "exercises": ["Zone 2 Run 40min"]},
                {"day": "Friday", "type": "Full Body", "duration": 60, "exercises": ["Squats 3x8", "Overhead Press 3x8", "Rows 3x10", "Core Work 15min"]},
            ]
        },
        "endurance": {
            "name": "Cyber-Endurance Protocol",
            "sessions": [
                {"day": "Monday", "type": "Cardio", "duration": 60, "exercises": ["Zone 2 Run 8km"]},
                {"day": "Wednesday", "type": "Tempo", "duration": 50, "exercises": ["Tempo Run 5km at 85% HR", "Interval Sprints 6x400m"]},
                {"day": "Friday", "type": "Long Run", "duration": 90, "exercises": ["Long Steady Run 12–14km"]},
                {"day": "Sunday", "type": "Recovery", "duration": 30, "exercises": ["Easy Jog 5km", "Foam Rolling 15min"]},
            ]
        }
    }
    
    goal_key = req.fitness_goal.lower().replace(" ", "_")
    plan = plans.get(goal_key, plans["maintenance"])
    plan["sessions"] = plan["sessions"][:req.available_days]
    
    return {"plan": plan, "weeks": 8, "progression": "10% volume increase per week"}

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
