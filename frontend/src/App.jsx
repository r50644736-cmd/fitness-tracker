import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Layout from './components/Layout';
import Workouts from './components/Workouts';
import Progress from './components/Progress';
import BioMetrics from './components/BioMetrics';
import Archive from './components/Archive';
import Profile from './components/Profile';
import Nutrition from './components/Nutrition';
import { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        
        {/* Protected Routes */}
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
           <Route index element={<Dashboard />} />
           <Route path="performance" element={<Progress />} />
           <Route path="nutrition" element={<Nutrition />} />
           <Route path="bio-metrics" element={<BioMetrics />} />
           <Route path="program" element={<Workouts />} />
           <Route path="archive" element={<Archive />} />
           <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
