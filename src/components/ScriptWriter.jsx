import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase";
import Navbar from "./NavBar";
import {
    FileText, Plus, Trash2, Save, Copy, Check, Sparkles, Loader2,
    ChevronDown, ChevronUp, Edit3, X, Download, Clock, Tag, Search,
    Wand2, AlignLeft, List, Hash, Bold, Italic, RotateCcw, Eye, EyeOff
} from "lucide-react";

const GROQ_API_KEY = "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";

const CATEGORIES = ["YouTube", "Podcast", "Reel", "Speech", "Story", "Ad", "Other"];
const TONES = ["Motivational", "Casual", "Professional", "Humorous", "Dramatic", "Educational"];
const QUICK_ACTIONS = [
    { label: "Add Hook", prompt: "Write a powerful attention-grabbing hook for this script. Return only the hook text." },
    { label: "Add CTA", prompt: "Write a compelling call-to-action ending for this script. Return only the CTA text." },
    { label: "Improve Flow", prompt: "Rewrite this script with better flow and transitions. Keep the same content but make it smoother." },
    { label: "Make Shorter", prompt: "Condense this script to 60% of its length while keeping all key points." },
    { label: "Make Longer", prompt: "Expand this script with more detail, examples, and depth. Keep the same tone." },
    { label: "Fix Grammar", prompt: "Fix all grammar, punctuation, and spelling errors in this script. Return the corrected script only." },
];

async function callGroq(messages) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, temperature: 0.8, max_tokens: 2048 }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.choices[0].message.content;
}

function wordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function readTime(text) {
    const wpm = 150;
    const mins = Math.ceil(wordCount(text) / wpm);
    return mins < 1 ? "<1 min" : `~${mins} min`;
}

