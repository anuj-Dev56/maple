import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AuthPanel from "./components/Auth/Auth.layout";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./components/Auth/AuthlayoutWrapper";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/ui/navbar";
import Settings from "./components/ui/Settings.jsx";

// YouTube URL validator - Protects backend from non-YouTube requests
export const isValidYouTubeUrl = (url) => {
  if (!url) return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=|youtu\.be\//;
  return youtubeRegex.test(url);
};

const App = () => {
  const { account } = useAuth();

  return (
    <div>
      <Toaster />
      <main>
        <Routes>
          <Route path="/" element={<><Navbar /> <Dashboard /></>} />
          <Route
            path="/api/auth/"
            element={account ? <Navigate to={"/app/dashboard"} /> : <Outlet />}
          >
            <Route path="register" element={<AuthPanel />} />
          </Route>

          <Route
            path="/app/"
            element={
              <>
                <Navbar />
                <Outlet />
              </>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/:id" element={<Dashboard type="History" />} />
              <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
