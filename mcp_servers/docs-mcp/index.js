#!/usr/bin/env node
/**
 * Documentation Lookup MCP Server
 * 
 * Provides API documentation lookup and code examples
 * for common frameworks and libraries.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

/**
 * Lookup API documentation
 * 
 * @param {Object} params - Documentation parameters
 * @returns {Object} - Documentation result
 */
async function lookupAPIDocs(params) {
  const { api_name, endpoint, method } = params;

  try {
    console.log('[Docs MCP] Looking up documentation for:', api_name, endpoint || '', method || '');

    // Documentation lookup logic (simulated - in production would fetch from actual docs)
    const docSources = {
      'facebook': 'https://developers.facebook.com/docs/graph-api',
      'instagram': 'https://developers.facebook.com/docs/instagram-api',
      'twitter': 'https://developer.twitter.com/en/docs',
      'odoo': 'https://www.odoo.com/documentation/19.0/developer/reference/external_api.html',
      'gmail': 'https://developers.google.com/gmail/api',
      'playwright': 'https://playwright.dev/docs/api/class-playwright'
    };

    const docUrl = docSources[api_name.toLowerCase()] || `https://docs.google.com/search?q=${encodeURIComponent(api_name + ' API documentation')}`;

    return {
      success: true,
      documentation_url: docUrl,
      api_name: api_name,
      endpoint: endpoint || 'N/A',
      method: method || 'N/A',
      message: `Documentation found for ${api_name}`
    };

  } catch (error) {
    console.error('[Docs MCP] Documentation lookup failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to lookup documentation'
    };
  }
}

/**
 * Get code examples for API usage
 * 
 * @param {Object} params - Example parameters
 * @returns {Object} - Examples result
 */
async function getCodeExamples(params) {
  const { api_name, operation, language = 'javascript' } = params;

  try {
    console.log('[Docs MCP] Getting code examples for:', api_name, operation, language);

    // Code examples (simulated - in production would fetch from actual examples)
    const examples = {
      'facebook_post': `// Facebook Graph API Post Example
const response = await axios.post(
  'https://graph.facebook.com/v18.0/{page-id}/feed',
  {
    message: 'Your post message here',
    access_token: '{access-token}'
  }
);`,
      'instagram_post': `// Instagram Graph API Post Example
// Step 1: Create media container
const container = await axios.post(
  'https://graph.facebook.com/v18.0/{ig-user-id}/media',
  {
    image_url: 'https://example.com/image.jpg',
    caption: 'Your caption here',
    access_token: '{access-token}'
  }
);

// Step 2: Publish media
const published = await axios.post(
  'https://graph.facebook.com/v18.0/{ig-user-id}/media_publish',
  {
    creation_id: container.data.id,
    access_token: '{access-token}'
  }
);`,
      'twitter_post': `// Twitter API v2 Post Example
const response = await axios.post(
  'https://api.twitter.com/2/tweets',
  {
    text: 'Your tweet here (max 280 chars)'
  },
  {
    headers: {
      'Authorization': 'Bearer {bearer-token}',
      'Content-Type': 'application/json'
    }
  }
);`,
      'odoo_invoice': `// Odoo JSON-RPC Invoice Example
const response = await axios.post(
  'http://localhost:8069/web/dataset/call_kw',
  {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute',
      args: [
        'database',
        'api_key',
        'account.move',
        'create',
        [{
          move_type: 'out_invoice',
          partner_id: 123,
          invoice_line_ids: [[0, 0, {
            name: 'Service',
            price_unit: 100.00,
            quantity: 1
          }]]
        }]
      ]
    }
  }
);`
    };

    const exampleKey = `${api_name}_${operation}`.toLowerCase();
    const example = examples[exampleKey] || `// Example for ${api_name} ${operation}\n// Consult official documentation for detailed examples`;

    return {
      success: true,
      language: language,
      api_name: api_name,
      operation: operation,
      example: example,
      message: `Code example generated for ${api_name} ${operation}`
    };

  } catch (error) {
    console.error('[Docs MCP] Code example generation failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate code example'
    };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'docs-mcp',
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
        name: 'docs_lookup_api',
        description: 'Look up API documentation',
        inputSchema: {
          type: 'object',
          properties: {
            api_name: {
              type: 'string',
              description: 'API name (facebook, instagram, twitter, odoo, gmail, playwright)'
            },
            endpoint: {
              type: 'string',
              description: 'Specific endpoint (optional)'
            },
            method: {
              type: 'string',
              description: 'HTTP method (optional)'
            }
          },
          required: ['api_name']
        }
      },
      {
        name: 'docs_get_examples',
        description: 'Get code examples for API usage',
        inputSchema: {
          type: 'object',
          properties: {
            api_name: {
              type: 'string',
              description: 'API name'
            },
            operation: {
              type: 'string',
              description: 'Operation (post, create, update, etc.)'
            },
            language: {
              type: 'string',
              description: 'Programming language (default: javascript)',
              default: 'javascript'
            }
          },
          required: ['api_name', 'operation']
        }
      }
    ]
  };
});

// Handle CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'docs_lookup_api') {
    const result = await lookupAPIDocs(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'docs_get_examples') {
    const result = await getCodeExamples(args);
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
  console.error('[Docs MCP] Starting Documentation Lookup MCP Server...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Docs MCP] Server running on stdio');
}

main().catch((error) => {
  console.error('[Docs MCP] Fatal error:', error);
  process.exit(1);
});
