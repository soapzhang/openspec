/**
 * New Change Command
 *
 * Creates a new change directory with optional description and schema.
 * Supports tracking ID format: `f<ID>-<描述>`.
 * Guides the user to provide a tracking ID; falls back to current date
 * when the user explicitly cannot provide one. Description is required.
 */

import ora from 'ora';
import path from 'path';
import { createChange, validateChangeName } from '../../utils/change-utils.js';
import { validateSchemaExists } from './shared.js';
import { OPENSPEC_DIR_NAME } from '../../core/config.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface NewChangeOptions {
  description?: string;
  schema?: string;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sanitizeDescription(text: string): string {
  return text
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function currentDateId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function newChangeCommand(name: string | undefined, options: NewChangeOptions): Promise<void> {
  let changeName = name;

  // Interactive flow: guide user to provide tracking ID + description
  if (!changeName) {
    const canPrompt = process.stdin.isTTY;
    if (!canPrompt) {
      throw new Error(
        'Missing required argument <name>. Use tracking ID format: f<ID>-<描述> (e.g., f17085-登录重构)'
      );
    }
    const { input, confirm } = await import('@inquirer/prompts');

    const hasId = await confirm({
      message: '提供跟踪 ID？选择"否"将使用当前日期作为 ID',
      default: true,
    });

    let id: string;
    if (hasId) {
      id = (await input({ message: '跟踪 ID（数字或字符串，如 17085 / login）', required: true })).trim();
      if (!/^[A-Za-z0-9]+$/.test(id)) {
        throw new Error('跟踪 ID 只能包含字母和数字');
      }
    } else {
      id = currentDateId();
    }

    const description = (await input({ message: '变更描述（必填，如 登录重构）', required: true })).trim();
    changeName = `f${id}-${sanitizeDescription(description)}`;
  }

  const validation = validateChangeName(changeName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const projectRoot = process.cwd();

  // Validate schema if provided
  if (options.schema) {
    validateSchemaExists(options.schema, projectRoot);
  }

  const schemaDisplay = options.schema ? ` with schema '${options.schema}'` : '';
  const spinner = ora(`Creating change '${changeName}'${schemaDisplay}...`).start();

  try {
    const result = await createChange(projectRoot, changeName, { schema: options.schema });

    // Legacy behavior: README.md with description for kebab-case names only.
    // Tracking-ID names embed the description in the directory name.
    if (options.description && !changeName.startsWith('f')) {
      const { promises: fs } = await import('fs');
      const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
      const readmePath = path.join(changeDir, 'README.md');
      await fs.writeFile(readmePath, `# ${changeName}\n\n${options.description}\n`, 'utf-8');
    }

    spinner.succeed(`Created change '${changeName}' at openspec/changes/${changeName}/ (schema: ${result.schema})`);
    console.log('下一步：运行 `opsc refine` 进入强制完善环节（spec 之前）。');
  } catch (error) {
    spinner.fail(`Failed to create change '${changeName}'`);
    throw error;
  }
}
