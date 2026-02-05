import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TodoList from "./ToDoList";
import PerformanceDashboard from "./PerformanceDashboard";
import RewardsDashboard from "./RewardsDashboard";
import PlansPage from "./PlansPage";
import QuoteTabs from "./QuoteTabs";
import PreviousTodos from "./PreviousTodos";
function RoutesConfig() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoList/>} />
             <Route path="/performance-dashboard" element={<PerformanceDashboard/>} />
                  <Route path="/reward-dashboard" element={<RewardsDashboard/>} />
                       <Route path="/plans" element={<PlansPage/>} />
                        <Route path="/inspirations" element={<QuoteTabs/>} />
                             <Route path="/previous-todos" element={<PreviousTodos/>} />
      </Routes>
    </Router>
  );
}

export default RoutesConfig;