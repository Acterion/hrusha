import React from "react";
import ReactDOM from "react-dom/client";
import CVUpload from "./views/CV-Upload"; // Adjust path if necessary
import "./index.css"; // Import main styles

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CVUpload />
  </React.StrictMode>
);
