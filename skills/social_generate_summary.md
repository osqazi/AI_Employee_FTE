# Skill: Social Generate Summary

## Purpose
Generate platform-specific social media summaries from activity data via social-mcp server with HITL approval workflow.

## Inputs
- `activities`: Array of activity strings to summarize (array of strings, required)
- `platform`: Target platform ('facebook', 'instagram', 'twitter') (string, required)

## Outputs
- `success`: Boolean indicating summary generation success
- `summary`: Generated summary text (string)
- `platform`: Target platform
- `character_count`: Summary character count (integer)
- `message`: Status message

## Examples

### Example 1: Facebook Summary

**Input**:
```json
{
  "activities": [
    "Launched new product line",
    "Welcomed 100 new customers",
    "Reached $50K monthly revenue"
  ],
  "platform": "facebook"
}
```

**Output**:
```json
{
  "success": true,
  "summary": "🎉 This Week in Review:\n\nLaunched new product line\nWelcomed 100 new customers\nReached $50K monthly revenue\n\n#WeeklyReview #BusinessUpdate",
  "platform": "facebook",
  "character_count": 145,
  "message": "Summary generated for facebook (145 characters)"
}
```

### Example 2: Instagram Summary

**Input**:
```json
{
  "activities": [
    "Team grew to 20 members",
    "Opened new office location"
  ],
  "platform": "instagram"
}
```

**Output**:
```json
{
  "success": true,
  "summary": "✨ Weekly Highlights ✨\n\nTeam grew to 20 members\nOpened new office location\n\n#BusinessGrowth #WeeklyHighlights #Entrepreneur",
  "platform": "instagram",
  "character_count": 135,
  "message": "Summary generated for instagram (135 characters)"
}
```

### Example 3: Twitter Summary

**Input**:
```json
{
  "activities": [
    "Product launch successful",
    "Customer milestone reached"
  ],
  "platform": "twitter"
}
```

**Output**:
```json
{
  "success": true,
  "summary": "📊 Week in Review: Product launch successful | Customer milestone reached #WeeklyReview",
  "platform": "twitter",
  "character_count": 95,
  "message": "Summary generated for twitter (95 characters)"
}
```

## Dependencies
- social-mcp server operational
- Platform-specific API access configured

## Usage

### As Claude Code Skill

```bash
# Invoke social_generate_summary skill
claude-code "Use social_generate_summary skill to generate Facebook summary:
- activities: ['Launched new product', 'Welcomed 100 customers']
- platform: facebook

Invoke via social-mcp server with HITL approval."
```

## Platform-Specific Formatting

### Facebook
- Emoji: 🎉
- Format: "This Week in Review:\n\n{activities}\n\n#WeeklyReview #BusinessUpdate"
- Typical length: 100-200 characters

### Instagram
- Emoji: ✨
- Format: "Weekly Highlights ✨\n\n{activities}\n\n#BusinessGrowth #WeeklyHighlights #Entrepreneur"
- Typical length: 100-150 characters (plus hashtags)

### Twitter
- Emoji: 📊
- Format: "Week in Review: {activity1} | {activity2} #WeeklyReview"
- Character limit: 280 characters max
- Typical length: 80-150 characters

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Platform invalid | Not facebook/instagram/twitter | Use valid platform name |
| Activities empty | No activities provided | Provide at least one activity |
| Summary too long | Twitter summary exceeds 280 chars | Reduce activities or use different platform |

## HITL Approval

Social summaries require HITL approval before publishing:

1. Weekly audit runs (Sunday 11:59 PM)
2. Activity data collected from past week
3. social_generate_summary skill invoked for each platform
4. Summaries added to task in /Needs_Action
5. User reviews and moves task to /Pending_Approval
6. Platform-specific post skills invoked (facebook_post, instagram_post, twitter_post)
7. Task moved to /Done with post IDs logged

## CEO Briefing Integration

Summary generation integrated with weekly CEO Briefing:

1. Weekly audit collects business activities
2. Summaries generated for all 3 platforms
3. Summaries reviewed in CEO Briefing
4. User approves selected summaries for posting
5. Approved summaries posted to respective platforms
