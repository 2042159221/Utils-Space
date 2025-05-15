---
description: 在每次代码更改后自动执行，生成符合conventional commit规范的提交消息，并对新手小白提供友好的解释。
globs: 
alwaysApply: false

---

---

description: Git Auto Commit Rule
globs: 

alwaysApply: 
---

## Description

This rule ensures that after Roo automatically performs changes from Git commits, the modified files are automatically committed back to Git using the conventional commit format. This maintains a clear and consistent commit history that explains what changes were made and why.

## Rule

After Roo performs automatic changes:

1. All modified files MUST be automatically committed
2. Commit messages MUST follow the conventional commit format
3. Commit messages MUST include:
   - Type: The type of change (feat, fix, docs, style, refactor, test, chore)
   - Scope: The affected component or area (optional)
   - Description: A clear explanation of what changed
   - Body: Detailed explanation of why the changes were made
4. The commit message MUST reference the original prompts used to generate the changes

## Implementation

- The Roo will:
  - Track all files modified by automatic changes
  - Generate a conventional commit message based on the changes
  - Include the original prompts in the commit body
  - Automatically execute the git commit command
  - Handle any potential merge conflicts or errors

## Benefits

- Maintains clear and consistent commit history
- Provides traceability between prompts and code changes
- Follows industry-standard commit conventions
- Automates the commit process for better workflow efficiency

## Examples

✅ Correct Commit Message:

```
feat(ide): implement automatic code formatting

- Added automatic formatting for Python files
- Implemented consistent indentation rules
- Added support for line length limits

Changes were generated based on the following prompts:
1. "Format the code according to PEP 8 standards"
2. "Ensure consistent indentation across all files"
```

❌ Incorrect Commit Message:

```
Updated some files

- Made changes to formatting
- Fixed some issues
```

## Conventional Commit Types

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code refactoring
- test: Adding or modifying tests
- chore: Maintenance tasks