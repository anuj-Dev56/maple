import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../Auth/AuthlayoutWrapper";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { account } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!account)
    return (
      <button className="border p-1 rounded-full ">
        <Link to={"/api/auth/register"}>Login</Link>
      </button>
    );

  const { personal, createdAt } = account;
  const joinDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const Logout = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/signout`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    window.location.href = "/api/auth/register";
  };

  return (
    <div>
      {account == undefined ? (
        <div></div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          {/* Profile Avatar Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="profile-avatar-btn rounded-full border-2 border-transparent hover:border-purple-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <img
              src={personal?.avatar}
              alt={personal?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="profile-menu absolute right-0 top-15 mt-3 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden animate-fadeIn">
              {/* Header Section */}
              <div className="profile-header border-b-1 border-white/20 p-6 text-white">
                <div className="flex items-center gap-4">
                  <img
                    src={personal?.avatar}
                    alt={personal?.username}
                    className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">
                      {personal?.username}
                    </h3>
                    <p className="text-sm text-purple-100 truncate">
                      {personal?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-4 space-y-3">
                {/* Member Since */}
                <div className="profile-info-item">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-semibold">Member Since</span>
                  </div>
                  <p className="text-sm text-zinc-300 pl-6">{joinDate}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-700"></div>

              {/* Action Buttons */}
              <div className="p-3 space-y-1">
                <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors duration-200 flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Settings</span>
                </button>

                <button
                  onClick={Logout}
                  className="w-full pointer text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 rounded-md transition-colors duration-200 flex items-center gap-3"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out;
            }

            .profile-info-item {
              padding: 0.75rem;
              background: rgba(255, 255, 255, 0.02);
              border-radius: 0.5rem;
              border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .profile-avatar-btn {
              position: relative;
            }

            .profile-avatar-btn::before {
              content: "";
              position: absolute;
              inset: -2px;
              border-radius: 50%;
              background: linear-gradient(45deg, #a855f7, #ec4899, #a855f7);
              opacity: 0;
              transition: opacity 0.3s;
              z-index: -1;
            }

            .profile-avatar-btn:hover::before {
              opacity: 1;
              animation: rotate 3s linear infinite;
            }

            @keyframes rotate {
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
