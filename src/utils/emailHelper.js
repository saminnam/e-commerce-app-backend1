import nodemailer from "nodemailer";

export const sendOrderEmail = async (customerEmail, status, orderId) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Store Admin" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Update: ${status}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #E5B236;">Order Status Updated</h2>
        <p>Your order <b>#${orderId}</b> status is now: <span style="color: #2563eb; font-weight: bold;">${status}</span>.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888;">Thank you for shopping with us!</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};