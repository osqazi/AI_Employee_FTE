#!/usr/bin/env node
/**
 * Email MCP Server
 * 
 * Provides email sending capability via SMTP for the AI Employee system.
 * Used by Claude Code to send emails autonomously (with HITL approval).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SMTP Configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify SMTP connection on startup
async function verifySmtpConnection() {
  try {
    await transporter.verify();
    console.error('[Email MCP] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[Email MCP] SMTP connection failed:', error.message);
    return false;
  }
}

/**
 * Send email function with retry logic
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body (HTML supported)
 * @param {Array} options.attachments - Optional attachments
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @returns {Object} - Send result with success status and message
 */
async function sendEmail({ to, subject, body, attachments = [], maxRetries = 3 }) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.error(`[Email MCP] Sending email to ${to} (attempt ${attempt}/${maxRetries})`);
      
      const info = await transporter.sendMail({
        from: `"AI Employee" <${SMTP_USER}>`,
        to: to,
        subject: subject,
        text: body.replace(/<[^>]*>/g, ''), // Plain text version
        html: body,
        attachments: attachments,
      });
      
      console.error(`[Email MCP] Email sent successfully: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        message: `Email sent to ${to}`,
        attempt: attempt,
      };
      
    } catch (error) {
      lastError = error;
      console.error(`[Email MCP] Attempt ${attempt} failed:`, error.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.error(`[Email MCP] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  console.error('[Email MCP] All retries failed:', lastError.message);
  
  return {
    success: false,
    error: lastError.message,
    message: `Failed to send email after ${maxRetries} attempts`,
  };
}

// Create MCP server
const server = new Server(
  {
    name: 'email-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle ListTools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_email',
        description: 'Send an email via SMTP. Requires HITL approval before execution.',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            body: {
              type: 'string',
              description: 'Email body (HTML supported)',
            },
            attachments: {
              type: 'array',
              description: 'Optional attachments',
              items: {
                type: 'object',
                properties: {
                  filename: { type: 'string' },
                  path: { type: 'string' },
                },
              },
            },
            maxRetries: {
              type: 'number',
              description: 'Maximum retry attempts (default: 3)',
              default: 3,
            },
          },
          required: ['to', 'subject', 'body'],
        },
      },
    ],
  };
});

// Handle CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'send_email') {
    const { to, subject, body, attachments = [], maxRetries = 3 } = args;
    
    // Validate required fields
    if (!to || !subject || !body) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Missing required fields: to, subject, body',
            }),
          },
        ],
      };
    }
    
    // Send email
    const result = await sendEmail({
      to,
      subject,
      body,
      attachments,
      maxRetries,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: `Unknown tool: ${name}`,
        }),
      },
    ],
  };
});

// Start server
async function main() {
  console.error('[Email MCP] Starting Email MCP Server...');
  
  // Verify SMTP connection
  const smtpOk = await verifySmtpConnection();
  if (!smtpOk) {
    console.error('[Email MCP] Warning: SMTP connection failed. Email sending will not work.');
  }
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('[Email MCP] Server running on stdio');
}

main().catch((error) => {
  console.error('[Email MCP] Fatal error:', error);
  process.exit(1);
});
