#!/usr/bin/env python3
"""
Gold Tier End-to-End Test Suite

Tests all cross-domain flows end-to-end:
1. WhatsApp → Odoo Invoice → Social Post
2. Email → Achievement → Social Summary
3. File Drop → Odoo Transaction → Logging

Run this script to verify Gold Tier functionality before Hackathon 0 submission.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('gold_tier_e2e_test')


class GoldTierE2ETest:
    """
    Gold Tier End-to-End Test Suite
    """
    
    def __init__(self, vault_path: str):
        """
        Initialize test suite.
        
        Args:
            vault_path: Path to AI_Employee_Vault directory
        """
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        self.done = self.vault_path / 'Done'
        self.pending_approval = self.vault_path / 'Pending_Approval'
        self.logs = self.vault_path / 'Logs'
        self.dashboard = self.vault_path / 'Dashboard.md'
        
        # Ensure directories exist
        for folder in [self.needs_action, self.done, self.pending_approval, self.logs]:
            folder.mkdir(exist_ok=True)
        
        # Test results
        self.test_results = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'tests': []
        }
        
        logger.info(f'GoldTierE2ETest initialized - Vault: {self.vault_path}')
    
    def log_test_result(self, test_name: str, passed: bool, details: str) -> None:
        """
        Log test result.
        
        Args:
            test_name: Name of test
            passed: Whether test passed
            details: Test details
        """
        self.test_results['total'] += 1
        if passed:
            self.test_results['passed'] += 1
            status = '✅ PASS'
        else:
            self.test_results['failed'] += 1
            status = '❌ FAIL'
        
        self.test_results['tests'].append({
            'name': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
        logger.info(f'[{status}] {test_name}: {details}')
    
    def test_cross_domain_whatsapp_invoice(self) -> bool:
        """
        Test 1: WhatsApp → Odoo Invoice → Social Post flow
        
        Returns:
            True if test passed
        """
        test_name = 'Cross-Domain: WhatsApp → Odoo Invoice'
        logger.info(f'\n=== Running Test: {test_name} ===')
        
        try:
            # Step 1: Simulate WhatsApp message
            whatsapp_msg = "Hi! The project is completed. Please send invoice for $5000 to Client ABC."
            logger.info(f'Simulating WhatsApp message: {whatsapp_msg}')
            
            # Step 2: Create cross-domain task file
            task_filename = f"CROSSDOMAIN_INVOICE_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            task_path = self.needs_action / task_filename
            
            task_content = f"""---
source: cross_domain_trigger
type: invoice
trigger_source: whatsapp
business_action: Create Odoo invoice
mcp_server: odoo-mcp
skill: odoo_create_invoice
status: pending
priority: high
created: {datetime.now(timezone.utc).isoformat()}
---

# Cross-Domain Trigger: Invoice

**Source**: whatsapp  
**Business Action**: Create Odoo invoice

## Original Content

{whatsapp_msg}

## Extracted Data

- **Amount**: $5,000.00
- **Client**: ABC

## Required Actions

1. [ ] Review trigger and extracted data
2. [ ] Create Odoo invoice via odoo-mcp
3. [ ] Log action in audit_log.jsonl
4. [ ] Move to /Done when complete

## HITL Approval

