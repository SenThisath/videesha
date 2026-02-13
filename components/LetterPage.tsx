"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LetterPageProps {
  onNext?: () => void;
}

// ─── Letter content ───────────────────────────────────────────────────────────
const LETTER_LINES = [
  "Videeshaa,",
  "",
  "There are moments that quietly split a life in two —",
  "a before, and an after.",
  "",
  "We were friends first and then now we are a couple that we can't stay without each other now.",
  "",
  "I didn't know it then. You expressed your feelings",
  "And then I realized....",
  "I was something worth seeing —",
  "I was already yours.",
  "",
  "Every day since has been a gift",
  "I keep unwrapping.",
  "",
  "Always & entirely,",
  "Yours ♥",
];

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 8.5) % 100}%`,
  width: `${12 + (i % 4) * 5}px`,
  height: `${16 + (i % 3) * 6}px`,
  bg: i % 3 === 0 ? "#e8a4a0" : i % 3 === 1 ? "#f2cfc8" : "#dba89e",
  duration: `${14 + i * 2.2}s`,
  delay: `${-(i * 1.9)}s`,
}));

// ─── Component ────────────────────────────────────────────────────────────────
export default function LetterPage({ onNext }: LetterPageProps) {
  // Stage: "envelope" | "opening" | "letter" | "text" | "button"
  const [stage, setStage] = useState<"envelope" | "opening" | "letter" | "text" | "button">("envelope");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showButton, setShowButton] = useState<boolean>(false);
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  // When envelope is clicked → open it
  const handleEnvelopeClick = (): void => {
    if (stage !== "envelope") return;
    setStage("opening");
    // After flap opens → show letter rising
    setTimeout(() => setStage("letter"), 900);
    // After letter is visible → start revealing lines
    setTimeout(() => setStage("text"), 1600);
  };

  // Reveal letter lines one by one
  useEffect(() => {
    if (stage !== "text") return;
    let line = 0;
    const interval = setInterval(() => {
      line++;
      setVisibleLines(line);
      if (line >= LETTER_LINES.length) clearInterval(interval);
    }, 220);
    return () => clearInterval(interval);
  }, [stage]);

  // Show the continue button 10s after text starts appearing
  useEffect(() => {
    if (stage !== "text") return;
    const t = setTimeout(() => setShowButton(true), 10000);
    return () => clearTimeout(t);
  }, [stage]);

  const handleNext = (): void => {
    setFadeOut(true);
    setTimeout(() => onNext?.(), 900);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lato:wght@300;400&family=Dancing+Script:wght@400;600&display=swap');

        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dancing   { font-family: 'Dancing Script', cursive; }
        .font-lato      { font-family: 'Lato', sans-serif; }

        /* ── Petals ── */
        @keyframes floatPetal {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0;    }
          8%   {                                              opacity: 0.15; }
          92%  {                                              opacity: 0.15; }
          100% { transform: translateY(-8vh)  rotate(400deg); opacity: 0;    }
        }
        .animate-petal { animation: floatPetal linear infinite; }

        /* ── Page fade in ── */
        @keyframes pageIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1);    }
        }
        .animate-page-in { animation: pageIn 0.9s ease forwards; }

        /* ── Envelope idle float ── */
        @keyframes envFloat {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%     { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-env-float { animation: envFloat 3.5s ease-in-out infinite; }
        .animate-env-float.opening { animation: none; }

        /* ── Envelope flap open ── */
        @keyframes flapOpen {
          0%   { transform: rotateX(0deg);   }
          100% { transform: rotateX(-178deg); }
        }
        .flap-closed { transform-origin: top center; transform: rotateX(0deg); }
        .flap-open   {
          transform-origin: top center;
          animation: flapOpen 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
        }

        /* ── Envelope shake on hover ── */
        @keyframes envWiggle {
          0%,100% { transform: translateY(0px) rotate(0deg);   }
          25%     { transform: translateY(-3px) rotate(-2deg);  }
          75%     { transform: translateY(-3px) rotate(2deg);   }
        }
        .env-hover:hover { animation: envWiggle 0.5s ease-in-out; cursor: pointer; }

        /* ── Letter rises from envelope ── */
        @keyframes letterRise {
          0%   { transform: translateY(60px); opacity: 0; }
          60%  { opacity: 1; }
          100% { transform: translateY(0px);  opacity: 1; }
        }
        .animate-letter-rise {
          animation: letterRise 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* ── Letter line reveal ── */
        @keyframes lineIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        .line-reveal { animation: lineIn 0.4s ease forwards; }

        /* ── Wax seal pulse ── */
        @keyframes sealPulse {
          0%,100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(196,103,95,0.4);  }
          50%     { transform: scale(1.06); box-shadow: 0 0 0 8px rgba(196,103,95,0);  }
        }
        .animate-seal { animation: sealPulse 2.2s ease-in-out infinite; }

        /* ── Continue button ── */
        @keyframes btnReveal {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .animate-btn-reveal { animation: btnReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* ── Shimmer on button ── */
        .lp-shimmer::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.55s;
        }
        .lp-shimmer:hover::before { left: 100%; }

        /* ── Grain ── */
        .lp-grain::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        /* ── Perspective for flap ── */
        .env-perspective { perspective: 600px; }

        /* ── Hint text below envelope ── */
        @keyframes hintPulse {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
        .animate-hint { animation: hintPulse 2s ease-in-out infinite; }
      `}</style>
          
          

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
          lp-grain animate-page-in relative flex min-h-screen w-full flex-col
          items-center justify-center overflow-hidden font-lato
          transition-opacity duration-[900ms] ease-in-out
          ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
        style={{
          background: "radial-gradient(ellipse at 60% 30%, #f9ede6 0%, #f4ddd6 35%, #eddbd8 65%, #e5cac4 100%)",
        }}
      >

        {/* ════════════════════════════════════
            ENVELOPE STAGE
        ════════════════════════════════════ */}
        {(stage === "envelope" || stage === "opening") && (
          <div className="relative z-10 flex flex-col items-center gap-6">

            {/* Hint text */}
            {stage === "envelope" && (
              <p
                className="animate-hint font-cormorant text-sm italic tracking-widest"
                style={{ color: "#b09090" }}
              >
                something is waiting for you…
              </p>
            )}

            {/* Envelope */}
            <div
              className={`env-perspective relative select-none ${stage === "envelope" ? "animate-env-float env-hover" : "opening"}`}
              onClick={handleEnvelopeClick}
              style={{ width: 280, height: 200 }}
            >
              {/* ── Envelope body ── */}
              <svg
                width="280" height="200" viewBox="0 0 280 200"
                fill="none" xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 drop-shadow-xl"
                style={{ filter: "drop-shadow(0 12px 32px rgba(196,103,95,0.22))" }}
              >
                {/* Body */}
                <rect x="2" y="2" width="276" height="196" rx="12"
                  fill="#fdf0e8" stroke="rgba(201,169,110,0.4)" strokeWidth="1.5" />
                {/* Bottom fold lines (V shape) */}
                <path d="M2 196 L140 110 L278 196" fill="#f5ddd4" stroke="rgba(196,103,95,0.15)" strokeWidth="1" />
                {/* Left triangle */}
                <path d="M2 2 L2 196 L140 110 Z" fill="#f7e4dc" stroke="rgba(196,103,95,0.12)" strokeWidth="1" />
                {/* Right triangle */}
                <path d="M278 2 L278 196 L140 110 Z" fill="#f7e4dc" stroke="rgba(196,103,95,0.12)" strokeWidth="1" />
              </svg>

              {/* ── Flap (top triangle, animated) ── */}
              <div
                className={`absolute inset-x-0 top-0 env-perspective overflow-hidden`}
                style={{ height: 100, zIndex: 10 }}
              >
                <svg
                  width="280" height="100" viewBox="0 0 280 100"
                  className={stage === "opening" ? "flap-open" : "flap-closed"}
                  style={{
                    transformOrigin: "top center",
                    filter: "drop-shadow(0 4px 8px rgba(196,103,95,0.18))",
                  }}
                >
                  <path d="M2 2 L278 2 L140 90 Z"
                    fill="#f5ddd4" stroke="rgba(201,169,110,0.35)" strokeWidth="1.5" />
                  {/* Gold border accent */}
                  <path d="M10 2 L270 2" stroke="rgba(201,169,110,0.5)" strokeWidth="0.8" />
                </svg>
              </div>

              {/* ── Wax seal ── */}
              {stage === "envelope" && (
                <div
                  className="animate-seal absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: 68,
                    width: 44, height: 44,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 38% 38%, #d4817a, #c4675f 60%, #a8534c)",
                    zIndex: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 12px rgba(196,103,95,0.4)",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem" }}>♥</span>
                </div>
              )}
            </div>

            {/* Click prompt */}
            {stage === "envelope" && (
              <p
                className="font-cormorant animate-hint text-[0.78rem] uppercase tracking-[0.18em]"
                style={{ color: "#c4675f" }}
              >
                tap to open
              </p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════
            LETTER STAGE
        ════════════════════════════════════ */}
        {(stage === "letter" || stage === "text" || stage === "button") && (
          <div className="relative z-10 flex w-full flex-col items-center px-4">

            {/* Letter paper */}
            <div
              className="animate-letter-rise relative w-full max-w-[480px]"
              style={{
                background: "rgba(253,248,242,0.95)",
                border: "1px solid rgba(201,169,110,0.2)",
                borderRadius: "4px 4px 4px 4px",
                boxShadow:
                  "0 20px 60px rgba(196,103,95,0.14), 0 4px 16px rgba(196,103,95,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                padding: "52px 52px 44px",
              }}
            >
              {/* Top decorative rule */}
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.4))" }} />
                <span style={{ color: "#c9a96e", fontSize: "0.6rem", letterSpacing: "6px" }}>✦ ✦ ✦</span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(201,169,110,0.4), transparent)" }} />
              </div>

              {/* Letter lines */}
              <div className="font-cormorant space-y-1" style={{ color: "#3a2a28" }}>
                {LETTER_LINES.map((line, i) => {
                  const isVisible = i < visibleLines;
                  const isGreeting = i === 0;
                  const isSignature = i >= LETTER_LINES.length - 2;
                  const isEmpty = line === "";

                  if (isEmpty) {
                    return isVisible ? <div key={i} className="h-3" /> : null;
                  }

                  return isVisible ? (
                    <p
                      key={i}
                      className={`line-reveal leading-relaxed ${
                        isGreeting
                          ? "font-dancing text-2xl font-semibold mb-3"
                          : isSignature
                          ? "font-dancing text-xl mt-4"
                          : "text-[1.05rem] font-light tracking-[0.01em]"
                      }`}
                      style={{
                        color: isSignature ? "#c4675f" : isGreeting ? "#3a2a28" : "#4a3430",
                        animationDelay: "0ms",
                      }}
                    >
                      {line}
                    </p>
                  ) : null;
                })}
              </div>

              {/* Bottom decorative rule */}
              <div className="mt-8 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.3))" }} />
                <span style={{ color: "#c9a96e", fontSize: "0.55rem", letterSpacing: "4px" }}>✦</span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(201,169,110,0.3), transparent)" }} />
              </div>

              {/* Subtle lined paper effect */}
              <div
                className="pointer-events-none absolute inset-0 rounded-sm opacity-[0.03]"
                style={{
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #c4675f 27px, #c4675f 28px)",
                  backgroundPositionY: "52px",
                }}
              />
            </div>

            {/* ── Continue button — appears after 10s ── */}
            {showButton && (
              <button
                onClick={handleNext}
                className="lp-shimmer animate-btn-reveal font-cormorant relative mt-10 overflow-hidden rounded-full px-10 py-4 text-[1.12rem] italic tracking-[0.06em] text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg, #d4817a 0%, #c4675f 55%, #b35b54 100%)",
                  boxShadow: "0 6px 28px rgba(196,103,95,0.38), 0 2px 8px rgba(196,103,95,0.2)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                carry me to the next chapter →
              </button>
            )}

            {/* Subtle waiting hint before button appears */}
            {!showButton && stage === "text" && visibleLines >= LETTER_LINES.length && (
              <p
                className="animate-hint font-cormorant mt-8 text-sm italic tracking-widest"
                style={{ color: "#c4675f", opacity: 0.6 }}
              >
                take your time, i&apos;ll wait…
              </p>
            )}
          </div>
        )}

      </div>
    </>
  );
}