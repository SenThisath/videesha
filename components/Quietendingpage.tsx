"use client";

import {
    useState,
    useEffect,
    useRef,
    useCallback,
    KeyboardEvent as ReactKeyboardEvent,
} from "react";

// ─── Quiet lines ─────────────────────────────────────────────────────────────
const QUIET_LINES = [
    { text: "You don't need a big gift to know you're loved.", pause: 2000 },
    { text: "You just need someone who stays.", pause: 2000 },
    { text: "I'm staying.", pause: 2000 },
    {
        text: "Until we marry. Until I succeed.\nEven if I fail before I rise.",
        pause: 0,
    },
];

// ─── Game types ───────────────────────────────────────────────────────────────
interface Heart {
    id: number;
    x: number; // % across screen
    y: number; // % down screen
    size: number; // px
    speed: number; // % per tick
    emoji: string;
    caught: boolean;
}

const HEART_EMOJIS = ["♥", "💕", "🌸", "✨", "💗", "🌹"];

export default function QuietEndingPage() {
    // ── Quiet intro state ──
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [showLoveName, setShowLoveName] = useState<boolean>(false);
    const [showGame, setShowGame] = useState<boolean>(false);

    // ── "Love you videeshaaha" animation state ──
    const [nameStage, setNameStage] = useState<0 | 1 | 2 | 3>(0);
    // 0=hidden 1="love you" 2="videeshaaha" glows 3=game prompt

    // ── Game state ──
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    const [lives, setLives] = useState<number>(3);
    const [hearts, setHearts] = useState<Heart[]>([]);
    const [basketX, setBasketX] = useState<number>(50); // %
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [catchFlash, setCatchFlash] = useState<boolean>(false);
    const [missFlash, setMissFlash] = useState<boolean>(false);

    const heartIdRef = useRef<number>(0);
    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const basketRef = useRef<number>(50);
    const livesRef = useRef<number>(3);
    const scoreRef = useRef<number>(0);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    // ── Step 1: quiet lines ──
    useEffect(() => {
        let delay = 1000;
        QUIET_LINES.forEach((line, i) => {
            setTimeout(() => setVisibleLines(i + 1), delay);
            delay += 1000 + line.pause;
        });
        // After all lines → show love reveal
        setTimeout(() => setShowLoveName(true), delay + 800);
    }, []);

    // ── Step 2: "love you videeshaaha" stagger ──
    useEffect(() => {
        if (!showLoveName) return;
        const t1 = setTimeout(() => setNameStage(1), 300);
        const t2 = setTimeout(() => setNameStage(2), 1400);
        const t3 = setTimeout(() => setNameStage(3), 2600);
        const t4 = setTimeout(() => setShowGame(true), 3400);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [showLoveName]);

    // ── Game: keyboard basket control ──
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;
            if (e.key === "ArrowLeft") {
                basketRef.current = Math.max(5, basketRef.current - 5);
                setBasketX(basketRef.current);
            }
            if (e.key === "ArrowRight") {
                basketRef.current = Math.min(95, basketRef.current + 5);
                setBasketX(basketRef.current);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [gameStarted, gameOver]);

    // ── Game: touch / mouse drag basket ──
    const handlePointerMove = useCallback(
        (clientX: number) => {
            if (!gameStarted || gameOver || !gameAreaRef.current) return;
            const rect = gameAreaRef.current.getBoundingClientRect();
            const pct = ((clientX - rect.left) / rect.width) * 100;
            basketRef.current = Math.min(95, Math.max(5, pct));
            setBasketX(basketRef.current);
        },
        [gameStarted, gameOver],
    );

    // ── Game: spawn hearts ──
    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        scoreRef.current = 0;
        setLives(3);
        livesRef.current = 3;
        setHearts([]);
        heartIdRef.current = 0;

        // Spawn interval — speeds up as score grows
        const doSpawn = () => {
            const speed = 0.28 + Math.min(scoreRef.current * 0.018, 0.7);
            setHearts((prev) => [
                ...prev,
                {
                    id: ++heartIdRef.current,
                    x: 5 + Math.random() * 90,
                    y: -6,
                    size: 22 + Math.floor(Math.random() * 18),
                    speed,
                    emoji: HEART_EMOJIS[
                        Math.floor(Math.random() * HEART_EMOJIS.length)
                    ],
                    caught: false,
                },
            ]);
        };
        doSpawn();
        spawnRef.current = setInterval(doSpawn, 1100);

        // Game loop
        gameLoopRef.current = setInterval(() => {
            setHearts((prev) => {
                const updated: Heart[] = [];
                let missed = 0;

                prev.forEach((h) => {
                    if (h.caught) return; // remove caught hearts
                    const newY = h.y + h.speed;

                    // Check catch (basket is at y≈88%, width ~22%)
                    const bx = basketRef.current;
                    if (newY >= 84 && newY <= 93) {
                        const dist = Math.abs(h.x - bx);
                        if (dist < 14) {
                            // Caught!
                            scoreRef.current += 1;
                            setScore((s) => s + 1);
                            setCatchFlash(true);
                            setTimeout(() => setCatchFlash(false), 220);
                            return; // don't push — remove heart
                        }
                    }

                    if (newY > 100) {
                        missed++;
                        return; // fell off bottom — miss
                    }

                    updated.push({ ...h, y: newY });
                });

                if (missed > 0) {
                    livesRef.current -= missed;
                    setLives(livesRef.current);
                    setMissFlash(true);
                    setTimeout(() => setMissFlash(false), 300);
                    if (livesRef.current <= 0) {
                        endGame();
                    }
                }

                return updated;
            });
        }, 30);
    };

    const endGame = () => {
        setGameOver(true);
        setGameStarted(false);
        if (spawnRef.current) clearInterval(spawnRef.current);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        setHighScore((prev) => Math.max(prev, scoreRef.current));
        setHearts([]);
    };

    useEffect(
        () => () => {
            if (spawnRef.current) clearInterval(spawnRef.current);
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        },
        [],
    );

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@500;700&family=Lato:wght@300;400&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dancing   { font-family: 'Dancing Script', cursive; }

        /* ── Quiet lines ── */
        @keyframes lineIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-line { animation: lineIn 1s ease forwards; }

        /* ── Love you text ── */
        @keyframes loveIn {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        .anim-love { animation: loveIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* ── videeshaaha glow burst ── */
        @keyframes videeshaahaIn {
          0%   { opacity: 0; transform: scale(0.7) rotate(-4deg); filter: blur(12px); }
          60%  { opacity: 1; transform: scale(1.08) rotate(1deg);  filter: blur(0px); }
          100% { opacity: 1; transform: scale(1)    rotate(0deg);  filter: blur(0px); }
        }
        .anim-videeshaaha { animation: videeshaahaIn 1s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* videeshaaha shimmer */
        @keyframes textShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200%  center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg,
            #e8a4a0 0%, #fdf6ee 30%, #c9a96e 50%, #fdf6ee 70%, #e8a4a0 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 2.5s linear infinite;
        }

        /* ── Game prompt ── */
        @keyframes promptIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-prompt { animation: promptIn 0.7s 0.2s ease both; }

        /* ── Falling heart ── */
        @keyframes heartSpin {
          from { transform: rotate(0deg) scale(1); }
          to   { transform: rotate(360deg) scale(1); }
        }
        .falling-heart { position: absolute; pointer-events: none; user-select: none; }

        /* ── Basket bounce on catch ── */
        @keyframes basketBounce {
          0%,100% { transform: translateX(-50%) scaleY(1);   }
          40%     { transform: translateX(-50%) scaleY(0.82); }
        }
        .basket-bounce { animation: basketBounce 0.22s ease; }

        /* ── Score pop ── */
        @keyframes scorePop {
          0%   { transform: scale(1);    }
          50%  { transform: scale(1.35); }
          100% { transform: scale(1);    }
        }
        .score-pop { animation: scorePop 0.2s ease; }

        /* ── Stars background ── */
        .star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle ease-in-out infinite;
        }
        @keyframes twinkle {
          0%,100% { opacity: 0.1; transform: scale(1); }
          50%     { opacity: 0.55; transform: scale(1.4); }
        }

        /* ── Game area ── */
        .game-area {
          position: relative;
          overflow: hidden;
          touch-action: none;
          cursor: none;
        }

        /* ── Hearts explosion on game over ── */
        @keyframes explodeHeart {
          0%   { opacity: 1; transform: translate(0,0) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.3); }
        }
        .explode-heart { animation: explodeHeart 0.8s ease forwards; }

        /* ── Basket glow ── */
        @keyframes basketGlow {
          0%,100% { box-shadow: 0 0 8px rgba(232,164,160,0.4); }
          50%     { box-shadow: 0 0 20px rgba(232,164,160,0.8); }
        }
        .basket-glow { animation: basketGlow 1.8s ease-in-out infinite; }

        /* ── Miss flash ── */
        .miss-flash { animation: missFlash 0.3s ease; }
        @keyframes missFlash {
          0%,100% { background-color: transparent; }
          50%     { background-color: rgba(196,103,95,0.12); }
        }

        /* ── Floating petals ── */
        @keyframes floatPetal {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0;    }
          8%   {                                              opacity: 0.18; }
          92%  {                                              opacity: 0.18; }
          100% { transform: translateY(-8vh)  rotate(390deg); opacity: 0;    }
        }
        .petal { position: fixed; border-radius: 50% 0 50% 0; animation: floatPetal linear infinite; pointer-events: none; }
      `}</style>

            {/* Subtle petals */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="petal"
                    style={{
                        left: `${(i * 12.5) % 100}%`,
                        zIndex: 1,
                        width: `${10 + (i % 3) * 4}px`,
                        height: `${14 + (i % 4) * 4}px`,
                        background:
                            i % 2 === 0 ?
                                "rgba(232,164,160,0.22)"
                            :   "rgba(242,207,200,0.18)",
                        animationDuration: `${16 + i * 2.5}s`,
                        animationDelay: `${-(i * 2.2)}s`,
                    }}
                />
            ))}

            <div
                className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden ${missFlash ? "miss-flash" : ""}`}
                style={{ background: "#080403" }}
            >
                {/* Stars */}
                {[...Array(28)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${Math.sin(i * 137.5) * 50 + 50}%`,
                            top: `${Math.cos(i * 97.3) * 50 + 50}%`,
                            width: `${1 + (i % 3)}px`,
                            height: `${1 + (i % 3)}px`,
                            animationDuration: `${2.5 + (i % 5) * 0.7}s`,
                            animationDelay: `${-(i * 0.4)}s`,
                        }}
                    />
                ))}

                {/* Warm glow */}
                <div
                    className="pointer-events-none fixed inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 50%, rgba(196,103,95,0.06) 0%, transparent 65%)",
                    }}
                />

                <div className="relative z-10 flex w-full flex-col items-center gap-0 px-6">
                    {/* ── QUIET LINES ── */}
                    {!showLoveName && (
                        <div className="flex w-full max-w-xs flex-col items-center gap-7 text-center">
                            {QUIET_LINES.map((line, i) =>
                                visibleLines > i ?
                                    <p
                                        key={i}
                                        className={`anim-line font-cormorant whitespace-pre-line leading-relaxed ${
                                            i === 2 ? "text-[1.55rem] italic"
                                            : i === 3 ? "text-[1.05rem]"
                                            : "text-[1.15rem]"
                                        }`}
                                        style={{
                                            color:
                                                i === 2 ?
                                                    "rgba(232,164,160,0.85)"
                                                :   "rgba(253,240,232,0.6)",
                                        }}
                                    >
                                        {line.text}
                                    </p>
                                :   null,
                            )}
                        </div>
                    )}

                    {/* ── LOVE YOU videeshaaHA ── */}
                    {showLoveName && (
                        <div className="flex w-full flex-col items-center gap-3 text-center">
                            {/* "love you" */}
                            {nameStage >= 1 && (
                                <p
                                    className="anim-love font-cormorant text-[1.4rem] font-light italic"
                                    style={{
                                        color: "rgba(232,164,160,0.75)",
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    love you
                                </p>
                            )}

                            {/* videeshaaHA */}
                            {nameStage >= 2 && (
                                <h1
                                    className="anim-videeshaaha font-dancing shimmer-text"
                                    style={{
                                        fontSize: "clamp(3.2rem, 13vw, 5.5rem)",
                                        lineHeight: 1.1,
                                        letterSpacing: "0.03em",
                                    }}
                                >
                                    videeshaa
                                </h1>
                            )}

                            {/* hearts ring around name */}
                            {nameStage >= 2 && (
                                <div className="pointer-events-none relative flex items-center justify-center gap-3 mt-1">
                                    {["♥", "🌸", "♥", "🌸", "♥"].map((e, i) => (
                                        <span
                                            key={i}
                                            className="anim-love"
                                            style={{
                                                fontSize:
                                                    i % 2 === 0 ?
                                                        "1.1rem"
                                                    :   "0.85rem",
                                                color:
                                                    i % 2 === 0 ?
                                                        "rgba(232,164,160,0.7)"
                                                    :   "rgba(201,169,110,0.5)",
                                                animationDelay: `${i * 0.12}s`,
                                                opacity: 0,
                                            }}
                                        >
                                            {e}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Game prompt */}
                            {nameStage >= 3 &&
                                showGame &&
                                !gameStarted &&
                                !gameOver && (
                                    <div className="anim-prompt mt-8 flex flex-col items-center gap-4">
                                        <p
                                            className="font-cormorant text-sm italic"
                                            style={{
                                                color: "rgba(232,164,160,0.55)",
                                            }}
                                        >
                                            one last thing —
                                        </p>
                                        <p
                                            className="font-cormorant text-[1.1rem]"
                                            style={{
                                                color: "rgba(253,240,232,0.72)",
                                            }}
                                        >
                                            catch my hearts 🎮
                                        </p>
                                        <button
                                            onClick={startGame}
                                            className="font-cormorant mt-1 rounded-full px-8 py-3 text-[1.05rem] italic tracking-wide text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #d4817a, #c4675f)",
                                                boxShadow:
                                                    "0 4px 20px rgba(196,103,95,0.35)",
                                            }}
                                        >
                                            play ♥
                                        </button>
                                        <p
                                            className="font-cormorant text-xs"
                                            style={{
                                                color: "rgba(176,144,144,0.4)",
                                            }}
                                        >
                                            mouse / touch to move basket • ← →
                                            keys
                                        </p>
                                    </div>
                                )}

                            {/* ── GAME OVER ── */}
                            {gameOver && (
                                <div className="anim-prompt mt-6 flex flex-col items-center gap-4 text-center">
                                    <p
                                        className="font-dancing text-[2rem]"
                                        style={{ color: "#e8a4a0" }}
                                    >
                                        {score >= 20 ?
                                            "she caught them all 💕"
                                        : score >= 10 ?
                                            "almost, love! 🌸"
                                        :   "try again! ♥"}
                                    </p>
                                    <p
                                        className="font-cormorant text-[1.15rem]"
                                        style={{
                                            color: "rgba(253,240,232,0.65)",
                                        }}
                                    >
                                        you caught{" "}
                                        <span style={{ color: "#e8a4a0" }}>
                                            {score}
                                        </span>{" "}
                                        hearts
                                        {highScore > score && (
                                            <span
                                                style={{
                                                    color: "rgba(176,144,144,0.5)",
                                                }}
                                            >
                                                {" "}
                                                · best: {highScore}
                                            </span>
                                        )}
                                    </p>
                                    <button
                                        onClick={startGame}
                                        className="font-cormorant rounded-full px-7 py-2.5 text-[1rem] italic text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #d4817a, #c4675f)",
                                            boxShadow:
                                                "0 4px 20px rgba(196,103,95,0.3)",
                                        }}
                                    >
                                        play again ♥
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── GAME AREA ── */}
                    {gameStarted && !gameOver && (
                        <div className="mt-5 w-full max-w-sm">
                            {/* HUD */}
                            <div className="mb-2 flex items-center justify-between px-1">
                                <div
                                    className="font-cormorant text-sm"
                                    style={{ color: "rgba(232,164,160,0.7)" }}
                                >
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                opacity: i < lives ? 1 : 0.2,
                                                marginRight: 2,
                                            }}
                                        >
                                            ♥
                                        </span>
                                    ))}
                                </div>
                                <div
                                    className={`font-dancing text-[1.4rem] ${catchFlash ? "score-pop" : ""}`}
                                    style={{ color: "#e8a4a0" }}
                                >
                                    {score}
                                </div>
                                <div
                                    className="font-cormorant text-xs"
                                    style={{ color: "rgba(176,144,144,0.4)" }}
                                >
                                    best: {highScore}
                                </div>
                            </div>

                            {/* Play field */}
                            <div
                                ref={gameAreaRef}
                                className="game-area w-full rounded-[20px]"
                                style={{
                                    height: "340px",
                                    background: "rgba(253,246,238,0.03)",
                                    border: "1px solid rgba(232,164,160,0.1)",
                                }}
                                onMouseMove={(e) =>
                                    handlePointerMove(e.clientX)
                                }
                                onTouchMove={(e) =>
                                    handlePointerMove(e.touches[0].clientX)
                                }
                            >
                                {/* Falling hearts */}
                                {hearts.map((h) => (
                                    <span
                                        key={h.id}
                                        className="falling-heart"
                                        style={{
                                            left: `${h.x}%`,
                                            top: `${h.y}%`,
                                            fontSize: `${h.size}px`,
                                            transform: "translateX(-50%)",
                                            color:
                                                h.emoji === "♥" ? "#e8a4a0"
                                                : h.emoji === "💕" ? "#f2cfc8"
                                                : h.emoji === "💗" ? "#c4675f"
                                                : h.emoji === "🌹" ? "#c9a96e"
                                                : "inherit",
                                        }}
                                    >
                                        {h.emoji}
                                    </span>
                                ))}

                                {/* Basket */}
                                <div
                                    className={`basket-glow absolute bottom-[8%] rounded-full transition-none ${catchFlash ? "basket-bounce" : ""}`}
                                    style={{
                                        left: `${basketX}%`,
                                        transform: "translateX(-50%)",
                                        width: "72px",
                                        height: "28px",
                                        background:
                                            "linear-gradient(135deg, rgba(232,164,160,0.9), rgba(196,103,95,0.8))",
                                        border: "1.5px solid rgba(255,255,255,0.25)",
                                        boxShadow:
                                            catchFlash ?
                                                "0 0 24px rgba(232,164,160,0.9)"
                                            :   undefined,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "0.8rem",
                                            opacity: 0.8,
                                        }}
                                    >
                                        ♥
                                    </span>
                                </div>

                                {/* Catch flash */}
                                {catchFlash && (
                                    <div
                                        className="pointer-events-none absolute inset-0 rounded-[20px]"
                                        style={{
                                            background: "rgba(232,164,160,0.1)",
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
