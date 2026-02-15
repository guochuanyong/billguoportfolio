import { MapContainer, TileLayer } from "react-leaflet";

export default function CalgaryMap() {
  const calgaryCenter = [51.0447, -114.0719];

  return (
    <div style={{ height: "70vh", width: "100%", borderRadius: 16, overflow: "hidden" }}>
      <MapContainer
        center={calgaryCenter}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
