import { createBrowserRouter } from "react-router";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";
import Root from "./pages/Root.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
    ],
  },
]);

export default router;
