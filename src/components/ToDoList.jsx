import React, { useState, useEffect } from 'react';
import { Check, Trash2, Edit2, Plus, X, RefreshCw, Camera, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Navbar from './NavBar';
import TodaysQuotes from './TodaysQuotes';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '/MyImage01.JPG');
  const [lastRegenerate, setLastRegenerate] = useState(localStorage.getItem('lastRegenerate') || null);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [addingTodo, setAddingTodo] = useState(false);

  const defaultTodos = [
    "No Smoking",
    "Be Metured",
    "Think 3 Times Before Talking and Doing Anything",
    "Dont Talk About Myself And Be A Good Listner",
    "Dont Be Aggressive",
    "Dont Be Selfish",
    "Dont Be Toxic",
    "Build A Good Charecter",
    "Self Respect",
    "Get Well Dressed"
  ];

  useEffect(() => {
    loadTodos();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const month = months[currentTime.getMonth()];

    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return {
      dayStr: day,
      dateStr: `${date} ${month}`,
      timeStr: `${hours}:${minutes}`,
      secondsStr: seconds,
      ampm
    };
  };

  const { dayStr, dateStr, timeStr, secondsStr, ampm } = formatDateTime();

  const loadTodos = async () => {
    setLoading(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('ToDo')
        .select('*')
        .eq('active', true)
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos(data || []);
    } catch (error) {
      console.error("Error loading todos:", error);
    }

    setLoading(false);
  };

  const handleAddTodo = async () => {
    const trimmedTodo = newTodo.trim();
    if (!trimmedTodo) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const duplicate = todos.some(
      t => t.title === trimmedTodo && t.active && t.created_at.startsWith(todayStr)
    );

    if (duplicate) {
      alert("This task already exists today!");
      return;
    }

    setAddingTodo(true);

    try {
      const { data, error } = await supabase
        .from('ToDo')
        .insert([
          {
            title: trimmedTodo,
            completed: false,
            active: true
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setTodos([data[0], ...todos]);
        setNewTodo('');
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Failed to add todo. Please try again.");
    }

    setTimeout(() => setAddingTodo(false), 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddTodo();
  };

  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const { error } = await supabase
        .from('ToDo')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;

      const updatedTodos = todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error toggling todo:", error);
      alert("Failed to update todo. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('ToDo')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      const updatedTodos = todos.filter(t => t.id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo. Please try again.");
    }
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('ToDo')
        .update({ title: editText.trim() })
        .eq('id', id);

      if (error) throw error;

      const updatedTodos = todos.map(t =>
        t.id === id ? { ...t, title: editText.trim() } : t
      );
      setTodos(updatedTodos);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        localStorage.setItem('profileImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setProfileImage(imageUrl.trim());
      localStorage.setItem('profileImage', imageUrl.trim());
      setImageUrl('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('profileImage');
  };

  const handleRegenerate = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const { data: existingTodos, error: fetchError } = await supabase
        .from('ToDo')
        .select('title')
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`)
        .eq('active', true);

      if (fetchError) throw fetchError;

      const existingTitles = existingTodos.map(t => t.title);

      const newTodosData = defaultTodos
        .filter(title => !existingTitles.includes(title))
        .map(title => ({
          title,
          completed: false,
          active: true
        }));

      if (newTodosData.length === 0) {
        alert('All default tasks already exist today!');
        return;
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('ToDo')
        .insert(newTodosData)
        .select();

      if (insertError) throw insertError;

      setTodos(prev => [...insertedData, ...prev]);
    } catch (error) {
      console.error('Error regenerating todos:', error);
      alert('Failed to regenerate todos. Please try again.');
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const canRegenerate = lastRegenerate !== new Date().toDateString();
  const completionPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div>
      <Navbar />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        
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
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes rotate-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes check-scale {
          0% { transform: scale(0) rotate(-45deg); }
          50% { transform: scale(1.2) rotate(-45deg); }
          100% { transform: scale(1) rotate(-45deg); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .gradient-animate {
          background-size: 200% 200%;
          animation: rotate-gradient 3s ease infinite;
        }
        
        .shimmer-bg {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .progress-ring {
          transition: stroke-dashoffset 0.5s ease;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 py-8 px-4">
        <div className="max-w-md mx-auto">

          {/* Profile Image Section with Modern Design */}
          <div className="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden slide-in">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-sky-300/10 to-indigo-400/10 gradient-animate opacity-50"></div>
            
            <div className="relative z-10">
              {profileImage ? (
                <div className="relative inline-block w-full">
                  <div className="w-40 h-40 mx-auto mb-4 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-2xl transform transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e7ff" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EImage Error%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-1/2 translate-x-20 -translate-y-2 w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-700 transition-all transform hover:scale-110 shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="w-40 h-40 mx-auto mb-4 float-animation">
                  <div className="w-full h-full rounded-full border-4 border-dashed border-blue-300 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Camera className="text-blue-400" size={48} strokeWidth={1.5} />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-4">
                <label className="cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform group-hover:scale-105 text-center shadow-lg">
                    <span className="text-sm font-semibold">Upload Image</span>
                  </div>
                </label>

                {!showUrlInput ? (
                  <button
                    onClick={() => setShowUrlInput(true)}
                    className="px-6 py-3 bg-white/80 border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-md"
                  >
                    <span className="text-sm font-semibold">Use Image URL</span>
                  </button>
                ) : (
                  <div className="flex gap-2 slide-in">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      placeholder="Enter image URL..."
                      className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white/80"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setShowUrlInput(false);
                        setImageUrl('');
                      }}
                      className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modern Clock Widget */}
          <div className="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden slide-in">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 via-blue-300/10 to-sky-400/10 gradient-animate opacity-50"></div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="text-blue-500" size={24} />
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{dayStr}</span>
              </div>
              
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {timeStr}
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-xl font-medium text-blue-500">{ampm}</span>
                  <span className="text-sm text-gray-400 font-mono">{secondsStr}</span>
                </div>
              </div>
              
              <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <span className="text-sm font-medium text-gray-600">{dateStr}</span>
              </div>
            </div>
          </div>

          <TodaysQuotes />

          {/* Progress Ring */}
          {todos.length > 0 && (
            <div className="glass-card rounded-3xl p-6 mb-6 slide-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">Progress</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {completionPercentage}%
                  </p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-blue-100"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                      className="progress-ring"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="text-blue-500" size={28} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{todos.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Done</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                  <p className="text-2xl font-bold text-orange-600">{todos.length - completedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Pending</p>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-500" size={24} />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Today's Tasks
              </h3>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={!canRegenerate}
              className={`p-3 rounded-xl transition-all transform hover:scale-110 ${
                canRegenerate
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg pulse-glow'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw size={20} className={canRegenerate ? 'animate-spin-slow' : ''} />
            </button>
          </div>

          {/* Add Todo Input */}
          <div className="mb-6 slide-in">
            <div className="relative glass-card rounded-2xl overflow-hidden">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a new task..."
                className="w-full px-6 py-5 pr-16 bg-transparent border-2 border-transparent focus:border-blue-300 focus:outline-none text-gray-700 placeholder-gray-400 transition-all"
              />
              <button
                onClick={handleAddTodo}
                disabled={addingTodo}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-110 shadow-lg disabled:opacity-50"
              >
                <Plus size={24} strokeWidth={2.5} className={addingTodo ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Tasks List */}
          <div className="glass-card rounded-3xl p-5 slide-in">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm">Loading tasks...</p>
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 float-animation">
                    <Sparkles className="text-blue-400" size={32} />
                  </div>
                  <p className="text-gray-400 text-sm mb-2">No tasks yet</p>
                  <p className="text-gray-300 text-xs">Add a task to get started</p>
                </div>
              ) : (
                todos.map((todo, index) => (
                  <div key={todo.id} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    {editingId === todo.id ? (
                      <div className="flex items-center gap-2 py-3 px-3 bg-blue-50/50 rounded-xl">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 px-4 py-2.5 border-2 border-blue-300 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEdit(todo.id)}
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
                      <div className="group flex items-center gap-3 py-3 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all">
                        <button
                          onClick={() => handleToggle(todo.id)}
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
                            onClick={() => handleDelete(todo.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-all transform hover:scale-110"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}