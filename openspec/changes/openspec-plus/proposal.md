# Proposal: openspec-plus

## Why

当前 OpenSpec 的变更流程缺少强制的前置需求完善环节和变更跟踪标识，导致 spec 经常建立在模糊需求之上；命令与技能面过大，入口混乱；bug 游离在变更体系之外无法追溯。需要一套更收敛、更可控的变更管理流程。

## What Changes

- **变更跟踪 ID**：所有变更目录必须携带跟踪 ID，格式 `f<跟踪ID>-<描述>`（如 `f17085-登录重构`）。用户提供 ID（数字或字符串均可），缺失时引导用户提供；拒绝时以当前日期兜底（`f20260803-<描述>`）。描述必填。
- **强制完善环节（refine）**：spec 之前强制增加 refine 阶段，收集信息、完善功能与细节，产出 `refine.md`。全程调用 `opsc-grill` 追问，并强制"所有判断基于代码决策"。
- **refine 冻结语义**：refine 使命在进入 proposal/spec 阶段即结束。后续需求变更直接进入 proposal/spec，不反向修改 refine.md，即使存在冲突。
- **规模分支**：由 agent 在 refine 完成、`refine.md` 产出之后判定变更规模，**用户强制确认**。大需求在变更根目录下拆分子能力目录 `c1/`、`c2/`…；小需求四件套直接放根目录。判定结果体现于 proposal 与目录结构，不写入已冻结的 refine.md。
- **子能力独立交付**：每个子能力是独立可交付、可验证的单元，包含该功能全部点（设计、页面、后端），各自拥有完整的 proposal/spec/design/tasks。
- **变更目录结构收紧**：变更根目录只保留 `proposal.md`、`refine.md` 与子能力目录；spec/design/tasks 归属能力层。
- **bug 纳入变更管控**：每个变更下建 `bugs/` 目录，bug 文档 `b0001-<描述>.md` 起自动递增编号，内容含状态/描述/原因/修改方案。bug 的创建与修改不影响变更归档。
- **命令面精简**：CLI 命令只暴露 `init`、`new`、`refine`、`continue`、`apply`、`archive`、`explore`、`bug`，其余命令隐藏（保留实现不删除，便于后续恢复）。
- **opsc-grill 技能**：基于开源 grill-me（mattpocock/skills + RobMitt 完整正文，MIT）适配生成，作为独立技能；refine 强制使用，其他时机可选。补 3 个缺口：refine 输出契约、代码取证规约、OpenSpec 上下文。
- **技能面精简**：技能保留并改名 `opsc-new`、`opsc-refine`、`opsc-continue`、`opsc-apply`、`opsc-archive`、`opsc-explore`、`opsc-bug`、`opsc-grill`，其余技能模板不再生成（保留实现）。
- **命名统一**：**BREAKING** CLI 二进制 `openspec` → `opsc`；斜杠命令前缀 `/opsx:` → `/opsc:`。
- **init 自动安装**：`opsc init` 自动生成上述技能与命令（含 Claude Code 方式），覆盖各已支持工具。
- **用户手册**：功能验证后生成完整用户使用手册，随 git 分发，可下载至 Claude Code 使用。

## Capabilities

**New Capabilities**

- `change-tracking`：变更跟踪 ID 规约（`f<id>-<描述>`、日期兜底、描述必填）与变更目录结构（根目录 proposal/refine + 子能力目录 + bugs）。
- `refine-phase`：强制完善环节，收集信息/完善功能细节，产出 refine.md，代码取证规约，refine 冻结语义。
- `capability-splitting`：规模判定（agent 判定 + 用户强制确认）、大需求子能力拆分（c1/c2…，各自独立交付验证、自包含四件套）。
- `bug-tracking`：bugs/ 目录、b0001 递增编号、bug 文档结构（状态/描述/原因/修改方案）、不影响归档。
- `opsc-grill`：开源 grill-me 适配的独立拷问技能，refine 集成契约，OpenSpec 上下文注入。
- `user-manual`：用户使用手册的生成与分发（git + Claude Code）。

**Modified Capabilities**

- `cli-command-surface`：命令改名 opsc、暴露集合收敛、新增 refine/bug 命令、其余隐藏不删。
- `skill-distribution`：技能改名 opsc-*、新增 opsc-refine/opsc-bug/opsc-grill、init 自动生成与安装（含 Claude Code）。

## Impact

- **CLI**：`src/cli/index.ts` 命令注册（改名、隐藏、新增 refine/bug）、`bin/openspec.js` 二进制入口、package.json `bin` 字段。
- **命令实现**：新增 refine 命令（完善流程编排）、bug 命令（bugs 目录与文档生成）；`new` 命令增加跟踪 ID 交互；`continue`/`apply` 感知 refine 前置与规模分支。
- **技能模板**：`src/core/templates/skill-templates.ts` 新增 opsc-refine/opsc-bug/opsc-grill 模板，改造现有模板正文（前缀、流程、ID 规约）；`src/core/shared/skill-generation.ts` 的模板注册表改名与裁剪。
- **init**：`src/core/init.ts` 快速开始文案（/opsx: → /opsc:）与生成清单适配；config.ts 工具 skillsDir 逻辑不变。
- **目录结构**：schema 相关校验（`schemas/`）、validator 对新目录（refine.md、bugs/、子能力目录）的感知。
- **文档**：README、用户手册更新命令与流程说明。
