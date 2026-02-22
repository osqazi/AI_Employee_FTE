# Skill: Twitter Post

## Purpose
Create tweets on Twitter/X via social-mcp server with HITL approval workflow.

## Inputs
- `text`: Tweet text (max 280 characters) (string, required)

## Outputs
- `success`: Boolean indicating tweet creation success
- `post_id`: Twitter tweet ID (string) if successful
- `platform`: 'twitter'
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Standard Tweet

**Input**:
```json
{
  "text": "📊 Week in Review: Launched new product | Welcomed 100 new customers #WeeklyReview #BusinessGrowth"
}
```

**Output**:
```json
{
  "success": true,
  "post_id": "1628374950183746582",
  "platform": "twitter",
  "message": "Twitter post 1628374950183746582 created successfully"
}
```

### Example 2: Tweet Too Long

**Input**:
```json
{
  "text": "This tweet is way too long and exceeds the 280 character limit that Twitter allows for standard tweets..."
}
```

**Output**:
```json
{
  "success": false,
  "error": "Tweet text exceeds 280 character limit",
  "platform": "twitter",
  "message": "Failed to post to Twitter"
}
```

## Dependencies
- social-mcp server operational
- Twitter API v2 access configured
- TWITTER_BEARER_TOKEN environment variable configured

## Usage

### As Claude Code Skill

```bash
# Invoke twitter_post skill
claude-code "Use twitter_post skill to create tweet:
- text: Week in Review: Launched new product | Welcomed 100 new customers #WeeklyReview

Invoke via social-mcp server with HITL approval."
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Text too long | Exceeds 280 characters | Shorten tweet text |
| Token invalid | Invalid TWITTER_BEARER_TOKEN | Regenerate Twitter bearer token |
| Connection failed | Network issue | Check internet connection |
| Rate limited | Too many requests | Wait and retry later |

## HITL Approval

Twitter posts require HITL approval before publishing:

1. Cross-domain trigger detected (achievement email)
2. Task created in /Needs_Action with tweet draft
3. User reviews and moves task to /Pending_Approval
4. twitter_post skill invoked via social-mcp
5. Tweet published to Twitter/X
6. Task moved to /Done with post_id logged
