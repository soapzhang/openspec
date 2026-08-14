# init 命令

## 作用

在当前项目初始化 OpenSpec，为 Claude Code 安装 9 个 Agent Skill。

## 做了什么

1. 创建目录结构 `openspec++/specs`、`openspec++/changes`、`openspec++/changes/archive`
2. 复制 `src/template/claude-code/*` → `.claude/skills/*/SKILL.md`（9 个 skill）
3. 写 `openspec++/config.yaml`（已存在则跳过，默认 schema `spec-driven`）
4. 打印快速开始提示

## 用法

```bash
opsc init [path]
```

- `path` 缺省为当前目录 `.`
- 目录不存在会自动创建
- 幂等：重复运行不覆盖已有 config.yaml

## 相关文件

- 命令实现：`src/clisv2/init.ts`
- 模板来源：`src/template/claude-code/*/SKILL.md`
- 版本号维护：改 `package.json` 后运行 `node scripts/gen-claude-code-skills.mjs`

## 模板目录约定

所有模板统一放 `src/template/`，build 时复制到 `dist/template/`：

```
src/template/
├── claude-code/          # 9 个 Agent Skill（SKILL.md）
├── refine.md             # refine 产物模板（{changeName} 占位）
└── change-meta.yaml      # 变更元数据模板（.openspec.yaml）
```