export default function ScriptWriter() {
    const [scripts, setScripts] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("YouTube");
    const [tone, setTone] = useState("Motivational");
    const [tags, setTags] = useState("");
    const [search, setSearch] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [preview, setPreview] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [aiPanel, setAiPanel] = useState(true);
    const textareaRef = useRef(null);
    const historyRef = useRef([]);

    useEffect(() => { loadScripts(); }, []);

    async function loadScripts() {
        const { data } = await supabase.from("scripts").select("*").order("updated_at", { ascending: false });
        setScripts(data || []);
    }

    function pushHistory(val) {
        const newH = [...historyRef.current.slice(0, historyIdx + 1), val].slice(-50);
        historyRef.current = newH;
        setHistory(newH);
        setHistoryIdx(newH.length - 1);
    }

    function handleContentChange(val) {
        setContent(val);
        pushHistory(val);
    }

    function undo() {
        if (historyIdx > 0) {
            const idx = historyIdx - 1;
            setHistoryIdx(idx);
            setContent(historyRef.current[idx]);
        }
    }

    function openScript(s) {
        setActiveId(s.id);
        setTitle(s.title);
        setContent(s.content);
        setCategory(s.category || "YouTube");
        setTone(s.tone || "Motivational");
        setTags(s.tags || "");
        historyRef.current = [s.content];
        setHistory([s.content]);
        setHistoryIdx(0);
    }

    function newScript() {
        setActiveId(null);
        setTitle("");
        setContent("");
        setCategory("YouTube");
        setTone("Motivational");
        setTags("");
        historyRef.current = [""];
        setHistory([""]);
        setHistoryIdx(0);
    }

    async function saveScript() {
        if (!title.trim()) { alert("Please enter a title first."); return; }
        setSaving(true);
        const payload = { title, content, category, tone, tags, updated_at: new Date().toISOString() };
        try {
            if (activeId) {
                const { error } = await supabase.from("scripts").update(payload).eq("id", activeId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from("scripts").insert({ ...payload, created_at: new Date().toISOString() }).select().single();
                if (error) throw error;
                if (data) setActiveId(data.id);
            }
            await loadScripts();
        } catch (err) {
            alert("Save failed: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteScript(id) {
        await supabase.from("scripts").delete().eq("id", id);
        if (activeId === id) newScript();
        await loadScripts();
    }

    async function generateWithAI(customPrompt) {
        const prompt = customPrompt || aiPrompt;
        if (!prompt.trim()) return;
        setAiLoading(true);
        try {
            const systemMsg = `You are a professional script writer. Write scripts that are engaging, well-structured, and ready to use. Tone: ${tone}. Category: ${category}.`;
            let userMsg;
            if (content.trim() && !customPrompt) {
                userMsg = `Current script:\n${content}\n\nInstruction: ${prompt}`;
            } else if (content.trim() && customPrompt) {
                userMsg = `Current script:\n${content}\n\n${prompt}`;
            } else {
                userMsg = `Write a ${tone.toLowerCase()} ${category} script about: ${prompt}`;
            }
            const result = await callGroq([{ role: "system", content: systemMsg }, { role: "user", content: userMsg }]);
            handleContentChange(result);
            if (!customPrompt) setAiPrompt("");
        } catch (err) {
            alert(err.message);
        } finally {
            setAiLoading(false);
        }
    }

    function insertFormat(prefix, suffix = "") {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = content.slice(start, end);
        const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
        handleContentChange(newContent);
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
    }

    function copyContent() {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function downloadScript() {
        const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${title || "script"}.txt`; a.click();
        URL.revokeObjectURL(url);
    }

    const filtered = scripts.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.tags || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
            <Navbar />

            <style>{`
                .sw-body { font-family: 'Inter', sans-serif; }
                .glass { background: rgba(15,23,42,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
                .script-textarea { font-family: 'Georgia', serif; font-size: 15px; line-height: 1.9; resize: none; background: transparent; outline: none; width: 100%; color: #e2e8f0; }
                .script-textarea::placeholder { color: #334155; }
                ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
            `}</style>

            <div className="flex h-[calc(100vh-64px)] sw-body">

                {/* Sidebar */}
                <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="glass border-r border-white/5 flex flex-col shrink-0 overflow-hidden">
                        <div className="p-4 border-b border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText size={16} className="text-cyan-400" />
                                <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Scripts</span>
                                <button onClick={newScript} className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}>
                                    <Plus size={13} className="text-cyan-400" />
                                </button>
                            </div>
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scripts..."
                                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }} />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filtered.length === 0 && (
                                <p className="text-xs text-slate-600 text-center py-8">No scripts yet</p>
                            )}
                            {filtered.map(s => (
                                <div key={s.id} onClick={() => openScript(s)}
                                    className="group flex items-start gap-2 p-3 rounded-xl cursor-pointer transition-all duration-150"
                                    style={{ background: activeId === s.id ? "rgba(34,211,238,0.08)" : "transparent", border: activeId === s.id ? "1px solid rgba(34,211,238,0.2)" : "1px solid transparent" }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-200 truncate">{s.title}</p>
                                        <p className="text-[10px] text-slate-600 mt-0.5">{s.category} · {new Date(s.updated_at).toLocaleDateString()}</p>
                                        {s.tags && <p className="text-[10px] text-cyan-600 mt-0.5 truncate">{s.tags}</p>}
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); deleteScript(s.id); }}
                                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center transition-opacity shrink-0 mt-0.5"
                                        style={{ background: "rgba(239,68,68,0.15)" }}>
                                        <Trash2 size={10} className="text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Main Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Toolbar */}
                    <div className="glass border-b border-white/5 px-4 py-2.5 flex items-center gap-2 flex-wrap">
                        <button onClick={() => setSidebarOpen(v => !v)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <List size={14} className="text-slate-400" />
                        </button>

                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter script title..."
                            className="flex-1 min-w-[160px] bg-transparent text-sm font-semibold text-slate-200 placeholder-slate-500 outline-none px-3 py-1.5 rounded-lg"
                            style={{ border: title.trim() ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(239,68,68,0.4)", background: title.trim() ? "transparent" : "rgba(239,68,68,0.05)" }} />

                        <select value={category} onChange={e => setCategory(e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg outline-none text-slate-300"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select value={tone} onChange={e => setTone(e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg outline-none text-slate-300"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                            <button onClick={() => insertFormat("**", "**")} title="Bold" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5"><Bold size={13} className="text-slate-400" /></button>
                            <button onClick={() => insertFormat("_", "_")} title="Italic" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5"><Italic size={13} className="text-slate-400" /></button>
                            <button onClick={() => insertFormat("\n# ")} title="Heading" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5"><Hash size={13} className="text-slate-400" /></button>
                            <button onClick={() => insertFormat("\n- ")} title="List" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5"><AlignLeft size={13} className="text-slate-400" /></button>
                        </div>

                        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                            <button onClick={undo} disabled={historyIdx <= 0} title="Undo" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5 disabled:opacity-30"><RotateCcw size={13} className="text-slate-400" /></button>
                            <button onClick={() => setPreview(v => !v)} title="Preview" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5">
                                {preview ? <EyeOff size={13} className="text-cyan-400" /> : <Eye size={13} className="text-slate-400" />}
                            </button>
                            <button onClick={copyContent} title="Copy" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5">
                                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-slate-400" />}
                            </button>
                            <button onClick={downloadScript} title="Download" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5"><Download size={13} className="text-slate-400" /></button>
                        </div>

                        <button onClick={saveScript} disabled={saving || !title.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                            style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee" }}>
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            Save
                        </button>
                    </div>

                    {/* Tags bar */}
                    <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                        <Tag size={12} className="text-slate-600 shrink-0" />
                        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)..."
                            className="flex-1 bg-transparent text-xs text-slate-400 placeholder-slate-700 outline-none" />
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono shrink-0">
                            <span><Clock size={10} className="inline mr-1" />{readTime(content)}</span>
                            <span>{wordCount(content)} words</span>
                            <span>{content.length} chars</span>
                        </div>
                    </div>

                    {/* Editor area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {preview ? (
                            <div className="max-w-2xl mx-auto prose prose-invert prose-sm">
                                <h1 className="text-2xl font-bold text-slate-100 mb-4">{title || "Untitled"}</h1>
                                <div className="text-slate-300 leading-8 whitespace-pre-wrap" style={{ fontFamily: "Georgia, serif", fontSize: 15 }}>{content || <span className="text-slate-600">Nothing to preview yet.</span>}</div>
                            </div>
                        ) : (
                            <textarea ref={textareaRef} value={content} onChange={e => handleContentChange(e.target.value)}
                                placeholder="Start writing your script here, or use AI to generate one..."
                                className="script-textarea min-h-full"
                                style={{ minHeight: "calc(100vh - 280px)" }} />
                        )}
                    </div>
                </div>

                {/* AI Panel */}
                <AnimatePresence>
                {aiPanel && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="glass border-l border-white/5 flex flex-col shrink-0 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center gap-2">
                            <Wand2 size={15} className="text-violet-400" />
                            <span className="text-sm font-bold text-violet-400 uppercase tracking-widest">AI Writer</span>
                            <button onClick={() => setAiPanel(false)} className="ml-auto"><X size={14} className="text-slate-600" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Generate */}
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">Generate / Edit</p>
                                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                                    placeholder="Describe what to write or how to edit the current script..."
                                    rows={4} className="w-full text-xs text-slate-300 placeholder-slate-600 outline-none p-3 rounded-xl resize-none"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                                <button onClick={() => generateWithAI()} disabled={aiLoading || !aiPrompt.trim()}
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                                    style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                                    {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                    {content.trim() ? "Edit with AI" : "Generate Script"}
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">Quick Actions</p>
                                <div className="space-y-1.5">
                                    {QUICK_ACTIONS.map(({ label, prompt }) => (
                                        <button key={label} onClick={() => generateWithAI(prompt)} disabled={aiLoading || !content.trim()}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 transition-all disabled:opacity-30 hover:bg-white/[0.04]"
                                            style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Script Info */}
                            {activeId && (
                                <div className="rounded-xl p-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Script Info</p>
                                    <div className="flex justify-between text-xs"><span className="text-slate-500">Category</span><span className="text-slate-300">{category}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-500">Tone</span><span className="text-slate-300">{tone}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-500">Words</span><span className="text-slate-300">{wordCount(content)}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-500">Read time</span><span className="text-slate-300">{readTime(content)}</span></div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Toggle AI panel when closed */}
                {!aiPanel && (
                    <button onClick={() => setAiPanel(true)}
                        className="fixed right-4 bottom-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg z-50 transition-all"
                        style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}>
                        <Wand2 size={18} className="text-violet-400" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
