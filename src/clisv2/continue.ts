import path from 'path';
import { validateChangeExists, ensureChangeSize, detectScaleFromProposal } from './lib/shared.js';
import { readChangeMetadata, writeChangeMetadata } from './lib/utils/change-metadata.js';
import { instructionsCommand } from './lib/instructions.js';
import { OPENSPEC_DIR_NAME } from './lib/config.js';

export interface ContinueOptions {
  change?: string;
}

const NEXT_ARTIFACT: Record<string, string> = {
  refine: 'proposal',
  proposal: 'specs',
  specs: 'design',
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
  if (stage === 'tasks') {
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

  // Size judgment: determine large/small before generating proposal
  if (stage === 'refine') {
    const size = await ensureChangeSize(projectRoot, changeName);
    if (size === 'large') {
      console.log('规模判定：复杂需求。将拆分子能力目录 c1-<描述>/、c2-<描述>/…（各含 spec/design/tasks）。');
    } else if (size === 'small') {
      console.log('规模判定：简单需求。四件套（proposal/specs/design/tasks）直接放变更根目录。');
    }
    console.log();
  }

  // Backfill: reconcile size with proposal's 推进结论 (proposal created in prior run)
  if (stage === 'proposal') {
    const proposalSize = detectScaleFromProposal(changeDir);
    if (proposalSize && metadata?.size && proposalSize !== metadata.size) {
      writeChangeMetadata(changeDir, { ...metadata, size: proposalSize }, projectRoot);
      console.log(
        proposalSize === 'large'
          ? '规模已按 proposal 结论修正为：复杂需求。'
          : '规模已按 proposal 结论修正为：简单需求。'
      );
    }
  }

  await instructionsCommand(artifactId, { change: changeName });

  // 自动推进状态，免去手动 `opsc status --set`（重读元数据避免覆盖 ensureChangeSize 写入的 size）
  const latest = readChangeMetadata(changeDir, projectRoot) ?? metadata;
  writeChangeMetadata(changeDir, { ...latest, status: artifactId }, projectRoot);
}
