import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import { createChange, validateChangeName } from './lib/utils/change-utils.js';
import { validateSchemaExists } from './lib/shared.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';

export interface NewOptions {
  description?: string;
  schema?: string;
}

function sanitizeDescription(text: string): string {
  return text
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function currentDateId(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export async function newCommand(name: string | undefined, options: NewOptions): Promise<void> {
  let changeName = name;

  // Interactive flow: guide user to provide tracking ID + description
  if (!changeName) {
    if (!process.stdin.isTTY) {
      throw new Error('缺少 <name> 参数。格式：f<ID>-<描述>（如 f17085-登录重构）');
    }

    const { input, confirm } = await import('@inquirer/prompts');

    const hasId = await confirm({
      message: '提供跟踪 ID？选"否"将使用当前日期作为 ID',
      default: true,
    });

    const id = hasId
      ? (await input({ message: '跟踪 ID（数字或字符串）', required: true })).trim()
      : currentDateId();

    if (hasId && !/^[A-Za-z0-9]+$/.test(id)) {
      throw new Error('跟踪 ID 只能包含字母和数字');
    }

    const description = (await input({ message: '变更描述（必填）', required: true })).trim();
    changeName = `f${id}-${sanitizeDescription(description)}`;
  }

  const validation = validateChangeName(changeName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const projectRoot = process.cwd();
  if (options.schema) {
    validateSchemaExists(options.schema, projectRoot);
  }

  const spinner = ora(`Creating change '${changeName}'...`).start();

  try {
    const result = await createChange(projectRoot, changeName, { schema: options.schema });

    // Legacy: README.md description for kebab-case names only.
    if (options.description && !changeName.startsWith('f')) {
      const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
      await fs.writeFile(path.join(changeDir, 'README.md'), `# ${changeName}\n\n${options.description}\n`, 'utf-8');
    }

    spinner.succeed(`Created change '${changeName}' (schema: ${result.schema})`);
    console.log('下一步：运行 `opsc refine` 进入强制完善环节。');
  } catch (error) {
    spinner.fail(`Failed to create change '${changeName}'`);
    throw error;
  }
}
