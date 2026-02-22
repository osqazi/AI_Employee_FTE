# Skill: Facebook Post

## Purpose
Create posts on Facebook Business Page via social-mcp server with HITL approval workflow.

## Inputs
- `message`: Post message content (string, required)
- `link`: Link to share (string, optional)
- `image_url`: Image URL to share (string, optional)

## Outputs
- `success`: Boolean indicating post creation success
- `post_id`: Facebook post ID (string) if successful
- `platform`: 'facebook'
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Simple Text Post

**Input**:
```json
{
  "message": "🎉 Excited to announce our new product launch! #Innovation #Business"
}
```

**Output**:
```json
{
  "success": true,
  "post_id": "123456789_987654321",
  "platform": "facebook",
  "message": "Facebook post 123456789_987654321 created successfully"
}
```

### Example 2: Post with Link

**Input**:
```json
{
  "message": "Check out our latest blog post!",
  "link": "https://example.com/blog/latest"
}
```

**Output**:
```json
{
  "success": true,
  "post_id": "123456789_987654321",
  "platform": "facebook",
  "message": "Facebook post created successfully"
}
```

## Dependencies
- social-mcp server operational
- Facebook Graph API access token configured
- FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN environment variables configured

## Usage

### As Claude Code Skill

```bash
# Invoke facebook_post skill
claude-code "Use facebook_post skill to create post:
- message: Excited to announce our new product launch!
- link: https://example.com/product

Invoke via social-mcp server with HITL approval."
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Page not found | Invalid FACEBOOK_PAGE_ID | Verify page ID in settings |
| Token expired | Invalid access token | Regenerate Facebook access token |
| Connection failed | Network issue | Check internet connection |

## HITL Approval

Facebook posts require HITL approval before publishing:

1. Cross-domain trigger detected (achievement email)
2. Task created in /Needs_Action with post draft
3. User reviews and moves task to /Pending_Approval
4. facebook_post skill invoked via social-mcp
5. Post published to Facebook
6. Task moved to /Done with post_id logged
