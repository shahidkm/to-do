import React, { useState, useEffect, useRef } from 'react';
import {
  Check, Trash2, Edit2, Plus, X, RefreshCw,
  Camera, Sparkles, TrendingUp, Building2, Flag, Flame, Zap
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Navbar from './NavBar';
import TodaysQuotes from './TodaysQuotes';

const supabaseUrl = 'https://quufeiwzsgiuwkeyjjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dWZlaXd6c2dpdXdrZXlqam5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODQ5OTYsImV4cCI6MjA4MzQ2MDk5Nn0.KL0XNEg4o4RVMJOfAQdWQekug_sw2I0KNTLkj_73_sg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────────────────────────
// 🗓  REAL DATE-BASED DYNAMIC DAY CALCULATION
//     Start : Aug 1 2025  →  End : Aug 1 2026  (365 days)
//     Every new calendar day:  REMAINING drops by 1, SURVIVED rises by 1
// ─────────────────────────────────────────────────────────────────────────────
const JOB_START = new Date('2025-08-01T00:00:00');
const JOB_END   = new Date('2026-08-01T00:00:00');
const TOTAL_DAYS = Math.round((JOB_END - JOB_START) / 86_400_000); // 365

function getDynamicDays() {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today
  const end   = new Date(JOB_END.getFullYear(), JOB_END.getMonth(), JOB_END.getDate());
  const start = new Date(JOB_START.getFullYear(), JOB_START.getMonth(), JOB_START.getDate());

  const survived  = Math.max(0, Math.min(TOTAL_DAYS, Math.floor((today - start) / 86_400_000)));
  const remaining = Math.max(0, Math.ceil((end - today) / 86_400_000));
  return { survived, remaining };
}

// Live seconds countdown to next midnight  →  "HH:MM:SS"
function getTimeToMidnight() {
  const now      = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // next midnight
  const diff     = midnight - now;
  const h = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60_000)   / 1000)).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// ─────────────────────────────────────────────────────────────────────────────
const MOTIVATIONAL_MESSAGES = [
  "Every day you survive is proof of your strength. Keep pushing!",
  "You're more than halfway there. The finish line is in sight!",
  "Each day builds the person you're becoming. Stay the course.",
  "Hard days are just chapters, not the whole story.",
  "You chose this challenge. Now own every single day of it!",
  "The version of you on Day 365 will thank you for today.",
  "Discipline is the bridge between goals and accomplishment.",
  "Show up today like your future depends on it — because it does.",
];

