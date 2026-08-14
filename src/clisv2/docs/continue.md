# continue 命令

## 作用

按当前阶段（yaml `status`）输出下一个产物的创建指令。只读不改 status。

## 做了什么

1. 定位变更，读 `.openspec.yaml` 的 `status`
2. 按阶段映射下一个产物：

| status | 输出 |
|--------|------|
| new | 提示先 `opsc refine` |
| refine | proposal 创建指令 |
| proposal | specs 创建指令 |
| spec | design 创建指令 |
| design | tasks 创建指令 |
| task | 提示 `opsc apply` |
| cN-apply | 提示 `opsc release` |

3. 复用 `instructionsCommand` 输出产物指令（XML：task/dependencies/output/instruction/template）

## 用法

```bash
opsc continue
opsc continue --change f17085-登录重构
```

## 状态推进约定

`continue` 不改 status。产物写完后手动/agent 推进：

```bash
opsc status --change <name> --set proposal
```

## 相关文件

- 命令实现：`src/clisv2/continue.ts`
- 指令生成：`src/commands/workflow/instructions.ts`（复用）
