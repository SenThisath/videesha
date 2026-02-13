"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReasonsPageProps {
  onNext?: () => void;
}

interface Ripple {
  id: number;
}

// ─── Content ──────────────────────────────────────────────────────────────────
const REASONS: { emoji: string; text: string }[] = [
  { emoji: "🌸", text: "The way your smile." },
  { emoji: "🤍", text: "The way you love me." },
  { emoji: "😶", text: "The face you make when you're trying not to smile but you absolutely cannot help it." },
  { emoji: "✨", text: "Every second I talk with you." },
  { emoji: "🎵", text: "Your voice." },
  { emoji: "🔍", text: "How you remember the little things. The small details no one else even notices." },
  { emoji: "🪞", text: "The way you look at me like I'm somehow more than I actually am." },
  { emoji: "♥️", text: "The way encourage me." },
  { emoji: "🌿", text: "Your expressions." },
  { emoji: "🕊️", text: "When you are calling me baba, sudu and telling love you, adareiiiii....." },
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
export default function ReasonsPage({ onNext }: ReasonsPageProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [entered, setEntered] = useState<boolean>(false);
  const [titleVisible, setTitleVisible] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<number>(0); // 0 = title, 1-10 = reasons, 11 = epilogue
  const [cardVisible, setCardVisible] = useState<boolean>(true);
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const rippleId = useRef<number>(0);

  // Entry ripple burst → then show title card
  useEffect(() => {
    const delays = [0, 180, 380];
    const timers: ReturnType<typeof setTimeout>[] = [];

    delays.forEach((d) => {
      timers.push(
        setTimeout(() => {
          setRipples((r) => [...r, { id: ++rippleId.current }]);
        }, d)
      );
    });

    timers.push(setTimeout(() => setEntered(true), 850));
    timers.push(setTimeout(() => setTitleVisible(true), 1050));

    return () => timers.forEach(clearTimeout);
  }, []);
    
      // Transition helper: fade out current, swap, fade in
  const advanceTo = (next: number) => {
    setCardVisible(false);
    setTimeout(() => {
      setCurrentCard(next);
      setCardVisible(true);
    }, 380);
  };

  // Auto-advance title → first card after 1.8s
  useEffect(() => {
    if (!titleVisible) return;
    const t = setTimeout(() => advanceTo(1), 1800);
    return () => clearTimeout(t);
  }, [titleVisible]);



  const handleCardNext = () => {
    const next = currentCard + 1;
    if (next <= REASONS.length + 1) {
      advanceTo(next);
    }
  };

  const handleFinalNext = () => {
    setFadeOut(true);
    setTimeout(() => onNext?.(), 900);
  };

  const isEpilogue = currentCard === REASONS.length + 1;
  const isReason = currentCard >= 1 && currentCard <= REASONS.length;
  const reason = isReason ? REASONS[currentCard - 1] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@500;700&family=Lato:wght@300;400&display=swap');

        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dancing   { font-family: 'Dancing Script', cursive; }

        /* ── Ripple ── */
        @keyframes rippleOut {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.65; }
          100% { transform: translate(-50%,-50%) scale(6); opacity: 0;    }
        }
        .ripple-ring {
          position: fixed;
          left: 50%; top: 50%;
          width: 55vw; height: 55vw;
          border-radius: 50%;
          pointer-events: none;
          z-index: 60;
          background: radial-gradient(circle, rgba(232,164,160,0.5) 0%, rgba(242,207,200,0.25) 50%, transparent 70%);
          animation: rippleOut 1.2s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* ── Petals ── */
        @keyframes floatPetal {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0;    }
          8%   {                                              opacity: 0.16; }
          92%  {                                              opacity: 0.16; }
          100% { transform: translateY(-8vh)  rotate(390deg); opacity: 0;    }
        }
        .animate-petal { animation: floatPetal linear infinite; }

        /* ── Grain ── */
        .rp-grain::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.042'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        /* ── Page fade in ── */
        @keyframes pageIn { from { opacity:0; } to { opacity:1; } }
        .animate-page-in { animation: pageIn 0.7s ease forwards; }

        /* ── Card transitions ── */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes cardOut {
          from { opacity: 1; transform: translateY(0)     scale(1);    }
          to   { opacity: 0; transform: translateY(-20px) scale(0.97); }
        }
        .card-enter { animation: cardIn  0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        .card-exit  { animation: cardOut 0.32s ease forwards; }

        /* ── Title card ── */
        @keyframes titleIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-title-card { animation: titleIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* ── Emoji bounce ── */
        @keyframes emojiBounce {
          0%,100% { transform: scale(1);    }
          40%     { transform: scale(1.18); }
          70%     { transform: scale(0.94); }
        }
        .animate-emoji { animation: emojiBounce 0.6s 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

        /* ── Counter dots ── */
        .dot-active  { background: #c4675f; transform: scale(1.25); }
        .dot-done    { background: rgba(196,103,95,0.45); }
        .dot-pending { background: rgba(196,103,95,0.15); }

        /* ── Next button shimmer ── */
        .rp-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .rp-btn:hover::before { left: 100%; }

        /* ── Epilogue ── */
        @keyframes epilogueIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .animate-epilogue { animation: epilogueIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* ── Glow pulse behind card ── */
        @keyframes glowPulse {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%     { opacity: 0.55; transform: scale(1.08); }
        }
        .card-glow { animation: glowPulse 3s ease-in-out infinite; }
      `}</style>

      {/* Ripple rings */}
      {ripples.map((r) => (
        <div key={r.id} className="ripple-ring" />
      ))}

      {/* Petals */}
      {PETALS.map(({ id, left, width, height, bg, duration, delay }) => (
        <div
          key={id}
          className="animate-petal fixed pointer-events-none"
          style={{
            left, width, height, background: bg,
            borderRadius: "50% 0 50% 0",
            animationDuration: duration,
            animationDelay: delay,
            zIndex: 1,
          }}
        />
      ))}

      {/* Root */}
      <div
        className={`
          rp-grain relative flex min-h-screen w-full flex-col items-center justify-center
          overflow-hidden transition-opacity duration-[900ms] ease-in-out
          ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
        style={{
          background: "radial-gradient(ellipse at 30% 20%, #f9ede6 0%, #f4ddd6 30%, #eddbd8 60%, #e8cfc8 100%)",
        }}
      >
        {entered && (
          <div className="animate-page-in relative z-10 flex w-full flex-col items-center justify-center px-5">

            {/* ── TITLE CARD ── */}
            {currentCard === 0 && titleVisible && (
              <div className={`animate-title-card flex flex-col items-center text-center gap-4`}>
                <p
                  className="font-cormorant text-xs uppercase tracking-[0.22em]"
                  style={{ color: "#b09090" }}
                >
                  a few things i never want you to forget
                </p>
                <h1
                  className="font-cormorant text-[3rem] font-light leading-tight"
                  style={{ color: "#3a2a28" }}
                >
                  10 Reasons<br />
                  <span className="italic" style={{ color: "#c4675f" }}>I&quot;m Lucky</span>
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.5))" }} />
                  <span style={{ color: "#c9a96e", fontSize: "0.6rem", letterSpacing: "5px" }}>✦ ✦ ✦</span>
                  <div className="h-px w-12" style={{ background: "linear-gradient(90deg, rgba(201,169,110,0.5), transparent)" }} />
                </div>
              </div>
            )}

            {/* ── REASON CARDS ── */}
            {isReason && reason && (
              <div
                className={`relative flex w-full max-w-sm flex-col items-center gap-6 ${cardVisible ? "card-enter" : "card-exit"}`}
              >
                {/* Glow behind card */}
                <div
                  className="card-glow pointer-events-none absolute inset-0 rounded-3xl"
                  style={{
                    background: "radial-gradient(circle at 50% 60%, rgba(232,164,160,0.35) 0%, transparent 70%)",
                    filter: "blur(24px)",
                  }}
                />

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                  {REASONS.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i + 1 === currentCard
                          ? "dot-active h-2 w-2"
                          : i + 1 < currentCard
                          ? "dot-done h-1.5 w-1.5"
                          : "dot-pending h-1.5 w-1.5"
                      }`}
                    />
                  ))}
                </div>

                {/* Card */}
                <div
                  className="relative w-full rounded-[28px] px-9 py-11 text-center"
                  style={{
                    background: "rgba(253,246,238,0.82)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(201,169,110,0.22)",
                    boxShadow:
                      "0 12px 52px rgba(196,103,95,0.14), 0 2px 12px rgba(196,103,95,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
                  }}
                >
                  {/* Counter */}
                  <p
                    className="font-cormorant mb-5 text-xs uppercase tracking-[0.18em]"
                    style={{ color: "#b09090" }}
                  >
                    reason {String(currentCard).padStart(2, "0")} of {REASONS.length}
                  </p>

                  {/* Emoji */}
                  <div className="animate-emoji mb-5 text-[3.2rem] leading-none">
                    {reason.emoji}
                  </div>

                  {/* Divider */}
                  <div className="mx-auto mb-6 h-px w-16"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.45), transparent)" }}
                  />

                  {/* Text */}
                  <p
                    className="font-cormorant text-[1.18rem] font-light leading-relaxed"
                    style={{ color: "#4a3430" }}
                  >
                    {reason.text}
                  </p>
                </div>

                {/* Next button */}
                <button
                  onClick={handleCardNext}
                  className="rp-btn font-cormorant relative overflow-hidden rounded-full px-9 py-3.5 text-[1.05rem] italic tracking-[0.05em] text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #d4817a 0%, #c4675f 55%, #b35b54 100%)",
                    boxShadow: "0 4px 20px rgba(196,103,95,0.32), 0 1px 4px rgba(196,103,95,0.2)",
                  }}
                >
                  {currentCard < REASONS.length ? "and another thing… →" : "and yet… →"}
                </button>
              </div>
            )}

            {/* ── EPILOGUE CARD ── */}
            {isEpilogue && (
              <div
                className={`animate-epilogue flex w-full max-w-sm flex-col items-center gap-7 text-center ${cardVisible ? "" : "card-exit"}`}
              >
                {/* Card */}
                <div
                  className="w-full rounded-[28px] px-9 py-11"
                  style={{
                    background: "rgba(253,246,238,0.82)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(201,169,110,0.22)",
                    boxShadow:
                      "0 12px 52px rgba(196,103,95,0.16), 0 2px 12px rgba(196,103,95,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
                  }}
                >
                  <div className="mb-5 text-[3rem]">🌹</div>

                  <div className="mx-auto mb-6 h-px w-16"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.45), transparent)" }}
                  />

                  <p
                    className="font-cormorant text-[1.32rem] font-light italic leading-relaxed"
                    style={{ color: "#4a3430" }}
                  >
                    And yet…
                  </p>
                  <p
                    className="font-cormorant mt-2 text-[1.15rem] font-light leading-relaxed"
                    style={{ color: "#7a5a56" }}
                  >
                    that&quot;s not even all of it.
                  </p>

                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.4))" }} />
                    <span style={{ color: "#c9a96e", fontSize: "0.55rem", letterSpacing: "5px" }}>✦ ✦ ✦</span>
                    <div className="h-px w-12" style={{ background: "linear-gradient(90deg, rgba(201,169,110,0.4), transparent)" }} />
                  </div>
                </div>

                {/* Final CTA */}
                <button
                  onClick={handleFinalNext}
                  className="rp-btn font-cormorant relative overflow-hidden rounded-full px-9 py-3.5 text-[1.05rem] italic tracking-[0.05em] text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #d4817a 0%, #c4675f 55%, #b35b54 100%)",
                    boxShadow: "0 4px 20px rgba(196,103,95,0.32), 0 1px 4px rgba(196,103,95,0.2)",
                  }}
                >
                  there&quot;s still more to feel →
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}