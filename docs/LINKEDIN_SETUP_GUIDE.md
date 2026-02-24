# LinkedIn Integration Setup Guide

**Gold Tier - Personal AI Employee**  
**Version**: 1.0.0  
**Date**: 2026-02-23

---

## Overview

This guide walks you through setting up LinkedIn integration for the Personal AI Employee to post updates to LinkedIn (personal profile or organization page).

---

## Prerequisites

- LinkedIn account (personal or business)
- LinkedIn Developer account
- LinkedIn App created

---

## Step 1: Create LinkedIn App

### 1.1: Go to LinkedIn Developer Portal

**URL**: https://www.linkedin.com/developers/apps

### 1.2: Create New App

1. Click **"Create app"** button
2. Fill in app details:
   - **App name**: Personal AI Employee
   - **LinkedIn Page**: Select or create a LinkedIn Page (required)
   - **App URL**: `https://github.com/your-username/ai-assist-fte`
   - **Redirect URL**: `http://localhost:8080` (for local development)
   - **App logo**: Upload optional logo
3. Check **"I agree to LinkedIn API Terms of Service"**
4. Click **"Create app"**

### 1.3: Note App Credentials

After creation, you'll see:
- **Client ID** (copy this)
- **Client Secret** (click "Show" to reveal, copy this)

---

## Step 2: Request API Permissions

### 2.1: Go to Auth Tab

1. In your app dashboard, click **"Auth"** tab
2. Under **"OAuth 2.0 Redirect URLs"**, ensure `http://localhost:8080` is added

### 2.2: Request Permissions

1. Click **"Request access"** or **"Add product"**
2. Request these permissions:
   - ✅ **Share on LinkedIn** (`w_member_social`) - for personal posts
   - ✅ **Advertising API** (optional, for analytics)
3. Submit request (approval may take 1-3 business days)

**Note**: For organization posts, you need:
- ✅ **Admin access** to the LinkedIn Page
- ✅ **w_organization_social** permission

---

## Step 3: Get Access Token

### Option A: Manual Token (Quick Test)

1. Go to **OAuth 2.0 Playground**: https://www.linkedin.com/developers/tools/oauth/playground
2. Select your app
3. Select scopes: `w_member_social`
4. Click **"Allow"**
5. Copy the **Access Token**

### Option B: Programmatic Token (Production)

Use OAuth 2.0 authorization code flow:

```javascript
// Step 1: Authorization URL
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
  `response_type=code&` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=http://localhost:8080&` +
  `scope=w_member_social`;

// Open authUrl in browser, user authorizes

// Step 2: Exchange code for token
const tokenResponse = await axios.post(
  'https://www.linkedin.com/oauth/v2/accessToken',
  new URLSearchParams({
    grant_type: 'authorization_code',
    code: AUTHORIZATION_CODE,
    redirect_uri: 'http://localhost:8080',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  })
);

const accessToken = tokenResponse.data.access_token;
```

---

## Step 4: Get Person URN

### 4.1: Get Your LinkedIn Person ID

```bash
curl -X GET "https://api.linkedin.com/v2/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response**:
```json
{
  "id": "AbCdEfGhIj",
  "firstName": {
    "localized": {
      "en_US": "John"
    }
  },
  "lastName": {
    "localized": {
      "en_US": "Doe"
    }
  }
}
```

### 4.2: Format Person URN

Format as: `urn:li:person:AbCdEfGhIj`

---

## Step 5: Get Organization ID (For Company Pages)

### 5.1: Get Organization by Vanity Name

```bash
curl -X GET "https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=your-company" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response**:
```json
{
  "elements": [
    {
      "id": 12345678,
      "vanityName": "your-company",
      "name": "Your Company Name"
    }
  ]
}
```

### 5.2: Format Organization URN

Format as: `urn:li:organization:12345678`

---

## Step 6: Update .env File

Open `.env` file and add:

```env
# LinkedIn Configuration
LINKEDIN_CLIENT_ID=AbCdEfGhIj123456
LINKEDIN_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456789
LINKEDIN_ACCESS_TOKEN=AQEd... (your long access token)
LINKEDIN_ORGANIZATION_ID=12345678
LINKEDIN_PERSON_URN=urn:li:person:AbCdEfGhIj
```

---

## Step 7: Test LinkedIn Integration

### 7.1: Run Test Script

```bash
cd mcp_servers/social-mcp
node test_linkedin_live.js
```

### 7.2: Expected Output

```
============================================================
LINKEDIN LIVE POST TEST
============================================================

📋 Configuration:
   Access Token: AQEd...
   Person URN: urn:li:person:AbCdEfGhIj
   Organization ID: 12345678

📝 Posting to Organization Page...
   Author: urn:li:organization:12345678
   Post: 🧪 Gold Tier Live Test...

✅ Post successful!
   Post ID: urn:li:share:703809992810259

🎉 LINKEDIN LIVE TEST PASSED!
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause**: Invalid or expired access token

**Solution**:
- Access tokens expire after 60 days
- Get new token from OAuth playground or re-authorize

### Issue: 403 Forbidden

**Cause**: Missing permissions

**Solution**:
- Request `w_member_social` permission for personal posts
- Request `w_organization_social` permission for organization posts
- Ensure you're admin of the LinkedIn Page

### Issue: 400 Bad Request

**Cause**: Invalid API format

**Solution**:
- Use LinkedIn API v2 format
- Include required fields: `text`, `distributions`, `owner`, `visibility`
- Use proper URN format: `urn:li:person:ID` or `urn:li:organization:ID`

### Issue: App Not Approved

**Cause**: LinkedIn API access requires approval

**Solution**:
- Wait for approval (1-3 business days)
- Use manual token from OAuth playground for testing
- Ensure app has valid LinkedIn Page associated

---

## API Limits

| Resource | Limit |
|----------|-------|
| Posts per day (personal) | 150 |
| Posts per day (organization) | 100 |
| Text length | 1300 characters |
| Images per post | 5 |
| API calls per day | 500,000 |

---

## Best Practices

1. **Post consistently** (1-2 times per day max)
2. **Use relevant hashtags** (3-5 per post)
3. **Include images** for higher engagement
4. **Post during business hours** (9 AM - 5 PM)
5. **Engage with comments** on your posts
6. **Monitor analytics** for post performance

---

## Next Steps

After setup:

1. ✅ Test with `test_linkedin_live.js`
2. ✅ Integrate with social-mcp server
3. ✅ Use `linkedin_post` Agent Skill
4. ✅ Monitor LinkedIn for posted updates

---

**Setup Complete**: LinkedIn integration ready for Gold Tier!

---

*LinkedIn Integration Setup Guide - Gold Tier*
