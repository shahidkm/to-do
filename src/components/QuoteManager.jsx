import React, { useState, useEffect } from 'react';
import { Quote, Plus, Trash2, Edit2, Check, X, Star, BookOpen, Film, Music, User, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Navbar from './NavBar';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function QuoteManager() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    quote_text: '',
    author: '',
    category: 'motivation',
    mood: 'calm',
    language: 'en',
    source: 'personal',
    is_featured: false
  });

  const categories = ['motivation', 'travel', 'life', 'success', 'wisdom', 'love'];
  const moods = ['calm', 'intense', 'happy', 'sad', 'inspiring', 'peaceful'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' }
  ];
  const sources = ['book', 'movie', 'personal', 'song', 'speech', 'internet'];

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error("Error loading quotes:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.quote_text.trim()) {
      alert('Quote text is required!');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('quotes')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        
        setQuotes(quotes.map(q => q.id === editingId ? { ...q, ...formData } : q));
        setEditingId(null);
      } else {
        const { data, error } = await supabase
          .from('quotes')
          .insert([formData])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setQuotes([data[0], ...quotes]);
        }
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving quote:", error);
      alert('Failed to save quote: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setQuotes(quotes.filter(q => q.id !== id));
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert('Failed to delete quote');
    }
  };

  const handleEdit = (quote) => {
    setFormData({
      quote_text: quote.quote_text,
      author: quote.author || '',
      category: quote.category || 'motivation',
      mood: quote.mood || 'calm',
      language: quote.language || 'en',
      source: quote.source || 'personal',
      is_featured: quote.is_featured || false
    });
    setEditingId(quote.id);
    setShowForm(true);
  };

  const toggleFeatured = async (quote) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ is_featured: !quote.is_featured })
        .eq('id', quote.id);

      if (error) throw error;
      
      setQuotes(quotes.map(q => 
        q.id === quote.id ? { ...q, is_featured: !q.is_featured } : q
      ));
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      quote_text: '',
      author: '',
      category: 'motivation',
      mood: 'calm',
      language: 'en',
      source: 'personal',
      is_featured: false
    });
    setEditingId(null);
  };

  const getSourceIcon = (source) => {
    const icons = {
      book: <BookOpen size={16} />,
      movie: <Film size={16} />,
      song: <Music size={16} />,
      personal: <User size={16} />,
      speech: <Quote size={16} />,
      internet: <Sparkles size={16} />
    };
    return icons[source] || <Quote size={16} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      motivation: 'from-orange-50 to-amber-50 border-orange-200 text-orange-700',
      travel: 'from-sky-50 to-blue-50 border-sky-200 text-sky-700',
      life: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700',
      success: 'from-purple-50 to-violet-50 border-purple-200 text-purple-700',
      wisdom: 'from-slate-50 to-gray-50 border-slate-200 text-slate-700',
      love: 'from-rose-50 to-pink-50 border-rose-200 text-rose-700'
    };
    return colors[category] || 'from-slate-50 to-gray-50 border-slate-200 text-slate-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
          <div className="text-slate-600 text-lg font-medium">Loading quotes...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
   
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl mb-4 shadow-lg shadow-sky-100">
              <Quote className="text-sky-500" size={42} strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-bold text-slate-800 mb-2 tracking-tight">Make Your Day</h1>
            <p className="text-slate-500 text-lg font-medium">Keep It Always In Mind</p>
          </div>

          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-sky-200 flex items-center gap-2"
            >
              {showForm ? <X size={20} /> : <Plus size={20} />}
              {showForm ? 'Cancel' : 'Add New Quote'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {editingId ? 'Edit Quote' : 'Create New Quote'}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Quote Text *</label>
                  <textarea
                    value={formData.quote_text}
                    onChange={(e) => setFormData({ ...formData, quote_text: e.target.value })}
                    rows={4}
                    placeholder="Enter your inspirational quote..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g., Albert Einstein"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mood</label>
                    <select
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    >
                      {moods.map(mood => (
                        <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    >
                      {sources.map(src => (
                        <option key={src} value={src}>{src.charAt(0).toUpperCase() + src.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                      />
                      <span className="text-sm font-semibold text-slate-700">Mark as Featured</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-sky-200"
                  >
                    {editingId ? 'Update Quote' : 'Create Quote'}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">All Quotes ({quotes.length})</h2>
            </div>

            {quotes.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Quote className="text-slate-300" size={36} />
                </div>
                <p className="text-slate-500 font-medium text-lg mb-1">No quotes yet</p>
                <p className="text-slate-400 text-sm">Click "Add New Quote" to create your first quote</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-100 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border bg-gradient-to-r ${getCategoryColor(quote.category)}`}>
                            {quote.category}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 flex items-center gap-1">
                            {getSourceIcon(quote.source)}
                            {quote.source}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600">
                            {quote.mood}
                          </span>
                          {quote.is_featured && (
                            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-700 flex items-center gap-1">
                              <Star size={14} className="fill-amber-500 text-amber-500" />
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-lg text-slate-700 font-medium mb-2 italic">"{quote.quote_text}"</p>
                        {quote.author && (
                          <p className="text-sm text-slate-500 font-semibold">— {quote.author}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(quote.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleFeatured(quote)}
                          className={`p-2 rounded-xl transition-all ${
                            quote.is_featured 
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={quote.is_featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star size={18} className={quote.is_featured ? 'fill-amber-500' : ''} />
                        </button>
                        <button
                          onClick={() => handleEdit(quote)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all"
                          title="Edit quote"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                          title="Delete quote"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}