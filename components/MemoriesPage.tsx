"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Screenshot {
    src: string; // image path, e.g. "/screenshots/1.jpg"
    caption: string; // short emotional caption
}

interface MemoriesPageProps {
    screenshots?: Screenshot[];
    onNext?: () => void;
}

// ─── Default placeholder screenshots (replace with real ones) ─────────────────
const DEFAULT_SCREENSHOTS: Screenshot[] = [
    {
        src: "",
        caption: "the first time you made me laugh out loud at my phone.",
    },
    { src: "", caption: "i read this one three times before replying." },
    { src: "", caption: "this was the moment i knew you were different." },
    { src: "", caption: "2am and we still couldn't say goodnight." },
    { src: "", caption: "you always knew exactly what to say." },
];

const PETALS = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${(i * 9.8) % 100}%`,
    width: `${12 + (i % 3) * 5}px`,
    height: `${16 + (i % 4) * 6}px`,
    bg: i % 2 === 0 ? "rgba(232,164,160,0.18)" : "rgba(242,207,200,0.15)",
    duration: `${15 + i * 2.3}s`,
    delay: `${-(i * 1.9)}s`,
}));

// ─── Component ────────────────────────────────────────────────────────────────
export default function MemoriesPage({
    screenshots = DEFAULT_SCREENSHOTS,
    onNext,
}: MemoriesPageProps) {
    // Stages: "dimming" | "intro" | "slideshow" | "epilogue"
    const [stage, setStage] = useState<
        "dimming" | "intro" | "slideshow" | "epilogue"
    >("dimming");
    const [currentIndex, setCurrentIndex] = useState<number>(-1); // -1 = none shown yet
    const [imgState, setImgState] = useState<
        "entering" | "visible" | "exiting"
    >("entering");
    const [captionVisible, setCaptionVisible] = useState<boolean>(false);
    const [epilogueVisible, setEpilogueVisible] = useState<boolean>(false);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [dimLevel, setDimLevel] = useState<number>(0);

    // ── Step 1: dim in (0.8s) ──
    useEffect(() => {
        const t1 = setTimeout(() => setDimLevel(1), 80);
        const t2 = setTimeout(() => setStage("intro"), 1000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    const showCard = (index: number) => {
        setCurrentIndex(index);
        setImgState("entering");
        setCaptionVisible(false);

        // Caption appears 0.6s after image starts
        setTimeout(() => setCaptionVisible(true), 600);

        // After 1s pause on the image → next or epilogue
        setTimeout(() => {
            if (index < screenshots.length - 1) {
                setImgState("exiting");
                setTimeout(() => showCard(index + 1), 450);
            } else {
                // Last screenshot — wait 2s then epilogue
                setTimeout(() => {
                    setImgState("exiting");
                    setCaptionVisible(false);
                    setTimeout(() => {
                        setCurrentIndex(-1);
                        setStage("epilogue");
                        setTimeout(() => setEpilogueVisible(true), 200);
                    }, 450);
                }, 2000);
            }
        }, 3800); // 0.8s fade + 1s pause + buffer
    };

    // ── Step 2: show intro text, then start slideshow ──
    useEffect(() => {
        if (stage !== "intro") return;
        const t = setTimeout(() => {
            setStage("slideshow");
            setTimeout(() => showCard(0), 200);
        }, 2200);
        return () => clearTimeout(t);
    }, [stage]);

    // ── Show a card ──

    const handleNext = () => {
        setFadeOut(true);
        setTimeout(() => onNext?.(), 900);
    };

    const current = screenshots[currentIndex];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lato:wght@300;400&display=swap');

        .font-cormorant { font-family: 'Cormorant Garamond', serif; }

        /* ── Petals ── */
        @keyframes floatPetal {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0;    }
          8%   {                                              opacity: 1;    }
          92%  {                                              opacity: 1;    }
          100% { transform: translateY(-8vh)  rotate(390deg); opacity: 0;    }
        }
        .animate-petal { animation: floatPetal linear infinite; }

        /* ── Dim overlay ── */
        .dim-overlay {
          transition: opacity 0.85s ease;
        }

        /* ── Grain ── */
        .mp-grain::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        /* ── Intro text ── */
        @keyframes introIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .animate-intro { animation: introIn 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes introOut {
          from { opacity: 1; transform: translateY(0);     }
          to   { opacity: 0; transform: translateY(-12px); }
        }
        .animate-intro-out { animation: introOut 0.5s ease forwards; }

        /* ── Image enter ── */
        @keyframes imgEnter {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes imgExit {
          from { opacity: 1; transform: translateY(0)     scale(1);    }
          to   { opacity: 0; transform: translateY(-16px) scale(0.98); }
        }
        .img-enter { animation: imgEnter 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
        .img-exit  { animation: imgExit  0.4s ease forwards; }

        /* ── Caption ── */
        @keyframes captionIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .animate-caption { animation: captionIn 0.55s ease forwards; }

        /* ── Epilogue ── */
        @keyframes epilogueIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .animate-epilogue { animation: epilogueIn 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* ── Progress bar ── */
        .progress-bar {
          transition: width 3.8s linear;
        }

        /* ── Button shimmer ── */
        .mp-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .mp-btn:hover::before { left: 100%; }

        /* ── Screenshot frame glow ── */
        @keyframes frameGlow {
          0%,100% { box-shadow: 0 16px 56px rgba(196,103,95,0.16), 0 4px 16px rgba(196,103,95,0.1), inset 0 1px 0 rgba(255,255,255,0.7); }
          50%     { box-shadow: 0 20px 64px rgba(196,103,95,0.24), 0 4px 20px rgba(196,103,95,0.14), inset 0 1px 0 rgba(255,255,255,0.8); }
        }
        .frame-glow { animation: frameGlow 3s ease-in-out infinite; }

        /* ── Placeholder (when no real src) ── */
        .img-placeholder {
          background: linear-gradient(135deg, rgba(242,207,200,0.6) 0%, rgba(232,164,160,0.4) 100%);
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>

            {/* Petals */}
            {PETALS.map(({ id, left, width, height, bg, duration, delay }) => (
                <div
                    key={id}
                    className="animate-petal fixed pointer-events-none"
                    style={{
                        left,
                        width,
                        height,
                        background: bg,
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
          mp-grain relative flex min-h-screen w-full flex-col items-center justify-center
          overflow-hidden transition-opacity duration-[900ms] ease-in-out
          ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
                style={{
                    background:
                        "radial-gradient(ellipse at 30% 20%, #f9ede6 0%, #f4ddd6 30%, #eddbd8 60%, #e8cfc8 100%)",
                }}
            >
                {/* ── Dim overlay ── */}
                <div
                    className="dim-overlay pointer-events-none fixed inset-0 z-20"
                    style={{
                        background: "rgba(30, 12, 10, 1)",
                        opacity:
                            dimLevel === 0 ? 0
                            : dimLevel === 1 ? 0.72
                            : 0,
                    }}
                />

                {/* ── All content sits above dim ── */}
                <div className="relative z-30 flex w-full flex-col items-center justify-center px-5">
                    {/* ── INTRO TEXT ── */}
                    {(stage === "intro" ||
                        (stage === "slideshow" && currentIndex === -1)) && (
                        <div
                            className={`text-center ${stage === "slideshow" ? "animate-intro-out" : "animate-intro"}`}
                        >
                            <p
                                className="font-cormorant text-xs uppercase tracking-[0.22em] mb-4"
                                style={{ color: "rgba(253,240,232,0.5)" }}
                            >
                                a little trip back in time
                            </p>
                            <p
                                className="font-cormorant text-[1.9rem] font-light leading-snug"
                                style={{ color: "rgba(253,240,232,0.92)" }}
                            >
                                These are my
                                <br />
                                <span
                                    className="italic"
                                    style={{ color: "#e8a4a0" }}
                                >
                                    favourite memories.
                                </span>
                            </p>
                            <div
                                className="mx-auto mt-6 h-px w-16"
                                style={{
                                    background:
                                        "linear-gradient(90deg, transparent, rgba(232,164,160,0.5), transparent)",
                                }}
                            />
                        </div>
                    )}

                    {/* ── SLIDESHOW ── */}
                    {stage === "slideshow" && currentIndex >= 0 && current && (
                        <div className="flex w-full max-w-sm flex-col items-center gap-6">
                            {/* Progress dots */}
                            <div className="flex items-center gap-2">
                                {screenshots.map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-full transition-all duration-500"
                                        style={{
                                            width:
                                                i === currentIndex ? "20px" : (
                                                    "7px"
                                                ),
                                            height: "7px",
                                            background:
                                                i === currentIndex ? "#e8a4a0"
                                                : i < currentIndex ?
                                                    "rgba(232,164,160,0.45)"
                                                :   "rgba(232,164,160,0.15)",
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Screenshot frame */}
                            <div
                                className={`frame-glow relative w-full overflow-hidden rounded-[22px] ${
                                    imgState === "entering" ? "img-enter" : (
                                        "img-exit"
                                    )
                                }`}
                                style={{
                                    background: "rgba(253,246,238,0.88)",
                                    border: "1px solid rgba(201,169,110,0.2)",
                                    minHeight: "380px",
                                }}
                            >
                                {/* Phone notch decoration */}
                                <div
                                    className="flex items-center justify-between px-5 pt-4 pb-2"
                                    style={{
                                        borderBottom:
                                            "1px solid rgba(196,103,95,0.08)",
                                    }}
                                >
                                    <span
                                        className="font-cormorant text-[0.65rem] uppercase tracking-widest"
                                        style={{
                                            color: "rgba(176,144,144,0.7)",
                                        }}
                                    >
                                        WhatsApp
                                    </span>
                                    <div className="flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-1 w-1 rounded-full"
                                                style={{
                                                    background:
                                                        "rgba(196,103,95,0.25)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Image or placeholder */}
                                {current.src ?
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <Image
                                        src={current.src}
                                        alt={current.caption}
                                        className="h-full w-full object-cover"
                                        style={{ minHeight: "320px" }}
                                        preload
                                    />
                                :   <div
                                        className="img-placeholder"
                                        style={{
                                            minHeight: "320px",
                                            padding: "32px",
                                        }}
                                    >
                                        <div className="text-center">
                                            <div className="mb-3 text-[2.5rem]">
                                                💬
                                            </div>
                                            <p
                                                className="font-cormorant text-sm italic"
                                                style={{
                                                    color: "rgba(122,90,86,0.6)",
                                                }}
                                            >
                                                your screenshot goes here
                                            </p>
                                            <p
                                                className="font-cormorant mt-1 text-xs"
                                                style={{
                                                    color: "rgba(176,144,144,0.6)",
                                                }}
                                            >
                                                {current.src ||
                                                    `screenshots[${currentIndex}].src`}
                                            </p>
                                        </div>
                                    </div>
                                }
                            </div>

                            {/* Caption */}
                            {captionVisible && (
                                <p
                                    key={`caption-${currentIndex}`}
                                    className="animate-caption font-cormorant max-w-xs text-center text-[1.08rem] italic leading-relaxed"
                                    style={{ color: "rgba(253,240,232,0.82)" }}
                                >
                                    &apos;{current.caption}&apos;
                                </p>
                            )}

                            {/* Progress bar */}
                            <div
                                className="w-full overflow-hidden rounded-full"
                                style={{
                                    height: "2px",
                                    background: "rgba(232,164,160,0.15)",
                                }}
                            >
                                <div
                                    className="progress-bar h-full rounded-full"
                                    style={{
                                        width:
                                            imgState === "entering" ? "100%" : (
                                                "0%"
                                            ),
                                        background:
                                            "linear-gradient(90deg, #e8a4a0, #c4675f)",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── EPILOGUE ── */}
                    {stage === "epilogue" && epilogueVisible && (
                        <div className="animate-epilogue flex w-full max-w-xs flex-col items-center gap-8 text-center">
                            <div>
                                <p
                                    className="font-cormorant text-xs uppercase tracking-[0.2em] mb-5"
                                    style={{ color: "rgba(232,164,160,0.55)" }}
                                >
                                    and then —
                                </p>
                                <p
                                    className="font-cormorant text-[1.75rem] font-light leading-snug"
                                    style={{ color: "rgba(253,240,232,0.9)" }}
                                >
                                    From random messages…
                                </p>
                                <p
                                    className="font-cormorant mt-2 text-[1.75rem] italic leading-snug"
                                    style={{ color: "#e8a4a0" }}
                                >
                                    to something real.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    className="h-px w-10"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, transparent, rgba(232,164,160,0.4))",
                                    }}
                                />
                                <span
                                    style={{
                                        color: "rgba(232,164,160,0.5)",
                                        fontSize: "0.55rem",
                                        letterSpacing: "5px",
                                    }}
                                >
                                    ✦ ✦ ✦
                                </span>
                                <div
                                    className="h-px w-10"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, rgba(232,164,160,0.4), transparent)",
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleNext}
                                className="mp-btn font-cormorant relative overflow-hidden rounded-full px-9 py-3.5 text-[1.05rem] italic tracking-[0.05em] text-[#fdf6ee] transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #d4817a 0%, #c4675f 55%, #b35b54 100%)",
                                    boxShadow:
                                        "0 4px 20px rgba(196,103,95,0.35), 0 1px 4px rgba(196,103,95,0.2)",
                                }}
                            >
                                keep going →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
