# Skill Distribution

## ADDED Requirements

### Requirement: 技能可见集合

init 生成 SHALL 只包含以下技能：`opsc-new`、`opsc-refine`、`opsc-continue`、`opsc-apply`、`opsc-archive`、`opsc-explore`、`opsc-bug`、`opsc-grill`。其余技能模板 MUST 不生成，但实现 SHALL 保留。

#### Scenario: init 生成技能清单

- **WHEN** `opsc init` 为某工具生成技能
- **THEN** 生成的技能仅包含可见集合中的技能

#### Scenario: 隐藏技能不生成

- **WHEN** `opsc init` 执行完成
- **THEN** 不可见技能（如旧版 openspec-ff-change 等）不在任何工具目录中生成文件

### Requirement: 技能改名

技能 SHALL 由 `openspec-<name>-change` 系列改名为 `opsc-<name>` 系列。技能目录名与模板内 name/description MUST 同步变更。

#### Scenario: 技能目录名

- **WHEN** 技能文件生成
- **THEN** 目录名与 frontmatter name 使用新命名（如 `opsc-new`，而非 `openspec-new-change`）

### Requirement: init 自动安装

`opsc init` SHALL 自动生成并安装技能与命令到所选工具目录（`.claude/skills/`、`.cursor/skills/` 等，含 Claude Code 方式）。

#### Scenario: init 安装到工具目录

- **WHEN** 用户执行 `opsc init` 并选择工具
- **THEN** 技能与命令文件写入该工具对应的 skills/commands 目录

#### Scenario: Claude Code 支持

- **WHEN** 用户执行 `opsc init` 选择 Claude Code
- **THEN** 技能写入 `.claude/skills/`，命令写入 `.claude/commands/`，立即可用

### Requirement: opsc-refine 技能

`opsc-refine` 技能 SHALL 描述强制完善环节：收集信息、完善功能与细节、产出 `refine.md`，内置"所有判断基于代码决策"规约，并声明调用 `opsc-grill`。

#### Scenario: 技能内容完整

- **WHEN** `opsc-refine` 技能模板被读取
- **THEN** 模板包含完善流程、代码取证规约与 grill 调用说明

### Requirement: opsc-bug 技能

`opsc-bug` 技能 SHALL 描述 bug 文档创建流程：`bugs/b<编号>-<描述>.md`、编号递增、四字段结构（状态/描述/原因/修改方案）。

#### Scenario: 技能内容完整

- **WHEN** `opsc-bug` 技能模板被读取
- **THEN** 模板包含编号规则与文档四字段结构说明

### Requirement: 快速开始文案

init 成功提示的快速开始文案 SHALL 使用 `/opsc:new`、`/opsc:continue`、`/opsc:apply`，不得残留 `/opsx:` 前缀。

#### Scenario: 文案无残留

- **WHEN** `opsc init` 成功提示显示
- **THEN** 快速开始命令使用 `/opsc:` 前缀
