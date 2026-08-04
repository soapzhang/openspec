# Capability Splitting

## ADDED Requirements

### Requirement: 规模判定与用户确认

变更规模（大需求/简单需求）SHALL 由 agent 在 refine 完善完成、`refine.md` 产出之后判定，且 MUST 由用户强制确认。判定结果 MUST 体现在 proposal 的规模说明与能力清单中，并 SHALL 不写入已冻结的 `refine.md`。

#### Scenario: 判定为简单需求

- **WHEN** `refine.md` 已产出，agent 判定变更需求简单，且用户确认
- **THEN** 变更四件套（proposal/spec/design/tasks）直接放置在变更根目录

#### Scenario: 判定为大需求

- **WHEN** `refine.md` 已产出，agent 判定变更需求较大，且用户确认
- **THEN** 在变更根目录下创建子能力目录，且不将 spec/design/tasks 放置在根目录

#### Scenario: refine 未完成时禁止判定

- **WHEN** 变更的 `refine.md` 尚未产出
- **THEN** 不进行规模判定与能力拆分

#### Scenario: 判定未获用户确认

- **WHEN** agent 完成判定但用户未确认
- **THEN** 流程暂停，等待用户明确选择

### Requirement: 子能力独立交付

每个子能力 SHALL 是独立可交付、可验证的单元。子能力 MUST 包含该功能的全部关注点（设计、页面、后端），并拥有自己完整的 proposal/spec/design/tasks 四件套。子能力的 proposal SHALL 独立描述自身能力，不依赖其他子能力。

#### Scenario: 创建子能力目录

- **WHEN** 大需求被拆分为 n 个子能力
- **THEN** 变更根目录下创建 `c1/`、`c2/`…`cn/` 目录，每个目录含独立的 proposal.md/spec.md/design.md/tasks.md

#### Scenario: 子能力独立验证

- **WHEN** 某个子能力实施完成
- **THEN** 该子能力可脱离其他子能力单独交付与验证

### Requirement: 变更根 proposal

大需求变更根目录的 `proposal.md` SHALL 作为总览，包含变更动机与子能力清单；子能力细节 MUST 由各子能力自身的 proposal 承载。

#### Scenario: 大需求 proposal 内容

- **WHEN** 大需求变更的 proposal 完成
- **THEN** proposal 描述整体动机与能力划分，不承载具体子能力的设计细节
