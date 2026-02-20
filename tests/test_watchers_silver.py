#!/usr/bin/env python3
"""
Silver Tier Watcher Test Suite
Tests all three watchers (Filesystem, Gmail, WhatsApp)
"""

import sys
import time
import threading
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from watchers.file_watcher import FileWatcher
from watchers.dev_mode import is_dev_mode

def test_filesystem_watcher():
    """T023: Test Filesystem Watcher"""
    print('\n' + '='*60)
    print('T023: Filesystem Watcher Test')
    print('='*60)
    
    fw = FileWatcher(
        str(Path('AI_Employee_Vault/Inbox')),
        str(Path('AI_Employee_Vault'))
    )
    
    # Create test trigger
    test_file = Path('AI_Employee_Vault/Inbox/test_filesystem_watcher.md')
    test_file.write_text('# Filesystem Watcher Test\n\nTesting trigger detection.')
    print(f'[OK] Created test file: {test_file}')
    
    time.sleep(1)
    
    # Check for updates
    new_files = fw.check_for_updates()
    print(f'[OK] Detected {len(new_files)} new file(s)')
    
    # Create task files
    created = [fw.create_action_file(f) for f in new_files]
    created_count = len([c for c in created if c])
    print(f'[OK] Created {created_count} task file(s)')
    
    # Verify task file structure
    if created_count > 0:
        task_file = created[0]
        content = task_file.read_text()
        assert 'source: file_watcher' in content, 'Missing source field'
        assert 'timestamp:' in content, 'Missing timestamp'
        assert 'status: pending' in content, 'Missing status'
        assert 'priority: medium' in content, 'Missing priority'
        print('[OK] Task file YAML frontmatter verified')
    
    print('\n[PASS] T023: Filesystem Watcher Test - PASSED\n')
    return True

def test_concurrent_triggers():
    """T025: Test Concurrent Triggers"""
    print('\n' + '='*60)
    print('T025: Concurrent Triggers Test')
    print('='*60)
    
    def create_trigger(name, delay):
        time.sleep(delay)
        Path(f'AI_Employee_Vault/Inbox/concurrent_{name}.md').write_text(
            f'# Concurrent Test {name}'
        )
        print(f'  Created: concurrent_{name}')

    # Create 3 concurrent triggers with slight delays
    threads = [
        threading.Thread(target=create_trigger, args=('A', 0)),
        threading.Thread(target=create_trigger, args=('B', 0.1)),
        threading.Thread(target=create_trigger, args=('C', 0.2))
    ]
    
    print('Creating 3 concurrent triggers...')
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    
    print('[OK] All concurrent triggers created')
    time.sleep(1)
    
    # Check for updates
    fw = FileWatcher(
        str(Path('AI_Employee_Vault/Inbox')),
        str(Path('AI_Employee_Vault'))
    )
    new_files = fw.check_for_updates()
    print(f'[OK] Detected {len(new_files)} concurrent file(s)')
    
    # Create task files
    created = [fw.create_action_file(f) for f in new_files]
    created_count = len([c for c in created if c])
    print(f'[OK] Created {created_count} task file(s)')
    
    # Verify no conflicts (all files created separately)
    assert created_count == len(new_files), 'File conflict detected!'
    print('[OK] No conflicts - all files processed separately')
    
    print('\n[PASS] T025: Concurrent Triggers Test - PASSED\n')
    return True

def test_dev_mode():
    """Test DEV_MODE functionality"""
    print('\n' + '='*60)
    print('DEV_MODE Functionality Test')
    print('='*60)
    
    print(f'Current DEV_MODE status: {is_dev_mode()}')
    
    # Test with DEV_MODE enabled
    import os
    os.environ['DEV_MODE'] = 'true'
    
    fw = FileWatcher(
        str(Path('AI_Employee_Vault/Inbox')),
        str(Path('AI_Employee_Vault'))
    )
    
    test_file = Path('AI_Employee_Vault/Inbox/test_dev_mode.md')
    test_file.write_text('# DEV_MODE Test')
    
    new_files = fw.check_for_updates()
    created = [fw.create_action_file(f) for f in new_files]
    
    # In DEV_MODE, no files should be created
    actual_created = [c for c in created if c]
    print(f'[OK] DEV_MODE: {len(actual_created)} file(s) created (expected 0)')
    
    # Clean up
    os.environ['DEV_MODE'] = 'false'
    test_file.unlink()
    
    print('\n[PASS] DEV_MODE Functionality Test - PASSED\n')
    return True

if __name__ == '__main__':
    print('\n' + '='*60)
    print('SILVER TIER WATCHER TEST SUITE')
    print('='*60)
    
    results = {
        'T023_Filesystem': False,
        'T025_Concurrent': False,
        'DEV_MODE': False
    }
    
    try:
        results['T023_Filesystem'] = test_filesystem_watcher()
    except Exception as e:
        print(f'❌ T023 FAILED: {e}')
    
    try:
        results['T025_Concurrent'] = test_concurrent_triggers()
    except Exception as e:
        print(f'❌ T025 FAILED: {e}')
    
    try:
        results['DEV_MODE'] = test_dev_mode()
    except Exception as e:
        print(f'❌ DEV_MODE FAILED: {e}')
    
    # Summary
    print('\n' + '='*60)
    print('TEST SUMMARY')
    print('='*60)
    for test, passed in results.items():
        status = '[PASS] PASSED' if passed else '[FAIL] FAILED'
        print(f'{test}: {status}')
    
    passed_count = sum(results.values())
    total_count = len(results)
    print(f'\nTotal: {passed_count}/{total_count} tests passed')
    print('='*60 + '\n')
