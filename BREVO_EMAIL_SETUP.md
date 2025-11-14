# Brevo Email Service Configuration Guide

This application now uses **Brevo (formerly Sendinblue)** for sending transactional emails instead of Nodemailer SMTP.

## Why Brevo?

- ✅ **Reliable delivery** - Industry-leading email infrastructure
- ✅ **No SMTP configuration** - Simple API key authentication
- ✅ **Free tier** - 300 emails/day on free plan
- ✅ **Better deliverability** - Professional email service
- ✅ **Easy setup** - No firewall or port issues

## Setup Instructions

### Step 1: Create a Brevo Account

1. Go to [https://www.brevo.com/](https://www.brevo.com/)
2. Click "Sign up free"
3. Complete the registration process
4. Verify your email address

### Step 2: Get Your API Key

1. Log in to your Brevo account
2. Go to **Account → SMTP & API → API Keys**
3. Click "Create a new API key"
4. Give it a name (e.g., "AetherTrack")
5. Copy the generated API key (you'll only see it once!)

### Step 3: Verify Your Sender Email

1. In Brevo dashboard, go to **Senders & IP**
2. Click "Add a sender"
3. Enter the email address you want to send from (e.g., `noreply@yourdomain.com`)
4. Verify the email address (check your inbox)

### Step 4: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Brevo Email Configuration
BREVO_API_KEY=your_api_key_here
BREVO_SENDER_EMAIL=your_verified_email@domain.com

# Application URL (for email links)
APP_URL=http://localhost:3000
```

### Step 5: Remove Old Email Variables (Optional)

You can remove these old Nodemailer variables from your `.env`:

```env
# These are no longer needed:
# EMAIL_HOST=
# EMAIL_PORT=
# EMAIL_USER=
# EMAIL_PASSWORD=
# EMAIL_SECURE=
```

## Testing Email Service

### Test Script

Create a test file `backend/test-brevo-email.js`:

```javascript
import emailService from './utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  console.log('🧪 Testing Brevo email service...\n');
  
  // Test credential email
  console.log('📧 Sending test credential email...');
  const result = await emailService.sendCredentialEmail(
    'test@example.com',
    'Test User',
    'TestPassword123'
  );
  
  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.messageId);
  } else {
    console.log('❌ Email failed:', result.error);
  }
};

testEmail();
```

Run the test:
```bash
node backend/test-brevo-email.js
```

## Email Functions Available

All email functions are maintained from the previous service:

### 1. Send Credential Email
```javascript
await emailService.sendCredentialEmail(
  'user@example.com',
  'John Doe',
  'tempPassword123'
);
```

### 2. Send Password Reset Email
```javascript
await emailService.sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'reset-token-here'
);
```

### 3. Send Overdue Task Reminder
```javascript
await emailService.sendOverdueTaskReminder(
  'user@example.com',
  'John Doe',
  'Complete project documentation',
  new Date('2025-01-15')
);
```

### 4. Send Weekly Report
```javascript
await emailService.sendWeeklyReport(
  'user@example.com',
  'John Doe',
  {
    completed: 15,
    inProgress: 3,
    overdue: 1,
    completionRate: 85
  }
);
```

## Brevo Free Tier Limits

- ✅ **300 emails per day**
- ✅ Unlimited contacts
- ✅ Email API & SMTP
- ✅ Email templates
- ✅ Real-time statistics

## Upgrading (Optional)

If you need more emails:
- **Lite Plan**: $25/month - 20,000 emails/month
- **Premium Plan**: $65/month - 100,000 emails/month
- **Enterprise**: Custom pricing

## Troubleshooting

### Error: "BREVO_API_KEY not set"
- Make sure you've added `BREVO_API_KEY` to your `.env` file
- Restart your backend server after adding the variable

### Error: "Invalid API key"
- Double-check that you copied the API key correctly
- Ensure there are no extra spaces in the `.env` file
- Try generating a new API key in Brevo dashboard

### Error: "Sender email not verified"
- Go to Brevo dashboard → Senders & IP
- Make sure your sender email is verified (green checkmark)
- Check your email inbox for verification link

### Emails not being received
- Check spam/junk folder
- Verify sender email is authenticated in Brevo
- Check Brevo dashboard → Statistics for delivery status
- Make sure you haven't exceeded daily limit (300 emails)

## Migration Notes

### Changes from Nodemailer

1. ✅ **No SMTP configuration needed** - Uses REST API instead
2. ✅ **Same function signatures** - No code changes required in routes
3. ✅ **Better error handling** - Clearer error messages
4. ✅ **Faster delivery** - Direct API calls vs SMTP connection
5. ✅ **Built-in templates** - All HTML templates preserved

### What stayed the same

- All email function names are identical
- HTML templates are preserved
- Return value structure is the same
- No changes needed in routes or controllers

## Support

- **Brevo Documentation**: [https://developers.brevo.com/](https://developers.brevo.com/)
- **Brevo Support**: [https://help.brevo.com/](https://help.brevo.com/)
- **API Reference**: [https://developers.brevo.com/reference/sendtransacemail](https://developers.brevo.com/reference/sendtransacemail)

## Backup

The old Nodemailer-based email service has been backed up to:
```
backend/utils/emailService.old.js
```

If you need to revert, simply rename the files.
