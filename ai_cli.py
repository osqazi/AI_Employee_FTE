#!/usr/bin/env python3
"""
AI Reasoning Engine Wrapper

This script reads AI_REASONING_ENGINE from .env and calls the appropriate
AI CLI tool (Claude Code or Qwen) with the provided arguments.

Usage:
    python ai_cli.py "Your prompt here"
    python ai_cli.py --version
    python ai_cli.py --which  # Show which engine will be used
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def load_env_file():
    """Load AI_REASONING_ENGINE from .env file."""
    env_path = Path('.env')
    if not env_path.exists():
        return 'claude'  # Default to Claude Code
    
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('AI_REASONING_ENGINE='):
                return line.split('=', 1)[1].strip()
    
    return 'claude'  # Default


def get_cli_command(engine):
    """Get the CLI command for the specified engine."""
    if engine == 'qwen':
        # Qwen CLI command (adjust based on your Qwen installation)
        return ['qwen']
    else:
        # Claude Code CLI command
        return ['claude']


def main():
    parser = argparse.ArgumentParser(
        description='AI Reasoning Engine Wrapper - calls Claude Code or Qwen based on AI_REASONING_ENGINE'
    )
    parser.add_argument(
        'args',
        nargs='*',
        help='Arguments to pass to the AI CLI tool'
    )
    parser.add_argument(
        '--which',
        action='store_true',
        help='Show which AI engine will be used'
    )
    parser.add_argument(
        '--version',
        action='store_true',
        help='Show AI CLI version'
    )
    
    args = parser.parse_args()
    
    # Show which engine
    if args.which:
        engine = load_env_file()
        engine_display = 'Claude Code' if engine == 'claude' else 'Qwen'
        cli_cmd = get_cli_command(engine)
        print(f'AI Reasoning Engine: {engine_display} ({engine})')
        print(f'CLI Command: {" ".join(cli_cmd)}')
        print(f'Config File: .env')
        return 0
    
    # Show version
    if args.version:
        engine = load_env_file()
        cli_cmd = get_cli_command(engine)
        try:
            result = subprocess.run(cli_cmd + ['--version'], capture_output=True, text=True)
            print(result.stdout)
        except FileNotFoundError:
            print(f'Error: {cli_cmd[0]} CLI not found')
            print(f'Install: {"npm install -g @anthropic-ai/claude-code" if engine == "claude" else "pip install qwen-cli"}')
        return 0
    
    # Run AI CLI with arguments
    engine = load_env_file()
    engine_display = 'Claude Code' if engine == 'claude' else 'Qwen'
    
    cli_cmd = get_cli_command(engine)
    
    try:
        # Run the AI CLI tool
        result = subprocess.run(cli_cmd + args.args, check=False)
        return result.returncode
    except FileNotFoundError:
        print(f'Error: {engine_display} CLI not found')
        print(f'Install command:')
        if engine == 'claude':
            print(f'  npm install -g @anthropic-ai/claude-code')
        else:
            print(f'  pip install qwen-cli (or your Qwen CLI package)')
        return 1
    except KeyboardInterrupt:
        return 130


if __name__ == '__main__':
    sys.exit(main())
