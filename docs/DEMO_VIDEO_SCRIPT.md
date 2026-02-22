# Hackathon 0 Demo Video Script

**Personal AI Employee - Gold Tier**  
**Duration**: 5-7 minutes  
**Date**: 2026-02-22

---

## Scene 1: Introduction (30 seconds)

**Visual**: Title slide with project name, Hackathon 0 logo

**Narration**:
"Welcome to the Gold Tier Personal AI Employee demonstration for Hackathon 0. I'm [Your Name], and today I'll show you a fully autonomous AI employee that manages both personal and business affairs 24/7."

**On Screen**:
- Project: Gold Tier Personal AI Employee
- Hackathon 0 Submission
- Key Features: Cross-Domain Integration, Autonomous Operation, CEO Briefings

---

## Scene 2: System Architecture (45 seconds)

**Visual**: Architecture diagram from docs/architecture.md

**Narration**:
"The system is built on a modular architecture with 5 key components: Watchers for perception, Ralph Wiggum Loop for reasoning, Agent Skills for action, MCP servers for integration, and comprehensive logging for audit trails."

**On Screen** (highlight each as mentioned):
- Watchers: cross_domain_trigger.py, ralph_wiggum_loop.py
- Ralph Wiggum Loop: READ → REASON → PLAN → ACT → CHECK
- Agent Skills: 18 skills documented
- MCP Servers: 5 servers (email, odoo, social, browser, docs)
- Logging: audit_log.jsonl, ralph_wiggum_log.jsonl, error_log.jsonl

---

## Scene 3: Cross-Domain Trigger Demo (90 seconds)

**Visual**: Terminal showing WhatsApp message simulation

**Narration**:
"Let me demonstrate a cross-domain flow. I'll send a WhatsApp message about a completed project, and the AI will automatically create an invoice in Odoo."

**On Screen**:
```
Simulating WhatsApp message:
"Hi! The project is completed. Please send invoice for $5000 to Client ABC."
```

**Visual**: Show task file created in Needs_Action folder

**Narration**:
"The cross-domain trigger detector picked up the message, extracted the amount and client name, and created a task file with HITL approval workflow."

**On Screen**:
- Task file content showing extracted data ($5000, Client ABC)
- HITL Approval section
- Required Actions checklist

---

## Scene 4: Ralph Wiggum Loop Demo (90 seconds)

**Visual**: Plan.md file with iteration tracking

**Narration**:
"The Ralph Wiggum Loop takes over now, implementing the Handbook Section 2D pattern. It iterates through READ, REASON, PLAN, ACT, and CHECK phases until the task is complete or max iterations reached."

**On Screen**:
- Plan.md showing: status, total_steps, completed_steps, iteration
- Iteration log entries in ralph_wiggum_log.jsonl
- Task moving from Needs_Action → Pending_Approval → Approved → Done

**Narration**:
"In this demo, the loop completed in 4 iterations: reading the task, reasoning about invoice creation, planning the Odoo API call, executing via odoo-mcp, and checking completion."

---

## Scene 5: CEO Briefing Demo (60 seconds)

**Visual**: Dashboard.md with CEO Briefing section

**Narration**:
"Every Sunday at 11:59 PM, the AI generates a CEO Briefing with revenue, expenses, bottlenecks, and actionable insights. Let me show you the latest briefing."

**On Screen**:
- Dashboard.md scrolling through sections:
  - Revenue summary
  - Expenses breakdown
  - Bottlenecks identified
  - Task completion rate
  - Actionable insights

**Narration**:
"The briefing integrates data from Odoo for financials, task folders for bottlenecks, and generates platform-specific social media summaries."

---

## Scene 6: Error Recovery Demo (60 seconds)

**Visual**: Terminal showing simulated API timeout

**Narration**:
"Let's see how the system handles failures. I'll simulate an Odoo API timeout."

**On Screen**:
```
Simulating API timeout...
Retry 1/3 after 2s delay
Retry 2/3 after 4s delay
Retry 3/3 after 8s delay
```

**Visual**: Show error_log.jsonl entry

**Narration**:
"The error recovery skill implements exponential backoff. After 3 failed retries, it falls back to manual alert with full context in the Inbox folder."

**On Screen**:
- Alert file in /Inbox with error details
- Recommended manual action
- Comprehensive error logging

---

## Scene 7: MCP Servers Demo (60 seconds)

**Visual**: Show all 5 MCP server directories

**Narration**:
"The system uses 5 specialized MCP servers for different action types, exceeding the handbook requirement of 4 servers."

**On Screen** (show each server's package.json and index.js):
1. email-mcp: SMTP email sending
2. odoo-mcp: Odoo JSON-RPC API (3 tools)
3. social-mcp: Facebook/Instagram/Twitter (4 tools)
4. browser-mcp: Playwright automation (3 tools)
5. docs-mcp: Documentation lookup (2 tools)

**Narration**:
"Each MCP server is independently deployable and maintains clear separation of concerns."

---

## Scene 8: Agent Skills Demo (45 seconds)

**Visual**: skills/ directory with 18 SKILL.md files

**Narration**:
"All AI functionality is implemented as Agent Skills. We have 18 skills total: 7 from Silver Tier and 11 new Gold Tier skills."

**On Screen** (scroll through skills/ directory):
- Silver skills: read_task.md, plan_action.md, write_report.md, etc.
- Gold skills: odoo_create_invoice.md, facebook_post.md, error_recovery.md, etc.

**Narration**:
"Each skill has complete documentation with Purpose, Inputs, Outputs, Examples, Dependencies, and Usage instructions."

---

## Scene 9: Test Results (45 seconds)

**Visual**: Run end-to-end test suite

**Narration**:
"Let's run the Gold Tier end-to-end test suite to verify all functionality."

**On Screen**:
```
GOLD TIER END-TO-END TEST SUITE
Total Tests: 6
Passed: 6 ✅
Failed: 0
Pass Rate: 100.0%
```

**Narration**:
"All 6 tests passed: 3 cross-domain flows, Ralph Wiggum loop, CEO Briefing generation, and audit logging. The system is ready for production deployment."

---

## Scene 10: Conclusion & Next Steps (45 seconds)

**Visual**: Project summary slide

**Narration**:
"The Gold Tier Personal AI Employee is complete with 110 tasks implemented, 18 Agent Skills documented, 5 MCP servers deployed, and 100% test pass rate. All handbook requirements are met."

**On Screen**:
- Tasks: 110/110 (100%)
- Agent Skills: 18 documented
- MCP Servers: 5 operational
- Test Pass Rate: 100%
- Handbook Compliance: 100%

**Narration**:
"Next steps include Platinum Tier development with cloud deployment, multi-user support, and A2A messaging. Thank you for watching!"

**On Screen**:
- Hackathon 0 Logo
- "Thank You!"
- GitHub Repository Link
- Contact Information

---

## Recording Tips

### Screen Recording
- Use OBS Studio or similar for screen capture
- Record at 1080p, 30fps
- Ensure terminal text is readable (increase font size if needed)

### Audio
- Use a quiet room with minimal background noise
- Speak clearly and at moderate pace
- Consider using a microphone for better audio quality

### Editing
- Add transitions between scenes
- Include text overlays for key points
- Add background music (optional, keep volume low)

### Timing
- Total duration: 5-7 minutes
- Practice narration before recording
- Allow extra time for scene transitions

---

## Backup Plan

If live demo fails:
1. Use pre-recorded screen captures of each feature
2. Show test results and acceptance checklist
3. Reference documentation and code structure
4. Emphasize handbook compliance (100%)

---

*Script per Hackathon 0 submission requirements*
