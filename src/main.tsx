import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import "./styles.css";
import App from "./App";
const root = document.getElementById("root")!;
const content = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
if (
  root.hasChildNodes() &&
  root.dataset.route === window.location.pathname.replace(/\/$/, "")
)
  hydrateRoot(root, content);
else createRoot(root).render(content);
