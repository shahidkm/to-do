import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Award, Target, CheckCircle, XCircle, BarChart3, Sparkles, Zap, Activity, CircleDot, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from './NavBar';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PerformanceDashboard() {
  const [dailySummary, setDailySummary] = useState(null);
  const [dailyPoints, setDailyPoints] = useState(null);
  const [dailyPerformance, setDailyPerformance] = useState(null);
  const [weeklyPoints, setWeeklyPoints] = useState(null);
  const [monthlyPoints, setMonthlyPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsInput, setPointsInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [weeklyScores, setWeeklyScores] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadPerformanceHistory();
    loadWeeklyScores();
  }, []);

  useEffect(() => {
    loadTodosByDate(selectedDate);
  }, [selectedDate]);

  const calculateWeeklyPoints = async () => {
    try {
      // Get the first task ever created
      const { data: firstTask, error: firstTaskError } = await supabase
        .from('ToDo')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstTaskError || !firstTask) {
        alert('No tasks found to calculate from');
        return;
      }

      const firstTaskDate = new Date(firstTask.created_at);
      const today = new Date();
      
      // Calculate days since first task
      const daysSinceStart = Math.floor((today - firstTaskDate) / (1000 * 60 * 60 * 24));
      
      // Calculate which week we're in (starting from first task)
      const currentWeekNumber = Math.floor(daysSinceStart / 7);
      
      // Calculate week start and end based on first task date
      const weekStart = new Date(firstTaskDate);
      weekStart.setDate(firstTaskDate.getDate() + (currentWeekNumber * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get all todos for this week
      const { data: todos, error: todosError } = await supabase
        .from('ToDo')
        .select('*')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (todosError) throw todosError;

      const totalTasks = todos.length;
      const completedTasks = todos.filter(t => t.completed && t.active).length;
      const failedTasks = todos.filter(t => !t.completed && t.active).length;

      // Calculate score based on completion rate (0-10)
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
      const weekScore = Math.round(completionRate * 10);

      const { data: existing } = await supabase
        .from('weekly_points')
        .select('*')
        .eq('week_start', weekStart.toISOString().split('T')[0])
        .maybeSingle();

      let result;
      if (existing) {
        const { data } = await supabase
          .from('weekly_points')
          .update({
            total_points: weekScore,
            week_end: weekEnd.toISOString().split('T')[0]
          })
          .eq('week_start', weekStart.toISOString().split('T')[0])
          .select()
          .single();
        result = data;
      } else {
        const { data } = await supabase
          .from('weekly_points')
          .insert({
            week_start: weekStart.toISOString().split('T')[0],
            week_end: weekEnd.toISOString().split('T')[0],
            total_points: weekScore
          })
          .select()
          .single();
        result = data;
      }

      setWeeklyPoints(result);
      alert(`Weekly points calculated!\nScore: ${weekScore}/10\nCompleted: ${completedTasks}/${totalTasks} tasks (${(completionRate * 100).toFixed(0)}%)`);
    } catch (error) {
      console.error("Error calculating weekly points:", error);
      alert('Failed to calculate weekly points: ' + error.message);
    }
  };

  const calculateMonthlyPoints = async () => {
    try {
      // Get the first task ever created
      const { data: firstTask, error: firstTaskError } = await supabase
        .from('ToDo')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstTaskError || !firstTask) {
        alert('No tasks found to calculate from');
        return;
      }

      const firstTaskDate = new Date(firstTask.created_at);
      const today = new Date();
      
      // Calculate days since first task
      const daysSinceStart = Math.floor((today - firstTaskDate) / (1000 * 60 * 60 * 24));
      
      // Calculate which month we're in (30-day periods from first task)
      const currentMonthNumber = Math.floor(daysSinceStart / 30);
      
      // Calculate month start and end based on first task date
      const monthStart = new Date(firstTaskDate);
      monthStart.setDate(firstTaskDate.getDate() + (currentMonthNumber * 30));
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setDate(monthStart.getDate() + 29);
      monthEnd.setHours(23, 59, 59, 999);

      // Get all todos for this month period
      const { data: todos, error: todosError } = await supabase
        .from('ToDo')
        .select('*')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (todosError) throw todosError;

      const totalTasks = todos.length;
      const completedTasks = todos.filter(t => t.completed && t.active).length;
      const failedTasks = todos.filter(t => !t.completed && t.active).length;

      // Calculate score based on completion rate (0-10)
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
      const monthScore = Math.round(completionRate * 10);

      const { data: existing } = await supabase
        .from('monthly_points')
        .select('*')
        .eq('month', currentMonthNumber + 1)
        .eq('year', firstTaskDate.getFullYear())
        .maybeSingle();

      let result;
      if (existing) {
        const { data } = await supabase
          .from('monthly_points')
          .update({
            total_points: monthScore
          })
          .eq('month', currentMonthNumber + 1)
          .eq('year', firstTaskDate.getFullYear())
          .select()
          .single();
        result = data;
      } else {
        const { data } = await supabase
          .from('monthly_points')
          .insert({
            month: currentMonthNumber + 1,
            year: firstTaskDate.getFullYear(),
            total_points: monthScore
          })
          .select()
          .single();
        result = data;
      }

      setMonthlyPoints(result);
      alert(`Monthly points calculated!\nScore: ${monthScore}/10\nCompleted: ${completedTasks}/${totalTasks} tasks (${(completionRate * 100).toFixed(0)}%)`);
    } catch (error) {
      console.error("Error calculating monthly points:", error);
      alert('Failed to calculate monthly points: ' + error.message);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: summary } = await supabase
        .from('daily_todo_summary')
        .select('*')
        .eq('day', today)
        .single();
      setDailySummary(summary);

      const { data: points } = await supabase
        .from('daily_points')
        .select('*')
        .eq('day', today)
        .single();
      setDailyPoints(points);

      const { data: performance } = await supabase
        .from('daily_performance')
        .select('*')
        .eq('day', today)
        .single();
      setDailyPerformance(performance);

      const { data: weekly } = await supabase
        .from('weekly_points')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(1)
        .single();
      setWeeklyPoints(weekly);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const { data: monthly } = await supabase
        .from('monthly_points')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();
      setMonthlyPoints(monthly);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    
    setLoading(false);
  };

  const loadTodosByDate = async (date) => {
    try {
      const { data, error } = await supabase
        .from('ToDo')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTodos(data || []);
    } catch (error) {
      console.error("Error loading todos:", error);
    }
  };

  const loadPerformanceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_performance')
        .select('day, completion_percentage, performance_status')
        .order('day', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      
      const formattedData = (data || []).map(item => ({
        date: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        percentage: parseFloat(item.completion_percentage),
        status: item.performance_status
      }));
      
      setPerformanceHistory(formattedData);
    } catch (error) {
      console.error("Error loading performance history:", error);
    }
  };

  const loadWeeklyScores = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_points')
        .select('day, points')
        .order('day', { ascending: false })
        .limit(90);
      
      if (error) throw error;
      
      const weekMap = new Map();
      
      (data || []).forEach(item => {
        const date = new Date(item.day);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weekMap.has(weekKey)) {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekMap.set(weekKey, {
            weekStart: weekStart,
            weekEnd: weekEnd,
            totalScore: 0,
            days: 0
          });
        }
        
        const week = weekMap.get(weekKey);
        week.totalScore += item.points;
        week.days += 1;
      });
      
      const weeklyData = Array.from(weekMap.values())
        .sort((a, b) => b.weekStart - a.weekStart)
        .slice(0, 8);
      
      setWeeklyScores(weeklyData);
    } catch (error) {
      console.error("Error loading weekly scores:", error);
    }
  };

  const updateDailyPoints = async () => {
    const points = parseInt(pointsInput);
    if (isNaN(points) || points < 0 || points > 10) {
      alert('Points must be between 0 and 10');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: existing } = await supabase
        .from('daily_points')
        .select('*')
        .eq('day', today)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('daily_points')
          .update({
            points: points,
            reason: reasonInput || null
          })
          .eq('day', today)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('daily_points')
          .insert({
            day: today,
            points: points,
            reason: reasonInput || null
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setDailyPoints(result);
      setPointsInput('');
      setReasonInput('');
      loadWeeklyScores();
      alert('Daily points updated successfully!');
    } catch (error) {
      console.error("Error updating points:", error);
      alert('Failed to update points: ' + error.message);
    }
  };

  const calculateDailySummary = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: todos, error } = await supabase
        .from('ToDo')
        .select('*')
        .gte('created_at', today + 'T00:00:00')
        .lte('created_at', today + 'T23:59:59');

      if (error) throw error;

      const total = todos.length;
      const completed = todos.filter(t => t.completed && t.active).length;
      const failed = todos.filter(t => !t.completed && t.active).length;

      const percentage = total > 0 ? (completed / total) * 100 : 0;
      let status = 'poor';
      if (percentage >= 90) status = 'excellent';
      else if (percentage >= 70) status = 'good';
      else if (percentage >= 50) status = 'average';

      const autoPoints = Math.round((percentage / 100) * 10);

      const { data: existingSummary } = await supabase
        .from('daily_todo_summary')
        .select('*')
        .eq('day', today)
        .maybeSingle();

      const { data: existingPerf } = await supabase
        .from('daily_performance')
        .select('*')
        .eq('day', today)
        .maybeSingle();

      const { data: existingPoints } = await supabase
        .from('daily_points')
        .select('*')
        .eq('day', today)
        .maybeSingle();

      let summaryResult;
      if (existingSummary) {
        const { data } = await supabase
          .from('daily_todo_summary')
          .update({
            total_todos: total,
            completed_todos: completed,
            failed_todos: failed
          })
          .eq('day', today)
          .select()
          .single();
        summaryResult = data;
      } else {
        const { data } = await supabase
          .from('daily_todo_summary')
          .insert({
            day: today,
            total_todos: total,
            completed_todos: completed,
            failed_todos: failed
          })
          .select()
          .single();
        summaryResult = data;
      }

      let perfResult;
      if (existingPerf) {
        const { data } = await supabase
          .from('daily_performance')
          .update({
            completion_percentage: percentage.toFixed(2),
            performance_status: status
          })
          .eq('day', today)
          .select()
          .single();
        perfResult = data;
      } else {
        const { data } = await supabase
          .from('daily_performance')
          .insert({
            day: today,
            completion_percentage: percentage.toFixed(2),
            performance_status: status
          })
          .select()
          .single();
        perfResult = data;
      }

      let pointsResult;
      if (existingPoints) {
        const { data } = await supabase
          .from('daily_points')
          .update({
            points: autoPoints,
            reason: `Auto-calculated: ${completed}/${total} tasks completed (${percentage.toFixed(0)}%)`
          })
          .eq('day', today)
          .select()
          .single();
        pointsResult = data;
      } else {
        const { data } = await supabase
          .from('daily_points')
          .insert({
            day: today,
            points: autoPoints,
            reason: `Auto-calculated: ${completed}/${total} tasks completed (${percentage.toFixed(0)}%)`
          })
          .select()
          .single();
        pointsResult = data;
      }

      setDailySummary(summaryResult);
      setDailyPerformance(perfResult);
      setDailyPoints(pointsResult);
      loadPerformanceHistory();
      loadWeeklyScores();
      alert('Daily summary recalculated successfully!');
    } catch (error) {
      console.error("Error calculating summary:", error);
      alert('Failed to calculate summary: ' + error.message);
    }
  };

  const getPerformanceNotification = (score) => {
    if (score >= 9) return { icon: '🔥', text: 'Outstanding! You\'re crushing it!', color: 'emerald' };
    if (score >= 8) return { icon: '⭐', text: 'Excellent work! Keep it up!', color: 'sky' };
    if (score >= 7) return { icon: '👍', text: 'Good job! Solid performance!', color: 'blue' };
    if (score >= 6) return { icon: '📈', text: 'Nice progress! Almost there!', color: 'cyan' };
    if (score >= 5) return { icon: '💪', text: 'Keep pushing! You can do better!', color: 'amber' };
    if (score >= 4) return { icon: '⚡', text: 'Time to step up your game!', color: 'orange' };
    return { icon: '🎯', text: 'Focus needed! Let\'s improve!', color: 'rose' };
  };

  const getPerformanceColor = (status) => {
    const colors = {
      excellent: 'from-emerald-400 to-teal-500',
      good: 'from-sky-400 to-blue-500',
      average: 'from-amber-400 to-orange-500',
      poor: 'from-rose-400 to-red-500'
    };
    return colors[status] || 'from-slate-400 to-slate-500';
  };

  const getPerformanceIcon = (status) => {
    if (status === 'excellent') return <Sparkles className="text-emerald-500" size={36} />;
    if (status === 'good') return <TrendingUp className="text-sky-500" size={36} />;
    if (status === 'average') return <Activity className="text-amber-500" size={36} />;
    return <CircleDot className="text-rose-500" size={36} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
          <div className="text-slate-600 text-lg font-medium">Loading performance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl mb-4 shadow-lg shadow-sky-100">
              <Activity className="text-sky-500" size={42} strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-bold text-slate-800 mb-2 tracking-tight">Performance Dashboard</h1>
            <p className="text-slate-500 text-lg font-medium">Track your productivity and monitor your progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-sky-200/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Today's Summary</h3>
                <div className="p-2.5 bg-sky-50 rounded-xl">
                  <Calendar className="text-sky-500" size={22} strokeWidth={2.5} />
                </div>
              </div>
              {dailySummary ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-slate-600 font-semibold text-sm">Total Tasks</span>
                    <span className="text-3xl font-bold text-slate-800">{dailySummary.total_todos}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <span className="text-emerald-700 font-semibold text-sm flex items-center gap-2">
                      <CheckCircle size={18} strokeWidth={2.5} />Completed
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">{dailySummary.completed_todos}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border border-rose-100">
                    <span className="text-rose-700 font-semibold text-sm flex items-center gap-2">
                      <XCircle size={18} strokeWidth={2.5} />Failed
                    </span>
                    <span className="text-2xl font-bold text-rose-600">{dailySummary.failed_todos}</span>
                  </div>
                  <button onClick={calculateDailySummary} className="w-full mt-3 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold text-sm shadow-lg shadow-sky-200">Recalculate</button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-slate-400" size={28} />
                  </div>
                  <p className="text-slate-500 mb-4 font-medium">No data for today</p>
                  <button onClick={calculateDailySummary} className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-sky-200">Calculate Summary</button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-sky-200/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Performance</h3>
                <div className="p-2.5 bg-sky-50 rounded-xl">
                  <TrendingUp className="text-sky-500" size={22} strokeWidth={2.5} />
                </div>
              </div>
              {dailyPerformance ? (
                <div>
                  <div className="text-center mb-5">
                    <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
                      {getPerformanceIcon(dailyPerformance.performance_status)}
                    </div>
                    <div className="text-6xl font-black text-slate-800 mb-3">{dailyPerformance.completion_percentage}%</div>
                    <div className={`inline-block px-6 py-2.5 rounded-full text-white font-bold uppercase text-xs tracking-wider bg-gradient-to-r ${getPerformanceColor(dailyPerformance.performance_status)} shadow-lg`}>
                      {dailyPerformance.performance_status}
                    </div>
                  </div>
                  <button onClick={calculateDailySummary} className="w-full px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold text-sm shadow-lg shadow-sky-200">Recalculate</button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="text-slate-400" size={28} />
                  </div>
                  <p className="text-slate-500 mb-4 font-medium">No performance data</p>
                  <button onClick={calculateDailySummary} className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-sky-200">Calculate Performance</button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-sky-200/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Today's Points</h3>
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Zap className="text-amber-500" size={22} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                {dailyPoints ? (
                  <div className="mb-5">
                    <div className="text-center mb-4">
                      <div className="text-7xl font-black bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">{dailyPoints.points}</div>
                      <div className="text-xl text-slate-500 font-semibold">/ 10 points</div>
                      {dailyPoints.reason && (
                        <p className="text-xs text-slate-600 mt-4 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">{dailyPoints.reason}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center mb-5 py-6 bg-slate-50 rounded-xl border border-slate-100">
                    <Zap className="mx-auto mb-2 text-slate-300" size={32} />
                    <p className="text-slate-500 text-sm font-medium mb-1">No points assigned yet</p>
                    <p className="text-xs text-slate-400">Calculate summary to auto-assign</p>
                  </div>
                )}
                <div className="space-y-2.5">
                  <input type="number" min="0" max="10" value={pointsInput} onChange={(e) => setPointsInput(e.target.value)} placeholder="Points (0-10)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all text-sm font-medium" />
                  <input type="text" value={reasonInput} onChange={(e) => setReasonInput(e.target.value)} placeholder="Reason (optional)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all text-sm font-medium" />
                  <button onClick={updateDailyPoints} className="w-full px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-semibold text-sm shadow-lg shadow-amber-200">Override Points Manually</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-sky-200/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">This Week's Points</h3>
                  <p className="text-xs text-slate-500">Sum of all daily points this week</p>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl">
                  <Award className="text-sky-500" size={28} strokeWidth={2.5} />
                </div>
              </div>
              {weeklyPoints ? (
                <div>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-6xl font-black bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-600 bg-clip-text text-transparent">{weeklyPoints.total_points}</div>
                      <div className="text-sm text-slate-400 font-bold mt-1">/ 10</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium mb-4 text-center">Based on completed vs total tasks this week</p>
                  
                  {(() => {
                    const weekScore = weeklyPoints.total_points;
                    const notification = getPerformanceNotification(weekScore);
                    return (
                      <div className={`mb-4 p-4 bg-gradient-to-r from-${notification.color}-50 to-${notification.color}-100 border border-${notification.color}-200 rounded-xl`}>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{notification.icon}</span>
                          <div>
                            <div className={`text-sm font-bold text-${notification.color}-800 mb-1`}>Week Performance</div>
                            <div className={`text-xs text-${notification.color}-700`}>{notification.text}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all"
                      style={{ width: `${(weeklyPoints.total_points / 10) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-100 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-medium">Week Period (7 days)</span>
                      <span className="text-xs text-sky-600 font-bold">
                        {((weeklyPoints.total_points / 10) * 100).toFixed(0)}% Score
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-semibold">
                      {new Date(weeklyPoints.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weeklyPoints.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <button onClick={calculateWeeklyPoints} className="w-full mb-3 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold text-sm shadow-lg shadow-sky-200">
                    Recalculate Weekly Score
                  </button>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">💡</span>
                      <span><strong>How it works:</strong> Week starts from your first task date. Score is based on completion rate: (completed tasks ÷ total tasks) × 10. Max score: 10/10</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Award className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-500 font-medium mb-4">No weekly data yet</p>
                  <button onClick={calculateWeeklyPoints} className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-sky-200">
                    Calculate Weekly Score
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-sky-200/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">This Month's Points</h3>
                  <p className="text-xs text-slate-500">Sum of all daily points this month</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Trophy className="text-amber-500" size={28} strokeWidth={2.5} />
                </div>
              </div>
              {monthlyPoints ? (
                <div>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-6xl font-black bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                        {monthlyPoints.total_points}
                      </div>
                      <div className="text-sm text-slate-400 font-bold mt-1">/ 10</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium mb-4 text-center">
                    Based on completed vs total tasks this month
                  </p>
                  
                  {(() => {
                    const monthScore = monthlyPoints.total_points;
                    const notification = getPerformanceNotification(monthScore);
                    return (
                      <div className={`mb-4 p-4 bg-gradient-to-r from-${notification.color}-50 to-${notification.color}-100 border border-${notification.color}-200 rounded-xl`}>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{notification.icon}</span>
                          <div>
                            <div className={`text-sm font-bold text-${notification.color}-800 mb-1`}>Month Performance</div>
                            <div className={`text-xs text-${notification.color}-700`}>{notification.text}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                      style={{ width: `${(monthlyPoints.total_points / 10) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl border border-slate-100 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-medium">Month Period (30 days)</span>
                      <span className="text-xs text-amber-600 font-bold">
                        {((monthlyPoints.total_points / 10) * 100).toFixed(0)}% Score
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-semibold">
                      Month {monthlyPoints.month}
                    </p>
                  </div>

                  <button onClick={calculateMonthlyPoints} className="w-full mb-3 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-semibold text-sm shadow-lg shadow-amber-200">
                    Recalculate Monthly Score
                  </button>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">💡</span>
                      <span><strong>How it works:</strong> Month starts from your first task date (30-day periods). Score is based on completion rate: (completed tasks ÷ total tasks) × 10. Max score: 10/10</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Trophy className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-500 font-medium mb-4">No monthly data yet</p>
                  <button onClick={calculateMonthlyPoints} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-semibold shadow-lg shadow-amber-200">
                    Calculate Monthly Score
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Performance Trend</h3>
                <p className="text-slate-400 text-sm">Last 30 days completion rate</p>
              </div>
              <div className="flex items-center gap-4">
                {performanceHistory.length > 0 && (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">
                      {performanceHistory[performanceHistory.length - 1]?.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                      <TrendingUp className="text-emerald-400" size={14} />
                      <span>Current</span>
                    </div>
                  </div>
                )}
                <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                  <BarChart3 className="text-slate-400" size={22} strokeWidth={2.5} />
                </div>
              </div>
            </div>
            
            {performanceHistory.length > 0 ? (
              <div className="h-96 bg-slate-950 rounded-xl p-4 border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceHistory} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={{ stroke: '#334155' }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis 
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={{ stroke: '#334155' }}
                      axisLine={{ stroke: '#334155' }}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                      labelStyle={{ fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}
                      formatter={(value) => [
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>
                          {value.toFixed(1)}%
                        </span>, 
                        'Completion Rate'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#10b981" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorGreen)"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#0f172a' }}
                      activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-950 rounded-xl border border-slate-800">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                  <TrendingUp className="text-slate-600" size={36} />
                </div>
                <p className="text-slate-300 font-medium text-lg mb-1">No performance data yet</p>
                <p className="text-slate-500 text-sm">Complete tasks to start tracking your performance</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">Weekly Performance Scores</h3>
                <p className="text-slate-500 text-sm">Total daily points aggregated by week</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Trophy className="text-purple-500" size={28} strokeWidth={2.5} />
              </div>
            </div>

            {weeklyScores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weeklyScores.map((week, index) => {
                  const isCurrentWeek = index === 0;
                  const maxPossibleScore = week.days * 10;
                  const percentage = (week.totalScore / maxPossibleScore) * 100;
                  
                  return (
                    <div
                      key={week.weekStart.toISOString()}
                      className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                        isCurrentWeek
                          ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-lg shadow-purple-100'
                          : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {isCurrentWeek ? 'Current Week' : `Week ${index + 1}`}
                        </div>
                        {isCurrentWeek && (
                          <div className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                            LIVE
                          </div>
                        )}
                      </div>
                      
                      <div className={`text-5xl font-black mb-2 ${
                        isCurrentWeek
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                          : 'text-slate-800'
                      }`}>
                        {week.totalScore}
                      </div>
                      
                      <div className="text-sm text-slate-600 font-medium mb-3">
                        out of {maxPossibleScore} points
                      </div>
                      
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                            percentage >= 60 ? 'bg-gradient-to-r from-sky-400 to-blue-500' :
                            percentage >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                            'bg-gradient-to-r from-rose-400 to-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-slate-500 font-medium mb-2">
                        {week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">{week.days} days tracked</span>
                        <span className={`font-bold ${
                          percentage >= 80 ? 'text-emerald-600' :
                          percentage >= 60 ? 'text-sky-600' :
                          percentage >= 40 ? 'text-amber-600' :
                          'text-rose-600'
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Trophy className="text-slate-300" size={36} />
                </div>
                <p className="text-slate-500 font-medium text-lg mb-1">No weekly scores yet</p>
                <p className="text-slate-400 text-sm">Start tracking daily points to see weekly performance</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Tasks History</h3>
              <div className="flex items-center gap-3">
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all text-sm font-medium" />
                <div className="p-2.5 bg-sky-50 rounded-xl">
                  <BarChart3 className="text-sky-500" size={22} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {todos.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Target className="text-slate-300" size={36} />
                  </div>
                  <p className="text-slate-500 font-medium text-lg mb-1">No tasks found</p>
                  <p className="text-slate-400 text-sm">No tasks were created on this date</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-800">{todos.length}</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Total</div>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <div className="text-3xl font-bold text-emerald-600">{todos.filter(t => t.completed && t.active).length}</div>
                      <div className="text-xs text-emerald-600 font-medium mt-1">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-rose-600">{todos.filter(t => !t.completed && t.active).length}</div>
                      <div className="text-xs text-rose-600 font-medium mt-1">Pending</div>
                    </div>
                  </div>
                  {todos.map((todo, index) => (
                    <div key={todo.id}>
                      <div className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all ${todo.active ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 opacity-60'}`}>
                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center ${
                          todo.completed && todo.active ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-400' : todo.active ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-100'
                        }`}>
                          {todo.completed && todo.active && <Check size={18} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`flex-1 text-sm ${
                          todo.completed && todo.active ? 'line-through text-slate-400' : todo.active ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'
                        }`}>{todo.title}</span>
                        <div className="flex items-center gap-2">
                          {todo.active ? (
                            <>
                              {todo.completed ? (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">Done</span>
                              ) : (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200">Pending</span>
                              )}
                            </>
                          ) : (
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold border border-slate-200">Deleted</span>
                          )}
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(todo.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {index < todos.length - 1 && <div className="border-b border-slate-100"></div>}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}