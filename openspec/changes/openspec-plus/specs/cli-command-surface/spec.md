# CLI Command Surface

## ADDED Requirements

### Requirement: CLI 命名

CLI 二进制 SHALL 命名为 `opsc`（原 `openspec`）。此为破坏性变更，`openspec` 命令不再可用。

#### Scenario: 命令入口

- **WHEN** 用户执行 `opsc --version`
- **THEN** 输出版本号，且 `openspec --version` 不再可用

### Requirement: 可见命令集合

`opsc` SHALL 暴露以下命令：`init`、`new`、`refine`、`continue`、`apply`、`archive`、`explore`、`bug`。其他既有命令 MUST 在帮助中隐藏，但实现 SHALL 保留（不删除代码）。

#### Scenario: 帮助输出可见命令

- **WHEN** 用户执行 `opsc --help`
- **THEN** 帮助仅列出可见命令集合，不显示隐藏命令

#### Scenario: 隐藏命令保留可执行

- **WHEN** 用户直接输入隐藏命令的完整用法
- **THEN** 命令仍可执行（实现未删除）

### Requirement: new 命令跟踪 ID 交互

`opsc new` SHALL 引导用户提供跟踪 ID 与描述。ID 缺失时 MUST 引导用户补充；用户明确无法提供时 MUST 以当前日期 `YYYYMMDD` 兜底。描述 MUST 必填。

#### Scenario: 正常创建变更

- **WHEN** 用户执行 `opsc new 17085 登录重构`
- **THEN** 创建 `changes/f17085-登录重构/` 并提示下一步执行 `opsc refine`

#### Scenario: 缺 ID 引导补充

- **WHEN** 用户执行 `opsc new` 未提供 ID
- **THEN** 引导用户提供 ID，未提供前不创建目录

#### Scenario: 缺描述引导补充

- **WHEN** 用户执行 `opsc new 17085` 未提供描述
- **THEN** 引导用户提供描述，未提供前不创建目录

### Requirement: refine 命令

`opsc refine` SHALL 启动完善环节，编排收集信息、调用 grill 追问并产出 `refine.md`。

#### Scenario: 执行 refine

- **WHEN** 用户执行 `opsc refine`
- **THEN** 完善环节启动，产出 `refine.md`

### Requirement: continue 感知完善环节

`opsc continue` SHALL 在 `refine.md` 缺失或未完成时阻止推进 spec 编写。

#### Scenario: refine 未完成被阻止

- **WHEN** 用户对无 `refine.md` 的变更执行 `opsc continue`
- **THEN** 提示先执行 `opsc refine`，不生成 spec

### Requirement: bug 命令

`opsc bug` SHALL 在当前变更的 `bugs/` 目录创建 bug 文档，编号从 `b0001` 自动递增。

#### Scenario: 创建 bug 文档

- **WHEN** 用户执行 `opsc bug` 并提交提示信息
- **THEN** 在 `bugs/` 目录生成 `b0001-<描述>.md`，文档含状态/描述/原因/修改方案四字段

### Requirement: 斜杠命令前缀

斜杠命令前缀 SHALL 由 `/opsx:` 改为 `/opsc:`。所有生成的命令文件 MUST 使用 `/opsc:` 前缀。

#### Scenario: 新前缀生效

- **WHEN** 工具命令生成完成
- **THEN** 命令入口使用 `/opsc:new`、`/opsc:refine` 等新前缀，`/opsx:` 前缀不再生成

### Requirement: 跨平台路径

涉及变更目录、bugs 目录等文件路径的命令 SHALL 使用 `path.join()`/`path.resolve()`，不得硬编码分隔符。

#### Scenario: Windows 路径

- **WHEN** 在 Windows 上执行 `opsc new`
- **THEN** 目录以反斜杠正确创建，功能正常

#### Scenario: POSIX 路径

- **WHEN** 在 macOS/Linux 上执行 `opsc new`
- **THEN** 目录以正斜杠正确创建，功能正常
