import React from "react";
import UserProfile from "./UserProfile";
import {useData} from "./DataWrapper";

const Navbar = () => {
    const {player} = useData();
    function shortTitle(title, max = 32) {
        if (!title) return "";
        if (title.length <= max) return title;
        return title.slice(0, max).trim() + "…";
    }

    return (
        <div className="w-full border-b border-white/20 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6 py-2 sm:py-3">

                {/* Left - Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h1 className="text-xs sm:text-sm lg:text-lg font-medium truncate">
                        {player?.youtube?.title
                            ? shortTitle(player.youtube.title)
                            : "Youthink"}
                    </h1>

                    {/* Channel badge → desktop only */}
                    {player?.youtube?.title && (
                        <div
                            className="hidden sm:flex items-center gap-2 bg-amber-300 px-2 py-0.5 text-black rounded-full text-xs">
                            {player.youtube.channel}
                        </div>
                    )}
                </div>

                {/* Right - Buttons */}
                <div className="flex gap-1 sm:gap-2 justify-center items-center ml-2 flex-shrink-0">
                    <button onClick={() => {
                        window.location.href = "/app/dashboard/new";
                    }} className="bg-white text-black font-medium rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center">
                        New
                    </button>
                    <div className="cursor-pointer">
                        <UserProfile/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
