import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TextField, Checkbox, FormControlLabel, Button, Box, 
  Typography, Divider, Modal, CircularProgress 
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../../api'; 
import { useCart } from '../../../components/Context/CartContext';
import './Checkout.css';

// Dynamically load the Razorpay checkout SDK
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    if (document.getElementById('razorpay-script')) {
      document.getElementById('razorpay-script').addEventListener('load', () => resolve(true), { once: true });
      document.getElementById('razorpay-script').addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safely extract cart context values
  const cartContext = useCart() || {};
  const cartItems = cartContext.cartItems || [];
  const clearCart = cartContext.clearCart;

  // 1. Check direct navigation ("Buy It Now") first, fallback to Cart Context
  const checkoutItems = location.state?.checkoutItems || cartItems || [];

  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + (item.product?.price || item.price || 0) * item.quantity, 
    0
  );
  const shippingFee = subtotal > 699 || subtotal === 0 ? 0 : 150;
  const totalAmount = subtotal + shippingFee;

  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Address Form States
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Kerala',
    pincode: ''
  });

  // Load Razorpay Script on mount
  useEffect(() => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toast.error('Razorpay is not configured for this storefront yet.');
      return;
    }

    loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js').then((loaded) => {
      if (!loaded) {
        toast.error('Unable to load the Razorpay payment gateway. Please try again.');
      }
    });
  }, []);

  // Fetch saved user data / profile on mount
  useEffect(() => {
    const fetchSavedAddress = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data?.success && res.data?.user) {
          const user = res.data.user;
          setFormData((prev) => ({
            ...prev,
            email: user.email || '',
            phone: user.phoneNumber || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            ...(user.addresses?.[0] || {}) // Load default address if available
          }));
        }
      } catch (err) {
        console.log("No saved address found.");
      }
    };
    fetchSavedAddress();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayNow = async (e) => {
    e.preventDefault();

    const cleanPhone = formData.phone?.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toast.error('Razorpay is not configured for this storefront yet.');
      return;
    }

    if (!window.Razorpay) {
      toast.error('The payment gateway did not load. Please refresh and try again.');
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post('/payments/create-razorpay-order', {
        amount: totalAmount,
      });

      if (!data.success || !data.order?.id) {
        throw new Error(data.message || 'Failed to create order.');
      }

      const shippingAddress = {
        email: formData.email,
        phone: cleanPhone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        appartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      // Ensure price is explicitly included per item for the backend Order Schema
      const items = checkoutItems.map((item) => ({
        product: item.product?._id || item.product || item._id,
        size: item.size || 'OS',
        quantity: Number(item.quantity || 1),
        price: Number(item.product?.price || item.price || 0)
      }));

      const options = {
        key: razorpayKey,
        order_id: data.order.id,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'ANU SAMU',
        description: 'Order Checkout',
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/orders/create', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items,
              shippingAddress,
              saveAddress,
              orderType: location.state?.orderType || 'retail' // Supports wholesale/retail tagging
            });

            if (verifyRes.data?.success) {
              if (typeof clearCart === 'function') {
                clearCart();
              }
              setInvoiceData(verifyRes.data.order || null);
              setShowInvoice(true);
              toast.success('Payment successful. Order placed.');
            } else {
              throw new Error(verifyRes.data?.message || 'Order could not be saved.');
            }
          } catch (err) {
            console.error('Order creation error:', err);
            toast.error(err.message || 'Payment completed but the order could not be saved.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: cleanPhone,
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: {
          color: '#111111',
        },
        notes: {
          orderType: 'ecommerce',
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(response.error?.description || 'Payment failed.');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h6">No items selected for checkout.</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <div className="checkout-wrapper">
      {/* Left Column: Delivery & Contact Form */}
      <div className="checkout-left">
        <form onSubmit={handlePayNow}>
          {/* Contact Details */}
          <section className="checkout-section">
            <Typography variant="h5" sx={{ fontFamily: 'serif', fontWeight: 'bold', mb: 1 }}>
              Contact Details
            </Typography>
            <TextField 
              fullWidth 
              type="email"
              label="Email Address" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
              margin="normal" 
            />
            <TextField 
              fullWidth 
              type="tel"
              label="Mobile Number" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              required 
              margin="normal" 
            />
          </section>

          {/* Delivery Details */}
          <section className="checkout-section" style={{ marginTop: '24px' }}>
            <Typography variant="h5" sx={{ fontFamily: 'serif', fontWeight: 'bold', mb: 1 }}>
              Delivery Address
            </Typography>
            <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <TextField 
                fullWidth 
                label="First Name" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange} 
              />
              <TextField 
                fullWidth 
                label="Last Name" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <TextField 
              fullWidth 
              label="Street Address" 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              required 
              margin="normal" 
            />
            <TextField 
              fullWidth 
              label="Apartment, suite, etc. (optional)" 
              name="apartment" 
              value={formData.apartment} 
              onChange={handleInputChange} 
              margin="normal" 
            />
            <div className="form-row-three" style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <TextField 
                fullWidth 
                label="City" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                required 
              />
              <TextField 
                fullWidth 
                label="State" 
                name="state" 
                value={formData.state} 
                onChange={handleInputChange} 
                required 
              />
              <TextField 
                fullWidth 
                label="Pincode" 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={saveAddress} 
                  onChange={(e) => setSaveAddress(e.target.checked)} 
                />
              }
              label="Save this address for future purchases"
              sx={{ mt: 2 }}
            />
          </section>

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading} 
            sx={{ 
              bgcolor: '#000', 
              color: '#fff', 
              py: 2, 
              mt: 3, 
              '&:hover': { bgcolor: '#333' } 
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              `Pay Now via Razorpay (₹${totalAmount.toLocaleString("en-IN")})`
            )}
          </Button>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div className="checkout-right">
        {checkoutItems.map((item, index) => {
          const itemProduct = item.product || item;
          return (
            <div className="product-summary-card" key={index} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="product-image-wrapper">
                <img 
                  src={itemProduct?.images?.[0] || "/placeholder-image.jpg"} 
                  alt={itemProduct?.productName || "Product"} 
                  width="64" 
                  height="64" 
                  style={{ borderRadius: '4px', objectFit: 'cover' }} 
                />
              </div>
              <div className="product-details">
                <Typography variant="body1" fontWeight="500">
                  {itemProduct?.productName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Size: {item.size || "OS"} | Qty: {item.quantity}
                </Typography>
                <Typography variant="subtitle2">
                  ₹ {((itemProduct?.price || item.price || 0) * item.quantity).toLocaleString("en-IN")}
                </Typography>
              </div>
            </div>
          );
        })}
        
        <Divider sx={{ my: 2 }} />
        
        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Subtotal</Typography>
          <Typography>₹ {subtotal.toLocaleString("en-IN")}</Typography>
        </div>
        
        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <Typography>Shipping</Typography>
          <Typography>{shippingFee === 0 ? "FREE" : `₹ ${shippingFee}`}</Typography>
        </div>
        
        <Divider sx={{ my: 2 }} />
        
        <div className="summary-final-total" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">INR ₹{totalAmount.toLocaleString("en-IN")}</Typography>
        </div>
      </div>

      {/* Invoice Success Modal */}
      <Modal open={showInvoice} onClose={() => { setShowInvoice(false); navigate('/'); }}>
        <Box 
          className="invoice-modal-box" 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: 400, 
            bgcolor: 'background.paper', 
            p: 4, 
            borderRadius: 2, 
            boxShadow: 24 
          }}
        >
          <Typography variant="h5" align="center" color="success.main" gutterBottom fontWeight="bold">
            ✓ Order Placed Successfully!
          </Typography>
          <Typography align="center" variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Thank you for your purchase.
          </Typography>
          <Divider />
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2">
              <b>Order ID:</b> {invoiceData?._id}
            </Typography>
            <Typography variant="subtitle2">
              <b>Payment ID:</b> {invoiceData?.paymentId}
            </Typography>
            <Typography variant="subtitle2">
              <b>Status:</b> Paid / Confirmed
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ mt: 3, bgcolor: '#000' }} 
            onClick={() => { 
              setShowInvoice(false); 
              navigate('/'); 
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Checkout;