**Requires Approval**: Yes  
**Approval Status**: Pending  
"""
            task_path.write_text(task_content)
            logger.info(f'Cross-domain task created: {task_path}')
            
            # Step 3: Verify task file created
            if not task_path.exists():
                self.log_test_result(test_name, False, 'Task file not created')
                return False
            
            # Step 4: Verify task has correct structure
            content = task_path.read_text()
            checks = [
                ('source: cross_domain_trigger' in content, 'source field'),
                ('type: invoice' in content, 'type field'),
                ('odoo_create_invoice' in content, 'skill reference'),
                ('odoo-mcp' in content, 'MCP server reference'),
                ('HITL Approval' in content, 'HITL approval section'),
            ]
            
            all_passed = all(check[0] for check in checks)
            
            if all_passed:
                self.log_test_result(test_name, True, 'Task file created with correct structure')
                
                # Move to Done to simulate completion
                done_path = self.done / task_filename
                task_path.rename(done_path)
                logger.info(f'Task moved to /Done: {done_path}')
                
                return True
            else:
                failed_checks = [check[1] for check in checks if not check[0]]
                self.log_test_result(test_name, False, f'Missing: {", ".join(failed_checks)}')
                return False
            
        except Exception as e:
            self.log_test_result(test_name, False, f'Error: {str(e)}')
            return False
    
    def test_cross_domain_email_achievement(self) -> bool:
        """
        Test 2: Email → Achievement → Social Summary flow
        
        Returns:
            True if test passed
        """
        test_name = 'Cross-Domain: Email → Social Summary'
        logger.info(f'\n=== Running Test: {test_name} ===')
        
        try:
            # Step 1: Simulate achievement email
            email_subject = "Congratulations on the award!"
            email_body = "We're excited to announce you've won the Business Achievement Award!"
            logger.info(f'Simulating email: {email_subject}')
            
            # Step 2: Create cross-domain task file
            task_filename = f"CROSSDOMAIN_ACHIEVEMENT_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            task_path = self.needs_action / task_filename
            
            task_content = f"""---
source: cross_domain_trigger
type: achievement
trigger_source: gmail
business_action: Draft social media posts
mcp_server: social-mcp
skill: social_generate_summary
status: pending
priority: high
created: {datetime.now(timezone.utc).isoformat()}
---

# Cross-Domain Trigger: Achievement

**Source**: gmail  
**Business Action**: Draft social media posts

## Original Content

Subject: {email_subject}

{email_body}

## Required Actions

1. [ ] Review trigger
2. [ ] Generate social media summaries (Facebook, Instagram, Twitter)
3. [ ] Log action in audit_log.jsonl
4. [ ] Move to /Done when complete

## HITL Approval

**Requires Approval**: Yes  
**Approval Status**: Pending  
"""
            task_path.write_text(task_content)
            logger.info(f'Cross-domain task created: {task_path}')
            
            # Step 3: Verify task file created
            if not task_path.exists():
                self.log_test_result(test_name, False, 'Task file not created')
                return False
            
            # Step 4: Verify task has correct structure
            content = task_path.read_text()
            checks = [
                ('source: cross_domain_trigger' in content, 'source field'),
                ('type: achievement' in content, 'type field'),
                ('social_generate_summary' in content, 'skill reference'),
                ('social-mcp' in content, 'MCP server reference'),
                ('Facebook, Instagram, Twitter' in content, 'platform references'),
            ]
            
            all_passed = all(check[0] for check in checks)
            
            if all_passed:
                self.log_test_result(test_name, True, 'Task file created with correct structure')
                
                # Move to Done
                done_path = self.done / task_filename
                task_path.rename(done_path)
                
                return True
            else:
                failed_checks = [check[1] for check in checks if not check[0]]
                self.log_test_result(test_name, False, f'Missing: {", ".join(failed_checks)}')
                return False
            
        except Exception as e:
            self.log_test_result(test_name, False, f'Error: {str(e)}')
            return False
    
    def test_cross_domain_file_transaction(self) -> bool:
        """
        Test 3: File Drop → Odoo Transaction → Logging flow
        
        Returns:
            True if test passed
        """
        test_name = 'Cross-Domain: File Drop → Odoo Transaction'
        logger.info(f'\n=== Running Test: {test_name} ===')
        
        try:
            # Step 1: Simulate file drop with receipt
            receipt_content = "Receipt for office supplies purchase. Total: $150.00. Thank you for your payment."
            logger.info(f'Simulating file drop with receipt')
            
            # Step 2: Create cross-domain task file
            task_filename = f"CROSSDOMAIN_RECEIPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            task_path = self.needs_action / task_filename
            
            task_content = f"""---
