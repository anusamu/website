// ShippingModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  CircularProgress,
  IconButton
} from '@mui/material';
import { X, Truck, Mail, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../../api';
import './ShippingModal.css';

const COMMON_COURIERS = [
  { name: 'Delhivery', urlPrefix: 'https://www.delhivery.com/track/package/' },
  { name: 'Blue Dart', urlPrefix: 'https://www.bluedart.com/tracking' },
  { name: 'DTDC', urlPrefix: 'https://www.dtdc.in/tracking.asp' },
  { name: 'India Post', urlPrefix: 'https://www.indiapost.gov.in/_layouts/15/dpt.ptc.ui/tracking.aspx' },
  { name: 'Professional Couriers', urlPrefix: 'https://www.tpcindia.com/' },
  { name: 'Trackon', urlPrefix: 'http://trackon.in/' },
  { name: 'FedEx', urlPrefix: 'https://www.fedex.com/fedextrack/?trknbr=' },
  { name: 'Ecom Express', urlPrefix: 'https://ecomexpress.in/tracking/' },
  { name: 'Shadowfax', urlPrefix: 'https://tracker.shadowfax.in/' },
  { name: 'Other', urlPrefix: '' }
];

export default function ShippingModal({
  open,
  onClose,
  order,
  targetStatus = 'Shipped',
  onSuccess
}) {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [courierName, setCourierName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setTrackingCode(order.trackingCode || '');
      setTrackingUrl(order.trackingUrl || '');
      setCourierName(order.courierName || '');
      
      const detectedEmail = order.shippingAddress?.email || 
        order.userId?.email || 
        (typeof order.userId === 'object' ? order.userId?.email : '') || 
        '';
      
      setRecipientEmail(detectedEmail);
      setSendEmail(Boolean(detectedEmail));
    }
  }, [order, open]);

  if (!order) return null;

  const customerName = `${order.shippingAddress?.firstName || 'Customer'} ${order.shippingAddress?.lastName || ''}`.trim();
  const orderShortId = order._id ? order._id.slice(-8).toUpperCase() : '';

  // Auto-suggest URL if courier is selected and tracking ID is typed
  const handleCourierChange = (newCourier) => {
    setCourierName(newCourier || '');
    if (!trackingUrl && trackingCode && newCourier) {
      const match = COMMON_COURIERS.find(c => c.name.toLowerCase() === (newCourier || '').toLowerCase());
      if (match && match.urlPrefix && !match.urlPrefix.endsWith('.asp') && !match.urlPrefix.endsWith('.aspx') && !match.urlPrefix.endsWith('/')) {
        setTrackingUrl(`${match.urlPrefix}${trackingCode}`);
      } else if (match && match.urlPrefix && match.urlPrefix.endsWith('=')) {
        setTrackingUrl(`${match.urlPrefix}${trackingCode}`);
      }
    }
  };

  const handleTrackingCodeChange = (newCode) => {
    setTrackingCode(newCode);
    if (courierName && !trackingUrl) {
      const match = COMMON_COURIERS.find(c => c.name.toLowerCase() === courierName.toLowerCase());
      if (match && match.urlPrefix && match.urlPrefix.includes('=')) {
        setTrackingUrl(`${match.urlPrefix}${newCode.trim()}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const payload = {
        status: targetStatus || 'Shipped',
        trackingCode: trackingCode.trim(),
        trackingUrl: trackingUrl.trim(),
        courierName: courierName.trim(),
        recipientEmail: recipientEmail.trim(),
        sendEmail: Boolean(sendEmail && recipientEmail.trim())
      };

      const { data } = await API.put(
        `/admin/update-status/${order._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        if (data.emailSent) {
          toast.success(data.message || `Order marked as Shipped & tracking email sent to ${recipientEmail}!`);
        } else if (data.emailError) {
          toast.warn(data.message || `Order updated, but email sending failed: ${data.emailError}`);
        } else {
          toast.success(data.message || 'Order updated successfully!');
        }

        if (onSuccess) {
          onSuccess(data.order || { ...order, ...payload });
        }
        onClose();
      } else {
        toast.error(data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error('Error updating shipping status:', err);
      toast.error(err.response?.data?.message || 'Server error updating shipping status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Dialog Header */}
      <div className="shipping-modal-header">
        <div className="shipping-modal-title-group">
          <div className="shipping-modal-icon-badge">
            <Truck size={22} />
          </div>
          <div>
            <h2 className="shipping-modal-title">
              {targetStatus === 'Shipped' ? 'Dispatch & Ship Order' : 'Update Shipping Tracking'}
            </h2>
            <p className="shipping-modal-subtitle">
              Order #{orderShortId} • {customerName}
            </p>
          </div>
        </div>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f3f4f6' } }}
        >
          <X size={20} />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, pt: 2.5 }}>
          {/* Order Quick Summary Card */}
          <div className="shipping-order-brief">
            <div className="brief-left">
              <span className="brief-label">Recipient Address:</span>
              <p className="brief-text">
                {[
                  order.shippingAddress?.address,
                  order.shippingAddress?.city,
                  order.shippingAddress?.state,
                  order.shippingAddress?.pincode
                ].filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="brief-right">
              <span className="brief-label">Total Amount:</span>
              <p className="brief-price">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="shipping-form-fields">
            {/* Courier Name */}
            <div className="form-group">
              <label className="input-label">
                Courier / Delivery Partner <span className="text-gray-400">(Optional)</span>
              </label>
              <Autocomplete
                freeSolo
                options={COMMON_COURIERS.map(c => c.name)}
                value={courierName}
                onChange={(e, val) => handleCourierChange(val || '')}
                onInputChange={(e, val) => handleCourierChange(val || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="e.g. Delhivery, Blue Dart, DTDC, India Post"
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#fafafa'
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* Tracking ID / AWB */}
            <div className="form-group">
              <label className="input-label">
                Tracking ID / AWB Number <span className="text-emerald-700">*</span>
              </label>
              <TextField
                fullWidth
                size="small"
                value={trackingCode}
                onChange={(e) => handleTrackingCodeChange(e.target.value)}
                placeholder="e.g. DEL123456789, AWB987654"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }
                }}
              />
            </div>

            {/* Tracking URL */}
            <div className="form-group">
              <label className="input-label">
                Tracking URL Link <span className="text-gray-400">(Live Tracking Website)</span>
              </label>
              <TextField
                fullWidth
                size="small"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://www.delhivery.com/track/package/..."
                helperText="Customer can click this link directly in their email to track their parcel"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.72rem',
                    color: '#6b7280',
                    mt: 0.5
                  }
                }}
              />
            </div>

            {/* Email Trigger Option Card */}
            <div className={`shipping-email-trigger-box ${sendEmail && recipientEmail.trim() ? 'trigger-active' : ''}`}>
              <div className="trigger-icon-wrap">
                <Mail size={20} className="trigger-mail-icon" />
              </div>
              <div className="trigger-content">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      disabled={loading}
                      sx={{
                        color: '#16a34a',
                        '&.Mui-checked': {
                          color: '#15803d',
                        },
                        p: 0,
                        mr: 1
                      }}
                    />
                  }
                  label={
                    <span className="trigger-label-title">
                      Send Shipping &amp; Tracking Email to Customer
                    </span>
                  }
                  sx={{ m: 0 }}
                />

                {/* Recipient Email Input Field */}
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Customer Email Address:
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => {
                      setRecipientEmail(e.target.value);
                      if (e.target.value.trim() && !sendEmail) {
                        setSendEmail(true);
                      }
                    }}
                    placeholder="e.g. customer@gmail.com"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        fontSize: '0.82rem'
                      }
                    }}
                  />
                </div>

                {!recipientEmail.trim() && (
                  <div className="no-email-alert" style={{ marginTop: '6px' }}>
                    <AlertCircle size={13} />
                    <span>Please enter a customer email above to send notification</span>
                  </div>
                )}

                <p className="trigger-note" style={{ marginTop: '8px' }}>
                  Email includes live tracking button, Courier details, Tracking ID, and full product summary.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#4b5563',
              borderRadius: '8px',
              px: 2
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#15803d',
              '&:hover': { backgroundColor: '#166534' },
              borderRadius: '8px',
              px: 3,
              py: 1,
              boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CircularProgress size={16} color="inherit" /> Updating...
              </span>
            ) : sendEmail && recipientEmail.trim() ? (
              'Confirm & Send Email'
            ) : (
              'Save & Mark Shipped'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
