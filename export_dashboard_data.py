from __future__ import annotations

import json
import math
from datetime import datetime
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "outputs" / "weyland-yutani-mine-analytics.xlsx"
TARGETS = [ROOT / "dashboard" / "data.json", ROOT / "site" / "dist" / "data.json"]

workbook = openpyxl.load_workbook(SOURCE, data_only=True)
sheet = workbook["Generator"]
start = workbook["Assumptions"]["B5"].value
end = workbook["Assumptions"]["B6"].value
if not isinstance(start, datetime) or not isinstance(end, datetime) or start > end:
    raise ValueError("Invalid or uncalculated start/end date inputs")
rows = []
for values in sheet.iter_rows(min_row=2, values_only=True):
    date, mine, *_prefix, output, moving_average, _event_factor, _trend, event_name, active = values
    if not active or not date or not mine or output is None:
        continue
    if not isinstance(date, datetime) or not start <= date <= end:
        raise ValueError(f"Invalid generator date for {mine}: {date!r}; repair date inputs before export")
    if not isinstance(output, (float, int)) or not math.isfinite(output) or output < 0:
        raise ValueError(f"Invalid output for {mine} on {date}: {output!r}")
    if not isinstance(moving_average, (float, int)) or not math.isfinite(moving_average):
        raise ValueError(f"Invalid moving average for {mine} on {date}: {moving_average!r}")
    rows.append(
        {
            "date": date.strftime("%Y-%m-%d"),
            "mine": mine,
            "output": round(float(output), 3),
            "movingAverage": round(float(moving_average), 3) if moving_average is not None else None,
            "event": event_name,
        }
    )

if not rows:
    raise ValueError("No active generator rows; refusing to publish an empty chart")
keys = [(r["date"], r["mine"]) for r in rows]
if len(keys) != len(set(keys)):
    raise ValueError("Duplicate date/mine rows would inflate chart totals")
rows.sort(key=lambda r: (r["date"], r["mine"]))
payload = json.dumps({"source": SOURCE.name, "rows": rows}, separators=(",", ":"), allow_nan=False)
for target in TARGETS:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(payload, encoding="utf-8")
    print(f"Exported {len(rows)} spreadsheet rows to {target}")
