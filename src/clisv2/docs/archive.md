# archive 命令

## 作用

归档已完成的变更：校验 → 更新主规范 → 移动到 `changes/archive/`。

## 做了什么

1. 复用 `ArchiveCommand`（`src/core/archive.ts`）
2. 校验 proposal 与 delta specs（可用 `--no-validate` 跳过）
3. 检查 tasks 完成度（未完成需确认）
4. 合并变更 specs 到主 specs 目录（可用 `--skip-specs` 跳过）
5. 移动到 `openspec++/changes/archive/<日期>-<name>/`

## 用法

```bash
opsc archive                 # 交互选择变更
opsc archive f17085-登录重构
opsc archive <name> -y       # 跳过确认
opsc archive <name> --skip-specs
```

## 相关文件

- 命令实现：`src/clisv2/archive.ts`
- 核心逻辑：`src/core/archive.ts`（复用）
