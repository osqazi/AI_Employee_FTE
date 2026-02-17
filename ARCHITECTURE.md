# Architecture: Bronze Tier Foundation

**Feature**: Bronze Tier Foundation  
**Branch**: `001-bronze-tier-foundation`  
**Date**: 2026-02-17  
**Purpose**: High-level architecture diagrams and component relationships

---

## System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        AI_Employee_Vault                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Dashboard   │  │   Inbox/     │  │   Needs_Action/        │ │
│  │  (status)    │  │   (triggers) │  │   (pending tasks)      │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Handbook    │  │   Done/      │  │   Pending_Approval/    │ │
│  │  (rules)     │  │   (complete) │  │   (awaiting user)      │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## Component Diagram

```
                              ┌─────────────────┐
                              │   Obsidian      │
                              │   (GUI/Memory)  │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │ AI_Employee_Vault│
                              │                 │
                              │ ┌─────────────┐ │
                              │ │ Dashboard   │ │
                              │ │ .md         │ │
                              │ └─────────────┘ │
                              │ ┌─────────────┐ │
                              │ │ Inbox/      │ │◄── External Triggers
                              │ └─────────────┘ │
                              │ ┌─────────────┐ │
                              │ │ Needs_Action│ │──┐
                              │ └─────────────┘ │  │
                              │ ┌─────────────┐ │  │
                              │ │ Pending_    │ │  │
                              │ │ Approval/   │ │  │
                              │ └─────────────┘ │  │
                              │ ┌─────────────┐ │  │
                              │ │ Done/       │ │◄─┘
                              │ └─────────────┘ │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
          ┌─────────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
          │  File Watcher    │ │ Dashboard    │ │ File           │
          │  (perception)    │ │ Updater      │ │ Operations     │
          │                  │ │ (visibility) │ │ (movement)     │
          │ - Monitor Inbox  │ │ - 30s poll   │ │ - Move files   │
          │ - Create tasks   │ │ - Count tasks│ │ - Update status│
          │ - Log operations │ │ - Recent act │ │ - Log ops      │
          └─────────┬────────┘ └──────────────┘ └────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │  Agent Skills   │
          │  (capabilities) │
          │                 │
          │ ┌─────────────┐ │
          │ │ read_task   │ │
          │ └─────────────┘ │
          │ ┌─────────────┐ │
          │ │ plan_action │ │
          │ └─────────────┘ │
          │ ┌─────────────┐ │
          │ │ write_report│ │
          │ └─────────────┘ │
          │ ┌─────────────┐ │
          │ │ file_ops    │ │
          │ └─────────────┘ │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  Claude Code    │
          │  (reasoning)    │
          │                 │
          │ - Read tasks    │
          │ - Plan actions  │
          │ - Execute plans │
          │ - Write reports │
          └─────────────────┘
```

---

## Data Flow

### Task Creation Flow

```
External Trigger (file in Inbox)
         │
         ▼
┌─────────────────┐
│ File Watcher    │
│ - Detects file  │
│ - Creates task  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Needs_Action/   │◄── Task file with YAML frontmatter
│ task_TIMESTAMP  │     - source
│ .md             │     - timestamp
└─────────────────┘     - status
                        - priority
```

### Task Processing Flow

```
Task in Needs_Action/
         │
         ▼
┌─────────────────┐
│ Agent Skills    │
│ - read_task     │
│ - plan_action   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Claude Code     │
│ - Execute plan  │
│ - Check HITL    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────────┐
│ HITL  │ │ No Approval  │
│ Needed│ │ Needed       │
└───┬───┘ └────┬─────────┘
    │          │
    ▼          ▼
┌─────────┐ ┌──────────┐
│ Pending │ │ Execute  │
│_Approval│ │ Actions  │
└────┬────┘ └────┬─────┘
     │           │
     │           ▼
     │    ┌──────────────┐
     │    │ write_report │
     │    └──────┬───────┘
     │           │
     │           ▼
     │    ┌──────────────┐
     │    │ Move to Done │
     │    └──────────────┘
     │
     ▼
┌────────────┐
│ User       │
│ Reviews    │
└─────┬──────┘
      │
      ▼
┌─────────────┐
│ Approve     │
│ (move back) │
└─────────────┘
```

### Dashboard Update Flow

```
┌─────────────────┐
│ Dashboard       │
│ Updater         │
│ (every 30s)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Scan Folders    │
│ - Inbox/        │
│ - Needs_Action/ │
│ - Pending_      │
│   Approval/     │
│ - Done/         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Count Files     │
│ Update Counts   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Write Dashboard │
│ .md             │
│ - Task Summary  │
│ - Recent Activity│
│ - System Health │
└─────────────────┘
```

---

## Component Responsibilities

| Component | File | Responsibility |
|-----------|------|----------------|
| **File Watcher** | `watchers/file_watcher.py` | Monitor Inbox for triggers, create task files |
| **Dashboard Updater** | `watchers/dashboard_updater.py` | Refresh Dashboard.md every 30 seconds |
| **File Operations** | `watchers/file_operations.py` | Move files between folders, update status |
| **Agent Skills** | `skills/*.md` | Documented capabilities for Claude Code |
| **Test Suite** | `tests/*.py` | Unit and end-to-end tests |

---

## Vault Folder Purposes

| Folder | Purpose | Trigger |
|--------|---------|---------|
| **Inbox/** | Raw triggers, manual review | External files, errors |
| **Needs_Action/** | Pending tasks | Watcher creates here |
| **Pending_Approval/** | Awaiting HITL | Claude Code moves here |
| **Done/** | Completed tasks | Final destination |

---

## Technology Stack

```
┌─────────────────────────────────────┐
│  Python 3.13+                       │
│  - pathlib (file operations)        │
│  - json (structured logging)        │
│  - shutil (file movement)           │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Obsidian v1.10.6+                  │
│  - Markdown vault                   │
│  - Real-time GUI                    │
│  - Local-first storage              │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Claude Code                        │
│  - Reasoning engine                 │
│  - Skill execution                  │
│  - HITL coordination                │
└─────────────────────────────────────┘
```

---

## Security Boundaries

```
┌─────────────────────────────────────────┐
│  Trusted Zone (Local)                   │
│  ┌─────────────────────────────────┐   │
│  │  AI_Employee_Vault/             │   │
│  │  - All data local               │   │
│  │  - No external sync (Bronze)    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              │
              │ HITL Boundary
              ▼
┌─────────────────────────────────────────┐
│  External Actions (Silver+)             │
│  - Email sending                        │
│  - API calls                            │
│  - Social media                         │
│  → All require HITL approval            │
└─────────────────────────────────────────┘
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-17
