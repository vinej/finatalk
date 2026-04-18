import PDFDocument from "pdfkit";

type ReportRow = {
  symbol: string;
  quantity: number;
  costBasis: number;
  lastClose: number | null;
  marketValue: number | null;
  costTotal: number;
  unrealizedAbs: number | null;
  unrealizedPct: number | null;
  weight: number | null;
  confidence: "high" | "medium" | "low" | null;
};

type ReportTotals = {
  marketValue: number;
  costTotal: number;
  unrealizedAbs: number;
  unrealizedPct: number | null;
};

export type ReportData = {
  title: string;
  currency: string;
  asOf: string;
  rows: ReportRow[];
  totals: ReportTotals;
  locale: string;
};

function fmtCur(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function fmtPct(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function fmtQty(q: number): string {
  return q.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

const HEADER_BG = "#dbeafe";
const HEADER_FG = "#1e293b";
const ROW_ALT = "#f8fafc";
const GREEN = "#10b981";
const RED = "#ef4444";
const GRAY = "#64748b";
const BORDER = "#e2e8f0";

export function generatePortfolioReport(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 40,
      info: {
        Title: `${data.title} — Portfolio Report`,
        Author: "FinaTalk",
        Subject: "Portfolio Report",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ── Header ───────────────────────────────────────────────────
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text(data.title, { align: "left" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(`Portfolio Report · ${data.currency} · ${data.asOf}`, {
        align: "left",
      });
    doc.moveDown(0.5);
    doc
      .strokeColor(BORDER)
      .lineWidth(1)
      .moveTo(doc.x, doc.y)
      .lineTo(doc.x + pageW, doc.y)
      .stroke();
    doc.moveDown(0.8);

    // ── Summary Cards ────────────────────────────────────────────
    const cardW = pageW / 4;
    const cardY = doc.y;
    const cards = [
      {
        label: "Market Value",
        value: fmtCur(data.totals.marketValue, data.currency),
        color: "#0f172a",
      },
      {
        label: "Cost Basis",
        value: fmtCur(data.totals.costTotal, data.currency),
        color: "#0f172a",
      },
      {
        label: "Unrealized P/L",
        value: fmtCur(data.totals.unrealizedAbs, data.currency),
        color: data.totals.unrealizedAbs >= 0 ? GREEN : RED,
      },
      {
        label: "Return",
        value: fmtPct(data.totals.unrealizedPct),
        color:
          data.totals.unrealizedPct != null && data.totals.unrealizedPct >= 0
            ? GREEN
            : RED,
      },
    ];

    for (let i = 0; i < cards.length; i++) {
      const x = doc.page.margins.left + i * cardW;
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(GRAY)
        .text(cards[i]!.label, x, cardY, { width: cardW - 8 });
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(cards[i]!.color)
        .text(cards[i]!.value, x, cardY + 12, { width: cardW - 8 });
    }

    doc.y = cardY + 36;
    doc.moveDown(1);

    // ── Holdings Table ───────────────────────────────────────────
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text("Holdings", doc.page.margins.left, doc.y, { width: pageW });
    doc.moveDown(0.5);

    const colRatios = [10, 8, 11, 11, 13, 13, 12, 10, 12];
    const ratioSum = colRatios.reduce((a, b) => a + b, 0);
    const cols = [
      { label: "Symbol", align: "left" as const },
      { label: "Qty", align: "right" as const },
      { label: "Avg Cost", align: "right" as const },
      { label: "Last", align: "right" as const },
      { label: "Mkt Value", align: "right" as const },
      { label: "Cost Basis", align: "right" as const },
      { label: "P/L", align: "right" as const },
      { label: "P/L %", align: "right" as const },
      { label: "Weight", align: "right" as const },
    ].map((c, i) => ({ ...c, width: Math.floor((colRatios[i]! / ratioSum) * pageW) }));
    const remainder = pageW - cols.reduce((s, c) => s + c.width, 0);
    cols[cols.length - 1]!.width += remainder;

    const tableX = doc.page.margins.left;
    const rowH = 18;

    function drawHeaderRow(y: number) {
      doc.rect(tableX, y, pageW, rowH).fill(HEADER_BG);
      let cx = tableX + 4;
      for (const col of cols) {
        doc
          .fontSize(7)
          .font("Helvetica-Bold")
          .fillColor(HEADER_FG);
        if (col.align === "right") {
          doc.text(col.label, cx, y + 5, {
            width: col.width - 8,
            align: "right",
          });
        } else {
          doc.text(col.label, cx, y + 5, { width: col.width - 8 });
        }
        cx += col.width;
      }
      return y + rowH;
    }

    function drawDataRow(row: ReportRow, y: number, alt: boolean) {
      if (alt) {
        doc.rect(tableX, y, pageW, rowH).fill(ROW_ALT);
      }
      let cx = tableX + 4;
      const values = [
        row.symbol,
        fmtQty(row.quantity),
        fmtCur(row.costBasis, data.currency),
        row.lastClose != null ? fmtCur(row.lastClose, data.currency) : "—",
        row.marketValue != null ? fmtCur(row.marketValue, data.currency) : "—",
        fmtCur(row.costTotal, data.currency),
        row.unrealizedAbs != null
          ? fmtCur(row.unrealizedAbs, data.currency)
          : "—",
        fmtPct(row.unrealizedPct),
        row.weight != null ? `${row.weight.toFixed(1)}%` : "—",
      ];
      for (let i = 0; i < cols.length; i++) {
        const col = cols[i]!;
        let color = "#0f172a";
        if (i === 6 && row.unrealizedAbs != null) {
          color = row.unrealizedAbs >= 0 ? GREEN : RED;
        }
        if (i === 7 && row.unrealizedPct != null) {
          color = row.unrealizedPct >= 0 ? GREEN : RED;
        }
        doc.fontSize(7).font(i === 0 ? "Helvetica-Bold" : "Helvetica").fillColor(color);
        if (col.align === "right") {
          doc.text(values[i]!, cx, y + 5, {
            width: col.width - 8,
            align: "right",
          });
        } else {
          doc.text(values[i]!, cx, y + 5, { width: col.width - 8 });
        }
        cx += col.width;
      }
      return y + rowH;
    }

    let ty = drawHeaderRow(doc.y);

    for (let i = 0; i < data.rows.length; i++) {
      if (ty + rowH > doc.page.height - doc.page.margins.bottom - 30) {
        doc.addPage();
        ty = drawHeaderRow(doc.page.margins.top);
      }
      ty = drawDataRow(data.rows[i]!, ty, i % 2 === 1);
    }

    // Totals row
    if (ty + rowH > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
      ty = drawHeaderRow(doc.page.margins.top);
    }
    doc.rect(tableX, ty, pageW, rowH).fill("#e2e8f0");
    let cx = tableX + 4;
    const totalValues = [
      "Total",
      "",
      "",
      "",
      fmtCur(data.totals.marketValue, data.currency),
      fmtCur(data.totals.costTotal, data.currency),
      fmtCur(data.totals.unrealizedAbs, data.currency),
      fmtPct(data.totals.unrealizedPct),
      "100%",
    ];
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i]!;
      let color = "#0f172a";
      if (i === 6) color = data.totals.unrealizedAbs >= 0 ? GREEN : RED;
      if (i === 7 && data.totals.unrealizedPct != null)
        color = data.totals.unrealizedPct >= 0 ? GREEN : RED;
      doc.fontSize(7).font("Helvetica-Bold").fillColor(color);
      if (col.align === "right") {
        doc.text(totalValues[i]!, cx, ty + 5, {
          width: col.width - 8,
          align: "right",
        });
      } else {
        doc.text(totalValues[i]!, cx, ty + 5, { width: col.width - 8 });
      }
      cx += col.width;
    }
    ty += rowH;

    // ── Allocation ───────────────────────────────────────────────
    const withValue = data.rows.filter(
      (r) => r.marketValue != null && r.marketValue > 0,
    );
    if (withValue.length > 0) {
      const COLORS = [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
        "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
        "#06b6d4", "#84cc16", "#e11d48", "#7c3aed",
      ];

      const outerR = 55;
      const innerR = 30;
      const donutDiameter = outerR * 2;
      const legendRowH = 15;
      const legendH = withValue.length * legendRowH;
      const sectionH = Math.max(donutDiameter, legendH) + 30;

      let ay = ty + 20;
      if (ay + sectionH > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        ay = doc.page.margins.top;
      }

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#0f172a")
        .text("Allocation", tableX, ay, { width: pageW });
      ay += 22;

      const donutCx = tableX + outerR + 10;
      const donutCy = ay + outerR;
      let angle = -Math.PI / 2;

      for (let i = 0; i < withValue.length; i++) {
        const slice = (withValue[i]!.weight! / 100) * Math.PI * 2;
        if (slice <= 0) continue;
        const endAngle = angle + slice;
        const large = slice > Math.PI ? 1 : 0;

        const ox1 = donutCx + outerR * Math.cos(angle);
        const oy1 = donutCy + outerR * Math.sin(angle);
        const ox2 = donutCx + outerR * Math.cos(endAngle);
        const oy2 = donutCy + outerR * Math.sin(endAngle);
        const ix2 = donutCx + innerR * Math.cos(endAngle);
        const iy2 = donutCy + innerR * Math.sin(endAngle);
        const ix1 = donutCx + innerR * Math.cos(angle);
        const iy1 = donutCy + innerR * Math.sin(angle);

        doc.save();
        doc
          .path(
            `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2}` +
            ` L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`,
          )
          .fill(COLORS[i % COLORS.length]!);
        doc.restore();

        angle = endAngle;
      }

      const legendX = tableX + donutDiameter + 40;
      const legendTop = donutCy - legendH / 2;
      for (let i = 0; i < withValue.length; i++) {
        const r = withValue[i]!;
        const ly = legendTop + i * legendRowH;
        doc.save();
        doc.rect(legendX, ly + 1, 8, 8).fill(COLORS[i % COLORS.length]!);
        doc.restore();
        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("#0f172a");
        const label = `${r.symbol}  ${fmtCur(r.marketValue ?? 0, data.currency)}  (${r.weight!.toFixed(1)}%)`;
        doc.text(label, legendX + 14, ly + 2, { lineBreak: false });
      }

      ay = donutCy + outerR + 10;
      doc.x = tableX;
      doc.y = ay;
    } else {
      doc.x = tableX;
      doc.y = ty + 20;
    }

    // ── Footer ───────────────────────────────────────────────────
    doc.moveDown(1.5);
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        "Generated by FinaTalk. This report is for informational purposes only and does not constitute investment advice.",
        tableX,
        doc.y,
        { width: pageW, align: "center" },
      );

    doc.end();
  });
}
