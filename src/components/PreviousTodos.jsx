import React, { useState, useEffect } from 'react';
import { Check, Trash2, Edit2, X, Calendar, ChevronDown, ChevronUp, TrendingUp, Clock, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Navbar from './NavBar';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PreviousTodos() {
  const [todosByDate, setTodosByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [recalculating, setRecalculating] = useState(false);
  const [recalculatingDate, setRecalculatingDate] = useState(null);

  useEffect(() => {
    loadPreviousTodos();
  }, []);

  const loadPreviousTodos = async () => {
    setLoading(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('ToDo')
        .select('*')
        .eq('active', true)
        .lt('created_at', `${todayStr}T00:00:00`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group todos by date
      const grouped = {};
      data.forEach(todo => {
        const dateKey = todo.created_at.split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(todo);
      });

      setTodosByDate(grouped);
      
      // Auto-expand the most recent date
      const dates = Object.keys(grouped);
      if (dates.length > 0) {
        setExpandedDates({ [dates[0]]: true });
      }
    } catch (error) {
      console.error("Error loading previous todos:", error);
    }

    setLoading(false);
  };

  const recalculateAllPreviousDates = async () => {
    if (!confirm('This will recalculate performance data for all previous dates. This may take a while. Continue?')) {
      return;
    }
    
    setRecalculating(true);
    
    try {
      const dates = Object.keys(todosByDate).sort((a, b) => a.localeCompare(b));
      
      let processed = 0;
      let failed = 0;

      // Process each date
      for (const dateStr of dates) {
        try {
          setRecalculatingDate(dateStr);
          await recalculateSpecificDate(dateStr);
          processed++;
          
          // Small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Failed to recalculate ${dateStr}:`, err);
          failed++;
        }
      }

      alert(`✅ Bulk Recalculation Complete!\n\nProcessed: ${processed} days\nFailed: ${failed} days`);
    } catch (error) {
      console.error("Error in bulk recalculation:", error);
      alert('Failed to recalculate all data: ' + error.message);
    }
    
    setRecalculating(false);
    setRecalculatingDate(null);
  };

  const handleToggle = async (id, currentCompleted) => {
    try {
      const { error } = await supabase
        .from('ToDo')
        .update({ completed: !currentCompleted })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedTodosByDate = { ...todosByDate };
      Object.keys(updatedTodosByDate).forEach(date => {
        updatedTodosByDate[date] = updatedTodosByDate[date].map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      });
      setTodosByDate(updatedTodosByDate);
    } catch (error) {
      console.error("Error toggling todo:", error);
      alert("Failed to update todo. Please try again.");
    }
  };

  const handleDelete = async (id, dateKey) => {
    try {
      const { error } = await supabase
        .from('ToDo')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedTodosByDate = { ...todosByDate };
      updatedTodosByDate[dateKey] = updatedTodosByDate[dateKey].filter(t => t.id !== id);
      
      // Remove date group if empty
      if (updatedTodosByDate[dateKey].length === 0) {
        delete updatedTodosByDate[dateKey];
      }
      
      setTodosByDate(updatedTodosByDate);
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo. Please try again.");
    }
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEdit = async (id, dateKey) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('ToDo')
        .update({ title: editText.trim() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedTodosByDate = { ...todosByDate };
      updatedTodosByDate[dateKey] = updatedTodosByDate[dateKey].map(t =>
        t.id === id ? { ...t, title: editText.trim() } : t
      );
      setTodosByDate(updatedTodosByDate);
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error("Error editing todo:", error);
      alert("Failed to edit todo. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const toggleDateExpansion = (dateKey) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const recalculateSpecificDate = async (dateStr) => {
    setRecalculating(true);
    setRecalculatingDate(dateStr);
    
    try {
      const { data: todos, error } = await supabase
        .from('ToDo')
        .select('*')
        .gte('created_at', dateStr + 'T00:00:00')
        .lte('created_at', dateStr + 'T23:59:59');

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

      // Update or insert daily_todo_summary
      const { data: existingSummary } = await supabase
        .from('daily_todo_summary')
        .select('*')
        .eq('day', dateStr)
        .maybeSingle();

      if (existingSummary) {
        await supabase
          .from('daily_todo_summary')
          .update({
            total_todos: total,
            completed_todos: completed,
            failed_todos: failed
          })
          .eq('day', dateStr);
      } else {
        await supabase
          .from('daily_todo_summary')
          .insert({
            day: dateStr,
            total_todos: total,
            completed_todos: completed,
            failed_todos: failed
          });
      }

      // Update or insert daily_performance
      const { data: existingPerf } = await supabase
        .from('daily_performance')
        .select('*')
        .eq('day', dateStr)
        .maybeSingle();

      if (existingPerf) {
        await supabase
          .from('daily_performance')
          .update({
            completion_percentage: percentage.toFixed(2),
            performance_status: status
          })
          .eq('day', dateStr);
      } else {
        await supabase
          .from('daily_performance')
          .insert({
            day: dateStr,
            completion_percentage: percentage.toFixed(2),
            performance_status: status
          });
      }

      // Update or insert daily_points
      const { data: existingPoints } = await supabase
        .from('daily_points')
        .select('*')
        .eq('day', dateStr)
        .maybeSingle();

      if (existingPoints) {
        await supabase
          .from('daily_points')
          .update({
            points: autoPoints,
            reason: `Auto-recalculated: ${completed}/${total} tasks completed (${percentage.toFixed(0)}%)`
          })
          .eq('day', dateStr);
      } else {
        await supabase
          .from('daily_points')
          .insert({
            day: dateStr,
            points: autoPoints,
            reason: `Auto-calculated: ${completed}/${total} tasks completed (${percentage.toFixed(0)}%)`
          });
      }
      
      alert(`✅ Performance recalculated!\n\nDate: ${new Date(dateStr).toLocaleDateString()}\nScore: ${autoPoints}/10\nCompleted: ${completed}/${total} tasks (${percentage.toFixed(0)}%)\nStatus: ${status.toUpperCase()}`);
    } catch (error) {
      console.error("Error recalculating date:", error);
      alert('Failed to recalculate: ' + error.message);
    }
    
    setRecalculating(false);
    setRecalculatingDate(null);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === yesterdayOnly) return 'Yesterday';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getDateStats = (todos) => {
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const dates = Object.keys(todosByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <Navbar />

      <style>{`
        @keyframes slide-in {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="glass-card rounded-3xl p-6 mb-6 slide-in">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Previous Tasks
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Review and manage your past todos</p>
                </div>
              </div>
              
              {/* Bulk Recalculate Button */}
              {Object.keys(todosByDate).length > 0 && (
                <button
                  onClick={recalculateAllPreviousDates}
                  disabled={recalculating}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recalculating ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      <span className="font-semibold text-sm">Recalculating...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      <span className="font-semibold text-sm">Recalculate All</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Info Banner */}
          {Object.keys(todosByDate).length > 0 && (
            <div className="glass-card rounded-2xl p-5 mb-6 border-2 border-purple-200 slide-in">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Sparkles className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">Performance Recalculation</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    After editing or deleting tasks, click the <RefreshCw className="inline w-3 h-3 mx-1" /> button on any date to update its performance metrics, or use <strong>Recalculate All</strong> to update all previous dates at once. This will refresh completion rates, scores, and status for the Performance Dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="glass-card rounded-3xl p-12 text-center slide-in">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Loading previous tasks...</p>
            </div>
          ) : dates.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center slide-in">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 float-animation">
                <Calendar className="text-blue-400" size={32} />
              </div>
              <p className="text-gray-400 text-lg font-medium mb-2">No Previous Tasks</p>
              <p className="text-gray-300 text-sm">Start adding tasks to see your history here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dates.map((dateKey, index) => {
                const todos = todosByDate[dateKey];
                const stats = getDateStats(todos);
                const isExpanded = expandedDates[dateKey];

                return (
                  <div key={dateKey} className="glass-card rounded-3xl overflow-hidden slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    {/* Date Header */}
                    <button
                      onClick={() => toggleDateExpansion(dateKey)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Calendar className="text-white" size={20} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-gray-800">
                            {formatDate(dateKey)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {stats.completed}/{stats.total} completed · {stats.percentage}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Recalculate Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            recalculateSpecificDate(dateKey);
                          }}
                          disabled={recalculating && recalculatingDate === dateKey}
                          className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Recalculate performance for this date"
                        >
                          <RefreshCw 
                            size={18} 
                            className={recalculating && recalculatingDate === dateKey ? 'animate-spin' : ''} 
                          />
                        </button>

                        {/* Mini Progress Ring */}
                        <div className="relative w-12 h-12">
                          <svg className="transform -rotate-90 w-12 h-12">
                            <circle
                              cx="24"
                              cy="24"
                              r="18"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-blue-100"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="18"
                              stroke="url(#gradient-${dateKey})"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 18}`}
                              strokeDashoffset={`${2 * Math.PI * 18 * (1 - stats.percentage / 100)}`}
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id={`gradient-${dateKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#6366F1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{stats.percentage}</span>
                          </div>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="text-gray-400" size={24} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={24} />
                        )}
                      </div>
                    </button>

                    {/* Tasks List */}
                    {isExpanded && (
                      <div className="px-6 pb-5 space-y-2 border-t border-gray-100">
                        {todos.map((todo, todoIndex) => (
                          <div key={todo.id} className="slide-in" style={{ animationDelay: `${todoIndex * 0.05}s` }}>
                            {editingId === todo.id ? (
                              <div className="flex items-center gap-2 py-3 px-3 bg-blue-50/50 rounded-xl mt-2">
                                <input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="flex-1 px-4 py-2.5 border-2 border-blue-300 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleEdit(todo.id, dateKey)}
                                  className="p-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-white transition-all transform hover:scale-110 shadow-md"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-all transform hover:scale-110 shadow-md"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <div className="group flex items-center gap-3 py-3 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all mt-2">
                                <button
                                  onClick={() => handleToggle(todo.id, todo.completed)}
                                  className={`relative flex-shrink-0 w-7 h-7 rounded-lg border-2 transition-all transform hover:scale-110 ${
                                    todo.completed
                                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 shadow-lg'
                                      : 'border-gray-300 hover:border-blue-400 bg-white shadow-sm'
                                  }`}
                                >
                                  {todo.completed && (
                                    <Check size={18} className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
                                  )}
                                </button>

                                <span className={`flex-1 text-sm transition-all ${
                                  todo.completed
                                    ? 'line-through text-gray-400'
                                    : 'text-gray-700 font-medium group-hover:text-blue-600'
                                }`}>
                                  {todo.title}
                                </span>

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEdit(todo.id, todo.title)}
                                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-all transform hover:scale-110"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(todo.id, dateKey)}
                                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-all transform hover:scale-110"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}