#!/usr/bin/env node
/**
 * Direct Email Test - No dotenv
 * 
 * Tests email sending with hardcoded credentials to verify
 * if the issue is with credentials or dotenv loading.
 */

import nodemailer from 'nodemailer';

// Manually enter credentials here for testing
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  user: 'osqazi@gmail.com',
  pass: 'jrslxofqnynsjgxe' // Replace with your actual App Password
};

console.log('='.repeat(60));
console.log('DIRECT EMAIL TEST (No dotenv)');
console.log('='.repeat(60));
console.log(`\nSMTP Configuration:`);
console.log(`  Host: ${SMTP_CONFIG.host}`);
console.log(`  Port: ${SMTP_CONFIG.port}`);
console.log(`  User: ${SMTP_CONFIG.user}`);
console.log(`  Pass: ${SMTP_CONFIG.pass ? '***' + SMTP_CONFIG.pass.slice(-4) : 'NOT SET'}`);
console.log('\n');

const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: false,
  auth: {
    user: SMTP_CONFIG.user,
    pass: SMTP_CONFIG.pass
  }
});

async function test() {
  try {
    console.log('📧 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');
    
    console.log('\n📧 Sending test email...');
    const info = await transporter.sendMail({
      from: SMTP_CONFIG.user,
      to: SMTP_CONFIG.user,
      subject: 'Direct Email Test - Silver Tier',
      text: 'This is a direct test email (no dotenv). If you received this, credentials are working!',
      html: '<h2>Direct Email Test</h2><p>Credentials are working!</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log('\n📬 Check your inbox!');
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULT: ✅ PASS');
    console.log('='.repeat(60));
    return true;
    
  } catch (error) {
    console.error('❌ Test failed!');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid login')) {
      console.error('\n🔐 Gmail rejected the password.');
      console.error('   Please verify:');
      console.error('   1. 2FA is enabled for osqazi@gmail.com');
      console.error('   2. App Password was generated for this account');
      console.error('   3. Password is exactly 16 characters (no spaces)');
      console.error('   4. Password is all lowercase');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULT: ❌ FAIL');
    console.log('='.repeat(60));
    return false;
  }
}

test().then(success => process.exit(success ? 0 : 1));
