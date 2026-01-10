import React, { useState, useEffect } from 'react';
import { Trophy, Gift, Award, Star, Sparkles, Medal, Crown, Zap, Trash2, X, Check, FileImage } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Navbar from './NavBar';
const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RewardsDashboard() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newReward, setNewReward] = useState({
    reward_type: 'weekly',
    week_count: '',
    reward_title: '',
    reward_description: '',
    image_url: ''
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const { data: rewardsList } = await supabase
        .from('rewards')
        .select('*')
        .order('reward_type', { ascending: true })
        .order('week_count', { ascending: true });
      
      setRewards(rewardsList || []);
    } catch (error) {
      console.error("Error loading rewards:", error);
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setNewReward({ ...newReward, image_url: url });
    setImagePreview(url);
  };

  const addReward = async () => {
    if (!newReward.reward_title.trim()) {
      alert('Please enter a reward title');
      return;
    }

    if (newReward.reward_type === 'weekly' && !newReward.week_count) {
      alert('Please enter week count for weekly rewards');
      return;
    }

    try {
      const rewardData = {
        reward_type: newReward.reward_type,
        reward_title: newReward.reward_title.trim(),
        reward_description: newReward.reward_description.trim() || null,
        image_url: newReward.image_url.trim() || null
      };

      if (newReward.reward_type === 'weekly') {
        rewardData.week_count = parseInt(newReward.week_count);
      }

      const { data, error } = await supabase
        .from('rewards')
        .insert([rewardData])
        .select()
        .single();

      if (error) throw error;

      await loadRewards();
      setNewReward({
        reward_type: 'weekly',
        week_count: '',
        reward_title: '',
        reward_description: '',
        image_url: ''
      });
      setImagePreview(null);
      setShowRewardForm(false);
      alert('Reward added successfully!');
    } catch (error) {
      console.error("Error adding reward:", error);
      alert('Failed to add reward: ' + error.message);
    }
  };

  const deleteReward = async (rewardId) => {
    if (!confirm('Are you sure you want to delete this reward?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;

      await loadRewards();
      alert('Reward deleted successfully!');
    } catch (error) {
      console.error("Error deleting reward:", error);
      alert('Failed to delete reward: ' + error.message);
    }
  };

  const addDefaultWeeklyRewards = async () => {
    const defaultRewards = [
    //   { 
    //     reward_type: 'weekly', 
    //     week_count: 1, 
    //     reward_title: 'Bronze Focus Badge', 
    //     reward_description: 'Completed your first focused week',
    //     image_url: 'https://images.unsplash.com/photo-1618344606923-f3ded1e29a1a?w=400&h=400&fit=crop'
    //   },
    //   { 
    //     reward_type: 'weekly', 
    //     week_count: 2, 
    //     reward_title: 'Silver Discipline Badge', 
    //     reward_description: 'Two weeks of consistent productivity',
    //     image_url: 'https://images.unsplash.com/photo-1618344606904-2d91e6f6ec00?w=400&h=400&fit=crop'
    //   },
    //   { 
    //     reward_type: 'weekly', 
    //     week_count: 3, 
    //     reward_title: 'Gold Consistency Badge', 
    //     reward_description: 'Three weeks without breaking the flow',
    //     image_url: 'https://images.unsplash.com/photo-1618344604068-09d7b84b815e?w=400&h=400&fit=crop'
    //   },
    //   { 
    //     reward_type: 'weekly', 
    //     week_count: 4, 
    //     reward_title: 'Platinum Performer Badge', 
    //     reward_description: 'One full month of strong discipline',
    //     image_url: 'https://images.unsplash.com/photo-1618344606904-2d91e6f6ec00?w=400&h=400&fit=crop'
    //   },
    //   { 
    //     reward_type: 'weekly', 
    //     week_count: 8, 
    //     reward_title: 'Diamond Master Badge', 
    //     reward_description: 'Two months of unstoppable focus',
    //     image_url: 'https://images.unsplash.com/photo-1618344606923-f3ded1e29a1a?w=400&h=400&fit=crop'
    //   }
    ];

    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert(defaultRewards)
        .select();

      if (error) throw error;

      await loadRewards();
      alert('Default weekly rewards added successfully!');
    } catch (error) {
      console.error("Error adding default rewards:", error);
      alert('Failed to add default rewards: ' + error.message);
    }
  };

  const getRewardIcon = (weekCount) => {
    if (!weekCount) return <Gift size={28} strokeWidth={2.5} />;
    if (weekCount === 1) return <Medal size={28} strokeWidth={2.5} />;
    if (weekCount === 2) return <Star size={28} strokeWidth={2.5} />;
    if (weekCount === 3) return <Award size={28} strokeWidth={2.5} />;
    if (weekCount === 4) return <Trophy size={28} strokeWidth={2.5} />;
    if (weekCount >= 8) return <Crown size={28} strokeWidth={2.5} />;
    return <Sparkles size={28} strokeWidth={2.5} />;
  };

  const getRewardGradient = (weekCount, unlocked) => {
    if (!unlocked) return 'from-slate-300 to-slate-400';
    if (!weekCount) return 'from-sky-400 to-blue-500';
    if (weekCount === 1) return 'from-amber-500 to-orange-600';
    if (weekCount === 2) return 'from-slate-300 to-slate-500';
    if (weekCount === 3) return 'from-yellow-400 to-amber-500';
    if (weekCount === 4) return 'from-cyan-400 to-sky-500';
    if (weekCount >= 8) return 'from-violet-500 to-purple-600';
    return 'from-emerald-400 to-teal-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
          <div className="text-slate-600 text-lg font-medium">Loading rewards...</div>
        </div>
      </div>
    );
  }

  const weeklyRewards = rewards.filter(r => r.reward_type === 'weekly').sort((a, b) => a.week_count - b.week_count);
  const monthlyRewards = rewards.filter(r => r.reward_type === 'monthly');

  return (
    <div>
        <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl mb-4 shadow-lg shadow-amber-100">
            <Trophy className="text-amber-500" size={42} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-2 tracking-tight">
            Rewards & Achievements
          </h1>
          <p className="text-slate-500 text-lg font-medium">Unlock badges and celebrate your milestones</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <button
            onClick={() => setShowRewardForm(!showRewardForm)}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 flex items-center gap-2"
          >
            <Sparkles size={20} strokeWidth={2.5} />
            Add Custom Reward
          </button>
          <button
            onClick={addDefaultWeeklyRewards}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-semibold shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 flex items-center gap-2"
          >
            <Zap size={20} strokeWidth={2.5} />
            Add Default Rewards
          </button>
        </div>

        {/* Add Reward Form */}
        {showRewardForm && (
          <div className="mb-10 bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Gift className="text-sky-500" size={28} strokeWidth={2.5} />
                Create New Reward
              </h4>
              <button
                onClick={() => {
                  setShowRewardForm(false);
                  setNewReward({
                    reward_type: 'weekly',
                    week_count: '',
                    reward_title: '',
                    reward_description: '',
                    image_url: ''
                  });
                  setImagePreview(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="text-slate-500" size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Reward Type</label>
                  <select
                    value={newReward.reward_type}
                    onChange={(e) => setNewReward({ ...newReward, reward_type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                {newReward.reward_type === 'weekly' && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Week Count</label>
                    <input
                      type="number"
                      min="1"
                      value={newReward.week_count}
                      onChange={(e) => setNewReward({ ...newReward, week_count: e.target.value })}
                      placeholder="e.g., 1, 2, 3, 4..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Reward Title</label>
                  <input
                    type="text"
                    value={newReward.reward_title}
                    onChange={(e) => setNewReward({ ...newReward, reward_title: e.target.value })}
                    placeholder="e.g., Bronze Focus Badge"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Description (Optional)</label>
                  <textarea
                    value={newReward.reward_description}
                    onChange={(e) => setNewReward({ ...newReward, reward_description: e.target.value })}
                    placeholder="e.g., Completed your first focused week"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={newReward.image_url}
                    onChange={handleImageChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                  />
                </div>
                
                {imagePreview ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2 font-semibold">Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center h-48">
                    <FileImage className="text-slate-300 mb-2" size={48} />
                    <p className="text-sm text-slate-400">No image preview</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addReward}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 flex items-center justify-center gap-2"
              >
                <Check size={20} strokeWidth={2.5} />
                Create Reward
              </button>
              <button
                onClick={() => {
                  setShowRewardForm(false);
                  setNewReward({
                    reward_type: 'weekly',
                    week_count: '',
                    reward_title: '',
                    reward_description: '',
                    image_url: ''
                  });
                  setImagePreview(null);
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Weekly Rewards Section */}
        {weeklyRewards.length > 0 && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Award className="text-amber-500" size={32} strokeWidth={2.5} />
              Weekly Milestones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyRewards.map((reward) => (
                <div 
                  key={reward.id}
                  className={`bg-white rounded-2xl p-6 shadow-xl border transition-all duration-300 group relative ${
                    reward.unlocked 
                      ? 'border-emerald-200 shadow-emerald-100/50 hover:shadow-2xl hover:shadow-emerald-200/30' 
                      : 'border-slate-100 shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-200/30'
                  }`}
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteReward(reward.id)}
                    className="absolute top-4 right-4 p-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                    title="Delete reward"
                  >
                    <Trash2 className="text-rose-500" size={18} strokeWidth={2.5} />
                  </button>
                  
                  <div>
                    {reward.image_url && (
                      <div 
                        className="mb-4 rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImage(reward.image_url)}
                      >
                        <img 
                          src={reward.image_url} 
                          alt={reward.reward_title}
                          className={`w-full object-cover transition-all duration-300 hover:scale-105 ${
                            reward.unlocked ? 'grayscale-0' : 'grayscale opacity-50'
                          }`}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getRewardGradient(reward.week_count, reward.unlocked)} ${
                        reward.unlocked ? 'shadow-lg' : 'opacity-50'
                      }`}>
                        <div className="text-white">
                          {getRewardIcon(reward.week_count)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-800 mb-1">{reward.reward_title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            reward.unlocked 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            Week {reward.week_count}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {reward.reward_description && (
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{reward.reward_description}</p>
                    )}
                    
                    {reward.unlocked ? (
                      <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                          <Sparkles size={16} strokeWidth={2.5} />
                          <span>Unlocked</span>
                        </div>
                        {reward.unlocked_on && (
                          <p className="text-xs text-emerald-500 mt-1 font-medium">
                            {new Date(reward.unlocked_on).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-500 text-sm font-semibold">🔒 Locked</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Rewards Section */}
        {monthlyRewards.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Trophy className="text-orange-500" size={32} strokeWidth={2.5} />
              Monthly Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyRewards.map((reward) => (
                <div 
                  key={reward.id}
                  className={`bg-white rounded-2xl p-6 shadow-xl border transition-all duration-300 group relative ${
                    reward.unlocked 
                      ? 'border-orange-200 shadow-orange-100/50 hover:shadow-2xl hover:shadow-orange-200/30' 
                      : 'border-slate-100 shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-200/30'
                  }`}
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteReward(reward.id)}
                    className="absolute top-4 right-4 p-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                    title="Delete reward"
                  >
                    <Trash2 className="text-rose-500" size={18} strokeWidth={2.5} />
                  </button>
                  
                  <div>
                    {reward.image_url && (
                      <div 
                        className="mb-4 rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImage(reward.image_url)}
                      >
                        <img 
                          src={reward.image_url} 
                          alt={reward.reward_title}
                          className={`w-full h-40 object-cover transition-all duration-300 hover:scale-105 ${
                            reward.unlocked ? 'grayscale-0' : 'grayscale opacity-50'
                          }`}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${
                        reward.unlocked 
                          ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg' 
                          : 'bg-gradient-to-br from-slate-300 to-slate-400 opacity-50'
                      }`}>
                        <Trophy className="text-white" size={28} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-800 mb-1">{reward.reward_title}</h4>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          reward.unlocked 
                            ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          Monthly
                        </span>
                      </div>
                    </div>
                    
                    {reward.reward_description && (
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{reward.reward_description}</p>
                    )}
                    
                    {reward.unlocked ? (
                      <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-2 text-orange-600 text-sm font-semibold">
                          <Sparkles size={16} strokeWidth={2.5} />
                          <span>Unlocked</span>
                        </div>
                        {reward.unlocked_on && (
                          <p className="text-xs text-orange-500 mt-1 font-medium">
                            {new Date(reward.unlocked_on).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-500 text-sm font-semibold">🔒 Locked</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {rewards.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center p-6 bg-slate-100 rounded-3xl mb-6">
              <Gift className="text-slate-400" size={64} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Rewards Yet</h3>
            <p className="text-slate-500 text-lg mb-8">Start by adding some rewards to track your achievements!</p>
            <button
              onClick={() => setShowRewardForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-sky-200"
            >
              Create Your First Reward
            </button>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="text-slate-700" size={24} />
              </button>
              <img 
                src={selectedImage} 
                alt="Reward" 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  );
}