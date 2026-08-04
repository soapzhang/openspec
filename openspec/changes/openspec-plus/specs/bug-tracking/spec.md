# Bug Tracking

## ADDED Requirements

### Requirement: bug 纳入变更管控

每个变更 SHALL 在其根目录下维护 `bugs/` 目录。所有 bug 记录 MUST 存放于该目录。

#### Scenario: 创建 bugs 目录

- **WHEN** 变更目录创建完成
- **THEN** 变更根目录下存在 `bugs/` 目录

#### Scenario: bug 归属

- **WHEN** 用户报告该变更相关的 bug
- **THEN** bug 文档记录在该变更的 `bugs/` 目录下，而非变更外

### Requirement: bug 文档命名与编号

bug 文档文件名 SHALL 使用 `b<编号>-<描述>` 格式，编号 MUST 从 `0001` 开始自动递增（`b0001-<描述>.md`、`b0002-<描述>.md`…）。描述 MUST 非空。

#### Scenario: 首个 bug

- **WHEN** 用户为变更报告第一个 bug
- **THEN** 创建 `bugs/b0001-<描述>.md`

#### Scenario: 编号递增

- **WHEN** 已存在 `b0001`，用户报告新 bug
- **THEN** 创建 `bugs/b0002-<描述>.md`，编号自动顺延且不重复

#### Scenario: 用户仅提交提示信息

- **WHEN** 用户执行 `opsc bug` 并提交提示信息（如"系统内部错误"）
- **THEN** 系统生成 `bugs/b0001-系统内部错误.md` 文档

### Requirement: bug 文档内容

每个 bug 文档 SHALL 包含四部分：状态、描述、原因、修改方案。

#### Scenario: 文档结构完整

- **WHEN** bug 文档生成
- **THEN** 文档包含"状态"、"描述"、"原因"、"修改方案"四个字段

### Requirement: bug 不影响归档

bug 的创建、记录与修改 SHALL 不影响变更的归档流程。归档 SHALL 在存在未处理 bug 时仍可执行。

#### Scenario: 存在未关闭 bug 时归档

- **WHEN** 变更归档时 `bugs/` 目录下存在未关闭的 bug
- **THEN** 归档流程正常执行，不因 bug 未关闭而阻断
