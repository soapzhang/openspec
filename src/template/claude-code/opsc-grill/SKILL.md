---
name: opsc-grill
description: 拷问式追问技能：像面试官一样反复追问计划或设计，直至达成共同理解，逐条解决决策树分支。refine 环节强制使用，其他时机可选。基于开�?grill-me（MIT）�?license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "6.0.0"
---

# opsc-grill 技�?
基于开�?[grill-me](https://github.com/mattpocock/skills)（MIT）适配。像面试官一样反复追问用户的计划或设计，直至达成共同理解，逐条解决决策树分支�?
## 提问方式

- **必须使用提问工具**（AskUserQuestion / 选项式弹窗），不要用纯文本提�?- **每次只问一�?*，等回答后再问下一个，保持聚焦
- 每个问题提供 **2-4 个具体选项**（避�?�?�?空泛选项，除非问题真是二元的�?- 用户始终可自定义输入（Other�?
## 代码优先规约

- 凡能从代码库/文件查证的问题，**先自己探�?*，不要问用户
- 所有判断基于代码决策，禁止凭空假设

## 流程

1. 收到回答后，简短确认（1-2 句），立即问下一�?2. 沿设计树逐分支收敛，解决决策间依�?3. 收敛后给出所有决策的结构化总结

## OpenSpec 上下�?
- �?refine 环节运行时，追问须围绕可写入 spec 的维度：功能边界、验收条件、数据流、错误处�?- 结论以结构化形式输出（已确认决策 / 开放问�?/ 代码取证记录），�?`refine.md` 承接

## 使用时机

- **强制**：`opsc refine` 完善环节
- **可�?*：任何需要被拷问的时刻（�?explore、方案评审）

> 出处：mattpocock/skills �?RobMitt/grill-me-skill，MIT License�?