import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  ChevronDown,
  ChevronUp,
  Minus,
  Check,
  Flame,
  Award,
  Zap,
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
  const [expandedCard, setExpandedCard] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    target_value: "",
    current_value: 0,
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

    setAchievements(data || []);
    setLoading(false);
  }

  async function createAchievement(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.target_value) return;

    setLoading(true);

    const { error } = await supabase.from("achievements").insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_value: Number(form.target_value),
      current_value: Number(form.current_value) || 0,
      start_date: form.start_date || null,
      target_date: form.target_date || null,
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
      current_value: 0,
      start_date: new Date().toISOString().split("T")[0],
      target_date: "",
    });

    setFormOpen(false);
    await fetchAchievements();
    setLoading(false);
  }

  async function updateProgress(id, newValue, targetValue) {
    const clampedValue = Math.max(0, Math.min(newValue, targetValue));

    await supabase
      .from("achievements")
      .update({ current_value: clampedValue })
      .eq("id", id);

    await fetchAchievements();
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "from-emerald-500 to-green-600";
    if (percentage >= 75) return "from-sky-500 to-blue-600";
    if (percentage >= 50) return "from-amber-500 to-orange-600";
    return "from-rose-500 to-pink-600";
  };

  const getProgressIcon = (percentage) => {
    if (percentage >= 100)
      return <Trophy className="text-emerald-500" size={24} />;
    if (percentage >= 75) return <Award className="text-sky-500" size={24} />;
    if (percentage >= 50) return <Flame className="text-amber-500" size={24} />;
    return <Zap className="text-rose-500" size={24} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              My Achievements
            </h1>
            <p className="mt-2 text-slate-600">
              Track your progress and celebrate milestones
            </p>
          </div>

          <button
            onClick={() => setFormOpen(!formOpen)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-purple-300/40 transition-all active:scale-95"
          >
            <Plus size={18} />
            New Achievement
          </button>
        </div>

        {/* Create Form */}
        {formOpen && (
          <div className="mb-12 bg-white/70 backdrop-blur-xl rounded-2xl p-7 shadow-2xl border border-white/40">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Trophy className="text-purple-500" size={28} />
              Create New Achievement
            </h2>

            <form onSubmit={createAchievement} className="grid gap-6 md:grid-cols-2">
              {/* Title */}
              <div className="relative">
                <input
                  id="title"
                  type="text"
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <label
                  htmlFor="title"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600 pointer-events-none"
                >
                  Achievement Title *
                </label>
              </div>

              {/* Target Value */}
              <div className="relative">
                <input
                  id="target_value"
                  type="number"
                  min="1"
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  value={form.target_value}
                  onChange={(e) =>
                    setForm({ ...form, target_value: e.target.value })
                  }
                  required
                />
                <label
                  htmlFor="target_value"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600 pointer-events-none"
                >
                  Target Value *
                </label>
              </div>

              {/* Description */}
              <div className="relative md:col-span-2">
                <textarea
                  id="description"
                  placeholder=" "
                  rows={3}
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                <label
                  htmlFor="description"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600 pointer-events-none"
                >
                  Description
                </label>
              </div>

              {/* Current Value */}
              <div className="relative">
                <input
                  id="current_value"
                  type="number"
                  min="0"
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  value={form.current_value}
                  onChange={(e) =>
                    setForm({ ...form, current_value: e.target.value })
                  }
                />
                <label
                  htmlFor="current_value"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600 pointer-events-none"
                >
                  Starting Value
                </label>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="start_date"
                    type="date"
                    className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                  <label
                    htmlFor="start_date"
                    className="absolute left-4 top-2 text-xs text-purple-600 transition-all pointer-events-none"
                  >
                    Start Date
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="target_date"
                    type="date"
                    className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    value={form.target_date}
                    onChange={(e) =>
                      setForm({ ...form, target_date: e.target.value })
                    }
                  />
                  <label
                    htmlFor="target_date"
                    className="absolute left-4 top-2 text-xs text-purple-600 transition-all pointer-events-none"
                  >
                    Target Date
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-4 md:col-span-2">
                <button
                  type="submit"
                  disabled={
                    loading || !form.title.trim() || !form.target_value
                  }
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-purple-300/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Achievement"}
                </button>

                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-8 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Achievements Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-purple-50 rounded-full mb-6">
              <Trophy className="text-purple-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">
              No achievements yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Start tracking your progress by creating your first achievement
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-purple-600 transition-all"
            >
              <Plus size={18} />
              Create First Achievement
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => {
              const percentage =
                (achievement.current_value / achievement.target_value) * 100;
              const isExpanded = expandedCard === achievement.id;

              return (
                <div
                  key={achievement.id}
                  className={`
                    group relative
                    bg-white/70 backdrop-blur-xl
                    rounded-2xl overflow-hidden
                    border border-white/40
                    shadow-xl shadow-slate-200/20
                    transition-all duration-500
                    hover:shadow-2xl
                    ${isExpanded ? "ring-2 ring-purple-400" : ""}
                  `}
                >
                  {/* Progress Header */}
                  <div
                    className={`relative h-32 bg-gradient-to-r ${getProgressColor(percentage)} p-6 flex items-center justify-between text-white`}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium opacity-90 mb-1">
                        Progress
                      </div>
                      <div className="text-4xl font-bold">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      {getProgressIcon(percentage)}
                    </div>

                    {achievement.is_completed && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <Check size={14} />
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {achievement.title}
                      </h3>
                      {achievement.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {achievement.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">
                          Current
                        </div>
                        <div className="text-lg font-bold text-slate-800">
                          {achievement.current_value}
                        </div>
                      </div>
                      <div className="text-center border-x border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">
                          Remaining
                        </div>
                        <div className="text-lg font-bold text-amber-600">
                          {achievement.remaining_value}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">
                          Target
                        </div>
                        <div className="text-lg font-bold text-emerald-600">
                          {achievement.target_value}
                        </div>
                      </div>
                    </div>

                    {/* Counter Controls - Dropdown */}
                    <div>
                      <button
                        onClick={() =>
                          setExpandedCard(
                            isExpanded ? null : achievement.id
                          )
                        }
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all"
                      >
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <TrendingUp size={16} />
                          Update Progress
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-slate-600" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-600" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 bg-slate-50 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-300">
                          {/* Number Input */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateProgress(
                                  achievement.id,
                                  achievement.current_value - 1,
                                  achievement.target_value
                                )
                              }
                              disabled={achievement.current_value <= 0}
                              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus size={18} className="text-slate-600" />
                            </button>

                            <input
                              type="number"
                              value={achievement.current_value}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val >= 0 && val <= achievement.target_value) {
                                  updateProgress(
                                    achievement.id,
                                    val,
                                    achievement.target_value
                                  );
                                }
                              }}
                              className="flex-1 px-4 py-2 text-center text-lg font-semibold bg-white border border-slate-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                            />

                            <button
                              onClick={() =>
                                updateProgress(
                                  achievement.id,
                                  achievement.current_value + 1,
                                  achievement.target_value
                                )
                              }
                              disabled={
                                achievement.current_value >=
                                achievement.target_value
                              }
                              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus size={18} className="text-slate-600" />
                            </button>
                          </div>

                          {/* Quick Add Buttons */}
                          <div className="grid grid-cols-3 gap-2">
                            {[5, 10, 25].map((increment) => (
                              <button
                                key={increment}
                                onClick={() =>
                                  updateProgress(
                                    achievement.id,
                                    achievement.current_value + increment,
                                    achievement.target_value
                                  )
                                }
                                disabled={
                                  achievement.current_value >=
                                  achievement.target_value
                                }
                                className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                +{increment}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    {(achievement.start_date || achievement.target_date) && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                        <Calendar size={14} />
                        <span>
                          {achievement.start_date
                            ? new Date(
                                achievement.start_date
                              ).toLocaleDateString()
                            : "—"}
                          {" → "}
                          {achievement.target_date
                            ? new Date(
                                achievement.target_date
                              ).toLocaleDateString()
                            : "—"}
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