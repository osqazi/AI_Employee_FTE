---
id: 058
title: create-ai-reasoning-engine-faq
stage: misc
date: 2026-02-22
surface: agent
model: qwen-code
feature: gold-tier
branch: 003-gold-tier
user: Admin
command: Create FAQ documenting how skills work with both Claude Code and Qwen
labels: ["documentation", "gold-tier", "ai-reasoning-engine", "faq"]
links:
  spec: specs/003-gold-tier/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - docs/AI_REASONING_ENGINE_FAQ.md (NEW - 400+ lines)
tests:
  - N/A (documentation only)
---

## Prompt

Create comprehensive FAQ documenting how Agent Skills work with both Claude Code and Qwen reasoning engines. Answer: "Will skills in all the tiers call qwen instead of claude code in prompt?"

## Response snapshot

Created AI_REASONING_ENGINE_FAQ.md (400+ lines) with comprehensive FAQ explaining that Agent Skills are engine-agnostic documentation files that work with both Claude Code and Qwen. When AI_REASONING_ENGINE=qwen, skills are invoked via 'qwen' CLI command instead of 'claude'. All 18 skills work with both engines without modification. MCP servers, Ralph Wiggum loop, and Specify commands all work with both engines.

## Outcome

- ✅ Impact: Clear documentation on how skills work with both engines
- 📁 Files: AI_REASONING_ENGINE_FAQ.md (comprehensive FAQ)
- 🔁 Next prompts: Users can now understand skill invocation with both engines
- 🧠 Reflection: Skills are documentation (.md files) that describe capabilities; CLI tool (claude vs qwen) determines which engine executes the skill; toggle script switches which CLI to use

## Evaluation notes (flywheel)

- Failure modes observed: None (documentation only)
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test skill invocation with both engines
