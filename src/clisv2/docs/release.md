# release 命令

## 作用

完善上线文档 `release.md` 并置为定稿。

## 做了什么

1. 定位变更，读 yaml `status`
2. 门槛：`status` 必须是 `cN-apply`，否则报错
3. 复用 workflow 的 `releaseCommand`：校验 tasks 全部完成、逐节确认上线事项（DDL/DML/配置/初始化/发布服务）、定稿

## 用法

```bash
opsc release
opsc release --change f17085-登录重构
```

## 相关文件

- 命令实现：`src/clisv2/release.ts`
- 核心逻辑：`src/commands/workflow/release.ts`（复用）
