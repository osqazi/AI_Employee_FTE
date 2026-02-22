#!/usr/bin/env python3
"""
Ralph Wiggum Loop Orchestrator

Implements the Stop hook pattern from Handbook Section 2D for autonomous multi-step task completion.
Keeps Claude Code iterating until tasks are complete or max iterations (10) reached.

Pattern: READ → REASON → PLAN → ACT → CHECK (iterate until complete)
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ralph_wiggum_loop')


class RalphWiggumLoop:
    """
    Ralph Wiggum Loop orchestrator for autonomous multi-step task execution.
    
    Implements Stop hook pattern:
    1. READ: Load task from /Needs_Action
    2. REASON: Analyze task, determine next step
    3. PLAN: Create/update Plan.md with action items
    4. ACT: Execute action via Agent Skills + MCP servers
    5. CHECK: Verify if task complete
       - If YES: Move to /Done, log success, exit
       - If NO: Increment iteration counter
         - If iterations < 10: Go to step 2
         - If iterations >= 10: Move to /Inbox, log failure
    """
    
    def __init__(self, vault_path: str, max_iterations: int = 10):
        """
        Initialize Ralph Wiggum Loop orchestrator.
        
        Args:
            vault_path: Path to AI_Employee_Vault directory
            max_iterations: Maximum loop iterations (default: 10)
        """
        self.vault_path = Path(vault_path)
        self.max_iterations = max_iterations
        self.needs_action = self.vault_path / 'Needs_Action'
        self.done = self.vault_path / 'Done'
        self.inbox = self.vault_path / 'Inbox'
        self.plans = self.vault_path / 'Plans'
        self.logs = self.vault_path / 'Logs'
        
        # Ensure directories exist
        for folder in [self.needs_action, self.done, self.inbox, self.plans, self.logs]:
            folder.mkdir(exist_ok=True)
        
        logger.info(f'RalphWiggumLoop initialized - Vault: {self.vault_path}, Max iterations: {max_iterations}')
    
    def load_task(self, task_file: Path) -> Optional[Dict[str, Any]]:
        """
        Load task from file.
        
        Args:
            task_file: Path to task file
            
        Returns:
            Task dictionary with frontmatter and body, or None if failed
        """
        try:
            content = task_file.read_text()
            
            # Parse frontmatter
            parts = content.split('---', 2)
            if len(parts) < 3:
                logger.error(f'Invalid task file format: {task_file}')
                return None
            
            frontmatter = {}
            for line in parts[1].strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    frontmatter[key.strip()] = value.strip()
            
            body = parts[2].strip()
            
            return {
                'file': task_file,
                'frontmatter': frontmatter,
                'body': body,
                'content': content
            }
            
        except Exception as e:
            logger.error(f'Error loading task {task_file}: {e}')
            return None
    
    def create_plan(self, task: Dict[str, Any]) -> Path:
        """
        Create Plan.md for task.
        
        Args:
            task: Task dictionary
            
        Returns:
            Path to created Plan.md
        """
        plan_filename = f"PLAN_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{task['file'].stem}.md"
        plan_path = self.plans / plan_filename
        
        timestamp = datetime.now(timezone.utc).isoformat()
        
        plan_content = f"""---
source_task: {task['file'].name}
status: active
created: {timestamp}
updated: {timestamp}
total_steps: 0
completed_steps: 0
iteration: 0
---

# Plan: {task['file'].stem}

**Source**: {task['file'].name}  
**Created**: {timestamp}

## Action Items

<!-- Action items will be added here by Claude Code -->

## Progress

**Status**: 0/0 completed (0%)

## Iteration Log

<!-- Iteration history will be logged here -->

## Completion Report

