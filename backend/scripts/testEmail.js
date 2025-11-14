import emailService from '../utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const testCredentialEmail = async () => {
  console.log('📧 Testing Credential Email Sending...\n');
  
  console.log('Configuration:');
  console.log('  EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('  EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('  EMAIL_USER:', process.env.EMAIL_USER);
  console.log('  CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:3000');
  console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '****** (set)' : '(not set)');
  console.log('');

  // Test data
  const testUser = {
    fullName: 'Test User',
    email: process.env.EMAIL_USER, // Send to yourself for testing
    password: 'TestPassword123'
  };

  console.log('Sending test email to:', testUser.email);
  console.log('');

  try {
    const result = await emailService.sendCredentialEmail(
      testUser.email,
      testUser.fullName,
      testUser.password
    );

    if (result.success) {
      console.log('✅ SUCCESS! Email sent successfully!');
      console.log('   Message ID:', result.messageId);
      console.log('');
      console.log('📬 Please check your inbox at:', testUser.email);
      console.log('   (Check spam folder if you don\'t see it)');
      console.log('');
      console.log('The email should contain:');
      console.log('  ✓ Welcome message');
      console.log('  ✓ Login credentials (email & password)');
      console.log('  ✓ Login button linking to:', process.env.CLIENT_URL || 'http://localhost:3000');
      console.log('  ✓ Security notice to change password');
      console.log('  ✓ Feature highlights');
    } else {
      console.log('❌ FAILED! Error sending email:');
      console.log('   Error:', result.error);
      console.log('');
      console.log('Possible issues:');
      console.log('  1. Check if EMAIL_PASSWORD is correct (use App Password for Gmail)');
      console.log('  2. Verify EMAIL_HOST and EMAIL_PORT are correct');
      console.log('  3. Check if "Less secure app access" is enabled (if applicable)');
      console.log('  4. For Gmail, generate App Password at: https://myaccount.google.com/apppasswords');
    }
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
  }

  process.exit(0);
};

// Run the test
testCredentialEmail();
