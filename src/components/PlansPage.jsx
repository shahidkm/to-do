import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Image as ImageIcon,
  CalendarDays,
  Tag,
  AlertCircle,
} from "lucide-react";
import Navbar from "./NavBar";

const supabaseUrl = "https://quufeiwzsgiuwkeyjjns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: 3,
    start_date: "",
    end_date: "",
    image_url: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setLoading(true);
    const { data } = await supabase
      .from("plans")
      .select(`
        *,
        plan_images (
          image_url,
          is_cover
        )
      `)
      .order("created_at", { ascending: false });

    setPlans(data || []);
    setLoading(false);
  }

  async function createPlan(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);

    const { data: plan, error } = await supabase
      .from("plans")
      .insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        priority: form.priority,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (form.image_url.trim()) {
      await supabase.from("plan_images").insert({
        plan_id: plan.id,
        image_url: form.image_url.trim(),
        is_cover: true,
      });
    }

    setForm({
      title: "",
      description: "",
      category: "",
      priority: 3,
      start_date: "",
      end_date: "",
      image_url: "",
    });

    setFormOpen(false);
    await fetchPlans();
    setLoading(false);
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      1: "bg-rose-100 text-rose-700 border-rose-200",
      2: "bg-amber-100 text-amber-700 border-amber-200",
      3: "bg-sky-100 text-sky-700 border-sky-200",
    };

    const labels = { 1: "High", 2: "Medium", 3: "Low" };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[priority] || styles[3]}`}
      >
        <AlertCircle size={12} className="mr-1" />
        {labels[priority] || "Low"}
      </span>
    );
  };

  const statusIcon = (status) => {
    if (status === "completed")
      return <CheckCircle2 className="text-emerald-500" size={20} />;
    if (status === "cancelled")
      return <XCircle className="text-rose-500" size={20} />;
    return <Clock className="text-sky-500" size={20} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header + Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              My Plans
            </h1>
            <p className="mt-2 text-slate-600">
              Organize your goals and track progress
            </p>
          </div>

          <button
            onClick={() => setFormOpen(!formOpen)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-sky-300/40 transition-all active:scale-95"
          >
            <Plus size={18} />
            New Plan
          </button>
        </div>

        {/* Create Plan Form - Modern floating label style */}
        {formOpen && (
          <div className="mb-12 bg-white/70 backdrop-blur-xl rounded-2xl p-7 shadow-2xl border border-white/40">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <CalendarDays className="text-sky-500" size={28} />
              Create New Plan
            </h2>

            <form onSubmit={createPlan} className="grid gap-6 md:grid-cols-2">
              {/* Title */}
              <div className="relative">
                <input
                  id="title"
                  type="text"
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <label
                  htmlFor="title"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600 pointer-events-none"
                >
                  Plan Title *
                </label>
              </div>

              {/* Category */}
              <div className="relative">
                <input
                  id="category"
                  type="text"
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <label
                  htmlFor="category"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600 pointer-events-none"
                >
                  Category
                </label>
              </div>

              {/* Description */}
              <div className="relative md:col-span-2">
                <textarea
                  id="description"
                  placeholder=" "
                  rows={3}
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <label
                  htmlFor="description"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600 pointer-events-none"
                >
                  Description
                </label>
              </div>

              {/* Priority */}
              <div className="relative">
                <select
                  id="priority"
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all appearance-none"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                >
                  <option value={1}>High Priority</option>
                  <option value={2}>Medium Priority</option>
                  <option value={3}>Low Priority</option>
                </select>
                <label
                  htmlFor="priority"
                  className="absolute left-4 top-2 text-xs text-sky-600 transition-all pointer-events-none"
                >
                  Priority
                </label>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="start_date"
                    type="date"
                    className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                  <label
                    htmlFor="start_date"
                    className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600 pointer-events-none"
                  >
                    Start Date
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="end_date"
                    type="date"
                    className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                  <label
                    htmlFor="end_date"
                    className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600 pointer-events-none"
                  >
                    End Date
                  </label>
                </div>
              </div>

              {/* Image URL */}
              <div className="relative md:col-span-2">
                <input
                  id="image_url"
                  type="url"
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-white border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
                <label
                  htmlFor="image_url"
                  className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-600 pointer-events-none"
                >
                  Cover Image URL (optional)
                </label>
              </div>

              <div className="flex gap-4 mt-4 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading || !form.title.trim()}
                  className="flex-1 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-sky-300/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Plan"}
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

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-sky-50 rounded-full mb-6">
              <CalendarDays className="text-sky-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">
              No plans yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Start organizing your goals by creating your first plan
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-sky-600 transition-all"
            >
              <Plus size={18} />
              Create First Plan
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const cover = plan.plan_images?.find((i) => i.is_cover);

              return (
                <div
                  key={plan.id}
                  className={`
                    group relative
                    bg-white/70 backdrop-blur-xl
                    rounded-2xl overflow-hidden
                    border border-white/40
                    shadow-xl shadow-slate-200/20
                    transition-all duration-500
                    hover:-translate-y-2 hover:shadow-2xl
                  `}
                >
                  {/* Image / Placeholder */}
                  {cover ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={cover.image_url}
                        alt={plan.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
                      <ImageIcon className="text-sky-300" size={48} strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-slate-800 line-clamp-2">
                        {plan.title}
                      </h3>
                      <div className="flex-shrink-0 mt-1">
                        {statusIcon(plan.status)}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-3 min-h-[3.75rem]">
                      {plan.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {plan.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          <Tag size={12} className="mr-1" />
                          {plan.category}
                        </span>
                      )}
                      {getPriorityBadge(plan.priority)}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-100">
                      <CalendarDays size={14} />
                      <span>
                        {plan.start_date ? new Date(plan.start_date).toLocaleDateString() : "—"}
                        {" → "}
                        {plan.end_date ? new Date(plan.end_date).toLocaleDateString() : "—"}
                      </span>
                    </div>
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