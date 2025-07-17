// backend/services/email.service.js
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Create a test account for development (no real email needed)
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Using Ethereal Email for development');
    console.log('📧 Test Account:', testAccount.user);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.log('📧 Using console logging for emails (development mode)');
    return null;
  }
};

let transporter = null;

// Initialize transporter
createTestAccount().then(trans => {
  transporter = trans;
  if (trans) {
    console.log('📧 Email service initialized with Ethereal');
  } else {
    console.log('📧 Email service using console logging');
  }
});

const sendEmail = async (to, subject, template, data) => {
  try {
    const html = await ejs.renderFile(
      path.join(__dirname, `../templates/emails/${template}.ejs`),
      data
    );
    
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"EduReview" <noreply@edureview.com>`,
        to,
        subject,
        html
      });
      console.log('📧 Email sent:', info.messageId);
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    } else {
      // Fallback to console logging for development
      console.log('📧 EMAIL WOULD BE SENT:');
      console.log('📧 To:', to);
      console.log('📧 Subject:', subject);
      console.log('📧 Template:', template);
      console.log('📧 Data:', data);
      console.log('📧 HTML Preview:', html.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('📧 Email failed to send:', error.message);
    // Don't throw error - just log it for development
  }
};

module.exports = {
  sendVerificationEmail: (email, token) => 
    sendEmail(email, 'Verify Your Email', 'verify-email', {
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`
    }),
  
  sendPasswordReset: (email, token) => 
    sendEmail(email, 'Password Reset Request', 'reset-password', {
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`
    }),
  
  sendInstituteApproval: (email, approved) => 
    sendEmail(email, 'Institute Profile Status', 'institute-status', {
      approved,
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
    })
};