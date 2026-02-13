"use client";

import { useState } from "react";
import LockScreen from "@/components/LockScreen";
import LetterPage from "@/components/LetterPage";
import ReasonsPage from "@/components/ReasonsPage";
import MemoriesPage from "@/components/MemoriesPage";
import VideoPage from "@/components/VideoPage";
import MemoryMap from "@/components/MemoryMap";
import BeWithMePage from "@/components/BewithmePage";
import QuietEndingPage from "@/components/Quietendingpage";

type Page =
    | "lock"
    | "letter"
    | "reasons"
    | "memories"
    | "video"
    | "map"
    | "bewithme"
    | "ending";

// ── 1. Your anniversary date ────────────────────────────────────────────────
const ANNIVERSARY = "11/21";

// ── 2. WhatsApp screenshots ─────────────────────────────────────────────────
//   Place images in /public/screenshots/ and fill in captions.
const MY_SCREENSHOTS = [
    {
        src: "/screenshots/1.png",
        caption: "the day we started our story.",
    },
    {
        src: "/screenshots/2.png",
        caption: "just for fun.... ummaaaaa......",
    },
    {
        src: "/screenshots/3.png",
        caption: "uuuuu said \"babaaaaaa\"",
    },
    {
        src: "/screenshots/4.png",
        caption: "adareiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",
    },
    {
        src: "/screenshots/5.png",
        caption: "love youuuuuuuuuuuuuuuuuuuuuuu",
    },
    {
        src: "/screenshots/6.png",
        caption: "yea we surely gonna marry.",
    },
];

// ── 3. Your one photo for the memory map ────────────────────────────────────
//   Place the photo in /public/photos/
const MY_PHOTO = "/photos/us.jpeg";

export default function Home() {
    const [page, setPage] = useState<Page>("lock");
    const go = (p: Page) => setPage(p);

    return (
        <>
            {page === "lock" && (
                <LockScreen
                    correctDate={ANNIVERSARY}
                    onUnlock={() => go("letter")}
                />
            )}
            {page === "letter" && <LetterPage onNext={() => go("reasons")} />}
            {page === "reasons" && (
                <ReasonsPage onNext={() => go("memories")} />
            )}
            {page === "memories" && (
                <MemoriesPage
                    screenshots={MY_SCREENSHOTS}
                    onNext={() => go("video")}
                />
            )}
            {page === "video" && (
                <VideoPage videoSrc={"https://youtu.be/Xb67rlBsPB4"} onNext={() => go("map")} />
            )}
            {page === "map" && (
                <MemoryMap photoSrc={MY_PHOTO} onNext={() => go("bewithme")} />
            )}
            {page === "bewithme" && (
                <BeWithMePage onNext={() => go("ending")} />
            )}
            {page === "ending" && <QuietEndingPage />}
        </>
    );
}
