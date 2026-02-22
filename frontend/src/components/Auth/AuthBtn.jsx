import React, { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthlayoutWrapper";
import { Preferences } from "@capacitor/preferences";
import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";

const AuthBtn = () => {
  const { isLoadingAuth, setLoadingAuth } = useAuth();
  const finishLogin = useCallback(
    async (firebaseUser) => {
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/firebase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        }
      );

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

      await Preferences.set({
        key: "token",
        value: data.token,
      });

      toast.success("Logged in successfully!");
      window.location.href = "/app/dashboard";
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user || !isMounted) return;
        setLoadingAuth(true);
        await finishLogin(result.user);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        toast.error(err.message || "Login error");
      } finally {
        if (isMounted) setLoadingAuth(false);
      }
    };

    handleRedirect();

    return () => {
      isMounted = false;
    };
  }, [finishLogin, setLoadingAuth]);

  const handleGoogleLogin = async () => {
    setLoadingAuth(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await finishLogin(result.user);
    } catch (err) {
      const shouldRedirect =
        err?.code === "auth/operation-not-supported-in-this-environment" ||
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/popup-closed-by-user";

      if (shouldRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      console.error(err);
      toast.error(err.message || "Login error");
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {isLoadingAuth && (
        <div className="p-2 text-amber-200">maple is working ...</div>
      )}
      {!isLoadingAuth && (
        <button
          className="rounded-full border border-white/20 px-6 py-2 text-sm font-medium text-white hover:border-white/40"
          onClick={handleGoogleLogin}
          disabled={isLoadingAuth}
          type="button"
        >
          Continue with Google
        </button>
      )}
    </div>
  );
};

export default AuthBtn;