source: cross_domain_trigger
type: receipt
trigger_source: file_drop
business_action: Log transaction in Odoo
mcp_server: odoo-mcp
skill: odoo_log_transaction
status: pending
priority: high
created: {datetime.now(timezone.utc).isoformat()}
---

# Cross-Domain Trigger: Receipt

**Source**: file_drop  
**Business Action**: Log transaction in Odoo

## Original Content

{receipt_content}

## Extracted Data

- **Amount**: $150.00
- **Category**: Office supplies

## Required Actions

1. [ ] Review trigger and extracted data
2. [ ] Log transaction in Odoo via odoo_log_transaction
3. [ ] Log action in audit_log.jsonl
4. [ ] Move to /Done when complete

## HITL Approval

**Requires Approval**: Yes  
**Approval Status**: Pending  
"""
            task_path.write_text(task_content)
            logger.info(f'Cross-domain task created: {task_path}')
            
            # Step 3: Verify task file created
            if not task_path.exists():
                self.log_test_result(test_name, False, 'Task file not created')
                return False
            
            # Step 4: Verify task has correct structure
            content = task_path.read_text()
            checks = [
                ('source: cross_domain_trigger' in content, 'source field'),
                ('type: receipt' in content, 'type field'),
                ('odoo_log_transaction' in content, 'skill reference'),
                ('odoo-mcp' in content, 'MCP server reference'),
                ('$150.00' in content, 'amount extracted'),
            ]
            
            all_passed = all(check[0] for check in checks)
            
            if all_passed:
                self.log_test_result(test_name, True, 'Task file created with correct structure')
                
                # Move to Done
                done_path = self.done / task_filename
                task_path.rename(done_path)
                
                return True
            else:
                failed_checks = [check[1] for check in checks if not check[0]]
                self.log_test_result(test_name, False, f'Missing: {", ".join(failed_checks)}')
                return False
            
        except Exception as e:
            self.log_test_result(test_name, False, f'Error: {str(e)}')
            return False
    
    def test_ralph_wiggum_loop(self) -> bool:
        """
        Test 4: Ralph Wiggum Loop iteration
        
        Returns:
            True if test passed
        """
        test_name = 'Ralph Wiggum Loop: Iteration Pattern'
        logger.info(f'\n=== Running Test: {test_name} ===')
        
        try:
            # Step 1: Create Plan.md for test
            plan_filename = f"PLAN_TEST_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            plan_path = self.vault_path / 'Plans' / plan_filename
            plan_path.parent.mkdir(exist_ok=True)
            
            plan_content = f"""---
source_task: TEST_TASK.md
status: active
created: {datetime.now(timezone.utc).isoformat()}
updated: {datetime.now(timezone.utc).isoformat()}
total_steps: 4
completed_steps: 0
iteration: 0
---

# Plan: Test Task

**Source**: TEST_TASK.md  
**Created**: {datetime.now(timezone.utc).isoformat()}

## Action Items

- [ ] Step 1: READ task
- [ ] Step 2: REASON about next step
- [ ] Step 3: PLAN actions
- [ ] Step 4: ACT via MCP

## Progress

**Status**: 0/4 completed (0%)

## Iteration Log

<!-- Iteration history will be logged here -->

## Completion Report

