#!/usr/bin/env python3
"""
Workflow Manager - Gold Tier

Manages task workflow:
1. Scans Needs_Action for tasks requiring approval
2. Moves approval-required tasks to Pending_Approval
3. Processes approved tasks from Approved/
4. Archives completed tasks to Done/

Usage: python watchers/workflow_manager.py
"""

import logging
import shutil
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('workflow_manager')


class WorkflowManager:
    """Manages task workflow through the system."""
    
    def __init__(self, vault_path: str):
        """
        Initialize workflow manager.
        
        Args:
            vault_path: Path to AI_Employee_Vault
        """
        self.vault = Path(vault_path)
        self.needs_action = self.vault / 'Needs_Action'
        self.pending_approval = self.vault / 'Pending_Approval'
        self.approved = self.vault / 'Approved'
        self.done = self.vault / 'Done'
        self.rejected = self.vault / 'Rejected'
        
        # Ensure all folders exist
        for folder in [self.needs_action, self.pending_approval, self.approved, self.done, self.rejected]:
            folder.mkdir(exist_ok=True)
        
        logger.info(f'WorkflowManager initialized - Vault: {self.vault}')
    
    def scan_for_approval_tasks(self) -> list:
        """
        Scan Needs_Action for tasks requiring approval.
        
        Returns:
            List of task files that need approval
        """
        approval_tasks = []
        
        # Keywords that indicate a task needs approval
        approval_keywords = [
            'approval',
            'pending approval',
            'requires approval',
            'HITL',
            'human approval',
            'complex task',
            'high priority',
            'financial',
            'invoice',
            'payment',
            'contract',
            'agreement'
        ]
        
        try:
            for task_file in self.needs_action.glob('*.md'):
                content = task_file.read_text().lower()
                
                # Check if task requires approval
                needs_approval = any(keyword in content for keyword in approval_keywords)
                
                # Also check for explicit status
                if 'status: pending_approval' in content:
                    needs_approval = True
                
                if needs_approval:
                    approval_tasks.append(task_file)
                    logger.info(f'Task requires approval: {task_file.name}')
        
        except Exception as e:
            logger.error(f'Error scanning for approval tasks: {e}')
        
        return approval_tasks
    
    def move_to_pending_approval(self, task_file: Path) -> bool:
        """
        Move task to Pending_Approval folder.
        
        Args:
            task_file: Path to task file
            
        Returns:
            True if successful
        """
        try:
            dest_path = self.pending_approval / task_file.name
            
            # Read and update content
            content = task_file.read_text()
            content = content.replace(
                'status: pending',
                'status: pending_approval'
            )
            content = content.replace(
                '## Notes',
                f'## Workflow\n\n**Moved to Pending_Approval**: {datetime.now().isoformat()}\n\n## Notes'
            )
            
            # Move file
            shutil.move(str(task_file), str(dest_path))
            dest_path.write_text(content)
            
            logger.info(f'Task moved to Pending_Approval: {dest_path.name}')
            return True
            
        except Exception as e:
            logger.error(f'Error moving task to Pending_Approval: {e}')
            return False
    
    def scan_approved_tasks(self) -> list:
        """
        Scan Approved folder for tasks to execute.
        
        Returns:
            List of approved task files
        """
        approved_tasks = []
        
        try:
            for task_file in self.approved.glob('*.md'):
                approved_tasks.append(task_file)
                logger.info(f'Approved task ready for execution: {task_file.name}')
        
        except Exception as e:
            logger.error(f'Error scanning approved tasks: {e}')
        
        return approved_tasks
    
    def execute_approved_task(self, task_file: Path) -> bool:
        """
        Execute approved task and move to Done.
        
        Args:
            task_file: Path to approved task file
            
        Returns:
            True if successful
        """
        try:
            dest_path = self.done / task_file.name
            
            # Read and update content
            content = task_file.read_text()
            content = content.replace(
                'status: approved',
                'status: completed'
            )
            content = content.replace(
                '## Notes',
                f'## Completion\n\n**Completed**: {datetime.now().isoformat()}\n\n## Notes'
            )
            
            # Move file
            shutil.move(str(task_file), str(dest_path))
            dest_path.write_text(content)
            
            logger.info(f'Task executed and moved to Done: {dest_path.name}')
            return True
            
        except Exception as e:
            logger.error(f'Error executing approved task: {e}')
            return False
    
    def run_workflow_cycle(self):
        """
        Run one complete workflow cycle.
        
        Returns:
            Dict with cycle statistics
        """
        stats = {
            'moved_to_approval': 0,
            'executed': 0,
            'errors': 0
        }
        
        logger.info('Starting workflow cycle...')
        
        # Step 1: Move tasks requiring approval to Pending_Approval
        approval_tasks = self.scan_for_approval_tasks()
        for task_file in approval_tasks:
            if self.move_to_pending_approval(task_file):
                stats['moved_to_approval'] += 1
            else:
                stats['errors'] += 1
        
        # Step 2: Execute approved tasks
        approved_tasks = self.scan_approved_tasks()
        for task_file in approved_tasks:
            if self.execute_approved_task(task_file):
                stats['executed'] += 1
            else:
                stats['errors'] += 1
        
        logger.info(f'Workflow cycle complete: {stats}')
        return stats


def main():
    """Run workflow manager."""
    import sys
    
    if len(sys.argv) < 2:
        vault_path = 'AI_Employee_Vault'
    else:
        vault_path = sys.argv[1]
    
    manager = WorkflowManager(vault_path)
    
    print('='*60)
    print('WORKFLOW MANAGER - Gold Tier')
    print('='*60)
    print(f'\nVault: {vault_path}')
    print('\nRunning workflow cycle...\n')
    
    stats = manager.run_workflow_cycle()
    
    print('\n' + '='*60)
    print('WORKFLOW CYCLE COMPLETE')
    print('='*60)
    print(f'Tasks moved to Pending_Approval: {stats["moved_to_approval"]}')
    print(f'Tasks executed: {stats["executed"]}')
    print(f'Errors: {stats["errors"]}')
    print('='*60)
    
    return 0 if stats['errors'] == 0 else 1


if __name__ == '__main__':
    import sys
    sys.exit(main())
