import React, { useRef, useState, useEffect } from "react";
import { useData } from "../ui/DataWrapper";

const Player = () => {
  const { player, setPlayer } = useData();
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Extract URLs from text
  const extractLinks = (text = "") => text.match(/https?:\/\/[^\s]+/g) || [];

  // Remove URLs from description text
  const removeLinks = (text = "") =>
    text.replace(/https?:\/\/[^\s]+/g, "").trim();

  // Extract hashtags or common keywords
  const extractTags = (text = "") => text.match(/#\w+/g) || [];

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Handle progress bar click
  const handleProgressClick = (e) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;

    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  // Handle progress bar drag
  const handleProgressDrag = (e) => {
    if (!isDragging) return;
    handleProgressClick(e);
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.volume = newMuted ? 0 : volume;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Skip forward/backward
  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          skip(-5);
          break;
        case "ArrowRight":
          skip(5);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isMuted]);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  const progress = (currentTime / duration) * 100 || 0;

  // Detect content type and convert URL to embed format if needed
  function getContentType(url) {
    if (!url) return null;

    // YouTube detection - handle various YouTube URL formats
    if (/(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/.test(url)) {
      const embedUrl = youtubeToEmbed(url);
      if (embedUrl) {
        return { type: "youtube", embedUrl };
      }
    }

    // If URL is just a video ID (11 characters, alphanumeric with - and _)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${url}`,
      };
    }

    // Vimeo detection
    if (/vimeo\.com/.test(url)) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) {
        return {
          type: "vimeo",
          embedUrl: `https://player.vimeo.com/video/${match[1]}`,
        };
      }
    }

    // Video file detection (MP4, WebM, etc.)
    if (/\.(mp4|webm|ogg|mov|avi)$/i.test(url)) {
      return { type: "video", embedUrl: url };
    }

    // Default to video if direct URL
    if (/^https?:\/\//.test(url)) {
      return { type: "video", embedUrl: url };
    }

    return null;
  }

  function youtubeToEmbed(url) {
    if (!url) return null;

    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  const contentInfo = getContentType(player?.url);
  const isEmbedded =
    contentInfo?.type === "youtube" || contentInfo?.type === "vimeo";

  console.log(player);

  const numberFmt = new Intl.NumberFormat("en", { notation: "compact" });
  const [likeCount, setLikeCount] = useState(
    player?.youtube?.likes ? Number(player?.youtube?.likes) : 0
  );
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLikeCount(player?.youtube?.likes ? Number(player?.youtube?.likes) : 0);
  }, [player?.youtube?.likes]);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
  };

  const published = player?.youtube?.publishedAt
    ? new Date(player?.youtube?.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="w-full flex flex-col bg-black">
      {isEmbedded ? (
        /* ================= EMBEDDED PLAYER ================= */
        <div className="flex-1 flex flex-col mt-2 lg:p-2 sm:p-4 gap-3 sm:gap-4 min-h-0">
          {/* Video */}
          <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-zinc-700 bg-black min-h-0">
            <div className="w-full aspect-video max-h-[70vh] sm:max-h-[80vh]">
              <iframe
                src={contentInfo?.embedUrl}
                className="w-full h-full"
                title={player?.youtube?.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-3 sm:p-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              {player?.youtube?.thumbnail && (
                <img
                  src={player.youtube.thumbnail}
                  alt={player.youtube.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover border border-zinc-700"
                />
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
                  {player?.youtube?.title || "Untitled Video"}
                </h2>

                <div className="text-[10px] sm:text-xs text-zinc-400 mt-1 flex flex-wrap gap-1 sm:gap-2">
                  {player?.youtube?.channel && (
                    <span>by {player.youtube.channel}</span>
                  )}
                  {published && <span>• {published}</span>}
                  {player?.youtube?.duration && (
                    <span>• {player.youtube.duration}</span>
                  )}
                </div>

                <div className="text-[10px] sm:text-xs text-zinc-400 mt-2 flex flex-wrap items-center gap-2 sm:gap-4">
                  {player?.youtube?.views && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                      </svg>
                      {numberFmt.format(Number(player.youtube.views))} views
                    </span>
                  )}

                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md border transition ${
                      liked
                        ? "bg-white text-black border-white"
                        : "border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.59 5.01 13.26 4 15 4 17.5 4 19.5 6 19.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z" />
                    </svg>
                    {numberFmt.format(likeCount)} Likes
                  </button>
                </div>
              </div>
            </div>

            {player?.youtube?.description && (
              <div className="hidden sm:block mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
                {/* Description */}
                <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4">
                  {removeLinks(player.youtube.description)}
                </p>

                {/* Links */}
                {extractLinks(player.youtube.description).length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs border-2 p-1 rounded border-white/10 text-zinc-400 mb-1">
                      Links mentioned
                    </p>
                    <ul className="space-y-1">
                      {extractLinks(player.youtube.description).map(
                        (link, i) => (
                          <li key={i}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-400 hover:underline break-all"
                            >
                              {link}
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Tags / Common names */}
                {extractTags(player.youtube.description).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {extractTags(player.youtube.description).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded bg-white/10 text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= NATIVE VIDEO PLAYER ================= */
        <div className="relative mx-auto my-4 w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={
              player?.url ||
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            }
            onClick={togglePlay}
          />

          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={togglePlay}
            >
              <div className="bg-black hover:bg-purple-700 rounded-full p-4 sm:p-6 transition-all hover:scale-110">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 sm:p-4 transition-opacity ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress */}
            <div
              ref={progressBarRef}
              className="w-full h-2 sm:h-2.5 bg-zinc-700 rounded-full cursor-pointer mb-3"
              onClick={handleProgressClick}
              onMouseMove={handleProgressDrag}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div
                className="h-full bg-purple-700 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between text-white text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={togglePlay}>{isPlaying ? "❚❚" : "▶"}</button>
                <button onClick={() => skip(-10)} className="hidden sm:block">
                  -10s
                </button>
                <button onClick={() => skip(10)} className="hidden sm:block">
                  +10s
                </button>
                <span className="font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>
                <button onClick={toggleFullscreen}>⛶</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
