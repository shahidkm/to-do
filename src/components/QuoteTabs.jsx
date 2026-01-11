import React, { useState } from 'react';
import { Heart, Star, Sparkles, Coffee, Sun, Moon, Zap, Cloud } from 'lucide-react';
import Navbar from './NavBar';
import QuoteManager from './QuoteManager';
export default function QuoteTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      icon: Heart,
      label: 'Motivation',
      color: 'from-blue-300 to-sky-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      quote: 'തോൽക്കുന്നതിനേക്കാൾ നല്ലത് ചത്ത് തോലയുന്നതാ !..',
 
      description: 'There are only two kinds of people in the world — those who get exploited and those who are exploiters.',
      image: 'https://tse2.mm.bing.net/th/id/OIP.scUlGVp2udvDg17EvutY2gHaEK?pid=Api&P=0&h=180'
    },
    {
      id: 1,
      icon: Star,
      label: 'Success',
      color: 'from-sky-300 to-blue-400',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      quote: 'Success is not the key to happiness. Happiness is the key to success.',
      author: 'Albert Schweitzer',
      description: 'If you love what you are doing, you will be successful in every aspect of life.',
      image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      icon: Sparkles,
      label: 'Dreams',
      color: 'from-cyan-300 to-blue-400',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      quote: 'My dream isn’t fame — it’s to write a script that lives longer than me.',
      author: 'Eleanor Roosevelt',
      description: 'Dream big, work hard, stay focused, and surround yourself with good people.',
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      icon: Coffee,
      label: 'Life',
      color: 'from-blue-200 to-sky-300',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
      quote: 'Take care of yourself first before taking care of others.Show yourself respect before giving it to others. Value yourself first before valuing others more than you. Moral of the story : treat yourself right first, so you can treat others better.',
      author: 'Vibezone',
      description: 'Be best version of yourself',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      icon: Sun,
      label: 'Happiness',
      color: 'from-sky-200 to-blue-300',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-500',
      quote: 'I don’t need smoke or drinks to feel alive.',

      description: 'The most important thing is to enjoy your life, to be happy, it\'s all that matters.',
      image: 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      icon: Zap,
      label: 'Energy',
      color: 'from-cyan-200 to-sky-400',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      quote: 'I just want to speak with the people I love, without judgment, without hurting, without becoming a burden.',
      author: 'Benjamin Franklin',
      description: 'The energy of the mind is the essence of life. Keep your energy positive and focused.',
      image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&h=300&fit=crop'
    }
  ];

  const activeContent = tabs[activeTab];
  const Icon = activeContent.icon;

  return (
    <div>
        <Navbar/>
        <QuoteManager/>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-700 mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            Daily Inspiration
          </h1>
          <p className="text-gray-400 text-lg">Choose a category to get inspired</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6  py-3 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  boxShadow: activeTab === tab.id 
                    ? '0 10px 30px rgba(0, 0, 0, 0.15)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
              >
                <TabIcon size={20} strokeWidth={2.5} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Card */}
        <div 
          className={`bg-white rounded-3xl overflow-hidden transition-all duration-500 ${activeContent.bgColor}/30`}
          style={{
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 30px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Image Section */}
            <div className="relative h-80 md:h-auto overflow-hidden">
              <img 
                src={activeContent.image}
                alt={activeContent.label}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${activeContent.color} opacity-20`}
              ></div>
              <div className="absolute top-6 left-6">
                <div 
                  className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center ${activeContent.textColor}`}
                  style={{
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <Icon size={32} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Text Section */}
            <div className="p-10 md:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <span 
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${activeContent.bgColor} ${activeContent.textColor}`}
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  {activeContent.label}
                </span>
              </div>

              <h2 className="text-1xl md:text-2xl font-bold text-gray-800 mb-6 leading-tight">
                {activeContent.quote}
              </h2>

              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {activeContent.description}
              </p>

              <div className="flex items-center gap-4">
                <div 
                  className={`w-12 h-1 rounded-full bg-gradient-to-r ${activeContent.color}`}
                ></div>
                <p className={`font-semibold ${activeContent.textColor}`}>
                  — {activeContent.author}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button 
                  className={`px-6 py-3 rounded-xl bg-gradient-to-r ${activeContent.color} text-white font-medium hover:shadow-lg transition-all transform hover:scale-105`}
                  style={{
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  Save Quote
                </button>
                <button 
                  className="px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all transform hover:scale-105"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  Share
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`transition-all ${
                activeTab === tab.id 
                  ? `w-12 h-3 bg-gradient-to-r ${tab.color} rounded-full` 
                  : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
    </div>
  );
}