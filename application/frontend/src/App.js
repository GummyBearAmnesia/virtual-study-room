import React from "react";
import "./styles/App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import GroupStudyPage from './pages/GroupStudyPage';
import Analytics from './pages/Analytics';
import UserProfile from "./components/UserProfile";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudyRoomTest from './components/StudyRoomTest';
import MotivationalMessage from "./pages/Motivation";
//import ToDoList from './pages/ToDoList';

function App() {
  return (
    <Router>
      <Routes>
        // temporary change ok
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/motivational-message" element={<MotivationalMessage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/group-study" element={<GroupStudyPage />} />
        <Route path="/analytics/:username" element={<Analytics />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timer-test" element={<StudyRoomTest />} />
      </Routes>
    </Router>
  );
}

export default App;