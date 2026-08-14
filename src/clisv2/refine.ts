import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { validateChangeExists } from './lib/shared.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';
import { readChangeMetadata, writeChangeMetadata } from './lib/utils/change-metadata.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REFINE_TEMPLATE_PATH = path.resolve(__dirname, '..', 'template', 'refine.md');

export interface RefineOptions {
  change?: string;
}

const GRILL_GUIDANCE = `
接下来使用 \`opsc-grill\` 技能逐题追问（每次一问，附带 2-4 个选项，能从代码查证的先查证），
直至需求细节收敛。追问结论结构化写入本文件对应小节。
`;

export async function refineCommand(options: RefineOptions): Promise<void> {
  const spinner = ora('Starting refine phase...').start();

  try {
    const projectRoot = process.cwd();
    const changeName = await validateChangeExists(options.change, projectRoot);
    const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
    const refinePath = path.join(changeDir, 'refine.md');

    try {
      await fs.access(refinePath);
      spinner.stop();
      console.log(chalk.yellow(`refine.md 已存在且已冻结（${refinePath}）。`));
      console.log(chalk.dim('后续需求变更请直接修改 proposal/spec，不反向修改 refine.md。'));
      return;
    } catch {
      // not exists, continue
    }

    await fs.mkdir(path.join(changeDir, 'bugs'), { recursive: true });
    const template = await fs.readFile(REFINE_TEMPLATE_PATH, 'utf-8');
    await fs.writeFile(refinePath, template.replace(/\{changeName\}/g, changeName), 'utf-8');

    // Update metadata status → refine
    const meta = readChangeMetadata(changeDir, projectRoot);
    if (meta) {
      writeChangeMetadata(changeDir, { ...meta, status: 'refine' }, projectRoot);
    }

    spinner.succeed(`Created ${refinePath}`);

    console.log(chalk.bold('\n完善环节要求：'));
    console.log('1. 收集信息：需求目标、用户输入、相关代码证据');
    console.log('2. 完善功能细节：功能点、边界条件、验收标准');
    console.log('3. 全部判断基于代码决策，可查证问题先探索代码');
    console.log(GRILL_GUIDANCE);
    console.log(chalk.dim('完善完成后，运行 `opsc continue` 继续。'));
  } catch (error) {
    spinner.stop();
    throw error;
  }
}
