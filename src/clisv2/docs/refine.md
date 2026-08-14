# refine 命令

## 作用

启动强制完善环节，在变更目录生成 `refine.md` 草稿（spec 之前必跑）。

## 做了什么

1. 定位变更（`--change` 指定或交互选择）
2. 若 `refine.md` 已存在：提示已冻结，不覆盖，直接返回
3. 否则读 `src/template/refine.md`，替换 `{changeName}` 写入 `openspec++/changes/<name>/refine.md`
4. 确保 `bugs/` 目录存在
5. 更新 `.openspec.yaml` 的 `status` → `refine`
6. 打印完善要求 + grill 追问指引

## 用法

```bash
opsc refine
opsc refine --change f17085-登录重构
```

## 输出

- 产物：`openspec++/changes/<name>/refine.md`
- 下一步：完善完成后运行 `opsc continue`

## 相关文件

- 命令实现：`src/clisv2/refine.ts`
- 模板：`src/template/refine.md`
- 元数据更新：`.openspec.yaml` 的 `status` 字段（`src/utils/change-metadata.ts`）
