# Design: openspec-plus

## Context

OpenSpec 是 TypeScript/Commander.js CLI（pnpm、ESM、Node ≥20.19），负责变更生命周期管理：`new` 创建变更、schema 驱动工件生成（proposal/specs/design/tasks）、`apply` 实施、`archive` 归档。同时通过 `init` 为 19 种 AI 工具（claude/cursor/opencode…）生成技能（`.claude/skills/`）与斜杠命令（`.claude/commands/opsx/<id>.md`）。

现状问题：变更无跟踪 ID 标识；spec 前无强制需求完善环节；命令与技能面过大（CLI 18 个命令、10 个技能/命令模板）；bug 无管控入口；前缀 `/opsx:` 与二进制名 `openspec` 与目标命名不符。

约束：跨平台（Windows/macOS/Linux）路径须用 `path.join()`；隐藏命令保留实现；`refine.md` 冻结语义；开源 grill-me（MIT）为 `opsc-grill` 底稿。

## Goals / Non-Goals

**Goals**
- 二进制与斜杠前缀改名：`openspec` → `opsc`、`/opsx:` → `/opsc:`
- 命令面收敛：CLI 仅暴露 `init/new/refine/continue/apply/archive/explore/bug`，其余 `.hidden()`
- 变更跟踪 ID：`f<ID>-<描述>`，日期兜底，描述必填
- 强制完善环节：`opsc refine` 产出 `refine.md`（代码取证、grill 辅助、冻结语义），spec 前 gate
- 规模判定：refine 后 agent 判定 + 用户确认，决定目录结构（根四件套 vs `c1/c2` 子能力）
- bug 管控：`opsc bug` 生成 `bugs/b0001-<描述>.md`
- 技能面：保留并改名 8 个 `opsc-*`，新增 `opsc-refine/opsc-bug/opsc-grill`，init 自动安装
- 用户手册：验证后生成，随 git 分发

**Non-Goals**
- 不删除任何隐藏命令/技能的实现（仅不显示、不生成）
- 不重写 schema 引擎（glob 生成、校验机制沿用）
- 不改动 19 个工具适配器的核心机制（仅路径/前缀常量替换）
- 不实现 grill-me 原版全部能力（仅按 fork 完整正文 + 3 缺口适配）

## Decisions

### D1: 二进制改名 openspec → opsc（破坏性）

- `package.json` `bin`: `"openspec"` → `"opsc"`；`bin/openspec.js` 重命名为 `bin/opsc.js`（内容仅 import `../dist/cli/index.js`）
- `src/cli/index.ts`：`program.name('openspec')` → `'opsc'`；`getCommandPath` 跳过根名同步
- 不做 `openspec` 兼容别名——proposal 已定为 **BREAKING**
- 备选：双 bin 共存。否决：破坏性已由用户确认，别名延长混乱期

### D2: 命令面收敛（Commander `.hidden()`）

- 可见命令：`init`、`new`、`refine`、`continue`、`apply`、`archive`、`explore`、`bug`
- `continue`/`apply`/`explore` CLI 层为薄封装：continue → status + 下一工件 instructions；apply → 复用 `applyInstructionsCommand`；explore → 输出探索指引（保持 skill 为完整载体）
- 其余命令（`update/list/view/change/spec/config/schema/validate/show/feedback/completion/status/instructions/templates/schemas`）全部 `.hidden()`，实现不动
- 备选：物理删除。否决：用户明确"不删除，不显示，后面可能会加"

### D3: 跟踪 ID 命名与目录结构

- 新命名格式 `f<ID>-<描述>`：ID 为数字或字母数字串（如 `17085`、`login`），描述允许含中文
- `validateChangeName` 扩展校验 `^f[A-Za-z0-9]+-.+$`；非法字符（`\/:*?"<>|` 等保留字）拒绝
- 命令面：`opsc new` 交互引导——缺 ID 时 prompt 引导；明确无法提供 → 日期兜底 `fYYYYMMDD-<描述>`；描述缺失时 prompt 引导（必填）
- 变更目录：`changes/f<ID>-<描述>/` 内含 `metadata`、`bugs/`；proposal/refine 后置生成
- 旧 kebab-case 变更名保留兼容（list/status/archive 不破坏）

### D4: refine 前置阶段（命令层 gate，不进 schema 工件）

- `opsc refine` 新命令：生成/更新 `refine.md`（模板含：需求信息、功能细节、开放问题、代码取证记录），并输出 grill 调用指引（agent 加载 `opsc-grill`）
- `refine.md` 不进 schema 工件序列，由命令层作为**前置 gate**：`continue` 与 `instructions specs` 在 `refine.md` 缺失时阻止推进
- 冻结语义：refine 完成后命令层不提供反向修改入口；spec 阶段的需求变更走 proposal/spec 通道
- 备选：扩展 schema 加 refine 工件。否决：schema 工件改动波及 validator/archive/apply 全链，命令层 gate 隔离性更好，且不破坏既有 schema 生态

