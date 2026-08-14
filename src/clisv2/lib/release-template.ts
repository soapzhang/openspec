/**
 * Release Document Template
 *
 * release.md — the go-live document for a change, generated at change creation
 * (alongside bugs/). Design phase MUST sync release-related matters into it;
 * `opsc release` finalizes it after apply.
 */

/**
 * The release.md template with {changeName} placeholder.
 * Section structure: DDL / DML / config changes / initialization actions /
 * released services (frontend/backend). Item-level status: 待执行/已执行/跳过.
 */
export const RELEASE_TEMPLATE = `# Release: {changeName}

> 上线文档。文档状态：草稿 | 定稿。
> 设计阶段涉及上线发布的事项 MUST 同步至此；apply 完成后运行 \`opsc release\` 完善并定稿。

## 变更信息

- 变更：{changeName}
- 版本：待定
- 文档状态：草稿

## DDL

- 状态：待执行 | 描述：建表/索引/字段变更，附 SQL（无则填"无"）

## DML

- 状态：待执行 | 描述：数据修复/初始化数据，附 SQL（无则填"无"）

## 配置修改

- 状态：待执行 | 描述：配置文件/环境变量/开关，附变更前后（无则填"无"）

## 初始化动作

- 状态：待执行 | 描述：脚本/命令/一次性任务（无则填"无"）

## 发布服务

- 前端：状态：待执行 | 描述：服务名/版本/发布顺序（无则填"无"）
- 后端：状态：待执行 | 描述：服务名/版本/发布顺序（无则填"无"）
`;

/**
 * Generates the release.md content for a change.
 *
 * @param changeName - The change name
 * @returns The release.md template content with the change name filled in
 */
export function getReleaseTemplate(changeName: string): string {
  return RELEASE_TEMPLATE.replace(/\{changeName\}/g, changeName);
}
