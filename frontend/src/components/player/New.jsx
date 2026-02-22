import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useData } from "../ui/DataWrapper";
import { useAuth } from "../Auth/AuthlayoutWrapper";
import { isValidYouTubeUrl } from "../../App";
import {Preferences} from "@capacitor/preferences";

const New = () => {
  const { player, setPlayer, progress, setProgress } = useData();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleProjectSettings = async (url) => {
    if (!url || url.trim() === "") {
      setError("Please enter a valid URL");
      return;
    }

    // Protector: Only process YouTube URLs
    if (!isValidYouTubeUrl(url)) {
      setError("Only YouTube URLs are supported. Please enter a valid YouTube link.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Protector: Check if video already exists in user's history
      const videoAlreadyExists = account?.history?.some(
        (item) => item?.content?.link === url
      );

      if (videoAlreadyExists) {
        // Find the existing video in history
        const existingVideo = account?.history?.find(
          (item) => item?.content?.link === url
        );

        setError(null);
        setSuccess(true);

        // Use existing data from history
        setPlayer({
          url,
          summary: existingVideo?.content?.data?.data,
          youtube: existingVideo?.content?.data?.youtube,
        });

        // Navigate to the existing history entry
        window.location.href = `/app/dashboard/${existingVideo?.id}?url=${encodeURIComponent(url)}`;
        setTimeout(() => setProgress("player"), 500);
        setIsLoading(false);
        return;
      }

      // Get the auth token from localStorage or cookies
      const result = await Preferences.get({ key: "token" });
      const token = result.value;

      const youtubeRes = await fetch(import.meta.env.VITE_BACKEND_URL + "/tools/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ link: url }),
        credentials: "include",
      });

      const id = crypto.randomUUID();

      if (youtubeRes.status !== 200) {
        throw new Error("Failed to fetch video summary");
      }

      const data = await youtubeRes.json();

      CreateHistory({
        title: player?.youtube?.title,
        date: new Date(),
        content: {
          link: url,
          data,
        },
        id: id,
      });

      setPlayer({
        url,
        summary: data,
        youtube: data?.youtube,
      });

      setSuccess(true);
      window.location.href = "/app/dashboard/" + id + "?new=true&&url=" + encodeURIComponent(url);
      setTimeout(() => setProgress("player"), 500);
    } catch (err) {
      setError(err.message || "An error occurred while fetching the summary");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const inputVariants = {
    focus: { scale: 1.02 },
  };

  const { CreateHistory, account } = useAuth();

  useEffect(() => {}, []);

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-3 sm:p-4 lg:p-6"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4 }}
    >
      {/* Card */}
      <motion.div
        className="bg-black rounded-xl border border-zinc-700 overflow-hidden"
        whileHover={{ boxShadow: "0 0 30px rgba(168, 85, 247, 0.2)" }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <motion.div
          className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white bg-gradient-to-r from-purple-900/30 to-transparent"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Add Video</h2>
          <p className="text-sm sm:text-base text-purple-100">Enter your YouTube URL to get started</p>
        </motion.div>

        {/* Content */}
        <motion.div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* URL Input Section */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2">
              YouTube URL
            </label>
            <motion.input
              type="text"
              placeholder="Paste your YouTube URL here..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleProjectSettings(url);
                }
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg border border-zinc-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 text-sm sm:text-base"
              variants={inputVariants}
              whileFocus="focus"
              disabled={isLoading}
            />
            <p className="text-xs text-zinc-400">
              ✓ Supports YouTube videos only (youtube.com or youtu.be)
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-900/20 border border-red-500/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-red-400 text-xs sm:text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              className="bg-green-900/20 border border-green-500/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-green-400 text-xs sm:text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Video loaded! Redirecting...</span>
              </div>
            </motion.div>
          )}

          {/* Button */}
          <motion.button
            onClick={() => handleProjectSettings(url)}
            disabled={isLoading || url.trim() === ""}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-white text-sm sm:text-base transition-all duration-200 ${
              isLoading || url.trim() === ""
                ? "bg-zinc-700 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50"
            }`}
            whileHover={isLoading || url.trim() === "" ? {} : { scale: 1.02 }}
            whileTap={isLoading || url.trim() === "" ? {} : { scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={isLoading ? { opacity: 0.7 } : { opacity: 1 }}
            >
              {isLoading ? (
                <>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </motion.svg>
                  <span>Loading Summary...</span>
                </>
              ) : (
                <>
                  <span>Load Video</span>
                </>
              )}
            </motion.div>
          </motion.button>

          {/* Current Settings */}
          {player?.url && (
            <motion.div
              className="bg-zinc-800/30 border border-zinc-700 rounded-lg px-4 py-3 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-zinc-400 mb-2">Current Video:</p>
              <p className="text-sm text-zinc-300 truncate font-mono">
                {player.url}
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default New;
