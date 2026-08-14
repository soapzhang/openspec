---
name: opsc-release
description: 上线文档定稿（apply 后）：读�?release.md 与全�?design 文档，逐项完善上线事项，置为定稿�?license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "6.0.0"
---

# opsc-release 上线文档完善

**触发条件**：变�?apply 完成后运行（tasks.md 全部勾选）�?
## 规约

1. **材料读取**：读取变更根目录 `release.md` 与全�?design 文档（含子能力层 design.md）�?2. **逐项确认**：逐节核对上线事项 —�?DDL / DML / 配置修改 / 初始化动�?/ 发布服务（前后端）�?3. **状态标�?*：每条目标记 `待执行` / `已执行` / `跳过` 三态；无事项的节显式标�?`无`�?4. **定稿语义**：完善后经用户确认将文档状态置�?`定稿`；定稿后再次完善需先解锁（改回草稿）�?5. **原地写回**：仅更新 `release.md`，不产生新文档�?
## 流程

1. 执行 `opsc release --change <name>`（CLI）校�?gate 并创建完善会话�?2. 读取 release.md 现有内容�?design 文档，逐节核对上线事项�?3. 按用户确认标记条目状态、补充缺失事项�?4. 定稿前校验各分节非空（允�?`无` 标记），确认后置为定稿�?