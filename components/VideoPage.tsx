"use client";

import { useState, useEffect, useRef } from "react";

interface VideoPageProps {
  videoSrc?: string; 
  onNext?: () => void;
}

// Extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLElement | string, options: Record<string, unknown>) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  destroy?: () => void;
}

export default function VideoPage({
  videoSrc = "https://youtu.be/Xb67rlBsPB4",
  onNext,
}: VideoPageProps) {
  const [stage, setStage] = useState<"black" | "text" | "button" | "playing" | "done">("black");
  const [fadeOut, setFadeOut] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const videoId = getYouTubeId(videoSrc);

  // Intro animation sequence
  useEffect(() => {
    const t1 = setTimeout(() => setStage("text"), 1000);
    const t2 = setTimeout(() => setStage("button"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (stage !== "playing") return;

    const initPlayer = () => {
      if (!videoId || !iframeContainerRef.current) return;
      playerRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (event: { data: number }) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              setShowNext(true);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Inject the API script if not already present
      if (!document.getElementById("yt-api-script")) {
        const script = document.createElement("script");
        script.id = "yt-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [stage, videoId]);

  const handlePlay = () => {
    setStage("playing");
  };

  const handleNext = () => {
    setFadeOut(true);
    setTimeout(() => onNext?.(), 1200);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-in { animation: fadeIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes playPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(232,164,160,0.5); }
          50%     { box-shadow: 0 0 0 18px rgba(232,164,160,0); }
        }
        .play-pulse { animation: playPulse 2s ease-in-out infinite; }

        @keyframes videoIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .video-in { animation: videoIn 0.7s ease forwards; }

        @keyframes nextIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .next-in { animation: nextIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }

        .vp-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s;
        }
        .vp-btn:hover::before { left: 100%; }

        .next-btn {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 9999px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          letter-spacing: 0.15em;
          color: rgba(253,246,238,0.9);
          background: linear-gradient(135deg, rgba(212,129,122,0.25), rgba(196,103,95,0.15));
          border: 1px solid rgba(232,164,160,0.3);
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
        }
        .next-btn:hover {
          transform: scale(1.05);
          border-color: rgba(232,164,160,0.6);
        }
        .next-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }
        .next-btn:hover::before { left: 100%; }

        /* YouTube iframe wrapper — 16:9 */
        .yt-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(201,169,110,0.2);
          box-shadow: 0 16px 56px rgba(196,103,95,0.2);
        }
        .yt-wrapper iframe,
        .yt-wrapper > div {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
      `}</style>

      <div
        className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden transition-opacity duration-[1200ms] ease-in-out ${
          fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ background: "#0a0605" }}
      >
        {/* Subtle warm glow */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(196,103,95,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center w-full max-w-3xl">

          {/* Intro text */}
          {(stage === "text" || stage === "button") && (
            <div className="anim-in flex flex-col gap-3">
              <p
                className="font-cormorant text-xs uppercase tracking-[0.22em]"
                style={{ color: "rgba(232,164,160,0.45)" }}
              >
                before you go further
              </p>
              <p
                className="font-cormorant text-[1.85rem] font-light leading-snug"
                style={{ color: "rgba(253,240,232,0.88)" }}
              >
                There&apos;s something
                <br />
                <span className="italic" style={{ color: "#e8a4a0" }}>
                  I wanted to tell you…{" "}
                  <br /> Please wear headphones.
                </span>
              </p>
            </div>
          )}

          {/* Play button */}
          {stage === "button" && (
            <div
              className="anim-in flex flex-col items-center"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            >
              <button
                onClick={handlePlay}
                className="play-pulse relative flex h-20 w-20 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, #d4817a, #c4675f)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {/* Play triangle */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "14px solid transparent",
                    borderBottom: "14px solid transparent",
                    borderLeft: "22px solid rgba(253,246,238,0.92)",
                    marginLeft: "5px",
                  }}
                />
              </button>
              <p
                className="font-cormorant mt-4 text-sm italic"
                style={{ color: "rgba(232,164,160,0.5)" }}
              >
                tap to play
              </p>
            </div>
          )}

          {/* YouTube embed — stays visible through done stage */}
          {stage === "playing" && (
            <div className="video-in w-full">
              <div className="yt-wrapper">
                <div ref={iframeContainerRef} />
              </div>
            </div>
          )}

          {/* Next button — appears once video starts */}
          {showNext && (
            <div className="next-in">
              <button onClick={handleNext} className="next-btn">
                <span>Continue</span>
                {/* Arrow */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ opacity: 0.7 }}
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="rgba(253,246,238,0.9)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}