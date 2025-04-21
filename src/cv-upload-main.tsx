import React from "react";
import ReactDOM from "react-dom/client";
import CVUpload from "./views/CV-Upload"; // Adjust path if necessary
import "./index.css"; // Import main styles
import { ThemeProvider } from "@/app/components/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <CVUpload />
    </ThemeProvider>
  </React.StrictMode>
);
