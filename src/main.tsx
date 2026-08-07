import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import { applyTheme, getStoredTheme } from "./config/themes";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

applyTheme(getStoredTheme());

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <App />
      <Analytics />
    </QueryClientProvider>
  </StrictMode>,
);
