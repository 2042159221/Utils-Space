---
description: 此规则定义了在Roo从Git提交中自动应用更改后，如何自动提交这些更改的标准流程。
globs: 
alwaysApply: false
---
# Git自动提交规则

## 规则说明

此规则定义了在Roo从Git提交中自动应用更改后，如何自动提交这些更改的标准流程。规则要求使用约定式提交（Conventional Commits）规范来格式化提交消息，并基于生成提交的提示内容来解释更改内容及原因。

## 执行要求

- 在Roo自动从Git提交中应用任何更改后，必须提交更改的文件
- 尝试启动MCP，若无法正常启动则命令来启动MCP：uvx mcp-server-git --repository D:/CodeProjects/VscodeProjects/utils-space
- 提交消息的标题必须遵循约定式提交规范（Conventional Commits）
  - 格式：`<类型>[可选的作用域]: <描述>`
  - 类型必须是以下之一：feat、fix、docs、style、refactor、perf、test、build、ci、chore、revert
  - 示例：`feat: 添加用户认证功能` 或 `fix(core): 修复计算错误`
- 提交消息的正文必须包含以下内容：
  - 详细说明哪些文件被更改
  - 基于生成提交的提示内容解释为什么进行这些更改
  - 如适用，提及任何重大影响或需要注意的事项
- 提交前应确保所有自动更改的文件都已添加到暂存区
- 使用以下Git命令格式进行提交：
  ```
  git add <更改的文件>
  git commit -m "<类型>: <描述>" -m "<详细说明>"
  ```

## 提交类型指南

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更改
- `style`: 不影响代码含义的更改（空格、格式等）
- `refactor`: 既不修复错误也不添加功能的代码更改
- `perf`: 提高性能的代码更改
- `test`: 添加或修改测试
- `build`: 影响构建系统或外部依赖的更改
- `ci`: 更改CI配置文件和脚本
- `chore`: 其他不修改src或test文件的更改
- `revert`: 恢复之前的提交

## 优先级

此规则在任何Git自动更改操作之后应立即执行，优先级高于其他非紧急操作。 