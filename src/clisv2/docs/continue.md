# continue 命令

## 作用

按当前阶段（yaml `status`）输出下一个产物的创建指令，输出成功后自动推进 status。

## 做了什么

1. 定位变更，读 `.openspec.yaml` 的 `status`
2. 按阶段映射下一个产物：

| status | 输出 |
|--------|------|
| new | 提示先 `opsc refine` |
| refine | **先判定规模**，再输出 proposal 指令 |
| proposal | specs 创建指令 |
| specs | design 创建指令 |
| design | tasks 创建指令 |
| tasks | 提示 `opsc apply` |
| cN-apply | 提示 `opsc release` |

3. 复用 `instructionsCommand` 输出产物指令（XML：task/dependencies/output/instruction/template）

### 规模判定（status=refine 时）

- 交互：问「复杂需求？」默认是（large）；否则 small
- 非交互：从 `refine.md` 功能细节条目数自动判定（≥3 条 → large）
- large → 拆子能力 `c1-*/c2-*/`；small → 四件套放变更根目录

## 用法

```bash
opsc continue
opsc continue --change f17085-登录重构
```

## 状态推进约定

`continue` 输出产物指令成功后，自动把 status 推进到该产物对应阶段（refine→proposal→specs→design→tasks），无需手动 `--set`。

例外：实施完成后的 `cN-apply` 仍需手动推进（apply 是长周期实施，指令输出≠实施完成）：

```bash
opsc status --change <name> --set cN-apply
```

旧版单数阶段名（`spec`/`task`）在读取时自动归一为 `specs`/`tasks`，无需迁移。

## 相关文件

- 命令实现：`src/clisv2/continue.ts`
- 指令生成：`src/commands/workflow/instructions.ts`（复用）