const defaultTodos = [
  "Build A Good Character", "Do Good Things Only", "No Smoking", "Be Matured",
  "Think 3 Times Before Talking and Doing Anything",
  "Don't Talk About Myself And Be A Good Listener", "Don't Be Aggressive",
  "Don't Be Selfish", "Don't Be Toxic", "Self Respect", "Get Well Dressed",
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated Cosmic Background Canvas
// ─────────────────────────────────────────────────────────────────────────────
function CosmicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + 0.2,
      drift: Math.random() * 0.25 + 0.04,
      alpha: Math.random(), alphaDir: Math.random() > 0.5 ? 1 : -1,
      alphaSpeed: Math.random() * 0.007 + 0.002,
    }));

    const orbs = [
      { x: W*0.15, y: H*0.25, r:300, hue:200, vx:0.15,  vy:0.08,  alpha:0.07 },
      { x: W*0.75, y: H*0.6,  r:260, hue:260, vx:-0.12, vy:0.1,   alpha:0.06 },
      { x: W*0.5,  y: H*0.85, r:220, hue:220, vx:0.1,   vy:-0.09, alpha:0.05 },
      { x: W*0.9,  y: H*0.15, r:200, hue:300, vx:-0.09, vy:0.12,  alpha:0.05 },
    ];

    const nodes = Array.from({ length: 32 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*0.22, vy: (Math.random()-0.5)*0.22,
    }));

    const shoots = [];
    const shootTimer = setInterval(() => {
      shoots.push({
        x: Math.random()*W*0.8, y: Math.random()*H*0.4,
        len: 90 + Math.random()*110, speed: 9 + Math.random()*7,
        alpha: 1, angle: Math.PI/5 + (Math.random()-0.5)*0.25,
      });
    }, 3000);

    const hexPts = [];
    const hSize = 80;
    for (let row = -1; row < H/hSize+2; row++)
      for (let col = -1; col < W/(hSize*0.866)+2; col++)
        hexPts.push({ x: col*hSize*0.866+(row%2)*hSize*0.433, y: row*hSize*0.75, pulse: Math.random()*Math.PI*2 });

    let t = 0;
    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createLinearGradient(0,0,W*0.5,H);
      bg.addColorStop(0,'#010412'); bg.addColorStop(0.35,'#040a1e');
      bg.addColorStop(0.7,'#060820'); bg.addColorStop(1,'#020308');
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      [[W*0.2,H*0.3,380],[W*0.7,H*0.65,300],[W*0.85,H*0.2,250]].forEach(([nx,ny,nr],i)=>{
        const hues = [200+Math.sin(t*0.4)*20, 260+Math.cos(t*0.3)*20, 180+Math.sin(t*0.2)*15];
        const alphas = [0.06, 0.05, 0.04];
        const g = ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
        g.addColorStop(0,`hsla(${hues[i]},80%,55%,${alphas[i]})`); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      });

      orbs.forEach(o=>{
        o.x+=o.vx; o.y+=o.vy;
        if(o.x<-o.r||o.x>W+o.r) o.vx*=-1; if(o.y<-o.r||o.y>H+o.r) o.vy*=-1;
        const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
        g.addColorStop(0,`hsla(${o.hue},90%,65%,${o.alpha})`);
        g.addColorStop(0.6,`hsla(${o.hue+30},70%,45%,${o.alpha*0.4})`); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill();
      });

      hexPts.forEach(p=>{
        p.pulse+=0.006;
        const a=(Math.sin(p.pulse)*0.5+0.5)*0.055;
        ctx.strokeStyle=`rgba(0,180,255,${a})`; ctx.lineWidth=0.5; ctx.beginPath();
        for(let i=0;i<6;i++){const angle=(Math.PI/3)*i-Math.PI/6; const hx=p.x+Math.cos(angle)*38,hy=p.y+Math.sin(angle)*38; i===0?ctx.moveTo(hx,hy):ctx.lineTo(hx,hy);}
        ctx.closePath(); ctx.stroke();
      });

      nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;});
      nodes.forEach((a,i)=>{
        nodes.slice(i+1).forEach(b=>{
          const dist=Math.hypot(a.x-b.x,a.y-b.y);
          if(dist<150){ctx.strokeStyle=`rgba(80,160,255,${(1-dist/150)*0.13})`;ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
        });
        ctx.fillStyle='rgba(100,180,255,0.4)';ctx.beginPath();ctx.arc(a.x,a.y,1.4,0,Math.PI*2);ctx.fill();
      });

      stars.forEach(s=>{
        s.y+=s.drift; if(s.y>H){s.y=0;s.x=Math.random()*W;}
        s.alpha+=s.alphaDir*s.alphaSpeed; if(s.alpha>1||s.alpha<0.05)s.alphaDir*=-1;
        ctx.fillStyle=`rgba(210,235,255,${s.alpha})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
      });

      for(let i=shoots.length-1;i>=0;i--){
        const s=shoots[i];
        const ex=s.x+Math.cos(s.angle)*s.len, ey=s.y+Math.sin(s.angle)*s.len;
        const g=ctx.createLinearGradient(s.x,s.y,ex,ey);
        g.addColorStop(0,`rgba(255,255,255,${s.alpha})`);g.addColorStop(0.4,`rgba(100,200,255,${s.alpha*0.6})`);g.addColorStop(1,'transparent');
        ctx.strokeStyle=g;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(ex,ey);ctx.stroke();
        s.x+=Math.cos(s.angle)*s.speed;s.y+=Math.sin(s.angle)*s.speed;s.alpha-=0.02;
        if(s.alpha<=0||s.x>W||s.y>H)shoots.splice(i,1);
      }

      const sy=(Math.sin(t*0.5)*0.5+0.5)*H;
      const sg=ctx.createLinearGradient(0,sy-80,0,sy+80);
      sg.addColorStop(0,'transparent');sg.addColorStop(0.5,'rgba(60,130,255,0.025)');sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg;ctx.fillRect(0,sy-80,W,160);

      animId=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(animId); clearInterval(shootTimer); window.removeEventListener('resize',resize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box} body{background:#010412}
.fOrb{font-family:'Orbitron',monospace} .fRaj{font-family:'Rajdhani',sans-serif}
::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(0,229,255,0.25);border-radius:4px}

.glass{background:rgba(6,14,40,0.75);border:1px solid rgba(0,229,255,0.13);backdrop-filter:blur(20px) saturate(1.5);-webkit-backdrop-filter:blur(20px) saturate(1.5);}
.glass2{background:rgba(10,20,55,0.65);border:1px solid rgba(0,229,255,0.1);backdrop-filter:blur(10px);}
.glowC{box-shadow:0 0 20px rgba(0,229,255,0.22),inset 0 1px 0 rgba(0,229,255,0.1)}
.glowV{box-shadow:0 0 24px rgba(124,77,255,0.28)}
.tGlowC{text-shadow:0 0 22px rgba(0,229,255,0.75)}
.pGlow{box-shadow:0 0 14px rgba(0,229,255,0.65),0 0 28px rgba(41,121,255,0.4)}

@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes spinS{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes borderPulse{0%,100%{border-color:rgba(0,229,255,0.13)}50%{border-color:rgba(0,229,255,0.45)}}
@keyframes scanLine{0%{top:-4px;opacity:.7}100%{top:100%;opacity:0}}
@keyframes popIn{from{opacity:0;transform:scale(0.4) rotateY(90deg)}to{opacity:1;transform:scale(1) rotateY(0)}}
@keyframes countFlip{0%{transform:translateY(-20px);opacity:0}60%{transform:translateY(4px)}100%{transform:translateY(0);opacity:1}}
@keyframes glowPulse{0%,100%{text-shadow:0 0 22px rgba(0,229,255,0.75)}50%{text-shadow:0 0 40px rgba(0,229,255,1),0 0 60px rgba(41,121,255,0.8)}}

.aFU{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) both}
.aFloat{animation:floatY 4s ease-in-out infinite}
.aSpinS{animation:spinS 14s linear infinite}
.aShim{background:linear-gradient(90deg,#00e5ff 0%,#fff 40%,#7c4dff 70%,#00e5ff 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3.5s linear infinite;}
.aBP{animation:borderPulse 2.8s ease-in-out infinite}
.aPI{animation:popIn .45s cubic-bezier(.34,1.56,.64,1) both}
.aFlip{animation:countFlip .4s cubic-bezier(.22,1,.36,1) both}
.aGlowPulse{animation:glowPulse 2s ease-in-out infinite}

.s1{animation-delay:.06s}.s2{animation-delay:.14s}.s3{animation-delay:.22s}
.s4{animation-delay:.30s}.s5{animation-delay:.38s}

.scanC{position:relative;overflow:hidden}
.scanC::after{content:'';position:absolute;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(0,229,255,0.2),transparent);animation:scanLine 5s linear infinite;pointer-events:none;}

.btnP{background:linear-gradient(135deg,#2979ff,#7c4dff);transition:all .2s;position:relative;overflow:hidden;}
.btnP::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent);opacity:0;transition:opacity .2s}
.btnP:hover::after{opacity:1}.btnP:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(41,121,255,0.55)}
.btnP:active{transform:translateY(0)}.btnP:disabled{opacity:.4;pointer-events:none}

.tRow{transition:background .2s,transform .18s,box-shadow .2s}
.tRow:hover{background:rgba(0,229,255,0.045)!important;transform:translateX(5px);box-shadow:inset 3px 0 0 rgba(0,229,255,0.65)}
.tRow:hover .tRowAct{opacity:1!important}

.cbx{transition:all .3s cubic-bezier(.34,1.56,.64,1)}
.cbx:hover{transform:scale(1.18) rotate(6deg)}
.cbx.done{animation:popIn .4s cubic-bezier(.34,1.56,.64,1)}

/* Countdown number flip on change */
.cdNum{display:inline-block;transition:all .3s cubic-bezier(.22,1,.36,1)}

input::placeholder{color:rgba(160,195,255,0.28)} input{color:rgba(200,228,255,0.88)} input:focus{outline:none}
`;

// ─────────────────────────────────────────────────────────────────────────────
// useNow — ticks every second, triggers re-render → countdown updates live
// ─────────────────────────────────────────────────────────────────────────────
function useNow() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t;
}

const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MON_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TodoList() {
  const [todos,       setTodos]       = useState([]);
  const [newTodo,     setNewTodo]     = useState('');
  const [editingId,   setEditingId]   = useState(null);
  const [editText,    setEditText]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [profileImage,setProfileImage]= useState(localStorage.getItem('profileImage') || '/MyImage01.JPG');
  const [imageUrl,    setImageUrl]    = useState('');
  const [showUrl,     setShowUrl]     = useState(false);
  const [adding,      setAdding]      = useState(false);
  const [showAlert,   setShowAlert]   = useState(false);
  const [alertVis,    setAlertVis]    = useState(false);

  // ── This re-renders every second ──────────────────────────────────────────
  const now = useNow();

  // ── LIVE DAY COUNTS (recalculated each render from real date) ─────────────
  const { survived: SURVIVED, remaining: REMAINING } = getDynamicDays();
  const progressPct      = Math.round((SURVIVED / TOTAL_DAYS) * 100);
  const remainingPct     = Math.round((REMAINING / TOTAL_DAYS) * 100);

  // ── Live HH:MM:SS to next midnight ────────────────────────────────────────
  const timeToMidnight = getTimeToMidnight();

  // ── Motivation ────────────────────────────────────────────────────────────
  const motivation = MOTIVATIONAL_MESSAGES[SURVIVED % MOTIVATIONAL_MESSAGES.length];

  // ── Todo stats ────────────────────────────────────────────────────────────
  const doneCnt  = todos.filter(t => t.completed).length;
  const todayPct = todos.length > 0 ? Math.round((doneCnt / todos.length) * 100) : 0;

  // ── Clock ─────────────────────────────────────────────────────────────────
  let h = now.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  const mm      = String(now.getMinutes()).padStart(2,'0');
  const ss      = String(now.getSeconds()).padStart(2,'0');
  const timeStr = `${String(h).padStart(2,'0')}:${mm}`;

  useEffect(() => {
    loadTodos();
    if (localStorage.getItem('lastDayAlertShown') !== new Date().toDateString()) {
      setTimeout(() => { setShowAlert(true); setTimeout(() => setAlertVis(true), 60); }, 800);
    }
  }, []);

  const closeAlert = () => {
    setAlertVis(false);
    setTimeout(() => { setShowAlert(false); localStorage.setItem('lastDayAlertShown', new Date().toDateString()); }, 380);
  };

  const loadTodos = async () => {
    setLoading(true);
    try {
      const d = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.from('ToDo').select('*').eq('active', true)
        .gte('created_at', `${d}T00:00:00`).lte('created_at', `${d}T23:59:59`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTodos(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdd = async () => {
    const v = newTodo.trim(); if (!v) return;
    const d = new Date().toISOString().split('T')[0];
    if (todos.some(x => x.title === v && x.created_at?.startsWith(d))) { alert('Already exists!'); return; }
    setAdding(true);
    try {
      const { data, error } = await supabase.from('ToDo').insert([{ title: v, completed: false, active: true }]).select();
      if (error) throw error;
      if (data?.length) { setTodos(p => [data[0], ...p]); setNewTodo(''); }
    } catch (e) { console.error(e); }
    setTimeout(() => setAdding(false), 300);
  };

  const handleToggle = async (id) => {
    const todo = todos.find(x => x.id === id); if (!todo) return;
    try {
      const { error } = await supabase.from('ToDo').update({ completed: !todo.completed }).eq('id', id);
      if (error) throw error;
      setTodos(todos.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('ToDo').update({ active: false }).eq('id', id);
      if (error) throw error;
      setTodos(todos.filter(x => x.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const { error } = await supabase.from('ToDo').update({ title: editText.trim() }).eq('id', id);
      if (error) throw error;
      setTodos(todos.map(x => x.id === id ? { ...x, title: editText.trim() } : x));
      setEditingId(null); setEditText('');
    } catch (e) { console.error(e); }
  };

  const handleImgUpload = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onloadend = () => { setProfileImage(r.result); localStorage.setItem('profileImage', r.result); };
    r.readAsDataURL(f);
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setProfileImage(imageUrl.trim()); localStorage.setItem('profileImage', imageUrl.trim());
      setImageUrl(''); setShowUrl(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      const d = new Date().toISOString().split('T')[0];
      const { data: ex, error: fe } = await supabase.from('ToDo').select('title')
        .gte('created_at', `${d}T00:00:00`).lte('created_at', `${d}T23:59:59`).eq('active', true);
      if (fe) throw fe;
      const ex2 = ex.map(x => x.title);
      const nd  = defaultTodos.filter(t => !ex2.includes(t)).map(t => ({ title: t, completed: false, active: true }));
      if (!nd.length) { alert('All defaults already loaded!'); return; }
      const { data: ins, error: ie } = await supabase.from('ToDo').insert(nd).select();
      if (ie) throw ie;
      setTodos(p => [...ins, ...p]);
    } catch (e) { console.error(e); }
  };

  // Corner accent helper
  const Corners = ({ color = 'rgba(0,229,255,0.65)' }) => (
    <>
      {[
        { top:0,    left:0,    borderWidth:'2px 0 0 2px', borderRadius:'6px 0 0 0' },
        { top:0,    right:0,   borderWidth:'2px 2px 0 0', borderRadius:'0 6px 0 0' },
        { bottom:0, left:0,    borderWidth:'0 0 2px 2px', borderRadius:'0 0 0 6px' },
        { bottom:0, right:0,   borderWidth:'0 2px 2px 0', borderRadius:'0 0 6px 0' },
      ].map((s,i) => (
        <div key={i} style={{ position:'absolute', width:18, height:18, borderStyle:'solid', borderColor:color, ...s }} />
      ))}
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <CosmicBackground />

      {/* ── DAY ALERT MODAL ─────────────────────────────────────────────── */}
      {showAlert && (
        <div onClick={closeAlert} style={{
          position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',
          background: alertVis ? 'rgba(0,0,0,0.78)' : 'rgba(0,0,0,0)',
          backdropFilter: alertVis ? 'blur(7px)' : 'none', transition:'all .4s',
        }}>
          <div onClick={e=>e.stopPropagation()} className="scanC" style={{
            position:'relative',borderRadius:24,padding:'2rem',maxWidth:360,width:'calc(100% - 2rem)',
            background:'linear-gradient(135deg,rgba(3,8,28,.97),rgba(7,14,46,.97))',
            border:'1px solid rgba(0,229,255,0.35)',
            boxShadow:'0 0 70px rgba(0,229,255,0.18),0 0 130px rgba(41,121,255,0.12),inset 0 1px 0 rgba(0,229,255,0.2)',
            opacity:alertVis?1:0,
            transform:alertVis?'scale(1) translateY(0)':'scale(0.82) translateY(32px)',
            transition:'all .4s cubic-bezier(.22,1,.36,1)',
          }}>
            <Corners />
            <div style={{textAlign:'center'}}>
              <p className="fOrb" style={{fontSize:10,letterSpacing:'0.22em',color:'rgba(0,229,255,0.55)',marginBottom:8}}>
                ⬡ SYSTEM ALERT · DAY INITIALIZED ⬡
              </p>
              <h2 className="aShim fOrb" style={{fontSize:26,fontWeight:900,marginBottom:4}}>GOOD MORNING</h2>
              <p className="fRaj" style={{fontSize:13,color:'rgba(170,200,255,0.55)',marginBottom:24}}>
                Mission Day {SURVIVED + 1} · Sequence starting…
              </p>
              <div style={{background:'rgba(0,229,255,0.04)',border:'1px solid rgba(0,229,255,0.14)',borderRadius:16,padding:20,marginBottom:20}}>
                <div className="fOrb tGlowC aGlowPulse" style={{fontSize:60,fontWeight:900,color:'#00e5ff',lineHeight:1}}>{SURVIVED}</div>
                <div className="fRaj" style={{fontSize:12,color:'rgba(160,195,255,0.5)',marginTop:4}}>days survived · M2H Infotech</div>
                <div style={{height:8,borderRadius:8,overflow:'hidden',background:'rgba(255,255,255,0.05)',margin:'16px 0 6px'}}>
                  <div className="pGlow" style={{height:'100%',borderRadius:8,width:`${progressPct}%`,background:'linear-gradient(90deg,#00e5ff,#2979ff,#7c4dff)'}} />
                </div>
                <div className="fRaj" style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(0,229,255,0.5)'}}>
                  <span>{progressPct}% done</span><span>{REMAINING} days left</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:14}}>
                  {[['SURVIVED',SURVIVED,'#34d399'],['REMAINING',REMAINING,'#f97316'],['TOTAL',TOTAL_DAYS,'#7c4dff']].map(([l,v,c])=>(
                    <div key={l} style={{background:'rgba(255,255,255,0.035)',borderRadius:10,padding:'8px 0',textAlign:'center'}}>
                      <div className="fOrb" style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                      <div className="fRaj" style={{fontSize:10,color:'rgba(160,195,255,0.4)'}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fRaj" style={{background:'rgba(255,215,64,0.05)',border:'1px solid rgba(255,215,64,0.14)',borderRadius:12,padding:14,marginBottom:20,fontSize:13,fontStyle:'italic',color:'rgba(255,215,64,0.82)'}}>
                <Sparkles style={{width:12,height:12,display:'inline',marginRight:6}} />"{motivation}"
              </div>
              <button onClick={closeAlert} className="btnP fOrb" style={{width:'100%',padding:'12px 0',borderRadius:12,color:'#fff',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <Zap style={{width:15,height:15}} /> LAUNCH DAY {SURVIVED + 1}
              </button>
              <p className="fRaj" style={{fontSize:11,color:'rgba(180,200,255,0.25)',marginTop:10}}>[ tap anywhere to dismiss ]</p>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE ─────────────────────────────────────────────────────────── */}
      <div className="fRaj" style={{position:'relative',zIndex:10,minHeight:'100vh'}}>
        <Navbar />
        <div style={{maxWidth:680,margin:'0 auto',padding:'2rem 1rem',display:'flex',flexDirection:'column',gap:20}}>

          {/* ── M2H COUNTDOWN ────────────────────────────────────────────── */}
          <div className="glass glowC scanC aBP aFU" style={{borderRadius:24,padding:24,position:'relative'}}>
            <Corners />

            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18}}>
              <Building2 style={{width:14,height:14,color:'#00e5ff'}} />
              <span className="fOrb" style={{fontSize:10,letterSpacing:'0.2em',color:'rgba(0,229,255,0.55)'}}>
                M2H INFOTECH · MISSION COUNTDOWN
              </span>
            </div>

            {/* ── Big Numbers Row ─────────────────────────────────────────── */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>

              {/* REMAINING — the big countdown */}
              <div className="glass2" style={{borderRadius:18,padding:18,textAlign:'center',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',inset:0,background:'rgba(249,115,22,0.04)',borderRadius:18,pointerEvents:'none'}}/>
                <div className="fRaj" style={{fontSize:11,letterSpacing:'0.15em',color:'rgba(249,115,22,0.6)',marginBottom:6}}>
                  🔥 DAYS REMAINING
                </div>
                <div
                  key={REMAINING}   /* key change triggers re-mount → CSS animation replays */
                  className="fOrb tGlowC aFlip"
                  style={{fontSize:58,fontWeight:900,color:'#f97316',lineHeight:1,textShadow:'0 0 30px rgba(249,115,22,0.7)'}}
                >
                  {REMAINING}
                </div>
                <div className="fRaj" style={{fontSize:11,color:'rgba(249,115,22,0.5)',marginTop:4}}>days to freedom</div>
              </div>

              {/* SURVIVED — rises each day */}
              <div className="glass2" style={{borderRadius:18,padding:18,textAlign:'center',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',inset:0,background:'rgba(52,211,153,0.04)',borderRadius:18,pointerEvents:'none'}}/>
                <div className="fRaj" style={{fontSize:11,letterSpacing:'0.15em',color:'rgba(52,211,153,0.6)',marginBottom:6}}>
                  ⚡ DAYS SURVIVED
                </div>
                <div
                  key={`s-${SURVIVED}`}
                  className="fOrb aFlip"
                  style={{fontSize:58,fontWeight:900,color:'#34d399',lineHeight:1,textShadow:'0 0 30px rgba(52,211,153,0.7)'}}
                >
                  {SURVIVED}
                </div>
                <div className="fRaj" style={{fontSize:11,color:'rgba(52,211,153,0.5)',marginTop:4}}>days done</div>
              </div>
            </div>

            {/* ── Live countdown to next midnight ──────────────────────────── */}
            <div className="glass2" style={{borderRadius:14,padding:'12px 18px',marginBottom:18,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#00e5ff',boxShadow:'0 0 10px #00e5ff',animation:'glowPulse 1s ease-in-out infinite'}} />
                <span className="fRaj" style={{fontSize:12,color:'rgba(0,229,255,0.55)',letterSpacing:'0.1em'}}>NEXT DAY COUNTDOWN</span>
              </div>
              <div className="fOrb" style={{fontSize:22,fontWeight:700,color:'#00e5ff',letterSpacing:'0.08em',textShadow:'0 0 16px rgba(0,229,255,0.7)'}}>
                {/* Each digit segment so seconds tick visually */}
                {timeToMidnight}
              </div>
              <div className="fRaj" style={{fontSize:11,color:'rgba(0,229,255,0.35)'}}>
                HH : MM : SS until day flips
              </div>
            </div>

            {/* ── SVG Progress Ring + bar ───────────────────────────────────── */}
            <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:14}}>
              {/* Donut */}
              <div style={{position:'relative',width:72,height:72,flexShrink:0}}>
                <svg className="aSpinS" viewBox="0 0 72 72" style={{position:'absolute',inset:0,opacity:.15}}>
                  <circle cx="36" cy="36" r="32" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 4"/>
                </svg>
                <svg viewBox="0 0 72 72" style={{position:'absolute',inset:0}}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(0,229,255,0.07)" strokeWidth="6"/>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="url(#cg1)" strokeWidth="6"
                    strokeDasharray={`${progressPct*1.759} 175.9`} strokeLinecap="round" transform="rotate(-90 36 36)"/>
                  <defs><linearGradient id="cg1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00e5ff"/><stop offset="100%" stopColor="#7c4dff"/>
                  </linearGradient></defs>
                </svg>
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span className="fOrb" style={{fontSize:11,fontWeight:700,color:'#00e5ff'}}>{progressPct}%</span>
                </div>
              </div>

              {/* Bar + labels */}
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span className="fRaj" style={{fontSize:12,color:'rgba(0,229,255,0.5)',letterSpacing:'0.1em'}}>JOURNEY PROGRESS</span>
                  <span className="fOrb" style={{fontSize:12,color:'#00e5ff'}}>{progressPct}%</span>
                </div>
                <div style={{height:8,borderRadius:6,overflow:'hidden',background:'rgba(255,255,255,0.05)'}}>
                  <div className="pGlow" style={{height:'100%',borderRadius:6,width:`${progressPct}%`,background:'linear-gradient(90deg,#00e5ff,#2979ff,#7c4dff)',transition:'width 1s ease'}}/>
                </div>
                <div className="fRaj" style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'rgba(0,229,255,0.3)',marginTop:4,letterSpacing:'0.08em'}}>
                  <span>AUG 1 2025</span>
                  <span>{SURVIVED} survived · {REMAINING} remain · {TOTAL_DAYS} total</span>
                  <span>AUG 1 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── PROFILE + CLOCK ──────────────────────────────────────────── */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>

            {/* Profile */}
            <div className="glass glowC aFU s1" style={{borderRadius:24,padding:20,display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
              <div className="aFloat" style={{position:'relative'}}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile"
                    style={{width:110,height:110,borderRadius:18,objectFit:'cover',border:'2px solid rgba(0,229,255,0.3)',boxShadow:'0 0 32px rgba(0,229,255,0.28),0 0 64px rgba(41,121,255,0.18)'}}
                    onError={e=>{e.target.src=`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23050d1f' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2300e5ff' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E`}}/>
                ) : (
                  <div style={{width:110,height:110,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,229,255,0.05)',border:'2px dashed rgba(0,229,255,0.22)'}}>
                    <Camera style={{width:36,height:36,color:'rgba(0,229,255,0.35)'}}/>
                  </div>
                )}
                {profileImage && (
                  <button onClick={()=>{setProfileImage(null);localStorage.removeItem('profileImage')}}
                    style={{position:'absolute',top:-8,right:-8,width:22,height:22,borderRadius:'50%',background:'#f50057',boxShadow:'0 0 10px rgba(245,0,87,0.55)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
                    <X style={{width:11,height:11}}/>
                  </button>
                )}
              </div>
              <div style={{width:'100%',display:'flex',flexDirection:'column',gap:8}}>
                <label style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px 0',borderRadius:12,cursor:'pointer',border:'1px solid rgba(0,229,255,0.2)',background:'rgba(0,229,255,0.06)',color:'#00e5ff',fontSize:13,fontWeight:600,fontFamily:'Rajdhani,sans-serif',transition:'all .2s'}}>
                  <Camera style={{width:14,height:14}}/> Upload
                  <input type="file" accept="image/*" onChange={handleImgUpload} style={{display:'none'}}/>
                </label>
                {!showUrl ? (
                  <button onClick={()=>setShowUrl(true)} style={{width:'100%',padding:'10px 0',borderRadius:12,border:'1px solid rgba(124,77,255,0.22)',background:'rgba(124,77,255,0.07)',color:'#7c4dff',fontSize:13,fontWeight:600,fontFamily:'Rajdhani,sans-serif',cursor:'pointer'}}>
                    Use URL
                  </button>
                ) : (
                  <div style={{display:'flex',gap:6}}>
                    <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleUrlSubmit()} placeholder="Image URL…"
                      style={{flex:1,padding:'8px 12px',borderRadius:10,border:'1px solid rgba(0,229,255,0.22)',background:'rgba(0,229,255,0.04)',fontSize:12,fontFamily:'Rajdhani,sans-serif'}}/>
                    <button onClick={handleUrlSubmit} style={{padding:'8px 12px',borderRadius:10,background:'rgba(0,229,255,0.14)',border:'none',color:'#00e5ff',fontSize:12,cursor:'pointer',fontWeight:700}}>OK</button>
                    <button onClick={()=>{setShowUrl(false);setImageUrl('')}} style={{padding:'8px 10px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:'none',color:'rgba(180,200,255,0.5)',cursor:'pointer'}}>
                      <X style={{width:12,height:12}}/>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Clock */}
            <div className="glass glowV aFU s2" style={{borderRadius:24,padding:24,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:'linear-gradient(135deg,rgba(6,8,32,.88),rgba(10,6,38,.88))'}}>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
                <div className="aSpinS" style={{width:200,height:200,borderRadius:'50%',border:'1px solid rgba(124,77,255,0.11)'}}/>
              </div>
              <div style={{position:'relative',textAlign:'center'}}>
                <div className="fOrb" style={{fontSize:11,letterSpacing:'0.2em',color:'rgba(124,77,255,0.55)',marginBottom:8}}>
                  {DAY_NAMES[now.getDay()]} · {now.getDate()} {MON_NAMES[now.getMonth()]}
                </div>
                <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:6}}>
                  <span className="fOrb tGlowC" style={{fontSize:48,fontWeight:900,color:'#00e5ff',lineHeight:1}}>{timeStr}</span>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:4}}>
                    <span className="fOrb" style={{fontSize:11,fontWeight:700,color:'rgba(0,229,255,0.55)'}}>{ampm}</span>
                    <span className="fOrb" style={{fontSize:24,fontWeight:700,color:'#7c4dff'}}>{ss}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:12}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#00e5ff',opacity:now.getSeconds()%3===i?1:.18,transition:'opacity .3s',boxShadow:now.getSeconds()%3===i?'0 0 8px #00e5ff':'none'}}/>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── DAILY TASK PROGRESS ──────────────────────────────────────── */}
          {todos.length > 0 && (
            <div className="glass glowC aFU s3" style={{borderRadius:24,padding:22}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <TrendingUp style={{width:14,height:14,color:'#00e5ff'}}/>
                  <span className="fOrb" style={{fontSize:10,letterSpacing:'0.18em',color:'rgba(0,229,255,0.55)'}}>TODAY'S TASK PROGRESS</span>
                </div>
                <span className="fOrb tGlowC" style={{fontSize:30,fontWeight:900,color:'#00e5ff'}}>{todayPct}%</span>
              </div>
              <div style={{height:10,borderRadius:8,overflow:'hidden',background:'rgba(255,255,255,0.05)',marginBottom:14}}>
                <div className="pGlow" style={{height:'100%',borderRadius:8,width:`${todayPct}%`,background:'linear-gradient(90deg,#00e5ff,#2979ff,#7c4dff)',transition:'width .7s ease'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[['TOTAL',todos.length,'#00e5ff'],['DONE',doneCnt,'#34d399'],['LEFT',todos.length-doneCnt,'#f97316']].map(([l,v,c])=>(
                  <div key={l} className="glass2" style={{borderRadius:14,padding:'12px 8px',textAlign:'center'}}>
                    <div className="fOrb" style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
                    <div className="fRaj" style={{fontSize:11,color:'rgba(160,195,255,0.38)'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TASKS PANEL ──────────────────────────────────────────────── */}
          <div className="glass glowC aFU s4" style={{borderRadius:24,overflow:'hidden'}}>

            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:'1px solid rgba(0,229,255,0.09)',background:'rgba(0,229,255,0.025)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Sparkles style={{width:14,height:14,color:'#00e5ff'}}/>
                <span className="fOrb" style={{fontSize:12,letterSpacing:'0.15em',color:'#00e5ff'}}>TODAY'S TASKS</span>
                {todos.length>0&&(
                  <span className="fOrb" style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'rgba(0,229,255,0.1)',border:'1px solid rgba(0,229,255,0.2)',color:'rgba(0,229,255,0.65)'}}>{todos.length}</span>
                )}
              </div>
              <button onClick={handleRegenerate} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 16px',borderRadius:12,border:'1px solid rgba(124,77,255,0.25)',background:'rgba(124,77,255,0.08)',color:'#7c4dff',fontSize:12,fontWeight:600,fontFamily:'Rajdhani,sans-serif',cursor:'pointer',transition:'all .2s'}}>
                <RefreshCw style={{width:13,height:13}}/> Defaults
              </button>
            </div>

            {/* Add input */}
            <div style={{padding:'14px 24px',borderBottom:'1px solid rgba(0,229,255,0.07)'}}>
              <div style={{display:'flex',gap:12}}>
                <input value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()}
                  placeholder="Add a new mission objective…"
                  style={{flex:1,padding:'12px 18px',borderRadius:14,border:'1px solid rgba(0,229,255,0.15)',background:'rgba(0,229,255,0.04)',fontSize:13,fontFamily:'Rajdhani,sans-serif',fontWeight:500,transition:'border-color .2s'}}
                  onFocus={e=>e.target.style.borderColor='rgba(0,229,255,0.5)'}
                  onBlur={e=>e.target.style.borderColor='rgba(0,229,255,0.15)'}/>
                <button onClick={handleAdd} disabled={adding||!newTodo.trim()} className="btnP fOrb"
                  style={{padding:'12px 20px',borderRadius:14,color:'#fff',fontSize:12,fontWeight:700,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                  <Plus style={{width:14,height:14}}/> ADD
                </button>
              </div>
            </div>

            {/* List */}
            <div>
              {loading ? (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'56px 0',gap:12,color:'rgba(0,229,255,0.45)'}}>
                  <RefreshCw style={{width:18,height:18,animation:'spinS 1s linear infinite'}}/>
                  <span className="fRaj" style={{fontSize:14}}>Loading objectives…</span>
                </div>
              ) : todos.length===0 ? (
                <div style={{textAlign:'center',padding:'56px 0'}}>
                  <div className="aFloat" style={{fontSize:36,marginBottom:12,display:'inline-block'}}>◈</div>
                  <p className="fOrb" style={{fontSize:12,color:'rgba(0,229,255,0.35)'}}>NO ACTIVE OBJECTIVES</p>
                  <p className="fRaj" style={{fontSize:12,color:'rgba(160,195,255,0.28)',marginTop:4}}>Add a task or load defaults</p>
                </div>
              ) : todos.map((todo,idx)=>(
                <div key={todo.id} className="tRow" style={{display:'flex',alignItems:'center',gap:12,padding:'13px 24px',borderBottom:'1px solid rgba(0,229,255,0.045)'}}>
                  <span className="fOrb" style={{fontSize:10,width:22,textAlign:'center',color:'rgba(0,229,255,0.22)',flexShrink:0}}>
                    {String(idx+1).padStart(2,'0')}
                  </span>
                  {editingId===todo.id ? (
                    <>
                      <input value={editText} onChange={e=>setEditText(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter')handleEdit(todo.id);if(e.key==='Escape'){setEditingId(null);setEditText('')}}}
                        style={{flex:1,padding:'9px 14px',borderRadius:12,border:'1px solid rgba(0,229,255,0.38)',background:'rgba(0,229,255,0.05)',fontSize:13,fontFamily:'Rajdhani,sans-serif'}}
                        autoFocus/>
                      <button onClick={()=>handleEdit(todo.id)} style={{padding:'9px 11px',borderRadius:11,border:'1px solid rgba(52,211,153,0.3)',background:'rgba(52,211,153,0.1)',color:'#34d399',cursor:'pointer'}}>
                        <Check style={{width:14,height:14}}/>
                      </button>
                      <button onClick={()=>{setEditingId(null);setEditText('')}} style={{padding:'9px 11px',borderRadius:11,border:'none',background:'rgba(255,255,255,0.04)',color:'rgba(180,200,255,0.45)',cursor:'pointer'}}>
                        <X style={{width:14,height:14}}/>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>handleToggle(todo.id)} className={`cbx ${todo.completed?'done':''}`}
                        style={{width:28,height:28,borderRadius:9,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer',
                          ...(todo.completed
                            ?{background:'linear-gradient(135deg,#00e5ff,#2979ff)',boxShadow:'0 0 16px rgba(0,229,255,0.55)'}
                            :{background:'transparent',border:'2px solid rgba(0,229,255,0.2)'})
                        }}>
                        {todo.completed&&<Check style={{width:14,height:14,color:'#fff',strokeWidth:3}}/>}
                      </button>
                      <span className="fRaj" style={{flex:1,fontSize:14,fontWeight:500,color:todo.completed?'rgba(160,195,255,0.3)':'rgba(200,228,255,0.84)',textDecoration:todo.completed?'line-through':'none'}}>
                        {todo.title}
                      </span>
                      <div className="tRowAct" style={{display:'flex',gap:6,opacity:0,transition:'opacity .2s'}}>
                        <button onClick={()=>{setEditingId(todo.id);setEditText(todo.title)}} style={{padding:'7px 9px',borderRadius:10,border:'none',background:'rgba(41,121,255,0.1)',color:'#2979ff',cursor:'pointer'}}>
                          <Edit2 style={{width:13,height:13}}/>
                        </button>
                        <button onClick={()=>handleDelete(todo.id)} style={{padding:'7px 9px',borderRadius:10,border:'none',background:'rgba(245,0,87,0.1)',color:'#f50057',cursor:'pointer'}}>
                          <Trash2 style={{width:13,height:13}}/>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {todos.length>0&&(
              <div className="fOrb" style={{padding:'14px 24px',textAlign:'center',borderTop:'1px solid rgba(0,229,255,0.07)',background:'rgba(0,229,255,0.015)',fontSize:10,letterSpacing:'0.18em',color:'rgba(0,229,255,0.3)'}}>
                ⬡ {doneCnt} / {todos.length} OBJECTIVES CLEARED ⬡
              </div>
            )}
          </div>

          {/* ── QUOTES ───────────────────────────────────────────────────── */}
          <div className="aFU s5"><TodaysQuotes /></div>

        </div>
      </div>

      <style>{`
        .tRow:hover .tRowAct { opacity: 1 !important; }
        @keyframes spinS { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}