import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  useMap,
  ZoomControl,
  GeoJSON,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";

/** Reliable way to capture the Leaflet map instance */
function MapInstanceSetter({ setMap }) {
  const m = useMap();
  useEffect(() => {
    setMap(m);
  }, [m, setMap]);
  return null;
}

/** Track zoom in React state so we can hide/show layers */
function ZoomWatcher({ setZoom }) {
  const map = useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  useEffect(() => {
    setZoom(map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

/**
 * Community polygons layer
 */
function CommunitiesLayer({
  setError,
  zoom,
  zoomThreshold = 14,
  communityPopupOffset = [0, 260], // ✅ customizable
}) {
  const map = useMap();

  const [fc, setFc] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");

    fetch("https://portfoliobillg.com/api_communities.php", {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((j) => {
        if (!j?.ok || j?.type !== "FeatureCollection") {
          throw new Error("Communities API returned unexpected response");
        }
        setFc(j);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        console.error(e);
        setError(String(e?.message || e));
      });

    return () => controller.abort();
  }, [setError]);

  const style = useCallback(() => {
    return {
      weight: 1,
      opacity: 1,
      color: "rgba(255,255,255,0.35)",
      fillColor: "#f97316",
      fillOpacity: 0.45,
    };
  }, []);

  const onEachFeature = useCallback(
    (feature, layer) => {
      const p = feature.properties || {};

      const nAll = Number(p.count_all ?? 0);
      const nRes = Number(p.count_res ?? 0);

      const avgAll =
        p.avg_all != null && Number.isFinite(Number(p.avg_all))
          ? Math.round(Number(p.avg_all)).toLocaleString()
          : "-";
      const avgRes =
        p.avg_res != null && Number.isFinite(Number(p.avg_res))
          ? Math.round(Number(p.avg_res)).toLocaleString()
          : "-";

      const html = `
        <div style="
          width: 340px;
          max-width: 340px;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
          line-height: 1.25;
        ">
          <div style="font-weight: 800; margin-bottom: 6px;">
            ${p.NAME ?? "Community"}
          </div>

          <div style="margin-top: 6px;">
            Average Assessment (All Properties): <b>$${avgAll} CAD</b>
          </div>

          <div style="margin-top: 6px;">
            Average Assessment (Residential): <b>$${avgRes} CAD</b>
          </div>

          <div style="margin-top: 6px; font-size: 12px; opacity: 0.85;">
            ${nAll.toLocaleString()} Properties (${nRes.toLocaleString()} Residential)
          </div>

          <div style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
            Click area to zoom in.
          </div>
        </div>
      `;

      layer.bindPopup(html, {
        closeButton: false,
        maxWidth: 360,
        minWidth: 340,
        autoPan: true,
        keepInView: true,
        offset: communityPopupOffset,
        className: "no-popup-tip",
      });

      layer.on("mouseover", function () {
        this.setStyle({
          weight: 3,
          fillOpacity: 0.65,
          color: "rgba(255,255,255,0.75)",
        });
        this.openPopup();
      });

      layer.on("mouseout", function () {
        this.setStyle({
          weight: 1,
          fillOpacity: 0.45,
          color: "rgba(255,255,255,0.35)",
        });
        this.closePopup();
      });

      layer.on("click", function (e) {
        const targetZoom = map.getMaxZoom() - 1;
        map.flyTo(e.latlng, targetZoom, { animate: true, duration: 0.8 });
        this.openPopup();
      });
    },
    [map, communityPopupOffset]
  );

  const shouldShow = zoom < zoomThreshold;
  if (!shouldShow) return null;
  if (!fc?.features?.length) return null;

  return <GeoJSON data={fc} style={style} onEachFeature={onEachFeature} />;
}

/**
 * Individual properties layer (points)
 *
 * ✅ NEW APPROACH (reliable):
 * - Track which popup is currently open via Leaflet events (popupopen/popupclose)
 * - If a point's popup is open, give that CircleMarker a red border
 * - When the popup closes, remove the red border
 */
function PointsLayer({
  zoom,
  zoomThreshold = 14,
  selectedKey,
  setSelectedKey,
  propertyPopupOffset = [0, -12],
}) {
  const map = useMap();
  const [points, setPoints] = useState([]);

  // ✅ This is what drives the red border now
  const [openPopupKey, setOpenPopupKey] = useState(null);

  const fetchPoints = useCallback(() => {
    const z = map.getZoom();

    if (z < zoomThreshold) {
      setPoints([]);
      setOpenPopupKey(null);
      return;
    }

    const b = map.getBounds();
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
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) throw new Error(j.error || "api.php ok=false");
        setPoints(j.mode === "points" ? j.data || [] : []);
      })
      .catch((e) => console.error(e));
  }, [map, zoomThreshold]);

  useEffect(() => {
    const handler = () => fetchPoints();
    map.on("moveend", handler);
    map.on("zoomend", handler);

    fetchPoints();

    return () => {
      map.off("moveend", handler);
      map.off("zoomend", handler);
    };
  }, [map, fetchPoints]);

  if (zoom < zoomThreshold) return null;

  return (
    <>
      {points.map((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);

        let baseColor = "#9ca3af";
        if (p.assessment_class_description === "Residential") baseColor = "#2563eb";
        else if (p.assessment_class_description === "Non-Residential") baseColor = "#facc15";
        else if (p.assessment_class_description === "Farm Land") baseColor = "#16a34a";

        const isOpen = p.unique_key === openPopupKey;

        return (
          <CircleMarker
            key={p.unique_key}
            center={[lat, lng]}
            radius={isOpen ? 8 : 6}
            pathOptions={{
              // 🔴 Red border only while popup is open
              color: isOpen ? "#ef4444" : baseColor,
              fillColor: baseColor,
              fillOpacity: 0.9,
              weight: isOpen ? 3 : 1.5,
            }}
            eventHandlers={{
              // This guarantees we highlight even if user clicks marker (Leaflet will open popup)
              click: () => setOpenPopupKey(p.unique_key),

              // These keep it 100% in-sync with popup visibility
              popupopen: () => setOpenPopupKey(p.unique_key),
              popupclose: () => {
                setOpenPopupKey((cur) => (cur === p.unique_key ? null : cur));
              },
            }}
            ref={(layer) => {
              // Programmatic open (from search selection)
              if (layer && selectedKey && p.unique_key === selectedKey) {
                setOpenPopupKey(p.unique_key);
                setTimeout(() => layer.openPopup(), 50);
                setSelectedKey(null);
              }
            }}
          >
            <Popup offset={propertyPopupOffset} className="no-popup-tip">
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
                    else if (p.property_type === "LI")
                      propertyLabel = "Land & Building (Improvement)";
                    else if (p.property_type === "IO")
                      propertyLabel = "Building (Improvement) Only";
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
    </>
  );
}

export default function CalgaryMap() {
  const calgaryCenter = [51.0447, -114.0719];

  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(11);

  // Search UI state
  const [map, setMap] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

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

  // Customize offsets here
  const communityPopupOffset = [0, 260];
  const propertyPopupOffset = [0, 175];

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
              <div style={{ padding: 10, fontSize: 13, opacity: 0.9 }}>Searching...</div>
            )}

            {searchError && (
              <div style={{ padding: 10, fontSize: 13, color: "#fca5a5" }}>{searchError}</div>
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

            {!isSearching && !searchError && results.length === 0 && query.trim().length >= 3 && (
              <div style={{ padding: 10, fontSize: 13, opacity: 0.85 }}>No matches.</div>
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
        <ZoomWatcher setZoom={setZoom} />

        <CommunitiesLayer
          setError={setError}
          zoom={zoom}
          zoomThreshold={17}
          communityPopupOffset={communityPopupOffset}
        />

        <PointsLayer
          zoom={zoom}
          zoomThreshold={17}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          propertyPopupOffset={propertyPopupOffset}
        />
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