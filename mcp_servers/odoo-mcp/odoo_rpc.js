/**
 * Odoo JSON-RPC Client Utility
 * 
 * Provides low-level JSON-RPC API calls to Odoo Community.
 * Used by odoo-mcp server for all Odoo operations.
 */

import axios from 'axios';

/**
 * Odoo RPC Client class
 */
export class OdooRPCClient {
  /**
   * Create Odoo RPC client
   * 
   * @param {string} url - Odoo instance URL
   * @param {string} database - Database name
   * @param {string} apiKey - API key
   */
  constructor(url, database, apiKey) {
    this.url = url;
    this.database = database;
    this.apiKey = apiKey;
  }

  /**
   * Call Odoo JSON-RPC API
   * 
   * @param {string} model - Odoo model name (e.g., 'account.move')
   * @param {string} method - Model method (e.g., 'create', 'search_read')
   * @param {Array} args - Method arguments
   * @returns {Object} - API response
   */
  async call(model, method, args = []) {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute',
        args: [
          this.database,
          this.apiKey,
          model,
          method,
          ...args
        ]
      }
    };

    try {
      const response = await axios.post(`${this.url}/web/dataset/call_kw`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('[Odoo RPC] API call failed:', error.message);
      throw error;
    }
  }

  /**
   * Test Odoo connection
   * 
   * @returns {boolean} - True if connection successful
   */
  async testConnection() {
    try {
      await this.call('res.partner', 'search_read', [[], ['name']], { limit: 1 });
      return true;
    } catch (error) {
      console.error('[Odoo RPC] Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Create invoice
   * 
   * @param {Object} invoiceData - Invoice data
   * @returns {Object} - Creation result
   */
  async createInvoice(invoiceData) {
    return await this.call('account.move', 'create', [invoiceData]);
  }

  /**
   * Search and read records
   * 
   * @param {string} model - Model name
   * @param {Array} domain - Search domain
   * @param {Array} fields - Fields to return
   * @returns {Object} - Search results
   */
  async searchRead(model, domain, fields) {
    return await this.call(model, 'search_read', [domain, fields]);
  }

  /**
   * Write/update record
   * 
   * @param {string} model - Model name
   * @param {number} id - Record ID
   * @param {Object} values - Values to update
   * @returns {Object} - Write result
   */
  async write(model, id, values) {
    return await this.call(model, 'write', [[id], values]);
  }
}

// Export default instance creator
export function createOdooClient(url, database, apiKey) {
  return new OdooRPCClient(url, database, apiKey);
}
