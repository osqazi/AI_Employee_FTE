#!/usr/bin/env python3
"""
Test suite for File Watcher component
Tests the file monitoring and task file creation functionality.
"""

import unittest
import tempfile
import time
from pathlib import Path
from unittest.mock import patch, MagicMock

# Import the module being tested
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from watchers.file_watcher import FileWatcher, log_operation, parse_yaml_frontmatter


class TestFileWatcher(unittest.TestCase):
    """Test cases for FileWatcher class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.watch_path = Path(self.temp_dir.name) / 'watch'
        self.vault_path = Path(self.temp_dir.name) / 'vault'
        self.watch_path.mkdir()
        self.vault_path.mkdir()
        
        self.watcher = FileWatcher(
            str(self.watch_path),
            str(self.vault_path),
            poll_interval=1
        )
    
    def tearDown(self):
        """Clean up test fixtures."""
        self.temp_dir.cleanup()
    
    def test_init_creates_directories(self):
        """Test that initialization creates necessary directories."""
        # Directories should exist after init
        self.assertTrue(self.watch_path.exists())
        self.assertTrue((self.vault_path / 'Needs_Action').exists())
        self.assertTrue((self.vault_path / 'Inbox').exists())
    
    def test_scan_empty_directory(self):
        """Test scanning an empty directory returns no files."""
        result = self.watcher.scan()
        self.assertEqual(len(result), 0)
    
    def test_scan_detects_new_file(self):
        """Test that scan detects new markdown files."""
        # Create a test file
        test_file = self.watch_path / 'test.md'
        test_file.write_text('# Test')
        
        # First scan - should detect the file
        result = self.watcher.scan()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0][0], test_file)
    
    def test_scan_ignores_non_markdown(self):
        """Test that scan ignores non-markdown files."""
        # Create non-md files
        (self.watch_path / 'test.txt').write_text('Test')
        (self.watch_path / 'test.pdf').write_text('Test')
        
        result = self.watcher.scan()
        self.assertEqual(len(result), 0)
    
    def test_create_task_file_creates_valid_file(self):
        """Test that task file creation produces valid output."""
        test_file = self.watch_path / 'trigger.md'
        test_file.write_text('# Trigger')
        
        task_path = self.watcher.create_task_file(test_file)
        
        # Verify file was created in correct location
        self.assertTrue(task_path.exists())
        self.assertIn('Needs_Action', str(task_path))
        self.assertTrue(task_path.name.startswith('task_'))
        
        # Verify content
        content = task_path.read_text()
        self.assertIn('source: file_watcher', content)
        self.assertIn('status: pending', content)
        self.assertIn('priority: medium', content)
        self.assertIn('# Task Description', content)
    
    def test_scan_does_not_detect_same_file_twice(self):
        """Test that the same file is not detected in multiple scans."""
        # Create a test file
        test_file = self.watch_path / 'test.md'
        test_file.write_text('# Test')
        
        # First scan
        result1 = self.watcher.scan()
        self.assertEqual(len(result1), 1)
        
        # Second scan - should not detect the same file
        result2 = self.watcher.scan()
        self.assertEqual(len(result2), 0)


class TestYamlParsing(unittest.TestCase):
    """Test cases for YAML frontmatter parsing."""
    
    def test_parse_valid_frontmatter(self):
        """Test parsing valid YAML frontmatter."""
        content = """---
source: file_watcher
timestamp: 2026-02-17T10:30:00Z
status: pending
priority: medium
---

# Task Description

Test content.
"""
        frontmatter, body = parse_yaml_frontmatter(content)
        
        self.assertEqual(frontmatter['source'], 'file_watcher')
        self.assertEqual(frontmatter['timestamp'], '2026-02-17T10:30:00Z')
        self.assertEqual(frontmatter['status'], 'pending')
        self.assertEqual(frontmatter['priority'], 'medium')
        self.assertIn('# Task Description', body)
    
    def test_parse_no_frontmatter(self):
        """Test parsing content without frontmatter."""
        content = "# Just content\n\nNo frontmatter here."
        
        frontmatter, body = parse_yaml_frontmatter(content)
        
        self.assertEqual(frontmatter, {})
        self.assertEqual(body, content)
    
    def test_parse_empty_frontmatter(self):
        """Test parsing empty frontmatter."""
        content = """---
---

# Content
"""
        frontmatter, body = parse_yaml_frontmatter(content)
        
        self.assertEqual(frontmatter, {})
        self.assertIn('# Content', body)


class TestLogOperation(unittest.TestCase):
    """Test cases for structured logging."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.vault_path = Path(self.temp_dir.name)
        (self.vault_path / 'logs').mkdir()
    
    def tearDown(self):
        """Clean up test fixtures."""
        self.temp_dir.cleanup()
    
    def test_log_operation_writes_to_file(self):
        """Test that log_operation writes to operations.log."""
        log_operation(
            action="test_action",
            status="success",
            duration_ms=100,
            details={"test": "data"},
            vault_path=self.vault_path
        )
        
        log_file = self.vault_path / 'logs' / 'operations.log'
        self.assertTrue(log_file.exists())
        
        content = log_file.read_text()
        self.assertIn('test_action', content)
        self.assertIn('success', content)
    
    def test_log_operation_json_format(self):
        """Test that log entries are valid JSON."""
        import json
        
        log_operation(
            action="json_test",
            status="success",
            duration_ms=50,
            vault_path=self.vault_path
        )
        
        log_file = self.vault_path / 'logs' / 'operations.log'
        lines = log_file.read_text().strip().split('\n')
        
        # Last line should be valid JSON
        entry = json.loads(lines[-1])
        self.assertEqual(entry['action'], 'json_test')
        self.assertEqual(entry['status'], 'success')
        self.assertEqual(entry['duration_ms'], 50)


if __name__ == '__main__':
    unittest.main()
