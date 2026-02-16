import glob
import os
import json
import pandas as pd
from tqdm import tqdm
from shapely.geometry import shape
from shapely import wkt
from shapely.errors import GEOSException

IN_DIR = "assessments_extract_parts"
OUT_DIR = "map_points_csv_parts"
ROWS_PER_CSV = 100_000

KEEP_COLS = [
    "roll_year",
    "roll_number",
    "address",
    "assessed_value",
    "assessment_class_description",
    "comm_name",
    "year_of_construction",
    "property_type",
    "land_size_sf",
    "mod_date",
    "cpid",
    "unique_key",
]

def geom_to_centroid_latlng(g):
    """
    Accepts:
      - dict GeoJSON-like
      - JSON string of GeoJSON
      - WKT string (fallback)
    Returns (lat, lng)
    """
    if g is None or (isinstance(g, float) and pd.isna(g)):
        return (None, None)

    try:
        if isinstance(g, str):
            s = g.strip()
            if not s:
                return (None, None)
            if s[0] in "{[":
                g = json.loads(s)
                geom = shape(g)
            else:
                geom = wkt.loads(s)

        elif isinstance(g, dict):
            # Some exports omit "type". If missing, assume MultiPolygon.
            if "type" not in g and "coordinates" in g:
                g = {"type": "MultiPolygon", "coordinates": g["coordinates"]}
            geom = shape(g)

        else:
            return (None, None)

        if geom.is_empty:
            return (None, None)

        c = geom.centroid  # x=lon, y=lat
        return (float(c.y), float(c.x))

    except (ValueError, TypeError, GEOSException):
        return (None, None)

def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    files = sorted(glob.glob(os.path.join(IN_DIR, "*.parquet")))
    if not files:
        raise FileNotFoundError(f"No parquet files found in {IN_DIR}")

    part_idx = 1
    buffer_rows = 0
    buffer_df = None

    total_rows = 0
    centroid_ok = 0
    written_rows = 0

    def flush_buffer(df_to_write: pd.DataFrame):
        nonlocal part_idx, written_rows
        out_path = os.path.join(OUT_DIR, f"map_points_part_{part_idx:04d}.csv")
        df_to_write.to_csv(out_path, index=False)
        written_rows += len(df_to_write)
        print(f"✅ Wrote {len(df_to_write):,} rows -> {out_path}")
        part_idx += 1

    for f in tqdm(files, desc="Computing centroids", unit="file"):
        df = pd.read_parquet(f)

        # compute centroids
        latlng = df["multipolygon"].apply(geom_to_centroid_latlng)
        df["latitude"] = latlng.apply(lambda t: t[0])
        df["longitude"] = latlng.apply(lambda t: t[1])

        total_rows += len(df)
        centroid_ok += df["latitude"].notna().sum()

        out_cols = [c for c in KEEP_COLS if c in df.columns] + ["latitude", "longitude"]
        out = df[out_cols].copy()

        # append into buffer, flushing into 100k CSV chunks
        if buffer_df is None:
            buffer_df = out
        else:
            buffer_df = pd.concat([buffer_df, out], ignore_index=True)

        while len(buffer_df) >= ROWS_PER_CSV:
            chunk = buffer_df.iloc[:ROWS_PER_CSV].copy()
            flush_buffer(chunk)
            buffer_df = buffer_df.iloc[ROWS_PER_CSV:].copy()

    # flush remainder
    if buffer_df is not None and len(buffer_df) > 0:
        flush_buffer(buffer_df)

    print("\n✅ Done")
    print(f"Total rows processed: {total_rows:,}")
    print(f"Rows with centroid:   {centroid_ok:,} ({centroid_ok/total_rows:.2%})")
    print(f"Total rows written:   {written_rows:,}")
    print(f"Output folder:        {OUT_DIR}")

if __name__ == "__main__":
    main()
