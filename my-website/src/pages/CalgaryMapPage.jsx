import Navbar from "../components/Navbar";
import CalgaryMap from "../components/CalgaryMap";

export default function CalgaryMapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Push content below the fixed navbar */}
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-8">
        <h1 className="text-3xl font-bold mb-4">
          City of Calgary Property Assessments (2026)
        </h1>

        <CalgaryMap />

        {/* Data Source Line */}
        <p className="mt-6 text-sm text-gray-400">
          Data Sources:{" "}
          <a
            href="https://data.calgary.ca/Government/Current-Year-Property-Assessments-Parcel-/4bsw-nn7w/about_data"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            City of Calgary's Open Data Portal (Current Year Property Assessments (Parcel))
          </a>
          {", "}
          <a
            href="https://data.calgary.ca/Base-Maps/Community-District-Boundaries/surr-xmvs/about_data"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            Community District Boundaries
          </a>
        </p>
      </div>
    </div>
  );
}
