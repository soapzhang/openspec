# Change Tracking

## ADDED Requirements

### Requirement: 变更跟踪 ID

每个变更 SHALL 携带跟踪 ID，变更目录名 MUST 使用 `f<跟踪ID>-<描述>` 格式。跟踪 ID 可为数字或字符串（如 `f17085-登录重构`）。描述 MUST 非空。

#### Scenario: 用户提供跟踪 ID

- **WHEN** 用户执行 `opsc new` 并提供跟踪 ID 与描述，如 "17085 登录重构"
- **THEN** 创建变更目录 `changes/f17085-登录重构/`

#### Scenario: 用户未提供跟踪 ID

- **WHEN** 用户执行 `opsc new` 但未提供跟踪 ID
- **THEN** 系统提示引导用户提供跟踪 ID，且不创建变更目录

#### Scenario: 用户无法提供跟踪 ID 时使用日期兜底

- **WHEN** 用户明确表示无法提供跟踪 ID
- **THEN** 系统使用当前日期 `YYYYMMDD` 作为跟踪 ID 创建变更目录（如 `changes/f20260803-<描述>/`）

#### Scenario: 描述缺失

- **WHEN** 用户执行 `opsc new` 未提供描述
- **THEN** 系统提示引导用户提供描述，且不创建变更目录

### Requirement: 变更目录结构

变更根目录 SHALL 只包含 `proposal.md`、`refine.md`、`bugs/` 目录与子能力目录。spec/design/tasks 文件 MUST 归属能力层而非变更根目录。

#### Scenario: 大需求变更目录

- **WHEN** 大需求变更的目录结构创建完成
- **THEN** 变更根目录包含 `proposal.md`、`refine.md`、`bugs/` 与 `c1/`、`c2/` 等子能力目录

#### Scenario: 跨平台路径

- **WHEN** 在 Windows 或 POSIX 系统上创建变更目录
- **THEN** 系统使用 `path.join()`/`path.resolve()` 拼接路径，不使用硬编码分隔符
