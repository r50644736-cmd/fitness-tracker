import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';
const ML_URL = 'http://localhost:8000';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  // Profile
  getProfile: () => axios.get(`${BASE_URL}/tracking/profile`, authHeader()),
  updateProfile: (data) => axios.put(`${BASE_URL}/tracking/profile`, data, authHeader()),

  // Dashboard
  getDashboard: () => axios.get(`${BASE_URL}/tracking/dashboard`, authHeader()),

  // Workouts
  getWorkouts: () => axios.get(`${BASE_URL}/tracking/workouts`, authHeader()),
  logWorkout: (data) => axios.post(`${BASE_URL}/tracking/workout`, data, authHeader()),
  deleteWorkout: (id) => axios.delete(`${BASE_URL}/tracking/workout/${id}`, authHeader()),

  // Diet
  getDiets: () => axios.get(`${BASE_URL}/tracking/diets`, authHeader()),
  logDiet: (data) => axios.post(`${BASE_URL}/tracking/diet`, data, authHeader()),
  deleteDiet: (id) => axios.delete(`${BASE_URL}/tracking/diet/${id}`, authHeader()),

  // Sleep
  getSleep: () => axios.get(`${BASE_URL}/tracking/sleep`, authHeader()),
  logSleep: (data) => axios.post(`${BASE_URL}/tracking/sleep`, data, authHeader()),
  deleteSleep: (id) => axios.delete(`${BASE_URL}/tracking/sleep/${id}`, authHeader()),

  // Hydration
  logHydration: (data) => axios.post(`${BASE_URL}/tracking/hydration`, data, authHeader()),
  getTodayHydration: () => axios.get(`${BASE_URL}/tracking/hydration/today`, authHeader()),

  // Stats
  getPerformanceStats: () => axios.get(`${BASE_URL}/tracking/stats/performance`, authHeader()),
  getBiometricStats: () => axios.get(`${BASE_URL}/tracking/stats/biometrics`, authHeader()),
  getArchive: () => axios.get(`${BASE_URL}/tracking/archive`, authHeader()),

  // ML Service
  generateWorkoutPlan: (data) => axios.post(`${ML_URL}/generate-workout-plan`, data),
  predictPerformance: (data) => axios.post(`${ML_URL}/predict-performance`, data),
};

export default api;
