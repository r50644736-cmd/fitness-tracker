import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

def train_models():
    print("Training synthetic models...")
    
    # 1. Calorie Prediction (Linear Regression)
    # Harris-Benedict approximation synthetic data
    np.random.seed(42)
    n_samples = 1000
    age = np.random.randint(18, 65, n_samples)
    weight = np.random.uniform(50, 120, n_samples) # kg
    height = np.random.uniform(150, 200, n_samples) # cm
    gender = np.random.randint(0, 2, n_samples) # 1 male, 0 female
    activity_level = np.random.uniform(1.2, 1.9, n_samples)
    
    # synthetic BMR
    bmr = np.where(gender == 1, 
                   88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age),
                   447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age))
    calories = bmr * activity_level + np.random.normal(0, 100, n_samples) # add some noise
    
    X_cal = pd.DataFrame({'age': age, 'weight': weight, 'height': height, 'gender': gender, 'activity_level': activity_level})
    y_cal = calories
    
    lin_reg = LinearRegression()
    lin_reg.fit(X_cal, y_cal)
    joblib.dump((lin_reg, None), "calorie_model.pkl")
    
    # 2. Workout Recommendation (Random Forest)
    goals = ['weight_loss', 'muscle_gain', 'maintenance']
    activities = ['sedentary', 'light', 'moderate', 'active', 'very_active']
    workouts = ['cardio', 'strength', 'hiit', 'rest', 'mixed']
    
    # synthetic rules logic
    goal_data = np.random.choice(goals, n_samples)
    bmi_data = weight / ((height/100)**2)
    activity_data = np.random.choice(activities, n_samples)
    
    workout_labels = []
    for g, b, a in zip(goal_data, bmi_data, activity_data):
        if g == 'weight_loss':
            workout_labels.append('cardio' if b > 25 else 'hiit')
        elif g == 'muscle_gain':
            workout_labels.append('strength' if a in ['active', 'very_active'] else 'mixed')
        else:
            workout_labels.append('mixed')
            
    le_goal = LabelEncoder()
    le_activity = LabelEncoder()
    le_workout = LabelEncoder()
    
    X_work = pd.DataFrame({
        'fitness_goal': le_goal.fit_transform(goal_data),
        'bmi': bmi_data,
        'activity_level': le_activity.fit_transform(activity_data)
    })
    y_work = le_workout.fit_transform(workout_labels)
    
    rf = RandomForestClassifier(n_estimators=50, random_state=42)
    rf.fit(X_work, y_work)
    
    joblib.dump((rf, le_goal, le_activity, le_workout), "workout_model.pkl")
    print("Models saved successfully.")

if __name__ == "__main__":
    train_models()
