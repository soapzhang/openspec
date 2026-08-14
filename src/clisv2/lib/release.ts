/**
 * Release Command
 *
 * Finalizes release.md after apply. Gates on all tasks being checked in
 * tasks.md, reads release.md + all design docs, interactively confirms each
 * section, and writes the finalized document back in place (no new docs).
 * Mandatory opsc-release skill integration (mirrors refine + opsc-grill).
 */

import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import * as fs from 'fs';
import fastGlob from 'fast-glob';
import { validateChangeExists } from './shared.js';
import { OPENSPEC_DIR_NAME } from './config.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ReleaseOptions {
  change?: string;
}

const CONTENT_SECTIONS = ['DDL', 'DML', '配置修改', '初始化动作', '发布服务'] as const;
type SectionName = (typeof CONTENT_SECTIONS)[number];

const RELEASE_SKILL_GUIDANCE = `
接下来使用 \`opsc-release\` 技能按规约完善上线文档：读取 release.md 与全部 design 文档，
逐项确认上线事项（DDL/DML、配置修改、初始化动作、发布服务），标记条目状态（待执行/已执行/跳过），
确认后置为定稿。定稿前 MUST 校验各分节非空（允许显式"无"标记）。
`;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Counts unchecked tasks in tasks.md (`- [ ]` lines). Returns -1 when the
 * file is missing (cannot confirm completion).
 */
function countIncompleteTasks(tasksPath: string): number {
  try {
    const content = fs.readFileSync(tasksPath, 'utf-8');
    const matches = content.match(/^\s*- \[ \]/gm);
    return matches ? matches.length : 0;
  } catch {
    return -1;
  }
}

/** Reads the document-level status from release.md (default 草稿). */
function getDocStatus(content: string): '草稿' | '定稿' {
  const match = content.match(/文档状态：\s*(草稿|定稿)/);
  return match && match[1] === '定稿' ? '定稿' : '草稿';
}

/** Parses release.md into header region + content section blocks + footer. */
function parseReleaseDoc(content: string): {
  header: string;
  blocks: Map<SectionName, string[]>;
  footer: string;
} {
  const lines = content.split('\n');
  const header: string[] = [];
  const blocks = new Map<SectionName, string[]>();
  const footer: string[] = [];
  let current: SectionName | null = null;
  let inContent = false;

  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m && (CONTENT_SECTIONS as readonly string[]).includes(m[1].trim())) {
      inContent = true;
      current = m[1].trim() as SectionName;
      blocks.set(current, []);
      continue;
    }
    if (inContent) {
      if (current && m) {
        current = null;
        footer.push(line);
      } else if (current) {
        blocks.get(current)!.push(line);
      } else {
        footer.push(line);
      }
    } else {
      header.push(line);
    }
  }
  return { header: header.join('\n'), blocks, footer: footer.join('\n') };
}

/** Renders release.md back with updated status/version and section bodies. */
function renderReleaseDoc(
  parsed: { header: string; blocks: Map<SectionName, string[]>; footer: string },
  docStatus: '草稿' | '定稿',
  version: string
): string {
  const header = parsed.header
    .replace(/(文档状态：\s*)(草稿|定稿)/, `$1${docStatus}`)
    .replace(/(- 版本：\s*)[^\n]*/, `$1${version}`);
  const body = CONTENT_SECTIONS.map((name) => {
    const bodyLines = (parsed.blocks.get(name) ?? []).map((l) => l.trim()).filter(Boolean);
    return `## ${name}\n${bodyLines.join('\n')}`;
  }).join('\n\n');
  const footer = parsed.footer.trim();
  return `${header.trim()}\n\n${body}${footer ? `\n\n${footer}` : ''}\n`;
}

