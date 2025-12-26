import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/Auth/AuthlayoutWrapper";

const dummyHistory = [
  {
    title: "Introduction to Web Development",
    date: new Date("2024-01-10"),
    content: "",
    id: "dsfdsfds",
  },
  {
    title: "React Basics Explained",
    date: new Date("2024-02-15"),
    content: "",
    id: "dsfdsfds",
  },
  {
    title: "Understanding MongoDB Schemas",
    date: new Date("2024-03-05"),
    content: "new mongoose.Types.ObjectId(",
    id: "dsfdsfds",
  },
];

const Sidebar = () => {
  const { account } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    function shortTitle(title, max = 40) {
    if (!title) return "";
    if (title.length <= max) return title;
    return title.slice(0, max).trim() + "…";
  }

  return (
    <div>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col items-start border-r-2 border-white/10 w-65 h-full bg-white/5 p-2">
        <h1 className="p-2 font-bold">History</h1>
        {account?.history.length == 0 ? (
          <div className="p-2 mt-1 mr-1 ">No History Found</div>
        ) : (
          <div>
            {account?.history.map((h, i) => {
              return (
                <div
                  key={h.id}
                  className="p-2 mt-1 mr-1 border-1 border-white/20 bg-white/6 rounded cursor-pointer hover:bg-white/10 transition"
                >
                  {h?.content ? (
                    <Link
                      to={`/app/dashboard/${h.id}`}
                      className="hover:text-purple-400"
                    >
                      {shortTitle(h?.content?.data?.youtube?.title, 26) || "Untitled"}
                    </Link>
                  ) : (
                    <span className="text-zinc-500">No title</span>
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
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-black border-2 border-white/30 text-white rounded-full p-4 shadow-lg transition-all"
        title="Toggle History"
      >
        <svg
          className={`w-6 h-6 transition-transform ${
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
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-t border-white/10 rounded-t-lg max-h-[70vh] overflow-y-auto shadow-xl animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <h1 className="font-bold text-lg mb-4">History</h1>
              {account?.history.length == 0 ? (
                <div className="p-2 text-center text-zinc-500">No History Found</div>
              ) : (
                <div className="space-y-2">
                  {account?.history.map((h, i) => {
                    return (
                      <div
                        key={h.id}
                        className="p-3 border border-white/20 bg-white/6 rounded hover:bg-white/10 transition"
                      >
                        {h?.content ? (
                          <Link
                            to={`/app/dashboard/${h.id}`}
                            className="hover:text-purple-400 block"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {shortTitle(h?.content?.data?.youtube?.title, 40) || "Untitled"}
                          </Link>
                        ) : (
                          <span className="text-zinc-500">No title</span>
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
