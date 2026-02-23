#!/usr/bin/env python3
"""
Orchestrator - Silver Tier

Manages HITL (Human-in-the-Loop) approval workflow.
Watches /Approved folder and executes approved tasks.
"""

import logging
import shutil
from pathlib import Path
from datetime import datetime
from watchers.base_watcher import BaseWatcher

# Configure logging
logger = logging.getLogger('orchestrator')


class Orchestrator(BaseWatcher):
    """
    Orchestrates HITL approval workflow.
    Extends BaseWatcher with approval workflow implementation.
    """
    
    def __init__(self, vault_path: str, poll_interval: int = 30):
        """
        Initialize orchestrator.
        
        Args:
            vault_path: Path to AI_Employee_Vault
            poll_interval: Seconds between scans (default: 30)
        """
        super().__init__(vault_path, poll_interval)
        
        # Approval workflow folders
        self.pending_approval = self.vault_path / 'Pending_Approval'
        self.approved = self.vault_path / 'Approved'
        self.rejected = self.vault_path / 'Rejected'
        
        for folder in [self.pending_approval, self.approved, self.rejected]:
            folder.mkdir(exist_ok=True)
        
        logger.info(f'Orchestrator initialized - Vault: {self.vault_path}')
    
    def scan(self) -> list:
        """
        Scan Approved folder for tasks to execute.
        
        Returns:
            List of approved task files
        """
        approved_tasks = []
        
        try:
            # Check Approved folder for tasks to execute
            for task_file in self.approved.glob('*.md'):
                approved_tasks.append(task_file)
                logger.info(f'Approved task found: {task_file.name}')
        
        except Exception as e:
            logger.error(f'Error scanning approved tasks: {e}')
        
        return approved_tasks
    
    def create_task_file(self, task_file: Path) -> Path:
        """
        Execute approved task and move to Done.
        
        Args:
            task_file: Path to approved task file
            
        Returns:
            Path to task file in Done folder
        """
        try:
            # Read task content
            content = task_file.read_text()
            
            # Check task type and execute appropriate action
            if 'type: email' in content:
                logger.info(f'Executing email task: {task_file.name}')
                # Email execution would go here (integrate with email-mcp)
            
            elif 'type: file_drop' in content:
                logger.info(f'Executing file task: {task_file.name}')
                # File processing would go here
            
            elif 'type: whatsapp_message' in content:
                logger.info(f'Executing WhatsApp task: {task_file.name}')
                # WhatsApp response would go here
            
            else:
                logger.info(f'Executing generic task: {task_file.name}')
                # Generic task execution
            
            # Move task to Done folder
            done_path = self.vault_path / 'Done' / task_file.name
            shutil.move(str(task_file), str(done_path))
            
            # Update task status
            content = content.replace('status: pending', 'status: completed')
            content = content.replace(
                '## Notes',
                f'## Completion\n\n**Completed**: {datetime.now().isoformat()}\n\n## Notes'
            )
            done_path.write_text(content)
            
            # Log operation
            self.log_operation('execute_task', {
                'task_file': str(task_file),
                'done_path': str(done_path)
            })
            
            logger.info(f'Task executed and moved to Done: {done_path.name}')
            
            return done_path
        
        except Exception as e:
            logger.error(f'Error executing task: {e}')
            return None
    
    def move_to_pending(self, task_file: Path, reason: str = ''):
        """
        Move task to Pending_Approval folder.
        
        Args:
            task_file: Path to task file
            reason: Reason for approval requirement
        """
        try:
            dest_path = self.pending_approval / task_file.name
            
            # Read and update content
            content = task_file.read_text()
            content = content.replace(
                'status: pending',
                f'status: pending_approval\napproval_reason: {reason}'
            )
            
            # Move file
            shutil.move(str(task_file), str(dest_path))
            dest_path.write_text(content)
            
            logger.info(f'Task moved to Pending_Approval: {dest_path.name}')
        
        except Exception as e:
            logger.error(f'Error moving to pending: {e}')
    
    def move_to_rejected(self, task_file: Path, reason: str = ''):
        """
        Move task to Rejected folder.
        
        Args:
            task_file: Path to task file
            reason: Reason for rejection
        """
        try:
            dest_path = self.rejected / task_file.name
            
            # Read and update content
            content = task_file.read_text()
            content = content.replace(
                'status: pending',
                f'status: rejected\nrejection_reason: {reason}\nrejected_at: {datetime.now().isoformat()}'
            )
            
            # Move file
            shutil.move(str(task_file), str(dest_path))
            dest_path.write_text(content)
            
            logger.info(f'Task moved to Rejected: {dest_path.name}')
        
        except Exception as e:
            logger.error(f'Error moving to rejected: {e}')


if __name__ == '__main__':
    # Test orchestrator
    import sys
    
    if len(sys.argv) < 2:
        print('Usage: python orchestrator.py <vault_path>')
        sys.exit(1)
    
    vault_path = sys.argv[1]
    
    orchestrator = Orchestrator(vault_path, poll_interval=10)
    
    print(f'Orchestrator starting - Vault: {vault_path}')
    print('Press Ctrl+C to stop')
    
    orchestrator.run()
