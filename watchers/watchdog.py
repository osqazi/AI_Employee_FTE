#!/usr/bin/env python3
"""
Watchdog Process Monitor

Monitors and restarts critical processes (orchestrator, watchers, MCP servers).
Ensures 24/7 operational reliability for the AI Employee system.
"""

import json
import logging
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('watchdog')


class WatchdogMonitor:
    """
    Watchdog process monitor for critical AI Employee processes.
    
    Monitors and restarts:
    - Orchestrator (ralph_wiggum_loop.py)
    - Watchers (cross_domain_trigger.py, etc.)
    - MCP servers (email-mcp, social-mcp, odoo-mcp, browser-mcp, docs-mcp)
    """
    
    def __init__(self, vault_path: str, project_root: str):
        """
        Initialize Watchdog Monitor.
        
        Args:
            vault_path: Path to AI_Employee_Vault directory
            project_root: Path to project root directory
        """
        self.vault_path = Path(vault_path)
        self.project_root = Path(project_root)
        self.logs = self.vault_path / 'Logs'
        
        # Ensure logs directory exists
        self.logs.mkdir(exist_ok=True)
        
        # Define critical processes to monitor
        self.processes = {
            'ralph_wiggum_loop': {
                'command': ['python', str(self.project_root / 'watchers' / 'ralph_wiggum_loop.py')],
                'restart_delay': 5,
                'max_restarts': 3,
                'restarts': 0,
                'last_restart': None,
                'process': None
            },
            'cross_domain_trigger': {
                'command': ['python', str(self.project_root / 'watchers' / 'cross_domain_trigger.py')],
                'restart_delay': 5,
                'max_restarts': 3,
                'restarts': 0,
                'last_restart': None,
                'process': None
            },
            'email_mcp': {
                'command': ['node', str(self.project_root / 'mcp_servers' / 'email-mcp' / 'index.js')],
                'restart_delay': 10,
                'max_restarts': 3,
                'restarts': 0,
                'last_restart': None,
                'process': None
            },
            'social_mcp': {
                'command': ['node', str(self.project_root / 'mcp_servers' / 'social-mcp' / 'index.js')],
                'restart_delay': 10,
                'max_restarts': 3,
                'restarts': 0,
                'last_restart': None,
                'process': None
            },
            'odoo_mcp': {
                'command': ['node', str(self.project_root / 'mcp_servers' / 'odoo-mcp' / 'index.js')],
                'restart_delay': 10,
                'max_restarts': 3,
                'restarts': 0,
                'last_restart': None,
                'process': None
            },
            'browser_mcp': {
                'command': ['node', str(self.project_root / 'mcp_servers' / 'browser-mcp' / 'index.js')],
                'restart_delay': 10,
                'max_restarts': 3,
                'restarts': 0,
                'last_restart': None,
                'process': None
            },
            'docs_mcp': {
                'command': ['node', str(self.project_root / 'mcp_servers' / 'docs-mcp' / 'index.js')],
                'restart_delay': 10,
                'max_restarts': 3,
                'restarts': 0,
                'last_restart': None,
                'process': None
            }
        }
        
        logger.info(f'WatchdogMonitor initialized - Vault: {self.vault_path}, Project: {self.project_root}')
        logger.info(f'Monitoring {len(self.processes)} critical processes')
    
    def start_process(self, process_name: str) -> bool:
        """
        Start a monitored process.
        
        Args:
            process_name: Name of process to start
            
        Returns:
            True if started successfully
        """
        try:
            process_config = self.processes[process_name]
            
            logger.info(f'Starting process: {process_name}')
            
            # Start process
            process = subprocess.Popen(
                process_config['command'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            process_config['process'] = process
            process_config['restarts'] = 0
            process_config['last_restart'] = datetime.now()
            
            logger.info(f'Process {process_name} started successfully (PID: {process.pid})')
            
            return True
            
        except Exception as e:
            logger.error(f'Failed to start process {process_name}: {e}')
            return False
    
    def check_process(self, process_name: str) -> bool:
        """
        Check if a process is running.
        
        Args:
            process_name: Name of process to check
            
        Returns:
            True if process is running
        """
        try:
            process_config = self.processes[process_name]
            process = process_config.get('process')
            
            if process is None:
                return False
            
            # Check if process is running
            if process.poll() is None:
                return True
            
            # Process exited
            logger.warning(f'Process {process_name} exited (PID: {process.pid}, return code: {process.returncode})')
            
            return False
            
        except Exception as e:
            logger.error(f'Error checking process {process_name}: {e}')
            return False
    
    def restart_process(self, process_name: str) -> bool:
        """
        Restart a process with exponential backoff.
        
        Args:
            process_name: Name of process to restart
            
        Returns:
            True if restarted successfully
        """
        try:
            process_config = self.processes[process_name]
            
            # Check if max restarts exceeded
            if process_config['restarts'] >= process_config['max_restarts']:
                logger.error(f'Max restarts ({process_config["max_restarts"]}) exceeded for {process_name}')
                self.log_critical_failure(process_name)
                return False
            
            # Check if enough time has passed since last restart
            if process_config['last_restart']:
                time_since_restart = (datetime.now() - process_config['last_restart']).total_seconds()
                if time_since_restart < process_config['restart_delay']:
                    logger.info(f'Waiting {process_config["restart_delay"]}s before restarting {process_name}')
                    return False
            
            logger.info(f'Restarting process: {process_name} (attempt {process_config["restarts"] + 1}/{process_config["max_restarts"]})')
            
            # Stop existing process if running
            if process_config.get('process'):
                process_config['process'].terminate()
                process_config['process'].wait(timeout=5)
            
            # Start new process
            return self.start_process(process_name)
            
        except Exception as e:
            logger.error(f'Failed to restart process {process_name}: {e}')
            return False
    
    def log_critical_failure(self, process_name: str) -> None:
        """
        Log critical failure when max restarts exceeded.
        
        Args:
            process_name: Name of failed process
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': 'watchdog_critical_failure',
            'source': 'watchdog.py',
            'status': 'failure',
            'details': {
                'process': process_name,
                'max_restarts_exceeded': True,
                'recommendation': 'Manual intervention required'
            }
        }
        
        log_file = self.logs / 'error_log.jsonl'
        
        try:
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
            logger.error(f'Critical failure logged for {process_name}')
            
            # Create alert file
            alert_file = self.vault_path / 'Inbox' / f'ALERT_WATCHDOG_{process_name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.md'
            alert_content = f"""---
source: watchdog
type: alert
priority: critical
created: {datetime.now(timezone.utc).isoformat()}
---

# Critical Alert: Process {process_name} Failed

**Process**: {process_name}  
**Time**: {datetime.now(timezone.utc).isoformat()}  
**Issue**: Max restarts exceeded  

## Recommended Action

Manual intervention required. Check logs and restart process manually:

```bash
# Check logs
tail -f AI_Employee_Vault/Logs/error_log.jsonl

# Restart process manually
python watchers/{process_name}.py  # For Python processes
node mcp_servers/{process_name}/index.js  # For Node.js processes
```

## Possible Causes

1. Configuration error
2. Missing dependencies
3. Port already in use
4. API credentials invalid

---
*Generated by Watchdog Monitor*
"""
            alert_file.parent.mkdir(exist_ok=True)
            alert_file.write_text(alert_content)
            logger.error(f'Alert file created: {alert_file}')
            
        except Exception as e:
            logger.error(f'Error logging critical failure: {e}')
    
    def monitor_loop(self, check_interval: int = 30) -> None:
        """
        Main monitoring loop.
        
        Args:
            check_interval: Seconds between health checks (default: 30)
        """
        logger.info(f'Starting watchdog monitor loop (check interval: {check_interval}s)')
        
        try:
            while True:
                # Check each process
                for process_name in self.processes.keys():
                    if not self.check_process(process_name):
                        logger.warning(f'Process {process_name} not running, attempting restart')
                        self.restart_process(process_name)
                
                # Wait before next check
                time.sleep(check_interval)
                
        except KeyboardInterrupt:
            logger.info('Watchdog monitor stopped by user')
            self.stop_all_processes()
        except Exception as e:
            logger.error(f'Watchdog monitor error: {e}')
            self.stop_all_processes()
    
    def stop_all_processes(self) -> None:
        """
        Stop all monitored processes.
        """
        logger.info('Stopping all monitored processes')
        
        for process_name, process_config in self.processes.items():
            if process_config.get('process'):
                try:
                    process_config['process'].terminate()
                    process_config['process'].wait(timeout=5)
                    logger.info(f'Process {process_name} stopped')
                except Exception as e:
                    logger.error(f'Error stopping process {process_name}: {e}')
    
    def run(self) -> None:
        """
        Run watchdog monitor.
        """
        # Start all processes
        for process_name in self.processes.keys():
            self.start_process(process_name)
        
        # Start monitoring
        self.monitor_loop(check_interval=30)


if __name__ == '__main__':
    # Test Watchdog Monitor
    print('\n=== WATCHDOG MONITOR TEST ===')
    
    vault_path = Path('AI_Employee_Vault')
    project_root = Path('.')
    
    monitor = WatchdogMonitor(str(vault_path), str(project_root))
    
    print(f'[OK] WatchdogMonitor initialized')
    print(f'[OK] Monitoring {len(monitor.processes)} processes')
    
    # Test starting a process
    print('\n[Test] Starting ralph_wiggum_loop process')
    started = monitor.start_process('ralph_wiggum_loop')
    if started:
        print(f'[OK] Process started successfully')
    else:
        print(f'[FAIL] Failed to start process')
    
    # Test checking process
    print('\n[Test] Checking process status')
    running = monitor.check_process('ralph_wiggum_loop')
    if running:
        print(f'[OK] Process is running')
    else:
        print(f'[FAIL] Process is not running')
    
    print('\n=== TEST COMPLETE ===')
