import path from 'path';
import { validateChangeExists } from './lib/shared.js';
import { readChangeMetadata } from './lib/utils/change-metadata.js';
import { applyInstructionsCommand } from './lib/instructions.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';

export interface ApplyOptions {
  change?: string;
  json?: boolean;
}

export async function applyCommand(options: ApplyOptions): Promise<void> {
  const projectRoot = process.cwd();
  const changeName = await validateChangeExists(options.change, projectRoot);
  const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
  const metadata = readChangeMetadata(changeDir, projectRoot);
  const stage = metadata?.status;

  if (stage !== 'task' && stage !== 'cN-apply') {
    throw new Error(`当前阶段 '${stage ?? 'unknown'}' 不能 apply。需要 status=task。`);
  }

  await applyInstructionsCommand({ change: changeName, json: options.json });
}
