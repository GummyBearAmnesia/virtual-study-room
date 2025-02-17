import React from "react";
import "./styles/App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import MotivationalMessage from "./pages/Motivation";
import GroupStudyPage from "./pages/GroupStudyPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        // temporary change ok
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/motivational-message" element={<MotivationalMessage />} />
        <Route path="/group-study" element={<GroupStudyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
