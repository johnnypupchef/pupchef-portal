import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// StrictMode intentionally double-runs effects in dev; that burned the one-time Supabase
// PKCE code on /auth/callback (second exchange → otp_expired). Omit for auth flows.
createRoot(document.getElementById("root")!).render(<App />);
