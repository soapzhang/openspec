---
name: opsc-continue
description: 为 OpenSpec 变更创建下一个产物文档（refine 之后的 proposal/specs/design/tasks）。当用户想要推进产物文档、生成下一个产物时使用。不涉及代码实施（那是 opsc-apply）。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "6.1.0"
---

通过创建下一个产物继续处理变更。

**输入**：可选择指定变更名称。如果省略，检查是否可以从对话上下文中推断。如果模糊或不明确，必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 `opsc list --json` 以获取按最近修改排序的可用变更。然后使用 **AskUserQuestion 工具** 让用户选择要处理哪个变更。

   提供前 3-4 个最近修改的变更作为选项，显示：
   - 变更名称
   - Schema（如果有 `schema` 字段，否则为 "spec-driven"）
   - 状态（例如，"0/5 tasks", "complete", "no tasks"）
   - 最近修改时间（来自 `lastModified` 字段）

   将最近修改的变更标记为 "(Recommended)"，因为这很可能是用户想要继续的。

   **重要**：不要猜测或自动选择变更。始终让用户选择。

2. **运行 continue 命令**
   ```bash
   opsc continue --change "<name>"
   ```
   CLI 会自动完成：读取当前阶段 → 映射下一个产物 → 规模判定（refine 阶段）→ 门槛校验 → 输出产物指令 → 推进状态。**不要**自己跑 `opsc status --json` 或 `opsc instructions` 手工复刻这套流程。

3. **根据 CLI 输出分流**：

   ---

   **如果输出"请先运行 `opsc refine` 完成完善环节"**（当前阶段为 new）：
   - 告知用户变更还在初始阶段
   - 建议用户确认后调用 `opsc-refine` 技能
   - 停止

   ---

   **如果输出"所有产物已生成，运行 `opsc apply` 实施任务"**（当前阶段为 tasks）：
   - 祝贺用户，所有产物已创建
   - 建议："可以调用 `opsc-apply` 技能开始实施，或将变更归档。"
   - 停止

   ---

   **如果输出"已完成，运行 `opsc release` 完善上线文档"**（当前阶段为 cN-apply）：
   - 建议用户调用 `opsc-release` 技能
   - 停止

   ---

   **否则，输出是产物创建指令**（`<artifact>` XML 结构）。解析并执行：
   - `<task>`：要创建什么
   - `<project_context>` / `<rules>`：给你的约束（**不要**复制到产物文件中）
   - `<dependencies>`：先阅读这些已完成的产物文件获取上下文
   - `<output>`：产物写入路径
   - `<instruction>` / `<template>`：创建指导和文件结构（用 template 作为结构填充）
   - `<warning>`（如出现）：依赖未满足，告知用户缺失项并询问是否继续

   **创建产物文件**：
   - 阅读 `<dependencies>` 中列出的已完成产物
   - 使用 `<template>` 作为结构，填充各部分
   - 写入 `<output>` 指定的路径
   - 写入后验证文件确实存在
   - **创建一个产物后停止**

4. **创建产物后，显示进度**
   ```bash
   opsc status --change "<name>"
   ```

**输出**

每次调用后，显示：
- 创建了哪个产物
- 正在使用的 Schema 工作流
- 当前阶段与下一步（来自 `opsc status` 输出）
- 提示："想要继续吗？只需让我继续或告诉我下一步做什么。"

**产物创建指南**

产物类型及其用途取决于 Schema。使用指令输出中的 `instruction` 字段来了解要创建什么。

常见产物模式：

**spec-driven schema** (proposal → specs → design → tasks):
- **proposal.md**：如果不清楚，询问用户关于变更的信息。填写 Why, What Changes, Capabilities, Impact。
  - Capabilities 就两个点：(1) 推进结论（简单/复杂）；(2) 能力清单。capability 名用用户对话语言，禁止翻译。
  - **规模判定**：以 `opsc continue` CLI 判定为准（refine 阶段自动完成，写入 `yaml.size` 并输出提示）。proposal 的推进结论必须与 CLI 判定一致，不自行重新计数。
    - **简单需求** → 四件套放变更根目录。
	    - **复杂需求** → c1-xxx ~ cN-xxx 子能力目录。每个目录只有 3 个文件：spec.md、design.md、tasks.md。根目录 proposal.md 为总览。

	      ```
	      changes/<name>/
	      ├── proposal.md           # 总览（Why + 能力清单）
	      ├── c1-<capability-1>/
	      │   ├── spec.md
	      │   ├── design.md
	      │   └── tasks.md
	      ├── c2-<capability-2>/
	      │   └── ...
	      ```
- **specs**：简单需求 → specs/<capability>/spec.md（变更根目录）；复杂需求 → cN-<capability>/spec.md。
- **design.md**：先读代码取证，再结合 specs 做设计。必须列出文件变更清单（新增/修改/删除，改什么），不可只讲架构。复杂需求 → cN-<capability>/design.md。
- **tasks.md**：将实施分解为带复选框的任务。简单需求 → 变更根目录；复杂需求 → cN-<capability>/tasks.md。
- **目录名规则**：cN- + capability 原文，禁止翻译。

对于其他 Schema，遵循 CLI 输出中的 `instruction` 字段。

**护栏**
- 每次调用创建一个产物
- 在创建新产物之前，始终阅读依赖产物
- 绝不跳过产物或乱序创建
- 如果上下文不清楚，在创建之前询问用户
- 在标记进度之前，验证写入后产物文件是否存在
- 使用 Schema 的产物序列，不要假设特定的产物名称
- **重要**：`context` 和 `rules` 是给你的约束，不是文件内容
  - 不要将 `<context>`, `<rules>`, `<project_context>` 块复制到产物中
  - 这些指导你写什么，但绝不应出现在输出中
