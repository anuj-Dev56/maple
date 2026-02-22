import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../components/Auth/AuthlayoutWrapper";

const Sidebar = () => {
    const {account} = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    function shortTitle(title, max = 40) {
        if (!title) return "";
        if (title.length <= max) return title;
        return title.slice(0, max).trim() + "…";
    }

    return (
        <div>
            {/* Desktop Sidebar */}
            <div
                className="hidden lg:flex flex-col items-start border-r-2 border-white/10 w-40 min-h-screen h-full bg-white/5 p-3">
                <h1 className="p-2 font-bold text-sm">History</h1>
                {account?.history?.length === 0 ? (
                    <div className="p-2 mt-1 text-xs text-zinc-500">No History</div>
                ) : (
                    <div className="w-full space-y-2">
                        {account?.history?.map((h) => {
                            const yt = h?.content?.data?.youtube;

                            return (
                                <div
                                    key={h.id}
                                    className="relative group p-2 border border-white/20 bg-white/6 rounded cursor-pointer hover:bg-white/10 transition w-full"
                                >
                                    {yt ? (
                                        <>
                                            {/* Main Preview */}
                                            <Link
                                                to={`/app/dashboard/${h.id}`}
                                                className="flex items-center flex-col gap-2 hover:text-purple-400"
                                            >
                                                <span className="text-xs text-center">
                            {shortTitle(yt.title, 10) || "Untitled"}
                        </span>
                                            </Link>

                                            {/* Hover Details */}
                                            <div
                                                className="
                            absolute left-full top-0 ml-3 w-72
                            bg-zinc-900 border border-white/20
                            rounded-lg p-3 text-sm
                            opacity-0 scale-95
                            pointer-events-none
                            group-hover:opacity-100
                            group-hover:scale-100
                            transition-all duration-200
                            z-50
                        "
                                            >
                                                <img
                                                    src={yt.thumbnail}
                                                    className="w-full rounded mb-2"
                                                    alt={yt.title || "Video thumbnail"}
                                                />

                                                <div className={"p-2 bg-white/10 rounded"}>
                                                    <p className="font-semibold text-white text-xs">
                                                        {yt.title}
                                                    </p>

                                                    <p className="text-zinc-400 mt-1 text-xs">
                                                        Channel: {yt.channel || "Unknown"}
                                                    </p>

                                                    <p className="text-zinc-500 mt-1 text-xs">
                                                        Video ID: {h.id}
                                                    </p>

                                                    <p className="text-zinc-500 mt-1 text-xs">
                                                        Created: {new Date(yt.publishedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-zinc-500 text-xs">No title</span>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-black border-2 border-white/30 text-white rounded-full p-3 sm:p-4 shadow-lg hover:bg-zinc-900 transition-all"
                title="Toggle History"
                aria-label="Toggle History Menu"
            >
                <svg
                    className={`w-5 sm:w-6 h-5 sm:h-6 transition-transform ${
                        isMobileMenuOpen ? "rotate-45" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                            isMobileMenuOpen
                                ? "M6 18L18 6M6 6l12 12"
                                : "M4 6h16M4 12h16M4 18h16"
                        }
                    />
                </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t-2 border-white/10 rounded-t-2xl max-h-[75vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6">
                            {/* Handle Bar */}
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-1 bg-zinc-600 rounded-full"></div>
                            </div>

                            <h1 className="font-bold text-lg sm:text-xl mb-4 text-white">History</h1>
                            {account?.history?.length === 0 ? (
                                <div className="p-4 text-center text-zinc-500 text-sm">No History Found</div>
                            ) : (
                                <div className="space-y-2">
                                    {account?.history?.map((h) => {
                                        return (
                                            <div
                                                key={h.id}
                                                className="p-3 sm:p-4 border border-white/20 bg-white/6 rounded-lg hover:bg-white/10 transition"
                                            >
                                                {h?.content ? (
                                                    <Link
                                                        to={`/app/dashboard/${h.id}`}
                                                        className="hover:text-purple-400 block text-sm sm:text-base"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {shortTitle(h?.content?.data?.youtube?.title, 40) || "Untitled"}
                                                    </Link>
                                                ) : (
                                                    <span className="text-zinc-500 text-sm">No title</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
