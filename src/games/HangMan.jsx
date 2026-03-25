import React, { useState, useEffect, useCallback } from "react";

const CATEGORIES = {
    "🦁 Animals": {
        color: "#22c55e",
        glow: "#22c55e44",
        grad: "linear-gradient(135deg,#16a34a,#15803d)",
        bg: "#052e16",
        border: "#166534",
        words: [
            "elephant", "crocodile", "flamingo", "penguin", "cheetah", "dolphin", "gorilla", "kangaroo", "platypus", "chameleon", "wolverine", "armadillo",
            "alligator", "buffalo", "chimpanzee", "leopard", "rhinoceros", "hippopotamus", "porcupine", "salamander", "hedgehog", "meerkat", "mongoose",
            "panther", "jaguar", "hyena", "antelope", "gazelle", "walrus", "otter", "beaver", "weasel", "lemur", "baboon", "yak", "bison", "caribou"
        ]
    },

    "🌍 Countries": {
        color: "#60a5fa",
        glow: "#60a5fa44",
        grad: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        bg: "#0c1a3a",
        border: "#1e40af",
        words: [
            "brazil", "germany", "nigeria", "pakistan", "iceland", "vietnam", "portugal", "argentina", "cambodia", "ethiopia", "venezuela", "indonesia",
            "australia", "canada", "france", "spain", "italy", "norway", "sweden", "finland", "denmark", "poland", "ukraine", "turkey",
            "mexico", "chile", "peru", "colombia", "egypt", "morocco", "kenya", "tanzania", "iran", "iraq", "nepal", "bhutan", "malaysia", "thailand"
        ]
    },

    "⚽ Sports": {
        color: "#fbbf24",
        glow: "#fbbf2444",
        grad: "linear-gradient(135deg,#d97706,#b45309)",
        bg: "#2d1a00",
        border: "#92400e",
        words: [
            "archery", "badminton", "cricket", "fencing", "kayaking", "lacrosse", "triathlon", "volleyball", "wrestling", "gymnastics", "snowboarding", "skateboarding",
            "football", "basketball", "baseball", "tennis", "rugby", "hockey", "boxing", "cycling", "swimming", "rowing", "surfing", "diving",
            "handball", "karate", "taekwondo", "judo", "golf", "marathon", "sprinting", "weightlifting", "equestrian", "polo", "bowling", "snooker"
        ]
    },

    "🔬 Science": {
        color: "#c084fc",
        glow: "#c084fc44",
        grad: "linear-gradient(135deg,#7c3aed,#6d28d9)",
        bg: "#1e0a3c",
        border: "#5b21b6",
        words: [
            "molecule", "gravity", "neutron", "hydrogen", "electron", "telescope", "photon", "catalyst", "membrane", "chromosome", "ecosystem", "radiation",
            "atom", "protein", "enzyme", "bacteria", "virus", "quantum", "relativity", "photosynthesis", "evaporation", "condensation", "oxidation",
            "electricity", "magnetism", "astronomy", "geology", "biology", "chemistry", "physics", "nucleus", "isotope", "galaxy", "asteroid", "meteor", "satellite"
        ]
    },

    "🎬 Movies": {
        color: "#f472b6",
        glow: "#f472b644",
        grad: "linear-gradient(135deg,#db2777,#be185d)",
        bg: "#2d0a1e",
        border: "#9d174d",
        words: [
            "inception", "titanic", "gladiator", "parasite", "interstellar", "avatar", "spotlight", "whiplash", "joker", "dunkirk", "braveheart", "casablanca",
            "godfather", "rocky", "matrix", "goodfellas", "scarface", "psycho", "amadeus", "notebook", "frozen", "coco", "up", "ratatouille",
            "jaws", "alien", "terminator", "batman", "superman", "spiderman", "deadpool", "avengers", "thor", "hulk", "ironman", "blackpanther"
        ]
    },

    "🍕 Food": {
        color: "#f87171",
        glow: "#f8717144",
        grad: "linear-gradient(135deg,#dc2626,#b91c1c)",
        bg: "#2d0a0a",
        border: "#991b1b",
        words: [
            "avocado", "broccoli", "cinnamon", "dumpling", "espresso", "focaccia", "goulash", "hummus", "jalapeno", "kimchi", "lasagna", "marzipan",
            "pizza", "burger", "sandwich", "pancake", "waffle", "omelette", "noodles", "spaghetti", "biryani", "sushi", "tacos", "burrito",
            "cheesecake", "brownie", "cupcake", "donut", "croissant", "bagel", "steak", "sausage", "meatball", "risotto", "paella", "ramen"
        ]
    },

    "💻 Tech": {
        color: "#38bdf8",
        glow: "#38bdf844",
        grad: "linear-gradient(135deg,#0ea5e9,#0284c7)",
        bg: "#082f49",
        border: "#0369a1",
        words: [
            "javascript", "python", "react", "docker", "kubernetes", "algorithm", "database",
            "frontend", "backend", "compiler", "encryption", "firewall", "protocol",
            "bandwidth", "latency", "debugging", "framework", "typescript", "nodejs",
            "graphql", "redis", "mongodb", "api", "binary", "cache", "thread", "process"
        ]
    },

    "🎮 Games": {
        color: "#a78bfa",
        glow: "#a78bfa44",
        grad: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
        bg: "#1e1b4b",
        border: "#5b21b6",
        words: [
            "minecraft", "fortnite", "valorant", "overwatch", "pubg", "tetris", "pacman",
            "zelda", "mario", "pokemon", "cyberpunk", "doom", "halo", "warcraft",
            "skyrim", "eldenring", "fifa", "callofduty", "assassins", "uncharted",
            "godofwar", "witcher", "roblox", "clashroyale", "amongus"
        ]
    },

    "🏙️ Cities": {
        color: "#facc15",
        glow: "#facc1544",
        grad: "linear-gradient(135deg,#eab308,#ca8a04)",
        bg: "#422006",
        border: "#a16207",
        words: [
            "london", "paris", "tokyo", "delhi", "mumbai", "beijing", "shanghai",
            "dubai", "singapore", "sydney", "berlin", "madrid", "rome",
            "amsterdam", "toronto", "chicago", "seoul", "bangkok", "istanbul"
        ]
    },

    "🎵 Music": {
        color: "#f472b6",
        glow: "#f472b644",
        grad: "linear-gradient(135deg,#ec4899,#be185d)",
        bg: "#3f0a1e",
        border: "#9d174d",
        words: [
            "guitar", "piano", "violin", "drums", "saxophone", "trumpet", "melody",
            "rhythm", "harmony", "playlist", "concert", "orchestra", "composer",
            "singer", "album", "spotify", "lyrics", "acoustic", "microphone"
        ]
    },

    "📚 Books": {
        color: "#34d399",
        glow: "#34d39944",
        grad: "linear-gradient(135deg,#10b981,#047857)",
        bg: "#022c22",
        border: "#065f46",
        words: [
            "harrypotter", "hobbit", "dracula", "frankenstein", "odyssey",
            "sherlock", "gatsby", "dune", "twilight", "mockingbird",
            "inferno", "hamlet", "macbeth", "iliad", "catcher", "alchemist"
        ]
    },

    "🚗 Vehicles": {
        color: "#fb923c",
        glow: "#fb923c44",
        grad: "linear-gradient(135deg,#f97316,#c2410c)",
        bg: "#431407",
        border: "#9a3412",
        words: [
            "car", "truck", "bicycle", "motorcycle", "airplane", "helicopter",
            "submarine", "yacht", "scooter", "bus", "train", "tram", "rocket",
            "spaceship", "jeep", "taxi", "ambulance", "bulldozer"
        ]
    },

    "🏷️ Brands": {
        color: "#60a5fa",
        glow: "#60a5fa44",
        grad: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
        bg: "#0c1a3a",
        border: "#1e40af",
        words: [
            "google", "apple", "microsoft", "amazon", "netflix", "tesla",
            "nike", "adidas", "samsung", "intel", "amd", "uber", "spotify",
            "youtube", "instagram", "facebook", "whatsapp", "snapchat"
        ]
    },

    "👨‍⚕️ Professions": {
        color: "#4ade80",
        glow: "#4ade8044",
        grad: "linear-gradient(135deg,#22c55e,#15803d)",
        bg: "#052e16",
        border: "#166534",
        words: [
            "doctor", "engineer", "teacher", "lawyer", "architect", "scientist",
            "pilot", "chef", "nurse", "dentist", "pharmacist", "journalist",
            "photographer", "designer", "developer", "mechanic", "electrician",
            "plumber", "firefighter", "police", "soldier", "actor", "director",
            "producer", "writer", "editor", "translator", "accountant"
        ]
    },

    "🦸 Superheroes": {
        color: "#ef4444",
        glow: "#ef444444",
        grad: "linear-gradient(135deg,#dc2626,#991b1b)",
        bg: "#2d0a0a",
        border: "#7f1d1d",
        words: [
            "batman", "superman", "spiderman", "ironman", "hulk", "thor",
            "flash", "aquaman", "wolverine", "deadpool", "cyclops",
            "blackwidow", "hawkeye", "vision", "antman", "wasp",
            "doctorstrange", "greenlantern", "shazam", "nightwing",
            "robin", "blade", "punisher", "daredevil"
        ]
    }
};

