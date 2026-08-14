import path from 'path';
import { validateChangeExists } from './lib/shared.js';
import { readChangeMetadata } from './lib/utils/change-metadata.js';
import { releaseCommand as workflowReleaseCommand } from './lib/release.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';

export interface ReleaseOptions {
  change?: string;
}

export async function releaseCommand(options: ReleaseOptions): Promise<void> {
  const projectRoot = process.cwd();
  const changeName = await validateChangeExists(options.change, projectRoot);
  const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
  const metadata = readChangeMetadata(changeDir, projectRoot);
  const stage = metadata?.status;

  if (stage !== 'cN-apply') {
    throw new Error(`当前阶段 '${stage ?? 'unknown'}' 不能 release。需要 status=cN-apply。`);
  }

  await workflowReleaseCommand({ change: changeName });
}
