# Task 5 — Weyland-Yutani Mining Analytics

Formula-driven mine production analysis with an editable spreadsheet, anomaly dashboard, and PDF report.

## Deliverables

- Public dashboard: https://devyanshu-task5-mine-intelligence.aaadhar0.chatgpt.site/
- Native Google Sheet: https://docs.google.com/spreadsheets/d/1rw34gp76v4lMBYK_LOxWyQmMir2D09FhMGvVXOyW-_k/edit
- Generated workbook: `outputs/weyland-yutani-mine-analytics.xlsx`
- PDF report: `output/pdf/weyland-yutani-mine-analytics-report.pdf`

## Dashboard

Open `dashboard/index.html` through a static web server. The dashboard provides mine and chart selection, trend degree 1–4, IQR and Z-score thresholds, moving-average distance, Grubbs alpha, an anomaly register, and PDF export. The dashboard data source is `dashboard/data.json`, a bundled snapshot.

To refresh the snapshot after updating the source workbook, export the updated workbook to `outputs/weyland-yutani-mine-analytics.xlsx`, then regenerate the dashboard data using `export_dashboard_data.py` and republish the dashboard. The public dashboard does not currently fetch live rows from Google Sheets.

## Source scripts

- `build_task5.mjs` builds the formula-driven workbook and checks formulas before export.
- `export_dashboard_data.py` converts calculated workbook rows to the dashboard JSON format.
- `create_report.py` creates the PDF report.

## Recording note

The assignment's demonstration video should be silent and show a spreadsheet parameter edit, recalculation, dashboard refresh/control changes, and successful PDF generation. The current published Sheet needs its blank start/end dates and moving-average formula errors repaired before it is recorded as working. See the workspace `submission_media/VIDEO_RECORDING_GUIDE.md` for the precise preflight and shot list.
