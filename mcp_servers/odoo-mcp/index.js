#!/usr/bin/env node
/**
 * Odoo MCP Server
 * 
 * Provides Odoo Community accounting integration via JSON-RPC API.
 * Supports invoice creation, transaction logging, and audit reports.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Odoo Configuration from environment
const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
const ODOO_DB = process.env.ODOO_DATABASE || 'odoo_db';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

/**
 * Call Odoo JSON-RPC API
 * 
 * @param {string} model - Odoo model name (e.g., 'account.move')
 * @param {string} method - Model method (e.g., 'create', 'search_read')
 * @param {Array} args - Method arguments
 * @returns {Object} - API response
 */
async function callOdooAPI(model, method, args = []) {
  try {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute',
        args: [
          ODOO_DB,
          ODOO_API_KEY,
          model,
          method,
          ...args
        ]
      }
    };

    const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('[Odoo MCP] API call failed:', error.message);
    throw error;
  }
}

/**
 * Create invoice in Odoo
 * 
 * @param {Object} params - Invoice parameters
 * @returns {Object} - Invoice creation result
 */
async function createInvoice(params) {
  const { partner_id, amount, project, line_items = [] } = params;

  try {
    console.log('[Odoo MCP] Creating invoice for partner:', partner_id);

    // Prepare invoice line items
    const invoice_lines = line_items.length > 0 ? line_items : [
      [0, 0, {
        name: `${project} - Consulting Services`,
        price_unit: amount,
        quantity: 1
      }]
    ];

    // Create invoice
    const result = await callOdooAPI('account.move', 'create', [{
      move_type: 'out_invoice',
      partner_id: partner_id,
      invoice_line_ids: invoice_lines
    }]);

    console.log('[Odoo MCP] Invoice created:', result.result);

    return {
      success: true,
      invoice_id: result.result,
      message: `Invoice ${result.result} created successfully`
    };

  } catch (error) {
    console.error('[Odoo MCP] Invoice creation failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create invoice'
    };
  }
}

/**
 * Log transaction in Odoo accounting
 * 
 * @param {Object} params - Transaction parameters
 * @returns {Object} - Transaction logging result
 */
async function logTransaction(params) {
  const { type, account_id, amount, description, category } = params;

  try {
    console.log('[Odoo MCP] Logging transaction:', description);

    // Create journal entry
    const result = await callOdooAPI('account.move', 'create', [{
      move_type: type === 'expense' ? 'in_invoice' : 'out_invoice',
      partner_id: account_id,
      invoice_line_ids: [
        [0, 0, {
          name: description,
          price_unit: amount,
          quantity: 1
        }]
      ]
    }]);

    console.log('[Odoo MCP] Transaction logged:', result.result);

    return {
      success: true,
      transaction_id: result.result,
      message: `Transaction ${result.result} logged successfully`
    };

  } catch (error) {
    console.error('[Odoo MCP] Transaction logging failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to log transaction'
    };
  }
}

/**
 * Run audit report for date range
 * 
 * @param {Object} params - Audit parameters
 * @returns {Object} - Audit report
 */
async function runAudit(params) {
  const { start_date, end_date, filters = {} } = params;

  try {
    console.log('[Odoo MCP] Running audit from', start_date, 'to', end_date);

    // Search for invoices in date range
    const domain = [
      ['date', '>=', start_date],
      ['date', '<=', end_date]
    ];

    const result = await callOdooAPI('account.move', 'search_read', [domain, ['name', 'amount_total', 'state', 'date']]);

    console.log('[Odoo MCP] Audit complete:', result.result.length, 'invoices found');

    // Calculate totals
    const total_revenue = result.result
      .filter(inv => inv.move_type === 'out_invoice')
      .reduce((sum, inv) => sum + inv.amount_total, 0);

    const total_expenses = result.result
      .filter(inv => inv.move_type === 'in_invoice')
      .reduce((sum, inv) => sum + inv.amount_total, 0);

    return {
      success: true,
      total_invoices: result.result.length,
      total_revenue: total_revenue,
      total_expenses: total_expenses,
      profit: total_revenue - total_expenses,
      invoices: result.result,
      message: `Audit complete: ${result.result.length} invoices, $${total_revenue} revenue, $${total_expenses} expenses`
    };

  } catch (error) {
    console.error('[Odoo MCP] Audit failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to run audit'
    };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'odoo-mcp',
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
        name: 'odoo_create_invoice',
        description: 'Create invoice in Odoo via JSON-RPC API',
        inputSchema: {
          type: 'object',
          properties: {
            partner_id: {
              type: 'integer',
              description: 'Odoo partner (client) ID'
            },
            amount: {
              type: 'number',
              description: 'Invoice amount'
            },
            project: {
              type: 'string',
              description: 'Project name'
            },
            line_items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  price_unit: { type: 'number' }
                }
              }
            }
          },
          required: ['partner_id', 'amount', 'project']
        }
      },
      {
        name: 'odoo_log_transaction',
        description: 'Log transaction (expense/revenue) in Odoo accounting',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['expense', 'revenue']
            },
            account_id: {
              type: 'integer',
              description: 'Odoo account/partner ID'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount'
            },
            description: {
              type: 'string',
              description: 'Transaction description'
            },
            category: {
              type: 'string',
              description: 'Transaction category'
            }
          },
          required: ['type', 'account_id', 'amount', 'description']
        }
      },
      {
        name: 'odoo_run_audit',
        description: 'Run audit report for date range',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: {
              type: 'string',
              format: 'date',
              description: 'Start date (YYYY-MM-DD)'
            },
            end_date: {
              type: 'string',
              format: 'date',
              description: 'End date (YYYY-MM-DD)'
            },
            filters: {
              type: 'object',
              description: 'Additional filters'
            }
          },
          required: ['start_date', 'end_date']
        }
      }
    ]
  };
});

// Handle CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'odoo_create_invoice') {
    const result = await createInvoice(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'odoo_log_transaction') {
    const result = await logTransaction(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'odoo_run_audit') {
    const result = await runAudit(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: `Unknown tool: ${name}`
        })
      }
    ]
  };
});

// Start server
async function main() {
  console.error('[Odoo MCP] Starting Odoo MCP Server...');

  // Test Odoo connection
  try {
    console.error('[Odoo MCP] Testing Odoo connection to', ODOO_URL);
    // Simple test - try to read partners
    await callOdooAPI('res.partner', 'search_read', [[], ['name']], { limit: 1 });
    console.error('[Odoo MCP] Odoo connection successful');
  } catch (error) {
    console.error('[Odoo MCP] Odoo connection failed:', error.message);
    console.error('[Odoo MCP] Server will start but Odoo operations will fail until connection is fixed');
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Odoo MCP] Server running on stdio');
}

main().catch((error) => {
  console.error('[Odoo MCP] Fatal error:', error);
  process.exit(1);
});
