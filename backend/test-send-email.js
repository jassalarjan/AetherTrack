import dotenv from 'dotenv';
import emailService from './utils/emailService.js';

dotenv.config();

const testSendEmail = async () => {
  console.log('🧪 Testing Generic sendEmail Function...\n');
  
  console.log('📧 Sending custom email...');
  const result = await emailService.sendEmail({
    to: process.env.BREVO_SENDER_EMAIL,
    subject: 'Test Custom Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #9333ea, #c026d3); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">AetherTrack</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Custom Email Test</h2>
          <p style="color: #374151;">This is a test of the generic sendEmail function.</p>
          <p>✅ If you receive this, the function works correctly!</p>
        </div>
        <div style="padding: 20px; text-align: center; background-color: #f3f4f6; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This is an automated message from AetherTrack
          </p>
        </div>
      </div>
    `,
    text: 'Custom Email Test - This is a test of the generic sendEmail function.'
  });
  
  if (result.success) {
    console.log('✅ Custom email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\n✨ Check your inbox:', process.env.BREVO_SENDER_EMAIL);
  } else {
    console.log('❌ Email sending failed!');
    console.log('Error:', result.error);
  }
};

testSendEmail().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
