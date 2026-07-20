import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigits = (n: number): string => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };

  const threeDigits = (n: number): string => {
    let str = '';
    if (n >= 100) str += ones[Math.floor(n / 100)] + ' Hundred';
    if (n % 100) str += (str ? ' ' : '') + twoDigits(n % 100);
    return str;
  };

  if (num === 0) return 'Zero';
  const intPart = Math.floor(Math.abs(num));
  let words = '';

  if (intPart >= 1000000) {
    words += twoDigits(Math.floor(intPart / 1000000)) + ' Million';
    const r = intPart % 1000000;
    if (r >= 1000) words += ' ' + threeDigits(Math.floor(r / 1000)) + ' Thousand';
    if (r % 1000) words += ' ' + threeDigits(r % 1000);
  } else if (intPart >= 1000) {
    words += twoDigits(Math.floor(intPart / 1000)) + ' Thousand';
    if (intPart % 1000) words += ' ' + threeDigits(intPart % 1000);
  } else {
    words += threeDigits(intPart);
  }

  return words.trim();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB');
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number): string {
  return `${Math.round(amount || 0).toLocaleString('en-US')}/-`;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

function drawRightAligned(page: ReturnType<PDFDocument["addPage"]>, text: string, xRight: number, y: number, size: number, font: PDFFont, color = rgb(0, 0, 0)) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - w, y, size, font, color });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const challanId = url.searchParams.get("challan_id");

    if (!challanId) {
      return new Response(JSON.stringify({ error: "Missing challan_id parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: challan, error: challanError } = await supabase
      .from("fee_challans")
      .select("*")
      .eq("id", challanId)
      .maybeSingle();

    if (challanError || !challan) {
      return new Response(JSON.stringify({ error: "Challan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: items } = await supabase
      .from("fee_challan_items")
      .select("*")
      .eq("challan_id", challanId)
      .order("sort_order", { ascending: true });

    const { data: settings } = await supabase
      .from("cms_settings")
      .select("college_name, college_logo_url, address, phone, email, footer_text, bank_name, bank_branch, bank_account_name, bank_account_number, bank_ifsc")
      .maybeSingle();

    let programName = "";
    if (challan.program_id) {
      try {
        const { data: program } = await supabase
          .from("programs")
          .select("name")
          .eq("id", challan.program_id)
          .maybeSingle();
        programName = program?.name || "";
      } catch { /* table may not exist */ }
    }

    const collegeName = settings?.college_name || "College";
    const collegeLogoUrl = settings?.college_logo_url || "";
    const collegeAddress = settings?.address || "";
    const collegePhone = settings?.phone || "";
    const collegeEmail = settings?.email || "";

    const qrData = `CHALLAN:${challan.challan_number}|STUDENT:${challan.student_id}|AMOUNT:${challan.total_amount}|SESSION:${challan.session}`;
    let qrBytes: Uint8Array | null = null;
    try {
      const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`);
      qrBytes = new Uint8Array(await qrResponse.arrayBuffer());
    } catch { /* skip QR */ }

    let logoBytes: Uint8Array | null = null;
    if (collegeLogoUrl) {
      try {
        const logoResponse = await fetch(collegeLogoUrl);
        if (logoResponse.ok) logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
      } catch { /* skip logo */ }
    }

    // ── Build PDF ──
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSerifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    let qrImage: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
    if (qrBytes) {
      try { qrImage = await pdfDoc.embedPng(qrBytes); } catch { /* skip */ }
    }

    let logoImage: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
    if (logoBytes) {
      try { logoImage = await pdfDoc.embedPng(logoBytes); } catch {
        try { logoImage = await pdfDoc.embedJpg(logoBytes); } catch { /* skip */ }
      }
    }

    const PAGE_W = 842;
    const PAGE_H = 595;
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    const copyWidth = PAGE_W / 4;
    const pad = 6;
    const copies = ["Bank Copy", "Accounts Copy", "Department Copy", "Student Copy"];

    // Top header line spanning all 4 copies
    page.drawText("Bank Copy    Accounts Copy    Department Copy    Student Copy", {
      x: 8, y: PAGE_H - 10, size: 6, font: fontBold, color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: 0, y: PAGE_H - 14 },
      end: { x: PAGE_W, y: PAGE_H - 14 },
      thickness: 0.7, color: rgb(0, 0, 0),
    });

    // Vertical separators between copies
    for (let i = 1; i < 4; i++) {
      page.drawLine({
        start: { x: i * copyWidth, y: 0 },
        end: { x: i * copyWidth, y: PAGE_H - 14 },
        thickness: 0.5, color: rgb(0.6, 0.6, 0.6),
      });
    }

    const grandTotal = (challan.total_amount || 0) + (challan.fine_amount || 0);
    const balance = grandTotal - (challan.paid_amount || 0);

    for (let i = 0; i < 4; i++) {
      const xBase = i * copyWidth + pad;
      const contentW = copyWidth - 2 * pad;
      const xRight = xBase + contentW;
      let cy = 18;

      // Logo (top-right of each copy)
      if (logoImage) {
        const lh = 16;
        const lw = lh * (logoImage.width / logoImage.height);
        page.drawImage(logoImage, {
          x: xRight - lw, y: PAGE_H - cy - lh + 2,
          width: Math.min(lw, 20), height: lh,
        });
      }

      // College name
      page.drawText(collegeName, {
        x: xBase, y: PAGE_H - cy, size: 8, font: fontSerifBold, color: rgb(0, 0, 0),
      });
      cy += 11;

      if (collegeAddress) {
        const addrLines = wrapText(collegeAddress, font, 5.5, contentW - 22);
        for (const line of addrLines) {
          page.drawText(line, { x: xBase, y: PAGE_H - cy, size: 5.5, font: font, color: rgb(0.4, 0.4, 0.4) });
          cy += 6;
        }
      }
      if (collegePhone) {
        page.drawText(`Tel: ${collegePhone}`, { x: xBase, y: PAGE_H - cy, size: 5.5, font: font, color: rgb(0.4, 0.4, 0.4) });
        cy += 6;
      }
      cy += 3;

      // F.T.N
      page.drawText(`F.T.N: ${challan.challan_number}`, {
        x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0),
      });
      cy += 8;

      // Bank details
      if (settings?.bank_name) {
        page.drawText(`Bank: ${settings.bank_name}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
        cy += 7;
      }
      if (settings?.bank_account_number) {
        page.drawText(`Account No: ${settings.bank_account_number}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
        cy += 7;
      }
      if (settings?.bank_account_name) {
        const titleLines = wrapText(`Account Title: ${settings.bank_account_name}`, font, 6, contentW);
        for (const line of titleLines) {
          page.drawText(line, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
          cy += 7;
        }
      }
      if (settings?.bank_branch) {
        page.drawText(`Branch: ${settings.bank_branch}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
        cy += 7;
      }
      if (settings?.bank_ifsc) {
        page.drawText(`IFSC/IBAN: ${settings.bank_ifsc}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
        cy += 7;
      }
      cy += 3;

      // Warning
      page.drawText("Warning: Avoid IBFT/Fund Transfer,", { x: xBase, y: PAGE_H - cy, size: 5.5, font: fontBold, color: rgb(0.8, 0, 0) });
      cy += 6;
      page.drawText("otherwise your amount may be permanently lost", { x: xBase, y: PAGE_H - cy, size: 5.5, font: fontBold, color: rgb(0.8, 0, 0) });
      cy += 9;

      // Date
      let issueDate = '—';
      try { issueDate = new Date(challan.created_at).toLocaleString('en-GB'); } catch { /* */ }
      page.drawText(issueDate, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
      cy += 9;

      // Challan No
      page.drawText(`Challan No: ${challan.challan_number}`, { x: xBase, y: PAGE_H - cy, size: 9, font: fontBold, color: rgb(0, 0, 0) });
      cy += 11;

      // Status
      const statusColor = challan.status === 'paid' ? rgb(0.2, 0.6, 0.2) : challan.status === 'overdue' ? rgb(0.8, 0, 0) : rgb(0.5, 0.5, 0.5);
      page.drawText(`Status: ${challan.status || 'unpaid'}`, { x: xBase, y: PAGE_H - cy, size: 6, font: fontBold, color: statusColor });
      cy += 9;

      // Challan Valid Till
      page.drawText(`Challan Valid Till: ${formatDate(challan.due_date)}`, { x: xBase, y: PAGE_H - cy, size: 7, font: fontSerif, color: rgb(0, 0, 0) });
      cy += 11;

      // Student info
      page.drawText(`Name: ${challan.student_name || '—'}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
      cy += 7;
      page.drawText(`Roll No: ${challan.student_id || '—'}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
      cy += 7;
      if (programName) {
        const progLines = wrapText(`Program: ${programName}`, font, 6, contentW);
        for (const line of progLines) {
          page.drawText(line, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
          cy += 7;
        }
      }
      if (challan.semester) {
        page.drawText(`Semester: ${challan.semester}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
        cy += 7;
      }
      page.drawText(`Session: ${challan.session || '—'}`, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
      cy += 9;

      // Fee table header
      page.drawLine({ start: { x: xBase, y: PAGE_H - cy }, end: { x: xRight, y: PAGE_H - cy }, thickness: 0.5, color: rgb(0, 0, 0) });
      cy += 6;
      page.drawText("Particular", { x: xBase, y: PAGE_H - cy, size: 6, font: fontBold, color: rgb(0, 0, 0) });
      drawRightAligned(page, "Amount (Rs)", xRight, PAGE_H - cy, 6, fontBold);
      cy += 6;
      page.drawLine({ start: { x: xBase, y: PAGE_H - cy }, end: { x: xRight, y: PAGE_H - cy }, thickness: 0.5, color: rgb(0, 0, 0) });
      cy += 4;

      // Fee items
      for (const item of (items || [])) {
        const itemLines = wrapText(item.fee_head_name || '', font, 6, contentW - 52);
        drawRightAligned(page, formatCurrency(item.amount), xRight, PAGE_H - cy, 6, font);
        for (const line of itemLines) {
          page.drawText(line, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
          cy += 7;
        }
      }

      // Fine
      if ((challan.fine_amount || 0) > 0) {
        page.drawText("Fine", { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0.8, 0, 0) });
        drawRightAligned(page, formatCurrency(challan.fine_amount), xRight, PAGE_H - cy, 6, font, rgb(0.8, 0, 0));
        cy += 7;
      }

      // Total
      cy += 2;
      page.drawLine({ start: { x: xBase, y: PAGE_H - cy }, end: { x: xRight, y: PAGE_H - cy }, thickness: 0.5, color: rgb(0, 0, 0) });
      cy += 6;
      page.drawText("Total Amount to Pay", { x: xBase, y: PAGE_H - cy, size: 7, font: fontBold, color: rgb(0, 0, 0) });
      drawRightAligned(page, formatCurrency(grandTotal), xRight, PAGE_H - cy, 7, fontBold);
      cy += 9;

      // Paid / Balance
      if ((challan.paid_amount || 0) > 0) {
        page.drawText("Paid", { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0.2, 0.6, 0.2) });
        drawRightAligned(page, formatCurrency(challan.paid_amount), xRight, PAGE_H - cy, 6, font, rgb(0.2, 0.6, 0.2));
        cy += 7;
      }
      if (balance > 0 && challan.status !== 'paid') {
        page.drawText("Balance Due", { x: xBase, y: PAGE_H - cy, size: 6, font: fontBold, color: rgb(0.8, 0, 0) });
        drawRightAligned(page, formatCurrency(balance), xRight, PAGE_H - cy, 6, fontBold, rgb(0.8, 0, 0));
        cy += 7;
      }

      // Amount in words
      cy += 3;
      const wordsStr = `Amount (In Words): ${numberToWords(grandTotal)} Rs. Only`;
      const wordsLines = wrapText(wordsStr, font, 6, contentW);
      for (const line of wordsLines) {
        page.drawText(line, { x: xBase, y: PAGE_H - cy, size: 6, font: font, color: rgb(0, 0, 0) });
        cy += 7;
      }
      cy += 5;

      // Footer
      const footerLines = [
        "The fee can also be paid via the",
        "HBL Mobile/Konnect App or",
        "JazzCash App or Agent/Alfa App.",
        "For payments using debit/credit",
        "card visit portal or scan QR Code.",
      ];
      if (collegeEmail) {
        footerLines.push(`Challan queries, email at ${collegeEmail}`);
      }
      for (const line of footerLines) {
        const wrapped = wrapText(line, font, 5.5, contentW - (qrImage ? 42 : 0));
        for (const w of wrapped) {
          page.drawText(w, { x: xBase, y: PAGE_H - cy, size: 5.5, font: font, color: rgb(0.3, 0.3, 0.7) });
          cy += 6;
        }
      }

      // QR code (bottom-right of each copy)
      if (qrImage) {
        const qrSize = 36;
        page.drawImage(qrImage, {
          x: xRight - qrSize,
          y: PAGE_H - cy - qrSize + 20,
          width: qrSize, height: qrSize,
        });
      }

      // Signatures
      cy += 28;
      page.drawLine({
        start: { x: xBase + 5, y: PAGE_H - cy },
        end: { x: xBase + 70, y: PAGE_H - cy },
        thickness: 0.5, color: rgb(0.5, 0.5, 0.5),
      });
      page.drawText("Student Signature", { x: xBase + 10, y: PAGE_H - cy - 8, size: 5, font: font, color: rgb(0.4, 0.4, 0.4) });

      page.drawLine({
        start: { x: xRight - 75, y: PAGE_H - cy },
        end: { x: xRight - 10, y: PAGE_H - cy },
        thickness: 0.5, color: rgb(0.5, 0.5, 0.5),
      });
      page.drawText("Accounts Officer", { x: xRight - 65, y: PAGE_H - cy - 8, size: 5, font: font, color: rgb(0.4, 0.4, 0.4) });
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="challan-${challan.challan_number}.pdf"`,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
