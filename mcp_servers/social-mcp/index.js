#!/usr/bin/env node
/**
 * Social Media MCP Server
 * 
 * Provides social media posting integration for Facebook, Instagram, and Twitter/X.
 * Supports post drafting, publishing, and summary generation.
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

// Social Media Configuration from environment
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID || '';
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || '';
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID || '';
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || '';
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';

/**
 * Post to Facebook Page
 * 
 * @param {Object} params - Post parameters
 * @returns {Object} - Post result
 */
async function postToFacebook(params) {
  const { message, link, image_url } = params;

  try {
    console.log('[Social MCP] Posting to Facebook:', message.substring(0, 50));

    // Prepare post data
    const postData = {
      message: message,
      access_token: FACEBOOK_ACCESS_TOKEN
    };

    if (link) {
      postData.link = link;
    }

    // Post to Facebook Graph API
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`,
      postData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[Social MCP] Facebook post created:', response.data.id);

    return {
      success: true,
      post_id: response.data.id,
      platform: 'facebook',
      message: `Facebook post ${response.data.id} created successfully`
    };

  } catch (error) {
    console.error('[Social MCP] Facebook post failed:', error.message);
    return {
      success: false,
      error: error.message,
      platform: 'facebook',
      message: 'Failed to post to Facebook'
    };
  }
}

/**
 * Post to Instagram Business Account
 * 
 * @param {Object} params - Post parameters
 * @returns {Object} - Post result
 */
async function postToInstagram(params) {
  const { caption, image_url } = params;

  try {
    console.log('[Social MCP] Posting to Instagram:', caption.substring(0, 50));

    if (!image_url) {
      throw new Error('Instagram posts require an image_url');
    }

    // Step 1: Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media`,
      {
        image_url: image_url,
        caption: caption,
        access_token: INSTAGRAM_ACCESS_TOKEN
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const creationId = containerResponse.data.id;

    // Step 2: Publish media
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media_publish`,
      {
        creation_id: creationId,
        access_token: INSTAGRAM_ACCESS_TOKEN
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[Social MCP] Instagram post created:', publishResponse.data.id);

    return {
      success: true,
      post_id: publishResponse.data.id,
      platform: 'instagram',
      message: `Instagram post ${publishResponse.data.id} created successfully`
    };

  } catch (error) {
    console.error('[Social MCP] Instagram post failed:', error.message);
    return {
      success: false,
      error: error.message,
      platform: 'instagram',
      message: 'Failed to post to Instagram'
    };
  }
}

/**
 * Post to Twitter/X
 * 
 * @param {Object} params - Post parameters
 * @returns {Object} - Post result
 */
async function postToTwitter(params) {
  const { text } = params;

  try {
    console.log('[Social MCP] Posting to Twitter:', text.substring(0, 50));

    // Validate tweet length
    if (text.length > 280) {
      throw new Error('Tweet text exceeds 280 character limit');
    }

    // Post to Twitter API v2
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: text
      },
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[Social MCP] Twitter post created:', response.data.data.id);

    return {
      success: true,
      post_id: response.data.data.id,
      platform: 'twitter',
      message: `Twitter post ${response.data.data.id} created successfully`
    };

  } catch (error) {
    console.error('[Social MCP] Twitter post failed:', error.message);
    return {
      success: false,
      error: error.message,
      platform: 'twitter',
      message: 'Failed to post to Twitter'
    };
  }
}

/**
 * Generate social media summary from activity data
 * 
 * @param {Object} params - Summary parameters
 * @returns {Object} - Summary result
 */
async function generateSummary(params) {
  const { activities, platform } = params;

  try {
    console.log('[Social MCP] Generating summary for platform:', platform);

    // Generate platform-specific summary
    let summary = '';
    
    if (platform === 'facebook') {
      summary = `🎉 This Week in Review:\n\n${activities.join('\n')}\n\n#WeeklyReview #BusinessUpdate`;
    } else if (platform === 'instagram') {
      summary = `✨ Weekly Highlights ✨\n\n${activities.join('\n')}\n\n#BusinessGrowth #WeeklyHighlights #Entrepreneur`;
    } else if (platform === 'twitter') {
      summary = `📊 Week in Review: ${activities.slice(0, 2).join(' | ')} #WeeklyReview`;
    } else {
      summary = `Weekly Summary:\n\n${activities.join('\n')}`;
    }

    console.log('[Social MCP] Summary generated:', summary.substring(0, 50));

    return {
      success: true,
      summary: summary,
      platform: platform,
      character_count: summary.length,
      message: `Summary generated for ${platform} (${summary.length} characters)`
    };

  } catch (error) {
    console.error('[Social MCP] Summary generation failed:', error.message);
    return {
      success: false,
      error: error.message,
      platform: platform,
      message: 'Failed to generate summary'
    };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'social-mcp',
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
        name: 'facebook_post',
        description: 'Create post on Facebook Page',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Post message'
            },
            link: {
              type: 'string',
              description: 'Link to share (optional)'
            },
            image_url: {
              type: 'string',
              description: 'Image URL to share (optional)'
            }
          },
          required: ['message']
        }
      },
      {
        name: 'instagram_post',
        description: 'Create post on Instagram Business Account',
        inputSchema: {
          type: 'object',
          properties: {
            caption: {
              type: 'string',
              description: 'Post caption'
            },
            image_url: {
              type: 'string',
              description: 'Image URL (required for Instagram)'
            }
          },
          required: ['caption', 'image_url']
        }
      },
      {
        name: 'twitter_post',
        description: 'Create tweet on Twitter/X',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Tweet text (max 280 characters)',
              maxLength: 280
            }
          },
          required: ['text']
        }
      },
      {
        name: 'social_generate_summary',
        description: 'Generate social media summary from activity data',
        inputSchema: {
          type: 'object',
          properties: {
            activities: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of activities to summarize'
            },
            platform: {
              type: 'string',
              enum: ['facebook', 'instagram', 'twitter'],
              description: 'Target platform for summary'
            }
          },
          required: ['activities', 'platform']
        }
      }
    ]
  };
});

// Handle CallTool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'facebook_post') {
    const result = await postToFacebook(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'instagram_post') {
    const result = await postToInstagram(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'twitter_post') {
    const result = await postToTwitter(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'social_generate_summary') {
    const result = await generateSummary(args);
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
  console.error('[Social MCP] Starting Social Media MCP Server...');

  // Check configuration
  const configStatus = {
    facebook: FACEBOOK_PAGE_ID && FACEBOOK_ACCESS_TOKEN ? 'configured' : 'NOT configured',
    instagram: INSTAGRAM_USER_ID && INSTAGRAM_ACCESS_TOKEN ? 'configured' : 'NOT configured',
    twitter: TWITTER_BEARER_TOKEN ? 'configured' : 'NOT configured'
  };

  console.error('[Social MCP] Configuration status:', configStatus);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Social MCP] Server running on stdio');
}

main().catch((error) => {
  console.error('[Social MCP] Fatal error:', error);
  process.exit(1);
});
