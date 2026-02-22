import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useData } from "./DataWrapper";
import user from "../../utils/user.js";


function getHistoryIndex(id) {
    const history = user.user.history;
    for (let i = 0; i < history.length; i++) {
        if (history[i].id === id) {
            return i;
        }
    }
    return -1; // Not found
}

function shortBadge(topic) {
    if (topic.length > 15) {
        return topic.slice(0, 12) + "...";
    }
    return topic;
}

const Chat = () => {
  const { player } = useData();
  const [isAudienceExpanded, setIsAudienceExpanded] = useState(false);

  if (!player) return null;

  const historyIndex = getHistoryIndex(player.id);
    if (historyIndex === -1) return null;
  const key_topics = user.user.history[historyIndex].content.data.data.key_topics || [];
  const target_audience = user.user.history[historyIndex].content.data.data.target_audience || "General Audience";
  const summary = user.user.history[historyIndex].content.data.data.summary || "No summary available.";

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  };

  return (
    <motion.div
      className="summary-section w-full flex flex-col h-full max-h-[60vh] sm:max-h-[70vh] lg:max-h-[75vh] bg-black border border-zinc-700 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-zinc-700 bg-zinc-900/60 flex-shrink-0">
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-200">Summary</h3>
      </div>

      {/* Badges Section */}
      <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-zinc-700/50 bg-zinc-900/40 flex-shrink-0">
        {/* Target Audience Badge - Expandable */}
        <div className="mb-2">
          <p className="text-xs font-medium text-zinc-400 mb-1">Audience</p>
          <motion.button
            onClick={() => setIsAudienceExpanded(!isAudienceExpanded)}
            className="w-full px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-700/50 hover:border-blue-600/80 hover:bg-blue-900/50 transition-all cursor-pointer text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-blue-300 truncate flex-1">
                {isAudienceExpanded ? target_audience : shortBadge(target_audience)}
              </span>
              <motion.span
                animate={{ rotate: isAudienceExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-blue-400 flex-shrink-0 ml-1"
              >
                ▼
              </motion.span>
            </div>
          </motion.button>

          {/* Expanded Audience Details */}
          <AnimatePresence>
            {isAudienceExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 p-2 sm:p-3 rounded-lg bg-blue-900/20 border border-blue-700/30 max-h-32 sm:max-h-40 overflow-y-auto"
              >
                <p className="text-xs sm:text-sm text-blue-200 leading-relaxed break-words whitespace-normal max-w-full">
                  {target_audience}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Key Topics Badges */}
        {key_topics.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-400 mb-1">Topics</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {key_topics.map((topic, index) => {
                  if (!topic || topic.trim() === "") return null;
                  if (index > 5) {
                      return null
                  }
                return <motion.div
                      key={index}
                      custom={index}
                      variants={badgeVariants}
                      initial="hidden"
                      animate="visible"
                      className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 border border-emerald-700/50 hover:border-emerald-600/80 transition-colors cursor-default"
                      whileHover={{scale: 1.05}}
                  >
                      <span className="text-xs sm:text-sm font-medium text-emerald-300">{topic}</span>
                  </motion.div>
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary Content - Enhanced Visibility */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gradient-to-b from-zinc-900/40 to-black min-h-[120px]">
        <div className="bg-zinc-900/60 rounded-lg p-2 sm:p-4 border border-zinc-700/50 h-full">
          <div className="text-xs sm:text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap break-words font-medium">
            {summary}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
