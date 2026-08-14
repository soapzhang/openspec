# new 命令

## 作用

创建一个新的变更目录，命名格式 `f<跟踪ID>-<描述>`（如 `f17085-登录重构`）。

## 做了什么

1. 确定变更名：
   - 命令行传了 `<name>` 直接用
   - 没传且交互终端：引导输入跟踪 ID（可跳过用当前日期）和描述
   - 没传且非交互：报错
2. 校验名称（kebab-case 或 `f<ID>-<描述>` 格式）
3. 调用 `createChange` 创建目录，含 `bugs/` 子目录、`release.md` 草稿
4. 写 `.openspec.yaml` 元数据：`schema`、`created`、`status: new`（`size` 暂不写，refine 后由 continue 判定）
5. 可选 `--schema` 指定工作流（默认 `spec-driven`，读 config.yaml）

## 用法

```bash
opsc new f17085-登录重构
opsc new                 # 交互式引导
opsc new --schema my-workflow f17085-登录重构
```

## 输出

- 变更目录：`openspec++/changes/<name>/`
- 元数据：`.openspec.yaml`（`status: new`，`size` 由后续 refine/continue 判定）
- 下一步：运行 `opsc refine` 进入强制完善环节

## 相关文件

- 命令实现：`src/clisv2/new.ts`
- 核心逻辑：`src/utils/change-utils.ts`（`createChange` / `validateChangeName`）
- 元数据模板：`src/template/change-meta.yaml`
