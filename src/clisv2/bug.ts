import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import ora from 'ora';
import chalk from 'chalk';
import { validateChangeExists } from './lib/shared.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUG_TEMPLATE_PATH = path.resolve(__dirname, '..', 'template', 'bug.md');

export interface BugOptions {
  change?: string;
  status?: string;
  description?: string;
  reason?: string;
  fix?: string;
}

async function nextBugNumber(bugsDir: string): Promise<number> {
  let max = 0;
  try {
    const entries = await fs.readdir(bugsDir);
    for (const entry of entries) {
      const match = entry.match(/^b(\d{4})-/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    }
  } catch {
    // directory may not exist yet
  }
  return max + 1;
}

function sanitizeFilename(text: string): string {
  return text.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-').slice(0, 60);
}

export async function bugCommand(options: BugOptions): Promise<void> {
  const spinner = ora('Creating bug document...').start();

  try {
    const projectRoot = process.cwd();
    const changeName = await validateChangeExists(options.change, projectRoot);
    const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
    const bugsDir = path.join(changeDir, 'bugs');
    await fs.mkdir(bugsDir, { recursive: true });

    const number = await nextBugNumber(bugsDir);
    const numStr = String(number).padStart(4, '0');

    let { status, description, reason, fix } = options;

    if (!status || !description || !reason || !fix) {
      if (!process.stdin.isTTY) {
        spinner.stop();
        throw new Error('Missing bug fields. Provide --status, --description, --reason, --fix (non-interactive mode).');
      }
      const { input } = await import('@inquirer/prompts');
      if (!status) status = await input({ message: '状态', default: '待处理' });
      if (!description) description = await input({ message: '描述', required: true });
      if (!reason) reason = await input({ message: '原因（根因分析，必填）', required: true });
      if (!fix) fix = await input({ message: '修改方案' });
    }

    if (!description) throw new Error('Bug description is required');
    if (!reason) throw new Error('Bug reason (原因) is required — analyze the root cause before creating the bug');

    const slug = sanitizeFilename(description);
    const filename = `b${numStr}-${slug}.md`;
    const filePath = path.join(bugsDir, filename);

    const template = await fs.readFile(BUG_TEMPLATE_PATH, 'utf-8');
    const content = template
      .replace(/\{number\}/g, `b${numStr}`)
      .replace(/\{description\}/g, description)
      .replace(/\{status\}/g, status ?? '待处理')
      .replace(/\{reason\}/g, reason ?? '')
      .replace(/\{fix\}/g, fix ?? '');

    await fs.writeFile(filePath, content, 'utf-8');

    spinner.succeed(`Created ${path.relative(projectRoot, filePath)}`);
    console.log(chalk.bold('\n约束：根因先行，禁止直接修改。'));
    console.log('1. 仅当根因分析（原因字段）完整且经用户确认后，才允许修改代码。');
    console.log('2. 禁止在未分析根因、未经用户确认的情况下直接修改代码。');
    console.log(chalk.dim('修复时通过修改 bug 文档的"状态"字段流转（待处理 → 修复中 → 已修复 → 已验证 → 已关闭）。'));
  } catch (error) {
    spinner.stop();
    throw error;
  }
}
