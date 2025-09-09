// app/api/trf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { format } from "date-fns";
import { layerData } from "@/types/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   Hard-coded export policy
   ========================= */
const REL_VERSION = "02.11";
const COMPANY_NAME = "ABNOOS JAM KARAJ";

// Which export kinds get the size bump
const ENABLE_BUMP_FOR_KINDS = new Set<ExportKind>(["NORMAL", "WATERJET"]);
// AddDimension (mm) like Delphi's EdtAddDimention
const ADD_DIMENSION_MM = 1;
// Standard sheet sizes (mm) — Delphi whitelist
const STANDARD_SIZES = new Set([
  1100, 1125, 1250, 1605, 1800, 1900, 2000, 2100, 2200, 2250, 2400, 2500, 2600,
  3000, 3180, 3195, 3200, 3210,
]);
// Delphi-like color names indexed by weekday (1..7); we also use a couple of fixed codes
const DAY_COLOR_ARRAY = [
  "", // 0 (unused)
  "SATURDAY", // 1
  "SUNDAY", // 2
  "MONDAY", // 3
  "TUESDAY", // 4
  "WEDNESDAY", // 5
  "THURSDAY", // 6
  "FRIDAY", // 7
];

type ExportKind =
  | "NORMAL"
  | "OLGOO"
  | "PISHS"
  | "OJRATI"
  | "WATERJET"
  | "AUTOCAD"
  | "WATERJET_OLGOO";

/* =========================
   Route
   ========================= */
