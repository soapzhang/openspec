# apply 命令

## 作用

显示实施任务的指令。按能力（cN）逐个子能力推进。

## 做了什么

1. 定位变更，读 yaml `status`
2. 门槛：`status` 必须是 `task`（或 `cN-apply`），否则报错
3. 复用 `applyInstructionsCommand` 输出实施指令（上下文文件、任务清单、进度）

## 用法

```bash
opsc apply
opsc apply --change f17085-登录重构
opsc apply --json
```

## 相关文件

- 命令实现：`src/clisv2/apply.ts`
- 指令生成：`src/commands/workflow/instructions.ts`（复用）
