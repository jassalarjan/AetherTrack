import dotenv from 'dotenv';
import emailService from './utils/emailService.js';

dotenv.config();

const testBrevoEmail = async () => {
  console.log('🧪 Testing Brevo Email Service...\n');
  
  console.log('📧 Sending test credential email...');
  const result = await emailService.sendCredentialEmail(
    process.env.BREVO_SENDER_EMAIL, // Send to yourself for testing
    'Test User',
    'TestPassword123!'
  );
  
  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\n✨ Check your inbox:', process.env.BREVO_SENDER_EMAIL);
  } else {
    console.log('❌ Email sending failed!');
    console.log('Error:', result.error);
  }
};

testBrevoEmail().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
