import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 900;
const H = 360;
const GROUND = 280;
const GRAVITY = 0.75;
const JUMP_V = -15;
const INIT_SPEED = 6;
const MAX_SPEED = 20;
const SPEED_INC = 0.0025;
const LS_KEY = "cyberdash_best";

// ─── Utils ────────────────────────────────────────────────────────────────────
const rand = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const hit = (ax, ay, aw, ah, bx, by, bw, bh) =>
    ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

// ─── Component ────────────────────────────────────────────────────────────────
export default function CyberDash() {
    const canvasRef = useRef(null);
    const gRef = useRef(null);
    const rafRef = useRef(null);
    const keysRef = useRef({});

    const [phase, setPhase] = useState("idle"); // idle | playing | dead
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [best, setBest] = useState(() => {
        try { return parseInt(localStorage.getItem(LS_KEY) || "0", 10); } catch { return 0; }
    });
    const bestRef = useRef(best);

    useEffect(() => { bestRef.current = best; }, [best]);

    // ── Fresh game state ──
    const makeGame = useCallback(() => ({
        frame: 0,
        score: 0,
        speed: INIT_SPEED,
        running: true,
        player: {
            x: 100, y: GROUND - 68, w: 38, h: 68,
            vy: 0, onGround: true, jumped: false,
            ducking: false, duckTimer: 0,
            invTimer: 0, lives: 1,
            trail: [], runFrame: 0, runTick: 0,
        },
        obstacles: [],
        clouds: Array.from({ length: 5 }, () => ({
            x: rand(0, W), y: rand(25, 110), w: rand(55, 110),
            speed: rand(0.3, 0.8), alpha: rand(0.04, 0.12),
        })),
        stars: Array.from({ length: 90 }, () => ({
            x: rand(0, W), y: rand(0, GROUND - 20),
            r: rand(0.3, 1.4), tw: rand(0, Math.PI * 2),
            spd: rand(0.04, 0.18),
        })),
        groundDots: Array.from({ length: 35 }, (_, i) => ({
            x: i * 26, h: rand(1, 3), a: rand(0.06, 0.22),
        })),
        particles: [],
        nextObs: randInt(80, 130),
        milestones: new Set(),
    }), []);

    // ─── Draw helpers ─────────────────────────────────────────────────────────────

    function drawCactus(ctx, ob) {
        const { x, y, w, h } = ob;
        ctx.fillStyle = "#e8003d";
        ctx.beginPath(); ctx.roundRect(x + w * 0.38, y, w * 0.24, h, 3); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x + w * 0.05, y + h * 0.28, w * 0.33, h * 0.13, 3); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x + w * 0.05, y + h * 0.1, w * 0.1, h * 0.3, 3); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x + w * 0.62, y + h * 0.38, w * 0.33, h * 0.13, 3); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x + w * 0.85, y + h * 0.18, w * 0.1, h * 0.32, 3); ctx.fill();
        ctx.strokeStyle = "#ff336633"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x + w * 0.38, y, w * 0.24, h, 3); ctx.stroke();
    }

    function drawBird(ctx, ob, frame) {
        const { x, y, w } = ob;
        const flap = Math.sin(frame * 0.28) * 9;
        ctx.fillStyle = "#f0b429";
        ctx.beginPath(); ctx.ellipse(x + w / 2, y, w * 0.35, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.18, y);
        ctx.quadraticCurveTo(x + w * 0.05, y - 16 - flap, x - 2, y - 6 + flap * 0.2);
        ctx.quadraticCurveTo(x + w * 0.25, y - 2, x + w * 0.18, y);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.82, y);
        ctx.quadraticCurveTo(x + w * 0.95, y - 16 - flap, x + w + 2, y - 6 + flap * 0.2);
        ctx.quadraticCurveTo(x + w * 0.75, y - 2, x + w * 0.82, y);
        ctx.fill();
        ctx.fillStyle = "#1a1a2e"; ctx.beginPath(); ctx.arc(x + w * 0.62, y - 1, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + w * 0.63, y - 1.5, 1, 0, Math.PI * 2); ctx.fill();
    }

    function drawWall(ctx, ob) {
        const { x, y, w, h } = ob;
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill();
        ctx.strokeStyle = "#9b59b644"; ctx.lineWidth = 1;
        for (let wy = y + 12; wy < y + h; wy += 14) {
            ctx.beginPath(); ctx.moveTo(x, wy); ctx.lineTo(x + w, wy); ctx.stroke();
        }
        ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
    }

    function drawPlayer(ctx, p, frame) {
        const ducking = p.ducking;
        const ph = ducking ? p.h * 0.5 : p.h;
        const py = ducking ? p.y + p.h * 0.5 : p.y;
        if (p.invTimer > 0 && Math.floor(p.invTimer / 5) % 2 === 0) return;

        // subtle trail
        p.trail.forEach((t, i) => {
            const a = (i / p.trail.length) * 0.14;
            ctx.globalAlpha = a;
            ctx.fillStyle = "#00e5ff";
            const tph = ducking ? p.h * 0.5 : p.h;
            const tpy = ducking ? t.y + p.h * 0.5 : t.y;
            ctx.beginPath(); ctx.roundRect(t.x + 4, tpy + 4, p.w - 8, tph - 8, 6); ctx.fill();
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 10;

        const bg = ctx.createLinearGradient(p.x, py, p.x, py + ph);
        bg.addColorStop(0, "#00cfea");
        bg.addColorStop(1, "#0070a8");
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.roundRect(p.x, py, p.w, ph, ducking ? 7 : 9); ctx.fill();

        if (!ducking) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,240,255,0.3)";
            ctx.beginPath(); ctx.roundRect(p.x + 5, py + 9, p.w - 10, 9, 4); ctx.fill();
        }

        if (!ducking && p.onGround) {
            p.runTick++;
            if (p.runTick > 6) { p.runFrame ^= 1; p.runTick = 0; }
            const lo = p.runFrame ? 5 : -1;
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#0090c0";
            ctx.beginPath(); ctx.roundRect(p.x + 5, py + ph, 11, 7 + lo, 3); ctx.fill();
            ctx.beginPath(); ctx.roundRect(p.x + p.w - 16, py + ph, 11, 7 - lo, 3); ctx.fill();
        }

        if (ducking) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#00e5ff44"; ctx.lineWidth = 1.5;
            for (let li = 0; li < 3; li++) {
                ctx.beginPath();
                ctx.moveTo(p.x - 6 - li * 9, py + ph * 0.35 + li * 7);
                ctx.lineTo(p.x - 1 - li * 9, py + ph * 0.35 + li * 7);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    function drawHUD(ctx, g) {
        const { score, player: p } = g;
        ctx.save();
        ctx.font = "bold 18px 'Courier New', monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = "#00e5ff";
        ctx.fillText(Math.floor(score).toString().padStart(6, "0"), 18, 32);

        ctx.font = "13px 'Courier New', monospace";
        ctx.fillStyle = "#ffffff38";
        ctx.textAlign = "center";
        ctx.fillText("BEST  " + bestRef.current.toString().padStart(6, "0"), W / 2, 26);

        ctx.fillStyle = "#ffffff1e";
        ctx.font = "11px 'Courier New', monospace";
        ctx.fillText(g.speed.toFixed(1) + "×", W / 2, 42);

        ctx.textAlign = "right";
        ctx.font = "18px monospace";
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i < p.lives ? "#ff3366" : "#ff336620";
            ctx.fillText("♥", W - 16 - i * 26, 32);
        }
        ctx.restore();
    }

    // ─── Main draw frame ──────────────────────────────────────────────────────────
    const drawFrame = useCallback((ctx, g) => {
        const { player: p, frame, speed } = g;

        const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
        sky.addColorStop(0, "#020210");
        sky.addColorStop(1, "#06063a");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // faint grid
        ctx.save();
        ctx.strokeStyle = "#ffffff05";
        ctx.lineWidth = 1;
        const go = (frame * speed * 0.3) % 52;
        for (let gx = -go; gx < W; gx += 52) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, GROUND); ctx.stroke();
        }
        ctx.restore();

        // stars
        g.stars.forEach(s => {
            const tw = 0.4 + 0.5 * Math.sin(s.tw + frame * 0.035);
            ctx.globalAlpha = tw * 0.7;
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // clouds
        g.clouds.forEach(c => {
            ctx.globalAlpha = c.alpha;
            const cg = ctx.createRadialGradient(c.x + c.w / 2, c.y, 1, c.x + c.w / 2, c.y, c.w * 0.6);
            cg.addColorStop(0, "#7c3aed");
            cg.addColorStop(1, "transparent");
            ctx.fillStyle = cg;
            ctx.beginPath(); ctx.ellipse(c.x + c.w / 2, c.y, c.w * 0.5, 18, 0, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // ground
        ctx.fillStyle = "#050525";
        ctx.fillRect(0, GROUND, W, H - GROUND);

        g.groundDots.forEach(t => {
            ctx.globalAlpha = t.a;
            ctx.fillStyle = "#00e5ff";
            ctx.fillRect(((t.x - frame * speed * 0.38) % (W + 30) + W + 30) % (W + 30), GROUND, 10, t.h);
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 8;
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#00e5ff0f";
        ctx.lineWidth = 1;
        const pg = (frame * speed * 0.6) % 65;
        for (let gx2 = -pg; gx2 < W + 65; gx2 += 65) {
            ctx.beginPath(); ctx.moveTo(gx2, GROUND); ctx.lineTo(gx2 - 45, H); ctx.stroke();
        }
        ctx.restore();

        // particles
        g.particles.forEach(pt => {
            ctx.globalAlpha = pt.a;
            ctx.fillStyle = pt.col;
            ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // obstacles
        g.obstacles.forEach(ob => {
            ctx.save();
            if (ob.type === "cactus") drawCactus(ctx, ob);
            else if (ob.type === "bird") drawBird(ctx, ob, frame);
            else if (ob.type === "wall") drawWall(ctx, ob);
            ctx.restore();
        });

        drawPlayer(ctx, p, frame);
        drawHUD(ctx, g);
    }, []);

    // ─── Start screen ─────────────────────────────────────────────────────────────
    const drawStartScreen = useCallback((ctx) => {
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, "#020210"); sky.addColorStop(1, "#06063a");
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

        for (let i = 0; i < 90; i++) {
            ctx.globalAlpha = rand(0.1, 0.65);
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(rand(0, W), rand(0, GROUND), rand(0.3, 1.4), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#050525"; ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();

        ctx.textAlign = "center";
        ctx.font = "bold 50px 'Courier New', monospace";
        ctx.fillStyle = "#00e5ff";
        ctx.fillText("CYBER DASH", W / 2, 128);

        ctx.font = "11px 'Courier New', monospace";
        ctx.fillStyle = "#ffffff28";
        ctx.fillText("THE WEB ARCADE  ·  ENDLESS RUNNER", W / 2, 154);

        ctx.strokeStyle = "#ffffff12"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W / 2 - 155, 168); ctx.lineTo(W / 2 + 155, 168); ctx.stroke();

        const ctrls = [["SPACE / ↑ / TAP", "Jump  (again mid-air = double jump)"], ["↓ / S / Swipe down", "Duck under birds"]];
        ctrls.forEach(([key, desc], i) => {
            ctx.fillStyle = "#00e5ff";
            ctx.font = "bold 12px 'Courier New', monospace";
            ctx.fillText(key, W / 2, 194 + i * 30);
            ctx.fillStyle = "#ffffff3a";
            ctx.font = "11px 'Courier New', monospace";
            ctx.fillText(desc, W / 2, 208 + i * 30);
        });

        ctx.font = "bold 14px 'Courier New', monospace";
        ctx.fillStyle = "#ffe600";
        ctx.fillText("▶  PRESS SPACE OR CLICK TO START", W / 2, 302);
        ctx.textAlign = "left";
    }, []);

    // ─── Spawn ────────────────────────────────────────────────────────────────────
    function spawnObs(g) {
        const r = Math.random();
        if (g.speed < 9) { spawnCactus(g); }
        else if (g.speed < 13) { r < 0.65 ? spawnCactus(g) : spawnBird(g); }
        else { r < 0.42 ? spawnCactus(g) : r < 0.72 ? spawnBird(g) : spawnWall(g); }
    }

    function spawnCactus(g) {
        const count = g.speed > 11 ? randInt(1, 2) : 1;
        const bh = randInt(44, 82); const bw = randInt(34, 50);
        for (let i = 0; i < count; i++) {
            g.obstacles.push({ type: "cactus", x: W + 20 + i * (bw + 12), y: GROUND - bh, w: bw, h: bh });
        }
    }

    function spawnBird(g) {
        const ys = [GROUND - 115, GROUND - 72, GROUND - 42];
        g.obstacles.push({ type: "bird", x: W + 30, y: ys[randInt(0, 2)], w: 54, h: 26 });
    }

    function spawnWall(g) {
        const wh = randInt(55, 105);
        g.obstacles.push({ type: "wall", x: W + 20, y: GROUND - wh, w: 26, h: wh });
    }

    function burst(g, x, y, col, n = 10) {
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2;
            const spd = rand(2, 6);
            g.particles.push({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1.5, r: rand(1.5, 4), a: 1, col });
        }
    }

    // ─── Game loop ────────────────────────────────────────────────────────────────
    const loop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const g = gRef.current;
        if (!g || !g.running) return;

        g.frame++;
        g.score += g.speed * 0.055;
        g.speed = Math.min(MAX_SPEED, INIT_SPEED + g.frame * SPEED_INC);

        const p = g.player;
        const keys = keysRef.current;

        // duck
        if ((keys["ArrowDown"] || keys["s"] || keys["S"]) && p.onGround) {
            p.ducking = true; p.duckTimer = 4;
        } else {
            if (p.duckTimer > 0) { p.duckTimer--; if (p.duckTimer <= 0) p.ducking = false; }
            else p.ducking = false;
        }

        // physics
        if (!p.onGround) p.vy += GRAVITY;
        p.y += p.vy;
        const effH = p.ducking ? p.h * 0.5 : p.h;
        const effY = p.ducking ? p.y + p.h * 0.5 : p.y;
        if (effY + effH >= GROUND) {
            p.y = p.ducking ? GROUND - effH - p.h * 0.5 : GROUND - p.h;
            p.vy = 0; p.onGround = true; p.jumped = false;
        }

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) p.trail.shift();
        if (p.invTimer > 0) p.invTimer--;

        g.clouds.forEach(c => { c.x -= c.speed; if (c.x + c.w < 0) { c.x = W + 10; c.y = rand(25, 110); c.w = rand(55, 110); } });
        g.stars.forEach(s => { s.x -= s.spd; if (s.x < 0) s.x = W; s.tw += 0.045; });

        g.nextObs--;
        if (g.nextObs <= 0) {
            spawnObs(g);
            g.nextObs = Math.max(50, randInt(85, 140) - g.speed * 2.5);
        }

        g.obstacles = g.obstacles.filter(ob => {
            ob.x -= g.speed;
            let hx = ob.x, hy = ob.y, hw = ob.w, hh = ob.h;
            if (ob.type === "cactus") { hx += ob.w * 0.3; hw = ob.w * 0.4; hy += ob.h * 0.05; hh = ob.h * 0.9; }
            else if (ob.type === "bird") { hx += 6; hy -= 8; hw -= 12; hh = 22; }
            else { hx += 2; hw -= 4; hy += 3; hh -= 6; }

            const px = p.x + 5, py = effY + 4, pw = p.w - 10, ph = effH - 8;
            if (p.invTimer <= 0 && hit(px, py, pw, ph, hx, hy, hw, hh)) {
                p.lives--;
                p.invTimer = 95;
                burst(g, p.x + p.w / 2, effY + effH / 2, "#ff3366", 14);
                if (p.lives <= 0) {
                    g.running = false;
                    const fs = Math.floor(g.score);
                    const nb = Math.max(fs, bestRef.current);
                    try { localStorage.setItem(LS_KEY, nb.toString()); } catch { }
                    bestRef.current = nb;
                    setBest(nb);
                    setFinalScore(fs);
                    setScore(fs);
                    drawFrame(ctx, g);
                    setPhase("dead");
                    return false;
                }
            }
            return ob.x > -120;
        });

        g.particles = g.particles.filter(pt => {
            pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.12;
            pt.a -= 0.025; pt.r *= 0.97;
            return pt.a > 0;
        });

        setScore(Math.floor(g.score));
        drawFrame(ctx, g);
        if (g.running) rafRef.current = requestAnimationFrame(loop);
    }, [drawFrame]);

    // ─── Controls ─────────────────────────────────────────────────────────────────
    const doJump = useCallback(() => {
        const g = gRef.current;
        if (!g) return;
        const p = g.player;
        if (p.onGround) {
            p.vy = JUMP_V; p.onGround = false;
            burst(g, p.x + p.w / 2, GROUND, "#00e5ff", 6);
        } else if (!p.jumped) {
            p.vy = JUMP_V * 0.82; p.jumped = true;
            burst(g, p.x + p.w / 2, p.y + p.h, "#7c3aed", 6);
        }
    }, []);

    const startGame = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const g = makeGame();
        gRef.current = g;
        setScore(0);
        setPhase("playing");
        rafRef.current = requestAnimationFrame(loop);
    }, [makeGame, loop]);

    useEffect(() => {
        const down = (e) => {
            keysRef.current[e.key] = true;
            keysRef.current[e.code] = true;
            if (["Space", "ArrowUp", "ArrowDown"].includes(e.code)) e.preventDefault();
            if (e.code === "Space" || e.code === "ArrowUp" || e.key === "w" || e.key === "W") {
                if (phase === "idle" || phase === "dead") { startGame(); return; }
                doJump();
            }
        };
        const up = (e) => { keysRef.current[e.key] = false; keysRef.current[e.code] = false; };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
    }, [phase, startGame, doJump]);

    const touchY = useRef(null);
    const onTouchStart = (e) => {
        touchY.current = e.touches[0].clientY;
        if (phase === "idle" || phase === "dead") { startGame(); return; }
    };
    const onTouchEnd = (e) => {
        if (touchY.current === null) return;
        const dy = e.changedTouches[0].clientY - touchY.current;
        if (dy > 35) { const g = gRef.current; if (g) { g.player.ducking = true; g.player.duckTimer = 28; } }
        else doJump();
        touchY.current = null;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        drawStartScreen(canvas.getContext("2d"));
    }, [drawStartScreen]);

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    const isNewBest = finalScore > 0 && finalScore >= best && finalScore > 0;

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen text-white flex flex-col items-center justify-start select-none"
            style={{ background: "linear-gradient(160deg,#030312 0%,#0c0520 50%,#030312 100%)", fontFamily: "'Courier New', monospace" }}
        >
            {/* Header */}
            <div className="text-center pt-8 pb-3 px-4">
                <h1
                    className="font-black tracking-widest text-4xl sm:text-5xl mb-1"
                    style={{ fontFamily: "'Courier New', monospace", color: "#00e5ff", letterSpacing: "0.18em", textShadow: "0 0 28px #00e5ff44" }}
                >
                    CYBER DASH
                </h1>
                <p style={{ color: "#ffffff25", fontSize: "11px", letterSpacing: "0.22em" }}>
                    THE WEB ARCADE  ·  ENDLESS RUNNER
                </p>
            </div>

            {/* Canvas wrapper */}
            <div
                style={{ position: "relative", maxWidth: "100%", padding: "0 12px", cursor: phase === "playing" ? "pointer" : "default" }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onClick={() => {
                    if (phase === "idle") { startGame(); return; }
                    if (phase === "playing") doJump();
                }}
            >
                <div style={{ borderRadius: 10, border: "1px solid #00e5ff22", boxShadow: "0 0 24px #00e5ff0e", overflow: "hidden", background: "#020210" }}>
                    <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                </div>

                {/* ── GAME OVER overlay (React DOM, not canvas) ── */}
                {phase === "dead" && (
                    <div
                        style={{
                            position: "absolute", top: 0, left: 12, right: 12, bottom: 0,
                            borderRadius: 10,
                            background: "rgba(2,2,16,0.9)",
                            backdropFilter: "blur(4px)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <div style={{ fontSize: "clamp(26px,4.5vw,44px)", fontWeight: 900, color: "#ff3366", letterSpacing: "0.1em", marginBottom: 22 }}>
                            GAME OVER
                        </div>

                        {/* Score card */}
                        <div style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: 12, padding: "18px 36px", marginBottom: 20,
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                        }}>
                            <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 10, color: "#00e5ff66", letterSpacing: "0.2em", marginBottom: 5 }}>SCORE</div>
                                    <div style={{ fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 900, color: "#00e5ff" }}>
                                        {finalScore.toString().padStart(6, "0")}
                                    </div>
                                </div>
                                <div style={{ width: 1, height: 44, background: "#ffffff10" }} />
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 10, color: "#ffe60066", letterSpacing: "0.2em", marginBottom: 5 }}>BEST</div>
                                    <div style={{ fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 900, color: "#ffe600" }}>
                                        {best.toString().padStart(6, "0")}
                                    </div>
                                </div>
                            </div>

                            {isNewBest && (
                                <div style={{ fontSize: 12, color: "#ffe600", letterSpacing: "0.1em", paddingTop: 4, borderTop: "1px solid #ffe60022", width: "100%", textAlign: "center" }}>
                                    ★ &nbsp;NEW HIGH SCORE&nbsp; ★
                                </div>
                            )}
                        </div>

                        {/* Restart button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            style={{
                                background: "#00e5ff",
                                color: "#020210",
                                border: "none",
                                borderRadius: 8,
                                padding: "11px 34px",
                                fontSize: 14,
                                fontWeight: 900,
                                fontFamily: "'Courier New', monospace",
                                letterSpacing: "0.14em",
                                cursor: "pointer",
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            ▶  PLAY AGAIN
                        </button>

                        <div style={{ marginTop: 10, fontSize: 11, color: "#ffffff22", letterSpacing: "0.1em" }}>
                            or press SPACE
                        </div>
                    </div>
                )}
            </div>

            {/* Stats bar */}
            <div
                className="flex items-center mt-4 mb-5 rounded-xl overflow-hidden"
                style={{ border: "1px solid #ffffff0d", background: "rgba(255,255,255,0.02)" }}
            >
                {[
                    { label: "SCORE", value: score.toString().padStart(6, "0"), color: "#00e5ff" },
                    { label: "BEST", value: best.toString().padStart(6, "0"), color: "#ffe600" },
                    { label: "LIVES", value: "♥".repeat(Math.max(0, gRef.current?.player?.lives ?? 1)) + "♡".repeat(Math.max(0, 1 - (gRef.current?.player?.lives ?? 3))), color: "#ff3366" },
                ].map((s, i) => (
                    <React.Fragment key={s.label}>
                        {i > 0 && <div style={{ width: 1, height: 34, background: "#ffffff0d" }} />}
                        <div style={{ padding: "9px 22px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: s.color + "55", letterSpacing: "0.18em", marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* Controls hint */}
            <div className="flex flex-wrap justify-center gap-2 px-4 mb-10">
                {[["SPACE / ↑", "Jump"], ["Tap again", "Double Jump"], ["↓ / S", "Duck"]].map(([k, d]) => (
                    <div key={k} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 12px", borderRadius: 20,
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        fontSize: 11,
                    }}>
                        <span style={{ color: "#00e5ff", fontWeight: 700 }}>{k}</span>
                        <span style={{ color: "#ffffff25" }}>—</span>
                        <span style={{ color: "#ffffff50" }}>{d}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}