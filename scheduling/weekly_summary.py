#!/usr/bin/env python3
"""
Weekly Summary Generator for Silver Tier
Generates weekly summary reports of completed tasks and activities
"""

import logging
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('weekly_summary')


class WeeklySummaryGenerator:
    """
    Weekly summary generator that creates comprehensive weekly reports.
    """
    
    def __init__(self, vault_path: str):
        """
        Initialize the Weekly Summary Generator.
        
        Args:
            vault_path: Path to AI_Employee_Vault directory
        """
        self.vault_path = Path(vault_path)
        self.done_folder = self.vault_path / 'Done'
        self.plans_folder = self.vault_path / 'Plans'
        self.needs_action_folder = self.vault_path / 'Needs_Action'
        self.logs_folder = self.vault_path.parent / 'watchers' / 'logs'
        
        # Ensure folders exist
        for folder in [self.done_folder, self.plans_folder, self.needs_action_folder, self.logs_folder]:
            folder.mkdir(exist_ok=True)
        
        logger.info(f'WeeklySummaryGenerator initialized - Vault: {self.vault_path}')
    
    def get_week_range(self, date: datetime = None) -> tuple:
        """
        Get the start and end dates of the week containing the given date.
        
        Args:
            date: Date to get week for (defaults to today)
            
        Returns:
            Tuple of (start_date, end_date) strings (YYYY-MM-DD)
        """
        if date is None:
            date = datetime.now()
        
        # Start of week (Monday)
        start = date - timedelta(days=date.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # End of week (Sunday)
        end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
        
        return (
            start.strftime('%Y-%m-%d'),
            end.strftime('%Y-%m-%d')
        )
    
    def get_completed_tasks_for_week(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get all tasks completed within the given week.
        
        Args:
            start_date: Week start date (YYYY-MM-DD)
            end_date: Week end date (YYYY-MM-DD)
            
        Returns:
            List of task dictionaries with metadata
        """
        if not self.done_folder.exists():
            return []
        
        completed_tasks = []
        
        for file in self.done_folder.glob('*.md'):
            try:
                content = file.read_text()
                
                # Parse frontmatter
                parts = content.split('---', 2)
                if len(parts) < 3:
                    continue
                
                frontmatter = {}
                for line in parts[1].strip().split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        frontmatter[key.strip()] = value.strip()
                
                # Check if task was completed this week
                completed_date = frontmatter.get('completed', frontmatter.get('updated', ''))[:10]
                
                if start_date <= completed_date <= end_date:
                    completed_tasks.append({
                        'filename': file.name,
                        'source': frontmatter.get('source', 'unknown'),
                        'type': frontmatter.get('type', 'general'),
                        'completed': completed_date,
                        'status': frontmatter.get('status', 'completed')
                    })
                    
            except Exception as e:
                logger.error(f'Error reading file {file.name}: {e}')
        
        return completed_tasks
    
    def get_plans_completed_for_week(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get all plans completed within the given week.
        
        Args:
            start_date: Week start date (YYYY-MM-DD)
            end_date: Week end date (YYYY-MM-DD)
            
        Returns:
            List of plan dictionaries with metadata
        """
        if not self.plans_folder.exists():
            return []
        
        completed_plans = []
        
        for file in self.plans_folder.glob('PLAN_*.md'):
            try:
                content = file.read_text()
                
                # Parse frontmatter
                parts = content.split('---', 2)
                if len(parts) < 3:
                    continue
                
                frontmatter = {}
                for line in parts[1].strip().split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        frontmatter[key.strip()] = value.strip()
                
                # Check if plan was completed this week
                updated_date = frontmatter.get('updated', '')[:10]
                status = frontmatter.get('status', '')
                
                if start_date <= updated_date <= end_date and status == 'archived':
                    completed_plans.append({
                        'filename': file.name,
                        'source_task': frontmatter.get('source_task', 'unknown'),
                        'total_steps': int(frontmatter.get('total_steps', 0)),
                        'completed_steps': int(frontmatter.get('completed_steps', 0)),
                        'updated': updated_date
                    })
                    
            except Exception as e:
                logger.error(f'Error reading file {file.name}: {e}')
        
        return completed_plans
    
    def generate_weekly_summary(self, date: datetime = None) -> str:
        """
        Generate a comprehensive weekly summary report.
        
        Args:
            date: Date to generate summary for (defaults to today)
            
        Returns:
            Markdown summary content
        """
        start_date, end_date = self.get_week_range(date)
        
        completed_tasks = self.get_completed_tasks_for_week(start_date, end_date)
        completed_plans = self.get_plans_completed_for_week(start_date, end_date)
        
        # Group tasks by source
        tasks_by_source = {}
        for task in completed_tasks:
            source = task.get('source', 'unknown')
            if source not in tasks_by_source:
                tasks_by_source[source] = []
            tasks_by_source[source].append(task)
        
        # Calculate statistics
        total_tasks = len(completed_tasks)
        total_plans = len(completed_plans)
        total_steps_completed = sum(p.get('completed_steps', 0) for p in completed_plans)
        total_steps = sum(p.get('total_steps', 0) for p in completed_plans)
        
        # Generate report
        report = f"""# Weekly Summary

**Week**: {start_date} to {end_date}  
**Generated**: {datetime.now(timezone.utc).isoformat()}

## Summary Statistics

| Metric | Count |
|--------|-------|
| Tasks Completed | {total_tasks} |
| Plans Completed | {total_plans} |
| Steps Completed | {total_steps_completed}/{total_steps} |
| Completion Rate | {(total_steps_completed/total_steps*100) if total_steps > 0 else 0:.1f}% |

## Tasks by Source

"""
        
        for source, tasks in tasks_by_source.items():
            report += f"### {source.replace('_', ' ').title()}\n\n"
            report += f"**Tasks**: {len(tasks)}\n\n"
            
            for task in tasks[:10]:  # Limit to 10 per source
                report += f"- {task['filename']}\n"
            
            if len(tasks) > 10:
                report += f"- ... and {len(tasks) - 10} more\n"
            
            report += "\n"
        
        # Plans section
        if completed_plans:
            report += "## Plans Completed\n\n"
            
            for plan in completed_plans[:10]:  # Limit to 10
                completion_rate = (plan['completed_steps'] / plan['total_steps'] * 100) if plan['total_steps'] > 0 else 0
                report += f"- {plan['filename']}: {plan['completed_steps']}/{plan['total_steps']} ({completion_rate:.0f}%)\n"
            
            if len(completed_plans) > 10:
                report += f"- ... and {len(completed_plans) - 10} more\n"
        
        report += f"\n---\n*Generated by Weekly Summary Generator*\n"
        
        return report
    
    def save_weekly_summary(self, summary: str, date: datetime = None) -> Path:
        """
        Save weekly summary to file.
        
        Args:
            summary: Summary content
            date: Date for filename (defaults to today)
            
        Returns:
            Path to saved summary file
        """
        if date is None:
            date = datetime.now()
        
        week_start, _ = self.get_week_range(date)
        week_id = week_start.replace('-', '')
        
        summary_folder = self.vault_path / 'Summaries'
        summary_folder.mkdir(exist_ok=True)
        
        filename = f"Weekly_Summary_{week_id}.md"
        summary_path = summary_folder / filename
        
        summary_path.write_text(summary)
        logger.info(f'Weekly summary saved: {summary_path}')
        
        return summary_path
    
    def create_weekly_summary_task(self, summary: str) -> Path:
        """
        Create a task in Needs_Action to review the weekly summary.
        
        Args:
            summary: Weekly summary content
            
        Returns:
            Path to created task file
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        week_start, week_end = self.get_week_range()
        
        task_filename = f"WEEKLY_SUMMARY_REVIEW_{datetime.now().strftime('%Y%m%d')}.md"
        task_path = self.needs_action_folder / task_filename
        
        # Extract first 500 chars as preview
        preview = summary[:500].replace('\n', ' ') + '...' if len(summary) > 500 else summary.replace('\n', ' ')
        
        task_content = f"""---
source: weekly_summary_generator
type: weekly_review
week_start: {week_start}
week_end: {week_end}
created: {timestamp}
status: pending
priority: high
---

# Weekly Summary Review

**Week**: {week_start} to {week_end}

## Summary Preview

{preview}

## Action Items

- [ ] Review weekly summary in Summaries/ folder
- [ ] Identify key accomplishments
- [ ] Note areas for improvement
- [ ] Set priorities for next week
- [ ] Archive or file summary

## Notes

<!-- Add your review notes here -->

---
*Generated by Weekly Summary Generator*
"""
        
        task_path.write_text(task_content)
        logger.info(f'Weekly summary review task created: {task_path}')
        
        return task_path
    
    def log_action(self, action: str, status: str, details: Dict[str, Any] = None) -> None:
        """
        Log generator action to operations.log.
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': action,
            'source': 'weekly_summary.py',
            'status': status,
            'duration_ms': 0,
            'user': 'system',
            'details': details or {}
        }
        
        log_file = self.logs_folder / 'operations.log'
        
        try:
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
            logger.info(f'Action logged: {action} ({status})')
        except Exception as e:
            logger.error(f'Error logging action: {e}')


def run_weekly_summary(vault_path: str = None) -> None:
    """
    Run weekly summary generator.
    
    Args:
        vault_path: Path to AI_Employee_Vault (default: auto-detect)
    """
    if vault_path is None:
        vault_path = Path(__file__).parent.parent / 'AI_Employee_Vault'
    
    generator = WeeklySummaryGenerator(str(vault_path))
    
    # Generate summary
    summary = generator.generate_weekly_summary()
    
    # Save summary
    generator.save_weekly_summary(summary)
    
    # Create review task
    generator.create_weekly_summary_task(summary)
    
    # Log action
    generator.log_action('weekly_summary_run', 'success', {
        'summary_generated': True
    })
    
    logger.info('Weekly summary generator completed')


if __name__ == '__main__':
    print('\n=== WEEKLY SUMMARY GENERATOR TEST ===')
    run_weekly_summary()
    print('[OK] Weekly summary created successfully')
    print('=== TEST COMPLETE ===')