/** Collects all design docs (main + sub-capability levels) of a change. */
function collectDesignDocs(changeDir: string): string[] {
  try {
    const matches = fastGlob.sync('**/design.md', { cwd: changeDir, onlyFiles: true, absolute: true });
    return matches.sort();
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function releaseCommand(options: ReleaseOptions): Promise<void> {
  const spinner = ora('Loading release phase...').start();

  try {
    const projectRoot = process.cwd();
    const changeName = await validateChangeExists(options.change, projectRoot);
    const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
    const releasePath = path.join(changeDir, 'release.md');

    // Gate 1: apply must have completed (all tasks checked)
    const tasksPath = path.join(changeDir, 'tasks.md');
    const incomplete = countIncompleteTasks(tasksPath);
    if (incomplete < 0) {
      spinner.stop();
      throw new Error(`tasks.md 不存在。请先执行 \`opsc apply\` 完成实施后再运行 \`opsc release\`。`);
    }
    if (incomplete > 0) {
      spinner.stop();
      throw new Error(`tasks.md 尚有 ${incomplete} 个任务未完成。请先执行 \`opsc apply\` 完成实施后再运行 \`opsc release\`。`);
    }

    // Gate 2: release.md must exist (created by opsc new)
    if (!fs.existsSync(releasePath)) {
      spinner.stop();
      throw new Error(`release.md 不存在（${releasePath}）。请先执行 \`opsc new\` 创建变更。`);
    }

    spinner.succeed(`Release phase for change '${changeName}'`);

    const canPrompt = process.stdin.isTTY;
    if (!canPrompt) {
      throw new Error('非交互模式不支持。请使用 `opsc-release` 技能完成上线文档完善。');
    }

    const { confirm, select, input } = await import('@inquirer/prompts');

    let content = fs.readFileSync(releasePath, 'utf-8');
    const status = getDocStatus(content);

    if (status === '定稿') {
      const unlock = await confirm({
        message: 'release.md 已定稿。是否解锁（改回草稿）继续完善？',
        default: false,
      });
      if (!unlock) {
        console.log(chalk.dim('已定稿的 release.md 即最终上线文档。'));
        return;
      }
      content = content.replace(/(文档状态：\s*)定稿/, '$1草稿');
    }

    const parsed = parseReleaseDoc(content);
    const designDocs = collectDesignDocs(changeDir);

    console.log(chalk.bold('\n完善输入材料：'));
    console.log(`  release.md: ${path.relative(projectRoot, releasePath)}`);
    if (designDocs.length === 0) {
      console.log(chalk.dim('  design 文档：无（基于 release.md 现有内容完善）'));
    } else {
      for (const doc of designDocs) {
        console.log(`  design: ${path.relative(projectRoot, doc)}`);
      }
    }

    // Per-section interactive confirmation
    for (const name of CONTENT_SECTIONS) {
      let body = (parsed.blocks.get(name) ?? []).map((l) => l.trim()).filter(Boolean);
      while (true) {
        console.log(chalk.bold(`\n## ${name}`));
        if (body.length === 0) {
          console.log(chalk.dim('（空）'));
        } else {
          body.forEach((l) => console.log('  ' + l));
        }

        const choices = [
          ...(body.length > 0 ? [{ name: '保留现状', value: 'keep' }] : []),
          { name: '标记为「无」（该节无事项）', value: 'none' },
          ...(body.length > 0 ? [{ name: '标记所有条目为「已执行」', value: 'done' }] : []),
          { name: '追加条目（输入）', value: 'add' },
        ];
        const action = await select({
          message: `${name} 如何处理？`,
          choices,
        });

        if (action === 'none') {
          parsed.blocks.set(name, ['- 状态：已确认 | 描述：无']);
          body = ['- 状态：已确认 | 描述：无'];
          break;
        }
        if (action === 'keep') {
          break;
        }
        if (action === 'done') {
          const updated = body.map((l) => l.replace(/状态：待执行/g, '状态：已执行'));
          parsed.blocks.set(name, updated);
          body = updated;
          break;
        }
        if (action === 'add') {
          const item = await input({ message: `${name} 条目内容（状态：待执行 | 描述：…）` });
          if (item.trim()) {
            const updated = [...body, `- ${item.trim()}`];
            parsed.blocks.set(name, updated);
            body = updated;
            break;
          }
        }
      }
    }

    // Version + finalize
    const version = (await input({ message: '上线版本号（默认：待定）', default: '待定' })).trim() || '待定';

    // Finalization validation: every section must be non-empty
    const emptySections = CONTENT_SECTIONS.filter((name) => {
      const bodyLines = (parsed.blocks.get(name) ?? []).map((l) => l.trim()).filter(Boolean);
      return bodyLines.length === 0;
    });
    if (emptySections.length > 0) {
      throw new Error(`以下分节为空，不得定稿：${emptySections.join('、')}。请重新运行 \`opsc release\` 补全（或标记"无"）。`);
    }

    const finalize = await confirm({ message: '确认将 release.md 置为定稿？', default: true });
    if (!finalize) {
      console.log(chalk.dim('已取消定稿。release.md 保持草稿状态。'));
      return;
    }

    const rendered = renderReleaseDoc(parsed, '定稿', version);
    await fs.promises.writeFile(releasePath, rendered, 'utf-8');

    console.log(chalk.green(`\nrelease.md 已定稿：${path.relative(projectRoot, releasePath)}`));
    console.log(RELEASE_SKILL_GUIDANCE);
  } catch (error) {
    spinner.stop();
    throw error;
  }
}
