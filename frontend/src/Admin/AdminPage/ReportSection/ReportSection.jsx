import React, { useState, useEffect } from 'react';
import api from '../../../api';
import './ReportSection.css';

const REPORT_TYPES = [
  { id: 'active-products', name: 'Active Product List' },
  { id: 'inactive-products', name: 'Inactive Product List' },
  { id: 'stock-size', name: 'Stock Adding List (by Size)' },
  { id: 'previous-month-stock', name: 'Previous Month Stock List' },
  { id: 'invoices', name: 'Invoice List' },
  { id: 'users', name: 'User Report' },
  { id: 'payments', name: 'Payment Report' },
  { id: 'delivery', name: 'Delivery Report' },
];

const ReportSection = () => {
  const [selectedReport, setSelectedReport] = useState('active-products');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  // Dynamic Filter States
  const [filters, setFilters] = useState({
    category: '',
    item: '',
    productType: '',
    collect: '',
    size: '',
    role: '',
    orderType: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, [selectedReport]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      item: '',
      productType: '',
      collect: '',
      size: '',
      role: '',
      orderType: '',
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  const buildQueryString = () => {
    const params = new URLSearchParams({ type: selectedReport });
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    return params.toString();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      const response = await api.get(`/reports/data?${queryString}`);
      setReportData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    try {
      const queryString = buildQueryString();
      const response = await api.get(`/reports/download/${format}?${queryString}`, {
        responseType: 'blob',
      });

      const mimeType =
        format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf';

      const blob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute(
        'download',
        `Rajagopal_Handloom_${selectedReport}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Error downloading ${format} report:`, error);
      alert(`Failed to download ${format.toUpperCase()} report.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const isProductReport = ['active-products', 'inactive-products', 'stock-size', 'previous-month-stock'].includes(selectedReport);
  const isOrderReport = ['invoices', 'payments', 'delivery'].includes(selectedReport);
  const isUserReport = selectedReport === 'users';

  return (
    <div className="report-container">
      {/* Title Header */}
      <div className="report-header">
        <h2 className="report-title">Rajagopal Handloom</h2>
        <p className="report-subtitle">Admin Reports & Business Data Analytics</p>
      </div>

      {/* Top Controls Bar */}
      <div className="report-controls-bar">
        <div className="select-group">
          <label className="control-label">Report Type:</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="report-select"
          >
            {REPORT_TYPES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="btn-actions">
          <button
            className="btn btn-excel"
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat === 'excel'}
          >
            {downloadingFormat === 'excel' ? 'Exporting...' : 'Export Excel'}
          </button>

          <button
            className="btn btn-pdf"
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat === 'pdf'}
          >
            {downloadingFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Filter Panel Card */}
      <div className="filter-card">
        <div className="filter-header">
          <span>Filter Parameters</span>
        </div>

        <div className="filter-grid">
          {/* Product-Specific Filters */}
          {isProductReport && (
            <>
              <div className="filter-field">
                <label className="field-label">Category</label>
                <input name="category" placeholder="e.g. Sarees" value={filters.category} onChange={handleFilterChange} className="report-input" />
              </div>
              <div className="filter-field">
                <label className="field-label">Item</label>
                <input name="item" placeholder="e.g. Silk Saree" value={filters.item} onChange={handleFilterChange} className="report-input" />
              </div>
              <div className="filter-field">
                <label className="field-label">Type</label>
                <input name="productType" placeholder="Product Type" value={filters.productType} onChange={handleFilterChange} className="report-input" />
              </div>
              <div className="filter-field">
                <label className="field-label">Collection</label>
                <input name="collect" placeholder="Collection Name" value={filters.collect} onChange={handleFilterChange} className="report-input" />
              </div>
              {selectedReport === 'stock-size' && (
                <div className="filter-field">
                  <label className="field-label">Size</label>
                  <input name="size" placeholder="e.g. S, M, L" value={filters.size} onChange={handleFilterChange} className="report-input" />
                </div>
              )}
            </>
          )}

          {/* User-Specific Filters */}
          {isUserReport && (
            <div className="filter-field">
              <label className="field-label">Role</label>
              <select name="role" value={filters.role} onChange={handleFilterChange} className="report-select">
                <option value="">All Roles</option>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
            </div>
          )}

          {/* Order-Specific Filters */}
          {isOrderReport && (
            <>
              <div className="filter-field">
                <label className="field-label">Order Type</label>
                <select name="orderType" value={filters.orderType} onChange={handleFilterChange} className="report-select">
                  <option value="">All Order Types</option>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>
              <div className="filter-field">
                <label className="field-label">Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="report-select">
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </>
          )}

          {/* Date Range Filters */}
          <div className="filter-field">
            <label className="field-label">From Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="report-input" />
          </div>

          <div className="filter-field">
            <label className="field-label">To Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="report-input" />
          </div>

          {/* Filter Action Buttons */}
          <div className="filter-actions">
            <button onClick={fetchData} className="btn btn-primary">
              Apply
            </button>
            <button onClick={resetFilters} className="btn btn-secondary">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table Card */}
      <div className="table-card">
        <div className="table-wrapper">
          {loading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p>Fetching report data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="state-container">
              <p>No records found matching your active filters.</p>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map((header) => (
                    <th key={header}>
                      {header.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>
                        {String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSection;