import React, { useState, useEffect } from 'react';
import { Check, Trash2, Edit2, Plus, X, RefreshCw, Camera, Clock, Sparkles, TrendingUp, Building2, Flag, Flame } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Navbar from './NavBar';
import TodaysQuotes from './TodaysQuotes';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TOTAL_DAYS = 365;
const COMPLETED_DAYS = 211;
const REMAINING_DAYS = TOTAL_DAYS - COMPLETED_DAYS;

const MOTIVATIONAL_MESSAGES = [
  "Every day you survive is proof of your strength. Keep pushing!",
  "You're more than halfway there. The finish line is in sight!",
  "Each day builds the person you're becoming. Stay the course.",
  "Hard days are just chapters, not the whole story.",
  "You chose this challenge. Now own every single day of it!",
  "The version of you on Day 365 will thank you for today.",
  "Discipline is the bridge between goals and accomplishment.",
  "Show up today like your future depends on it — because it does.",
];

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
  const [showDayAlert, setShowDayAlert] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const defaultTodos = [
    "Build A Good Charecter","Do Good Things Only","No Smoking","Be Metured",
    "Think 3 Times Before Talking and Doing Anything",
    "Dont Talk About Myself And Be A Good Listner","Dont Be Aggressive",
    "Dont Be Selfish","Dont Be Toxic","Self Respect","Get Well Dressed"
  ];

  useEffect(() => {
    loadTodos();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const todayStr = new Date().toDateString();
    const lastAlertDay = localStorage.getItem('lastDayAlertShown');
    if (lastAlertDay !== todayStr) {
      setTimeout(() => {
        setShowDayAlert(true);
        setTimeout(() => setAlertVisible(true), 50);
      }, 600);
    }
    return () => clearInterval(timer);
  }, []);

  const closeDayAlert = () => {
    setAlertVisible(false);
    setTimeout(() => {
      setShowDayAlert(false);
      localStorage.setItem('lastDayAlertShown', new Date().toDateString());
    }, 380);
  };

  const todayMotivation = MOTIVATIONAL_MESSAGES[COMPLETED_DAYS % MOTIVATIONAL_MESSAGES.length];

  const formatDateTime = () => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return { dayStr: day, dateStr: `${date} ${month}`, timeStr: `${hours}:${minutes}`, secondsStr: seconds, ampm };
  };

  const { dayStr, dateStr, timeStr, secondsStr, ampm } = formatDateTime();

  const loadTodos = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.from('ToDo').select('*').eq('active', true)
        .gte('created_at', `${todayStr}T00:00:00`).lte('created_at', `${todayStr}T23:59:59`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTodos(data || []);
    } catch (error) { console.error("Error loading todos:", error); }
    setLoading(false);
  };

  const handleAddTodo = async () => {
    const trimmedTodo = newTodo.trim();
    if (!trimmedTodo) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const duplicate = todos.some(t => t.title === trimmedTodo && t.active && t.created_at.startsWith(todayStr));
    if (duplicate) { alert("This task already exists today!"); return; }
    setAddingTodo(true);
    try {
      const { data, error } = await supabase.from('ToDo').insert([{ title: trimmedTodo, completed: false, active: true }]).select();
      if (error) throw error;
      if (data && data.length > 0) { setTodos([data[0], ...todos]); setNewTodo(''); }
    } catch (error) { console.error("Error adding todo:", error); alert("Failed to add todo. Please try again."); }
    setTimeout(() => setAddingTodo(false), 300);
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleAddTodo(); };

  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const { error } = await supabase.from('ToDo').update({ completed: !todo.completed }).eq('id', id);
      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    } catch (error) { console.error("Error toggling todo:", error); alert("Failed to update todo."); }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('ToDo').update({ active: false }).eq('id', id);
      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) { console.error("Error deleting todo:", error); alert("Failed to delete todo."); }
  };

  const startEdit = (id, text) => { setEditingId(id); setEditText(text); };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const { error } = await supabase.from('ToDo').update({ title: editText.trim() }).eq('id', id);
      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, title: editText.trim() } : t));
      setEditingId(null); setEditText('');
    } catch (error) { console.error("Error editing todo:", error); alert("Failed to edit todo."); }
  };

  const cancelEdit = () => { setEditingId(null); setEditText(''); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setProfileImage(reader.result); localStorage.setItem('profileImage', reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setProfileImage(imageUrl.trim()); localStorage.setItem('profileImage', imageUrl.trim());
      setImageUrl(''); setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => { setProfileImage(null); localStorage.removeItem('profileImage'); };

  const handleRegenerate = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: existingTodos, error: fetchError } = await supabase.from('ToDo').select('title')
        .gte('created_at', `${todayStr}T00:00:00`).lte('created_at', `${todayStr}T23:59:59`).eq('active', true);
      if (fetchError) throw fetchError;
      const existingTitles = existingTodos.map(t => t.title);
      const newTodosData = defaultTodos.filter(title => !existingTitles.includes(title))
        .map(title => ({ title, completed: false, active: true }));
      if (newTodosData.length === 0) { alert('All default tasks already exist today!'); return; }
      const { data: insertedData, error: insertError } = await supabase.from('ToDo').insert(newTodosData).select();
      if (insertError) throw insertError;
      setTodos(prev => [...insertedData, ...prev]);
    } catch (error) { console.error('Error regenerating todos:', error); alert('Failed to regenerate todos.'); }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const canRegenerate = lastRegenerate !== new Date().toDateString();
  const completionPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;
  const progressPercent = Math.round((COMPLETED_DAYS / TOTAL_DAYS) * 100);
  const remainingPercent = Math.round((REMAINING_DAYS / TOTAL_DAYS) * 100);
  const confettiColors = ['#f97316','#ec4899','#8b5cf6','#34d399','#f59e0b','#06b6d4','#ef4444','#a3e635'];

  return (
    <div>
      <Navbar />

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,.3)} 50%{box-shadow:0 0 40px rgba(59,130,246,.6)} }
        @keyframes slide-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rotate-gradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes countdown-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        @keyframes backdrop-in { from{opacity:0} to{opacity:1} }
        @keyframes modal-pop-in { 0%{opacity:0;transform:scale(.6) translateY(60px)} 65%{transform:scale(1.05) translateY(-6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes modal-pop-out { from{opacity:1;transform:scale(1) translateY(0)} to{opacity:0;transform:scale(.82) translateY(40px)} }
        @keyframes num-bounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-14px)} 60%{transform:translateY(-7px)} }
        @keyframes ring-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes confetti { 0%{transform:translateY(-8px) rotate(0deg);opacity:1} 100%{transform:translateY(65px) rotate(720deg);opacity:0} }
        .float-animation{animation:float 3s ease-in-out infinite}
        .pulse-glow{animation:pulse-glow 2s ease-in-out infinite}
        .slide-in{animation:slide-in .3s ease-out forwards}
        .gradient-animate{background-size:200% 200%;animation:rotate-gradient 3s ease infinite}
        .glass-card{background:rgba(255,255,255,.7);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.3)}
        .progress-ring{transition:stroke-dashoffset .5s ease}
        .countdown-pulse{animation:countdown-pulse 2s ease-in-out infinite}
        .m2h-card{background:linear-gradient(135deg,rgba(15,23,42,.92),rgba(30,41,59,.95));border:1px solid rgba(248,113,113,.3);backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(239,68,68,.15),0 0 0 1px rgba(255,255,255,.05)}
        .freedom-number{background:linear-gradient(135deg,#f97316,#ef4444,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .days-done-number{background:linear-gradient(135deg,#34d399,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .bd-in{animation:backdrop-in .3s ease forwards}
        .bd-out{animation:backdrop-in .35s ease reverse forwards}
        .modal-in{animation:modal-pop-in .55s cubic-bezier(.34,1.56,.64,1) forwards}
        .modal-out{animation:modal-pop-out .35s ease forwards}
        .num-bounce{animation:num-bounce 1.5s ease infinite}
        .ring-spin{animation:ring-spin 5s linear infinite}
        .confetti-dot{animation:confetti 1.8s ease-in infinite}
      `}</style>

      {/* ── DAY ALERT MODAL ── */}
      {showDayAlert && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${alertVisible ? 'bd-in' : 'bd-out'}`}
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={closeDayAlert}
        >
          <div
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden ${alertVisible ? 'modal-in' : 'modal-out'}`}
            style={{
              background: 'linear-gradient(160deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%)',
              border: '1px solid rgba(167,139,250,.3)',
              boxShadow: '0 30px 70px rgba(0,0,0,.55),0 0 90px rgba(139,92,246,.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {confettiColors.map((color, i) => (
              <div key={i} className="confetti-dot absolute w-2 h-2 rounded-full pointer-events-none"
                style={{ left: `${8 + i * 12}%`, top: 0, animationDelay: `${i * 0.2}s`, background: color }} />
            ))}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse,rgba(139,92,246,.28) 0%,transparent 70%)', filter: 'blur(18px)' }} />

            <div className="relative z-10 p-7 text-center">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="ring-spin absolute inset-0 rounded-full border-2 border-dashed border-purple-400/50" />
                <div className="absolute inset-2 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                  <Flame size={30} className="text-white" />
                </div>
              </div>

              <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-3">Good Morning! 🌅</p>

              <div className="num-bounce mb-1">
                <span className="text-8xl font-black leading-none"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {COMPLETED_DAYS}
                </span>
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">
                of <span className="text-white font-bold">{TOTAL_DAYS}</span> days completed at M2H Infotech
              </p>

              <div className="w-full h-2.5 bg-white/10 rounded-full my-5 overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg,#8b5cf6,#ec4899,#f97316)', transition: 'width 1.2s ease' }} />
              </div>

              <div className="flex justify-center gap-5 mb-5">
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-400">{progressPercent}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Done</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: '#f97316' }}>{REMAINING_DAYS}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Days Left</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-black text-purple-400">{TOTAL_DAYS}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total</p>
                </div>
              </div>

              <div className="rounded-2xl px-4 py-3 mb-6"
                style={{ background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.25)' }}>
                <p className="text-sm text-purple-200 leading-relaxed italic">{todayMotivation}</p>
              </div>

              <button onClick={closeDayAlert}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all transform hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 8px 24px rgba(124,58,237,.4)' }}>
                Lets Crush Day {COMPLETED_DAYS + 1}!
              </button>
              <p className="text-xs text-gray-600 mt-3">Tap anywhere to close</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 py-8 px-4">
        <div className="max-w-md mx-auto">

          {/* M2H COUNTDOWN */}
          <div className="m2h-card rounded-3xl p-6 mb-6 relative overflow-hidden slide-in">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Building2 size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">Time Remaining</p>
                <h2 className="text-base font-bold text-white leading-tight">Leave M2H Infotech</h2>
              </div>
              <div className="ml-auto"><Flag size={18} className="text-orange-400" /></div>
            </div>
            <div className="flex items-end justify-between mb-5">
              <div className="countdown-pulse">
                <div className="freedom-number text-7xl font-black leading-none tracking-tighter">{REMAINING_DAYS}</div>
                <p className="text-gray-400 text-sm font-medium mt-1">days to freedom</p>
              </div>
              <div className="text-right">
                <div className="days-done-number text-4xl font-black leading-none">{COMPLETED_DAYS}</div>
                <p className="text-gray-500 text-xs mt-1">days done</p>
                <div className="text-gray-600 text-xs mt-2 font-medium">of {TOTAL_DAYS} days</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-medium">Journey Progress</span>
                <span className="text-xs font-bold text-emerald-400">{progressPercent}% complete</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg,#10b981,#34d399)' }}></div>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-emerald-500">Start</span>
                <span className="text-xs text-orange-400">{remainingPercent}% left</span>
                <span className="text-xs text-red-400">Freedom</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                {COMPLETED_DAYS} days survived
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-semibold">
                {REMAINING_DAYS} days to go
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden slide-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-sky-300/10 to-indigo-400/10 gradient-animate opacity-50"></div>
            <div className="relative z-10">
              {profileImage ? (
                <div className="relative inline-block w-full">
                  <div className="w-40 h-40 mx-auto mb-4 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img src={profileImage} alt="Profile"
                      className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-2xl transform transition-transform group-hover:scale-105"
                      onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e7ff" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EImage Error%3C/text%3E%3C/svg%3E'; }}
                    />
                  </div>
                  <button onClick={handleRemoveImage}
                    className="absolute top-0 right-1/2 translate-x-20 -translate-y-2 w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-700 transition-all transform hover:scale-110 shadow-lg">
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
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform group-hover:scale-105 text-center shadow-lg">
                    <span className="text-sm font-semibold">Upload Image</span>
                  </div>
                </label>
                {!showUrlInput ? (
                  <button onClick={() => setShowUrlInput(true)}
                    className="px-6 py-3 bg-white/80 border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-md">
                    <span className="text-sm font-semibold">Use Image URL</span>
                  </button>
                ) : (
                  <div className="flex gap-2 slide-in">
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()} placeholder="Enter image URL..."
                      className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white/80" />
                    <button onClick={handleUrlSubmit} className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"><Check size={20} /></button>
                    <button onClick={() => { setShowUrlInput(false); setImageUrl(''); }} className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"><X size={20} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clock */}
          <div className="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden slide-in">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 via-blue-300/10 to-sky-400/10 gradient-animate opacity-50"></div>
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="text-blue-500" size={24} />
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{dayStr}</span>
              </div>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{timeStr}</span>
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
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{completionPercentage}%</p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-blue-100" />
                    <circle cx="48" cy="48" r="40" stroke="url(#grad2)" strokeWidth="8" fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                      className="progress-ring" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
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
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Today's Tasks</h3>
            </div>
            <button onClick={handleRegenerate} disabled={!canRegenerate}
              className={`p-3 rounded-xl transition-all transform hover:scale-110 ${canRegenerate ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg pulse-glow' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Add Todo */}
          <div className="mb-6 slide-in">
            <div className="relative glass-card rounded-2xl overflow-hidden">
              <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={handleKeyPress}
                placeholder="Add a new task..."
                className="w-full px-6 py-5 pr-16 bg-transparent border-2 border-transparent focus:border-blue-300 focus:outline-none text-gray-700 placeholder-gray-400 transition-all" />
              <button onClick={handleAddTodo} disabled={addingTodo}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-110 shadow-lg disabled:opacity-50">
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
                        <input value={editText} onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 px-4 py-2.5 border-2 border-blue-300 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white" autoFocus />
                        <button onClick={() => handleEdit(todo.id)} className="p-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-white transition-all transform hover:scale-110 shadow-md"><Check size={18} /></button>
                        <button onClick={cancelEdit} className="p-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-all transform hover:scale-110 shadow-md"><X size={18} /></button>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-3 py-3 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all">
                        <button onClick={() => handleToggle(todo.id)}
                          className={`relative flex-shrink-0 w-7 h-7 rounded-lg border-2 transition-all transform hover:scale-110 ${todo.completed ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 shadow-lg' : 'border-gray-300 hover:border-blue-400 bg-white shadow-sm'}`}>
                          {todo.completed && <Check size={18} className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />}
                        </button>
                        <span className={`flex-1 text-sm transition-all ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium group-hover:text-blue-600'}`}>
                          {todo.title}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(todo.id, todo.title)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-all transform hover:scale-110"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(todo.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-all transform hover:scale-110"><Trash2 size={16} /></button>
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