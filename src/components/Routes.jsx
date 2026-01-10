import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TodoList from "./ToDoList";
import PerformanceDashboard from "./PerformanceDashboard";
import RewardsDashboard from "./RewardsDashboard";
import PlansPage from "./PlansPage";
function RoutesConfig() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoList/>} />
             <Route path="/performance-dashboard" element={<PerformanceDashboard/>} />
                  <Route path="/reward-dashboard" element={<RewardsDashboard/>} />
                       <Route path="/plans" element={<PlansPage/>} />
      </Routes>
    </Router>
  );
}

export default RoutesConfig;