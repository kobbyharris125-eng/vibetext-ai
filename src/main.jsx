import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Capacitor core — registers native plugins
import { defineCustomElements } from "@capacitor/core";
defineCustomElements(window);

const root = document.getElementById("root");

if (!root) {
  // Should never happen, but fail gracefully
  document.body.innerHTML = "<p style='font-family:sans-serif;padding:40px'>Failed to load. Please restart the app.</p>";
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
