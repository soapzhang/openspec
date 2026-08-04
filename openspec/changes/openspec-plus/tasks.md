# Tasks: openspec-plus

## 1. 改名基底（D1）

- [x] 1.1 package.json `bin` 字段改为 `"opsc": "./bin/opsc.js"`
- [x] 1.2 重命名 `bin/openspec.js` → `bin/opsc.js`
- [x] 1.3 `src/cli/index.ts` `program.name('openspec')` → `'opsc'`
- [x] 1.4 `getCommandPath` 跳过根命令名同步为 `'opsc'`
- [x] 1.5 冒烟验证 `opsc --version` 输出正确且 `openspec --version` 不可用

## 2. 前缀与文案替换（D8）

- [x] 2.1 `src/utils/command-references.ts` 正则 `/opsx:` → `/opsc:`
- [x] 2.2 19 个 `src/core/command-generation/adapters/*.ts` 路径常量 `opsx-<id>`/`opsx/` → `opsc-<id>`/`opsc/`
- [x] 2.3 各 adapter frontmatter `name: /opsx-<id>` → `/opsc-<id>`
- [x] 2.4 `src/ui/welcome-screen.ts` 文案 `/opsx:` → `/opsc:`
- [x] 2.5 `src/core/init.ts` 快速开始文案同步
- [x] 2.6 `src/core/update.ts` 文案同步
- [x] 2.7 `src/core/legacy-cleanup.ts` 文案同步
- [x] 2.8 全仓 grep `/opsx` 清零校验

## 3. 命令面收敛（D2）

- [x] 3.1 现有非可见命令（update/list/view/change/spec/config/schema/validate/show/feedback/completion/status/instructions/templates/schemas）加 `.hidden()`
- [x] 3.2 新增 `refine` 命令骨架（注册 + 帮助文案）
- [x] 3.3 新增 `bug` 命令骨架（注册 + 帮助文案）
- [x] 3.4 `continue` 命令薄封装：复用 status + 下一工件 instructions 流程
- [x] 3.5 `apply` 命令薄封装：复用 `applyInstructionsCommand`
- [x] 3.6 `explore` 命令薄封装：输出探索指引
- [x] 3.7 验证 `opsc --help` 仅显示 8 个可见命令，隐藏命令完整命令仍可执行

## 4. 命名与目录结构（D3）

- [ ] 4.1 `validateChangeName` 扩展支持 `f<ID>-<描述>`（ID 字母数字、描述含中文、拒绝保留字符）
- [ ] 4.2 `opsc new` 缺 ID 时 inquirer 引导提供
- [ ] 4.3 明确无法提供 ID 时日期兜底 `fYYYYMMDD-<描述>`
- [ ] 4.4 描述缺失时引导提供（必填）
- [ ] 4.5 变更目录创建时初始化 `bugs/` 子目录
- [ ] 4.6 旧 kebab-case 变更兼容验证（list/status/archive 不受影响）

## 5. refine 前置阶段（D4）

- [x] 5.1 新增 `opsc refine` 命令：生成 `refine.md`（模板：需求信息/功能细节/开放问题/代码取证记录）
- [x] 5.2 refine 命令输出 grill 调用指引（加载 `opsc-grill`）
- [x] 5.3 `continue`/`instructions specs` 前置 gate：`refine.md` 缺失时阻止推进
- [x] 5.4 既有变更豁免：无 refine.md 时降级为警告放行
- [x] 5.5 验证冻结语义：refine 完成后无反向修改入口

## 6. 规模判定与能力拆分（D5）

- [x] 6.1 change metadata 增加 `size` 字段（large/small）
- [x] 6.2 refine 后 agent 判定 + inquirer confirm 用户强制确认
- [x] 6.3 大需求：`opsc-continue` 引导创建 `c1/`、`c2/` 子能力目录（各四件套），根目录不放 spec/design/tasks
- [x] 6.4 小需求：四件套生成在变更根目录
- [x] 6.5 判定写入 metadata 后重跑 continue 不再重复询问

## 7. 技能与命令模板（D7）

- [x] 7.1 `skill-templates.ts` 新增 `getRefineSkillTemplate`（完善流程 + 代码取证规约 + grill 调用）
- [x] 7.2 新增 `getBugSkillTemplate`（编号规则 + 四字段结构）
- [x] 7.3 新增 `getGrillSkillTemplate`（开源 grill-me 正文适配 + 3 缺口 + MIT 出处标注）
- [x] 7.4 `skill-generation.ts` `getSkillTemplates()` 只注册 8 个（dirName 改 `opsc-*`）
- [x] 7.5 `getCommandTemplates()` 只注册 explore/new/refine/continue/apply/archive/bug
- [x] 7.6 隐藏技能模板函数保留但不导出注册

## 8. bug 命令（D6）

- [x] 8.1 `opsc bug` 扫描 `bugs/` 下 `b\d{4}-` 取最大编号 +1
- [x] 8.2 交互收集四字段（状态/描述/原因/修改方案）
- [x] 8.3 写 `bugs/b0001-<描述>.md`
- [x] 8.4 归档不校验 bugs 状态验证

## 9. init 与用户手册（D9）

- [x] 9.1 init 全工具冒烟：仅生成 8 技能 + 7 命令（含 Claude Code `.claude/skills|commands`）
- [x] 9.2 新增 `docs/user-manual.md`（安装/init、全流程、bug 管理、命令参考、Claude Code 用法）
- [x] 9.3 README 命令与流程说明更新

## 10. 验证

- [x] 10.1 `pnpm build` 无编译错误
- [x] 10.2 Windows 路径冒烟：`opsc new`/`opsc refine`/`opsc bug` 在 Windows 创建目录与文档正常
- [ ] 10.3 POSIX 路径冒烟（CI 或 Linux 环境）
- [x] 10.4 全链路演练：new（带 ID）→ refine → continue → apply → archive
- [x] 10.5 功能验证通过后生成最终用户手册
