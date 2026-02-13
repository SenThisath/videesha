"use client";

import { useState, useEffect } from "react";

interface MemoryPoint {
  id: string;
  label: string;       // e.g. "First date ☕"
  emoji: string;
  story: string;       // paragraph that expands on click
  position: {         // % position around the photo
    top: string;
    left: string;
  };
}

interface MemoryMapProps {
  photoSrc?: string;  // your one photo, e.g. "/photos/us.jpg"
  onNext?: () => void;
}

// ── Customise these memory points ────────────────────────────────────────────
const MEMORY_POINTS: MemoryPoint[] = [

  {
    id: "first-i-love",
    label: "Love you soooooo much.............'",
    emoji: "♥️",
    story: "I still remember the exact moment I realized you were loving me.",
    position: { top: "72%", left: "65%" },
  },
];

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 8.1) % 100}%`,
  width: `${12 + (i % 4) * 4}px`,
  height: `${16 + (i % 3) * 5}px`,
  bg: i % 2 === 0 ? "#e8a4a0" : "#f2cfc8",
  duration: `${13 + i * 2.1}s`,
  delay: `${-(i * 1.7)}s`,
}));

export default function MemoryMap({ photoSrc = "", onNext }: MemoryMapProps) {
  const [titleVisible, setTitleVisible] = useState<boolean>(false);
  const [pointsVisible, setPointsVisible] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [openPoint, setOpenPoint] = useState<string | null>(null);
  const [allInteracted, setAllInteracted] = useState<boolean>(false);
  const [interacted, setInteracted] = useState<Set<string>>(new Set());
  const [buttonVisible, setButtonVisible] = useState<boolean>(false);
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 300);
    const t2 = setTimeout(() => setPointsVisible(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Stagger the memory points
  useEffect(() => {
    if (!pointsVisible) return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= MEMORY_POINTS.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [pointsVisible]);

  const handlePoint = (id: string) => {
    setOpenPoint(openPoint === id ? null : id);
    const next = new Set(interacted).add(id);
    setInteracted(next);
    if (next.size >= MEMORY_POINTS.length && !buttonVisible) {
      setTimeout(() => setButtonVisible(true), 600);
    }
  };

  const handleNext = () => {
    setFadeOut(true);
    setTimeout(() => onNext?.(), 900);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lato:wght@300;400&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }

        @keyframes floatPetal {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0;    }
          8%   {                                              opacity: 0.15; }
          92%  {                                              opacity: 0.15; }
          100% { transform: translateY(-8vh)  rotate(390deg); opacity: 0;    }
        }
        .animate-petal { animation: floatPetal linear infinite; }

        .mp-grain::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        @keyframes titleIn {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-title { animation: titleIn 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes photoIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-photo { animation: photoIn 0.9s 0.4s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes pointIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-point { animation: pointIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* Ping animation on memory points */
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.7; }
          80%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .anim-ping { animation: ping 2s ease-out infinite; }

        /* Expand story */
        .story-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.5s ease;
        }
        .story-wrap.open {
          grid-template-rows: 1fr;
        }
        .story-inner { overflow: hidden; }

        @keyframes btnIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-btn { animation: btnIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .mm-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .mm-btn:hover::before { left: 100%; }

        @keyframes photoGlow {
          0%,100% { box-shadow: 0 12px 48px rgba(196,103,95,0.18), 0 2px 12px rgba(196,103,95,0.1); }
          50%     { box-shadow: 0 18px 60px rgba(196,103,95,0.28), 0 4px 18px rgba(196,103,95,0.15); }
        }
        .photo-glow { animation: photoGlow 3.5s ease-in-out infinite; }
      `}</style>

      {/* Petals */}
      {PETALS.map(({ id, left, width, height, bg, duration, delay }) => (
        <div key={id} className="animate-petal fixed pointer-events-none"
          style={{ left, width, height, background: bg, borderRadius: "50% 0 50% 0",
            animationDuration: duration, animationDelay: delay, zIndex: 1 }} />
      ))}

      <div
        className={`mp-grain relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden pb-16 pt-12 transition-opacity duration-[900ms] ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ background: "radial-gradient(ellipse at 30% 20%, #f9ede6 0%, #f4ddd6 30%, #eddbd8 60%, #e8cfc8 100%)" }}
      >
        <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8 px-5">

          {/* Title */}
          {titleVisible && (
            <div className="anim-title text-center">
              <p className="font-cormorant text-xs uppercase tracking-[0.22em] mb-2"
                style={{ color: "#b09090" }}>our story has locations</p>
              <h2 className="font-cormorant text-[2.2rem] font-light leading-tight"
                style={{ color: "#3a2a28" }}>
                Every Place<br />
                <span className="italic" style={{ color: "#c4675f" }}>Holds a Memory</span>
              </h2>
              <div className="mx-auto mt-4 h-px w-16"
                style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent)" }} />
            </div>
          )}

          {/* Photo + memory points */}
          <div className="relative w-full" style={{ aspectRatio: "1 / 1.05" }}>

            {/* Photo */}
            <div
              className="anim-photo photo-glow relative overflow-hidden rounded-[24px]"
              style={{
                width: "100%", height: "100%",
                border: "1px solid rgba(201,169,110,0.22)",
              }}
            >
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt="Us" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3"
                  style={{ background: "linear-gradient(135deg, rgba(242,207,200,0.7), rgba(232,164,160,0.5))" }}>
                  <div className="text-5xl">🖼️</div>
                  <p className="font-cormorant text-sm italic" style={{ color: "rgba(122,90,86,0.7)" }}>
                    your photo goes here
                  </p>
                  <p className="font-cormorant text-xs" style={{ color: "rgba(176,144,144,0.6)" }}>
                    set photoSrc=&quot;/photos/us.jpg&quot;
                  </p>
                </div>
              )}

              {/* 📍 subtext overlay */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-3"
                style={{ background: "linear-gradient(transparent, rgba(30,10,8,0.55))" }}>
                <span style={{ fontSize: "0.85rem" }}>📍</span>
                <span className="font-cormorant text-sm italic" style={{ color: "rgba(253,240,232,0.88)" }}>
                  Where it started. Click every circle for a memory.
                </span>
              </div>
            </div>

            {/* Memory point pins */}
            {MEMORY_POINTS.map((point, i) => {
              const isVisible = i < visibleCount;
              const isOpen = openPoint === point.id;
              const isDone = interacted.has(point.id);

              return isVisible ? (
                <div
                  key={point.id}
                  className="anim-point absolute"
                  style={{ top: point.position.top, left: point.position.left, zIndex: 20 }}
                >
                  <button
                    onClick={() => handlePoint(point.id)}
                    className="relative flex flex-col items-center gap-1"
                  >
                    {/* Ping ring */}
                    {!isDone && (
                      <div className="anim-ping absolute h-8 w-8 rounded-full"
                        style={{ background: "rgba(196,103,95,0.3)", top: "50%", left: "50%",
                          transform: "translate(-50%, -50%)" }} />
                    )}
                    {/* Pin */}
                    <div
                      className="relative flex h-9 w-9 items-center justify-center rounded-full text-base transition-all duration-200 hover:scale-110"
                      style={{
                        background: isDone
                          ? "linear-gradient(135deg, #d4817a, #c4675f)"
                          : "rgba(253,246,238,0.92)",
                        border: `2px solid ${isDone ? "transparent" : "rgba(196,103,95,0.4)"}`,
                        boxShadow: "0 4px 16px rgba(196,103,95,0.2)",
                      }}
                    >
                      {point.emoji}
                    </div>
                    <span className="font-cormorant whitespace-nowrap rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wider"
                      style={{
                        background: "rgba(253,246,238,0.85)",
                        color: "#7a5a56",
                        border: "1px solid rgba(201,169,110,0.2)",
                        backdropFilter: "blur(8px)",
                      }}>
                      {point.label}
                    </span>
                  </button>
                </div>
              ) : null;
            })}
          </div>

          {/* Expanded story cards */}
          {MEMORY_POINTS.map((point) => {
            const isOpen = openPoint === point.id;
            return (
              <div
                key={`story-${point.id}`}
                className={`story-wrap w-full ${isOpen ? "open" : ""}`}
              >
                <div className="story-inner">
                  <div
                    className="rounded-[20px] px-7 py-6"
                    style={{
                      background: "rgba(253,246,238,0.8)",
                      border: "1px solid rgba(201,169,110,0.2)",
                      boxShadow: "0 8px 32px rgba(196,103,95,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span>{point.emoji}</span>
                      <span className="font-cormorant text-sm font-semibold tracking-wide"
                        style={{ color: "#c4675f" }}>
                        {point.label}
                      </span>
                    </div>
                    <p className="font-cormorant text-[1.05rem] font-light leading-relaxed"
                      style={{ color: "#4a3430" }}>
                      {point.story}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Hint */}
          {pointsVisible && visibleCount >= MEMORY_POINTS.length && !allInteracted && !buttonVisible && (
            <p className="font-cormorant text-center text-sm italic"
              style={{ color: "rgba(176,144,144,0.7)" }}>
              tap each memory to open it ✦
            </p>
          )}

          {/* Continue button */}
          {buttonVisible && (
            <button
              onClick={handleNext}
              className="mm-btn anim-btn font-cormorant relative overflow-hidden rounded-full px-10 py-4 text-[1.08rem] italic tracking-[0.05em] text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #d4817a 0%, #c4675f 55%, #b35b54 100%)",
                boxShadow: "0 4px 20px rgba(196,103,95,0.32), 0 1px 4px rgba(196,103,95,0.2)",
              }}
            >
              ❤️ Keep Going
            </button>
          )}
        </div>
      </div>
    </>
  );
}