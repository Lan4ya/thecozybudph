import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { RouterProvider } from "react-router";
import router from "./routes";
import TanstackQueryProvider from "./providers/TanstackQueryProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TanstackQueryProvider>
      <RouterProvider router={router} />
    </TanstackQueryProvider>
  </StrictMode>,
);
