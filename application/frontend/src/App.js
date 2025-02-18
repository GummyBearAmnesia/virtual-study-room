import React from "react";
import "./styles/App.css";
import React from "react";
import "./styles/App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import GroupStudyPage from "./pages/GroupStudyPage";
import GroupStudyPage from "./pages/GroupStudyPage";
import MotivationalMessage from "./pages/Motivation";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ToDoList from "./pages/ToDoList";
import Dashboard from "./pages/Dashboard";

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
        <Route path="/motivational-message" element={<MotivationalMessage />} />
        <Route path="/group-study" element={<GroupStudyPage />} />
        <Route path="/motivational-message" element={<MotivationalMessage />} />
      </Routes>
    </Router>
  );
}

export default App;
