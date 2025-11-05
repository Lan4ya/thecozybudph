import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { RouterProvider } from "react-router";
import router from "./routes";
import TanstackQueryProvider from "./providers/TanstackQueryProvider";
import { ToastProvider } from "./providers/ToastProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TanstackQueryProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </TanstackQueryProvider>
  </StrictMode>,
);
