# Skill: Instagram Post

## Purpose
Create posts on Instagram Business Account via social-mcp server with HITL approval workflow.

## Inputs
- `caption`: Post caption content (string, required)
- `image_url`: Image URL to post (string, required)

## Outputs
- `success`: Boolean indicating post creation success
- `post_id`: Instagram post ID (string) if successful
- `platform`: 'instagram'
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Standard Post

**Input**:
```json
{
  "caption": "✨ Weekly Highlights ✨ #BusinessGrowth #WeeklyHighlights",
  "image_url": "https://example.com/images/weekly-highlights.jpg"
}
```

**Output**:
```json
{
  "success": true,
  "post_id": "17841405822304914",
  "platform": "instagram",
  "message": "Instagram post 17841405822304914 created successfully"
}
```

## Dependencies
- social-mcp server operational
- Instagram Business Account connected to Facebook Page
- INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN environment variables configured

## Usage

### As Claude Code Skill

```bash
# Invoke instagram_post skill
claude-code "Use instagram_post skill to create post:
- caption: Weekly Highlights
- image_url: https://example.com/images/weekly-highlights.jpg

Invoke via social-mcp server with HITL approval."
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| User not found | Invalid INSTAGRAM_USER_ID | Verify user ID in settings |
| Token expired | Invalid access token | Regenerate Instagram access token |
| Image required | image_url missing | Provide valid image URL |
| Connection failed | Network issue | Check internet connection |

## HITL Approval

Instagram posts require HITL approval before publishing:

1. Cross-domain trigger detected (achievement email)
2. Task created in /Needs_Action with post draft
3. User reviews and moves task to /Pending_Approval
4. instagram_post skill invoked via social-mcp
5. Post published to Instagram
6. Task moved to /Done with post_id logged