export async function POST(req: NextRequest) {
  try {
    const { selectedLayers } = await req.json();
    console.log(`🔧 TRF Generator: Received ${selectedLayers || 0} layers`);

    if (!Array.isArray(selectedLayers) || selectedLayers.length === 0) {
      console.log("❌ TRF Generator: No valid layers provided");
      return NextResponse.json(
        { error: "No layers provided or invalid data format" },
        { status: 400 }
      );
    }

    // filename like Delphi (single file)
    const ts = format(new Date(), "yyyyMMdd-HHmmss-SSS");
    const fileName = `LISEC-${ts}.TRF`;

    const dirPath = path.join(process.cwd(), "public", "trf-files");
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);

    console.log(
      `📝 TRF Generator: Generating content for ${selectedLayers.length} layers`
    );
    const trfContent = generateTrfContent(selectedLayers as layerData[]);
    console.log(
      `💾 TRF Generator: Writing ${trfContent.length} chars to ${fileName}`
    );

    await fs.writeFile(filePath, trfContent, "utf8");

    // simple log (append)
    try {
      const logsDir = path.join(process.cwd(), "logs");
      await fs.mkdir(logsDir, { recursive: true });
      const logLine =
        JSON.stringify({
          at: new Date().toISOString(),
          fileName,
          count: selectedLayers.length,
        }) + "\n";
      await fs.appendFile(
        path.join(logsDir, "trf-generation.log"),
        logLine,
        "utf8"
      );
    } catch (e) {
      console.error("log append failed", e);
    }

    return NextResponse.json(
      {
        success: true,
        message: "TRF file generated successfully",
        fileName,
        downloadUrl: `/trf-files/${fileName}`,
        layersProcessed: selectedLayers.length,
        generatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating TRF file:", error);
    return NextResponse.json(
      { error: "Failed to generate TRF file" },
      { status: 500 }
    );
  }
}

/* =========================
   TRF generator (Delphi-like)
   ========================= */
function generateTrfContent(layers: layerData[]): string {
  console.log(`🏭 TRF Content: Processing ${layers.length} layers`);
  let content = "";

  // REL
  content += `<REL> ${REL_VERSION}\r\n`;
  console.log(`📋 TRF Content: Added REL header`);

  // group by "order" (invoice). We avoid Mongo ObjectIds in output; for grouping only we can use them.
  const groups = groupByInvoice(layers);
  console.log(
    `📦 TRF Content: Grouped into ${Object.keys(groups).length} orders:`,
    Object.keys(groups)
  );

  Object.values(groups).forEach((orderLayers, groupIndex) => {
    console.log(
      `\n🎯 Processing Order ${groupIndex + 1}/${
        Object.keys(groups).length
      } with ${orderLayers.length} layers`
    );

    // sort deterministically by productionCode (or createdAt if present)
    orderLayers.sort((a, b) =>
      safeStr(a.productionCode).localeCompare(safeStr(b.productionCode))
    );

    const first = orderLayers[0];
    console.log(`📊 First layer data:`, {
      productionCode: first?.productionCode,
      invoice: first?.invoice
        ? { code: first.invoice.code, _id: first.invoice._id }
        : "none",
      designNumber: first?.designNumber,
      customer: first?.invoice?.customer
        ? {
            name: first.invoice.customer.name,
            code: first.invoice.customer.code,
          }
        : "none",
    });

    // ---- Build <ORD> line (Delphi-style with what we have) ----
    // ORDER number: try invoice.code, else designNumber, else a readable prefix of productionCode
    const ordNo = safeStr(first?.productionCode);
    // CUST_NUM / CUST_NAME (fallbacks, since we only have productLayer)
    const custNum = safeStr(first?.invoice?.customer) || "CUST001";
    const custName =
      safeStr(first?.invoice?.customer?.englishName) ||
      safeStr(first?.invoice?.customer?.name) ||
      "Unknown";

    // TEXT1 (Delphi used MapNo); we’ll use a stable order token
    const text1 = safeStr(first?.designNumber?.code);

    // TEXT2: WATERJET / OJRATI derived from treatments on any layer in this order
    const hasWaterjet = orderLayers.some(hasTreatmentCode("WATERJET"));
    const hasOjrati = orderLayers.some(hasTreatmentCode("OJRATI"));
    const text2 = hasWaterjet ? "WATERJET" : hasOjrati ? "OJRATI" : "";

    // TEXT3..TEXT5 empty
    const text3 = "";
    const text4 = "";
    const text5 = "";

    // PRD/DEL dates: Delphi uses color-id-based month. We derive weekday from productionDate.
    const baseDate = toDate(first?.productionDate) ?? new Date();
    const { colorId, colorName } = weekdayColor(baseDate); // colorId: '01'..'07', colorName from DAY_COLOR_ARRAY
    const prdDate = `${colorId}/01/2009`; // Delphi-compatible synthetic date
    const delDate = `${colorId}/01/2009`;

    // DEL_AREA = color name (Delphi puts aColor)
    const delArea = colorName;

    content += `<ORD> ${padRight(ordNo, 10)} ${padRight(
      custNum,
      10
    )} ${padRight(custName, 40)} ${padRight(text1, 40)} ${padRight(
      text2,
      40
    )} ${padRight(text3, 40)} ${padRight(text4, 40)} ${padRight(
      text5,
      40
    )} ${padRight(prdDate, 10)} ${padRight(delDate, 10)} ${padRight(
      delArea,
      40
    )}\r\n`;

    // ---- POS/TXT/SHP/GL1 per layer ----
    orderLayers.forEach((layer, idx) => {
      const itemNum = String(idx + 1);

      // ID_NUM: Delphi used EAbbreviate + last two of ImPrepareDate.
      // We’ll use glass code abbrev + last two digits of year from productionDate.

      const idNum = safeStr(layer.glass?.code) || "ID";

      // QTY: not present on ProductLayer; default 1
      const qty = String((layer as any).qty ?? 1);

      // Determine "kind" to decide bump rule
      const kind: ExportKind = hasTreatmentCode("WATERJET")(layer)
        ? "WATERJET"
        : hasTreatmentCode("OJRATI")(layer)
        ? "OJRATI"
        : "NORMAL";

      // WIDTH/HEIGHT: bump if not in standard sizes and kind is in ENABLE_BUMP_FOR_KINDS; then ×10
      const width10 = adjustDimToN10(kind, num(layer.width));
      const height10 = adjustDimToN10(kind, num(layer.height));

      // GLASS1: optimizer code – we’ll use glass.code, else thickness as string
      const glass1 = safeStr(layer.glass?.thickness) || "110";

      // POS
      content += `<POS> ${padRight(itemNum, 5)} ${padRight(
        idNum,
        8
      )} 0000 ${padRight(qty, 5)} ${padRight(width10, 5)} ${padRight(
        height10,
        5
      )} ${padRight(
        glass1,
        5
      )}                     000 00 00 00 0 0 00000 0\r\n`;

      // TXT — keep Delphi’s pattern: t1 = itemNum-productionCode, t2 empty, t3 company, t7 productionCode
      const t1 = `${itemNum}-${safeStr(layer.productionCode)}`;
      const t2 = ""; // no LabelCharacter on ProductLayer
      const t3 = COMPANY_NAME;
      const t4 = "";
      const t5 = "";
      const t6 = "";
      const t7 = safeStr(layer.productionCode);
      const t8 = "";
      const t9 = "";
      const t10 = "";

      content += `<TXT> ${padRight(t1, 40)} ${padRight(t2, 40)} ${padRight(
        t3,
        40
      )} ${padRight(t4, 40)} ${padRight(t5, 40)} ${padRight(t6, 40)} ${padRight(
        t7,
        40
      )} ${padRight(t8, 40)} ${padRight(t9, 40)} ${padRight(t10, 40)}\r\n`;

      // SHP if we have a designNumber
      if (layer.designNumber) {
        content += `<SHP> ${padRight(itemNum, 5)} ${padRight(
          width10,
          5
        )} ${padRight(height10, 5)} 0\r\n`;
      }

      // GL1 if we have glass details (name + thickness like Delphi)
      if (layer.glass) {
        const glassName = safeStr(layer.glass.name) || "FLOAT";
        const thickness = safeStr(layer.glass.thickness) || "10";
        content += `<GL1> ${padRight(glassName, 20)} ${padRight(
          thickness,
          5
        )} 0\r\n`;
      }
    });
  });

  return content;
}

/* =========================
   Helpers
   ========================= */

function groupByInvoice(layers: layerData[]): Record<string, layerData[]> {
  console.log(`🔄 Grouping ${layers.length} layers by invoice...`);
  const groups: Record<string, layerData[]> = {};

  for (const layer of layers) {
    // Prefer a human code if present, otherwise fall back to invoice _id safely for grouping only
    const key =
      safeStr((layer as any).invoice?.code) ||
      safeStr((layer as any).invoice?._id) ||
      // final fallback: cluster by product or productionDate
      `grp-${safeStr(layer.product?._id || layer.product) || ""}-${format(
        toDate(layer.productionDate) ?? new Date(),
        "yyyyMMdd"
      )}`;

    console.log(`  📌 Layer ${layer.productionCode} → Group: ${key}`);
    (groups[key] ||= []).push(layer);
  }

  console.log(`✅ Created ${Object.keys(groups).length} groups`);
  return groups;
}

function hasTreatmentCode(code: string) {
  const needle = code.toUpperCase();
  return (layer: any) =>
    Array.isArray(layer?.treatments) &&
    layer.treatments.some(
      (t: any) =>
        safeStr(t?.treatment?.code).toUpperCase() === needle ||
        safeStr(t?.treatment?.name).toUpperCase() === needle
    );
}

function weekdayColor(d: Date) {
  // JS: 0=Sun..6=Sat; Delphi DayOfWeek: 1=Sun..7=Sat
  const js = d.getDay(); // 0..6
  // Map to 1..7
  const dw = js === 0 ? 2 : js + 1; // crude mapping to spread across 1..7 (keeps order human-friendly)
  const name = DAY_COLOR_ARRAY[dw] || "";
  // Build 2-digit "month-like" id (Delphi uses '0'+id). We clamp to 01..07
  const colorId = String(dw).padStart(2, "0"); // '01'..'07'
  return { colorId, colorName: name };
}

function adjustDimToN10(kind: ExportKind, mm: number): string {
  let v = mm;
  if (ENABLE_BUMP_FOR_KINDS.has(kind) && !STANDARD_SIZES.has(mm)) {
    v = v + ADD_DIMENSION_MM;
  }
  return String(v * 10);
}

function toDate(v: any): Date | null {
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function num(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeStr(v: any): string {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[\r\n]/g, " ");
}

function padRight(s: string, len: number): string {
  const v = s ?? "";
  if (v.length >= len) return v.slice(0, len);
  return v + " ".repeat(len - v.length);
}
