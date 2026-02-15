import Navbar from "../components/Navbar";
import CalgaryMap from "../components/CalgaryMap";

export default function CalgaryMapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Push content below the fixed navbar */}
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-8">
        <h1 className="text-3xl font-bold mb-4">Calgary Map (Work In Progress)</h1>
        <CalgaryMap />
      </div>
    </div>
  );
}