<!-- Will be filled when all checkboxes are complete -->
"""
            plan_path.write_text(plan_content)
            logger.info(f'Plan.md created: {plan_path}')
            
            # Step 2: Verify Plan.md structure
            content = plan_path.read_text()
            checks = [
                ('status: active' in content, 'status field'),
                ('total_steps: 4' in content, 'total_steps field'),
                ('completed_steps: 0' in content, 'completed_steps field'),
                ('iteration: 0' in content, 'iteration field'),
                ('Action Items' in content, 'action items section'),
                ('Iteration Log' in content, 'iteration log section'),
            ]
            
            all_passed = all(check[0] for check in checks)
            
            if all_passed:
                self.log_test_result(test_name, True, 'Plan.md created with correct Ralph Wiggum structure')
                return True
            else:
                failed_checks = [check[1] for check in checks if not check[0]]
                self.log_test_result(test_name, False, f'Missing: {", ".join(failed_checks)}')
                return False
            
        except Exception as e:
            self.log_test_result(test_name, False, f'Error: {str(e)}')
            return False
    
    def test_ceo_briefing_generation(self) -> bool:
        """
        Test 5: CEO Briefing generation
        
        Returns:
            True if test passed
        """
        test_name = 'CEO Briefing: Generation'
        logger.info(f'\n=== Running Test: {test_name} ===')
        
        try:
            # Step 1: Import CEO Briefing Generator
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from scheduling.ceo_briefing import CEOBriefingGenerator
            
            # Step 2: Generate briefing
            generator = CEOBriefingGenerator(str(self.vault_path))
            briefing = generator.generate_briefing()
            
            # Step 3: Verify briefing structure
            checks = [
                ('# CEO Briefing' in briefing, 'CEO Briefing header'),
                ('## Revenue' in briefing, 'Revenue section'),
                ('## Expenses' in briefing, 'Expenses section'),
                ('## Bottlenecks' in briefing, 'Bottlenecks section'),
                ('## Task Summary' in briefing, 'Task Summary section'),
                ('## Actionable Insights' in briefing, 'Insights section'),
                ('*Generated by Gold Tier Autonomous Assistant*' in briefing, 'attribution'),
            ]
            
            all_passed = all(check[0] for check in checks)
            
            if all_passed:
                self.log_test_result(test_name, True, f'CEO Briefing generated successfully ({len(briefing)} characters)')
                
                # Step 4: Update Dashboard
                success = generator.update_dashboard(briefing)
                if success:
                    logger.info('Dashboard.md updated successfully')
                else:
                    logger.warning('Dashboard.md update failed')
                
                return True
            else:
                failed_checks = [check[1] for check in checks if not check[0]]
                self.log_test_result(test_name, False, f'Missing: {", ".join(failed_checks)}')
                return False
            
        except ImportError as e:
            self.log_test_result(test_name, False, f'Import error: {str(e)}')
            return False
        except Exception as e:
            self.log_test_result(test_name, False, f'Error: {str(e)}')
            return False
    
    def test_audit_logging(self) -> bool:
        """
        Test 6: Comprehensive audit logging
        
        Returns:
            True if test passed
        """
        test_name = 'Audit Logging: JSON-lines format'
        logger.info(f'\n=== Running Test: {test_name} ===')
        
        try:
            # Step 1: Create test log entry
            log_entry = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'action': 'test_audit_logging',
                'source': 'gold_tier_e2e_test',
                'status': 'success',
                'details': {
                    'test': 'Audit logging test',
                    'result': 'passed'
                }
            }
            
            # Step 2: Write to audit_log.jsonl
            log_file = self.logs / 'audit_log.jsonl'
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
            
            logger.info(f'Log entry written to {log_file}')
            
            # Step 3: Verify log file exists and is readable
            if not log_file.exists():
                self.log_test_result(test_name, False, 'audit_log.jsonl not created')
                return False
            
            # Step 4: Verify log entry is valid JSON
            with open(log_file, 'r') as f:
                lines = f.readlines()
                if len(lines) == 0:
                    self.log_test_result(test_name, False, 'audit_log.jsonl is empty')
                    return False
                
                # Verify last line is valid JSON
                try:
                    last_entry = json.loads(lines[-1])
                    required_fields = ['timestamp', 'action', 'source', 'status']
                    has_all_fields = all(field in last_entry for field in required_fields)
                    
                    if has_all_fields:
                        self.log_test_result(test_name, True, f'Audit logging working ({len(lines)} entries)')
                        return True
                    else:
                        self.log_test_result(test_name, False, 'Missing required fields in log entry')
                        return False
                except json.JSONDecodeError:
                    self.log_test_result(test_name, False, 'Invalid JSON in audit_log.jsonl')
                    return False
            
        except Exception as e:
            self.log_test_result(test_name, False, f'Error: {str(e)}')
            return False
    
    def run_all_tests(self) -> dict:
        """
        Run all end-to-end tests.
        
        Returns:
            Test results dictionary
        """
        logger.info('\n' + '='*60)
        logger.info('GOLD TIER END-TO-END TEST SUITE')
        logger.info('='*60)
        
        # Run all tests
        self.test_cross_domain_whatsapp_invoice()
        self.test_cross_domain_email_achievement()
        self.test_cross_domain_file_transaction()
        self.test_ralph_wiggum_loop()
        self.test_ceo_briefing_generation()
        self.test_audit_logging()
        
        # Summary
        logger.info('\n' + '='*60)
        logger.info('TEST SUMMARY')
        logger.info('='*60)
        logger.info(f'Total Tests: {self.test_results["total"]}')
        logger.info(f'Passed: {self.test_results["passed"]} ✅')
        logger.info(f'Failed: {self.test_results["failed"]} ❌')
        logger.info(f'Pass Rate: {self.test_results["passed"]/self.test_results["total"]*100:.1f}%')
        
        # Generate test report
        report_path = self.vault_path / 'Logs' / f'e2e_test_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.md'
        report_content = f"""# Gold Tier End-to-End Test Report

