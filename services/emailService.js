const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Chào mừng đến với Quản lý Tài chính',
        html: `
          <h1>Chào mừng ${user.name}!</h1>
          <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
          <p>Bắt đầu quản lý tài chính hiệu quả ngay hôm nay!</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      logger.error('Email send error:', error);
    }
  }

  async sendBudgetAlert(user, category, spent, budget) {
    try {
      const percentage = Math.round((spent / budget) * 100);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Cảnh báo ngân sách - ${category}`,
        html: `
          <h2>Cảnh báo vượt ngân sách!</h2>
          <p>Danh mục: <strong>${category}</strong></p>
          <p>Đã chi: <strong>${spent.toLocaleString()} VND</strong></p>
          <p>Ngân sách: <strong>${budget.toLocaleString()} VND</strong></p>
          <p>Tỷ lệ: <strong>${percentage}%</strong></p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Budget alert sent to ${user.email}`);
    } catch (error) {
      logger.error('Budget alert email error:', error);
    }
  }

  async sendMonthlyReport(user, report) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Báo cáo tài chính tháng',
        html: `
          <h2>Báo cáo tháng ${new Date().getMonth() + 1}</h2>
          <p>Tổng thu nhập: <strong>${report.income.toLocaleString()} VND</strong></p>
          <p>Tổng chi tiêu: <strong>${report.expense.toLocaleString()} VND</strong></p>
          <p>Số dư: <strong>${(report.income - report.expense).toLocaleString()} VND</strong></p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Monthly report sent to ${user.email}`);
    } catch (error) {
      logger.error('Monthly report email error:', error);
    }
  }
}

module.exports = new EmailService();
