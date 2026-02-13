"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LockScreenProps {
    /** Anniversary date in DD/MM format */
    correctDate?: string;
    /** Called after the unlock animation fully finishes */
    onUnlock?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WRONG_MESSAGES: string[] = [
    "Nope 😜 But you look cute trying.",
    "Hint: It's the day everything changed.",
    "You were there too you know 👀",
    "Try again, genius ❤️",
    "Getting warmer… just kidding 😂",
    "So close, yet so far away 💭",
    "Format: DD/MM — just saying 🌹",
];

const PETALS = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${(i * 7.2) % 100}%`,
    width: `${13 + (i % 4) * 5}px`,
    height: `${17 + (i % 3) * 7}px`,
    bg: i % 2 === 0 ? "#e8a4a0" : "#f2cfc8",
    duration: `${13 + i * 2.1}s`,
    delay: `${-(i * 1.7)}s`,
}));

// ─── Component ────────────────────────────────────────────────────────────────
export default function LockScreen({
    onUnlock,
    correctDate = "14/02/2023",
}: LockScreenProps) {
    const [input, setInput] = useState<string>("");
    const [attempt, setAttempt] = useState<number>(0);
    const [toast, setToast] = useState<string>("");
    const [toastVisible, setToastVisible] = useState<boolean>(false);
    const [toastKey, setToastKey] = useState<number>(0);
    const [shaking, setShaking] = useState<boolean>(false);
    const [unlocking, setUnlocking] = useState<boolean>(false);
    const [unlocked, setUnlocked] = useState<boolean>(false);
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        let formatted = raw;
        if (raw.length > 2) formatted = raw.slice(0, 2) + "/" + raw.slice(2);
        if (raw.length > 4)
            formatted =
                raw.slice(0, 2) + "/" + raw.slice(2, 4) + "/" + raw.slice(4, 8);
        setInput(formatted);
    };

    const showToast = (msg: string): void => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(msg);
        setToastKey((k) => k + 1);
        setToastVisible(true);
        toastTimer.current = setTimeout(() => setToastVisible(false), 3200);
    };

    const handleUnlock = (): void => {
        if (!input.trim() || unlocking || unlocked) return;

        if (input === correctDate) {
            setToastVisible(false);
            setUnlocking(true);
            setTimeout(() => setUnlocked(true), 700);
            setTimeout(() => setFadeOut(true), 1600);
            setTimeout(() => onUnlock?.(), 2500);
        } else {
            const idx = Math.min(attempt, WRONG_MESSAGES.length - 1);
            showToast(WRONG_MESSAGES[idx]);
            setAttempt((a) => a + 1);
            setShaking(true);
            setTimeout(() => setShaking(false), 600);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") handleUnlock();
    };

    return (
        <>
            {/* ── Keyframe animations (Tailwind can't express these inline) ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lato:wght@300;400&display=swap');

        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-lato      { font-family: 'Lato', sans-serif; }

        @keyframes floatPetal {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0;    }
          8%   {                                              opacity: 0.16; }
          92%  {                                              opacity: 0.16; }
          100% { transform: translateY(-8vh)  rotate(390deg); opacity: 0;    }
        }
        .animate-petal { animation: floatPetal linear infinite; }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1);    opacity: 0.55; }
          50%       { transform: scale(1.4);  opacity: 1;    }
        }
        .animate-glow { animation: pulseGlow 1.9s ease-in-out infinite; }

        @keyframes unlockPop {
          0%   { transform: scale(1)   rotate(0deg);   }
          35%  { transform: scale(1.3) rotate(-10deg); }
          65%  { transform: scale(0.9) rotate(5deg);   }
          100% { transform: scale(1.1) rotate(0deg);   }
        }
        .animate-unlock-pop { animation: unlockPop 0.75s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        @keyframes shake {
          10%,90%    { transform: translateX(-3px); }
          20%,80%    { transform: translateX(5px);  }
          30%,50%,70%{ transform: translateX(-5px); }
          40%,60%    { transform: translateX(5px);  }
          100%       { transform: translateX(0);    }
        }
        .animate-shake { animation: shake 0.55s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .animate-msg { animation: msgIn 0.38s ease; }

        @keyframes bloomFade {
          0%  { opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 1; }
          100%{ opacity: 0; }
        }
        .animate-bloom-fade { animation: bloomFade 2s ease forwards; }

        @keyframes bloomGrow {
          from { width: 1px;   height: 1px;   opacity: 1;   }
          to   { width: 240vw; height: 240vw; opacity: 0.9; }
        }
        .animate-bloom-grow { animation: bloomGrow 1.4s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* Shackle transition */
        .ls-shackle {
          transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), stroke 0.3s;
          transform-origin: 50% 100%;
        }
        .ls-shackle-open {
          transform: translateX(7px) translateY(-7px) rotate(30deg);
        }

        /* Shimmer sweep on button hover */
        .ls-btn-shimmer::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transition: left 0.5s;
        }
        .ls-btn-shimmer:hover::before { left: 100%; }

        /* ── Toast popup ── */
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateY(-22px) scale(0.92); }
          55%  { opacity: 1; transform: translateY(4px)   scale(1.03); }
          75%  { transform: translateY(-2px) scale(0.99); }
          100% { transform: translateY(0)    scale(1);    opacity: 1;  }
        }
        @keyframes toastWiggle {
          0%,100% { transform: rotate(0deg);   }
          20%     { transform: rotate(-2.5deg); }
          40%     { transform: rotate(2.5deg);  }
          60%     { transform: rotate(-1.5deg); }
          80%     { transform: rotate(1deg);    }
        }
        @keyframes toastOut {
          0%   { opacity: 1; transform: translateY(0)     scale(1);    }
          100% { opacity: 0; transform: translateY(-16px) scale(0.94); }
        }
        .toast-enter {
          animation: toastIn 0.52s cubic-bezier(0.34,1.56,0.64,1) forwards,
                     toastWiggle 0.5s 0.52s ease-in-out forwards;
        }
        .toast-exit {
          animation: toastOut 0.4s ease forwards;
        }

        /* Noise grain overlay */
        .ls-grain::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

            {/* ── Floating petals ── */}
            {PETALS.map(({ id, left, width, height, bg, duration, delay }) => (
                <div
                    key={id}
                    className="animate-petal fixed z-10 pointer-events-none"
                    style={{
                        left,
                        width,
                        height,
                        background: bg,
                        borderRadius: "50% 0 50% 0",
                        animationDuration: duration,
                        animationDelay: delay,
                    }}
                />
            ))}

            {/* ── Root ── */}
            <div
                className={`
          ls-grain relative flex min-h-screen w-full items-center justify-center
          overflow-hidden font-lato transition-opacity duration-[900ms] ease-in-out
          ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
                style={{
                    background:
                        "radial-gradient(ellipse at 30% 20%, #f9ede6 0%, #f4ddd6 30%, #eddbd8 60%, #e8cfc8 100%)",
                }}
            >
                {/* ── Bloom overlay on success ── */}
                {unlocked && (
                    <div className="animate-bloom-fade fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
                        <div
                            className="animate-bloom-grow rounded-full"
                            style={{
                                width: "1px",
                                height: "1px",
                                background:
                                    "radial-gradient(circle, #fdf6ee 0%, #f2cfc8 45%, #e8a4a0 72%, transparent 100%)",
                            }}
                        />
                    </div>
                )}

                {/* ── Toast popup ── */}
                {toast && (
                    <div
                        key={toastKey}
                        className={`
              fixed top-8 left-1/2 z-50 -translate-x-1/2
              ${toastVisible ? "toast-enter" : "toast-exit"}
            `}
                        style={{ pointerEvents: "none" }}
                    >
                        <div
                            className="font-cormorant flex items-center gap-2.5 rounded-[20px] px-5 py-3.5 text-[0.97rem] italic tracking-[0.02em] shadow-lg"
                            style={{
                                background: "rgba(253,246,238,0.92)",
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                border: "1px solid rgba(196,103,95,0.22)",
                                color: "#c4675f",
                                boxShadow:
                                    "0 8px 32px rgba(196,103,95,0.18), 0 2px 8px rgba(196,103,95,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {/* Left heart pip */}
                            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                ♥
                            </span>
                            {toast}
                            {/* Right heart pip */}
                            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                ♥
                            </span>
                        </div>
                        {/* Little tail pointing down toward the card */}
                        <div
                            className="mx-auto mt-[-1px]"
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: "8px solid transparent",
                                borderRight: "8px solid transparent",
                                borderTop: "8px solid rgba(253,246,238,0.92)",
                                filter: "drop-shadow(0 2px 2px rgba(196,103,95,0.1))",
                            }}
                        />
                    </div>
                )}

                {/* ── Card ── */}
                <div
                    className="relative z-10 w-[90%] max-w-[420px] rounded-[28px] px-[52px] pb-12 pt-14 text-center"
                    style={{
                        background: "rgba(253,246,238,0.76)",
                        backdropFilter: "blur(28px)",
                        WebkitBackdropFilter: "blur(28px)",
                        border: "1px solid rgba(201,169,110,0.22)",
                        boxShadow:
                            "0 8px 48px rgba(196,103,95,0.13), 0 2px 12px rgba(196,103,95,0.07), inset 0 1px 0 rgba(255,255,255,0.72)",
                    }}
                >
                    {/* ── Lock icon ── */}
                    <div className="relative inline-flex items-center justify-center mb-1">
                        {/* Glow ring */}
                        <div
                            className="animate-glow absolute h-[84px] w-[84px] rounded-full"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(232,164,160,0.55) 0%, transparent 70%)",
                            }}
                        />
                        {/* SVG lock */}
                        <svg
                            className={`relative z-10 h-[58px] w-[52px] ${unlocking ? "animate-unlock-pop" : ""}`}
                            viewBox="0 0 54 62"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                className={`ls-shackle ${unlocked ? "ls-shackle-open" : ""}`}
                                d="M13 28V18C13 9.716 19.716 3 28 3C36.284 3 43 9.716 43 18V28"
                                stroke={unlocked ? "#c4675f" : "#c9a96e"}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                            />
                            <rect
                                x="7"
                                y="28"
                                width="40"
                                height="31"
                                rx="8"
                                fill={unlocked ? "#e8a4a0" : "#d4a0a0"}
                                style={{ transition: "fill 0.35s" }}
                            />
                            <circle
                                cx="27"
                                cy="41"
                                r="5"
                                fill="rgba(255,255,255,0.45)"
                            />
                            <rect
                                x="25"
                                y="44"
                                width="4"
                                height="6"
                                rx="2"
                                fill="rgba(255,255,255,0.45)"
                            />
                        </svg>
                    </div>

                    {/* ── Heading ── */}
                    <h1
                        className="font-cormorant mt-[18px] mb-1.5 text-[2.05rem] font-light leading-tight tracking-[0.01em]"
                        style={{ color: "#3a2a28" }}
                    >
                        A password that you are famillier with.
                    </h1>
                    <p
                        className="font-cormorant mb-7 text-base italic tracking-[0.025em]"
                        style={{ color: "#7a5a56" }}
                    >
                        the heart unlocks for the right date
                    </p>

                    {/* ── Divider ── */}
                    <div className="mb-6 flex items-center gap-2.5">
                        <div
                            className="h-px flex-1"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(201,169,110,0.35), transparent)",
                            }}
                        />
                        <span
                            className="text-[0.6rem] tracking-[5px]"
                            style={{ color: "#e8a4a0" }}
                        >
                            ✦ ✦ ✦
                        </span>
                        <div
                            className="h-px flex-1"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(201,169,110,0.35), transparent)",
                            }}
                        />
                    </div>

                    {/* ── Input ── */}
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="DD / MM"
                        maxLength={5}
                        disabled={unlocking || unlocked}
                        autoFocus
                        className={`
              font-cormorant mb-3.5 w-full rounded-2xl px-5 py-[14px]
              text-center text-[1.4rem] font-normal tracking-[0.14em] outline-none
              transition-all duration-300 disabled:opacity-60
              ${shaking ? "animate-shake" : ""}
            `}
                        style={{
                            background: "rgba(255,255,255,0.62)",
                            border: `1.5px solid ${shaking ? "rgba(196,103,95,0.6)" : "rgba(196,103,95,0.24)"}`,
                            color: "#3a2a28",
                            caretColor: "#c4675f",
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.background =
                                "rgba(255,255,255,0.88)";
                            e.currentTarget.style.border =
                                "1.5px solid rgba(196,103,95,0.5)";
                            e.currentTarget.style.boxShadow =
                                "0 0 0 4px rgba(232,164,160,0.18)";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.background =
                                "rgba(255,255,255,0.62)";
                            e.currentTarget.style.border =
                                "1.5px solid rgba(196,103,95,0.24)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    />

                    {/* ── Button ── */}
                    <button
                        onClick={handleUnlock}
                        disabled={unlocking || unlocked}
                        className="
              ls-btn-shimmer font-cormorant relative w-full overflow-hidden rounded-2xl
              px-5 py-4 text-[1.18rem] font-semibold tracking-[0.06em]
              text-[#fdf6ee] transition-all duration-200
              hover:-translate-y-0.5 active:translate-y-0
              disabled:cursor-default disabled:opacity-70
            "
                        style={{
                            background:
                                "linear-gradient(135deg, #d4817a 0%, #c4675f 55%, #b35b54 100%)",
                            boxShadow:
                                "0 4px 20px rgba(196,103,95,0.35), 0 1px 4px rgba(196,103,95,0.2)",
                        }}
                    >
                        {unlocked ?
                            "💕 My Heart is Yours"
                        : unlocking ?
                            "Unlocking…"
                        :   "Unlock My Heart"}
                    </button>

                    {/* ── Footer ── */}
                    <p
                        className="mt-7 text-[0.7rem] uppercase tracking-[0.09em]"
                        style={{ color: "#b09090" }}
                    >
                        made with love, just for you
                    </p>
                </div>
            </div>
        </>
    );
}