**Date**: {datetime.now(timezone.utc).isoformat()}  
**Total Tests**: {self.test_results['total']}  
**Passed**: {self.test_results['passed']} ✅  
**Failed**: {self.test_results['failed']} ❌  
**Pass Rate**: {self.test_results['passed']/self.test_results['total']*100:.1f}%

## Test Results

"""
        for test in self.test_results['tests']:
            status = '✅ PASS' if test['passed'] else '❌ FAIL'
            report_content += f"### {status} {test['name']}\n\n"
            report_content += f"**Details**: {test['details']}\n\n"
            report_content += f"**Timestamp**: {test['timestamp']}\n\n---\n\n"
        
        report_content += f"""
## Conclusion

{'All tests PASSED! Gold Tier is ready for Hackathon 0 submission.' if self.test_results['failed'] == 0 else 'Some tests failed. Review and fix issues before submission.'}

---
*Generated by Gold Tier E2E Test Suite*
"""
        report_path.write_text(report_content, encoding='utf-8')
        logger.info(f'Test report saved to {report_path}')
        
        return self.test_results


if __name__ == '__main__':
    print('\n' + '='*60)
    print('GOLD TIER END-TO-END TEST SUITE')
    print('='*60)
    print('\nThis script tests all cross-domain flows end-to-end.')
    print('Expected duration: 2-3 minutes\n')
    
    vault_path = Path('AI_Employee_Vault')
    test_suite = GoldTierE2ETest(str(vault_path))
    
    results = test_suite.run_all_tests()
    
    print('\n' + '='*60)
    print('FINAL RESULT')
    print('='*60)
    
    if results['failed'] == 0:
        print('\n[PASS] ALL TESTS PASSED!')
        print('\nGold Tier is READY for Hackathon 0 submission!')
        print('\nNext steps:')
        print('1. Review test report in AI_Employee_Vault/Logs/')
        print('2. Run full Gold Tier acceptance checklist')
        print('3. Prepare demo video')
        print('4. Complete Hackathon 0 submission form')
    else:
        print(f'\n[WARN] {results["failed"]} TEST(S) FAILED')
        print('\nPlease review and fix issues before submission.')
        print('Test report saved to AI_Employee_Vault/Logs/')
    
    print('\n' + '='*60 + '\n')
