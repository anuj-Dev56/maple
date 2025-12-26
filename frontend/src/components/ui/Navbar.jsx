import React from "react";
import UserProfile from "./UserProfile";
import { useData } from "./DataWrapper";

const Navbar = () => {
  const { player } = useData();

  function shortTitle(title, max = 32) {
    if (!title) return "";
    if (title.length <= max) return title;
    return title.slice(0, max).trim() + "…";
  }

  return (
    <div className="w-full border-b border-white/20">
      <div className="flex items-center justify-between px-3 py-2 lg:px-6">
        
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm lg:text-lg font-medium truncate max-w-[65vw] lg:max-w-none">
            {player?.youtube?.title
              ? shortTitle(player.youtube.title)
              : "Maple"}
          </h1>

          {/* Channel badge → desktop only */}
          {player?.youtube?.title && (
            <div className="hidden lg:flex items-center gap-2 bg-amber-300 px-2 py-0.5 text-black rounded-full text-xs">
              {player.youtube.channel}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center ml-2">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
