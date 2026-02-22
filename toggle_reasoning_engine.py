#!/usr/bin/env python3
"""
AI Reasoning Engine Toggle

Switch between Claude Code (Primary) and Qwen (Secondary) as the AI reasoning engine
for the Personal AI Employee project.

Usage:
    python toggle_reasoning_engine.py              # Interactive mode
    python toggle_reasoning_engine.py --engine claude  # Switch to Claude Code
    python toggle_reasoning_engine.py --engine qwen    # Switch to Qwen
    python toggle_reasoning_engine.py --status        # Show current engine
    python toggle_reasoning_engine.py --toggle        # Toggle to other engine
"""

import argparse
import os
import sys
from pathlib import Path
from datetime import datetime


def load_env_file():
    """Load current .env file settings."""
    env_path = Path('.env')
    if not env_path.exists():
        return {}
    
    env_vars = {}
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    return env_vars


def save_env_file(env_vars):
    """Save updated settings to .env file."""
    env_path = Path('.env')
    
    # Read existing content
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    else:
        lines = []
    
    # Update or add AI_REASONING_ENGINE variable
    found_engine = False
    for i, line in enumerate(lines):
        if line.strip().startswith('AI_REASONING_ENGINE='):
            lines[i] = f'AI_REASONING_ENGINE={env_vars.get("AI_REASONING_ENGINE", "claude")}\n'
            found_engine = True
            break
    
    if not found_engine:
        lines.append(f'\nAI_REASONING_ENGINE={env_vars.get("AI_REASONING_ENGINE", "claude")}\n')
    
    # Write back
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)


def get_current_engine():
    """Get current AI reasoning engine setting."""
    env_vars = load_env_file()
    return env_vars.get('AI_REASONING_ENGINE', 'claude')


def get_other_engine(current):
    """Get the other engine (toggle)."""
    return 'qwen' if current == 'claude' else 'claude'


def switch_engine(engine_name):
    """Switch to specified AI reasoning engine."""
    valid_engines = ['claude', 'qwen']
    
    if engine_name not in valid_engines:
        print(f'[ERROR] Invalid engine: {engine_name}')
        print(f'Valid options: {", ".join(valid_engines)}')
        print(f'  - claude: Claude Code (Primary)')
        print(f'  - qwen: Qwen (Secondary)')
        return False
    
    env_vars = load_env_file()
    env_vars['AI_REASONING_ENGINE'] = engine_name
    save_env_file(env_vars)
    
    engine_display = 'Claude Code' if engine_name == 'claude' else 'Qwen'
    print(f'[OK] Switched to {engine_display} ({engine_name.upper()})')
    print(f'   AI_REASONING_ENGINE={engine_name}')
    
    # Log the switch
    log_engine_switch(engine_name)
    
    return True


def log_engine_switch(engine_name):
    """Log engine switch to logs."""
    logs_dir = Path('AI_Employee_Vault/Logs')
    logs_dir.mkdir(exist_ok=True)
    
    log_file = logs_dir / 'reasoning_engine_switches.log'
    timestamp = datetime.now().isoformat()
    engine_display = 'Claude Code' if engine_name == 'claude' else 'Qwen'
    
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(f'{timestamp} - Switched to {engine_display} ({engine_name})\n')


def show_status():
    """Show current AI reasoning engine status."""
    current = get_current_engine()
    current_display = 'Claude Code' if current == 'claude' else 'Qwen'
    other = get_other_engine(current)
    other_display = 'Claude Code' if other == 'claude' else 'Qwen'
    
    print('\n' + '='*60)
    print('AI REASONING ENGINE STATUS')
    print('='*60)
    print(f'Current Engine: {current_display} ({current.upper()})')
    print(f'Other Engine:   {other_display} ({other.upper()})')
    print(f'\nEnvironment Variable: AI_REASONING_ENGINE={current}')
    print(f'Configuration File: .env')
    
    # Show configuration for both engines
    print(f'\n[CONFIG] Claude Code Configuration:')
    print(f'   Status: {"Active" if current == "claude" else "Standby"}')
    print(f'   MCP Config: ~/.config/claude-code/mcp.json')
    
    print(f'\n[CONFIG] Qwen Configuration:')
    print(f'   Status: {"Active" if current == "qwen" else "Standby"}')
    
    # Show usage
    print(f'\n[USAGE] Usage:')
    print(f'   Toggle:    python toggle_reasoning_engine.py --toggle')
    print(f'   Switch:    python toggle_reasoning_engine.py --engine <claude|qwen>')
    print(f'   Status:    python toggle_reasoning_engine.py --status')
    print(f'   Interactive: python toggle_reasoning_engine.py')
    
    # Show recent switches
    log_file = Path('AI_Employee_Vault/Logs/reasoning_engine_switches.log')
    if log_file.exists():
        print(f'\n[HISTORY] Recent Switches:')
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()[-5:]  # Last 5 switches
            for line in lines:
                print(f'   {line.strip()}')
    
    print('='*60 + '\n')


def toggle_engine():
    """Toggle to the other engine."""
    current = get_current_engine()
    other = get_other_engine(current)
    other_display = 'Claude Code' if other == 'claude' else 'Qwen'
    
    print(f'Toggling from {current.upper()} to {other.upper()}...')
    return switch_engine(other)


def interactive_mode():
    """Interactive engine selection."""
    current = get_current_engine()
    current_display = 'Claude Code' if current == 'claude' else 'Qwen'
    other = get_other_engine(current)
    other_display = 'Claude Code' if other == 'claude' else 'Qwen'
    
    print('\n' + '='*60)
    print('AI REASONING ENGINE TOGGLE')
    print('='*60)
    print(f'Current Engine: {current_display} ({current.upper()})')
    print(f'Other Engine:   {other_display} ({other.upper()})\n')
    
    print('Available Actions:')
    print(f'  1. Switch to {other_display} (toggle)')
    print(f'  2. Show status')
    print(f'  3. Exit\n')
    
    choice = input('Select option (1-3): ').strip()
    
    if choice == '1':
        toggle_engine()
    elif choice == '2':
        show_status()
    elif choice == '3':
        print('Exiting...')
        return
    else:
        print('Invalid choice. Please try again.')


def main():
    parser = argparse.ArgumentParser(
        description='Toggle between Claude Code (Primary) and Qwen (Secondary) AI reasoning engines'
    )
    parser.add_argument(
        '--engine',
        type=str,
        choices=['claude', 'qwen'],
        help='AI reasoning engine to use (claude=Primary, qwen=Secondary)'
    )
    parser.add_argument(
        '--status',
        action='store_true',
        help='Show current engine status'
    )
    parser.add_argument(
        '--toggle',
        action='store_true',
        help='Toggle to the other engine'
    )
    
    args = parser.parse_args()
    
    if args.status:
        show_status()
    elif args.toggle:
        toggle_engine()
    elif args.engine:
        switch_engine(args.engine)
    else:
        interactive_mode()


if __name__ == '__main__':
    main()
