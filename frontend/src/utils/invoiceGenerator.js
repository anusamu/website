import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Builds the jsPDF instance for a given order.
 * Designed specifically for Rajagopal Handloom brand aesthetic.
 * 
 * @param {Object} order - The order document from MongoDB
 * @param {Object} user - Optional user profile data for fallbacks
 * @returns {jsPDF} The prepared jsPDF instance
 */
export const buildInvoiceDoc = (order, user = {}) => {
  if (!order) {
    throw new Error("Order data is required to generate invoice.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // --- Color Palette ---
  const primaryDark = [26, 32, 44];      // #1a202c
  const brandSage = [137, 157, 110];     // #899d6e
  const mutedText = [100, 116, 139];     // #64748b
  const borderGray = [226, 232, 240];    // #e2e8f0

  const orderShortId = order._id ? order._id.slice(-8).toUpperCase() : "00000000";
  const invoiceNumber = `INV-${orderShortId}`;
  const orderDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-IN");

  // =========================================================================
  // 1. TOP HEADER SECTION (Brand & Invoice Title)
  // =========================================================================
  // Top Accent Bar (Brand Sage)
  doc.setFillColor(...brandSage);
  doc.rect(0, 0, pageWidth, 5, "F");

  let currentY = 16;

  // Brand Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primaryDark);
  doc.text("RAJAGOPAL HANDLOOM", margin, currentY);

  // Invoice Title on Top Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...brandSage);
  doc.text("TAX INVOICE", pageWidth - margin, currentY, { align: "right" });

  currentY += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text("Traditional Heritage & Handcrafted Elegance Since 1996", margin, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - margin, currentY, { align: "right" });

  currentY += 5;
  doc.text("Near Sree Padmanabhaswamy Temple, East Fort, Trivandrum, Kerala - 695023", margin, currentY);
  doc.text(`Date: ${orderDate}`, pageWidth - margin, currentY, { align: "right" });

  currentY += 4.5;
  doc.text("Email: rajagopalhandloom@gmail.com | Helpline: +91 98470 12345", margin, currentY);
  doc.text(`Status: ${(order.status || "Paid").toUpperCase()}`, pageWidth - margin, currentY, { align: "right" });

  // Subtle Divider Line
  currentY += 5;
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // =========================================================================
  // 2. BILLED TO & ORDER DETAILS (Two-Column Layout)
  // =========================================================================
  currentY += 8;

  // Left Column: Customer & Shipping Details
  const customerName = [
    order.shippingAddress?.firstName || user?.firstName || "Valued",
    order.shippingAddress?.lastName || user?.lastName || "Customer"
  ].filter(Boolean).join(" ");

  const streetAddress = order.shippingAddress?.address || "";
  const aptAddress = order.shippingAddress?.appartment ? `, ${order.shippingAddress.appartment}` : "";
  const cityStatePin = [
    order.shippingAddress?.city,
    order.shippingAddress?.state,
    order.shippingAddress?.pincode ? `- ${order.shippingAddress.pincode}` : ""
  ].filter(Boolean).join(", ");

  const phone = order.shippingAddress?.phone || user?.phoneNumber || "N/A";
  const email = order.shippingAddress?.email || user?.email || "N/A";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryDark);
  doc.text("BILLED & SHIPPED TO:", margin, currentY);

  doc.setFont("helvetica", "bold");
  doc.text("ORDER SUMMARY:", pageWidth / 2 + 10, currentY);

  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryDark);
  doc.text(customerName, margin, currentY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(`Order ID: #${orderShortId}`, pageWidth / 2 + 10, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.text((streetAddress + aptAddress) || "Delivery Address as registered", margin, currentY);
  doc.text(`Payment ID: ${order.paymentId || "ONLINE-PAID"}`, pageWidth / 2 + 10, currentY);

  currentY += 4.5;
  doc.text(cityStatePin || "Trivandrum, Kerala, India", margin, currentY);
  doc.text(`Payment Mode: Online (Prepaid)`, pageWidth / 2 + 10, currentY);

  currentY += 4.5;
  doc.text(`Phone: ${phone} | Email: ${email}`, margin, currentY);
  if (order.trackingCode) {
    doc.text(`Courier: ${order.courierName || "Express"} | AWB: ${order.trackingCode}`, pageWidth / 2 + 10, currentY);
  } else {
    doc.text(`Delivery Method: Standard Insured Shipping`, pageWidth / 2 + 10, currentY);
  }

  currentY += 7;

  // =========================================================================
  // 3. LINE ITEMS TABLE (autoTable)
  // =========================================================================
  const tableItems = (order.items || []).map((item, index) => {
    const pName = item.productName || item.product?.productName || item.name || "Handloom Product";
    const size = item.size || "Free Size";
    const qty = item.quantity || 1;
    const unitPrice = Number(item.price || item.product?.price || 0);
    const totalRow = unitPrice * qty;

    return [
      (index + 1).toString(),
      pName,
      size,
      qty.toString(),
      `Rs. ${unitPrice.toLocaleString("en-IN")}`,
      `Rs. ${totalRow.toLocaleString("en-IN")}`
    ];
  });

  // Fallback if order has total but empty items array
  if (tableItems.length === 0) {
    tableItems.push([
      "1",
      "Handloom Order Item",
      "OS",
      "1",
      `Rs. ${(order.totalAmount || 0).toLocaleString("en-IN")}`,
      `Rs. ${(order.totalAmount || 0).toLocaleString("en-IN")}`
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Item Description", "Size", "Qty", "Unit Price", "Total (INR)"]],
    body: tableItems,
    theme: "striped",
    headStyles: {
      fillColor: brandSage, // Brand Green #899d6e
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left"
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto", halign: "left" },
      2: { cellWidth: 24, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 32, halign: "right" },
      5: { cellWidth: 34, halign: "right" }
    },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
      lineColor: borderGray,
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // =========================================================================
  // 4. FINANCIAL SUMMARY (Subtotal, Shipping, Grand Total)
  // =========================================================================
  const grandTotal = Number(order.totalAmount || 0);
  const summaryBoxWidth = 75;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;

  // Financial Rows
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text("Items Subtotal:", summaryBoxX, finalY);
  doc.setTextColor(...primaryDark);
  doc.text(`Rs. ${grandTotal.toLocaleString("en-IN")}`, pageWidth - margin, finalY, { align: "right" });

  doc.setTextColor(...mutedText);
  doc.text("Shipping & Handling:", summaryBoxX, finalY + 5);
  doc.setTextColor(34, 139, 34); // Forest Green for FREE
  doc.setFont("helvetica", "bold");
  doc.text("FREE", pageWidth - margin, finalY + 5, { align: "right" });

  // Grand Total Highlight Box
  doc.setFillColor(245, 247, 245);
  doc.setDrawColor(...brandSage);
  doc.setLineWidth(0.6);
  doc.roundedRect(summaryBoxX - 4, finalY + 9, summaryBoxWidth + 4, 12, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryDark);
  doc.text("Grand Total:", summaryBoxX, finalY + 16.5);
  doc.setTextColor(...brandSage);
  doc.text(`Rs. ${grandTotal.toLocaleString("en-IN")}`, pageWidth - margin, finalY + 16.5, { align: "right" });

  // =========================================================================
  // 5. TEMPORARY SIGNATURE & TERMS SECTION
  // =========================================================================
  const termsY = finalY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryDark);
  doc.text("Terms & Conditions:", margin, termsY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text("1. All items are authentic handloom textiles woven by certified artisans.", margin, termsY + 4.5);
  doc.text("2. Exchanges accepted within 7 days in pristine, unused condition.", margin, termsY + 8.5);
  doc.text("3. Natural weave slubs and organic dyes celebrate pure handloom craft.", margin, termsY + 12.5);

  // Signature Area (Positioned above footer)
  const signAreaY = Math.max(finalY + 30, pageHeight - 45);

  // Left: Digital Invoice Verification seal
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.4);
  doc.rect(margin, signAreaY - 4, 80, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text("COMPUTER GENERATED INVOICE", margin + 4, signAreaY + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("No physical signature required.", margin + 4, signAreaY + 6.5);
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, margin + 4, signAreaY + 10.5);

  // Right: Authorised Signatory Box (Design placeholder for future UI & digital signature)
  const signBoxX = pageWidth - margin - 65;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryDark);
  doc.text("For RAJAGOPAL HANDLOOM", signBoxX, signAreaY);

  // Placeholder signature dashed line
  doc.setDrawColor(...mutedText);
  doc.setLineDashPattern([1.5, 1], 0);
  doc.line(signBoxX, signAreaY + 11, signBoxX + 60, signAreaY + 11);
  doc.setLineDashPattern([], 0); // reset dash

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text("[ Authorised Signatory ]", signBoxX + 30, signAreaY + 15, { align: "center" });

  // =========================================================================
  // 6. BOTTOM FOOTER STRIP
  // =========================================================================
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text(
    "Thank you for preserving India's timeless handloom heritage with Rajagopal Handloom.",
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" }
  );

  return doc;
};

/**
 * Generates and downloads the PDF invoice.
 */
export const generateInvoicePDF = (order, user = {}) => {
  try {
    const doc = buildInvoiceDoc(order, user);
    const orderShortId = order._id ? order._id.slice(-8).toUpperCase() : "00000000";
    const fileName = `Rajagopal_Invoice_${orderShortId}.pdf`;
    doc.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error("Failed to generate invoice PDF:", error);
    throw error;
  }
};

/**
 * Generates and opens the PDF invoice in a new browser tab.
 */
export const openInvoicePDF = (order, user = {}) => {
  try {
    const doc = buildInvoiceDoc(order, user);
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Failed to open invoice PDF:", error);
    throw error;
  }
};
