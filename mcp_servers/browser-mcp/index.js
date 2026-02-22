#!/usr/bin/env node
/**
 * Browser Automation MCP Server
 * 
 * Provides browser automation via Playwright for web interactions,
 * form filling, data extraction, and screenshot capture.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium } from 'playwright';

/**
 * Fill and submit web form
 * 
 * @param {Object} params - Form parameters
 * @returns {Object} - Form submission result
 */
async function fillForm(params) {
  const { url, fields, submit_selector } = params;

  let browser;
  try {
    console.log('[Browser MCP] Filling form at:', url);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Fill fields
    for (const [selector, value] of Object.entries(fields)) {
      await page.fill(selector, value);
    }
    
    // Submit form
    if (submit_selector) {
      await page.click(submit_selector);
      await page.waitForNavigation({ waitUntil: 'networkidle' });
    }
    
    // Take screenshot of confirmation
    const screenshot = await page.screenshot({ encoding: 'base64' });
    
    console.log('[Browser MCP] Form submitted successfully');

    await browser.close();

    return {
      success: true,
      message: 'Form submitted successfully',
      screenshot: screenshot.substring(0, 100) + '...' // Truncated for logging
    };

  } catch (error) {
    console.error('[Browser MCP] Form submission failed:', error.message);
    if (browser) await browser.close();
    return {
      success: false,
      error: error.message,
      message: 'Failed to submit form'
    };
  }
}

/**
 * Extract data from web page
 * 
 * @param {Object} params - Extraction parameters
 * @returns {Object} - Extraction result
 */
async function extractData(params) {
  const { url, selectors } = params;

  let browser;
  try {
    console.log('[Browser MCP] Extracting data from:', url);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Extract data for each selector
    const extractedData = {};
    for (const [key, selector] of Object.entries(selectors)) {
      try {
        const element = await page.$(selector);
        if (element) {
          extractedData[key] = await element.textContent();
        } else {
          extractedData[key] = null;
        }
      } catch (error) {
        extractedData[key] = `Error: ${error.message}`;
      }
    }
    
    console.log('[Browser MCP] Data extracted successfully');

    await browser.close();

    return {
      success: true,
      data: extractedData,
      message: `Extracted ${Object.keys(extractedData).length} data points`
    };

  } catch (error) {
    console.error('[Browser MCP] Data extraction failed:', error.message);
    if (browser) await browser.close();
    return {
      success: false,
      error: error.message,
      message: 'Failed to extract data'
    };
  }
}

/**
 * Navigate to URL and capture screenshot
 * 
 * @param {Object} params - Screenshot parameters
 * @returns {Object} - Screenshot result
 */
async function navigateAndScreenshot(params) {
  const { url, wait_for, timeout_ms = 30000 } = params;

  let browser;
  try {
    console.log('[Browser MCP] Navigating to:', url);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeout_ms });
    
    // Wait for specific element if specified
    if (wait_for) {
      await page.waitForSelector(wait_for, { timeout: timeout_ms });
    }
    
    // Take screenshot
    const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
    const title = await page.title();
    
    console.log('[Browser MCP] Screenshot captured successfully');

    await browser.close();

    return {
      success: true,
      screenshot: screenshot.substring(0, 100) + '...', // Truncated for logging
      title: title,
      message: `Screenshot captured for ${url}`
    };

  } catch (error) {
    console.error('[Browser MCP] Screenshot failed:', error.message);
    if (browser) await browser.close();
    return {
      success: false,
      error: error.message,
      message: 'Failed to capture screenshot'
    };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'browser-mcp',
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
        name: 'browser_fill_form',
        description: 'Fill and submit web form',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Form URL'
            },
            fields: {
              type: 'object',
              description: 'Form fields (selector: value pairs)',
              additionalProperties: { type: 'string' }
            },
            submit_selector: {
              type: 'string',
              description: 'Submit button selector (optional)'
            }
          },
          required: ['url', 'fields']
        }
      },
      {
        name: 'browser_extract_data',
        description: 'Extract data from web page using CSS selectors',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Page URL'
            },
            selectors: {
              type: 'object',
              description: 'CSS selectors (key: selector pairs)',
              additionalProperties: { type: 'string' }
            }
          },
          required: ['url', 'selectors']
        }
      },
      {
        name: 'browser_navigate_screenshot',
        description: 'Navigate to URL and capture screenshot',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Page URL'
            },
            wait_for: {
              type: 'string',
              description: 'CSS selector to wait for (optional)'
            },
            timeout_ms: {
              type: 'integer',
              description: 'Timeout in milliseconds (default: 30000)'
            }
          },
          required: ['url']
        }
      }
    ]
  };
});

// Handle CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'browser_fill_form') {
    const result = await fillForm(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'browser_extract_data') {
    const result = await extractData(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'browser_navigate_screenshot') {
    const result = await navigateAndScreenshot(args);
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
  console.error('[Browser MCP] Starting Browser Automation MCP Server...');

  // Test Playwright installation
  try {
    console.error('[Browser MCP] Testing Playwright installation...');
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    console.error('[Browser MCP] Playwright installation OK');
  } catch (error) {
    console.error('[Browser MCP] Playwright test failed:', error.message);
    console.error('[Browser MCP] Run: npx playwright install');
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Browser MCP] Server running on stdio');
}

main().catch((error) => {
  console.error('[Browser MCP] Fatal error:', error);
  process.exit(1);
});
