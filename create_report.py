from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output" / "pdf"
OUTPUT.mkdir(parents=True, exist_ok=True)
TARGET = OUTPUT / "weyland-yutani-mine-analytics-report.pdf"

NAVY = colors.HexColor("#17324D")
BLUE = colors.HexColor("#2878B5")
GOLD = colors.HexColor("#F2B134")
PALE = colors.HexColor("#EAF2F8")
TEXT = colors.HexColor("#243342")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="ReportTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=NAVY, alignment=TA_LEFT, spaceAfter=4))
styles.add(ParagraphStyle(name="Deck", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=10, leading=14, textColor=colors.HexColor("#5D6D7E"), spaceAfter=10))
styles.add(ParagraphStyle(name="Section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=NAVY, spaceBefore=4, spaceAfter=7))
styles.add(ParagraphStyle(name="BodySmall", parent=styles["BodyText"], fontName="Helvetica", fontSize=9, leading=13, textColor=TEXT))
styles.add(ParagraphStyle(name="Foot", parent=styles["Normal"], fontName="Helvetica", fontSize=7.5, textColor=colors.HexColor("#6B7785")))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D7DEE5"))
    canvas.line(16 * mm, 10 * mm, landscape(A4)[0] - 16 * mm, 10 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#6B7785"))
    canvas.drawString(16 * mm, 6 * mm, "Weyland-Yutani Mining Analytics | Devyanshu Agrawal")
    canvas.drawRightString(landscape(A4)[0] - 16 * mm, 6 * mm, f"Page {doc.page}")
    canvas.restoreState()


doc = SimpleDocTemplate(
    str(TARGET),
    pagesize=landscape(A4),
    rightMargin=16 * mm,
    leftMargin=16 * mm,
    topMargin=12 * mm,
    bottomMargin=14 * mm,
    title="Weyland-Yutani Mine Analytics Report",
    author="Devyanshu Agrawal",
)

story = [
    Paragraph("Weyland-Yutani mine output analytics", styles["ReportTitle"]),
    Paragraph("Formula-driven synthetic production, configurable scenarios, anomaly detection and operational trend review", styles["Deck"]),
]

cards = [
    [Paragraph("5", styles["Section"]), Paragraph("365", styles["Section"]), Paragraph("6", styles["Section"]), Paragraph("4", styles["Section"])],
    [Paragraph("active mines", styles["BodySmall"]), Paragraph("daily periods", styles["BodySmall"]), Paragraph("event scenarios", styles["BodySmall"]), Paragraph("anomaly methods", styles["BodySmall"])],
]
card_table = Table(cards, colWidths=[62 * mm] * 4, rowHeights=[11 * mm, 8 * mm])
card_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), PALE),
    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CAD5E0")),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.white),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]))
dashboard_path = ROOT / "outputs" / "dashboard-preview.png"
dashboard = Image(str(dashboard_path), width=220 * mm, height=179 * mm)
story.extend([
    card_table,
    Spacer(1, 8 * mm),
    Paragraph("This report accompanies an editable workbook that generates one year of daily production for five mines. It combines configurable distributions, calendar factors, trend, smoothing and six operational events with a dashboard and four independent anomaly checks.", styles["BodySmall"]),
    PageBreak(),
    dashboard,
    PageBreak(),
])

story.extend([
    Paragraph("Model design and controls", styles["ReportTitle"]),
    Paragraph("The workbook keeps editable assumptions separate from generated data and analysis. Yellow cells are intended for user input; output, chart, and statistical cells are formula-driven.", styles["Deck"]),
])

methods = [
    ["Capability", "Implementation"],
    ["Distribution", "Uniform bounds plus Box-Muller normal variation using RAND(), mean and standard deviation."],
    ["Smoothing", "Editable alpha blends each random observation toward the mine's configured operating mean."],
    ["Calendar effects", "Monday-Sunday factors alter output while preserving the underlying mine distribution."],
    ["Events", "Six mine-specific date windows add positive or negative output impacts."],
    ["Trend", "Per-mine monthly trend factors accumulate across the selected date range."],
    ["Anomalies", "IQR fences, absolute z-score, distance from seven-day moving average, and a Grubbs G comparison."],
    ["Charts", "Daily line/moving-average chart, mine comparison bars, stacked anomaly counts, and a polynomial chart trendline."],
]
methods_table = Table(methods, colWidths=[45 * mm, 205 * mm], repeatRows=1)
methods_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
    ("LEADING", (0, 0), (-1, -1), 11),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F9FB")]),
    ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D7DEE5")),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story.extend([methods_table, Spacer(1, 6 * mm)])

assumptions_path = ROOT / "outputs" / "assumptions-preview.png"
assumptions_img = Image(str(assumptions_path), width=258 * mm, height=49 * mm)
story.extend([
    KeepTogether([Paragraph("Editable assumptions", styles["Section"]), assumptions_img]),
    Spacer(1, 5 * mm),
    Paragraph("Interpretation note", styles["Section"]),
    Paragraph("The workbook is synthetic by design. Recalculation regenerates RAND-based observations, so exact values and anomaly counts change while the configured distributions, event effects and formula logic remain stable. The Grubbs critical value uses a transparent sample-size approximation for the 0.05 level to maintain compatibility across Excel and Google Sheets.", styles["BodySmall"]),
])

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(TARGET)
