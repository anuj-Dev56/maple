import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../Auth/AuthlayoutWrapper";
import { Link } from "react-router-dom";
import { Preferences } from '@capacitor/preferences';

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
    const result = await Preferences.get({ key: "token" });
    const token = result.value;

    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/signout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    await Preferences.set({
      key: "token",
      value: null,
    });

    document.cookie = null;
    window.location.href = "/api/auth/register";
  };

  return (
    <div>
      {account == undefined ? (
        <div></div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-full overflow-hidden
               border-2 border-transparent
               hover:border-purple-400
               transition-all duration-300
               focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="User profile"
          >
            {personal?.avatar ? (
              <img
                src={personal.avatar}
                alt={personal?.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    personal?.username || "User"
                  )}&background=a855f7&color=fff&size=40`;
                }}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  personal?.username || "User"
                )}&background=a855f7&color=fff&size=40`}
                alt={personal?.username}
                className="w-full h-full object-cover"
              />
            )}
          </button>

          {/* Dropdown Menu - Mobile optimized */}
          {isOpen && (
            <div className="menu-panel fixed sm:absolute right-0 sm:right-0 bottom-0 sm:bottom-auto sm:top-12 left-0 sm:left-auto sm:mt-2 w-full sm:w-80 max-h-[90vh] sm:max-h-none bg-zinc-900 border-t sm:border sm:border-zinc-700 rounded-t-2xl sm:rounded-lg shadow-2xl overflow-y-auto animate-fadeIn z-50">
              {/* Drag Handle - Mobile only */}
              <div className="sm:hidden flex justify-center p-2">
                <div className="w-12 h-1 bg-zinc-600 rounded-full"></div>
              </div>

              {/* Header Section */}
              <div className="profile-header border-b border-white/20 p-4 sm:p-6 text-white">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={
                      personal?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        personal?.username || "User"
                      )}&background=a855f7&color=fff&size=64`
                    }
                    alt={personal?.username}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 border-white shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        personal?.username || "User"
                      )}&background=a855f7&color=fff&size=64`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold truncate">
                      {personal?.username}
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-100 truncate">
                      {personal?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {/* Member Since */}
                <div className="profile-info-item">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                    <span className="font-semibold text-xs">Member Since</span>
                  </div>
                  <p className="text-sm text-zinc-300 pl-6">{joinDate}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-700"></div>

              {/* Action Buttons */}
              <div className="p-3 space-y-1">
                <Link to={"/app/settings"} className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors duration-200 flex items-center gap-3">
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
                </Link>

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
