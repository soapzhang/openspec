/**
 * Refine Command
 *
 * Mandatory refinement phase before spec writing.
 * Creates refine.md with collected information, functional details,
 * open questions, and code-grounding evidence. Invokes opsc-grill.
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

export interface RefineOptions {
  change?: string;
}

const REFINE_TEMPLATE = `# Refine: {changeName}

> 完善环节（mandatory，spec 之前）。所有判断基于代码决策：凡能通过代码查证的，不得凭空假设。
> 完善完成后本文件冻结，后续需求变更直接进入 proposal/spec，不反向修改本文件。

## 需求信息

- 变更目标：
- 用户输入：
- 相关代码证据：

## 功能细节

- 功能点：
- 边界条件：
- 验收标准：

## 开放问题

- （待与用户确认的问题清单）

## 代码取证记录

- 已查证：文件/行为/结论
`;

const GRILL_GUIDANCE = `
接下来使用 \`opsc-grill\` 技能逐题追问（每次一问，附带 2-4 个选项，能从代码查证的先查证），
直至需求细节收敛。追问结论结构化写入本文件对应小节。
`;

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function refineCommand(options: RefineOptions): Promise<void> {
  const spinner = ora('Starting refine phase...').start();

  try {
    const projectRoot = process.cwd();
    const changeName = await validateChangeExists(options.change, projectRoot);
    const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
    const refinePath = path.join(changeDir, 'refine.md');

    if (fs.existsSync(refinePath)) {
      spinner.stop();
      console.log(chalk.yellow(`refine.md 已存在且已冻结（${refinePath}）。`));
      console.log(chalk.dim('后续需求变更请直接修改 proposal/spec，不反向修改 refine.md。'));
      return;
    }

    // Ensure bugs/ directory exists alongside
    const bugsDir = path.join(changeDir, 'bugs');
    await fs.promises.mkdir(bugsDir, { recursive: true });

    const content = REFINE_TEMPLATE.replace(/\{changeName\}/g, changeName);
    await fs.promises.writeFile(refinePath, content, 'utf-8');

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
