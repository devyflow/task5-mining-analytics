import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("./outputs/", import.meta.url).pathname.replace(/^\/(.:)/, "$1");
await fs.mkdir(outputDir, { recursive: true });

const wb = Workbook.create();
const dashboard = wb.worksheets.add("Dashboard");
const assumptions = wb.worksheets.add("Assumptions");
const generator = wb.worksheets.add("Generator");
const analysis = wb.worksheets.add("Analysis");

const navy = "#17324D";
const blue = "#2878B5";
const cyan = "#44B3C2";
const gold = "#F2B134";
const pale = "#EAF2F8";
const input = "#FFF2CC";
const red = "#FCE8E6";
const green = "#E2F0D9";
const font = "Arial";

for (const sheet of [dashboard, assumptions, generator, analysis]) {
  sheet.showGridLines = false;
}

// Assumptions and editable controls.
assumptions.getRange("A2").values = [["Mining output generator assumptions"]];
assumptions.mergeCells("A2:H2");
assumptions.getRange("A2:H2").format = { font: { name: font, size: 15, bold: true, color: navy } };
assumptions.getRange("A4:B12").values = [
  ["Global setting", "Editable value"],
  ["Start date", new Date("2026-01-01T00:00:00Z")],
  ["End date", new Date("2026-12-31T00:00:00Z")],
  ["Mine count", 5],
  ["Selected mine", "Acheron Prime"],
  ["Chart type", "Line"],
  ["Trendline degree", 2],
  ["IQR multiplier", 1.5],
  ["Z-score threshold", 3],
];
assumptions.getRange("D4:J12").values = [
  ["Mine", "Active", "Mean t/day", "Std dev", "Minimum", "Maximum", "Trend / month"],
  ["Acheron Prime", 1, 1120, 115, 760, 1540, 0.002],
  ["LV-426 North", 1, 930, 95, 620, 1300, -0.001],
  ["Nostromo Deep", 1, 1260, 145, 820, 1740, 0.003],
  ["Hadley's Hope", 1, 845, 80, 590, 1140, 0.001],
  ["Yutani Ridge", 1, 1050, 125, 700, 1480, 0.0025],
  ["Reserve 6", 0, 900, 100, 600, 1300, 0],
  ["Reserve 7", 0, 900, 100, 600, 1300, 0],
  ["Reserve 8", 0, 900, 100, 600, 1300, 0],
];
assumptions.getRange("L4:M11").values = [
  ["Weekday", "Output factor"],
  ["Monday", 1.03], ["Tuesday", 1.02], ["Wednesday", 1.01], ["Thursday", 1.00],
  ["Friday", 0.98], ["Saturday", 0.91], ["Sunday", 0.87],
];
assumptions.getRange("O4:S10").values = [
  ["Event", "Mine", "Start", "End", "Output impact"],
  ["Scheduled overhaul", "Acheron Prime", new Date("2026-02-12T00:00:00Z"), new Date("2026-02-18T00:00:00Z"), -0.35],
  ["Ore seam boost", "LV-426 North", new Date("2026-03-10T00:00:00Z"), new Date("2026-03-25T00:00:00Z"), 0.18],
  ["Power interruption", "Nostromo Deep", new Date("2026-05-03T00:00:00Z"), new Date("2026-05-06T00:00:00Z"), -0.55],
  ["Crew rotation", "Hadley's Hope", new Date("2026-07-01T00:00:00Z"), new Date("2026-07-09T00:00:00Z"), -0.12],
  ["Equipment upgrade", "Yutani Ridge", new Date("2026-08-15T00:00:00Z"), new Date("2026-09-10T00:00:00Z"), 0.22],
  ["Storm shutdown", "Acheron Prime", new Date("2026-11-21T00:00:00Z"), new Date("2026-11-23T00:00:00Z"), -0.8],
];
assumptions.getRange("A14:B16").values = [
  ["Generator setting", "Editable value"],
  ["Smoothing alpha", 0.35],
  ["Random seed note", "Use Formulas > Calculate Now to regenerate RAND-based output"],
];

