// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GradientBG } from "./components/GradientBG";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="relative min-h-screen text-slate-100 antialiased">
      {/* Main app UI */}
      <App />

      {/* Video overlay on top (semi-transparent, non-blocking) */}
      <GradientBG />
    </div>
  </React.StrictMode>
);
