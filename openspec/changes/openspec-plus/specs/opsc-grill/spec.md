# Opsc Grill

## ADDED Requirements

### Requirement: 基于开源实现

`opsc-grill` 技能 SHALL 基于开源 grill-me 实现（mattpocock/skills 与 RobMitt/grill-me-skill，MIT 许可），并 SHALL 在模板中标注开源出处。

#### Scenario: 模板标注出处

- **WHEN** `opsc-grill` 技能模板生成
- **THEN** 模板正文注明基于开源 grill-me 适配

### Requirement: 独立技能定位

`opsc-grill` SHALL 作为独立技能存在。完善环节 MUST 使用它；其他时机 SHALL 允许用户主动调用。

#### Scenario: refine 强制调用

- **WHEN** 执行 `opsc refine`
- **THEN** 加载并调用 `opsc-grill` 进行追问

#### Scenario: 其他时机可选调用

- **WHEN** 用户在其他环节（如 explore）主动要求被拷问
- **THEN** `opsc-grill` 可用，且不强制影响当前流程

### Requirement: 追问机制

`opsc-grill` SHALL 使用提问工具逐题追问。每轮 MUST 只问一个问题并等待回答；每个问题 MUST 提供 2-4 个具体选项；能被代码或文件回答的问题 MUST 先自行探索而非提问。

#### Scenario: 逐题追问

- **WHEN** grill 会话开始
- **THEN** 一次仅提出一个问题，待用户回答后再提下一题

#### Scenario: 选项式提问

- **WHEN** grill 提出问题
- **THEN** 问题附带 2-4 个具体选项，用户可选项回答或自定义输入

#### Scenario: 代码优先

- **WHEN** 问题可通过探索代码库回答
- **THEN** grill 先探索代码获取答案，不向用户提问

### Requirement: refine 输出契约

grill 会话结束 SHALL 输出结构化决策总结，供 `refine.md` 承接。输出 MUST 覆盖：已确认决策、待开放问题、代码取证记录。

#### Scenario: 会话产出落盘

- **WHEN** refine 中的 grill 会话收敛
- **THEN** 会话结论以结构化形式写入 `refine.md`，包含决策、开放问题与代码证据

### Requirement: OpenSpec 上下文

`opsc-grill` 在 refine 中运行时 SHALL 具备 OpenSpec 工件知识（proposal/spec/design/tasks 与完善流程），追问 SHALL 引导需求向可落地的 spec 方向收敛。

#### Scenario: 追问引导收敛

- **WHEN** grill 追问变更需求
- **THEN** 追问方向围绕功能边界、验收条件等可写入 spec 的维度展开
