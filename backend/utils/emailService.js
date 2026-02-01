/**
 * Email Service Utility
 */

const nodemailer = require('nodemailer');

// Tạo transporter
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error('Missing email credentials');
  }

  const port = Number(process.env.EMAIL_PORT) || 465;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

/**
 * Send email
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const sender = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
    const mailOptions = {
      from: `Student Rental Platform <${sender}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, token, userName) => {
  const verificationUrl = `${process.env.WEB_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Xác thực tài khoản</h2>
      <p>Xin chào <strong>${userName}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại Student Rental Platform!</p>
      <p>Vui lòng nhấn vào nút bên dưới để xác thực tài khoản của bạn:</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; 
                color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Xác thực tài khoản
      </a>
      <p style="color: #666; font-size: 14px;">
        Hoặc copy link sau vào trình duyệt:<br>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Link này sẽ hết hạn sau 24 giờ.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
      </p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: 'Xác thực tài khoản - Student Rental Platform',
    html,
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, token, userName) => {
  const resetUrl = `${process.env.WEB_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">Đặt lại mật khẩu</h2>
      <p>Xin chào <strong>${userName}</strong>,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p><strong>Mã xác thực:</strong> <span style="font-size: 20px; letter-spacing: 4px;">${token}</span></p>
      <p>Dùng mã 6 số này trong ứng dụng để đặt lại mật khẩu.</p>
      <p>Nếu bạn đang trên web, có thể mở link sau (nếu có trang reset):</p>
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #FF9800; 
                color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Mở trang đặt lại mật khẩu
      </a>
      <p style="color: #666; font-size: 14px;">
        Hoặc copy link sau vào trình duyệt:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Mã này sẽ hết hạn sau 1 giờ.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      </p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: 'Đặt lại mật khẩu - Student Rental Platform',
    html,
  });
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmationEmail = async (email, bookingDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">Xác nhận đặt phòng</h2>
      <p>Xin chào <strong>${bookingDetails.userName}</strong>,</p>
      <p>Đặt phòng của bạn đã được xác nhận!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Thông tin đặt phòng</h3>
        <p><strong>Phòng:</strong> ${bookingDetails.roomName}</p>
        <p><strong>Địa chỉ:</strong> ${bookingDetails.address}</p>
        <p><strong>Giá:</strong> ${bookingDetails.price.toLocaleString('vi-VN')}đ/tháng</p>
        <p><strong>Tiền cọc:</strong> ${bookingDetails.deposit.toLocaleString('vi-VN')}đ</p>
        <p><strong>Ngày bắt đầu:</strong> ${bookingDetails.checkInDate || bookingDetails.startDate}</p>
      </div>
      <p>Chủ trọ sẽ liên hệ với bạn sớm nhất.</p>
      <p style="color: #666; font-size: 14px;">
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
      </p>
    </div>
  `;

  return await sendEmail({
    email,
    subject: 'Xác nhận đặt phòng - Student Rental Platform',
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};