for (const range of ["A4:B4", "D4:J4", "L4:M4", "O4:S4", "A14:B14"]) {
  assumptions.getRange(range).format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" }, verticalAlignment: "center" };
}
for (const range of ["B5:B12", "E5:J12", "M5:M11", "P5:S10", "B15:B16"]) assumptions.getRange(range).format.fill = input;
assumptions.getRange("B5:B6").format.numberFormat = "yyyy-mm-dd";
assumptions.getRange("Q5:R10").format.numberFormat = "yyyy-mm-dd";
assumptions.getRange("J5:J12").format.numberFormat = "0.00%";
assumptions.getRange("M5:M11").format.numberFormat = "0.00";
assumptions.getRange("S5:S10").format.numberFormat = "0%";
assumptions.getRange("B15").format.numberFormat = "0.00";
assumptions.getRange("B8").dataValidation = { rule: { type: "list", formula1: "Assumptions!$D$5:$D$12" } };
assumptions.getRange("B9").dataValidation = { rule: { type: "list", values: ["Line", "Bar", "Stacked"] } };
assumptions.getRange("B10").dataValidation = { rule: { type: "whole", operator: "between", formula1: 1, formula2: 4 } };
assumptions.freezePanes.freezeRows(4);
assumptions.getRange("A:S").format.autofitColumns();
assumptions.getRange("A:A").format.columnWidth = 22;
assumptions.getRange("B:B").format.columnWidth = 34;
assumptions.getRange("O:O").format.columnWidth = 24;

