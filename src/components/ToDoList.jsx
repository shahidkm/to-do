import React, { useState, useEffect } from 'react';
import { Check, Trash2, Edit2, Plus, X, RefreshCw, Camera, Clock } from 'lucide-react';
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

  const defaultTodos = [
    "Be Metured",
    "Think 3 Times Before Talking and Doing Anything",
    "Dont Talk About Myself And Be A Good Listner",
    "Dont Be Aggressive",
    "No Smoking",
    "Self Respect",
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
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return {
      dayStr: day,
      dateStr: `${date} ${month}`,
      timeStr: `${hours}:${minutes} ${ampm}`
    };
  };

  const { dayStr, dateStr, timeStr } = formatDateTime();

  const loadTodos = async () => {
    setLoading(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0]; // e.g., '2026-01-10'

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

    // Check if todo with same title already exists today
    const todayStr = new Date().toISOString().split('T')[0]; // e.g., '2026-01-10'
    const duplicate = todos.some(
      t => t.title === trimmedTodo && t.active && t.created_at.startsWith(todayStr)
    );

    if (duplicate) {
      alert("This task already exists today!");
      return;
    }

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
      const todayStr = new Date().toISOString().split('T')[0]; // e.g., '2026-01-10'

      // Fetch existing active todos for today
      const { data: existingTodos, error: fetchError } = await supabase
        .from('ToDo')
        .select('title')
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`)
        .eq('active', true);

      if (fetchError) throw fetchError;

      const existingTitles = existingTodos.map(t => t.title);

      // Filter defaultTodos to only add missing ones
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

      // Insert new todos
      const { data: insertedData, error: insertError } = await supabase
        .from('ToDo')
        .insert(newTodosData)
        .select();

      if (insertError) throw insertError;

      // Add newly inserted todos to state without removing existing ones
      setTodos(prev => [...insertedData, ...prev]);
    } catch (error) {
      console.error('Error regenerating todos:', error);
      alert('Failed to regenerate todos. Please try again.');
    }
  };



  const completedCount = todos.filter(t => t.completed).length;
  const canRegenerate = lastRegenerate !== new Date().toDateString();

  return (
    <div>
      <Navbar />


      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 py-12 px-4">
        <div className="max-w-md mx-auto mb-12">

          {/* Profile Image Section */}
          <div
            className="bg-white rounded-3xl p-8 mb-8 text-center relative overflow-hidden"
            style={{
              boxShadow: '0 25px 50px rgba(59, 130, 246, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-sky-400 to-blue-500 rounded-t-3xl"></div>

            {profileImage ? (
              <div className="relative inline-block">
                <div
                  className="w-48 h-48 mx-auto mb-4 relative overflow-hidden rounded-3xl"
                  style={{
                    transform: 'perspective(1000px) rotateX(5deg)',
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 20px 50px rgba(59, 130, 246, 0.25), 0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e7ff" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EImage Error%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-110"
                  style={{
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.35)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div
                className="w-48 h-48 mx-auto mb-4 relative"
                style={{
                  transform: 'perspective(1000px) rotateX(5deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div
                  className="w-full h-full rounded-3xl border-4 border-dashed border-blue-200 flex items-center justify-center bg-gradient-to-br from-white to-blue-50"
                  style={{
                    boxShadow: '0 15px 40px rgba(59, 130, 246, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <Camera className="text-blue-300" size={64} strokeWidth={1.5} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div
                  className="px-6 py-3 bg-gradient-to-br from-blue-400 to-sky-500 text-white rounded-2xl hover:from-blue-500 hover:to-sky-600 transition-all transform hover:scale-105 inline-block"
                  style={{
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span className="text-sm font-medium">Upload Image</span>
                </div>
              </label>

              {!showUrlInput ? (
                <button
                  onClick={() => setShowUrlInput(true)}
                  className="px-6 py-3 bg-white border-2 border-blue-300 text-blue-500 rounded-2xl hover:bg-blue-50 transition-all transform hover:scale-105"
                  style={{
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.15)'
                  }}
                >
                  <span className="text-sm font-medium">Use Image URL</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="Enter image URL..."
                    className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-400"
                    style={{
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                    }}
                  />
                  <button
                    onClick={handleUrlSubmit}
                    className="px-5 py-3 bg-gradient-to-br from-blue-400 to-sky-500 text-white rounded-xl hover:from-blue-500 hover:to-sky-600 transition-all"
                    style={{
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setShowUrlInput(false);
                      setImageUrl('');
                    }}
                    className="px-5 py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Clock Widget with 3D Effect */}
          <div
            className="bg-white rounded-3xl p-8 mb-8 text-center relative overflow-hidden"
            style={{
              boxShadow: '0 25px 50px rgba(59, 130, 246, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-sky-400 to-blue-500 rounded-t-3xl"></div>

            <div
              className="w-40 h-40 mx-auto mb-5 relative"
              style={{
                transform: 'perspective(1000px) rotateX(5deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div
                className="w-full h-full rounded-full border-[12px] border-blue-50 flex items-center justify-center bg-gradient-to-br from-white to-blue-50"
                style={{
                  boxShadow: '0 15px 40px rgba(59, 130, 246, 0.2), 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 5px 15px rgba(255, 255, 255, 0.5)'
                }}
              >
                <Clock className="text-blue-400" size={56} strokeWidth={2} />
              </div>
            </div>

            <div className="text-sm text-gray-500 font-medium mb-2">{dayStr}</div>
            <div className="text-4xl font-bold text-gray-800 mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {timeStr}
            </div>
            <div className="text-sm text-gray-400">{dateStr}</div>
          </div>
          <TodaysQuotes />
          {/* Tasks List Header */}
          <div className="flex items-center justify-between mb-5 px-2">
            <h3 className="text-2xl font-bold text-gray-800" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              Tasks List
            </h3>
            <button
              onClick={handleRegenerate}
              disabled={!canRegenerate}
              className={`p-3 rounded-2xl transition-all transform hover:scale-105 ${canRegenerate
                ? 'bg-gradient-to-br from-blue-400 to-sky-500 text-white hover:from-blue-500 hover:to-sky-600'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              style={{
                boxShadow: canRegenerate
                  ? '0 8px 20px rgba(59, 130, 246, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)'
                  : 'none'
              }}
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Add Todo Input with 3D Effect */}
          <div className="mb-6">
            <div
              className="relative bg-white rounded-2xl"
              style={{
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.12), 0 5px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
              }}
            >
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add new task..."
                className="w-full px-6 py-5 pr-16 rounded-2xl border-2 border-transparent focus:border-blue-300 focus:outline-none text-gray-700 placeholder-gray-400 bg-transparent"
              />
              <button
                onClick={handleAddTodo}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-blue-400 to-sky-500 text-white rounded-xl flex items-center justify-center hover:from-blue-500 hover:to-sky-600 transition-all transform hover:scale-105"
                style={{
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35), 0 4px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Tasks List with Enhanced 3D */}
          <div
            className="bg-white rounded-3xl p-6"
            style={{
              boxShadow: '0 25px 50px rgba(59, 130, 246, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="space-y-1">
              {loading ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Loading tasks...
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm mb-2">No tasks yet</p>
                  <p className="text-gray-300 text-xs">Add a task or regenerate daily todos</p>
                </div>
              ) : (
                todos.map((todo, index) => (
                  <div key={todo.id}>
                    {editingId === todo.id ? (
                      <div className="flex items-center gap-3 py-4 px-2">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-400"
                          style={{
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleEdit(todo.id)}
                          className="p-2.5 hover:bg-green-50 rounded-xl text-green-500 transition-all transform hover:scale-110"
                          style={{
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
                          }}
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2.5 hover:bg-red-50 rounded-xl text-red-400 transition-all transform hover:scale-110"
                          style={{
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 py-4 px-2 hover:bg-blue-50/50 rounded-xl transition-all">
                        <button
                          onClick={() => handleToggle(todo.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all transform hover:scale-110 ${todo.completed
                            ? 'bg-gradient-to-br from-blue-400 to-sky-500 border-blue-400'
                            : 'border-gray-300 hover:border-blue-300 bg-white'
                            }`}
                          style={{
                            boxShadow: todo.completed
                              ? '0 6px 16px rgba(59, 130, 246, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)'
                              : '0 2px 8px rgba(0, 0, 0, 0.06)'
                          }}
                          title={todo.completed ? "Mark as not completed" : "Mark as completed"}
                        >
                          {todo.completed && <Check size={16} className="text-white" strokeWidth={3} />}
                        </button>

                        <span className={`flex-1 text-sm ${todo.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-700 font-medium'
                          }`}>
                          {todo.title}
                        </span>

                        <button
                          onClick={() => startEdit(todo.id, todo.title)}
                          className="p-2 hover:bg-blue-100 rounded-xl text-blue-500 transition-all transform hover:scale-110"
                          style={{
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                          }}
                          title="Edit task"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-all transform hover:scale-110"
                          style={{
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                          }}
                          title="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                    {index < todos.length - 1 && <div className="border-b border-gray-100 mx-2"></div>}
                  </div>
                ))
              )}
            </div>

            {/* Task Stats with 3D Effect */}
            {todos.length > 0 && (
              <div
                className="mt-6 pt-5 border-t-2 border-gray-100 flex justify-between text-xs text-gray-500 bg-gradient-to-br from-blue-50/30 to-sky-50/30 rounded-2xl p-4 -mx-2"
                style={{
                  boxShadow: 'inset 0 2px 8px rgba(59, 130, 246, 0.08)'
                }}
              >
                <span>Total: <strong className="text-gray-700 text-sm">{todos.length}</strong></span>
                <span>Completed: <strong className="text-blue-500 text-sm">{completedCount}</strong></span>
                <span>Pending: <strong className="text-orange-400 text-sm">{todos.length - completedCount}</strong></span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}