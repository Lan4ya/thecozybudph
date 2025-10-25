import { createBrowserRouter } from "react-router";
import Root from "./pages/Root.tsx";
import Home from "./pages/home/Home.tsx";
import Shop from "./pages/shop/Shop.tsx";
import About from "./pages/about/About.tsx";
import Contact from "./pages/contact/Contact.tsx";
import Events from "./pages/events/Events.tsx";
import { CatchAllErrorPage } from "./pages/ErrorPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: CatchAllErrorPage,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "shop", Component: Shop },
      { path: "events", Component: Events },
      { path: "contact", Component: Contact },
    ],
  },
]);

export default router;
