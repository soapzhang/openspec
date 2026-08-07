# OpenSpec Plus（opsc）

AI 原生规范驱动开发系统。通过「先完善、再规划、后实施、可上线」的流程管理软件变更。

`opsc` 为 CLI 入口（原 `openspec`）。

## 环境要求

| 依赖 | 要求 |
|---|---|
| Node.js | **≥ 20.19.0**（ESM 模块，见 package.json `engines`） |
| 包管理器 | pnpm |
| 平台 | macOS / Linux / Windows（路径处理跨平台） |

## 安装（从仓库到可用）

```bash
git clone https://github.com/soapzhang/openspec.git   # ① 拉取仓库
cd openspec                                            # ② 进入项目
pnpm install                                           # ③ 安装项目依赖
pnpm build                                             # ④ 编译 TypeScript → dist/
npm install -g .                                       # ⑤ 全局安装（生成 opsc 命令）
opsc --version                                         # ⑥ 验证（应输出 3.1.0）
opsc --help                                            # ⑦ 查看 9 个可见命令
```

**说明**：
- ① 拉取源码仓库后，本仓库根目录的 `openspec/` 为规范驱动开发（SDD）数据目录，非源码。
- ⑤ 也可用 `pnpm link` 替代 —— 软链本地包到全局，改代码即时生效，适合开发调试。
- 若旧版本残留导致 `openspec` 命令报错：`npm rm -g openspec opsc` 后重新执行 ⑤。

## 快速开始

```bash
opsc init               # 初始化项目（生成技能与斜杠命令）
opsc new f17085-登录重构  # 新建变更（跟踪 ID 格式）
opsc refine             # 完善环节（spec 前强制，产出 refine.md）
opsc continue           # 创建工件（proposal/spec/design/tasks）
opsc apply              # 实施任务
opsc release            # 完善上线文档 release.md 并定稿（apply 后）
opsc archive            # 归档变更
opsc bug                # 创建 bug 文档
opsc explore            # 探索模式（非强制）
```

## 目录结构

每个变更是一个目录 `changes/f<ID>-<描述>/`（`opsc new` 产生），按规模判定（refine 后 agent 判定 + 用户确认）分为两种结构：

### 简单需求（四件套在变更根目录）

```
changes/f17085-登录重构/
├── .openspec.yaml        # 元数据（schema、规模 size）
├── refine.md             # 完善环节产物（spec 前强制，完成后冻结）
├── release.md            # 上线文档（new 生成草稿，release 定稿）
├── bugs/                 # bug 文档（b0001-<描述>.md，根因必填）
├── proposal.md           # 提案（Why/What/Capabilities/Impact）
├── specs/                # delta 规范（ADDED/MODIFIED/REMOVED）
│   └── <能力>/spec.md
├── design.md             # 设计文档（代码现状分析 + 文件变更清单）
└── tasks.md              # 任务清单（apply 逐项勾选跟踪）
```

### 大型（复杂）需求（spec/design/tasks 下沉到子能力）

```
changes/f17085-平台重构/
├── .openspec.yaml        # 元数据（schema、规模 size=large）
├── refine.md             # 完善环节产物（冻结）
├── release.md            # 上线文档（各子能力上线事项合并于此）
├── bugs/                 # bug 文档
├── proposal.md           # 主 proposal（总览：动机 + 能力清单 + 推进结论）
├── c1-用户权限设计/       # 子能力 1：3 个文件
│   ├── spec.md
│   ├── design.md
│   └── tasks.md
└── c2-消息推送/          # 子能力 2：同上
    ├── spec.md
    ├── design.md
    └── tasks.md
```

### 归档

变更整体移入 `changes/archive/YYYY-MM-DD-<变更名>/`，`release.md` 原样保留为上线记录。

## 命令参考

### 可见命令（9 个）

| 命令 | 一句话 | 特点 |
|---|---|---|
| `opsc init` | 初始化项目 | 生成技能与斜杠命令；交互选工具 |
| `opsc new [name]` | 新建变更 | 跟踪 ID；引导/日期兜底；自动生成 release.md、bugs/ |
| `opsc refine` | 强制完善环节 | spec 前 gate；代码取证；grill 追问；冻结 |
| `opsc continue` | 推进工件 | status + 下一工件指令；规模判定 |
| `opsc apply` | 实施任务 | tasks.md 勾选跟踪 |
| `opsc release` | 上线文档定稿 | apply 后 gate；逐节核对；原地写回 |
| `opsc archive` | 归档变更 | 同步主规范；校验 |
| `opsc explore` | 探索模式 | 思考澄清，非强制 |
| `opsc bug` | 创建 bug 文档 | 根因必填；确认后才可改代码 |

### 各命令详解

#### `opsc init` — 初始化项目

生成技能与斜杠命令到所选 AI 工具。

```bash
opsc init                     # 交互式选择 AI 工具
opsc init --tools claude      # 指定工具（claude/cursor/opencode…）
opsc init --tools all         # 全部工具
```

生成物：`opsc-new`、`opsc-refine`、`opsc-release`、`opsc-continue`、`opsc-apply`、`opsc-archive`、`opsc-explore`、`opsc-bug`、`opsc-grill` 共 9 个技能 + 命令模板（`.claude/skills/`、`.claude/commands/`）。重启 IDE 生效。可用斜杠命令：`/opsc:new`、`/opsc:refine`、`/opsc:release`、`/opsc:continue`、`/opsc:apply`、`/opsc:archive`、`/opsc:explore`、`/opsc:bug`。

#### `opsc new [name]` — 新建变更

```bash
opsc new                          # 交互式：引导提供跟踪 ID 与描述
opsc new f17085-登录重构           # 直接指定
opsc new f17085-登录重构 --schema spec-driven   # 指定工作流 schema
```

