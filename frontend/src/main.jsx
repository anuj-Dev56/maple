import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthlayoutWrapper from "./components/Auth/AuthlayoutWrapper.jsx";
import user from "./utils/user.js";
import DataWrapper from "./components/ui/DataWrapper.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthlayoutWrapper>
      <DataWrapper>
        <App />
      </DataWrapper>
    </AuthlayoutWrapper>
  </BrowserRouter>
);
