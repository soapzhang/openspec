# bug 命令

## 作用

在当前变更的 `bugs/` 目录创建 bug 文档，编号自动递增（b0001、b0002…）。

## 做了什么

1. 定位变更，确保 `bugs/` 目录存在
2. 算下一个编号（扫描现有 `b\d{4}-` 文件取最大 +1）
3. 收集字段：状态/描述/原因/修改方案（缺则交互输入，非交互报错）
4. 读 `src/template/bug.md` 模板，替换占位符写入 `bugs/b<编号>-<描述>.md`

## 用法

```bash
opsc bug --change f17085-登录重构 --description "登录失败" --reason "xxx"
opsc bug   # 交互式
```

## 相关文件

- 命令实现：`src/clisv2/bug.ts`
- 模板：`src/template/bug.md`
