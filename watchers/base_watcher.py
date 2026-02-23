#!/usr/bin/env python3
"""
Base Watcher - Abstract base class for all watchers

Silver Tier - Personal AI Employee
Extends Bronze Tier file watcher pattern to support multiple watcher types.
"""

import time
import logging
from pathlib import Path
from abc import ABC, abstractmethod
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('base_watcher')


class BaseWatcher(ABC):
    """
    Abstract base class for all watchers (Filesystem, Gmail, WhatsApp, etc.)
    
    All watchers must implement:
    - scan(): Check for new items
    - create_task_file(): Create task file in Needs_Action folder
    - log_operation(): Log watcher operations
    - run(): Main loop
    """
    
    def __init__(self, vault_path: str, poll_interval: int = 60):
        """
        Initialize base watcher.
        
        Args:
            vault_path: Path to AI_Employee_Vault
            poll_interval: Seconds between scans (default: 60)
        """
        self.vault_path = Path(vault_path)
        self.poll_interval = poll_interval
        
        # Ensure vault folders exist
        self.needs_action = self.vault_path / 'Needs_Action'
        self.logs = self.vault_path / 'logs'
        
        for folder in [self.needs_action, self.logs]:
            folder.mkdir(exist_ok=True)
        
        logger.info(f'{self.__class__.__name__} initialized - Vault: {self.vault_path}')
    
    @abstractmethod
    def scan(self) -> list:
        """
        Scan for new items (emails, messages, files, etc.)
        
        Returns:
            List of new items to process
        """
        pass
    
    @abstractmethod
    def create_task_file(self, item) -> Path:
        """
        Create task file in Needs_Action folder.
        
        Args:
            item: Item to create task file for
            
        Returns:
            Path to created task file
        """
        pass
    
    def log_operation(self, operation: str, details: dict):
        """
        Log watcher operation.
        
        Args:
            operation: Operation name
            details: Operation details
        """
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'watcher': self.__class__.__name__,
            'operation': operation,
            **details
        }
        
        log_file = self.logs / f'{self.__class__.__name__.lower()}_log.jsonl'
        
        try:
            with open(log_file, 'a') as f:
                import json
                f.write(json.dumps(log_entry) + '\n')
        except Exception as e:
            logger.error(f'Failed to log operation: {e}')
    
    def run(self):
        """
        Main watcher loop.
        """
        logger.info(f'Starting {self.__class__.__name__} - Poll interval: {self.poll_interval}s')
        
        try:
            while True:
                try:
                    # Scan for new items
                    items = self.scan()
                    
                    # Process each item
                    for item in items:
                        task_file = self.create_task_file(item)
                        logger.info(f'Task created: {task_file.name}')
                    
                    # Log operation
                    if items:
                        self.log_operation('scan', {'items_found': len(items)})
                    
                    # Wait before next scan
                    time.sleep(self.poll_interval)
                    
                except Exception as e:
                    logger.error(f'Error in scan cycle: {e}')
                    time.sleep(self.poll_interval)
                    
        except KeyboardInterrupt:
            logger.info(f'{self.__class__.__name__} stopped by user')
        except Exception as e:
            logger.error(f'Watcher error: {e}')
            raise
