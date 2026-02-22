import React, { useState, useRef, useEffect } from "react";
import { GridScan } from "../Animations/GridScan";
import AuthBtn from "./AuthBtn";
import { auth } from "../../utils/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import toast from "react-hot-toast";

const AuthPanel = () => {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef(null);

  // OTP Timer
  useEffect(() => {
    if (otpSent && otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [otpTimer, otpSent]);

  // Check if user came from email link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem("emailForSignIn");
      if (storedEmail) {
        setEmail(storedEmail);
        setShowEmail(true);
        setOtpSent(true);
      }
    }
  }, []);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // For Email Link method
      if (authMode === "login") {
        const actionCodeSettings = {
          url: `${window.location.origin}/api/auth/register`,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem("emailForSignIn", email);

        setOtpSent(true);
        setOtpTimer(60);
        setSuccess("OTP sent! Check your email for the sign-in link.");
        toast.success("Check your email for the sign-in link!");
      } else {
        // For Sign Up - we'll ask for password next
        setOtpSent(true);
        setOtpTimer(0);
        setSuccess("Email verified. Now set your password.");
        toast.success("Ready to create account");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email sign-in is not enabled. Try Google sign-in.");
      } else {
        setError(err.message || "Failed to send OTP");
      }
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP from Email Link
  const handleVerifyOtpFromLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const storedEmail = window.localStorage.getItem("emailForSignIn");

      if (!storedEmail || storedEmail !== email) {
        setError("Email mismatch. Please use the same email.");
        setLoading(false);
        return;
      }

      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setError("Invalid or expired link. Please request a new one.");
        setLoading(false);
        return;
      }

      // Sign in with the email link
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem("emailForSignIn");

      // Get Firebase ID Token
      const idToken = await result.user.getIdToken();

      // Send token to backend for registration/login
      const backendRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/firebase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
          credentials: "include",
        }
      );

      const backendData = await backendRes.json();

      if (backendRes.status !== 200 && backendRes.status !== 201) {
        throw new Error(backendData.message || "Backend authentication failed");
      }

      // Store JWT token from backend in local storage
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({
        key: "token",
        value: backendData.token,
      });

      setSuccess("Logged in successfully!");
      toast.success("Welcome back!");

      setTimeout(() => {
        window.location.href = "/app/dashboard";
      }, 1000);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      if (err.code === "auth/invalid-email") {
        setError("Invalid email");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled");
      } else {
        setError(err.message || "Failed to verify OTP");
      }
      toast.error(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle Direct Email/Password Sign In
  const handleDirectSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      let user;

      if (authMode === "login") {
        user = await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Logging in...");
        toast.success("Signing you in...");
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        user = await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Creating account...");
        toast.success("Account created, signing you in...");
      }

      // Get Firebase ID Token
      const idToken = await user.user.getIdToken();

      // Send token to backend for registration/login
      const backendRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/firebase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
          credentials: "include",
        }
      );

      const backendData = await backendRes.json();

      if (backendRes.status !== 200 && backendRes.status !== 201) {
        throw new Error(backendData.message || "Backend authentication failed");
      }

      // Store JWT token from backend in local storage
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({
        key: "token",
        value: backendData.token,
      });

      setSuccess("Successfully logged in!");
      toast.success("Welcome!");

      setTimeout(() => {
        window.location.href = "/app/dashboard";
      }, 1000);
    } catch (err) {
      console.error("Error with auth:", err);
      if (err.code === "auth/user-not-found") {
        setError("User not found. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already registered. Try signing in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError(err.message || "Authentication failed");
      }
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOtpSent(false);
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
    setOtpTimer(0);
  };

  const showOtpLinkVerification =
    otpSent && isSignInWithEmailLink(auth, window.location.href);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* FOREGROUND */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-white gap-4 px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold">Welcome to</h1>
          <span className="text-4xl sm:text-5xl font-extrabold text-red-500 opacity-80">
            Youthink
          </span>
        </div>

        <p className="text-xs sm:text-sm text-gray-400 max-w-xs text-center">
          Sign in to continue and explore the Youthink experience
        </p>

        {/* Toggle Buttons */}
        {!showOtpLinkVerification && (
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded font-semibold text-xs sm:text-sm transition-colors ${
                !showEmail ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-200"
              }`}
              onClick={() => {
                setShowEmail(false);
                handleReset();
              }}
            >
              Google
            </button>
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded font-semibold text-xs sm:text-sm transition-colors ${
                showEmail ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-200"
              }`}
              onClick={() => {
                setShowEmail(true);
                handleReset();
              }}
            >
              Email
            </button>
          </div>
        )}

        {/* Google Sign In */}
        {!showEmail && !showOtpLinkVerification && (
          <div className="mt-4 w-full flex justify-center">
            <AuthBtn />
          </div>
        )}

        {/* Email/OTP Sign In */}
        {(showEmail || showOtpLinkVerification) && (
          <form
            className="w-full max-w-xs flex flex-col gap-2 sm:gap-3 mt-4 bg-zinc-900/60 p-3 sm:p-4 rounded-lg border border-zinc-700"
            onSubmit={
              showOtpLinkVerification
                ? handleVerifyOtpFromLink
                : otpSent
                ? handleDirectSignIn
                : handleSendOtp
            }
          >
            {/* Email Input */}
            <div>
              <input
                type="email"
                className="w-full px-3 py-2 rounded text-xs sm:text-sm bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || (otpSent && !showOtpLinkVerification)}
              />
            </div>

            {/* Password Input - Only for direct sign in or signup */}
            {!otpSent && !showOtpLinkVerification && (
              <div>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded text-xs sm:text-sm bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-400"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Auth Mode Toggle - Only when sending OTP */}
            {!otpSent && !showOtpLinkVerification && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 py-1.5 rounded text-xs sm:text-sm font-semibold transition-colors ${
                    authMode === "login"
                      ? "bg-red-500 text-white"
                      : "bg-zinc-700 text-zinc-200"
                  }`}
                  onClick={() => setAuthMode("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 rounded text-xs sm:text-sm font-semibold transition-colors ${
                    authMode === "signup"
                      ? "bg-red-500 text-white"
                      : "bg-zinc-700 text-zinc-200"
                  }`}
                  onClick={() => setAuthMode("signup")}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Error & Success Messages */}
            {error && (
              <div className="text-red-400 text-xs sm:text-sm bg-red-900/20 p-2 rounded border border-red-700/50">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-400 text-xs sm:text-sm bg-green-900/20 p-2 rounded border border-green-700/50">
                {success}
              </div>
            )}

            {/* OTP Timer */}
            {otpSent && otpTimer > 0 && (
              <div className="text-center text-xs text-zinc-400">
                Resend OTP in {otpTimer}s
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="submit"
              className="w-full py-2 rounded text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white font-semibold mt-1 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : showOtpLinkVerification ? (
                "Verify Email Link"
              ) : otpSent ? (
                "Sign In with Email/Password"
              ) : (
                `Send OTP / ${authMode === "login" ? "Sign In" : "Sign Up"}`
              )}
            </button>

            {/* Resend OTP Button */}
            {otpSent && otpTimer === 0 && !showOtpLinkVerification && (
              <button
                type="button"
                className="w-full py-1.5 rounded text-xs sm:text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold transition-colors"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}

            {/* Back Button */}
            {(otpSent || showOtpLinkVerification) && (
              <button
                type="button"
                className="w-full py-1.5 rounded text-xs sm:text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold transition-colors"
                onClick={handleReset}
                disabled={loading}
              >
                Back
              </button>
            )}
          </form>
        )}
      </div>

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
    </div>
  );
};

export default AuthPanel;
