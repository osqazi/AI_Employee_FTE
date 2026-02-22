#!/usr/bin/env node
/**
 * Email Test Script
 * 
 * Tests email-mcp server with actual email sending.
 * Make sure SMTP credentials are updated in .env before running.
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || '587';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Test email configuration
const TEST_EMAIL = {
  from: SMTP_USER,
  to: SMTP_USER, // Send to self for testing
  subject: 'Silver Tier Live Test - Email MCP Verification',
  text: 'This is a test email from the Silver Tier email-mcp server.\n\nIf you received this, the email MCP server is working correctly!\n\nBest regards,\nAI Employee',
  html: `
    <h2>Silver Tier Live Test</h2>
    <p>This is a test email from the <strong>email-mcp server</strong>.</p>
    <p>If you received this, the email MCP server is working correctly!</p>
    <br/>
    <p>Best regards,<br/>AI Employee</p>
  `
};

async function testEmailSending() {
  console.log('='.repeat(60));
  console.log('EMAIL MCP LIVE TEST');
  console.log('='.repeat(60));
  console.log(`\nSMTP Configuration:`);
  console.log(`  Host: ${SMTP_HOST}`);
  console.log(`  Port: ${SMTP_PORT}`);
  console.log(`  User: ${SMTP_USER}`);
  console.log(`  Password: ${SMTP_PASS ? '***configured***' : 'NOT SET'}`);
  console.log('\n');

  // Validate credentials
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('❌ ERROR: SMTP credentials not configured');
    console.error('   Please update .env file with valid SMTP credentials');
    console.error('   For Gmail, use Gmail App Password, not regular password');
    console.error('   Get App Password from: https://myaccount.google.com/apppasswords');
    return false;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  try {
    console.log('📧 Attempting to send test email...');
    console.log(`   To: ${TEST_EMAIL.to}`);
    console.log(`   Subject: ${TEST_EMAIL.subject}`);
    console.log('');

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send email
    const info = await transporter.sendMail(TEST_EMAIL);
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log('');
    console.log('📬 Please check your inbox to verify receipt.');
    console.log('');
    console.log('='.repeat(60));
    console.log('TEST RESULT: ✅ PASS');
    console.log('='.repeat(60));
    
    return true;

  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error(`   Error: ${error.message}`);
    console.error('');
    
    if (error.message.includes('Invalid login') || error.message.includes('BadCredentials')) {
      console.error('🔐 Authentication Error:');
      console.error('   The SMTP password appears to be invalid.');
      console.error('   For Gmail, you MUST use an App Password, not your regular password.');
      console.error('');
      console.error('   Steps to get Gmail App Password:');
      console.error('   1. Go to https://myaccount.google.com/apppasswords');
      console.error('   2. Enable 2-Factor Authentication (if not already enabled)');
      console.error('   3. Select "Mail" and your device');
      console.error('   4. Copy the 16-character App Password');
      console.error('   5. Update .env file: SMTP_PASS=your_app_password');
      console.error('');
    }
    
    console.log('='.repeat(60));
    console.log('TEST RESULT: ❌ FAIL');
    console.log('='.repeat(60));
    
    return false;
  }
}

// Run the test
testEmailSending().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
