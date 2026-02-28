import React, { useState, useEffect } from 'react';
import { Quote, Star, BookOpen, Film, Music, User, Sparkles, Heart, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────────────────────────
// Injected CSS — same cosmic token set as TodoList
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

.qFOrb { font-family: 'Orbitron', monospace; }
.qFRaj { font-family: 'Rajdhani', sans-serif; }

.qGlass {
  background: rgba(6, 14, 40, 0.75);
  border: 1px solid rgba(0, 229, 255, 0.13);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
}
.qGlass2 {
  background: rgba(10, 20, 55, 0.65);
  border: 1px solid rgba(0, 229, 255, 0.1);
  backdrop-filter: blur(10px);
}
.qGlowC { box-shadow: 0 0 20px rgba(0,229,255,0.2), inset 0 1px 0 rgba(0,229,255,0.1); }
.qGlowV { box-shadow: 0 0 24px rgba(124,77,255,0.28); }
.qTGlowC { text-shadow: 0 0 22px rgba(0,229,255,0.75); }

@keyframes qFadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes qFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes qShimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes qBPulse   { 0%,100%{border-color:rgba(0,229,255,0.13)} 50%{border-color:rgba(0,229,255,0.45)} }
@keyframes qScanLine { 0%{top:-4px;opacity:.7} 100%{top:100%;opacity:0} }
@keyframes qSpinS    { to{transform:rotate(360deg)} }
@keyframes qPulseRing {
  0%  { box-shadow: 0 0 0 0 rgba(0,229,255,0.45); }
  70% { box-shadow: 0 0 0 12px rgba(0,229,255,0); }
  100%{ box-shadow: 0 0 0 0 rgba(0,229,255,0); }
}
@keyframes qSlideIn  { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }

.qAFU   { animation: qFadeUp .6s cubic-bezier(.22,1,.36,1) both; }
.qAFloat{ animation: qFloat 4s ease-in-out infinite; }
.qABP   { animation: qBPulse 2.8s ease-in-out infinite; }
.qAShim {
  background: linear-gradient(90deg,#00e5ff 0%,#fff 40%,#7c4dff 70%,#00e5ff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: qShimmer 3.5s linear infinite;
}
.qS1{animation-delay:.05s} .qS2{animation-delay:.12s} .qS3{animation-delay:.20s}
.qS4{animation-delay:.28s} .qS5{animation-delay:.36s}

/* Scan line */
.qScanC { position: relative; overflow: hidden; }
.qScanC::after {
  content: ''; position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(transparent, rgba(0,229,255,0.18), transparent);
  animation: qScanLine 5s linear infinite; pointer-events: none;
}

/* Quote card hover */
.qCard {
  transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s;
  cursor: default;
}
.qCard:hover {
  transform: translateX(5px) translateY(-2px);
  box-shadow: 0 8px 40px rgba(0,229,255,0.12), inset 3px 0 0 rgba(0,229,255,0.55) !important;
}

/* Refresh button */
.qBtnR {
  background: linear-gradient(135deg, #2979ff, #7c4dff);
  transition: all .2s; position: relative; overflow: hidden;
  border: none; cursor: pointer;
}
.qBtnR::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent); opacity:0; transition:opacity .2s; }
.qBtnR:hover::after { opacity: 1; }
.qBtnR:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(41,121,255,0.5); }
.qBtnR:active { transform: translateY(0); }

.qPGlow { box-shadow: 0 0 14px rgba(0,229,255,0.6), 0 0 28px rgba(41,121,255,0.35); }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.25); border-radius: 4px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getDateStr = () => {
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
};

const getSourceIcon = (source) => {
  const map = {
    book:     <BookOpen  size={13} />,
    movie:    <Film      size={13} />,
    song:     <Music     size={13} />,
    personal: <User      size={13} />,
    speech:   <Quote     size={13} />,
    internet: <Sparkles  size={13} />,
  };
  return map[source] || <Quote size={13} />;
};