<!-- Will be filled when all checkboxes are complete -->
"""
        
        plan_path.write_text(plan_content)
        logger.info(f'Plan.md created: {plan_path}')
        
        return plan_path
    
    def log_iteration(self, plan_file: Path, iteration: int, phase: str, action: str, outcome: str, duration_ms: int) -> None:
        """
        Log iteration to ralph_wiggum_log.jsonl.
        
        Args:
            plan_file: Path to Plan.md
            iteration: Iteration number
            phase: Current phase (READ, REASON, PLAN, ACT, CHECK)
            action: Action taken
            outcome: Outcome description
            duration_ms: Duration in milliseconds
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'plan_file': str(plan_file),
            'iteration': iteration,
            'phase': phase,
            'action': action,
            'outcome': outcome,
            'duration_ms': duration_ms
        }
        
        log_file = self.logs / 'ralph_wiggum_log.jsonl'
        
        try:
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
            logger.info(f'Iteration {iteration} logged: {phase} - {action}')
        except Exception as e:
            logger.error(f'Error logging iteration: {e}')
    
    def complete_task(self, task_file: Path, plan_file: Path) -> bool:
        """
        Mark task as complete and move to /Done.
        
        Args:
            task_file: Path to task file
            plan_file: Path to Plan.md
            
        Returns:
            True if successful
        """
        try:
            # Update Plan.md status
            plan_content = plan_file.read_text()
            plan_content = plan_content.replace('status: active', 'status: completed')
            timestamp = datetime.now(timezone.utc).isoformat()
            plan_content = plan_content.replace('status: active', f'status: completed\nupdated: {timestamp}')
            plan_file.write_text(plan_content)
            
            # Move task to Done
            dest_path = self.done / task_file.name
            task_file.rename(dest_path)
            
            logger.info(f'Task completed: {task_file.name} → {dest_path}')
            
            return True
            
        except Exception as e:
            logger.error(f'Error completing task: {e}')
            return False
    
    def fail_task(self, task_file: Path, reason: str) -> bool:
        """
        Mark task as failed and move to /Inbox.
        
        Args:
            task_file: Path to task file
            reason: Failure reason
            
        Returns:
            True if successful
        """
        try:
            # Add failure note to task file
            task_content = task_file.read_text()
            task_content += f"\n\n## Failure\n\n**Reason**: {reason}\n**Time**: {datetime.now(timezone.utc).isoformat()}\n"
            task_file.write_text(task_content)
            
            # Move to Inbox
            dest_path = self.inbox / task_file.name
            task_file.rename(dest_path)
            
            logger.info(f'Task failed: {task_file.name} → {dest_path} ({reason})')
            
            return True
            
        except Exception as e:
            logger.error(f'Error failing task: {e}')
            return False
    
    def run(self, task_file: Path) -> bool:
        """
        Run Ralph Wiggum Loop for a task.
        
        Args:
            task_file: Path to task file
            
        Returns:
            True if task completed successfully
        """
        logger.info(f'Starting Ralph Wiggum Loop for: {task_file.name}')
        
        # Load task
        task = self.load_task(task_file)
        if not task:
            return False
        
        # Create Plan.md
        plan_file = self.create_plan(task)
        
        # Run loop
        iteration = 0
        while iteration < self.max_iterations:
            try:
                iteration_start = datetime.now()
                
                # READ phase
                logger.info(f'Iteration {iteration + 1}/{self.max_iterations} - READ phase')
                # Claude Code reads task and Plan.md here
                
                # REASON phase
                logger.info(f'Iteration {iteration + 1}/{self.max_iterations} - REASON phase')
                # Claude Code analyzes task and determines next step
                
                # PLAN phase
                logger.info(f'Iteration {iteration + 1}/{self.max_iterations} - PLAN phase')
                # Claude Code updates Plan.md with action items
                
                # ACT phase
                logger.info(f'Iteration {iteration + 1}/{self.max_iterations} - ACT phase')
                # Claude Code executes action via Agent Skills + MCP servers
                
                # CHECK phase
                logger.info(f'Iteration {iteration + 1}/{self.max_iterations} - CHECK phase')
                # Claude Code verifies if task is complete
                
                # Log iteration
                duration_ms = int((datetime.now() - iteration_start).total_seconds() * 1000)
                self.log_iteration(plan_file, iteration + 1, 'COMPLETE', 'Iteration completed', 'Success', duration_ms)
                
                # Check if task is complete (this would be determined by Claude Code)
                # For now, we'll just increment iteration
                iteration += 1
                
                # In real implementation, Claude Code would determine completion
                # For demonstration, we'll complete after 1 iteration
                if iteration >= 1:  # Placeholder - Claude Code would determine this
                    self.complete_task(task_file, plan_file)
                    return True
                
            except Exception as e:
                logger.error(f'Error in iteration {iteration + 1}: {e}')
                iteration += 1
        
        # Max iterations exceeded
        logger.warning(f'Max iterations ({self.max_iterations}) exceeded for {task_file.name}')
        self.fail_task(task_file, f'Max iterations ({self.max_iterations}) exceeded')
        return False


if __name__ == '__main__':
    # Test Ralph Wiggum Loop
    print('\n=== RALPH WIGGUM LOOP TEST ===')
    
    vault_path = Path('AI_Employee_Vault')
    loop = RalphWiggumLoop(str(vault_path), max_iterations=10)
    
    print(f'[OK] RalphWiggumLoop initialized')
    print(f'[OK] Max iterations: {loop.max_iterations}')
    print(f'[OK] Vault path: {loop.vault_path}')
    
    print('\n=== TEST COMPLETE ===')
