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
    <div className="w-full flex flex-col bg-black min-h-screen lg:min-h-auto flex-1">
      {isEmbedded ? (
        <div className="flex-1 flex flex-col p-2 sm:p-3 lg:p-4 gap-2 sm:gap-3 lg:gap-4 min-h-0">
          {/* Video */}
          <div className="flex-1 rounded-lg lg:rounded-xl overflow-hidden shadow-lg lg:shadow-2xl border border-zinc-700/50 bg-black min-h-0 aspect-video">
            <iframe
              src={contentInfo?.embedUrl}
              className="w-full h-full min-h-[200px] max-h-[60vh]"
              title={player?.youtube?.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Info Panel */}
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-2 sm:p-3 lg:p-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
              {player?.youtube?.thumbnail && (
                <img
                  src={player.youtube.thumbnail}
                  alt={player.youtube.title}
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-md object-cover border border-zinc-700 flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-xs sm:text-sm lg:text-base font-semibold text-zinc-100 truncate">
                  {player?.youtube?.title || "Untitled Video"}
                </h2>

                <div className="text-[10px] sm:text-xs text-zinc-400 mt-1 flex flex-wrap gap-1 sm:gap-2">
                  {player?.youtube?.channel && (
                    <span className="truncate">by {player.youtube.channel}</span>
                  )}
                  {published && <span className="hidden sm:inline">• {published}</span>}
                  {player?.youtube?.duration && (
                    <span className="hidden sm:inline">• {player.youtube.duration}</span>
                  )}
                </div>

                <div className="text-[10px] sm:text-xs text-zinc-400 mt-2 flex flex-wrap items-center gap-2">{player?.youtube?.views && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                      </svg>
                      {numberFmt.format(Number(player.youtube.views))}
                    </span>
                  )}

                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs border transition ${
                      liked
                        ? "bg-white text-black border-white"
                        : "border-zinc-600 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.59 5.01 13.26 4 15 4 17.5 4 19.5 6 19.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z" />
                    </svg>
                    {numberFmt.format(likeCount)}
                  </button>
                </div>
              </div>
            </div>

            {player?.youtube?.description && (
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-300 line-clamp-3 sm:line-clamp-4">
                {removeLinks(player.youtube.description)}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= NATIVE VIDEO PLAYER ================= */
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-zinc-700/50 my-2 sm:my-4 mx-auto max-w-5xl min-h-[200px] max-h-[60vh]">
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
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/50 transition-colors"
              onClick={togglePlay}
            >
              <div className="bg-purple-600 hover:bg-purple-700 rounded-full p-3 sm:p-5 transition-all hover:scale-110">
                <svg
                  className="w-8 h-8 sm:w-12 sm:h-12 text-white"
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
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2 sm:p-3 lg:p-4 transition-opacity duration-200 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Progress */}
            <div
              ref={progressBarRef}
              className="w-full h-1 sm:h-1.5 bg-zinc-700/50 rounded-full cursor-pointer mb-2 sm:mb-3 hover:h-2 sm:hover:h-2.5 transition-all"
              onClick={handleProgressClick}
              onMouseMove={handleProgressDrag}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div
                className="h-full bg-purple-600 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-lg" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between text-white text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1 sm:p-1.5 hover:bg-white/10 rounded transition"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
                <button
                  onClick={() => skip(-5)}
                  className="hidden sm:block p-1 sm:p-1.5 hover:bg-white/10 rounded transition text-xs"
                  title="Rewind 5s"
                >
                  ⏮ 5s
                </button>
                <button
                  onClick={() => skip(5)}
                  className="hidden sm:block p-1 sm:p-1.5 hover:bg-white/10 rounded transition text-xs"
                  title="Forward 5s"
                >
                  5s ⏭
                </button>
                <span className="font-mono text-xs sm:text-sm whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                <button
                  onClick={toggleMute}
                  className="p-1 sm:p-1.5 hover:bg-white/10 rounded transition"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-1 sm:p-1.5 hover:bg-white/10 rounded transition"
                  title="Fullscreen"
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
