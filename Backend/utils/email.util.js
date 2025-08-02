const nodemailer = require('nodemailer');

// Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email using nodemailer
exports.sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: `AI Interview App <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || generateDefaultHTML(subject, text)
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Generate HTML email template
const generateDefaultHTML = (subject, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #4A90E2;
          padding: 15px;
          color: white;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #777;
        }
        .code {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          letter-spacing: 5px;
          margin: 20px 0;
          padding: 10px;
          background-color: #e9ecef;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>AI Interview</h2>
        </div>
        <div class="content">
          <h3>${subject}</h3>
          <p>${content.includes('code') ? 'Please use the verification code below:' : content}</p>
          ${content.includes('code') ? `<div class="code">${content.match(/\d{6}/)[0]}</div>` : ''}
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Interview App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
