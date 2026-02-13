"use client";

import { useState, useEffect } from "react";

interface BeWithMePageProps {
  onNext?: () => void;
}

interface Paragraph {
  text: string;
  pauseAfter: number; // ms to wait before showing next
}

const PARAGRAPHS: Paragraph[] = [
  {
    text: "I don't know how fast I'll succeed. I don't know how many times I'll fall. But I know I want you beside me.",
    pauseAfter: 1000,
  },
  {
    text: "Stay with me while I build. Stay with me while I learn. Stay with me even if I fail before I succeed.",
    pauseAfter: 1500,
  },
  {
    text: "Be with me until we grow. Be with me until we're stronger. Be with me until the day I can finally call you my wife.",
    pauseAfter: 2000,
  },
  {
    text: "I'm not asking for perfection. I'm asking for partnership.",
    pauseAfter: 0,
  },
];

export default function BeWithMePage({ onNext }: BeWithMePageProps) {
  const [visibleParagraphs, setVisibleParagraphs] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    let cumulativeDelay = 800; // initial pause before first para

    PARAGRAPHS.forEach((para, i) => {
      setTimeout(() => {
        setVisibleParagraphs(i + 1);
      }, cumulativeDelay);
      cumulativeDelay += 1000 + para.pauseAfter; // 1s fade-in + pause
    });

    // Button appears 1.5s after last paragraph
    setTimeout(() => setShowButton(true), cumulativeDelay + 500);
  }, []);

  const handleNext = () => {
    setFadeOut(true);
    setTimeout(() => onNext?.(), 1200);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lato:wght@300;400&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }

        .bwm-grain::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        @keyframes paraIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-para { animation: paraIn 1s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes btnIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-btn { animation: btnIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .bwm-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .bwm-btn:hover::before { left: 100%; }

        @keyframes floatPetal {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0;    }
          8%   {                                              opacity: 0.12; }
          92%  {                                              opacity: 0.12; }
          100% { transform: translateY(-8vh)  rotate(390deg); opacity: 0;    }
        }
        .animate-petal { animation: floatPetal linear infinite; }
      `}</style>

      {/* Very sparse petals — calmer feel */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-petal fixed pointer-events-none"
          style={{
            left: `${[15, 35, 62, 82][i]}%`,
            width: "10px", height: "14px",
            background: i % 2 === 0 ? "#e8a4a0" : "#f2cfc8",
            borderRadius: "50% 0 50% 0",
            animationDuration: `${18 + i * 3}s`,
            animationDelay: `${-(i * 4.5)}s`,
            zIndex: 1,
          }} />
      ))}

      <div
        className={`bwm-grain relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden transition-opacity duration-[1200ms] ease-in-out ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ background: "radial-gradient(ellipse at 50% 40%, #f7ece5 0%, #f2ddd6 40%, #ecdad5 100%)" }}
      >
        {/* Soft centre glow */}
        <div className="pointer-events-none fixed inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(232,164,160,0.18) 0%, transparent 60%)" }} />

        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-9 px-7 py-16 text-center">

          {/* Decorative top */}
          <div className="flex items-center gap-3">
            <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.4))" }} />
            <span style={{ color: "rgba(201,169,110,0.6)", fontSize: "0.55rem", letterSpacing: "5px" }}>✦ ✦ ✦</span>
            <div className="h-px w-10" style={{ background: "linear-gradient(90deg, rgba(201,169,110,0.4), transparent)" }} />
          </div>

          {/* Paragraphs */}
          <div className="flex flex-col gap-8">
            {PARAGRAPHS.map((para, i) => (
              visibleParagraphs > i && (
                <p
                  key={i}
                  className={`anim-para font-cormorant leading-relaxed ${
                    i === PARAGRAPHS.length - 1
                      ? "text-[1.22rem] font-semibold italic"
                      : "text-[1.12rem] font-light"
                  }`}
                  style={{
                    color: i === PARAGRAPHS.length - 1 ? "#c4675f" : "#4a3430",
                  }}
                >
                  {para.text}
                </p>
              )
            ))}
          </div>

          {/* Decorative bottom + button */}
          {showButton && (
            <div className="anim-btn flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.4))" }} />
                <span style={{ color: "rgba(196,103,95,0.5)", fontSize: "1rem" }}>♥</span>
                <div className="h-px w-10" style={{ background: "linear-gradient(90deg, rgba(201,169,110,0.4), transparent)" }} />
              </div>

              <button
                onClick={handleNext}
                className="bwm-btn font-cormorant relative overflow-hidden rounded-full px-10 py-4 text-[1.08rem] italic tracking-[0.05em] text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #d4817a 0%, #c4675f 55%, #b35b54 100%)",
                  boxShadow: "0 4px 20px rgba(196,103,95,0.32), 0 1px 4px rgba(196,103,95,0.2)",
                }}
              >
                one last thing →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}