const MAX_WRONG = 6;
const LS_KEY = "hangman_stats_v4";

function HangmanSVG({ wrong, accent, glow }) {
    const dead = wrong >= MAX_WRONG;
    const bodyColor = dead ? "#f87171" : accent;

    return (
        <svg viewBox="0 0 220 240" width="200" height="200" style={{ display: "block", margin: "0 auto" }}>
            {/* Gallows */}
            <line x1="20" y1="228" x2="155" y2="228" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="58" y1="228" x2="58" y2="18" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="58" y1="18" x2="148" y2="18" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="148" y1="18" x2="148" y2="46" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <line x1="58" y1="48" x2="95" y2="18" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

            {wrong >= 1 && (
                <circle cx="148" cy="62" r="17" stroke={bodyColor} strokeWidth="3"
                    fill={dead ? "#450a0a" : "#0f172a"}
                    style={{ filter: `drop-shadow(0 0 6px ${dead ? "#f87171" : glow?.replace("44", "99") || accent})`, animation: "popIn .28s cubic-bezier(.34,1.56,.64,1)" }} />
            )}
            {wrong >= 2 && (
                <line x1="148" y1="79" x2="148" y2="145" stroke={bodyColor} strokeWidth="3.5" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${bodyColor})`, animation: "popIn .28s ease-out" }} />
            )}
            {wrong >= 3 && (
                <line x1="148" y1="98" x2="124" y2="124" stroke={bodyColor} strokeWidth="3" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${bodyColor})`, animation: "popIn .28s ease-out" }} />
            )}
            {wrong >= 4 && (
                <line x1="148" y1="98" x2="172" y2="124" stroke={bodyColor} strokeWidth="3" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${bodyColor})`, animation: "popIn .28s ease-out" }} />
            )}
            {wrong >= 5 && (
                <line x1="148" y1="145" x2="124" y2="178" stroke={bodyColor} strokeWidth="3" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${bodyColor})`, animation: "popIn .28s ease-out" }} />
            )}
            {wrong >= 6 && (
                <line x1="148" y1="145" x2="172" y2="178" stroke={bodyColor} strokeWidth="3" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${bodyColor})`, animation: "popIn .28s ease-out" }} />
            )}

            {wrong >= 1 && !dead && (
                <>
                    <circle cx="142" cy="59" r="2.5" fill={accent} />
                    <circle cx="154" cy="59" r="2.5" fill={accent} />
                    <path d="M141 68 Q148 74 155 68" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            )}
            {dead && (
                <>
                    <line x1="140" y1="56" x2="145" y2="61" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="145" y1="56" x2="140" y2="61" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="151" y1="56" x2="156" y2="61" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="156" y1="56" x2="151" y2="61" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M141 70 Q148 65 155 70" stroke="#f87171" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            )}
            <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(0.5); transform-origin:148px 120px; }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
        </svg>
    );
}

export default function Hangman() {
    const [word, setWord] = useState("");
    const [catKey, setCatKey] = useState("");
    const [guessed, setGuessed] = useState(new Set());
    const [phase, setPhase] = useState("idle");
    const [shake, setShake] = useState(false);
    const [stats, setStats] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_KEY)) || { wins: 0, losses: 0, streak: 0, best: 0 }; }
        catch { return { wins: 0, losses: 0, streak: 0, best: 0 }; }
    });

    const cat = CATEGORIES[catKey] || {};
    const accent = cat.color || "#6366f1";
    const glow = cat.glow || "#6366f144";
    const grad = cat.grad || "linear-gradient(135deg,#6366f1,#4f46e5)";
    const catBg = cat.bg || "#0f172a";
    const catBorder = cat.border || "#312e81";

    const wrongGuesses = [...guessed].filter(l => !word.includes(l));
    const wrongCount = wrongGuesses.length;
    const correctGuesses = [...guessed].filter(l => word.includes(l));
    const isWon = word && [...word].every(l => guessed.has(l));
    const isLost = wrongCount >= MAX_WRONG;
    const livesLeft = MAX_WRONG - wrongCount;

    const startGame = useCallback((ck = null) => {
        const keys = Object.keys(CATEGORIES);
        const chosen = ck || keys[Math.floor(Math.random() * keys.length)];
        const w = CATEGORIES[chosen].words[Math.floor(Math.random() * CATEGORIES[chosen].words.length)];
        setWord(w); setCatKey(chosen);
        setGuessed(new Set()); setPhase("playing");
    }, []);

    useEffect(() => {
        if (phase !== "playing" || !word) return;
        if (isWon) {
            setPhase("won");
            setStats(p => {
                const n = { ...p, wins: p.wins + 1, streak: p.streak + 1, best: Math.max(p.best, p.streak + 1) };
                try { localStorage.setItem(LS_KEY, JSON.stringify(n)); } catch { }
                return n;
            });
        } else if (isLost) {
            setPhase("lost");
            setStats(p => {
                const n = { ...p, losses: p.losses + 1, streak: 0 };
                try { localStorage.setItem(LS_KEY, JSON.stringify(n)); } catch { }
                return n;
            });
        }
    }, [isWon, isLost, phase, word]);

    const guess = useCallback((letter) => {
        if (phase !== "playing" || guessed.has(letter)) return;
        setGuessed(prev => new Set([...prev, letter]));
        if (!word.includes(letter)) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    }, [phase, guessed, word]);

    useEffect(() => {
        const h = (e) => { const l = e.key.toLowerCase(); if (/^[a-z]$/.test(l)) guess(l); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [guess]);

    const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    const winRate = stats.wins + stats.losses > 0
        ? Math.round(stats.wins / (stats.wins + stats.losses) * 100) : 0;

    const card = (extra = {}) => ({
        background: "#1e293b",
        border: `1px solid ${catBorder}`,
        borderRadius: 14,
        padding: "22px 24px",
        boxShadow: `0 0 20px ${glow}, 0 4px 24px rgba(0,0,0,0.3)`,
        transition: "border-color 0.4s, box-shadow 0.4s",
        ...extra,
    });

    return (
        <div style={{
            minHeight: "100vh",
            background: `linear-gradient(145deg, #0f172a 0%, ${catBg} 50%, #0f172a 100%)`,
            backgroundAttachment: "fixed",
            color: "#f8fafc",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            display: "flex", flexDirection: "column", alignItems: "center",
            transition: "background 0.5s ease",
        }}>

            {/* Dot grid */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)",
                backgroundSize: "30px 30px",
            }} />

            {/* Color wash */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                background: `radial-gradient(ellipse at 50% 0%, ${glow} 0%, transparent 65%)`,
                transition: "background 0.5s ease",
            }} />

            {/* ── Header ── */}
            <header style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "30px 16px 14px" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.32em", color: accent, textTransform: "uppercase", marginBottom: 6, opacity: 0.85, transition: "color 0.4s" }}>
                </div>
                <h1 style={{
                    margin: 0,
                    fontSize: "clamp(34px, 6.5vw, 58px)",
                    fontWeight: 900, letterSpacing: "0.1em",
                    background: `linear-gradient(135deg, #f8fafc 30%, ${accent} 100%)`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    filter: `drop-shadow(0 0 24px ${glow})`,
                    transition: "filter 0.4s",
                }}>
                    HANGMAN
                </h1>
                <div style={{
                    display: "inline-block", marginTop: 8,
                    borderTop: `2px solid ${accent}`, borderBottom: `2px solid ${accent}`,
                    padding: "3px 20px",
                    fontSize: 10, letterSpacing: "0.26em", color: accent,
                    transition: "border-color 0.4s, color 0.4s",
                }}>
                    WORD · DEDUCTION · GAME
                </div>
            </header>

            {/* ── Stats bar ── */}
            <div style={{
                position: "relative", zIndex: 1,
                display: "flex", gap: 0, marginBottom: 22,
                background: "#1e293b",
                border: `1px solid ${catBorder}`,
                borderRadius: 10, overflow: "hidden",
                boxShadow: `0 0 16px ${glow}`,
                transition: "border-color 0.4s, box-shadow 0.4s",
            }}>
                {[
                    { label: "WINS", value: stats.wins, color: "#4ade80" },
                    { label: "LOSSES", value: stats.losses, color: "#f87171" },
                    { label: "STREAK", value: stats.streak, color: accent },
                    { label: "BEST", value: stats.best, color: "#c084fc" },
                    { label: "WIN %", value: winRate + "%", color: "#38bdf8" },
                ].map((s, i) => (
                    <React.Fragment key={s.label}>
                        {i > 0 && <div style={{ width: 1, background: catBorder }} />}
                        <div style={{ padding: "8px 16px", textAlign: "center", minWidth: 60 }}>
                            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.18em", marginBottom: 3 }}>{s.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, textShadow: `0 0 10px ${s.color}66` }}>{s.value}</div>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* ══════════ IDLE ══════════ */}
            {phase === "idle" && (
                <div style={{ position: "relative", zIndex: 1, maxWidth: 520, width: "100%", padding: "0 16px 32px" }}>
                    <div style={{ ...card({ textAlign: "center" }) }}>
                        <div style={{ marginBottom: 8 }}>
                            <HangmanSVG wrong={0} accent="#6366f1" glow="#6366f144" />
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.75, margin: "0 0 22px" }}>
                            Guess the hidden word letter by letter.<br />
                            You have <strong style={{ color: "#f8fafc" }}>6 wrong guesses</strong> before the man hangs.
                        </p>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "#64748b", marginBottom: 12 }}>PICK A CATEGORY</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                                {Object.entries(CATEGORIES).map(([k, v]) => (
                                    <button key={k} onClick={() => startGame(k)} style={{
                                        padding: "8px 15px", borderRadius: 8,
                                        border: `1.5px solid ${v.color}44`,
                                        background: v.color + "18",
                                        color: v.color,
                                        fontSize: 13, fontWeight: 700,
                                        cursor: "pointer", fontFamily: "inherit",
                                        transition: "all 0.14s",
                                        boxShadow: `0 0 0 ${v.color}00`,
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = v.color + "33";
                                            e.currentTarget.style.borderColor = v.color;
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = `0 4px 16px ${v.color}44`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = v.color + "18";
                                            e.currentTarget.style.borderColor = v.color + "44";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >{k}</button>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => startGame()} style={{
                            width: "100%", padding: "13px", borderRadius: 10,
                            border: "none",
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                            fontFamily: "inherit", letterSpacing: "0.07em",
                            boxShadow: "0 4px 22px #6366f155",
                            transition: "opacity 0.15s, box-shadow 0.15s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.boxShadow = "0 6px 28px #6366f177"; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 4px 22px #6366f155"; }}
                        >
                            ▶ &nbsp; Random Category
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════ PLAYING / END ══════════ */}
            {phase !== "idle" && (
                <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 880, padding: "0 14px 36px" }}>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>

                        {/* ── Left: gallows panel ── */}
                        <div style={{
                            ...card({ minWidth: 230, maxWidth: 260, flex: "0 0 245px" }),
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                        }}>
                            {/* Category badge */}
                            <div style={{
                                background: glow,
                                border: `1px solid ${catBorder}`,
                                borderRadius: 20, padding: "4px 14px",
                                fontSize: 12, fontWeight: 700, color: accent,
                                letterSpacing: "0.06em",
                                boxShadow: `0 0 10px ${glow}`,
                                transition: "all 0.4s",
                            }}>
                                {catKey}
                            </div>

                            {/* Gallows */}
                            <div style={{ animation: shake ? "shakeIt .45s ease" : "none" }}>
                                <HangmanSVG wrong={wrongCount} accent={accent} glow={glow} />
                            </div>

                            {/* Life dots */}
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.17em", marginBottom: 7 }}>CHANCES LEFT</div>
                                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                    {Array.from({ length: MAX_WRONG }).map((_, i) => (
                                        <div key={i} style={{
                                            width: 12, height: 12, borderRadius: "50%",
                                            background: i < livesLeft ? accent : "#1e293b",
                                            border: `2px solid ${i < livesLeft ? accent : "#334155"}`,
                                            boxShadow: i < livesLeft ? `0 0 7px ${glow}` : "none",
                                            transition: "all 0.3s",
                                        }} />
                                    ))}
                                </div>
                            </div>

                            {/* Wrong letters */}
                            {wrongGuesses.length > 0 && (
                                <div style={{ textAlign: "center", width: "100%" }}>
                                    <div style={{ fontSize: 10, color: "#f87171", letterSpacing: "0.17em", marginBottom: 6 }}>WRONG</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                                        {wrongGuesses.map(l => (
                                            <span key={l} style={{
                                                fontSize: 13, fontWeight: 700, color: "#fca5a5",
                                                background: "#f8717122", border: "1px solid #f8717144",
                                                borderRadius: 5, padding: "2px 8px",
                                            }}>
                                                {l.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Correct letters */}
                            {correctGuesses.length > 0 && (
                                <div style={{ textAlign: "center", width: "100%" }}>
                                    <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.17em", marginBottom: 6 }}>CORRECT</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                                        {correctGuesses.map(l => (
                                            <span key={l} style={{
                                                fontSize: 13, fontWeight: 700, color: accent,
                                                background: glow, border: `1px solid ${catBorder}`,
                                                borderRadius: 5, padding: "2px 8px",
                                                boxShadow: `0 0 6px ${glow}`,
                                            }}>
                                                {l.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Right: word + keyboard ── */}
                        <div style={{ flex: 1, minWidth: 290, display: "flex", flexDirection: "column", gap: 14 }}>

                            {/* Word display */}
                            <div style={{ ...card({ textAlign: "center" }) }}>
                                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.22em", marginBottom: 18 }}>
                                    DECODE THE WORD — {word.length} LETTERS
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center", marginBottom: 16 }}>
                                    {word.split("").map((letter, i) => {
                                        const shown = guessed.has(letter);
                                        const isReveal = phase === "lost" && !shown;
                                        return (
                                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                                                <div style={{
                                                    width: 28, minHeight: 36,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 22, fontWeight: 900,
                                                    color: shown ? accent : isReveal ? "#f87171" : "transparent",
                                                    textShadow: shown ? `0 0 12px ${glow}` : "none",
                                                    transition: "color 0.25s, text-shadow 0.25s",
                                                }}>
                                                    {(shown || isReveal) ? letter.toUpperCase() : ""}
                                                </div>
                                                <div style={{
                                                    width: 28, height: 2.5, borderRadius: 2,
                                                    background: shown ? accent : isReveal ? "#f87171" : "#334155",
                                                    boxShadow: shown ? `0 0 8px ${glow}` : "none",
                                                    transition: "all 0.3s",
                                                }} />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress bar */}
                                <div style={{ background: "#0f172a", borderRadius: 4, height: 4, overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", borderRadius: 4,
                                        width: `${([...new Set(word.split(""))].filter(l => guessed.has(l)).length / [...new Set(word.split(""))].length) * 100}%`,
                                        background: grad,
                                        boxShadow: `0 0 8px ${glow}`,
                                        transition: "width 0.4s ease",
                                    }} />
                                </div>
                                <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
                                    {word.length} letter{word.length !== 1 ? "s" : ""}
                                </div>
                            </div>

                            {/* Keyboard */}
                            <div style={{ ...card({ borderColor: "#334155", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }) }}>
                                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.2em", textAlign: "center", marginBottom: 12 }}>
                                    SELECT A LETTER  ·  OR TYPE
                                </div>
                                {ROWS.map((row, ri) => (
                                    <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6 }}>
                                        {row.split("").map(letter => {
                                            const isGuessed = guessed.has(letter);
                                            const isCorrect = isGuessed && word.includes(letter);
                                            const isWrong = isGuessed && !word.includes(letter);
                                            const disabled = isGuessed || phase !== "playing";
                                            return (
                                                <button key={letter} onClick={() => guess(letter)} disabled={disabled} style={{
                                                    width: 36, height: 40, borderRadius: 7,
                                                    border: isCorrect ? `2px solid ${accent}`
                                                        : isWrong ? "2px solid #1e293b"
                                                            : "2px solid #334155",
                                                    background: isCorrect ? glow
                                                        : isWrong ? "#0f172a"
                                                            : "#334155",
                                                    color: isCorrect ? accent
                                                        : isWrong ? "#1e293b"
                                                            : "#e2e8f0",
                                                    fontSize: 13, fontWeight: 700,
                                                    cursor: disabled ? "default" : "pointer",
                                                    fontFamily: "inherit",
                                                    transition: "all 0.12s",
                                                    opacity: isWrong ? 0.35 : 1,
                                                    textTransform: "uppercase",
                                                    boxShadow: isCorrect ? `0 0 12px ${glow}` : "none",
                                                }}
                                                    onMouseEnter={e => {
                                                        if (!disabled) {
                                                            e.currentTarget.style.background = accent;
                                                            e.currentTarget.style.borderColor = accent;
                                                            e.currentTarget.style.color = "#0f172a";
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                            e.currentTarget.style.boxShadow = `0 4px 14px ${glow}`;
                                                        }
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (!disabled && !isCorrect) {
                                                            e.currentTarget.style.background = "#334155";
                                                            e.currentTarget.style.borderColor = "#334155";
                                                            e.currentTarget.style.color = "#e2e8f0";
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "none";
                                                        }
                                                    }}
                                                >
                                                    {letter.toUpperCase()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Result card */}
                            {(phase === "won" || phase === "lost") && (
                                <div style={{
                                    background: phase === "won" ? glow : "#f8717118",
                                    border: `2px solid ${phase === "won" ? accent : "#f87171"}`,
                                    borderRadius: 14, padding: "22px 24px", textAlign: "center",
                                    boxShadow: `0 0 30px ${phase === "won" ? glow : "#f8717133"}`,
                                    animation: "slideUp .4s cubic-bezier(.34,1.56,.64,1)",
                                }}>
                                    <div style={{
                                        fontSize: "clamp(20px, 3.8vw, 30px)", fontWeight: 900,
                                        color: phase === "won" ? accent : "#f87171",
                                        letterSpacing: "0.06em", marginBottom: 8,
                                        textShadow: `0 0 20px ${phase === "won" ? glow : "#f8717155"}`,
                                    }}>
                                        {phase === "won" ? "🎉  You solved it!" : "💀  Hanged!"}
                                    </div>

                                    {phase === "lost" && (
                                        <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6 }}>
                                            The word was:{" "}
                                            <strong style={{ color: "#f8fafc", fontSize: 20, letterSpacing: "0.1em" }}>
                                                {word.toUpperCase()}
                                            </strong>
                                        </div>
                                    )}
                                    {phase === "won" && (
                                        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>
                                            Solved with <strong style={{ color: accent }}>{livesLeft} chance{livesLeft !== 1 ? "s" : ""}</strong> to spare
                                            {stats.streak > 1 && (
                                                <span> · <strong style={{ color: "#fb923c" }}>🔥 {stats.streak}-win streak</strong></span>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
                                        <button onClick={() => startGame(catKey)} style={{
                                            padding: "10px 22px", borderRadius: 9,
                                            border: "none", background: grad, color: "#fff",
                                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                                            fontFamily: "inherit", letterSpacing: "0.05em",
                                            boxShadow: `0 4px 18px ${glow}`,
                                            transition: "opacity 0.15s",
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                        >
                                            Same Category
                                        </button>
                                        <button onClick={() => startGame()} style={{
                                            padding: "10px 22px", borderRadius: 9,
                                            border: "1.5px solid #475569", background: "transparent", color: "#e2e8f0",
                                            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                            transition: "all 0.15s",
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.borderColor = "#64748b"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#475569"; }}
                                        >
                                            Random Word
                                        </button>
                                        <button onClick={() => setPhase("idle")} style={{
                                            padding: "10px 22px", borderRadius: 9,
                                            border: "1.5px solid #334155", background: "transparent", color: "#64748b",
                                            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                            transition: "all 0.15s",
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#94a3b8"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                                        >
                                            Menu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <footer style={{
                position: "relative", zIndex: 1,
                marginTop: "auto", padding: "14px 16px 22px",
                fontSize: 10, color: "#334155", letterSpacing: "0.2em", textAlign: "center",
            }}>
                THE WEB ARCADE  ·  HANGMAN  ·  TYPE OR CLICK
            </footer>

            <style>{`
        @keyframes shakeIt {
          0%,100% { transform:translateX(0); }
          20%      { transform:translateX(-9px); }
          40%      { transform:translateX(9px); }
          60%      { transform:translateX(-5px); }
          80%      { transform:translateX(5px); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        * { box-sizing:border-box; }
      `}</style>
        </div>
    );
}