import React, { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AuthPanel from "./components/Auth/Auth.layout";
import { Toaster } from "react-hot-toast";
import user from "./utils/user";
import { useAuth } from "./components/Auth/AuthlayoutWrapper";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/ui/navbar";

const App = ({ user }) => {
  const { account, setAccount } = useAuth();

  return (
    <div>
      <Toaster />
      <main>
        <Routes>
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
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
