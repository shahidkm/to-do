import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  Users,
  Star,
  Phone,
  Edit2,
  X,
  Search,
  Heart,
  Sparkles,
  UserPlus,
  Crown,
  Award,
  Zap,
} from "lucide-react";
import Navbar from "./NavBar";

const supabaseUrl = "https://quufeiwzsgiuwkeyjjns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PRIORITY_LEVELS = [
  {
    level: 1,
    label: "Best Friend",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    description: "Your closest companions",
  },
  {
    level: 2,
    label: "Close Friend",
    icon: Heart,
    color: "from-rose-500 to-red-500",
    bgColor: "from-rose-50 to-red-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    description: "Very important people",
  },
  {
    level: 3,
    label: "Good Friend",
    icon: Star,
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    description: "Regular hangout buddies",
  },
  {
    level: 4,
    label: "Friend",
    icon: Award,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    description: "Friends you see occasionally",
  },
  {
    level: 5,
    label: "Acquaintance",
    icon: Zap,
    color: "from-slate-500 to-gray-500",
    bgColor: "from-slate-50 to-gray-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    description: "People you know",
  },
];

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    priority_level: 3,
    image_url: "",
  });

  useEffect(() => {
    fetchFriends();
  }, []);

  async function fetchFriends() {
    setLoading(true);
    const { data } = await supabase
      .from("friends")
      .select("*")
      .order("priority_level", { ascending: true })
      .order("name", { ascending: true });

    setFriends(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Please enter a name");
      return;
    }

    setLoading(true);

    const friendData = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      priority_level: Number(form.priority_level),
      image_url: form.image_url.trim() || null,
    };

    let error;
    if (editingFriend) {
      ({ error } = await supabase
        .from("friends")
        .update(friendData)
        .eq("id", editingFriend.id));
    } else {
      ({ error } = await supabase.from("friends").insert(friendData));
    }

    if (error) {
      console.error(error);
      alert("Error saving friend");
      setLoading(false);
      return;
    }

    resetForm();
    await fetchFriends();
    setLoading(false);
  }



  function editFriend(friend) {
    setEditingFriend(friend);
    setForm({
      name: friend.name,
      phone: friend.phone || "",
      priority_level: friend.priority_level,
      image_url: friend.image_url || "",
    });
    setFormOpen(true);
  }

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      priority_level: 3,
      image_url: "",
    });
    setEditingFriend(null);
    setFormOpen(false);
  }

  const getPriorityInfo = (level) => {
    return PRIORITY_LEVELS.find((p) => p.level === level) || PRIORITY_LEVELS[2];
  };

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriority === null || friend.priority_level === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const groupedFriends = PRIORITY_LEVELS.reduce((acc, priority) => {
    acc[priority.level] = filteredFriends.filter(
      (f) => f.priority_level === priority.level
    );
    return acc;
  }, {});

  const stats = {
    total: friends.length,
    byPriority: PRIORITY_LEVELS.map((p) => ({
      ...p,
      count: friends.filter((f) => f.priority_level === p.level).length,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 md:mb-12 gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl">
                <Users className="text-white w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  My Friends
                </h1>
                <p className="text-slate-600 mt-0.5 sm:mt-1 text-sm sm:text-base md:text-lg">
                  Manage your circle & priorities
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <UserPlus size={18} className="sm:w-5 sm:h-5" />
            <span>Add Friend</span>
          </button>
        </div>

        {/* Stats Overview */}
        {friends.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-slate-200 col-span-2 sm:col-span-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Total
                  </p>
                  <Users className="text-purple-500 w-4 h-4" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">
                  {stats.total}
                </p>
              </div>
            </div>

            {stats.byPriority.slice(0, 5).map((priority) => {
              const Icon = priority.icon;
              return (
                <div
                  key={priority.level}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-slate-200"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] sm:text-xs text-slate-600 font-medium truncate">
                        {priority.label}
                      </p>
                      <Icon className={`${priority.textColor} w-3 h-3 sm:w-4 sm:h-4`} />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900">
                      {priority.count}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search and Filter */}
        {friends.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-slate-200 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm sm:text-base"
                />
              </div>

              {/* Priority Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setSelectedPriority(null)}
                  className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                    selectedPriority === null
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {PRIORITY_LEVELS.map((priority) => {
                  const Icon = priority.icon;
                  return (
                    <button
                      key={priority.level}
                      onClick={() => setSelectedPriority(priority.level)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                        selectedPriority === priority.level
                          ? `bg-gradient-to-r ${priority.color} text-white shadow-lg`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{priority.label}</span>
                      <span className="sm:hidden">P{priority.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {editingFriend ? "Edit Friend" : "Add New Friend"}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm sm:text-base"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +1 234 567 8900"
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm sm:text-base"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label
                    htmlFor="image_url"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Profile Image URL
                  </label>
                  <input
                    id="image_url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm sm:text-base"
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                  />
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Priority Level *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRIORITY_LEVELS.map((priority) => {
                      const Icon = priority.icon;
                      const isSelected = form.priority_level === priority.level;
                      return (
                        <button
                          key={priority.level}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, priority_level: priority.level })
                          }
                          className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? `bg-gradient-to-br ${priority.bgColor} ${priority.borderColor} border-2 shadow-lg`
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? `bg-gradient-to-br ${priority.color}`
                                  : "bg-slate-100"
                              }`}
                            >
                              <Icon
                                className={`${
                                  isSelected ? "text-white" : "text-slate-400"
                                }`}
                                size={20}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4
                                  className={`font-bold text-sm sm:text-base ${
                                    isSelected
                                      ? priority.textColor
                                      : "text-slate-900"
                                  }`}
                                >
                                  {priority.label}
                                </h4>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <Star className="text-white" size={12} />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">
                                {priority.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.name.trim()}
                    className="flex-1 py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
                  >
                    {loading
                      ? "Saving..."
                      : editingFriend
                      ? "Update Friend"
                      : "Add Friend"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Friends List */}
        {loading && friends.length === 0 ? (
          <div className="flex justify-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20 px-4">
            <div className="inline-flex p-6 sm:p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4 sm:mb-6">
              <Users className="text-purple-600 w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">
              {searchQuery || selectedPriority
                ? "No friends found"
                : "No friends yet"}
            </h3>
            <p className="text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg">
              {searchQuery || selectedPriority
                ? "Try adjusting your search or filters"
                : "Start building your friend list and set priorities"}
            </p>
            {!searchQuery && !selectedPriority && (
              <button
                onClick={() => {
                  resetForm();
                  setFormOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-105 text-sm sm:text-base"
              >
                <UserPlus size={18} className="sm:w-5 sm:h-5" />
                Add Your First Friend
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {PRIORITY_LEVELS.map((priority) => {
              const friendsInPriority = groupedFriends[priority.level] || [];
              if (friendsInPriority.length === 0) return null;

              const Icon = priority.icon;

              return (
                <div key={priority.level}>
                  {/* Priority Header */}
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <div
                      className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${priority.color}`}
                    >
                      <Icon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {priority.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {friendsInPriority.length}{" "}
                        {friendsInPriority.length === 1 ? "friend" : "friends"}
                      </p>
                    </div>
                  </div>

                  {/* Friends Grid */}
                  <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {friendsInPriority.map((friend) => (
                      <div
                        key={friend.id}
                        className={`group bg-white rounded-xl sm:rounded-2xl overflow-hidden border-2 ${priority.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                      >
                        <div className="p-4 sm:p-5 md:p-6">
                          {/* Friend Header */}
                          <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            {/* Avatar */}
                            <div
                              className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${priority.color} flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg`}
                            >
                              {friend.image_url ? (
                                <img
                                  src={friend.image_url}
                                  alt={friend.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-white text-xl sm:text-2xl font-bold">
                                  {friend.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Name and Priority */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1 truncate">
                                {friend.name}
                              </h4>
                              <div
                                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-gradient-to-r ${priority.color} text-white text-[10px] sm:text-xs font-bold shadow-md`}
                              >
                                <Icon size={10} className="sm:w-3 sm:h-3" />
                                <span className="hidden xs:inline">
                                  {priority.label}
                                </span>
                                <span className="xs:hidden">P{priority.level}</span>
                              </div>
                            </div>
                          </div>

                          {/* Phone */}
                          {friend.phone && (
                            <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg">
                              <Phone className="text-slate-400 shrink-0" size={16} />
                              <a
                                href={`tel:${friend.phone}`}
                                className="text-sm text-slate-700 hover:text-purple-600 transition-colors truncate font-medium"
                              >
                                {friend.phone}
                              </a>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => editFriend(friend)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-sm hover:scale-[1.02] active:scale-95"
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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