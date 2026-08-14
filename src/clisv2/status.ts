import path from 'path';
import { validateChangeExists } from './lib/shared.js';
import { readChangeMetadata, writeChangeMetadata } from './lib/utils/change-metadata.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';

export interface StatusOptions {
  change?: string;
  set?: string;
}

const STAGE_VALUES = ['new', 'refine', 'proposal', 'spec', 'design', 'task', 'cN-apply'] as const;

const STAGE_NEXT: Record<string, string> = {
  new: 'opsc refine',
  refine: 'opsc continue（生成 proposal）',
  proposal: 'opsc continue（生成 specs）',
  spec: 'opsc continue（生成 design）',
  design: 'opsc continue（生成 tasks）',
  task: 'opsc apply',
  'cN-apply': 'opsc release',
};

export async function statusCommand(options: StatusOptions): Promise<void> {
  const projectRoot = process.cwd();
  const changeName = await validateChangeExists(options.change, projectRoot);
  const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
  const metadata = readChangeMetadata(changeDir, projectRoot);

  if (options.set) {
    const stage = options.set;
    if (!(STAGE_VALUES as readonly string[]).includes(stage)) {
      throw new Error(`Invalid stage '${stage}'. Valid: ${STAGE_VALUES.join(', ')}`);
    }
    if (!metadata) {
      throw new Error('变更缺少 .openspec.yaml，无法写入 status');
    }
    writeChangeMetadata(changeDir, { ...metadata, status: stage }, projectRoot);
    printStage(changeName, stage);
    return;
  }

  let stage = metadata?.status;

  if (!stage) {
    stage = await promptStage(changeDir, projectRoot, metadata);
  }

  printStage(changeName, stage);
}

function printStage(changeName: string, stage: string): void {
  console.log(`Change: ${changeName}`);
  console.log(`阶段: ${stage}`);
  const next = STAGE_NEXT[stage];
  if (next) {
    console.log(`下一步: ${next}`);
  }
}

async function promptStage(
  changeDir: string,
  projectRoot: string,
  metadata: { schema: string; created?: string; size?: 'large' | 'small'; status?: string } | null
): Promise<string> {
  if (!process.stdin.isTTY) {
    return 'unknown';
  }

  const { select } = await import('@inquirer/prompts');
  const stage = await select({
    message: '变更当前处于哪个阶段？',
    choices: STAGE_VALUES.map((s) => ({ name: s, value: s })),
  });

  if (metadata) {
    writeChangeMetadata(changeDir, { ...metadata, status: stage }, projectRoot);
  }
  return stage;
}
