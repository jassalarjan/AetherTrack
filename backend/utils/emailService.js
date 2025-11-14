import * as brevo from '@getbrevo/brevo';

let apiInstance = null;

const initializeBrevo = () => {
  if (!process.env.BREVO_API_KEY) {
    return null;
  }

  const instance = new brevo.TransactionalEmailsApi();
  const apiKey = instance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  
  return instance;
};

const sendBrevoEmail = async ({ to, subject, htmlContent, textContent, senderName = 'AetherTrack' }) => {
  try {
    if (!apiInstance) {
      apiInstance = initializeBrevo();
    }

    if (!apiInstance) {
      return {
        success: false,
        status: 'error',
        message: 'Brevo API not configured. Please set BREVO_API_KEY environment variable.'
      };
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
      name: senderName,
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@aethertrack.com'
    };
    
    sendSmtpEmail.to = Array.isArray(to) ? to : [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    
    if (textContent) {
      sendSmtpEmail.textContent = textContent;
    }

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    return {
      success: true,
      status: 'sent',
      messageId: result.messageId
    };
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      error: error.message
    };
  }
};

const sendCredentialEmail = async (email, fullName, password) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; }
    .credentials { background: #f0f9ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to AetherTrack</h1>
    </div>
    <div class="content">
      <h2>Hello, ${fullName}!</h2>
      <p>Your account has been successfully created. Here are your login credentials:</p>
      <div class="credentials">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p style="text-align: center;">
        <a href="${appUrl}/login" class="button">Login to AetherTrack</a>
      </p>
      <p><strong>Security Reminder:</strong> Please change your password after first login.</p>
    </div>
    <div class="footer">
      <p>© 2025 AetherTrack. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Welcome to AetherTrack!

Hello ${fullName},

Your account has been successfully created.

Login Credentials:
Email: ${email}
Password: ${password}

Please login at: ${appUrl}/login

For security, please change your password after first login.

Best regards,
AetherTrack Team
  `;

  return await sendBrevoEmail({
    to: email,
    subject: 'Welcome to AetherTrack - Your Login Credentials',
    htmlContent,
    textContent
  });
};

const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello ${fullName},</p>
      <p>We received a request to reset your password. Click the button below:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <div class="warning">
        <strong>⚠️ Important:</strong> This link expires in 1 hour. If you didn't request this, ignore this email.
      </div>
      <p>Or copy this link: ${resetLink}</p>
    </div>
    <div class="footer">
      <p>© 2025 AetherTrack. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Password Reset Request

Hello ${fullName},

Click this link to reset your password: ${resetLink}

This link expires in 1 hour. If you didn't request this, ignore this email.

Best regards,
AetherTrack Team
  `;

  return await sendBrevoEmail({
    to: email,
    subject: 'Password Reset Request - AetherTrack',
    htmlContent,
    textContent
  });
};

const sendOverdueTaskReminder = async (email, fullName, taskTitle, dueDate) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; }
    .task-box { background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Overdue Task Reminder</h1>
    </div>
    <div class="content">
      <p>Hello ${fullName},</p>
      <p>You have an overdue task:</p>
      <div class="task-box">
        <h3>📋 ${taskTitle}</h3>
        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
      </div>
      <p style="text-align: center;">
        <a href="${appUrl}/tasks" class="button">View Tasks</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 AetherTrack. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Overdue Task Reminder

Hello ${fullName},

You have an overdue task:
Task: ${taskTitle}
Due Date: ${new Date(dueDate).toLocaleDateString()}

View tasks at: ${appUrl}/tasks

Best regards,
AetherTrack Team
  `;

  return await sendBrevoEmail({
    to: email,
    subject: `⚠️ Overdue Task: ${taskTitle}`,
    htmlContent,
    textContent
  });
};

const sendWeeklyReport = async (email, fullName, reportData) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #2563eb; }
    .stat-label { font-size: 14px; color: #64748b; margin-top: 5px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Your Weekly Report</h1>
    </div>
    <div class="content">
      <p>Hello ${fullName},</p>
      <p>Here's your productivity summary:</p>
      <div class="stats">
        <div class="stat-box">
          <div class="stat-number">${reportData.completed || 0}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${reportData.inProgress || 0}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${reportData.overdue || 0}</div>
          <div class="stat-label">Overdue</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${reportData.completionRate || 0}%</div>
          <div class="stat-label">Completion Rate</div>
        </div>
      </div>
      <p style="text-align: center;">
        <a href="${appUrl}/analytics" class="button">View Analytics</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 AetherTrack. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Your Weekly Report

Hello ${fullName},

Productivity Summary:
- Tasks Completed: ${reportData.completed || 0}
- In Progress: ${reportData.inProgress || 0}
- Overdue: ${reportData.overdue || 0}
- Completion Rate: ${reportData.completionRate || 0}%

View full analytics at: ${appUrl}/analytics

Best regards,
AetherTrack Team
  `;

  return await sendBrevoEmail({
    to: email,
    subject: '📊 Your Weekly Productivity Report - AetherTrack',
    htmlContent,
    textContent
  });
};

// Generic sendEmail function for custom emails
const sendEmail = async ({ to, subject, html, text }) => {
  return await sendBrevoEmail({
    to,
    subject,
    htmlContent: html,
    textContent: text
  });
};

export default {
  sendCredentialEmail,
  sendPasswordResetEmail,
  sendOverdueTaskReminder,
  sendWeeklyReport,
  sendEmail
};
