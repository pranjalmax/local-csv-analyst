"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      richColors
      toastOptions={{
        style: {
          background: "rgba(15,23,42,0.9)",
          color: "#E2E8F0",
          borderRadius: "9999px",
          border: "1px solid rgba(148,163,184,0.5)",
          backdropFilter: "blur(16px)"
        }
      }}
    />
  );
}
