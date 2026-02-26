import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import Projects from "../components/Projects";
import MatrixRain from "../components/MatrixRain";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixRain opacity={0.3} speed={1} fontSize={20} density={1} />

      {/* Navbar NOT inside items-center wrapper */}
      <div className="relative z-10">
        <Navbar />

        {/* Now center the rest */}
        <div className="flex flex-col items-center pt-70">
          <div className="w-full flex justify-center">
            <div id="about" style={{ scrollMarginTop: "300px" }} />
            <Profile />
          </div>

          <div className="mt-50 w-full">
            <Projects />
          </div>

          <div className="mt-50 w-full">
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
}
