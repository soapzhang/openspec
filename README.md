# OpenSpec Plus

AI 原生规范驱动开发系统。`opsc` 为 CLI 入口（原 `openspec`）。

## 快速开始

```bash
opsc init               # 初始化项目（生成技能与斜杠命令）
opsc new f17085-描述    # 新建变更（跟踪 ID 格式）
opsc refine             # 完善环节（spec 前强制，产出 refine.md）
opsc continue           # 创建工件（proposal/spec/design/tasks）
opsc apply              # 实施任务
opsc archive            # 归档变更
opsc bug                # 创建 bug 文档
opsc explore            # 探索模式（非强制）
```

完整说明见 [docs/user-manual.md](docs/user-manual.md)。

## 开发

```bash
pnpm install    # 安装依赖
pnpm build      # 编译到 dist/
node bin/opsc.js --help
```

## 变更管理约定

- 变更目录：`f<ID>-<描述>`（ID 数字/字符串，缺失以日期兜底）
- 强制完善：spec 前必须完成 `refine.md`，所有判断基于代码决策，完成后冻结
- 规模判定：refine 后由 agent 判定 + 用户确认；大型需求拆 `c1/`、`c2/` 子能力
- Bug 管控：`bugs/b0001-<描述>.md`，不影响归档
- 技能/命令：`opsc-new`、`opsc-refine`、`opsc-continue`、`opsc-apply`、`opsc-archive`、`opsc-explore`、`opsc-bug`、`opsc-grill`
