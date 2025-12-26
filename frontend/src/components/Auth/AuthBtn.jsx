import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthlayoutWrapper";

const AuthBtn = () => {
  const { isLoadingAuth, setLoadingAuth } = useAuth();
  const googleBtnRef = useRef(null);

  useEffect(() => {
    /* global google */
    if (!window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    // Render Google button into div
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: 280,
      text: "continue_with",
      shape: "pill",
    });
  }, []);

  const handleGoogleLogin = async (response) => {
    setLoadingAuth(true);

    try {
      const idToken = response.credential;

      if (!idToken) {
        toast.error("Google login failed");
        setLoadingAuth(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // <-- important for cookies
          body: JSON.stringify({ idToken }),
        }
      );

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

      document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=lax`;

      toast.success("Logged in successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login error");
    } finally {
      setLoadingAuth(false);
      window.location.href = "/app/dashboard";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {isLoadingAuth && (
        <div className="p-2 text-amber-200">Maple is working ...</div>
      )}
      <button ref={googleBtnRef} disabled={isLoadingAuth}></button>
    </div>
  );
};

export default AuthBtn;
