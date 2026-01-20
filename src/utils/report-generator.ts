import ExcelJS from "exceljs";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const generateMonthlyReport = async (
  orders: any[],
  logs: any[],
  expenses: any[],
  stats: any,
  period: { month: string; year: string; date?: string }
) => {
  const workbook = new ExcelJS.Workbook();

  // Metadata
  workbook.creator = "Rynse Laundry";
  workbook.created = new Date();
  workbook.lastModifiedBy = "Rynse System";

  // --- STYLING CONSTANTS ---
  const styles = {
    headerFont: {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "FFFFFFFF" },
    },
    subHeaderFont: {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "FF334155" },
    }, // Slate-700
    tableHeaderFont: {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    },
    dataFont: { name: "Arial", size: 10 },
    currencyFormat: "#,##0",
    headerFill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" }, // Slate-900 (Brand Dark)
    } as ExcelJS.Fill,
    tableHeaderFill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF475569" }, // Slate-600
    } as ExcelJS.Fill,
    borderThin: {
      top: { style: "thin", color: { argb: "FFCBD5E1" } }, // Slate-300
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    } as Partial<ExcelJS.Borders>,
    primaryColor: "06BDD8", // Cyan
    dangerColor: "F43F5E", // Rose
    successColor: "10B981", // Emerald
  };

  // --- HELPER: APPLY HEADER STYLE ---
  const applyHeaderStyle = (row: ExcelJS.Row) => {
    row.eachCell((cell) => {
      cell.fill = styles.tableHeaderFill;
      cell.font = styles.tableHeaderFont;
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = styles.borderThin;
    });
    row.height = 24;
  };

  const applyDataRowStyle = (row: ExcelJS.Row) => {
    row.eachCell((cell) => {
      cell.font = styles.dataFont;
      cell.border = styles.borderThin;
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  };

  // --- SHEET 1: RINGKASAN (SUMMARY) ---
  const summarySheet = workbook.addWorksheet("Ringkasan");

  // Branding Header
  summarySheet.mergeCells("A1:E1");
  const brandCell = summarySheet.getCell("A1");
  brandCell.value = "RYNSE LAUNDRY MANAGEMENT";
  brandCell.font = {
    name: "Arial",
    size: 18,
    bold: true,
    color: { argb: "FF06BDD8" },
  }; // Cyan Brand
  brandCell.alignment = { horizontal: "left" };

  summarySheet.mergeCells("A2:E2");
  const reportTitle = summarySheet.getCell("A2");
  reportTitle.value = period.date
    ? `LAPORAN HARIAN: ${format(new Date(period.date), "dd MMMM yyyy", {
        locale: id,
      }).toUpperCase()}`
    : `LAPORAN BULANAN: ${format(
        new Date(parseInt(period.year), parseInt(period.month), 1),
        "MMMM yyyy",
        { locale: id }
      ).toUpperCase()}`;
  reportTitle.font = styles.subHeaderFont;

  // SPACER
  summarySheet.addRow([]);

  // --- FINANCIAL SUMMARY ---
  summarySheet.getCell("A4").value = "RINGKASAN KEUANGAN";
  summarySheet.getCell("A4").font = styles.subHeaderFont;

  // Calculate Totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = stats.totalRevenue - totalExpenses;

  // Custom Table Construction for full control
  const finTableStart = 5;
  const finHeaders = ["Kategori", "Nilai (Rp)"];

  const finHeaderRow = summarySheet.getRow(finTableStart);
  finHeaderRow.values = finHeaders;
  applyHeaderStyle(finHeaderRow);
  finHeaderRow.getCell(1).alignment = {
    horizontal: "left",
    vertical: "middle",
  }; // Override alignment for first col

  const finData = [
    ["Pendapatan (Lunas)", stats.totalRevenue],
    ["Pengeluaran Operasional", totalExpenses],
    ["Profit Bersih", netProfit],
    ["Potensi Pendapatan (Piutang)", stats.potentialRevenue],
  ];

  finData.forEach((row, idx) => {
    const r = summarySheet.getRow(finTableStart + 1 + idx);
    r.values = row;
    applyDataRowStyle(r);
    r.getCell(2).numFmt = styles.currencyFormat;
    r.getCell(2).alignment = { horizontal: "right" };

    // Styling for Profit
    if (row[0] === "Profit Bersih") {
      r.font = {
        bold: true,
        color: { argb: netProfit >= 0 ? "FF10B981" : "FFF43F5E" },
      };
    }
  });

  // --- PRODUCTION SUMMARY ---
  // Positioned next to Financials (Col D-E)
  summarySheet.getCell("D4").value = "METRIK PRODUKSI";
  summarySheet.getCell("D4").font = styles.subHeaderFont;

  const prodTableStart = 5;
  const prodHeaders = ["Metrik", "Jumlah"];

  // Header
  summarySheet.getCell(`D${prodTableStart}`).value = prodHeaders[0];
  summarySheet.getCell(`E${prodTableStart}`).value = prodHeaders[1];

  const prodHeaderRowParts = [
    summarySheet.getCell(`D${prodTableStart}`),
    summarySheet.getCell(`E${prodTableStart}`),
  ];
  prodHeaderRowParts.forEach((cell) => {
    cell.fill = styles.tableHeaderFill;
    cell.font = styles.tableHeaderFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = styles.borderThin;
  });
  summarySheet.getCell(`D${prodTableStart}`).alignment = { horizontal: "left" };

  const prodData = [
    ["Total Berat (Kg)", stats.totalKg],
    ["Total Satuan (Pcs)", stats.totalPcs],
    ["Total Pesanan", stats.totalOrders],
    ["", ""],
  ];

  prodData.forEach((row, idx) => {
    const rowNum = prodTableStart + 1 + idx;
    summarySheet.getCell(`D${rowNum}`).value = row[0];
    summarySheet.getCell(`E${rowNum}`).value = row[1];

    const c1 = summarySheet.getCell(`D${rowNum}`);
    const c2 = summarySheet.getCell(`E${rowNum}`);

    c1.font = styles.dataFont;
    c1.border = styles.borderThin;
    c2.font = styles.dataFont;
    c2.border = styles.borderThin;
    c2.alignment = { horizontal: "center" };
  });

  // --- LOW STOCK ALERTS ---
  const alertStartRow = 12;
  summarySheet.getCell(`A${alertStartRow}`).value =
    "PERINGATAN STOK (LOW STOCK)";
  summarySheet.getCell(`A${alertStartRow}`).font = {
    ...styles.subHeaderFont,
    color: { argb: "FFF43F5E" },
  };

  if (stats.lowStockItems.length > 0) {
    const alertHeaderRow = summarySheet.getRow(alertStartRow + 1);
    alertHeaderRow.values = ["Nama Barang", "Sisa Stok", "Satuan", "Min. Stok"];
    applyHeaderStyle(alertHeaderRow);

    stats.lowStockItems.forEach((item: any, idx: number) => {
      const r = summarySheet.getRow(alertStartRow + 2 + idx);
      r.values = [item.name, item.stock, item.unit, item.min_stock];
      applyDataRowStyle(r);
      r.getCell(2).font = { bold: true, color: { argb: "FFF43F5E" } }; // Red stock
      r.getCell(2).alignment = { horizontal: "center" };
      r.getCell(4).alignment = { horizontal: "center" };
    });
  } else {
    summarySheet.getCell(`A${alertStartRow + 1}`).value =
      "Semua stok dalam kondisi aman.";
    summarySheet.getCell(`A${alertStartRow + 1}`).font = {
      italic: true,
      color: { argb: "FF10B981" },
    };
  }

  // Adjust Columns
  summarySheet.getColumn(1).width = 28;
  summarySheet.getColumn(2).width = 22;
  summarySheet.getColumn(3).width = 4; // Spacer
  summarySheet.getColumn(4).width = 24;
  summarySheet.getColumn(5).width = 18;

  // --- SHEET 2: LAPORAN KEUANGAN (DETAILED) ---
  const finSheet = workbook.addWorksheet("Laporan Keuangan");

  // Headers
  finSheet.mergeCells("A1:E1");
  finSheet.getCell("A1").value = period.date
    ? `RINCIAN KEUANGAN HARIAN - ${format(
        new Date(period.date),
        "dd MMMM yyyy",
        { locale: id }
      ).toUpperCase()}`
    : `RINCIAN KEUANGAN - ${format(
        new Date(parseInt(period.year), parseInt(period.month), 1),
        "MMMM yyyy",
        { locale: id }
      ).toUpperCase()}`;
  finSheet.getCell("A1").font = styles.headerFont;
  finSheet.getCell("A1").fill = styles.headerFill;
  finSheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  finSheet.columns = [
    { header: "Tanggal", key: "date", width: 18 },
    { header: "Ref. ID", key: "ref", width: 15 },
    { header: "Keterangan / Kategori", key: "desc", width: 40 },
    { header: "Masuk (Debit)", key: "debit", width: 18 },
    { header: "Keluar (Kredit)", key: "credit", width: 18 },
  ];

  const finSheetHeader = finSheet.getRow(2);
  applyHeaderStyle(finSheetHeader);

  let finRow = 3;

  // I. PENDAPATAN
  finSheet.mergeCells(`A${finRow}:E${finRow}`);
  finSheet.getCell(`A${finRow}`).value = "I. PENDAPATAN (Pesanan Lunas)";
  finSheet.getCell(`A${finRow}`).font = {
    bold: true,
    color: { argb: "FF10B981" },
  };
  finSheet.getCell(`A${finRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "HPECFDF5" },
  }; // Light Green (Approx)
  finRow++;

  orders.forEach((order) => {
    if (order.status === "paid" || order.status === "completed") {
      const r = finSheet.getRow(finRow);
      r.values = [
        format(new Date(order.created_at), "dd/MM/yy HH:mm", { locale: id }),
        order.id,
        "Pembayaran Order Laundry",
        order.total_price,
        null,
      ];
      applyDataRowStyle(r);
      r.getCell(4).numFmt = styles.currencyFormat;
      r.getCell(4).alignment = { horizontal: "right" };
      finRow++;
    }
  });

  // II. PENGELUARAN
  finRow++;
  finSheet.mergeCells(`A${finRow}:E${finRow}`);
  finSheet.getCell(`A${finRow}`).value = "II. PENGELUARAN OPERASIONAL";
  finSheet.getCell(`A${finRow}`).font = {
    bold: true,
    color: { argb: "FFF43F5E" },
  };
  finRow++;

  expenses.forEach((expense) => {
    const r = finSheet.getRow(finRow);
    r.values = [
      format(new Date(expense.expense_date), "dd/MM/yy", { locale: id }),
      `#EXP-${expense.id}`,
      `${expense.category} - ${expense.description || ""}`,
      null,
      expense.amount,
    ];
    applyDataRowStyle(r);
    r.getCell(5).numFmt = styles.currencyFormat;
    r.getCell(5).alignment = { horizontal: "right" };
    finRow++;
  });

  // TOTALS FOOTER
  finRow += 1;
  const totalRow = finSheet.getRow(finRow);
  totalRow.values = ["", "", "TOTAL", stats.totalRevenue, totalExpenses];

  totalRow.getCell(3).font = { bold: true, size: 12 };
  totalRow.getCell(3).alignment = { horizontal: "right" };

  totalRow.getCell(4).font = { bold: true, color: { argb: "FF10B981" } };
  totalRow.getCell(4).numFmt = styles.currencyFormat;
  totalRow.getCell(4).border = { top: { style: "double" } };

  totalRow.getCell(5).font = { bold: true, color: { argb: "FFF43F5E" } };
  totalRow.getCell(5).numFmt = styles.currencyFormat;
  totalRow.getCell(5).border = { top: { style: "double" } };

  // NET PROFIT CALC
  finRow += 2;
  finSheet.mergeCells(`C${finRow}:D${finRow}`);
  finSheet.getCell(`C${finRow}`).value = "PROFIT BERSIH SEMENTARA:";
  finSheet.getCell(`C${finRow}`).font = { bold: true, size: 12 };
  finSheet.getCell(`C${finRow}`).alignment = { horizontal: "right" };

  const netProfitCell = finSheet.getCell(`E${finRow}`);
  netProfitCell.value = netProfit;
  netProfitCell.numFmt = styles.currencyFormat;
  netProfitCell.font = {
    bold: true,
    size: 14,
    color: { argb: netProfit >= 0 ? "FF10B981" : "FFF43F5E" },
  };
  netProfitCell.border = {
    top: { style: "thick" },
    bottom: { style: "thick" },
  };

  // --- SHEET 3: RIWAYAT PESANAN ---
  const ordersSheet = workbook.addWorksheet("Riwayat Pesanan");

  ordersSheet.columns = [
    { header: "Waktu", key: "date", width: 18 },
    { header: "ID", key: "id", width: 10 },
    { header: "Pelanggan", key: "customer", width: 20 }, // New column attempt if data exists, else skip
    { header: "Status", key: "status", width: 15 },
    { header: "Detail Item", key: "items", width: 45 },
    { header: "Total (Rp)", key: "total", width: 18 },
  ];

  const ordHeader = ordersSheet.getRow(1);
  applyHeaderStyle(ordHeader);

  orders.forEach((order) => {
    const itemsSummary = order.order_items
      ?.map((i: any) => `${i.quantity}${i.unit}`)
      .join(", ");

    const r = ordersSheet.addRow({
      date: format(new Date(order.created_at), "dd/MM/yy HH:mm", {
        locale: id,
      }),
      id: order.id,
      customer: order.customer_name || "-", // Assuming might exist, otherwise "-"
      status: order.status.toUpperCase(),
      items: itemsSummary,
      total: order.total_price,
    });

    applyDataRowStyle(r);
    r.getCell(6).numFmt = styles.currencyFormat;
    r.getCell(6).alignment = { horizontal: "right" };

    // Status coloring
    const statusCell = r.getCell(4);
    if (order.status === "paid" || order.status === "completed") {
      statusCell.font = { color: { argb: "FF10B981" }, bold: true };
    } else if (order.status === "cancelled") {
      statusCell.font = { color: { argb: "FFF43F5E" } }; // Red
    } else {
      statusCell.font = { color: { argb: "FFF59E0B" } }; // Amber
    }
  });

  // --- SHEET 4: LOG INVENTARIS ---
  const logSheet = workbook.addWorksheet("Log Inventaris");

  logSheet.columns = [
    { header: "Waktu", key: "date", width: 18 },
    { header: "Nama Barang", key: "name", width: 25 },
    { header: "Perubahan", key: "change", width: 15 },
    { header: "Catatan", key: "notes", width: 35 },
  ];
  applyHeaderStyle(logSheet.getRow(1));

  logs.forEach((log) => {
    const r = logSheet.addRow({
      date: format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: id }),
      name: log.inventory_items?.name || "Unknown",
      change: `${log.change_amount > 0 ? "+" : ""}${log.change_amount} ${
        log.inventory_items?.unit || ""
      }`,
      notes: log.notes || "-",
    });
    applyDataRowStyle(r);

    const changeCell = r.getCell(3);
    if (log.change_amount > 0) {
      changeCell.font = { color: { argb: "FF10B981" }, bold: true };
    } else {
      changeCell.font = { color: { argb: "FFF43F5E" }, bold: true };
    }
    changeCell.alignment = { horizontal: "center" };
  });

  // --- DOWNLOAD ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;

  const filename = period.date
    ? `Laporan__${period.date}.xlsx`
    : `Laporan_Rynse_${period.month}_${period.year}.xlsx`;

  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
