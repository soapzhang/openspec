import { Command } from 'commander';
import { createRequire } from 'module';
import ora from 'ora';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

program
  .name('opsc')
  .description('AI 原生规范驱动开发系统')
  .version(version);

// Global options
program.option('--no-color', '禁用彩色输出');

// Apply --no-color before any command runs
program.hook('preAction', async (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }
});

program
  .command('init [path]')
  .description('在当前项目中初始化 OpenSpec（Claude Code）')
  .action(async (targetPath = '.') => {
    try {
      const { initCommand } = await import('../clisv2/init.js');
      await initCommand(targetPath);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('archive [change-name]')
  .description('归档已完成的变更并更新主规范')
  .option('-y, --yes', '跳过确认提示')
  .option('--skip-specs', '跳过规范更新操作（适用于基础设施、工具或仅文档变更）')
  .option('--no-validate', '跳过验证（不推荐，需要确认）')
  .action(async (changeName?: string, options?: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean; validate?: boolean }) => {
    try {
      const { archiveCommand } = await import('../clisv2/archive.js');
      await archiveCommand(changeName, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('显示或设置变更的阶段状态')
  .option('--change <id>', '要显示的变更名称')
  .option('--set <stage>', '设置阶段（new/refine/proposal/spec/design/task/cN-apply）')
  .option('--json', '输出 JSON（产物状态图）')
  .action(async (options: { change?: string; set?: string; json?: boolean }) => {
    try {
      const { statusCommand } = await import('../clisv2/status.js');
      await statusCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('列出当前项目中的所有变更（按最近修改排序）')
  .option('--json', '输出 JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      const { listCommand } = await import('../clisv2/list.js');
      await listCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// New command group with change subcommand
const newCmd = program
  .command('new [name]')
  .description('创建新变更（跟踪 ID 格式 f<ID>-<描述>）');

newCmd
  .option('--description <text>', '添加到 README.md 的描述（kebab-case 名称时）')
  .option('--schema <name>', '使用的工作流 Schema（默认：spec-driven）');

newCmd.action(async (name: string | undefined, options: { description?: string; schema?: string }) => {
  try {
    const { newCommand } = await import('../clisv2/new.js');
    await newCommand(name, options);
  } catch (error) {
    console.log();
    ora().fail(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
});

newCmd
  .command('change <name>')
  .description('创建一个新的变更目录')
  .option('--description <text>', '添加到 README.md 的描述')
  .option('--schema <name>', '使用的工作流 Schema（默认：spec-driven）')
  .action(async (name: string, options: { description?: string; schema?: string }) => {
    try {
      const { newCommand } = await import('../clisv2/new.js');
      await newCommand(name, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('refine')
  .description('启动完善环节，生成 refine.md（spec 之前强制）')
  .option('--change <id>', '变更名称')
  .action(async (options: { change?: string }) => {
    try {
      const { refineCommand } = await import('../clisv2/refine.js');
      await refineCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('continue')
  .description('按当前阶段输出下一个产物的创建指令')
  .option('--change <id>', '变更名称')
  .action(async (options: { change?: string }) => {
    try {
      const { continueCommand } = await import('../clisv2/continue.js');
      await continueCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('instructions [artifact-id]')
  .description('输出指定产物或 apply 的创建/实施指令')
  .option('--change <id>', '变更名称')
  .option('--schema <name>', '工作流 Schema')
  .option('--json', '输出 JSON')
  .action(async (artifactId: string | undefined, options: { change?: string; schema?: string; json?: boolean }) => {
    try {
      if (artifactId === 'apply') {
        const { applyInstructionsCommand } = await import('../clisv2/lib/instructions.js');
        await applyInstructionsCommand({ change: options.change, schema: options.schema, json: options.json });
        return;
      }
      const { instructionsCommand } = await import('../clisv2/lib/instructions.js');
      await instructionsCommand(artifactId, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('apply')
  .description('显示实施任务的指令')
  .option('--change <id>', '变更名称')
  .option('--json', '输出 JSON')
  .action(async (options: { change?: string; json?: boolean }) => {
    try {
      const { applyCommand } = await import('../clisv2/apply.js');
      await applyCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('release')
  .description('完善上线文档 release.md 并置为定稿（必须 apply 完成后运行）')
  .option('--change <id>', '变更名称')
  .action(async (options: { change?: string }) => {
    try {
      const { releaseCommand } = await import('../clisv2/release.js');
      await releaseCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('bug')
  .description('在当前变更的 bugs/ 目录创建 bug 文档')
  .option('--change <id>', '变更名称')
  .option('--status <text>', '状态')
  .option('--description <text>', '描述')
  .option('--reason <text>', '原因')
  .option('--fix <text>', '修改方案')
  .action(async (options: { change?: string; status?: string; description?: string; reason?: string; fix?: string }) => {
    try {
      const { bugCommand } = await import('../clisv2/bug.js');
      await bugCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('explore')
  .description('进入探索模式：思考与澄清需求（非强制，随时可用）')
  .action(async () => {
    const { exploreCommand } = await import('../clisv2/explore.js');
    exploreCommand();
  });

program.parse();
