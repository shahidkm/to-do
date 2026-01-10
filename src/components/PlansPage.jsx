import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  ImageIcon,
} from "lucide-react";

const supabaseUrl = "https://quufeiwzsgiuwkeyjjns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

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
  }

  async function createPlan(e) {
    e.preventDefault();
    if (!form.title) return;

    setLoading(true);

    const { data: plan, error } = await supabase
      .from("plans")
      .insert({
        title: form.title,
        description: form.description,
        category: form.category,
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

    if (form.image_url) {
      await supabase.from("plan_images").insert({
        plan_id: plan.id,
        image_url: form.image_url,
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

    await fetchPlans();
    setLoading(false);
  }

  function statusIcon(status) {
    if (status === "completed")
      return <CheckCircle className="text-green-500" size={18} />;
    if (status === "cancelled")
      return <XCircle className="text-red-500" size={18} />;
    return <Clock className="text-sky-500" size={18} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] p-6">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Create Plan Form */}
        <form
          onSubmit={createPlan}
          className="rounded-2xl bg-white p-6 shadow"
        >
          <h2 className="mb-4 text-xl font-semibold text-sky-700">
            Create New Plan
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Title *"
              className="input"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <input
              placeholder="Category"
              className="input"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              className="input md:col-span-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <select
              className="input"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: Number(e.target.value) })
              }
            >
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>

            <input
              type="date"
              className="input"
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
            />

            <input
              type="date"
              className="input"
              value={form.end_date}
              onChange={(e) =>
                setForm({ ...form, end_date: e.target.value })
              }
            />

            {/* IMAGE URL INPUT */}
            <input
              type="url"
              placeholder="Cover image URL (optional)"
              className="input md:col-span-2"
              value={form.image_url}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
            />
          </div>

          <button
            disabled={loading}
            className="mt-6 flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-white hover:bg-sky-600 disabled:opacity-60"
          >
            <Plus size={18} />
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </form>

        {/* Plans Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const cover = plan.plan_images?.find((i) => i.is_cover);

            return (
              <div
                key={plan.id}
                className="overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg transition"
              >
                {cover ? (
                  <img
                    src={cover.image_url}
                    alt={plan.title}
                    className=" w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-sky-100">
                    <ImageIcon className="text-sky-400" size={32} />
                  </div>
                )}

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {plan.title}
                    </h3>
                    {statusIcon(plan.status)}
                  </div>

                  <p className="text-sm text-gray-500">
                    {plan.description || "No description"}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">
                      {plan.category || "General"}
                    </span>

                    <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">
                      Priority {plan.priority}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    {plan.start_date || "—"} →{" "}
                    {plan.end_date || "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