// Formula-driven daily generator, sized for one year and five active mines.
generator.getRange("A1:M1").values = [["Date", "Mine", "Mean", "Std dev", "Day factor", "Smoothing", "Raw output", "Output tonnes", "7-day moving avg", "Event factor", "Trend factor", "Event name", "Active row"]];
generator.getRange("A1:M1").format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" }, verticalAlignment: "center" };
const lastRow = 1826;
generator.getRange("A2").formulas = [["=IF(Assumptions!$B$5+INT((ROW()-2)/Assumptions!$B$7)>Assumptions!$B$6,\"\",Assumptions!$B$5+INT((ROW()-2)/Assumptions!$B$7))"]];
generator.getRange(`A2:A${lastRow}`).fillDown();
generator.getRange("B2").formulas = [["=IF($A2=\"\",\"\",INDEX(Assumptions!$D$5:$D$12,MOD(ROW()-2,Assumptions!$B$7)+1))"]];
generator.getRange(`B2:B${lastRow}`).fillDown();
generator.getRange("C2").formulas = [["=IF($A2=\"\",\"\",INDEX(Assumptions!$F$5:$F$12,MATCH($B2,Assumptions!$D$5:$D$12,0)))"]];
generator.getRange(`C2:C${lastRow}`).fillDown();
generator.getRange("D2").formulas = [["=IF($A2=\"\",\"\",INDEX(Assumptions!$G$5:$G$12,MATCH($B2,Assumptions!$D$5:$D$12,0)))"]];
generator.getRange(`D2:D${lastRow}`).fillDown();
generator.getRange("E2").formulas = [["=IF($A2=\"\",\"\",INDEX(Assumptions!$M$5:$M$11,WEEKDAY($A2,2)))"]];
generator.getRange(`E2:E${lastRow}`).fillDown();
generator.getRange("F2").formulas = [["=IF($A2=\"\",\"\",Assumptions!$B$15)"]];
generator.getRange(`F2:F${lastRow}`).fillDown();
generator.getRange("J2").formulas = [["=IF($A2=\"\",\"\",1+SUMIFS(Assumptions!$S$5:$S$10,Assumptions!$P$5:$P$10,$B2,Assumptions!$Q$5:$Q$10,\"<=\"&$A2,Assumptions!$R$5:$R$10,\">=\"&$A2))"]];
generator.getRange(`J2:J${lastRow}`).fillDown();
generator.getRange("K2").formulas = [["=IF($A2=\"\",\"\",1+((($A2-Assumptions!$B$5)/30)*INDEX(Assumptions!$J$5:$J$12,MATCH($B2,Assumptions!$D$5:$D$12,0))))"]];
generator.getRange(`K2:K${lastRow}`).fillDown();
generator.getRange("G2").formulas = [["=IF($A2=\"\",\"\",MAX(INDEX(Assumptions!$H$5:$H$12,MATCH($B2,Assumptions!$D$5:$D$12,0)),MIN(INDEX(Assumptions!$I$5:$I$12,MATCH($B2,Assumptions!$D$5:$D$12,0)),($C2+$D2*SQRT(-2*LN(RAND()))*COS(2*PI()*RAND()))*$E2*$J2*$K2)))"]];
generator.getRange(`G2:G${lastRow}`).fillDown();
generator.getRange("H2").formulas = [["=IF($A2=\"\",\"\",$G2*$F2+$C2*(1-$F2))"]];
generator.getRange(`H2:H${lastRow}`).fillDown();
generator.getRange("I2").formulas = [["=IF($A2=\"\",\"\",AVERAGE($H2,IFERROR(INDEX($H:$H,ROW()-Assumptions!$B$7),\"\"),IFERROR(INDEX($H:$H,ROW()-2*Assumptions!$B$7),\"\"),IFERROR(INDEX($H:$H,ROW()-3*Assumptions!$B$7),\"\"),IFERROR(INDEX($H:$H,ROW()-4*Assumptions!$B$7),\"\"),IFERROR(INDEX($H:$H,ROW()-5*Assumptions!$B$7),\"\"),IFERROR(INDEX($H:$H,ROW()-6*Assumptions!$B$7),\"\")))"]];
generator.getRange(`I2:I${lastRow}`).fillDown();
generator.getRange("L2").formulas = [["=IF($A2=\"\",\"\",IFERROR(INDEX(Assumptions!$O$5:$O$10,MATCH(1,(Assumptions!$P$5:$P$10=$B2)*(Assumptions!$Q$5:$Q$10<=$A2)*(Assumptions!$R$5:$R$10>=$A2),0)),\"\"))"]];
generator.getRange(`L2:L${lastRow}`).fillDown();
generator.getRange("M2").formulas = [["=--($A2<>\"\")"]];
generator.getRange(`M2:M${lastRow}`).fillDown();
generator.getRange(`A2:A${lastRow}`).format.numberFormat = "yyyy-mm-dd";
generator.getRange(`C2:K${lastRow}`).format.numberFormat = "#,##0.0";
generator.getRange(`J2:K${lastRow}`).format.numberFormat = "0.000";
generator.freezePanes.freezeRows(1);
generator.getRange("A:M").format.autofitColumns();
generator.getRange("B:B").format.columnWidth = 22;
generator.getRange("L:L").format.columnWidth = 24;
generator.getRange(`H2:H${lastRow}`).conditionalFormats.add("colorScale", { colors: ["#FEE2E2", "#FEF3C7", "#DCFCE7"], thresholds: ["min", { type: "percentile", value: 50 }, "max"] });

