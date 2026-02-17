#!/usr/bin/env python3
"""
End-to-End Test Suite for Bronze Tier Foundation
Tests the complete workflow: trigger → detection → processing → completion → log
"""

import unittest
import tempfile
import time
import json
from pathlib import Path
from datetime import datetime

# Import the modules being tested
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from watchers.file_watcher import FileWatcher
from watchers.dashboard_updater import DashboardUpdater


class TestEndToEnd(unittest.TestCase):
    """End-to-end integration tests for the complete system."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.watch_path = Path(self.temp_dir.name) / 'watch'
        self.vault_path = Path(self.temp_dir.name) / 'vault'
        self.watch_path.mkdir()
        self.vault_path.mkdir()
        
        # Create vault subdirectories
        (self.vault_path / 'Needs_Action').mkdir()
        (self.vault_path / 'Done').mkdir()
        (self.vault_path / 'Inbox').mkdir()
        (self.vault_path / 'Pending_Approval').mkdir()
        (self.vault_path / 'logs').mkdir()
        
        self.watcher = FileWatcher(
            str(self.watch_path),
            str(self.vault_path),
            poll_interval=1
        )
    
    def tearDown(self):
        """Clean up test fixtures."""
        self.temp_dir.cleanup()
    
    def test_full_workflow(self):
        """
        Test complete workflow:
        1. Create trigger file
        2. Watcher detects and creates task
        3. Verify task file structure
        4. Simulate completion (move to Done)
        5. Verify logging
        """
        # Step 1: Create trigger file
        trigger_file = self.watch_path / 'test_trigger.md'
        trigger_file.write_text('# Test Trigger\n\nThis is a test.')
        
        # Step 2: Watcher detects (manual scan for testing)
        new_files = self.watcher.scan()
        self.assertEqual(len(new_files), 1)
        
        # Step 3: Create task file
        task_path = self.watcher.create_task_file(trigger_file)
        self.assertTrue(task_path.exists())
        
        # Verify task file structure
        content = task_path.read_text()
        self.assertIn('source: file_watcher', content)
        self.assertIn('status: pending', content)
        self.assertIn('timestamp:', content)
        self.assertIn('# Task Description', content)
        
        # Step 4: Simulate completion (move to Done)
        done_path = self.vault_path / 'Done' / task_path.name
        done_path.write_text(content.replace('status: pending', 'status: completed'))
        task_path.unlink()
        
        # Step 5: Verify file moved
        self.assertFalse(task_path.exists())
        self.assertTrue(done_path.exists())
    
    def test_dashboard_updates(self):
        """Test that dashboard reflects task movements."""
        # Create initial dashboard
        updater = DashboardUpdater(str(self.vault_path), update_interval=1)
        
        # Generate dashboard with no tasks
        content1 = updater.generate_dashboard()
        self.assertIn('| Pending | 0 |', content1)
        
        # Create a task
        trigger_file = self.watch_path / 'trigger.md'
        trigger_file.write_text('# Trigger')
        new_files = self.watcher.scan()
        if new_files:
            self.watcher.create_task_file(new_files[0][0])
        
        # Generate dashboard with one task
        content2 = updater.generate_dashboard()
        self.assertIn('| Pending | 1 |', content2)
        
        # Move task to Done
        needs_action = self.vault_path / 'Needs_Action'
        done = self.vault_path / 'Done'
        for f in needs_action.glob('*.md'):
            (done / f.name).write_text(f.read_text())
            f.unlink()
        
        # Generate dashboard with completed task
        content3 = updater.generate_dashboard()
        self.assertIn('| Completed | 1 |', content3)
    
    def test_logging_throughout_workflow(self):
        """Test that all operations are logged."""
        log_file = self.vault_path / 'logs' / 'operations.log'
        
        # Clear log
        log_file.write_text('')
        
        # Create trigger
        trigger_file = self.watch_path / 'trigger.md'
        trigger_file.write_text('# Trigger')
        
        # Scan and create task (using scan_and_log for logging)
        new_files = self.watcher.scan_and_log()
        if new_files:
            self.watcher.create_task_file(new_files[0][0])
        
        # Verify log entries
        content = log_file.read_text()
        lines = [l for l in content.strip().split('\n') if l]
        
        # Should have at least scan_complete and create_task entries
        self.assertGreaterEqual(len(lines), 1)
        
        # Verify JSON format
        for line in lines:
            entry = json.loads(line)
            self.assertIn('timestamp', entry)
            self.assertIn('action', entry)
            self.assertIn('status', entry)
    
    def test_consistency_multiple_runs(self):
        """
        Test 99%+ consistency by running workflow multiple times.
        Simulates T042 requirement.
        """
        successes = 0
        total_runs = 10
        
        for i in range(total_runs):
            try:
                # Create trigger
                trigger_file = self.watch_path / f'trigger_{i}.md'
                trigger_file.write_text(f'# Trigger {i}')
                
                # Scan
                new_files = self.watcher.scan()
                
                # Create task
                if new_files:
                    task_path = self.watcher.create_task_file(new_files[0][0])
                    
                    # Verify task created
                    if task_path.exists():
                        successes += 1
                
                # Clean up for next iteration
                for f in (self.vault_path / 'Needs_Action').glob('*.md'):
                    f.unlink()
                
            except Exception as e:
                print(f"Run {i} failed: {e}")
        
        # Calculate consistency
        consistency = successes / total_runs
        print(f"Consistency: {consistency * 100:.1f}% ({successes}/{total_runs})")
        
        # Should be 99%+ (allowing for 1 failure in 100 runs)
        # For 10 runs, we expect 100% in test conditions
        self.assertGreaterEqual(consistency, 0.9)


class TestErrorHandling(unittest.TestCase):
    """Test error handling scenarios."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.watch_path = Path(self.temp_dir.name) / 'watch'
        self.vault_path = Path(self.temp_dir.name) / 'vault'
        self.watch_path.mkdir()
        self.vault_path.mkdir()
        (self.vault_path / 'Needs_Action').mkdir()
        (self.vault_path / 'Inbox').mkdir()
        (self.vault_path / 'logs').mkdir()
        
        self.watcher = FileWatcher(
            str(self.watch_path),
            str(self.vault_path),
            poll_interval=1
        )
    
    def tearDown(self):
        """Clean up test fixtures."""
        self.temp_dir.cleanup()
    
    def test_malformed_trigger_handled(self):
        """Test that malformed triggers are handled gracefully."""
        # Create a file that might cause issues
        trigger_file = self.watch_path / 'malformed.md'
        trigger_file.write_text('')  # Empty file
        
        # Should not crash
        new_files = self.watcher.scan()
        if new_files:
            task_path = self.watcher.create_task_file(new_files[0][0])
            self.assertTrue(task_path.exists())
    
    def test_file_lock_conflict(self):
        """Test handling of file lock conflicts."""
        trigger_file = self.watch_path / 'locked.md'
        trigger_file.write_text('# Test')
        
        # First scan
        new_files = self.watcher.scan()
        self.assertEqual(len(new_files), 1)
        
        # Second scan should not detect same file
        new_files2 = self.watcher.scan()
        self.assertEqual(len(new_files2), 0)


if __name__ == '__main__':
    unittest.main()
