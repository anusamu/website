const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const PDFDocument = require('pdfkit-table');
const ExcelJS = require('exceljs');

// Helper to construct dynamic date range query
const buildDateQuery = (startDate, endDate) => {
  if (!startDate && !endDate) return null;
  const dateQuery = {};
  if (startDate) dateQuery.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateQuery.$lte = end;
  }
  return dateQuery;
};

// Helper to fetch and build tabular rows based on filters
const buildReportDataset = async (query) => {
  const {
    type,
    category,
    item,
    productType,
    collect,
    size,
    role,
    orderType,
    status,
    startDate,
    endDate
  } = query;

  let records = [];

  // 1. PRODUCT & STOCK REPORTS
  if (
    type === 'active-products' ||
    type === 'inactive-products' ||
    type === 'stock-size' ||
    type === 'previous-month-stock'
  ) {
    let productFilter = {};

    if (type === 'active-products') productFilter.status = 'active';
    if (type === 'inactive-products') productFilter.status = 'inactive';

    if (type === 'previous-month-stock') {
      const firstDay = new Date();
      firstDay.setMonth(firstDay.getMonth() - 1);
      firstDay.setDate(1);
      firstDay.setHours(0, 0, 0, 0);

      const lastDay = new Date();
      lastDay.setDate(0);
      lastDay.setHours(23, 59, 59, 999);

      productFilter.createdAt = { $gte: firstDay, $lte: lastDay };
    } else {
      const dateQuery = buildDateQuery(startDate, endDate);
      if (dateQuery) productFilter.createdAt = dateQuery;
    }

    // Apply Product Category Filters
    if (category) productFilter.category = category;
    if (item) productFilter.item = item;
    if (productType) productFilter.type = productType;
    if (collect) productFilter.collect = collect;

    const products = await Product.find(productFilter).sort({ createdAt: -1 }).lean();

    if (type === 'stock-size') {
      products.forEach((p) => {
        const addedDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A';
        const updatedDate = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'N/A';

        if (p.sizes && p.sizes.length > 0) {
          p.sizes.forEach((s) => {
            if (!size || s.size.toLowerCase() === size.toLowerCase()) {
              records.push({
                productNumber: p.productNumber,
                productName: p.productName,
                category: p.category,
                item: p.item,
                type: p.type,
                collect: p.collect,
                size: s.size,
                quantity: s.quantity,
                stockStatus: p.stockStatus,
                dateAdded: addedDate,
                lastStockUpdated: updatedDate
              });
            }
          });
        } else {
          // Handles products without individual size entries
          if (!size) {
            records.push({
              productNumber: p.productNumber,
              productName: p.productName,
              category: p.category,
              item: p.item,
              type: p.type,
              collect: p.collect,
              size: '-',
              quantity: p.stockCount || 0,
              stockStatus: p.stockStatus,
              dateAdded: addedDate,
              lastStockUpdated: updatedDate
            });
          }
        }
      });
    } else {
      records = products.map((p) => ({
        productNumber: p.productNumber,
        productName: p.productName,
        category: p.category,
        item: p.item,
        type: p.type,
        collect: p.collect,
        price: p.price,
        stockCount: p.stockCount,
        stockStatus: p.stockStatus,
        status: p.status,
        dateAdded: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
      }));
    }
  }

  // 2. ORDER, PAYMENT & DELIVERY REPORTS
  else if (type === 'invoices' || type === 'payments' || type === 'delivery') {
    let orderFilter = {};
    const dateQuery = buildDateQuery(startDate, endDate);
    if (dateQuery) orderFilter.createdAt = dateQuery;
    if (orderType) orderFilter.orderType = orderType;
    if (status) orderFilter.status = status;

    const orders = await Order.find(orderFilter)
      .populate('userId', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 })
      .lean();

    records = orders.map((o) => ({
      orderId: o._id.toString(),
      customer: o.userId ? `${o.userId.firstName} ${o.userId.lastName}` : 'Guest',
      email: o.shippingAddress?.email || o.userId?.email || 'N/A',
      phone: o.shippingAddress?.phone || o.userId?.phoneNumber || 'N/A',
      orderType: o.orderType,
      paymentId: o.paymentId,
      totalAmount: o.totalAmount,
      status: o.status,
      trackingCode: o.trackingCode || 'N/A',
      date: new Date(o.createdAt).toLocaleDateString()
    }));
  }

  // 3. USER REPORTS
  else if (type === 'users') {
    let userFilter = {};
    const dateQuery = buildDateQuery(startDate, endDate);
    if (dateQuery) userFilter.createdAt = dateQuery;
    if (role) userFilter.role = role;

    const users = await User.find(userFilter).select('-password').sort({ createdAt: -1 }).lean();

    records = users.map((u) => ({
      firstName: u.firstName,
      lastName: u.lastName || '',
      email: u.email,
      phoneNumber: u.phoneNumber || 'N/A',
      role: u.role,
      joinedDate: new Date(u.createdAt).toLocaleDateString()
    }));
  }

  return records;
};

// GET JSON Data for Preview
exports.getReportData = async (req, res) => {
  try {
    const records = await buildReportDataset(req.query);
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export to Excel (.xlsx)
exports.downloadExcelReport = async (req, res) => {
  try {
    const { type } = req.query;
    const records = await buildReportDataset(req.query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    if (records.length > 0) {
      const columns = Object.keys(records[0]).map((key) => ({
        header: key.replace(/([A-Z])/g, ' $1').toUpperCase(),
        key: key,
        width: 20
      }));
      worksheet.columns = columns;
      records.forEach((row) => worksheet.addRow(row));
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Rajagopal_Handloom_${type}_Report.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export to PDF (.pdf)
exports.downloadPdfReport = async (req, res) => {
  try {
    const { type } = req.query;
    const records = await buildReportDataset(req.query);

    const doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Rajagopal_Handloom_${type}_Report.pdf`
    );

    doc.pipe(res);

    doc.fontSize(16).text('RAJAGOPAL HANDLOOM', { align: 'center' });
    doc.fontSize(11).text(`Report Type: ${type.toUpperCase().replace(/-/g, ' ')}`, { align: 'center' });
    doc.fontSize(8).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    if (records.length > 0) {
      const headers = Object.keys(records[0]).map((k) =>
        k.replace(/([A-Z])/g, ' $1').toUpperCase()
      );
      const rows = records.map((r) => Object.values(r).map((v) => String(v ?? '')));

      await doc.table(
        { headers, rows },
        {
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: () => doc.font('Helvetica').fontSize(7)
        }
      );
    } else {
      doc.fontSize(10).text('No records match the selected filters.', { align: 'center' });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};