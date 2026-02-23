import json
import pandas as pd
from shapely import wkt
from shapely.geometry import mapping

INPUT_CSV = "communities.csv"
OUTPUT_CSV = "communities_with_geojson.csv"
ERROR_CSV = "communities_bad_wkt.csv"

df = pd.read_csv(INPUT_CSV)

bad_rows = []

def wkt_to_geojson(wkt_str, idx=None):
    # handle NaN / empty
    if pd.isna(wkt_str):
        return None
    s = str(wkt_str).strip()
    if s == "" or s.upper() == "NULL":
        return None

    # basic sanity: should start with MULTIPOLYGON
    if not s.upper().startswith("MULTIPOLYGON"):
        bad_rows.append((idx, "Not a MULTIPOLYGON", s[:120]))
        return None

    try:
        geom = wkt.loads(s)
        return json.dumps(mapping(geom), separators=(",", ":"))
    except Exception as e:
        bad_rows.append((idx, f"{type(e).__name__}: {e}", s[:120]))
        return None

# apply with index so we can log which row failed
df["geojson"] = [wkt_to_geojson(val, idx=i) for i, val in enumerate(df["MULTIPOLYGON"].tolist())]

df.to_csv(OUTPUT_CSV, index=False)

# save error log for inspection
if bad_rows:
    err_df = pd.DataFrame(bad_rows, columns=["row_index", "error", "wkt_preview"])
    err_df.to_csv(ERROR_CSV, index=False)
    print(f"Converted with warnings. Bad WKT rows: {len(bad_rows)}")
    print(f"Wrote: {OUTPUT_CSV}")
    print(f"Wrote: {ERROR_CSV} (to inspect bad rows)")
else:
    print(f"Converted successfully. Wrote: {OUTPUT_CSV}")