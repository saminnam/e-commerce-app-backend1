import nodemailer from "nodemailer";
import CompanyInfo from "../models/CompanyInfo.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate invoice HTML
const generateInvoiceHTML = async (order, companyInfo) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const orderId = String(order._id).slice(-6).toUpperCase();

  // Fetch product details for each item
  const productsHTML = await Promise.all(
    order.products.map(async (p) => {
      let product;
      if (p.productId && typeof p.productId === 'object') {
        product = p.productId;
      } else {
        product = await Product.findById(p.productId);
      }
      
      const productName = product?.name || "Unknown Product";
      const subtotal = p.price * p.quantity;

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${p.price}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${subtotal}</td>
        </tr>
      `;
    })
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${companyInfo.companyName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f9fafb;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #E5B236;
        }
        .company-info h1 {
          color: #1f2937;
          margin: 0 0 5px 0;
          font-size: 28px;
        }
        .company-info p {
          color: #6b7280;
          margin: 2px 0;
          font-size: 14px;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details h2 {
          color: #E5B236;
          margin: 0 0 10px 0;
          font-size: 32px;
        }
        .invoice-details p {
          color: #6b7280;
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          color: #374151;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .info-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #E5B236;
        }
        .info-box p {
          margin: 8px 0;
          color: #4b5563;
          font-size: 14px;
        }
        .info-box strong {
          color: #1f2937;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #1f2937;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
          font-size: 14px;
        }
        .total-section {
          margin-top: 30px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin: 10px 0;
        }
        .total-label {
          color: #6b7280;
          margin-right: 20px;
          font-size: 14px;
        }
        .total-amount {
          color: #1f2937;
          font-weight: 600;
          font-size: 16px;
        }
        .grand-total {
          background: #E5B236;
          color: white;
          padding: 15px 30px;
          border-radius: 6px;
          display: inline-block;
          margin-top: 20px;
        }
        .grand-total .total-label {
          color: white;
        }
        .grand-total .total-amount {
          color: white;
          font-size: 24px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 10px;
        }
        .status-confirmed {
          background: #e0e7ff;
          color: #4338ca;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <h1>${companyInfo.companyName}</h1>
            <p>${companyInfo.address}</p>
            <p>${companyInfo.city}, ${companyInfo.state} ${companyInfo.postalCode}</p>
            <p>${companyInfo.country}</p>
            <p><strong>Email:</strong> ${companyInfo.email}</p>
            <p><strong>Phone:</strong> ${companyInfo.phone}</p>
            ${companyInfo.website ? `<p><strong>Website:</strong> ${companyInfo.website}</p>` : ''}
            ${companyInfo.taxId ? `<p><strong>Tax ID:</strong> ${companyInfo.taxId}</p>` : ''}
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <span class="status-badge status-confirmed">${order.status}</span>
          </div>
        </div>

        <div class="section">
          <div class="info-grid">
            <div class="info-box">
              <p class="section-title">Bill To</p>
              <p><strong>${order.customer.name}</strong></p>
              <p>${order.customer.email}</p>
              <p>${order.customer.phone}</p>
            </div>
            <div class="info-box">
              <p class="section-title">Ship To</p>
              <p>${order.shippingAddress.street}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <p class="section-title">Order Details</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML.join('')}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-amount">₹${order.totalAmount}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Shipping:</span>
            <span class="total-amount">₹0</span>
          </div>
          <div class="total-row">
            <span class="total-label">Tax:</span>
            <span class="total-amount">₹0</span>
          </div>
          <div class="grand-total">
            <div class="total-row">
              <span class="total-label">Total:</span>
              <span class="total-amount">₹${order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>${companyInfo.companyName} | ${companyInfo.email} | ${companyInfo.phone}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send invoice email
export const sendInvoiceEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Sending invoice for order:", orderId);

    // Get order details
    const order = await Order.findById(orderId).populate('products.productId');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    console.log("Order found:", order._id, typeof order._id);

    // Get company info
    let companyInfo = await CompanyInfo.findOne();
    if (!companyInfo) {
      companyInfo = {
        companyName: "Baqavi Book Centre",
        email: process.env.EMAIL_USER,
        phone: "+91 9999999999",
        address: "123 Main Street",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600001",
        country: "India",
        taxId: "",
        website: "https://www.baqavibookcentre.com",
        logo: "",
      };
    }

    // Generate invoice HTML
    const invoiceHTML = await generateInvoiceHTML(order, companyInfo);

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customer.email,
      subject: `Invoice #${String(order._id).slice(-6).toUpperCase()} - ${companyInfo.companyName}`,
      html: invoiceHTML,
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: "Invoice sent successfully" 
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get invoice HTML (for preview)
export const getInvoiceHTML = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
    const order = await Order.findById(orderId).populate('products.productId');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Get company info
    let companyInfo = await CompanyInfo.findOne();
    if (!companyInfo) {
      companyInfo = {
        companyName: "Baqavi Book Centre",
        email: process.env.EMAIL_USER,
        phone: "+91 9999999999",
        address: "123 Main Street",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600001",
        country: "India",
        taxId: "",
        website: "https://www.baqavibookcentre.com",
        logo: "",
      };
    }

    // Generate invoice HTML
    const invoiceHTML = await generateInvoiceHTML(order, companyInfo);

    res.json({ success: true, invoiceHTML });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};