# Refine Phase

## ADDED Requirements

### Requirement: 强制完善环节

在编写 spec 之前，每个变更 MUST 执行完善（refine）环节。完善环节 SHALL 收集信息、完善功能、完善细节，并产出 `refine.md`。

#### Scenario: refine 未完成时禁止进入 spec

- **WHEN** 变更的 `refine.md` 不存在或未完成
- **THEN** `opsc continue`/`opsc apply` 提示先完成完善环节，且不生成 spec 文件

#### Scenario: refine 正常完成

- **WHEN** 完善环节完成
- **THEN** 变更根目录存在 `refine.md`，且 spec 编写可以开始

### Requirement: 代码取证决策

完善环节中 agent 的所有判断 SHALL 基于代码进行决策。凡可通过探索代码库回答的问题，MUST 先探索代码而非凭空假设。

#### Scenario: 判断可基于代码回答

- **WHEN** 完善过程中出现"某功能是否已存在"等可查证问题
- **THEN** agent 先搜索/阅读代码获取证据，再基于证据做判断或提问

#### Scenario: 判断无代码依据

- **WHEN** agent 无法从代码获取依据
- **THEN** agent 向用户提问求证，并将该问题记录在 `refine.md` 的开放问题中

### Requirement: refine 冻结语义

`refine.md` SHALL 在变更进入 proposal/spec 阶段后冻结。后续需求变更 MUST 直接进入 proposal 与 spec 阶段，不反向修改 `refine.md`，即使内容存在冲突。

#### Scenario: spec 阶段发现需求变化

- **WHEN** 变更已进入 spec 阶段且需求发生变化
- **THEN** 修改 proposal 与 spec，保持 `refine.md` 不变

### Requirement: 完善环节使用 grill 辅助

完善环节 SHALL 调用 `opsc-grill` 技能进行追问，直至需求细节收敛。

#### Scenario: refine 中自动启用 grill

- **WHEN** 用户执行 `opsc refine`
- **THEN** 系统加载 `opsc-grill` 技能并开始逐题追问
