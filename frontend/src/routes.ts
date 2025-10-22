import { createBrowserRouter } from "react-router";
import Home from "./pages/home/Home.tsx";
import About from "./pages/about/About.tsx";
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
