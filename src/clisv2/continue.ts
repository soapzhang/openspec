import path from 'path';
import { validateChangeExists } from './lib/shared.js';
import { readChangeMetadata } from './lib/utils/change-metadata.js';
import { instructionsCommand } from './lib/instructions.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';

export interface ContinueOptions {
  change?: string;
}

const NEXT_ARTIFACT: Record<string, string> = {
  refine: 'proposal',
  proposal: 'specs',
  spec: 'design',
  design: 'tasks',
};

export async function continueCommand(options: ContinueOptions): Promise<void> {
  const projectRoot = process.cwd();
  const changeName = await validateChangeExists(options.change, projectRoot);
  const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
  const metadata = readChangeMetadata(changeDir, projectRoot);
  const stage = metadata?.status;

  if (!stage) {
    throw new Error('变更缺少 status。请先运行 `opsc status` 设置阶段。');
  }

  if (stage === 'new') {
    console.log('请先运行 `opsc refine` 完成完善环节。');
    return;
  }
  if (stage === 'task') {
    console.log('所有产物已生成，运行 `opsc apply` 实施任务。');
    return;
  }
  if (stage === 'cN-apply') {
    console.log('已完成，运行 `opsc release` 完善上线文档。');
    return;
  }

  const artifactId = NEXT_ARTIFACT[stage];
  if (!artifactId) {
    throw new Error(`未知阶段 '${stage}'`);
  }

  await instructionsCommand(artifactId, { change: changeName });
}