// Cosmic category colours (hue-based glow tints)
const CATEGORY_STYLE = {
  motivation: { border: 'rgba(249,115,22,0.45)', glow: 'rgba(249,115,22,0.15)', badge: 'linear-gradient(135deg,#f97316,#fb923c)', accent: '#f97316' },
  travel:     { border: 'rgba(0,229,255,0.45)',  glow: 'rgba(0,229,255,0.12)',  badge: 'linear-gradient(135deg,#00e5ff,#22d3ee)', accent: '#00e5ff' },
  life:       { border: 'rgba(52,211,153,0.45)', glow: 'rgba(52,211,153,0.12)', badge: 'linear-gradient(135deg,#34d399,#10b981)', accent: '#34d399' },
  success:    { border: 'rgba(124,77,255,0.45)', glow: 'rgba(124,77,255,0.12)', badge: 'linear-gradient(135deg,#7c4dff,#a78bfa)', accent: '#7c4dff' },
  wisdom:     { border: 'rgba(148,163,184,0.4)', glow: 'rgba(148,163,184,0.1)', badge: 'linear-gradient(135deg,#94a3b8,#64748b)', accent: '#94a3b8' },
  love:       { border: 'rgba(245,0,87,0.45)',   glow: 'rgba(245,0,87,0.12)',   badge: 'linear-gradient(135deg,#f50057,#f43f5e)', accent: '#f50057' },
};
const getCatStyle = (cat) => CATEGORY_STYLE[cat] || CATEGORY_STYLE.wisdom;

