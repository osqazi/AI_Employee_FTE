# Skill: LinkedIn Post

## Purpose

Post updates to LinkedIn (personal profile or organization page) using LinkedIn API v2 via social-mcp server.

## Inputs

- `text`: Post text content (string, required, max 1300 characters)
- `author`: Author URN (string, optional) - `urn:li:person:PERSON_ID` or `urn:li:organization:ORG_ID`
- `visibility`: Post visibility (string, optional) - `PUBLIC` (default) or `CONNECTIONS_ONLY`
- `image_url`: Image URL to include (string, optional)

## Outputs

- `success`: Boolean indicating post success
- `post_id`: LinkedIn post ID (string)
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Post to Personal Profile

**Input**:
```json
{
  "text": "🎉 Excited to announce our new AI automation project! #AI #Automation #Innovation"
}
```

**Output**:
```json
{
  "success": true,
  "post_id": "urn:li:share:703809992810259",
  "message": "Post successfully published to LinkedIn"
}
```

### Example 2: Post to Organization Page

**Input**:
```json
{
  "text": "We're hiring! Join our amazing team. #NowHiring #Jobs",
  "author": "urn:li:organization:12345678"
}
```

**Output**:
```json
{
  "success": true,
  "post_id": "urn:li:share:703809992810260",
  "message": "Post successfully published to LinkedIn organization page"
}
```

### Example 3: Post with Image

**Input**:
```json
{
  "text": "Check out our latest product launch!",
  "image_url": "https://example.com/image.jpg"
}
```

**Output**:
```json
{
  "success": true,
  "post_id": "urn:li:share:703809992810261",
  "message": "Post with image successfully published"
}
```

## Dependencies

- LinkedIn API v2 access
- Valid LinkedIn Access Token
- LinkedIn App with appropriate permissions:
  - `w_member_social` (for personal posts)
  - `w_organization_social` (for organization posts)

## Usage

### Via MCP Server

```javascript
// Invoke via social-mcp
const result = await mcpServer.callTool('linkedin_post', {
  text: 'Your post text here',
  author: 'urn:li:person:YOUR_PERSON_URN' // optional
});
```

### Via Command Line

```bash
cd mcp_servers/social-mcp
node test_linkedin_live.js
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| 401 Unauthorized | Invalid/expired token | Refresh access token |
| 403 Forbidden | Missing permissions | Request `w_member_social` or `w_organization_social` scope |
| 400 Bad Request | Invalid format | Check API format requirements |
| 429 Rate Limited | Too many requests | Wait and retry later |

## LinkedIn API Limits

- **Personal Profile**: 150 posts per day
- **Organization Page**: 100 posts per day
- **Character Limit**: 1300 characters for text
- **Image Limit**: 5 images per post

## Best Practices

1. **Use meaningful hashtags** (3-5 per post)
2. **Post during business hours** for better engagement
3. **Include images** for higher engagement
4. **Keep text concise** (under 1300 characters)
5. **Use organization URN** for company posts

## Configuration

Add to `.env`:

```env
# LinkedIn Configuration
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_ACCESS_TOKEN=your_access_token_here
LINKEDIN_ORGANIZATION_ID=your_organization_id_here
LINKEDIN_PERSON_URN=urn:li:person:your_person_id
```

## Getting LinkedIn Credentials

### Step 1: Create LinkedIn App

1. Go to https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in app details
4. Accept terms

### Step 2: Get Client ID and Secret

1. Go to "Auth" tab
2. Copy Client ID
3. Copy Client Secret

### Step 3: Get Access Token

Use OAuth 2.0 authorization flow:

```
GET https://www.linkedin.com/oauth/v2/authorization?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=w_member_social
```

Exchange code for access token:

```
POST https://www.linkedin.com/oauth/v2/accessToken
  grant_type=authorization_code&
  code=AUTHORIZATION_CODE&
  redirect_uri=YOUR_REDIRECT_URI&
  client_id=YOUR_CLIENT_ID&
  client_secret=YOUR_CLIENT_SECRET
```

### Step 4: Get Person URN

```
GET https://api.linkedin.com/v2/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Response includes `id` field. Format as: `urn:li:person:YOUR_ID`

### Step 5: Get Organization ID (for company pages)

```
GET https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=YOUR_COMPANY
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

*LinkedIn Post Agent Skill - Gold Tier*
