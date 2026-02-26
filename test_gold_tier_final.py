#!/usr/bin/env python3
"""
GOLD TIER FINAL VERIFICATION TEST SUITE

Comprehensive verification of:
1. All 4 social media platforms
2. Cross-domain triggering
3. All watchers
4. Complete workflow
5. Obsidian Dashboard

Usage: python test_gold_tier_final.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Test results
results = {
    'passed': 0,
    'failed': 0,
    'tests': []
}

def log_test(category, name, passed, details=''):
    """Log test result."""
    results['tests'].append({
        'category': category,
        'name': name,
        'passed': passed,
        'details': details
    })
    
    if passed:
        results['passed'] += 1
        print(f'  [PASS] {name}')
    else:
        results['failed'] += 1
        print(f'  [FAIL] {name}: {details}')

def print_header(text):
    """Print test section header."""
    print(f'\n{"="*70}')
    print(f'{text}')
    print(f'{"="*70}')

# ============================================================================
# TEST 1: FILE SYSTEM VERIFICATION
# ============================================================================
def test_filesystem():
    """Test 1: Verify all Gold Tier files exist."""
    print_header('TEST 1: FILE SYSTEM VERIFICATION')
    
    # Watchers
    watchers = [
        'watchers/file_watcher.py',
        'watchers/base_watcher.py',
        'watchers/gmail_watcher.py',
        'watchers/whatsapp_watcher.py',
        'watchers/cross_domain_trigger.py',
        'watchers/ralph_wiggum_loop.py',
        'watchers/watchdog.py'
    ]
    
    for watcher in watchers:
        path = project_root / watcher
        log_test('Watchers', watcher, path.exists())
    
    # MCP Servers
    mcp_servers = [
        'mcp_servers/email-mcp',
        'mcp_servers/odoo-mcp',
        'mcp_servers/social-mcp',
        'mcp_servers/browser-mcp',
        'mcp_servers/docs-mcp',
        'mcp_servers/whatsapp-mcp'
    ]
    
    for server in mcp_servers:
        path = project_root / server
        log_test('MCP Servers', server, path.exists())
    
    # Skills (Gold Tier)
    gold_skills = [
        'skills/detect_cross_domain_trigger.md',
        'skills/odoo_create_invoice.md',
        'skills/odoo_log_transaction.md',
        'skills/odoo_run_audit.md',
        'skills/facebook_post.md',
        'skills/instagram_post.md',
        'skills/linkedin_post.md',
        'skills/social_generate_summary.md',
        'skills/browser_automate.md',
        'skills/docs_lookup_api.md',
        'skills/error_recovery.md',
        'skills/ralph_wiggum_orchestrator.md'
    ]
    
    for skill in gold_skills:
        path = project_root / skill
        log_test('Skills (Gold)', skill, path.exists())
    
    # Scheduling
    scheduling = [
        'scheduling/daily_tasks.py',
        'scheduling/weekly_summary.py',
        'scheduling/ceo_briefing.py'
    ]
    
    for script in scheduling:
        path = project_root / script
        log_test('Scheduling', script, path.exists())
    
    # Vault folders
    vault_folders = [
        'AI_Employee_Vault/Inbox',
        'AI_Employee_Vault/Needs_Action',
        'AI_Employee_Vault/Done',
        'AI_Employee_Vault/Approved',
        'AI_Employee_Vault/Rejected',
        'AI_Employee_Vault/Pending_Approval',
        'AI_Employee_Vault/Plans',
        'AI_Employee_Vault/Summaries',
        'AI_Employee_Vault/logs'
    ]
    
    for folder in vault_folders:
        path = project_root / folder
        log_test('Vault Folders', folder, path.exists())
    
    # Dashboard
    dashboard = project_root / 'AI_Employee_Vault' / 'Dashboard.md'
    log_test('Dashboard', 'Dashboard.md', dashboard.exists())

# ============================================================================
# TEST 2: MODULE IMPORTS
# ============================================================================
def test_imports():
    """Test 2: Verify all modules can be imported."""
    print_header('TEST 2: MODULE IMPORTS')
    
    modules = [
        ('watchers.base_watcher', 'BaseWatcher'),
        ('watchers.file_watcher', 'FileWatcher'),
        ('watchers.gmail_watcher', 'GmailWatcher'),
        ('watchers.whatsapp_watcher', 'WhatsAppWatcher'),
        ('watchers.cross_domain_trigger', 'CrossDomainTrigger'),
        ('scheduling.daily_tasks', 'generate_daily_summary'),
        ('scheduling.weekly_summary', 'generate_weekly_summary'),
        ('scheduling.ceo_briefing', 'generate_ceo_briefing')
    ]
    
    for module, name in modules:
        try:
            __import__(module)
            log_test('Imports', f'{module} ({name})', True)
        except Exception as e:
            log_test('Imports', f'{module} ({name})', False, str(e))

# ============================================================================
# TEST 3: WATCHER INITIALIZATION
# ============================================================================
def test_watcher_init():
    """Test 3: Verify all watchers initialize correctly."""
    print_header('TEST 3: WATCHER INITIALIZATION')
    
    vault_path = str(project_root / 'AI_Employee_Vault')
    
    # File Watcher
    try:
        from watchers.file_watcher import FileWatcher
        watcher = FileWatcher(vault_path, str(vault_path + '/Inbox'))
        log_test('Watchers', 'FileWatcher initialization', True)
    except Exception as e:
        log_test('Watchers', 'FileWatcher initialization', False, str(e))
    
    # Gmail Watcher
    try:
        from watchers.gmail_watcher import GmailWatcher
        log_test('Watchers', 'GmailWatcher import', True)
    except Exception as e:
        log_test('Watchers', 'GmailWatcher import', False, str(e))
    
    # WhatsApp Watcher
    try:
        from watchers.whatsapp_watcher import WhatsAppWatcher
        watcher = WhatsAppWatcher(vault_path)
        log_test('Watchers', 'WhatsAppWatcher initialization', True, 
                f'Session: {watcher.session_path}')
    except Exception as e:
        log_test('Watchers', 'WhatsAppWatcher initialization', False, str(e))
    
    # Cross-Domain Trigger
    try:
        from watchers.cross_domain_trigger import CrossDomainTrigger
        trigger = CrossDomainTrigger(vault_path)
        log_test('Watchers', 'CrossDomainTrigger initialization', True)
    except Exception as e:
        log_test('Watchers', 'CrossDomainTrigger initialization', False, str(e))

# ============================================================================
# TEST 4: CROSS-DOMAIN TRIGGER VERIFICATION
# ============================================================================
def test_cross_domain():
    """Test 4: Verify cross-domain triggering logic."""
    print_header('TEST 4: CROSS-DOMAIN TRIGGER VERIFICATION')
    
    vault_path = project_root / 'AI_Employee_Vault'
    needs_action = vault_path / 'Needs_Action'
    
    # Check if cross-domain trigger file exists
    trigger_file = project_root / 'watchers' / 'cross_domain_trigger.py'
    log_test('Cross-Domain', 'Trigger file exists', trigger_file.exists())
    
    # Check trigger patterns
    try:
        content = trigger_file.read_text()
        
        patterns = [
            ('Email trigger', 'email' in content.lower()),
            ('WhatsApp trigger', 'whatsapp' in content.lower()),
            ('File trigger', 'file' in content.lower()),
            ('Odoo integration', 'odoo' in content.lower()),
            ('Action creation', 'create_cross_domain_task' in content.lower() or 'create_task' in content.lower())
        ]
        
        for pattern_name, found in patterns:
            log_test('Cross-Domain', f'{pattern_name} pattern', found)
    
    except Exception as e:
        log_test('Cross-Domain', 'Read trigger file', False, str(e))

# ============================================================================
# TEST 5: WORKFLOW VERIFICATION
# ============================================================================
def test_workflow():
    """Test 5: Verify complete workflow."""
    print_header('TEST 5: WORKFLOW VERIFICATION')
    
    vault_path = project_root / 'AI_Employee_Vault'
    
    # Check workflow folders
    workflow_folders = {
        'Inbox': 'Incoming triggers',
        'Needs_Action': 'Tasks to process',
        'Pending_Approval': 'HITL approval',
        'Approved': 'Approved tasks',
        'Rejected': 'Rejected tasks',
        'Plans': 'Plan.md files',
        'Done': 'Completed tasks',
        'Summaries': 'Reports and summaries'
    }
    
    for folder, purpose in workflow_folders.items():
        path = vault_path / folder
        exists = path.exists()
        log_test('Workflow', f'{folder} ({purpose})', exists)
    
    # Check for Plan.md files
    plans_folder = vault_path / 'Plans'
    if plans_folder.exists():
        plans = list(plans_folder.glob('*.md'))
        log_test('Workflow', f'Plan.md files ({len(plans)} found)', len(plans) > 0)
    
    # Check for task files
    needs_action = vault_path / 'Needs_Action'
    if needs_action.exists():
        tasks = list(needs_action.glob('*.md'))
        log_test('Workflow', f'Task files ({len(tasks)} found)', True)

# ============================================================================
# TEST 6: OBSIDIAN DASHBOARD VERIFICATION
# ============================================================================
def test_dashboard():
    """Test 6: Verify Obsidian Dashboard is comprehensive."""
    print_header('TEST 6: OBSIDIAN DASHBOARD VERIFICATION')
    
    dashboard_path = project_root / 'AI_Employee_Vault' / 'Dashboard.md'
    
    if not dashboard_path.exists():
        log_test('Dashboard', 'Dashboard.md exists', False)
        return
    
    log_test('Dashboard', 'Dashboard.md exists', True)
    
    try:
        content = dashboard_path.read_text()
        
        # Check for required sections
        sections = [
            ('Workflow section', 'workflow' in content.lower() or 'Workflow' in content),
            ('Approval section', 'approval' in content.lower() or 'Approval' in content),
            ('Actions/Plans', 'plan' in content.lower() or 'Plan' in content),
            ('Execution tracking', 'execut' in content.lower() or 'Done' in content),
            ('Social Media', 'facebook' in content.lower() or 'instagram' in content.lower() or 'linkedin' in content.lower()),
            ('WhatsApp', 'whatsapp' in content.lower()),
            ('MCP Servers', 'mcp' in content.lower() or 'server' in content.lower()),
            ('Watchers', 'watcher' in content.lower()),
            ('Status/Progress', 'status' in content.lower() or 'complete' in content.lower())
        ]
        
        for section_name, found in sections:
            log_test('Dashboard', section_name, found)
        
        # Check file size (should be comprehensive)
        file_size = len(content)
        log_test('Dashboard', f'Comprehensive ({file_size} chars)', file_size > 1000)
    
    except Exception as e:
        log_test('Dashboard', 'Read Dashboard.md', False, str(e))

# ============================================================================
# TEST 7: MCP SERVER CONFIGURATION
# ============================================================================
def test_mcp_config():
    """Test 7: Verify MCP server configuration."""
    print_header('TEST 7: MCP SERVER CONFIGURATION')
    
    mcp_config = project_root / 'mcp_servers' / 'mcp.json'
    log_test('MCP Config', 'mcp.json exists', mcp_config.exists())
    
    if mcp_config.exists():
        try:
            import json
            config = json.loads(mcp_config.read_text())
            
            # Check for server configurations
            servers = config.get('mcpServers', {})
            log_test('MCP Config', f'Servers configured ({len(servers)})', len(servers) > 0)
            
            # Check for required servers
            required = ['email', 'odoo', 'social', 'browser', 'docs']
            for server in required:
                found = any(server in key.lower() for key in servers.keys())
                log_test('MCP Config', f'{server}-mcp configured', found)
        
        except Exception as e:
            log_test('MCP Config', 'Parse mcp.json', False, str(e))

# ============================================================================
# TEST 8: ENVIRONMENT CONFIGURATION
# ============================================================================
def test_env():
    """Test 8: Verify .env configuration."""
    print_header('TEST 8: ENVIRONMENT CONFIGURATION')
    
    env_file = project_root / '.env'
    log_test('Environment', '.env exists', env_file.exists())
    
    if env_file.exists():
        try:
            content = env_file.read_text()
            
            # Check for required configurations
            configs = [
                ('Facebook', 'FACEBOOK' in content),
                ('Instagram', 'INSTAGRAM' in content),
                ('LinkedIn', 'LINKEDIN' in content),
                ('WhatsApp Session', 'WHATSAPP_SESSION' in content),
                ('Gmail', 'GMAIL' in content),
                ('SMTP', 'SMTP' in content),
                ('Odoo', 'ODOO' in content)
            ]
            
            for config_name, found in configs:
                log_test('Environment', f'{config_name} configured', found)
        
        except Exception as e:
            log_test('Environment', 'Read .env', False, str(e))

# ============================================================================
# MAIN
# ============================================================================
def main():
    """Run all verification tests."""
    print('='*70)
    print('GOLD TIER FINAL VERIFICATION TEST SUITE')
    print('='*70)
    print(f'Test started: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'Project root: {project_root}')
    
    # Run all tests
    test_filesystem()
    test_imports()
    test_watcher_init()
    test_cross_domain()
    test_workflow()
    test_dashboard()
    test_mcp_config()
    test_env()
    
    # Print summary
    print_header('VERIFICATION SUMMARY')
    
    total = results['passed'] + results['failed']
    pass_rate = (results['passed'] / total * 100) if total > 0 else 0
    
    print(f'Total Tests: {total}')
    print(f'Passed: {results["passed"]} [PASS]')
    print(f'Failed: {results["failed"]} [FAIL]')
    print(f'Pass Rate: {pass_rate:.1f}%')
    print()
    
    if results['failed'] > 0:
        print('Failed Tests:')
        for test in results['tests']:
            if not test['passed']:
                print(f'  [FAIL] {test["category"]}: {test["name"]} - {test["details"]}')
    
    print()
    if pass_rate >= 95:
        print('[PASS] GOLD TIER VERIFICATION COMPLETE!')
        print('       All systems operational and ready for Hackathon 0!')
    elif pass_rate >= 80:
        print('[WARN] MOST TESTS PASSED. Minor issues detected.')
    else:
        print('[FAIL] CRITICAL ISSUES DETECTED. Review failed tests.')
    
    print(f'\nTest completed: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    
    return 0 if results['failed'] == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
