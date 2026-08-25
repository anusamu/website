// emailTemplates.js

/**
 * Generate a responsive, modern HTML email template for order shipment
 * @param {Object} params
 * @param {Object} params.order - The order document
 * @param {string} params.trackingCode - Tracking ID / AWB
 * @param {string} params.trackingUrl - Direct tracking URL link
 * @param {string} params.courierName - Name of courier service
 * @returns {string} HTML string
 */
exports.generateShippingEmail = ({ order, trackingCode, trackingUrl, courierName }) => {
  const customerName = `${order.shippingAddress?.firstName || 'Valued'} ${order.shippingAddress?.lastName || 'Customer'}`.trim();
  const orderId = order._id ? order._id.toString() : 'N/A';
  const orderShortId = orderId.length > 8 ? orderId.slice(-8).toUpperCase() : orderId;
  const courier = courierName || 'Express Courier';
  const trackId = trackingCode || 'Not provided';
  const address = order.shippingAddress || {};
  const items = order.items || [];
  const totalAmount = order.totalAmount || 0;

  // Build items HTML
  const itemsHtml = items
    .map((item) => {
      const prod = item.product || {};
      const name = prod.productName || prod.name || prod.title || item.productName || 'Handloom Product';
      const image = prod.images?.[0] || prod.image || item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&auto=format&fit=crop&q=80';
      const size = item.size || 'Standard';
      const qty = item.quantity || 1;
      const unitPrice = item.price || prod.price || prod.wholesalePrice || 0;
      const itemTotal = unitPrice * qty;

      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td width="64" style="vertical-align: top; padding-right: 14px;">
                  <img src="${image}" alt="${name}" width="60" height="60" style="border-radius: 8px; object-fit: cover; display: block; border: 1px solid #e2e8f0;" />
                </td>
                <td style="vertical-align: middle;">
                  <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b; line-height: 1.3;">
                    ${name}
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #64748b;">
                    <span style="display: inline-block; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-weight: 500;">Size: ${size}</span>
                    <span style="margin: 0 6px;">•</span>
                    <span>Qty: ${qty}</span>
                  </p>
                </td>
                <td align="right" style="vertical-align: middle; white-space: nowrap;">
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">
                    ₹${itemTotal.toLocaleString('en-IN')}
                  </p>
                  <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">
                    (₹${unitPrice.toLocaleString('en-IN')} each)
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  // Primary Action Button for Tracking
  const trackingButtonHtml = trackingUrl
    ? `
      <div style="text-align: center; margin: 24px 0 12px 0;">
        <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);">
          🚚 TRACK YOUR SHIPMENT
        </a>
      </div>
      <p style="margin: 0; text-align: center; font-size: 11px; color: #64748b; word-break: break-all;">
        Direct link: <a href="${trackingUrl}" target="_blank" style="color: #16a34a; text-decoration: underline;">${trackingUrl}</a>
      </p>
    `
    : `
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">
        Please visit the ${courier} website to track your parcel with Tracking ID: <strong>${trackId}</strong>
      </p>
    `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Been Shipped - Rajagopal Handlooms</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #14532d 0%, #15803d 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px; font-family: Georgia, serif;">
                RAJAGOPAL HANDLOOMS
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; color: #dcfce7; letter-spacing: 2px; font-weight: 600;">
                Pure Authentic Handloom Weaves
              </p>
            </td>
          </tr>

          <!-- Status Alert Banner -->
          <tr>
            <td style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 14px 24px; text-align: center;">
              <span style="display: inline-block; font-size: 13px; font-weight: 700; color: #166534; letter-spacing: 0.5px;">
                🎉 ORDER STATUS: DISPATCHED &amp; ON THE WAY
              </span>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 28px 24px;">
              
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Hello ${customerName},
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Exciting news! Your order <strong style="color: #0f172a;">#${orderShortId}</strong> has been handed over to our courier partner and is now on its way to you.
              </p>

              <!-- Tracking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4; margin: 20px 0; padding: 18px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px dashed #d6d3d1;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase;">
                                Courier Partner
                              </td>
                              <td align="right" style="font-size: 14px; font-weight: 700; color: #1c1917;">
                                ${courier}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 8px; font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase;">
                                Tracking ID / AWB
                              </td>
                              <td align="right" style="padding-top: 8px; font-size: 14px; font-weight: 700; font-family: monospace; color: #15803d; background-color: #f0fdf4; padding: 2px 8px; border-radius: 4px; border: 1px solid #bbf7d0;">
                                ${trackId}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          ${trackingButtonHtml}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Ordered Items List -->
              <div style="margin-top: 28px;">
                <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                  Items In This Shipment (${items.length})
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  ${itemsHtml}
                </table>
              </div>

              <!-- Shipping Address & Order Summary Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-top: 2px solid #f1f5f9; padding-top: 18px;">
                <tr>
                  <td width="55%" style="vertical-align: top; padding-right: 14px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">
                      Delivery Address
                    </h4>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1e293b; font-weight: 600;">
                      ${customerName}
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.4; color: #475569;">
                      ${address.address || ''}${address.appartment ? ', ' + address.appartment : ''}<br/>
                      ${[address.city, address.state].filter(Boolean).join(', ')}${address.pincode ? ' - ' + address.pincode : ''}<br/>
                      ${address.phone ? 'Phone: ' + address.phone : ''}
                    </p>
                  </td>
                  <td width="45%" style="vertical-align: top; background: #f8fafc; border-radius: 8px; padding: 12px 16px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">
                      Payment Summary
                    </h4>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Payment:</td>
                        <td align="right" style="color: #16a34a; font-weight: 600; padding: 3px 0;">Paid Online</td>
                      </tr>
                      <tr>
                        <td style="color: #0f172a; font-weight: 700; padding: 6px 0 0 0; border-top: 1px solid #e2e8f0;">Total Amount:</td>
                        <td align="right" style="color: #0f172a; font-weight: 800; font-size: 14px; padding: 6px 0 0 0; border-top: 1px solid #e2e8f0;">₹${totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #334155;">
                Thank you for choosing Rajagopal Handlooms!
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; line-height: 1.5; color: #94a3b8;">
                If you have any questions or need assistance with your order, feel free to reply to this email or reach out to our customer care team.
              </p>
              <p style="margin: 0; font-size: 10px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px;">
                &copy; ${new Date().getFullYear()} RAJAGOPAL HANDLOOMS. ALL RIGHTS RESERVED.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
