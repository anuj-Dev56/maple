import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useData } from "./DataWrapper";

const Chat = () => {
  const { player } = useData();

  if (!player) return null;

  const summary =
    player?.summary?.data?.summary ||
    player?.youtube?.description ||
    "No summary available";

  return (
    <motion.div
      className="mt-5 flex flex-col h-full max-h-[70vh] bg-black border border-zinc-700 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-900/60">
        <h3 className="text-sm font-semibold text-zinc-200">Summary</h3>
      </div>

      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
          {summary}
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
