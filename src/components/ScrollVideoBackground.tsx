import { useEffect, useRef } from "react";

/**
 * Background scroll-scrubbed video.
 * As the user scrolls the page, the video scrubs through its timeline.
 * Put an AI/data themed MP4 at public/video/csv-analyst-loop.mp4.
 */
export function ScrollVideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      video.pause();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    const handleScroll = () => {
      const duration = durationRef.current;
      if (!duration) return;

      const scrollTop = window.scrollY || window.pageYOffset;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const scrollProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      const targetTime = scrollProgress * duration;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = window.requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = targetTime;
          videoRef.current.pause();
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden opacity-40 mix-blend-screen"
    >
      <video
        ref={videoRef}
        src="/video/csv-analyst-loop.mp4"
        preload="auto"
        muted
        playsInline
        controls={false}
        className="h-full w-full object-cover"
      />
      {/* Soft overlay to keep contrast good */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/30 to-[#020617]/80" />
    </div>
  );
}
