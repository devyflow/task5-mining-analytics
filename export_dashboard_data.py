from __future__ import annotations

import json
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "outputs" / "weyland-yutani-mine-analytics.xlsx"
TARGET = ROOT / "site" / "dist" / "data.json"

workbook = openpyxl.load_workbook(SOURCE, data_only=True)
sheet = workbook["Generator"]
rows = []
for values in sheet.iter_rows(min_row=2, values_only=True):
    date, mine, *_prefix, output, moving_average, _event_factor, _trend, event_name, active = values
    if not active or not date or not mine or output is None:
        continue
    rows.append(
        {
            "date": date.strftime("%Y-%m-%d"),
            "mine": mine,
            "output": round(float(output), 3),
            "movingAverage": round(float(moving_average), 3) if moving_average is not None else None,
            "event": event_name,
        }
    )

TARGET.parent.mkdir(parents=True, exist_ok=True)
TARGET.write_text(json.dumps({"source": SOURCE.name, "rows": rows}, separators=(",", ":")), encoding="utf-8")
print(f"Exported {len(rows)} spreadsheet rows to {TARGET}")
