require('dotenv').config();
const { sendEmail } = require('../utils/emailService');

(async () => {
  try {
    const to = process.argv[2] || process.env.EMAIL_USER;
    if (!to) {
      console.error('❌ Please provide recipient email: node scripts/sendTestEmail.js you@example.com');
      process.exit(1);
    }

    const result = await sendEmail({
      email: to,
      subject: 'Test email from Student Rental Platform',
      html: '<p>Hello, this is a test email sent via nodemailer.</p>',
    });

    if (result.success) {
      console.log('✅ Email sent to', to);
    } else {
      console.error('❌ Email failed:', result.error);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
})();