- 目录名 `f<ID>-<描述>`（ID 为数字或字符串，如 `f17085-登录重构`）
- 缺 ID 时引导补充；明确无法提供时以当前日期兜底（`f20260803-<描述>`）
- 描述必填
- 自动生成：`.openspec.yaml`（schema 元数据）、`bugs/`（bug 目录）、`release.md`（上线文档草稿）

#### `opsc refine` — 完善环节（强制）

spec 之前必须完成，产出 `refine.md`（需求信息/功能细节/开放问题/代码取证记录）。

```bash
opsc refine --change f17085-登录重构
```

- **所有判断基于代码决策**：可查证问题先探索代码，禁止凭空假设
- 全程调用 `opsc-grill` 技能逐题追问（每次一问、附带 2-4 选项）
- **冻结语义**：进入 proposal/spec 后 `refine.md` 冻结，需求变更走 proposal/spec，不反向修改
- **gate**：refine 未完成时 `opsc continue`/`instructions` 阻止进入 spec

#### `opsc continue` — 创建工件

```bash
opsc continue --change f17085-登录重构
```

按序生成 proposal → specs → design → tasks。proposal 前进行**规模判定**（agent 判定 + 用户强制确认）：

- **大型需求**：拆分子能力目录 `c1/`、`c2/`…，各含独立四件套（proposal/spec/design/tasks），根目录仅保留主 proposal 与 refine.md
- **简单需求**：四件套直接放变更根目录

#### `opsc apply` — 实施任务

```bash
opsc apply --change f17085-登录重构
```

按 tasks.md 逐项实施，完成一项勾选一项（`- [x]`）。实施时提示：上线发布事项（DDL/DML、配置修改、初始化动作、发布服务）同步至 `release.md`。

#### `opsc release` — 上线文档定稿（apply 后）

```bash
opsc release --change f17085-登录重构
```

- **gate**：tasks.md 全部勾选（apply 完成）才放行，否则拒绝
- 输入：`release.md` 现有内容 + 全部 design 文档（含子能力层）
- 交互逐节核对：DDL / DML / 配置修改 / 初始化动作 / 发布服务（前后端），标记条目状态（待执行/已执行/跳过）
- **原地写回** `release.md`，不产生新文档；确认后置「定稿」，定稿后再次运行需先解锁
- 强制触发 `opsc-release` 技能引导完善

#### `opsc archive` — 归档变更

```bash
opsc archive f17085-登录重构                     # 更新主规范并归档
opsc archive f17085-登录重构 --skip-specs        # 跳过规范更新
```

- 增量规范同步至主 `openspec/specs/<能力>/spec.md`，变更移入 `changes/archive/YYYY-MM-DD-<name>/`
- 归档前校验 proposal 与 delta specs；有未完成任务时交互确认
- 存在未关闭的 bug 不影响归档
- `release.md` 随变更原样归档，作为上线记录

#### `opsc explore` — 探索模式（非强制）

随时可用，用于思考与澄清需求。可阅读代码、搜索调查，但不实施功能。

#### `opsc bug` — 创建 bug 文档

```bash
opsc bug --change f17085-登录重构                 # 交互式填写
opsc bug --change f17085-登录重构 --description "系统内部错误" \
  --status "待处理" --reason "空指针" --fix "加判空"
```

- 文档位于 `changes/<变更>/bugs/b0001-<描述>.md`，编号自动递增
- 结构：状态 / 描述 / 原因 / 修改方案；**原因必填（根因分析）**
- **约束：根因先行，禁止直接修改** —— 先分析根因、经用户确认后才允许修改代码
- 状态流转：待处理 → 修复中 → 已修复 → 已验证 → 已关闭
- bug 不影响归档

### 隐藏命令（保留可执行）

以下命令在 `opsc --help` 中隐藏，但可通过完整命令名继续使用：`status`、`instructions`、`list`、`view`、`change`、`spec`、`config`、`schema`、`validate`、`show`、`feedback`、`completion`、`templates`、`schemas`、`update`。

## 变更管理约定

- **变更目录**：`f<ID>-<描述>`（ID 数字/字符串，缺失以日期兜底），描述必填
- **强制完善**：spec 前必须完成 `refine.md`，所有判断基于代码决策，完成后冻结
- **规模判定**：refine 后 agent 判定 + 用户确认；大型需求拆 `c1/`、`c2/` 子能力
- **Bug 管控**：`bugs/b0001-<描述>.md`，根因必填、确认后改代码，不影响归档
- **上线文档**：`release.md`（new 生成，design 阶段同步上线事项，apply 后 `opsc release` 定稿）

## Claude Code 使用

1. `opsc init --tools claude` → 技能写入 `.claude/skills/`，命令写入 `.claude/commands/opsc/`
2. 在 Claude Code 中直接使用 `/opsc:new`、`/opsc:refine`、`/opsc:release` 等斜杠命令
3. 变更目录、`refine.md`、`release.md`、`bugs/` 均可在 IDE 中直接查看与编辑

## 开发本工具

面向想修改或贡献本工具源码的开发者；仅使用者可跳过本节。

```bash
pnpm install                 # 安装依赖
pnpm build                   # 编译 TypeScript → dist/
node bin/opsc.js --help      # 未全局安装时，用 node 直接运行
```

- 语言：TypeScript（严格模式）、ESM、Node.js ≥ 20.19.0
- CLI 框架：Commander.js；交互：@inquirer/prompts
- 分发：npm 包（`npm install -g .` 全局安装）
- 源码变更遵循本工具自身的 SDD 流程（`openspec/` 数据目录）
