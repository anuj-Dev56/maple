import React, { createContext, useContext, useEffect, useState } from "react";
import user from "../../utils/user";
import toast from "react-hot-toast";
import { Preferences } from '@capacitor/preferences';
const AuthContext = createContext(null);

const AuthlayoutWrapper = ({ children }) => {
  const [isLoadingAuth, setLoadingAuth] = useState(true);
  const [account, setAccount] = useState(null);

  async function CreateHistory(history) {
    try {
      /* const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/tools/updateHistory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ history }),
          credentials: "include",
        }
      );

      */

      const result = await Preferences.get({ key: "token" });
      const token = result.value;

      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/tools/updateHistory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ history }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.status !== 200) {
        throw new Error(data.message || "Failed to update history");
      }

      account.history.push(history);
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        setLoadingAuth(true);
        const fetchedUser = await user.fetch();

        if (isMounted) {
          setAccount(fetchedUser);
        }
      } catch (err) {
        console.error("Auth fetch failed:", err);
        if (isMounted) {
          setAccount(null);
        }
      } finally {
        if (isMounted) {
          setLoadingAuth(false);
        }
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoadingAuth,
        setLoadingAuth,
        CreateHistory,
        account,
        setAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthlayoutWrapper;
