import os
import time
import math
import json
import requests
import pandas as pd
from tqdm import tqdm

# -----------------------------
# Config
# -----------------------------
DATASET_ID = "4bsw-nn7w"
BASE_URL = f"https://data.calgary.ca/resource/{DATASET_ID}.json"

# Optional but recommended (reduces throttling risk):
# Create an App Token and set it in your environment:
#   Windows (PowerShell):  setx SOCRATA_APP_TOKEN "your_token_here"
APP_TOKEN = os.getenv("SOCRATA_APP_TOKEN", "")

# Geometry is heavy; keep page size moderate
PAGE_SIZE = 20000

OUT_DIR = "assessments_extract_parts"
os.makedirs(OUT_DIR, exist_ok=True)

# Your chosen fields (API field names, not display names)
COLUMNS = [
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
    "multipolygon",
    "cpid",
    "unique_key",
]

# -----------------------------
# Helpers
# -----------------------------
def socrata_get(params: dict) -> list[dict]:
    headers = {"Accept": "application/json"}
    if APP_TOKEN:
        headers["X-App-Token"] = APP_TOKEN

    r = requests.get(BASE_URL, headers=headers, params=params, timeout=120)
    r.raise_for_status()
    return r.json()

def get_total_rows() -> int:
    data = socrata_get({"$select": "count(1) as n"})
    return int(data[0]["n"])

def safe_filename(i: int) -> str:
    return os.path.join(OUT_DIR, f"assessments_part_{i:04d}.parquet")

def main():
    total_rows = get_total_rows()
    total_pages = math.ceil(total_rows / PAGE_SIZE)

    print(f"Dataset: {DATASET_ID}")
    print(f"Total rows: {total_rows:,}")
    print(f"Page size: {PAGE_SIZE:,}")
    print(f"Pages: {total_pages:,}")
    print(f"Output dir: {OUT_DIR}")
    print()

    # tqdm progress bar shows % 0-100 automatically
    for page_idx in tqdm(range(total_pages), desc="Extracting", unit="page"):
        offset = page_idx * PAGE_SIZE
        out_path = safe_filename(page_idx)

        # Skip if already downloaded (resume-friendly)
        if os.path.exists(out_path):
            continue

        params = {
            "$select": ",".join(COLUMNS),
            "$limit": PAGE_SIZE,
            "$offset": offset,
            # deterministic ordering so paging is stable
            "$order": "unique_key",
        }

        # retry with backoff
        rows = None
        for attempt in range(6):
            try:
                rows = socrata_get(params)
                break
            except Exception:
                if attempt == 5:
                    raise
                time.sleep(2 * (attempt + 1))

        if not rows:
            # End early if API returns empty unexpectedly
            break

        df = pd.DataFrame(rows)

        # Light type cleanup (keeps geometry as-is)
        for col in ["roll_year", "assessed_value", "year_of_construction", "land_size_sf"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        if "mod_date" in df.columns:
            df["mod_date"] = pd.to_datetime(df["mod_date"], errors="coerce", utc=True)

        # Save this chunk
        df.to_parquet(out_path, index=False)

        # gentle throttle
        time.sleep(0.15)

    print("\n✅ Extraction complete.")
    print(f"Parts written to: {OUT_DIR}")

if __name__ == "__main__":
    main()
