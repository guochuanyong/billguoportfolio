import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import Projects from "../components/Projects";
import MatrixRain from "../components/MatrixRain";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <MatrixRain opacity={0.3} speed={1} fontSize={20} density={1} />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center pt-70">
        <Navbar />

        {/* Center profile horizontally */}
        <div className="w-full flex justify-center">
          {/* Anchor target for About */}
          <div id="about" style={{ scrollMarginTop: "300px" }} />
          <Profile />
        </div>

        {/* Projects section */}
        <div className="mt-50 w-full">
          <Projects />
        </div>
      </div>
    </div>
  );
}
