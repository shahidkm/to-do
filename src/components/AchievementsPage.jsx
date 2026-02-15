import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Sparkles,
  Zap,
  Crown,
  Clock,
  TrendingDown,
  X,
} from "lucide-react";
import Navbar from "./NavBar";

const supabaseUrl = "https://quufeiwzsgiuwkeyjjns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    target_value: "",
    start_date: new Date().toISOString().split("T")[0],
    target_date: "",
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    setLoading(true);
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at", { ascending: false });

    const enrichedData = (data || []).map((achievement) => ({
      ...achievement,
      ...calculateProgress(achievement),
    }));

    setAchievements(enrichedData);
    setLoading(false);
  }

  function calculateProgress(achievement) {
    if (!achievement.start_date || !achievement.target_date) {
      return {
        daysPassed: 0,
        totalDays: 0,
        expectedProgress: 0,
        isOnTrack: true,
        daysRemaining: 0,
        autoCurrentValue: achievement.current_value,
      };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const start = new Date(achievement.start_date);
    start.setHours(0, 0, 0, 0);
    
    const target = new Date(achievement.target_date);
    target.setHours(0, 0, 0, 0);

    const totalDays = Math.max(
      1,
      Math.ceil((target - start) / (1000 * 60 * 60 * 24))
    );
    
    const daysPassed = Math.max(
      0,
      Math.min(totalDays, Math.ceil((now - start) / (1000 * 60 * 60 * 24)))
    );
    
    const daysRemaining = Math.max(
      0,
      Math.ceil((target - now) / (1000 * 60 * 60 * 24))
    );

    const autoCurrentValue = Math.min(
      achievement.target_value,
      Math.floor((achievement.target_value / totalDays) * daysPassed)
    );

    const expectedProgress = autoCurrentValue;

    const actualPercentage =
      (autoCurrentValue / achievement.target_value) * 100;
    const expectedPercentage = (expectedProgress / achievement.target_value) * 100;

    return {
      daysPassed,
      totalDays,
      daysRemaining,
      expectedProgress,
      isOnTrack: actualPercentage >= expectedPercentage - 5,
      dailyTarget: (achievement.target_value / totalDays).toFixed(1),
      autoCurrentValue,
    };
  }

  async function createAchievement(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.target_value || !form.start_date || !form.target_date) {
      alert("Please fill in all required fields including dates");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("achievements").insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_value: Number(form.target_value),
      current_value: 0,
      start_date: form.start_date,
      target_date: form.target_date,
    });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setForm({
      title: "",
      description: "",
      target_value: "",
      start_date: new Date().toISOString().split("T")[0],
      target_date: "",
    });

    setFormOpen(false);
    await fetchAchievements();
    setLoading(false);
  }

  const getStatusBadge = (achievement) => {
    const isCompleted = achievement.autoCurrentValue >= achievement.target_value;
    
    if (isCompleted) {
      return (
        <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] sm:text-xs font-bold shadow-lg">
          <Crown size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline">Completed</span>
          <span className="xs:hidden">Done</span>
        </div>
      );
    }

    if (achievement.isOnTrack) {
      return (
        <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] sm:text-xs font-bold shadow-lg">
          <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>On Track</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-500 text-white text-[10px] sm:text-xs font-bold shadow-lg">
        <TrendingDown size={12} className="sm:w-3.5 sm:h-3.5" />
        <span>Behind</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 md:mb-12 gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl">
                <Trophy className="text-white w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Achievements
                </h1>
                <p className="text-slate-600 mt-0.5 sm:mt-1 text-sm sm:text-base md:text-lg">
                  Track goals & celebrate wins
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setFormOpen(!formOpen)}
            className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Stats Overview */}
        {achievements.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-medium mb-0.5 sm:mb-1">Total Goals</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{achievements.length}</p>
                </div>
                <div className="hidden sm:flex p-2 md:p-3 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg md:rounded-xl self-start">
                  <Target className="text-cyan-600 w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-medium mb-0.5 sm:mb-1">Completed</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-600">
                    {achievements.filter(a => a.autoCurrentValue >= a.target_value).length}
                  </p>
                </div>
                <div className="hidden sm:flex p-2 md:p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg md:rounded-xl self-start">
                  <Crown className="text-emerald-600 w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-medium mb-0.5 sm:mb-1">In Progress</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-blue-600">
                    {achievements.filter(a => a.autoCurrentValue < a.target_value).length}
                  </p>
                </div>
                <div className="hidden sm:flex p-2 md:p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg md:rounded-xl self-start">
                  <TrendingUp className="text-blue-600 w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Form - Mobile Optimized */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                    <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Create New Goal
                  </h2>
                </div>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={createAchievement} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g., Read 50 books this year"
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-sm sm:text-base"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                {/* Target Value */}
                <div>
                  <label htmlFor="target_value" className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Value *
                  </label>
                  <input
                    id="target_value"
                    type="number"
                    min="1"
                    placeholder="e.g., 50"
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-sm sm:text-base"
                    value={form.target_value}
                    onChange={(e) =>
                      setForm({ ...form, target_value: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Add more details about your goal..."
                    rows={3}
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all resize-none text-sm sm:text-base"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      id="start_date"
                      type="date"
                      className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-sm sm:text-base"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="target_date" className="block text-sm font-semibold text-slate-700 mb-2">
                      Target Date *
                    </label>
                    <input
                      id="target_date"
                      type="date"
                      className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-sm sm:text-base"
                      value={form.target_date}
                      onChange={(e) =>
                        setForm({ ...form, target_date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.title.trim() || !form.target_value}
                    className="flex-1 py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
                  >
                    {loading ? "Creating..." : "Create Goal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Achievements Grid */}
        {loading ? (
          <div className="flex justify-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20 px-4">
            <div className="inline-flex p-6 sm:p-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full mb-4 sm:mb-6">
              <Trophy className="text-cyan-600 w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">
              No goals yet
            </h3>
            <p className="text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg">
              Create your first goal and start tracking your progress
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all hover:scale-105 text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => {
              const percentage =
                (achievement.autoCurrentValue / achievement.target_value) * 100;
              const isCompleted = percentage >= 100;

              return (
                <div
                  key={achievement.id}
                  className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-cyan-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 line-clamp-2 flex-1">
                        {achievement.title}
                      </h3>
                      {getStatusBadge(achievement)}
                    </div>

                    {achievement.description && (
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">
                        {achievement.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Section */}
                  <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                    {/* Circular Progress */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="9"
                            className="text-slate-100 sm:hidden"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-slate-100 hidden sm:block"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            fill="none"
                            stroke={isCompleted ? "url(#gradientComplete)" : "url(#gradientProgress)"}
                            strokeWidth="9"
                            strokeDasharray={`${(percentage / 100) * 301.593} 301.593`}
                            className="transition-all duration-1000 sm:hidden"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke={isCompleted ? "url(#gradientComplete)" : "url(#gradientProgress)"}
                            strokeWidth="10"
                            strokeDasharray={`${(percentage / 100) * 351.858} 351.858`}
                            className="transition-all duration-1000 hidden sm:block"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient
                              id="gradientComplete"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                            <linearGradient
                              id="gradientProgress"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-2xl sm:text-3xl font-black text-slate-900">
                            {Math.round(percentage)}%
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-500 font-semibold">
                            Complete
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-cyan-100">
                        <div className="text-base sm:text-lg font-bold text-cyan-600">
                          {achievement.autoCurrentValue}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-600 font-semibold">
                          Current
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-orange-100">
                        <div className="text-base sm:text-lg font-bold text-orange-600">
                          {achievement.target_value - achievement.autoCurrentValue}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-600 font-semibold">
                          Left
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-emerald-100">
                        <div className="text-base sm:text-lg font-bold text-emerald-600">
                          {achievement.target_value}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-600 font-semibold">
                          Target
                        </div>
                      </div>
                    </div>

                    {/* Daily Progress Info */}
                    {achievement.dailyTarget && (
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                            Daily Target
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-cyan-600">
                            {achievement.dailyTarget} / day
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock size={10} className="sm:w-3 sm:h-3" />
                            <span>{achievement.daysPassed} days in</span>
                          </div>
                          <span>{achievement.daysRemaining} days left</span>
                        </div>
                      </div>
                    )}

                    {/* Auto Progress Indicator */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                        <Zap size={14} className="sm:w-[18px] sm:h-[18px] text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          Auto-Tracking
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-600">
                          Updates daily
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {achievement.start_date && achievement.target_date && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">
                          {new Date(achievement.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" → "}
                          {new Date(achievement.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}