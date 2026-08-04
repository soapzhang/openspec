/**
 * Bug Command
 *
 * Creates a bug document in the current change's bugs/ directory.
 * Numbering starts at b0001 and auto-increments.
 */

import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import * as fs from 'fs';
import { validateChangeExists } from './shared.js';
import { OPENSPEC_DIR_NAME } from '../../core/config.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface BugOptions {
  change?: string;
  status?: string;
  description?: string;
  reason?: string;
  fix?: string;
}

const BUG_TEMPLATE = `# Bug {number}: {description}

- **状态**：{status}
- **描述**：{description}
- **原因**：{reason}
- **修改方案**：{fix}
`;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function nextBugNumber(bugsDir: string): Promise<number> {
  let max = 0;
  try {
    const entries = await fs.promises.readdir(bugsDir);
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

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function bugCommand(options: BugOptions): Promise<void> {
  const spinner = ora('Creating bug document...').start();

  try {
    const projectRoot = process.cwd();
    const changeName = await validateChangeExists(options.change, projectRoot);
    const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
    const bugsDir = path.join(changeDir, 'bugs');
    await fs.promises.mkdir(bugsDir, { recursive: true });

    const number = await nextBugNumber(bugsDir);
    const numStr = String(number).padStart(4, '0');

    let { status, description, reason, fix } = options;

    // Interactive collection when fields are missing
    if (!status || !description || !reason || !fix) {
      const canPrompt = process.stdin.isTTY;
      if (!canPrompt) {
        spinner.stop();
        throw new Error(
          'Missing bug fields. Provide --status, --description, --reason, --fix (non-interactive mode).'
        );
      }
      const { input } = await import('@inquirer/prompts');
      if (!status) status = await input({ message: '状态', default: '待处理' });
      if (!description) description = await input({ message: '描述', required: true });
      if (!reason) reason = await input({ message: '原因' });
      if (!fix) fix = await input({ message: '修改方案' });
    }

    if (!description) {
      throw new Error('Bug description is required');
    }

    const slug = sanitizeFilename(description);
    const filename = `b${numStr}-${slug}.md`;
    const filePath = path.join(bugsDir, filename);

    const content = BUG_TEMPLATE.replace(/\{number\}/g, `b${numStr}`)
      .replace(/\{description\}/g, description)
      .replace(/\{status\}/g, status ?? '待处理')
      .replace(/\{reason\}/g, reason ?? '')
      .replace(/\{fix\}/g, fix ?? '');

    await fs.promises.writeFile(filePath, content, 'utf-8');

    spinner.succeed(`Created ${path.relative(projectRoot, filePath)}`);
  } catch (error) {
    spinner.stop();
    throw error;
  }
}
