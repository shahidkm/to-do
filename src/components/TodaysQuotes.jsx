import React, { useState, useEffect } from 'react';
import { Quote, Star, BookOpen, Film, Music, User, Sparkles, Heart, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TodaysQuotes() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodaysQuotes();
    }, []);

    const loadTodaysQuotes = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .eq('is_active', true)
                .gte('created_at', `${today}T00:00:00`)
                .lte('created_at', `${today}T23:59:59`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (error) {
            console.error("Error loading today's quotes:", error);
        }
        setLoading(false);
    };

    const getDateStr = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        const day = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        return `${day}, ${month} ${date}, ${year}`;
    };

    const getSourceIcon = (source) => {
        const icons = {
            book: <BookOpen size={18} />,
            movie: <Film size={18} />,
            song: <Music size={18} />,
            personal: <User size={18} />,
            speech: <Quote size={18} />,
            internet: <Sparkles size={18} />
        };
        return icons[source] || <Quote size={18} />;
    };

    const getCategoryColor = (category) => {
        const colors = {
            motivation: 'from-orange-400 to-amber-500',
            travel: 'from-sky-400 to-blue-500',
            life: 'from-emerald-400 to-teal-500',
            success: 'from-purple-400 to-violet-500',
            wisdom: 'from-slate-400 to-gray-500',
            love: 'from-rose-400 to-pink-500'
        };
        return colors[category] || 'from-slate-400 to-gray-500';
    };

    const getMoodGradient = (mood) => {
        const gradients = {
            calm: 'from-blue-50 via-cyan-50 to-teal-50',
            intense: 'from-orange-50 via-red-50 to-rose-50',
            happy: 'from-yellow-50 via-amber-50 to-orange-50',
            sad: 'from-slate-50 via-blue-50 to-indigo-50',
            inspiring: 'from-purple-50 via-pink-50 to-rose-50',
            peaceful: 'from-emerald-50 via-teal-50 to-cyan-50'
        };
        return gradients[mood] || 'from-slate-50 to-blue-50';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
                    <div className="text-slate-600 text-lg font-medium">Loading today's quotes...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 pt-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl mb-3">
                            <Quote className="text-sky-600" size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Today's Quotes</h1>
                        <p className="text-slate-500 text-sm font-medium">{getDateStr()}</p>
                    </div>

                    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-sky-50 to-blue-100 rounded-lg">
                                <Heart className="text-sky-600" size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-2xl font-bold text-slate-800">{quotes.length}</div>
                                <div className="text-xs text-slate-500 font-medium">Quotes Today</div>
                            </div>
                        </div>
                        <button
                            onClick={loadTodaysQuotes}
                            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md flex items-center gap-2 text-sm"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Quotes Display */}
                {quotes.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Quote className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No quotes created today</h3>
                        <p className="text-slate-500 text-sm">Start your day by creating an inspiring quote!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quotes.map((quote, index) => (
                            <div
                                key={quote.id}
                                className={`relative bg-gradient-to-r ${getMoodGradient(quote.mood)} rounded-xl p-5 shadow-md border border-white/50 hover:shadow-lg transition-all duration-300 overflow-hidden`}
                            >
                                {/* Decorative Quote Mark */}
                                <div className="absolute top-4 right-4 opacity-10">
                                    <Quote size={60} strokeWidth={1} />
                                </div>

                                <div className="relative z-10">
                                    {/* Badges */}
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor(quote.category)} shadow-md`}>
                                            {quote.category.toUpperCase()}
                                        </span>
                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/80 backdrop-blur-sm text-slate-700 flex items-center gap-1.5 shadow-sm">
                                            {getSourceIcon(quote.source)}
                                            {quote.source}
                                        </span>
                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/80 backdrop-blur-sm text-slate-700 shadow-sm">
                                            {quote.mood}
                                        </span>
                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/80 backdrop-blur-sm text-slate-700 shadow-sm">
                                            {quote.language.toUpperCase()}
                                        </span>
                                        {quote.is_featured && (
                                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white flex items-center gap-1.5 shadow-md">
                                                <Star size={14} className="fill-white" />
                                                FEATURED
                                            </span>
                                        )}
                                    </div>

                                    {/* Quote Text */}
                                    <div className="my-4">
                                        <p className="text-lg md:text-xl text-slate-800 font-bold leading-relaxed italic mb-2">
                                            "{quote.quote_text}"
                                        </p>
                                        {quote.author && (
                                            <p className="text-sm text-slate-600 font-semibold">
                                                — {quote.author}
                                            </p>
                                        )}
                                    </div>

                                    {/* Time */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
                                        <div className="text-xs text-slate-500 font-medium">
                                            Quote #{quotes.length - index}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            {new Date(quote.created_at).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}