# status 命令

## 作用

显示变更当前所处的工作流阶段（只读 yaml `status` 字段）。

## 做了什么

1. 定位变更（`--change` 指定，缺省报错列可用变更）
2. 读 `.openspec.yaml` 的 `status` 字段
3. 无 `status` 时：交互提示用户选择阶段并写回 yaml；非交互显示 `unknown`
4. 打印阶段 + 下一步提示

## 阶段与下一步映射

| status | 下一步 |
|--------|--------|
| new | `opsc refine` |
| refine | `opsc continue`（生成 proposal） |
| proposal | `opsc continue`（生成 specs） |
| spec | `opsc continue`（生成 design） |
| design | `opsc continue`（生成 tasks） |
| task | `opsc apply` |
| cN-apply | `opsc release` |

## 用法

```bash
opsc status                           # 显示当前阶段
opsc status --change f17085-登录重构
opsc status --change <name> --set proposal   # 手动推进阶段
```

`--set` 取值：`new/refine/proposal/spec/design/task/cN-apply`，校验非法值报错。

阶段语义：
- `spec`/`design`/`task`：所有子能力（cN）统一完成，不带 cN 前缀
- `cN-apply`：实施按子能力 1by1 推进，带 cN 前缀
- 简单需求（无子能力拆分）同样适用这套阶段

## 相关文件

- 命令实现：`src/clisv2/status.ts`
- 状态字段定义：`.openspec.yaml` 的 `status`（`src/core/artifact-graph/types.ts`）
- 状态写入：`new`（`new`）、`refine`（`refine`），后续命令迁移时补充
