import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CalgaryMapPage from "./pages/CalgaryMapPage";
import CalgaryMapPageTest from "./pages/CalgaryMapPageTest";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Only do something if there's a hash like "#projects"
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    // Give the new route a moment to render (Home + Projects)
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;

      // scrollMarginTop on the element will be respected by scrollIntoView
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.pathname, location.hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calgary-map" element={<CalgaryMapPage />} />
        <Route path="/calgary-map-test" element={<CalgaryMapPageTest />} />
      </Routes>
    </BrowserRouter>
  );
}