// Per-mine statistical analysis and four anomaly tests.
analysis.getRange("A2").values = [["Mine analytics"]];
analysis.mergeCells("A2:N2");
analysis.getRange("A2:N2").format = { font: { name: font, size: 15, bold: true, color: navy } };
analysis.getRange("A4:N4").values = [["Mine", "Observations", "Mean", "Std dev", "Median", "Q1", "Q3", "IQR", "IQR anomalies", "Z-score anomalies", "MA-distance anomalies", "Grubbs G", "Grubbs critical (.05 approx)", "Grubbs result"]];
analysis.getRange("A4:N4").format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" } };
analysis.getRange("A5:A12").formulas = Array.from({length: 8}, (_, i) => [`=Assumptions!D${i+5}`]);
analysis.getRange("B5").formulas = [["=COUNTIF(Generator!$B$2:$B$1826,$A5)"]];
analysis.getRange("B5:B12").fillDown();
analysis.getRange("C5").formulas = [["=IFERROR(AVERAGEIF(Generator!$B$2:$B$1826,$A5,Generator!$H$2:$H$1826),\"\")"]];
analysis.getRange("C5:C12").fillDown();
analysis.getRange("D5").formulas = [["=IFERROR(STDEV.S(FILTER(Generator!$H$2:$H$1826,Generator!$B$2:$B$1826=$A5)),\"\")"]];
analysis.getRange("D5:D12").fillDown();
analysis.getRange("E5").formulas = [["=IFERROR(MEDIAN(FILTER(Generator!$H$2:$H$1826,Generator!$B$2:$B$1826=$A5)),\"\")"]];
analysis.getRange("E5:E12").fillDown();
analysis.getRange("F5").formulas = [["=IFERROR(QUARTILE.INC(FILTER(Generator!$H$2:$H$1826,Generator!$B$2:$B$1826=$A5),1),\"\")"]];
analysis.getRange("F5:F12").fillDown();
analysis.getRange("G5").formulas = [["=IFERROR(QUARTILE.INC(FILTER(Generator!$H$2:$H$1826,Generator!$B$2:$B$1826=$A5),3),\"\")"]];
analysis.getRange("G5:G12").fillDown();
analysis.getRange("H5").formulas = [["=IF(OR(F5=\"\",G5=\"\"),\"\",G5-F5)"]];
analysis.getRange("H5:H12").fillDown();
analysis.getRange("I5").formulas = [["=IFERROR(SUMPRODUCT((Generator!$B$2:$B$1826=$A5)*((Generator!$H$2:$H$1826<$F5-Assumptions!$B$11*$H5)+(Generator!$H$2:$H$1826>$G5+Assumptions!$B$11*$H5))),0)"]];
analysis.getRange("I5:I12").fillDown();
analysis.getRange("J5").formulas = [["=IFERROR(SUMPRODUCT((Generator!$B$2:$B$1826=$A5)*(ABS(Generator!$H$2:$H$1826-$C5)>Assumptions!$B$12*$D5)),0)"]];
analysis.getRange("J5:J12").fillDown();
analysis.getRange("K5").formulas = [["=IFERROR(SUMPRODUCT((Generator!$B$2:$B$1826=$A5)*(ABS(Generator!$H$2:$H$1826-Generator!$I$2:$I$1826)>Assumptions!$B$12*$D5)),0)"]];
analysis.getRange("K5:K12").fillDown();
analysis.getRange("L5").formulas = [["=IFERROR(MAX(ABS(FILTER(Generator!$H$2:$H$1826,Generator!$B$2:$B$1826=$A5)-$C5))/$D5,\"\")"]];
analysis.getRange("L5:L12").fillDown();
analysis.getRange("M5").formulas = [["=IF(B5<3,\"\",3.5+0.04*LN(B5))"]];
analysis.getRange("M5:M12").fillDown();
analysis.getRange("N5").formulas = [["=IF(OR(L5=\"\",M5=\"\"),\"\",IF(L5>M5,\"Outlier detected\",\"No Grubbs outlier\"))"]];
analysis.getRange("N5:N12").fillDown();
analysis.getRange("C5:H12").format.numberFormat = "#,##0.0";
analysis.getRange("L5:M12").format.numberFormat = "0.000";
analysis.getRange("N5:N12").conditionalFormats.add("containsText", { text: "Outlier detected", format: { fill: red, font: { bold: true, color: "#B91C1C" } } });
analysis.getRange("A:N").format.autofitColumns();
analysis.getRange("A:A").format.columnWidth = 22;
analysis.getRange("N:N").format.columnWidth = 22;
analysis.freezePanes.freezeRows(4);