// Mood → subtle card tint
const MOOD_TINT = {
  calm:      'rgba(0,229,255,0.04)',
  intense:   'rgba(249,115,22,0.04)',
  happy:     'rgba(255,215,64,0.04)',
  sad:       'rgba(100,116,139,0.06)',
  inspiring: 'rgba(124,77,255,0.05)',
  peaceful:  'rgba(52,211,153,0.04)',
};
const getMoodTint = (mood) => MOOD_TINT[mood] || 'rgba(0,229,255,0.03)';

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TodaysQuotes() {
  const [quotes, setQuotes]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTodaysQuotes(); }, []);

  const loadTodaysQuotes = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('quotes').select('*').eq('is_active', true)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQuotes(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'56px 0', gap:14 }}>
          <div style={{ width:40, height:40, border:'3px solid rgba(0,229,255,0.15)', borderTop:'3px solid #00e5ff', borderRadius:'50%', animation:'qSpinS 0.9s linear infinite' }} />
          <span className="qFRaj" style={{ fontSize:14, color:'rgba(0,229,255,0.5)', letterSpacing:'0.06em' }}>Loading today's thoughts…</span>
        </div>
      </>
    );
  }

  // ── Corner accents (reused from TodoList) ────────────────────────────────
  const CornerAccents = ({ color = 'rgba(0,229,255,0.6)' }) => (
    <>
      {[
        { top:0,    left:0,    borderWidth:'2px 0 0 2px', borderRadius:'6px 0 0 0' },
        { top:0,    right:0,   borderWidth:'2px 2px 0 0', borderRadius:'0 6px 0 0' },
        { bottom:0, left:0,    borderWidth:'0 0 2px 2px', borderRadius:'0 0 0 6px' },
        { bottom:0, right:0,   borderWidth:'0 2px 2px 0', borderRadius:'0 0 6px 0' },
      ].map((s, i) => (
        <div key={i} style={{ position:'absolute', width:18, height:18, borderStyle:'solid', borderColor:color, ...s }} />
      ))}
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      <div className="qFRaj" style={{ padding:'0 0 32px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <div className="qGlass qGlowC qScanC qABP qAFU" style={{ borderRadius:24, padding:22, marginBottom:16 }}>
            <div style={{ position:'relative' }}>
              <CornerAccents />
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>

              {/* Left — icon + title */}
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div className="qAFloat" style={{ width:48, height:48, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center',
                  background:'rgba(0,229,255,0.07)', border:'1px solid rgba(0,229,255,0.22)',
                  boxShadow:'0 0 20px rgba(0,229,255,0.2)' }}>
                  <Quote size={22} color="#00e5ff" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="qAShim qFOrb" style={{ fontSize:18, fontWeight:900, margin:0 }}>TODAY'S THOUGHT</h2>
                  <p className="qFRaj" style={{ fontSize:11, color:'rgba(0,229,255,0.45)', letterSpacing:'0.12em', marginTop:2 }}>
                    {getDateStr().toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Right — count + refresh */}
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div className="qGlass2" style={{ borderRadius:14, padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(245,0,87,0.12)', color:'#f50057' }}>
                    <Heart size={14} />
                  </div>
                  <div>
                    <div className="qFOrb qTGlowC" style={{ fontSize:20, fontWeight:700, color:'#00e5ff', lineHeight:1 }}>{quotes.length}</div>
                    <div className="qFRaj" style={{ fontSize:10, color:'rgba(0,229,255,0.4)', letterSpacing:'0.08em' }}>THOUGHTS</div>
                  </div>
                </div>

                <button onClick={loadTodaysQuotes} className="qBtnR qFOrb"
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:14, color:'#fff', fontSize:11, fontWeight:700, letterSpacing:'0.1em' }}>
                  <RefreshCw size={13} />
                  REFRESH
                </button>
              </div>
            </div>

            {/* Progress strip — how many thoughts today */}
            {quotes.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ height:3, borderRadius:4, overflow:'hidden', background:'rgba(255,255,255,0.05)' }}>
                  <div className="qPGlow" style={{
                    height:'100%', borderRadius:4,
                    width:`${Math.min(100, (quotes.length / 10) * 100)}%`,
                    background:'linear-gradient(90deg,#00e5ff,#2979ff,#7c4dff)',
                    transition:'width .6s ease',
                  }} />
                </div>
                <div className="qFRaj" style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(0,229,255,0.35)', marginTop:5, letterSpacing:'0.1em' }}>
                  <span>0 THOUGHTS</span><span>{quotes.length} TODAY</span><span>10 MAX</span>
                </div>
              </div>
            )}
          </div>

          {/* ── EMPTY STATE ─────────────────────────────────────────────── */}
          {quotes.length === 0 ? (
            <div className="qGlass qGlowC qAFU" style={{ borderRadius:24, padding:'48px 24px', textAlign:'center', position:'relative' }}>
              <CornerAccents color="rgba(0,229,255,0.35)" />
              <div className="qAFloat" style={{ fontSize:42, marginBottom:14, display:'inline-block' }}>◈</div>
              <p className="qFOrb" style={{ fontSize:13, color:'rgba(0,229,255,0.38)', letterSpacing:'0.15em', marginBottom:6 }}>
                NO THOUGHTS YET
              </p>
              <p className="qFRaj" style={{ fontSize:13, color:'rgba(160,195,255,0.3)' }}>
                Start your day by creating an inspiring thought!
              </p>
            </div>

          ) : (
            // ── QUOTE CARDS ───────────────────────────────────────────────
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {quotes.map((quote, index) => {
                const cs = getCatStyle(quote.category);
                return (
                  <div
                    key={quote.id}
                    className={`qCard qGlass qScanC qAFU qS${Math.min(index + 1, 5)}`}
                    style={{
                      borderRadius: 20,
                      padding: 20,
                      position: 'relative',
                      overflow: 'hidden',
                      border: `1px solid ${cs.border}`,
                      background: `rgba(6,14,40,0.78)`,
                      boxShadow: `0 4px 30px ${cs.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                    }}
                  >
                    {/* Mood tint layer */}
                    <div style={{ position:'absolute', inset:0, background:getMoodTint(quote.mood), borderRadius:20, pointerEvents:'none' }} />

                    {/* Big decorative quote mark */}
                    <div style={{ position:'absolute', top:10, right:14, opacity:.06, lineHeight:1, pointerEvents:'none' }}>
                      <Quote size={72} strokeWidth={1} color="#00e5ff" />
                    </div>

                    {/* Featured glow strip */}
                    {quote.is_featured && (
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#ffd740,transparent)', borderRadius:'20px 20px 0 0' }} />
                    )}

                    <div style={{ position:'relative', zIndex:1 }}>

                      {/* ── BADGES ──────────────────────────────────────── */}
                      <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom:14 }}>

                        {/* Category */}
                        <span className="qFOrb" style={{
                          padding:'4px 11px', borderRadius:8, fontSize:10, fontWeight:700, color:'#fff',
                          background: cs.badge, letterSpacing:'0.12em',
                          boxShadow: `0 0 12px ${cs.glow}`,
                        }}>
                          {quote.category.toUpperCase()}
                        </span>

                        {/* Source */}
                        <span className="qFRaj" style={{
                          padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:600,
                          background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                          color:'rgba(200,228,255,0.7)',
                          display:'flex', alignItems:'center', gap:6,
                        }}>
                          {getSourceIcon(quote.source)}
                          {quote.source}
                        </span>

                        {/* Mood */}
                        <span className="qFRaj" style={{
                          padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:600,
                          background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                          color:'rgba(200,228,255,0.7)',
                        }}>
                          {quote.mood}
                        </span>

                        {/* Language */}
                        <span className="qFOrb" style={{
                          padding:'4px 10px', borderRadius:8, fontSize:10, fontWeight:700,
                          background:'rgba(0,229,255,0.07)', border:'1px solid rgba(0,229,255,0.18)',
                          color:'rgba(0,229,255,0.7)', letterSpacing:'0.1em',
                        }}>
                          {quote.language?.toUpperCase()}
                        </span>

                        {/* Featured star */}
                        {quote.is_featured && (
                          <span className="qFOrb" style={{
                            padding:'4px 10px', borderRadius:8, fontSize:10, fontWeight:700,
                            background:'linear-gradient(135deg,rgba(255,215,64,0.2),rgba(255,165,0,0.15))',
                            border:'1px solid rgba(255,215,64,0.4)',
                            color:'#ffd740',
                            display:'flex', alignItems:'center', gap:5,
                            boxShadow:'0 0 12px rgba(255,215,64,0.25)',
                            letterSpacing:'0.1em',
                          }}>
                            <Star size={11} fill="#ffd740" strokeWidth={0} />
                            FEATURED
                          </span>
                        )}
                      </div>

                      {/* ── QUOTE TEXT ───────────────────────────────────── */}
                      <div style={{ margin:'14px 0' }}>
                        {/* Accent line */}
                        <div style={{ width:36, height:2, borderRadius:2, background:cs.badge, marginBottom:12, boxShadow:`0 0 8px ${cs.glow}` }} />

                        <p className="qFRaj" style={{
                          fontSize:17, fontWeight:600, lineHeight:1.65,
                          color:'rgba(220,238,255,0.92)',
                          fontStyle:'italic',
                          marginBottom:10,
                        }}>
                          "{quote.quote_text}"
                        </p>

                        {quote.author && (
                          <p className="qFRaj" style={{ fontSize:13, fontWeight:700, color: cs.accent }}>
                            — {quote.author}
                          </p>
                        )}
                      </div>

                      {/* ── FOOTER ──────────────────────────────────────── */}
                      <div style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        marginTop:14, paddingTop:12,
                        borderTop:'1px solid rgba(0,229,255,0.08)',
                      }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          {/* Number badge */}
                          <div className="qFOrb" style={{
                            width:26, height:26, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                            background:'rgba(0,229,255,0.07)', border:'1px solid rgba(0,229,255,0.18)',
                            fontSize:10, color:'rgba(0,229,255,0.6)',
                          }}>
                            {String(quotes.length - index).padStart(2,'0')}
                          </div>
                          <span className="qFRaj" style={{ fontSize:11, color:'rgba(160,195,255,0.4)', letterSpacing:'0.08em' }}>
                            THOUGHT #{quotes.length - index}
                          </span>
                        </div>

                        <span className="qFOrb" style={{ fontSize:10, color:'rgba(0,229,255,0.38)', letterSpacing:'0.08em' }}>
                          {new Date(quote.created_at).toLocaleTimeString('en-US', {
                            hour:'2-digit', minute:'2-digit', second:'2-digit'
                          })}
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
    </>
  );
}