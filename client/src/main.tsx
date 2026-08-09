import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/toast";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Toaster>
      <App />
    </Toaster>
  </BrowserRouter>,
);