// Dashboard with formula-linked KPIs and chart helper ranges.
dashboard.getRange("A2").values = [["Weyland-Yutani mine output dashboard"]];
dashboard.mergeCells("A2:F2");
dashboard.getRange("A2:M2").format = { font: { name: font, size: 16, bold: true, color: navy } };
dashboard.getRange("A3").values = [["Formula-driven synthetic production, anomaly detection and trend review"]];
dashboard.mergeCells("A3:F3");
dashboard.getRange("A3:M3").format.font = { name: font, italic: true, color: "#5D6D7E" };
dashboard.getRange("A5:B8").values = [["Control", "Selection"], ["Selected mine", ""], ["Chart type", ""], ["Polynomial degree", ""]];
dashboard.getRange("B6:B8").formulas = [["=Assumptions!B8"], ["=Assumptions!B9"], ["=Assumptions!B10"]];
dashboard.getRange("A5:B5").format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" } };
dashboard.getRange("B6:B8").format = { fill: input, font: { name: font, bold: true, color: navy } };
dashboard.getRange("D5:K5").values = [["Mean", "Std dev", "Median", "IQR", "IQR flags", "Z flags", "MA flags", "Grubbs"]];
dashboard.getRange("D5:K5").format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" } };
dashboard.getRange("D6").formulas = [["=INDEX(Analysis!$C$5:$C$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("E6").formulas = [["=INDEX(Analysis!$D$5:$D$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("F6").formulas = [["=INDEX(Analysis!$E$5:$E$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("G6").formulas = [["=INDEX(Analysis!$H$5:$H$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("H6").formulas = [["=INDEX(Analysis!$I$5:$I$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("I6").formulas = [["=INDEX(Analysis!$J$5:$J$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("J6").formulas = [["=INDEX(Analysis!$K$5:$K$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("K6").formulas = [["=INDEX(Analysis!$N$5:$N$12,MATCH($B$6,Analysis!$A$5:$A$12,0))"]];
dashboard.getRange("D6:G6").format = { fill: pale, font: { name: font, size: 12, bold: true, color: navy }, numberFormat: "#,##0.0" };
dashboard.getRange("H6:J6").format = { fill: "#FFF7E6", font: { name: font, size: 12, bold: true, color: "#8A4B08" }, numberFormat: "#,##0" };
dashboard.getRange("K6").format = { fill: green, font: { name: font, bold: true, color: "#275D38" } };

dashboard.getRange("A11:C11").values = [["Date", "Output", "7-day moving average"]];
dashboard.getRange("A11:C11").format = { fill: navy, font: { name: font, bold: true, color: "#FFFFFF" } };
dashboard.getRange("A12").formulas = [["=IFERROR(FILTER(Generator!$A$2:$A$1826,Generator!$B$2:$B$1826=$B$6),\"\")"]];
dashboard.getRange("B12").formulas = [["=IFERROR(FILTER(Generator!$H$2:$H$1826,Generator!$B$2:$B$1826=$B$6),\"\")"]];
dashboard.getRange("C12").formulas = [["=IFERROR(FILTER(Generator!$I$2:$I$1826,Generator!$B$2:$B$1826=$B$6),\"\")"]];
dashboard.getRange("A12:A376").format.numberFormat = "yyyy-mm-dd";
dashboard.getRange("B12:C376").format.numberFormat = "#,##0.0";
dashboard.getRange("A11:C376").format.borders = { preset: "outside", style: "thin", color: "#CAD5E0" };

dashboard.getRange("T1:V1").values = [["Chart date", "Output", "Moving average"]];
dashboard.getRange("T2").formulas = [["=IFERROR(INDEX(Generator!$A$2:$A$1826,(ROW()-2)*Assumptions!$B$7+MATCH($B$6,Assumptions!$D$5:$D$12,0)),\"\")"]];
dashboard.getRange("T2:T366").fillDown();
dashboard.getRange("U2").formulas = [["=IFERROR(INDEX(Generator!$H$2:$H$1826,(ROW()-2)*Assumptions!$B$7+MATCH($B$6,Assumptions!$D$5:$D$12,0)),\"\")"]];
dashboard.getRange("U2:U366").fillDown();
dashboard.getRange("V2").formulas = [["=IFERROR(INDEX(Generator!$I$2:$I$1826,(ROW()-2)*Assumptions!$B$7+MATCH($B$6,Assumptions!$D$5:$D$12,0)),\"\")"]];
dashboard.getRange("V2:V366").fillDown();
dashboard.getRange("T2:T366").format.numberFormat = "yyyy-mm-dd";
dashboard.getRange("U2:V366").format.numberFormat = "#,##0.0";
dashboard.getRange("X1:AA1").values = [["Mine", "IQR flags", "Z-score flags", "MA-distance flags"]];
dashboard.getRange("X2").formulas = [["=Analysis!A5"]];
dashboard.getRange("X2:X6").fillDown();
dashboard.getRange("Y2").formulas = [["=Analysis!I5"]];
dashboard.getRange("Y2:Y6").fillDown();
dashboard.getRange("Z2").formulas = [["=Analysis!J5"]];
dashboard.getRange("Z2:Z6").fillDown();
dashboard.getRange("AA2").formulas = [["=Analysis!K5"]];
dashboard.getRange("AA2:AA6").fillDown();

const line = dashboard.charts.add("line", dashboard.getRange("T1:V366"));
line.title = "Daily output and moving average (tonnes)";
line.hasLegend = true;
line.setPosition("H10", "Q26");
line.xAxis = { axisType: "dateAxis", numberFormatCode: "mmm", numberFormatSourceLinked: false, textStyle: { typeface: font } };
line.yAxis = { numberFormatCode: "#,##0", numberFormatSourceLinked: false, textStyle: { typeface: font } };
line.series.getItemAt(0).trendlines.add("polynomial", { polynomialOrder: 2 });
const bar = dashboard.charts.add("column", analysis.getRange("A4:D9"));
bar.title = "Mean and variability by mine";
bar.hasLegend = true;
bar.setPosition("H28", "Q44");
const stacked = dashboard.charts.add("columnStacked", dashboard.getRange("X1:AA6"));
stacked.title = "Anomaly flags by mine";
stacked.hasLegend = true;
stacked.setPosition("H46", "Q62");

dashboard.getRange("A1:Q65").format.verticalAlignment = "center";
dashboard.getRange("A2:Q2").format.rowHeight = 26;
dashboard.getRange("A3:Q3").format.rowHeight = 20;
dashboard.getRange("A:F").format.autofitColumns();
dashboard.getRange("A:A").format.columnWidth = 14;
dashboard.getRange("B:B").format.columnWidth = 20;
dashboard.getRange("C:F").format.columnWidth = 18;
dashboard.freezePanes.freezeRows(5);
dashboard.tabColor = navy;
assumptions.tabColor = gold;
generator.tabColor = blue;
analysis.tabColor = cyan;

wb.recalculate();

const check = await wb.inspect({ kind: "table", range: "Dashboard!A2:K12", include: "values,formulas", tableMaxRows: 12, tableMaxCols: 12 });
console.log(check.ndjson);
for (const [sheetId, range] of [["Dashboard", "A1:Q65"], ["Assumptions", "A1:S16"], ["Generator", "A1:M120"], ["Analysis", "A1:N12"]]) {
  const errors = await wb.inspect({ kind: "match", sheetId, range, searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 30 }, summary: `${sheetId} formula error scan` });
  console.log(errors.ndjson);
}

for (const [sheetName, range] of [["Dashboard", "A1:Q65"], ["Assumptions", "A1:S16"], ["Generator", "A1:M40"], ["Analysis", "A1:N12"]]) {
  const preview = await wb.render({ sheetName, range, scale: sheetName === "Dashboard" ? 1 : 0.8, format: "png" });
  await fs.writeFile(`${outputDir}/${sheetName.toLowerCase()}-preview.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(`${outputDir}/weyland-yutani-mine-analytics.xlsx`);
console.log(`Saved ${outputDir}/weyland-yutani-mine-analytics.xlsx`);
