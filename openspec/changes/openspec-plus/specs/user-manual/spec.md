# User Manual

## ADDED Requirements

### Requirement: 用户手册生成

功能验证通过后 SHALL 生成完整的用户使用手册。手册 MUST 覆盖：安装（init）、变更全流程（new/refine/continue/apply/archive）、bug 管理与命令参考。

#### Scenario: 验证后生成手册

- **WHEN** openspec-plus 功能验证通过
- **THEN** 生成完整用户使用手册

#### Scenario: 手册覆盖全流程

- **WHEN** 用户阅读手册
- **THEN** 手册包含从 init 安装到变更归档的完整操作说明，以及全部可见命令的参考

### Requirement: 手册随 git 分发

用户手册 SHALL 纳入仓库并随 git 分发，用户 SHALL 能通过下载仓库获得手册。

#### Scenario: 手册入库

- **WHEN** 手册生成完成
- **THEN** 手册文件提交至 git 仓库，随仓库分发

### Requirement: Claude Code 使用支持

手册及配套安装 SHALL 支持 Claude Code 使用方式。用户 SHALL 能通过 `opsc init` 将技能/命令安装到 Claude Code 环境（`.claude/skills/`），并依据手册在 Claude Code 中操作。

#### Scenario: init 安装到 Claude Code

- **WHEN** 用户执行 `opsc init` 并选择 Claude Code
- **THEN** 技能与命令安装到项目的 `.claude/skills/` 等对应目录，可在 Claude Code 中使用

#### Scenario: 手册说明 Claude Code 安装

- **WHEN** 用户查阅手册中 Claude Code 相关章节
- **THEN** 手册说明 init 安装方式及安装后的使用入口
