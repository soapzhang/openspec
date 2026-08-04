# OpenSpec Plus（opsc）用户手册

OpenSpec 是一个 AI 原生规范驱动开发系统。`opsc` 是其 CLI 入口，通过"先完善、再规划、后实施"的流程管理软件变更。

## 安装

```bash
# 在项目根目录（含 package.json）
pnpm add -g .        # 或 npm install -g .
opsc --version       # 验证
```

## 初始化（init）

在当前项目初始化 OpenSpec，自动生成技能与斜杠命令：

```bash
opsc init                     # 交互式选择 AI 工具
opsc init --tools claude      # 指定工具（claude/cursor/opencode…）
opsc init --tools all         # 全部工具
```

生成的技能与命令（含 Claude Code 方式）：

```
.claude/skills/opsc-new/…
.claude/commands/opsc/*.md
```

重启 IDE 后生效。可用斜杠命令：`/opsc:new`、`/opsc:refine`、`/opsc:continue`、`/opsc:apply`、`/opsc:archive`、`/opsc:explore`、`/opsc:bug`。

## 变更全流程

```
opsc new → opsc refine → opsc continue → opsc apply → opsc archive
（建变更） （完善）      （写工件）      （实施）     （归档）
```

### 1. 新建变更（new）

```bash
opsc new                          # 交互式：引导提供跟踪 ID 与描述
opsc new f17085-登录重构           # 直接指定
opsc new f17085-登录重构 --schema spec-driven
```

- 跟踪 ID：数字或字符串，体现在目录名 `f<ID>-<描述>`（如 `f17085-登录重构`）
- 未提供 ID 时引导补充；明确无法提供时以当前日期兜底（`f20260803-<描述>`）
- 描述必填

### 2. 完善环节（refine，强制）

spec 之前必须完成：

```bash
opsc refine --change f17085-登录重构
```

产出 `refine.md`（需求信息/功能细节/开放问题/代码取证记录）。要点：

- **所有判断基于代码决策**，可查证问题先探索代码
- 全程调用 `opsc-grill` 技能逐题追问（每次一问、附带选项）
- `refine.md` 在进入 proposal/spec 后**冻结**，需求变更走 proposal/spec，不反向修改

### 3. 创建工件（continue）

```bash
opsc continue --change f17085-登录重构
```

按序生成 proposal → specs → design → tasks。在 proposal 前会进行**规模判定**（用户强制确认）：

- **大型需求**：拆分子能力目录 `c1/`、`c2/`…，各含独立四件套（proposal/spec/design/tasks），根目录仅保留主 proposal 与 refine.md
- **简单需求**：四件套直接放变更根目录

### 4. 实施（apply）

```bash
opsc apply --change f17085-登录重构
```

按 tasks.md 逐项实施，完成一项勾选一项。

### 5. 归档（archive）

```bash
opsc archive f17085-登录重构      # 更新主规范并归档
opsc archive f17085-登录重构 --skip-specs   # 跳过规范更新
```

存在未关闭的 bug 不影响归档。

## Bug 管理

```bash
opsc bug --change f17085-登录重构                 # 交互式填写
opsc bug --change f17085-登录重构 --description "系统内部错误" \
  --status "待处理" --reason "空指针" --fix "加判空"
```

- 文档位于 `changes/<变更>/bugs/b0001-<描述>.md`，编号自动递增
- 结构：状态 / 描述 / 原因 / 修改方案
- 状态流转：待处理 → 修复中 → 已修复 → 已验证 → 已关闭

## 探索（explore，非强制）

随时可用，用于思考与澄清：

```bash
opsc explore
```

## 命令参考

| 命令 | 说明 |
|---|---|
| `opsc init` | 初始化项目，生成技能与命令 |
| `opsc new [name]` | 新建变更（跟踪 ID 格式） |
| `opsc refine` | 完善环节（spec 前强制） |
| `opsc continue` | 状态 + 下一工件指令 |
| `opsc apply` | 实施任务指令 |
| `opsc archive` | 归档变更 |
| `opsc explore` | 探索模式（非强制） |
| `opsc bug` | 创建 bug 文档 |

其余命令（status/instructions/list/validate 等）已隐藏，可通过完整命令名继续使用。

## Claude Code 使用

1. `opsc init --tools claude` → 技能写入 `.claude/skills/`，命令写入 `.claude/commands/opsc/`
2. 在 Claude Code 中直接使用 `/opsc:new`、`/opsc:refine` 等斜杠命令
3. 变更目录、`refine.md`、`bugs/` 均可在 IDE 中直接查看与编辑
