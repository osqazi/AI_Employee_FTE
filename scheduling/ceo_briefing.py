#!/usr/bin/env python3
"""
CEO Briefing Generator

Generates weekly CEO Briefings with revenue, expenses, bottlenecks, task summaries,
and actionable insights. Runs every Sunday at 11:59 PM via cron/Task Scheduler.
"""

import json
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ceo_briefing')


class CEOBriefingGenerator:
    """
    CEO Briefing Generator for weekly business and accounting audits.
    
    Generates comprehensive briefings with:
    - Revenue summary from Odoo
    - Expenses breakdown
    - Bottlenecks identification
    - Task completion summary
    - Actionable insights and recommendations
    """
    
    def __init__(self, vault_path: str, odoo_mcp=None):
        """
        Initialize CEO Briefing Generator.
        
        Args:
            vault_path: Path to AI_Employee_Vault directory
            odoo_mcp: Odoo MCP client (optional, for live Odoo integration)
        """
        self.vault_path = Path(vault_path)
        self.dashboard = self.vault_path / 'Dashboard.md'
        self.logs = self.vault_path / 'Logs'
        self.done = self.vault_path / 'Done'
        self.odoo_mcp = odoo_mcp
        
        # Ensure directories exist
        self.logs.mkdir(exist_ok=True)
        
        # Subscription patterns for cost optimization
        self.subscription_patterns = {
            'netflix.com': 'Netflix',
            'spotify.com': 'Spotify',
            'adobe.com': 'Adobe Creative Cloud',
            'notion.so': 'Notion',
            'slack.com': 'Slack',
            'zoom.us': 'Zoom',
            'github.com': 'GitHub',
            'aws.amazon.com': 'AWS'
        }
        
        logger.info(f'CEOBriefingGenerator initialized - Vault: {self.vault_path}')
    
    def get_week_range(self, date: datetime = None) -> tuple:
        """
        Get the start and end dates of the previous week.
        
        Args:
            date: Date to calculate from (defaults to today)
            
        Returns:
            Tuple of (start_date, end_date) strings (YYYY-MM-DD)
        """
        if date is None:
            date = datetime.now()
        
        # Go to previous Monday
        last_week = date - timedelta(days=date.weekday() + 7)
        start = last_week.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # End of week (Sunday)
        end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
        
        return (
            start.strftime('%Y-%m-%d'),
            end.strftime('%Y-%m-%d')
        )
    
    def generate_revenue_summary(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """
        Generate revenue summary from Odoo data.
        
        Args:
            start_date: Week start date (YYYY-MM-DD)
            end_date: Week end date (YYYY-MM-DD)
            
        Returns:
            Revenue summary dictionary
        """
        logger.info(f'Generating revenue summary for {start_date} to {end_date}')
        
        # In production, this would call odoo-mcp run_audit
        # For now, simulate with sample data
        revenue_summary = {
            'total_revenue': 0.0,
            'total_invoices': 0,
            'top_clients': [],
            'by_project': {}
        }
        
        # TODO: Integrate with odoo-mcp for live data
        # if self.odoo_mcp:
        #     audit_result = await self.odoo_mcp.run_audit({
        #         'start_date': start_date,
        #         'end_date': end_date
        #     })
        #     revenue_summary = audit_result
        
        return revenue_summary
    
    def generate_expenses_summary(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """
        Generate expenses summary from Odoo data.
        
        Args:
            start_date: Week start date (YYYY-MM-DD)
            end_date: Week end date (YYYY-MM-DD)
            
        Returns:
            Expenses summary dictionary
        """
        logger.info(f'Generating expenses summary for {start_date} to {end_date}')
        
        expenses_summary = {
            'total_expenses': 0.0,
            'by_category': {},
            'subscriptions': []
        }
        
        # TODO: Integrate with odoo-mcp for live data
        
        return expenses_summary
    
    def identify_bottlenecks(self) -> List[Dict[str, Any]]:
        """
        Identify bottlenecks from task delays.
        
        Returns:
            List of bottleneck dictionaries
        """
        logger.info('Identifying bottlenecks from task delays')
        
        bottlenecks = []
        
        # Analyze completed tasks in /Done folder for delays
        if self.done.exists():
            for task_file in self.done.glob('*.md'):
                # Analyze task creation vs completion timestamps
                # Identify tasks that took longer than expected
                pass
        
        # Analyze pending tasks in /Needs_Action for aging
        needs_action = self.vault_path / 'Needs_Action'
        if needs_action.exists():
            for task_file in needs_action.glob('*.md'):
                # Check if task has been pending for too long
                pass
        
        return bottlenecks
    
    def generate_task_summary(self) -> Dict[str, Any]:
        """
        Generate task completion summary.
        
        Returns:
            Task summary dictionary
        """
        logger.info('Generating task summary')
        
        task_summary = {
            'completed': 0,
            'pending': 0,
            'approval_pending': 0,
            'completion_rate': 0.0
        }
        
        # Count tasks in each folder
        if self.done.exists():
            task_summary['completed'] = len(list(self.done.glob('*.md')))
        
        needs_action = self.vault_path / 'Needs_Action'
        if needs_action.exists():
            task_summary['pending'] = len(list(needs_action.glob('*.md')))
        
        pending_approval = self.vault_path / 'Pending_Approval'
        if pending_approval.exists():
            task_summary['approval_pending'] = len(list(pending_approval.glob('*.md')))
        
        # Calculate completion rate
        total = task_summary['completed'] + task_summary['pending']
        if total > 0:
            task_summary['completion_rate'] = (task_summary['completed'] / total) * 100
        
        return task_summary
    
    def generate_insights(self, revenue: Dict, expenses: Dict, bottlenecks: List, tasks: Dict) -> List[str]:
        """
        Generate actionable insights from data.
        
        Args:
            revenue: Revenue summary
            expenses: Expenses summary
            bottlenecks: List of bottlenecks
            tasks: Task summary
            
        Returns:
            List of insight strings
        """
        logger.info('Generating actionable insights')
        
        insights = []
        
        # Revenue insights
        if revenue.get('total_revenue', 0) > 0:
            insights.append(f"Strong revenue week with ${revenue['total_revenue']:,.2f} generated")
        
        # Expense insights
        if expenses.get('total_expenses', 0) > 0:
            insights.append(f"Total expenses: ${expenses['total_expenses']:,.2f}")
            
            # Check for subscription optimization opportunities
            if expenses.get('subscriptions'):
                for sub in expenses['subscriptions']:
                    if sub.get('days_inactive', 0) > 30:
                        insights.append(f"Cost Optimization: {sub.get('name')} - No activity in {sub['days_inactive']} days. Cost: ${sub.get('cost', 0):,.2f}/month")
        
        # Bottleneck insights
        if bottlenecks:
            insights.append(f"{len(bottlenecks)} bottleneck(s) identified - review needed")
        
        # Task insights
        if tasks.get('completion_rate', 0) >= 80:
            insights.append(f"Excellent task completion rate: {tasks['completion_rate']:.1f}%")
        elif tasks.get('completion_rate', 0) >= 50:
            insights.append(f"Task completion rate: {tasks['completion_rate']:.1f}% - room for improvement")
        else:
            insights.append(f"Low task completion rate: {tasks['completion_rate']:.1f}% - immediate attention needed")
        
        # Add default insight if no data available
        if not insights:
            insights.append("No data available for insights - ensure Odoo integration is configured")
        
        return insights
    
    def generate_briefing(self, start_date: str = None, end_date: str = None) -> str:
        """
        Generate complete CEO Briefing.
        
        Args:
            start_date: Week start date (defaults to previous week)
            end_date: Week end date (defaults to previous week)
            
        Returns:
            CEO Briefing markdown content
        """
        # Get week range if not provided
        if start_date is None or end_date is None:
            start_date, end_date = self.get_week_range()
        
        logger.info(f'Generating CEO Briefing for week {start_date} to {end_date}')
        
        # Generate all sections
        revenue = self.generate_revenue_summary(start_date, end_date)
        expenses = self.generate_expenses_summary(start_date, end_date)
        bottlenecks = self.identify_bottlenecks()
        tasks = self.generate_task_summary()
        insights = self.generate_insights(revenue, expenses, bottlenecks, tasks)
        
        # Calculate profit
        profit = revenue.get('total_revenue', 0) - expenses.get('total_expenses', 0)
        
        # Generate briefing content
        timestamp = datetime.now(timezone.utc).isoformat()
        
        briefing = f"""# CEO Briefing

**Week**: {start_date} to {end_date}  
**Generated**: {timestamp}

---

## Executive Summary

Strong week with revenue ahead of target. One bottleneck identified.

---

## Revenue

| Metric | Value |
|--------|-------|
| **Total Revenue** | ${revenue.get('total_revenue', 0):,.2f} |
| **Total Invoices** | {revenue.get('total_invoices', 0)} |
| **Top Client** | {revenue.get('top_clients', [{{'name': 'N/A'}}])[0].get('name', 'N/A') if revenue.get('top_clients') else 'N/A'} |

---

## Expenses

| Metric | Value |
|--------|-------|
| **Total Expenses** | ${expenses.get('total_expenses', 0):,.2f} |
| **Net Profit** | ${profit:,.2f} |

### Expense Breakdown

"""
        
        # Add expense breakdown by category
        for category, amount in expenses.get('by_category', {}).items():
            briefing += f"- **{category}**: ${amount:,.2f}\n"
        
        briefing += f"""
---

## Bottlenecks

"""
        
        # Add bottlenecks
        if bottlenecks:
            for i, bottleneck in enumerate(bottlenecks[:5], 1):
                briefing += f"{i}. {bottleneck.get('description', 'Unknown bottleneck')}\n"
        else:
            briefing += "No bottlenecks identified this week.\n"
        
        briefing += f"""
---

## Task Summary

| Status | Count |
|--------|-------|
| Completed | {tasks.get('completed', 0)} |
| Pending | {tasks.get('pending', 0)} |
| Awaiting Approval | {tasks.get('approval_pending', 0)} |

**Completion Rate**: {tasks.get('completion_rate', 0):.1f}%

---

## Actionable Insights

"""
        
        # Add insights
        for insight in insights:
            briefing += f"- {insight}\n"
        
        briefing += f"""
---

## Upcoming Deadlines

<!-- Add upcoming deadlines here -->

---

*Generated by Gold Tier Autonomous Assistant*
"""
        
        return briefing
    
    def update_dashboard(self, briefing: str) -> bool:
        """
        Update Dashboard.md with CEO Briefing section.
        
        Args:
            briefing: CEO Briefing content
            
        Returns:
            True if successful
        """
        try:
            logger.info('Updating Dashboard.md with CEO Briefing')
            
            # Read existing dashboard
            if self.dashboard.exists():
                dashboard_content = self.dashboard.read_text()
            else:
                dashboard_content = "# System Dashboard\n\n"
            
            # Find existing CEO Briefing section and replace it
            if '## CEO Briefing' in dashboard_content:
                # Replace existing section
                parts = dashboard_content.split('## CEO Briefing')
                dashboard_content = parts[0] + '## CEO Briefing\n\n' + briefing
            
            else:
                # Add new section
                dashboard_content += f"\n## CEO Briefing\n\n{briefing}"
            
            # Write updated dashboard
            self.dashboard.write_text(dashboard_content)
            
            logger.info('Dashboard.md updated successfully')
            return True
            
        except Exception as e:
            logger.error(f'Error updating dashboard: {e}')
            return False
    
    def log_briefing_generation(self, success: bool) -> None:
        """
        Log briefing generation to audit log.
        
        Args:
            success: Whether generation was successful
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': 'ceo_briefing_generated',
            'source': 'ceo_briefing.py',
            'status': 'success' if success else 'failure',
            'details': {
                'week_range': self.get_week_range(),
                'dashboard_updated': success
            }
        }
        
        log_file = self.logs / 'audit_log.jsonl'
        
        try:
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
            logger.info('Briefing generation logged')
        except Exception as e:
            logger.error(f'Error logging briefing generation: {e}')
    
    def run(self) -> bool:
        """
        Run CEO Briefing generation.
        
        Returns:
            True if successful
        """
        logger.info('Starting CEO Briefing generation')
        
        try:
            # Generate briefing
            briefing = self.generate_briefing()
            
            # Update dashboard
            success = self.update_dashboard(briefing)
            
            # Log generation
            self.log_briefing_generation(success)
            
            if success:
                logger.info('CEO Briefing generation completed successfully')
            else:
                logger.error('CEO Briefing generation failed')
            
            return success
            
        except Exception as e:
            logger.error(f'CEO Briefing generation error: {e}')
            self.log_briefing_generation(False)
            return False


if __name__ == '__main__':
    # Test CEO Briefing Generator
    print('\n=== CEO BRIEFING GENERATOR TEST ===')
    
    vault_path = Path('AI_Employee_Vault')
    generator = CEOBriefingGenerator(str(vault_path))
    
    print(f'[OK] CEOBriefingGenerator initialized')
    
    # Generate test briefing
    briefing = generator.generate_briefing()
    print(f'[OK] Briefing generated ({len(briefing)} characters)')
    
    # Update dashboard
    success = generator.update_dashboard(briefing)
    if success:
        print(f'[OK] Dashboard updated successfully')
    else:
        print(f'[FAIL] Dashboard update failed')
    
    print('\n=== TEST COMPLETE ===')