### D5: 规模判定与能力拆分

- 判定时机：`refine.md` 产出后、proposal 编写前
- 流程：agent 依据 refine 信息判定 `large|small` → inquirer `confirm` 强制用户确认 → 结果写入 change metadata（`size` 字段）
- 大需求：proposal 为总览（动机+能力清单），agent 按 refine 信息建 `c1/`、`c2/`… 子能力目录，每目录内生成各自四件套（proposal/spec/design/tasks）；根目录不放置 spec/design/tasks
- 小需求：四件套生成在变更根目录
- 拆分辅助由 `opsc-continue` skill 指令承载（目录创建 + 四件套引导），schema 引擎不变
- 备选：schema 引擎支持子目录路径模板。否决：引擎改动面大、风险高，判定分支放命令/skill 层可控

### D6: bug 命令

- `opsc bug`：扫描当前变更 `bugs/` 下 `b\d{4}-` 前缀取最大编号 +1；交互收集四字段（状态/描述/原因/修改方案）→ 写 `bugs/b0001-<描述>.md`
- 归档不校验 bugs 状态（proposal 已定：不影响归档）

### D7: 技能与命令模板

- `src/core/templates/skill-templates.ts`：新增 `getRefineSkillTemplate`、`getBugSkillTemplate`、`getGrillSkillTemplate`（基于 RobMitt fork 完整正文 + 3 缺口：refine 输出契约、代码取证规约、OpenSpec 上下文；标注 MIT 出处）
- `src/core/shared/skill-generation.ts`：`getSkillTemplates()` 只注册 8 个（`opsc-new/refine/continue/apply/archive/explore/bug/grill`，dirName 改 `opsc-*`）；`getCommandTemplates()` 只注册 `explore/new/refine/continue/apply/archive/bug`
- 隐藏技能模板函数保留（不导出到注册表即不生成）

### D8: 前缀与文案替换

- `src/utils/command-references.ts`：`/opsx:` → `/opsc:`（transformToHyphenCommands 正则同步）
- `src/core/command-generation/adapters/*.ts`（19 个）：路径常量 `opsx-<id>`/`opsx/` → `opsc-<id>`/`opsc/`，frontmatter `name: /opsx-<id>` → `/opsc-<id>`
- 文案：`src/ui/welcome-screen.ts`、`src/core/init.ts`（快速开始）、`src/core/update.ts`、`src/core/legacy-cleanup.ts`
- 全仓 grep `/opsx` 收敛（当前 177 处）

### D9: init 与用户手册

- init 生成逻辑不变，注册表裁剪后自动只装 8 个技能 + 7 个命令（含 Claude Code `.claude/skills|commands`）
- 用户手册：新增 `docs/user-manual.md`（安装/init、全流程操作、bug 管理、命令参考、Claude Code 用法），随 git 分发；验证后生成

## Risks / Trade-offs

- [177 处前缀/命名替换有遗漏] → 全量 grep `/opsx`、`openspec-`、`openspec ` 校验 + 冒烟测试覆盖 init/new/refine/archive
- [隐藏命令失去文档入口] → `.hidden()` 保留 help 内可见性标注；技能指令文档注明
- [中文目录名跨平台差异] → 仅允许非保留字符；Windows/macOS/Linux 均 UTF-8；测试覆盖路径拼接
- [目录结构变化破坏 validator/archive] → validator 增加 refine.md/bugs/子能力目录感知；旧结构变更兼容读取
- [refine gate 阻断既有变更] → 仅新变更强制；已存在变更豁免（无 refine.md 时降级为警告放行）
- [大规模适配器改动回归风险] → 每个 adapter 仅改常量，跑 init 全工具冒烟验证文件生成

## Migration Plan

1. 改名基底：bin/package.json/program.name → 冒烟 `opsc --version`
2. 前缀替换：command-references + adapters + 文案（grep 清零）→ init 冒烟
3. 命令面：hidden + 新增 refine/bug/continue/apply/explore 薄封装
4. 命名与目录：validateChangeName + `opsc new` 交互 + bugs/ 结构
5. refine 阶段：`opsc refine` + gate + 冻结
6. 规模判定：metadata size + continue 分支
7. 技能模板：新模板 + 注册表裁剪 → init 全工具验证
8. 用户手册 + 文档更新
- 回滚：整体 git revert；无数据迁移风险（变更目录为新增物）

## Open Questions

- `continue/apply/explore` 在 CLI 层薄封装是否必要，还是仅保留 skill 面（用户仅点名 `opsc init/new/refine/bug` 为 CLI 命令）
- 中文描述目录名是否需要 `git config core.quotepath` 相关文档说明
- 大需求根 proposal 与子能力 proposal 的同步校验（根清单 vs 实际 c1/c2 数量）是否纳入 validate
