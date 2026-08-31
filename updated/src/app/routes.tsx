import { createBrowserRouter, Outlet } from "react-router";
import { SiteHeader, Nav, SiteFooter } from "./shared";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Noticeboard from "./pages/Noticeboard";
import Contact from "./pages/Contact";
import SupportUs from "./pages/SupportUs";
import ToyLibrary from "./pages/ToyLibrary";

function Root() {
  return (
    <div style={{ fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>
      <SiteHeader />
      <Nav />
      <Outlet />
    </div>
  );
}

function WithFooter({ children }: { children: React.ReactNode }) {
  return <>{children}<SiteFooter /></>;
}

function NotFound() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-lg">
      Page not found
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "about",        element: <WithFooter><About /></WithFooter> },
      { path: "services",     element: <WithFooter><Services /></WithFooter> },
      { path: "noticeboard",  element: <WithFooter><Noticeboard /></WithFooter> },
      { path: "contact",      element: <WithFooter><Contact /></WithFooter> },
      { path: "support-us",   element: <WithFooter><SupportUs /></WithFooter> },
      { path: "toy-library",  element: <WithFooter><ToyLibrary /></WithFooter> },
      { path: "*",            Component: NotFound },
    ],
  },
]);
