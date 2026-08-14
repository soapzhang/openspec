---
name: opsc-refine
description: 强制完善环节（spec 之前）：收集信息、完善功能与细节，产�?refine.md。所有判断基于代码决策，全程调用 opsc-grill 追问�?license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "6.0.0"
---

# opsc-refine 完善环节

**强制流程**：每个变更在编写 spec 之前，必须先完成完善环节，产�?`refine.md`�?
## 规约

1. **所有判断基于代码决�?*：凡可通过阅读/搜索代码查证的问题，必须先从代码取证，禁止凭空假设�?2. **完善范围**：收集需求信息、完善功能点与细节、明确边界条件与验收标准�?3. **grill 辅助**：全程调�?`opsc-grill` 技能逐题追问，直至需求细节收敛�?4. **产出**：将收集的信息、功能细节、开放问题、代码取证记录结构化写入 `refine.md`�?5. **冻结语义**：`refine.md` 在进�?proposal/spec 阶段后冻结，后续需求变更直接进�?proposal/spec，不反向修改 refine.md�?
## 流程

1. 执行 `opsc refine`（CLI）创�?`refine.md` 模板�?2. 阅读变更目录与相关代码，收集需求信息�?3. 调用 `opsc-grill` 逐题追问用户（每次一问、附带选项、先代码取证）�?4. 将追问结论、开放问题、代码证据写�?`refine.md`�?5. 完成后告知用户运�?`opsc continue` 继续�?