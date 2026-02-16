import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  Tooltip,
  useMapEvents,
  useMap,
  Marker,
  ZoomControl,
} from "react-leaflet";

function BoundsFetcher({ setMode, setData, setError }) {
  const map = useMapEvents({
    moveend: () => fetchData(),
    zoomend: () => fetchData(),
  });

  const fetchData = useCallback(() => {
    const b = map.getBounds();
    const z = map.getZoom();

    const minLat = b.getSouth();
    const maxLat = b.getNorth();
    const minLng = b.getWest();
    const maxLng = b.getEast();

    const url =
      `https://portfoliobillg.com/api.php` +
      `?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}` +
      `&zoom=${z}` +
      `&limit=5000`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error || "API returned ok=false");
        setMode(json.mode);
        setData(json.data || []);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError(String(err?.message || err));
      });
  }, [map, setMode, setData, setError]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/** Reliable way to capture the Leaflet map instance */
function MapInstanceSetter({ setMap }) {
  const m = useMap();
  useEffect(() => {
    setMap(m);
  }, [m, setMap]);
  return null;
}

function LegendBox() {
  const items = [
    { label: "Residential", color: "#2563eb" }, // blue
    { label: "Non-Residential", color: "#facc15" }, // yellow
    { label: "Farm Land", color: "#16a34a" }, // green
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        bottom: 20,
        zIndex: 999,
        background: "rgba(0,0,0,0.75)",
        color: "white",
        padding: "10px 12px",
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 1.2,
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        userSelect: "none",
        minWidth: 170,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Property Class</div>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: it.color,
              display: "inline-block",
            }}
          />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function makeInvertedTriangleIcon({ size = 22, color = "#f97316", opacity = 0.9 }) {
  const w = size;
  const h = Math.round(size * 0.9);

  const svg = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="${w / 2},${h} 0,0 ${w},0"
        fill="${color}"
        fill-opacity="${opacity}"
        stroke="rgba(255,255,255,0.85)"
        stroke-width="2"
      />
    </svg>
  `;

  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [w, h],
    iconAnchor: [w / 2, h], // tip sits on lat/lng
    popupAnchor: [0, -h],
    tooltipAnchor: [0, -h],
  });
}

export default function CalgaryMap() {
  const calgaryCenter = [51.0447, -114.0719];

  const [mode, setMode] = useState("clusters"); // "clusters" | "points"
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  // Search UI state
  const [map, setMap] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // which property should auto-open its popup (after search select)
  const [selectedKey, setSelectedKey] = useState(null);

  const runSearch = useCallback((q) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setSearchError("");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setSearchError("");

    const url = `https://portfoliobillg.com/api.php?search=${encodeURIComponent(
      trimmed
    )}&limit=10`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error || "Search API returned ok=false");
        setResults(json.data || []);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error(err);
        setSearchError(String(err?.message || err));
      })
      .finally(() => setIsSearching(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, runSearch]);

  const onPickResult = useCallback(
    (r) => {
      if (!map) return;

      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const targetZoom = 17;

      setSelectedKey(r.unique_key);
      map.flyTo([lat, lng], targetZoom, { animate: true, duration: 0.9 });

      setQuery(r.address || "");
      setResults([]);
      setSearchError("");
    },
    [map]
  );

  // ✅ ONE PLACE to control cluster triangle style
  const CLUSTER_TRIANGLE = useMemo(
    () => ({
      size: 22, // px
      color: "#f97316", // orange
      opacity: 0.9, // 0..1
    }),
    []
  );

  // icon instance (stable)
  const clusterIcon = useMemo(
    () => makeInvertedTriangleIcon(CLUSTER_TRIANGLE),
    [CLUSTER_TRIANGLE]
  );

  return (
    <div
      style={{
        height: "70vh",
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Search Bar Overlay */}
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 1000,
          width: 360,
          maxWidth: "calc(100% - 24px)",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Address..."
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.18)",
            outline: "none",
            background: "rgba(0,0,0,0.70)",
            color: "white",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
          }}
        />

        {(isSearching || searchError || results.length > 0) && (
          <div
            style={{
              marginTop: 8,
              background: "rgba(0,0,0,0.78)",
              color: "white",
              borderRadius: 12,
              overflowY: "auto",
              overflowX: "hidden",
              maxHeight: 260,
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
            }}
          >
            {isSearching && (
              <div style={{ padding: 10, fontSize: 13, opacity: 0.9 }}>
                Searching...
              </div>
            )}

            {searchError && (
              <div style={{ padding: 10, fontSize: 13, color: "#fca5a5" }}>
                {searchError}
              </div>
            )}

            {!isSearching &&
              !searchError &&
              results.map((r) => (
                <button
                  key={r.unique_key}
                  onClick={() => onPickResult(r)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    background: "transparent",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.address}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {r.comm_name ?? "-"}{" "}
                    {r.assessed_value != null
                      ? `• $${Number(r.assessed_value).toLocaleString()} CAD`
                      : ""}
                  </div>
                </button>
              ))}

            {!isSearching &&
              !searchError &&
              results.length === 0 &&
              query.trim().length >= 3 && (
                <div style={{ padding: 10, fontSize: 13, opacity: 0.85 }}>
                  No matches.
                </div>
              )}
          </div>
        )}
      </div>

      <MapContainer
        center={calgaryCenter}
        zoom={11}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomleft" />
        
        <MapInstanceSetter setMap={setMap} />
        <BoundsFetcher setMode={setMode} setData={setData} setError={setError} />

        {/* COMMUNITY CLUSTERS (zoomed out) - inverted triangles */}
        {mode === "clusters" &&
          data.map((c, idx) => {
            const nAll = Number(c.count_all || 0);
            const nRes = Number(c.count_res || 0);

            const avgAll = c.avg_all != null ? Number(c.avg_all).toLocaleString() : "N/A";
            const avgRes = c.avg_res != null ? Number(c.avg_res).toLocaleString() : "N/A";

            const lat = Number(c.latitude);
            const lng = Number(c.longitude);

            return (
              <Marker
                key={`${c.comm_name ?? "community"}-${idx}`}
                position={[lat, lng]}
                icon={clusterIcon}
                zIndexOffset={1000}
                eventHandlers={{
                  click: (e) => {
                    const m = e.target._map;
                    if (!m) return;
                    const targetZoom = m.getMaxZoom() - 1;
                    m.flyTo(e.latlng, targetZoom, { animate: true, duration: 0.8 });
                  },
                }}
              >
                <Tooltip direction="top" sticky opacity={0.95}>
                  <div style={{ minWidth: 360 }}>
                    <div style={{ fontWeight: 800 }}>{c.comm_name ?? "Community"}</div>

                    <div style={{ marginTop: 6 }}>
                      Average Property Assessment (All Properties): <b>${avgAll} CAD</b>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      Average Property Assessment (Residential): <b>${avgRes} CAD</b>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                      {nAll.toLocaleString()} Properties ({nRes.toLocaleString()} Residential)
                    </div>
                  </div>
                </Tooltip>

                <Popup>
                  <div style={{ minWidth: 380 }}>
                    <div style={{ fontWeight: 800 }}>{c.comm_name ?? "Community"}</div>

                    <div style={{ marginTop: 8 }}>
                      Average Property Assessment (All Properties): <b>${avgAll} CAD</b>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      Average Property Assessment (Residential): <b>${avgRes} CAD</b>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                      {nAll.toLocaleString()} Properties ({nRes.toLocaleString()} Residential)
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                      Click marker to zoom in.
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* INDIVIDUAL PROPERTIES (zoomed in) - colored circles */}
        {mode === "points" &&
          data.map((p) => {
            const lat = Number(p.latitude);
            const lng = Number(p.longitude);

            let color = "#9ca3af"; // grey (default)
            if (p.assessment_class_description === "Residential") color = "#2563eb";
            else if (p.assessment_class_description === "Non-Residential") color = "#facc15";
            else if (p.assessment_class_description === "Farm Land") color = "#16a34a";

            return (
              <CircleMarker
                key={p.unique_key}
                center={[lat, lng]}
                radius={6}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 1 }}
                ref={(layer) => {
                  if (layer && selectedKey && p.unique_key === selectedKey) {
                    setTimeout(() => layer.openPopup(), 50);
                    setSelectedKey(null);
                  }
                }}
              >
                <Popup>
                  <div style={{ minWidth: 240 }}>
                    <div style={{ fontWeight: 700 }}>{p.address}</div>
                    <div style={{ opacity: 0.85 }}>{p.comm_name}</div>

                    <div style={{ marginTop: 6 }}>
                      <b>${Number(p.assessed_value).toLocaleString()} CAD</b>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                      {(() => {
                        let propertyLabel = "-";
                        if (p.property_type === "LO") propertyLabel = "Land Only";
                        else if (p.property_type === "LI") propertyLabel = "Land & Building (Improvement)";
                        else if (p.property_type === "IO") propertyLabel = "Building (Improvement) Only";
                        return propertyLabel;
                      })()}{" "}
                      • Built{" "}
                      {p.year_of_construction && p.year_of_construction !== 0
                        ? p.year_of_construction
                        : "-"}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                      Class: {p.assessment_class_description ?? "-"}
                    </div>

                    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                      Lot Size:{" "}
                      {p.land_size_sf && Number(p.land_size_sf) > 0
                        ? `${Number(p.land_size_sf).toLocaleString()} sq ft`
                        : "-"}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>

      <LegendBox />

      {error && (
        <div style={{ marginTop: 10, color: "crimson", fontFamily: "monospace" }}>
          API error: {error}
        </div>
      )}
    </div>
  );
}
