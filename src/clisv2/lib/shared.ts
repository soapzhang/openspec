/**
 * Shared Types and Utilities for Artifact Workflow Commands
 *
 * This module contains types, constants, and validation helpers used across
 * multiple artifact workflow commands.
 */

import chalk from 'chalk';
import path from 'path';
import * as fs from 'fs';
import { getSchemaDir, listSchemas } from './artifact-graph/index.js';
import { validateChangeName } from './utils/change-utils.js';
import { OPENSPEC_DIR_NAME } from './config.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface TaskItem {
  id: string;
  description: string;
  done: boolean;
}

export interface ApplyInstructions {
  changeName: string;
  changeDir: string;
  schemaName: string;
  contextFiles: Record<string, string>;
  progress: {
    total: number;
    complete: number;
    remaining: number;
  };
  tasks: TaskItem[];
  state: 'blocked' | 'all_done' | 'ready';
  missingArtifacts?: string[];
  instruction: string;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const DEFAULT_SCHEMA = 'spec-driven';

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Checks if color output is disabled via NO_COLOR env or --no-color flag.
 */
export function isColorDisabled(): boolean {
  return process.env.NO_COLOR === '1' || process.env.NO_COLOR === 'true';
}

/**
 * Gets the color function based on status.
 */
export function getStatusColor(status: 'done' | 'ready' | 'blocked'): (text: string) => string {
  if (isColorDisabled()) {
    return (text: string) => text;
  }
  switch (status) {
    case 'done':
      return chalk.green;
    case 'ready':
      return chalk.yellow;
    case 'blocked':
      return chalk.red;
  }
}

/**
 * Gets the status indicator for an artifact.
 */
export function getStatusIndicator(status: 'done' | 'ready' | 'blocked'): string {
  const color = getStatusColor(status);
  switch (status) {
    case 'done':
      return color('[x]');
    case 'ready':
      return color('[ ]');
    case 'blocked':
      return color('[-]');
  }
}

/**
 * Validates that a change exists and returns available changes if not.
 * Checks directory existence directly to support scaffolded changes (without proposal.md).
 */
export async function validateChangeExists(
  changeName: string | undefined,
  projectRoot: string
): Promise<string> {
  const changesPath = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes');

  // Get all change directories (not just those with proposal.md)
  const getAvailableChanges = async (): Promise<string[]> => {
    try {
      const entries = await fs.promises.readdir(changesPath, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory() && e.name !== 'archive' && !e.name.startsWith('.'))
        .map((e) => e.name);
    } catch {
      return [];
    }
  };

  if (!changeName) {
    const available = await getAvailableChanges();
    if (available.length === 0) {
      throw new Error('No changes found. Create one with: opsc new change <name>');
    }
    throw new Error(
      `Missing required option --change. Available changes:\n  ${available.join('\n  ')}`
    );
  }

  // Validate change name format to prevent path traversal
  const nameValidation = validateChangeName(changeName);
  if (!nameValidation.valid) {
    throw new Error(`Invalid change name '${changeName}': ${nameValidation.error}`);
  }

  // Check directory existence directly
  const changePath = path.join(changesPath, changeName);
  const exists = fs.existsSync(changePath) && fs.statSync(changePath).isDirectory();

  if (!exists) {
    const available = await getAvailableChanges();
    if (available.length === 0) {
      throw new Error(
        `Change '${changeName}' not found. No changes exist. Create one with: opsc new change <name>`
      );
    }
    throw new Error(
      `Change '${changeName}' not found. Available changes:\n  ${available.join('\n  ')}`
    );
  }

  return changeName;
}

/**
 * Validates that a schema exists and returns available schemas if not.
 *
 * @param schemaName - The schema name to validate
 * @param projectRoot - Optional project root for project-local schema resolution
 */
export function validateSchemaExists(schemaName: string, projectRoot?: string): string {
  const schemaDir = getSchemaDir(schemaName, projectRoot);
  if (!schemaDir) {
    const availableSchemas = listSchemas(projectRoot);
    throw new Error(
      `Schema '${schemaName}' not found. Available schemas:\n  ${availableSchemas.join('\n  ')}`
    );
  }
  return schemaName;
}

/**
 * Checks the refine phase gate before spec writing.
 *
 * - 'ok': refine.md exists, proceed
 * - 'blocked': refine.md missing for a tracking-ID change (mandatory refinement)
 * - 'warning': refine.md missing for a legacy kebab-case change (exempt, warn only)
 */
export function checkRefineGate(projectRoot: string, changeName: string): 'ok' | 'blocked' | 'warning' {
  const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
  if (fs.existsSync(path.join(changeDir, 'refine.md'))) {
    return 'ok';
  }
  if (changeName.startsWith('f')) {
    return 'blocked';
  }
  return 'warning';
}

/**
 * Resolves the change scale (large/small) after the refine phase.
 *
 * - Reads metadata `size` if already set (no re-prompt).
 * - Returns undefined when refine.md is missing or in non-interactive mode
 *   (agent decides in the skill layer).
 * - Prompts the user for forced confirmation in interactive mode.
 */
export async function ensureChangeSize(
  projectRoot: string,
  changeName: string
): Promise<'large' | 'small' | undefined> {
  const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
  const { readChangeMetadata, writeChangeMetadata } = await import('./utils/change-metadata.js');

  const existing = readChangeMetadata(changeDir, projectRoot);
  if (existing?.size) {
    return existing.size;
  }

  // Size judgment happens only after refine completes
  if (!fs.existsSync(path.join(changeDir, 'refine.md'))) {
    return undefined;
  }

	if (!process.stdin.isTTY) {
		// Non-interactive mode: auto-detect from refine.md content
		const size = detectScaleFromRefine(changeDir);
		if (size) {
			const base = existing ?? { schema: 'spec-driven' };
			writeChangeMetadata(changeDir, { ...base, size }, projectRoot);
		}
		return size;
	}

	const { confirm } = await import('@inquirer/prompts');
	const confirmed = await confirm({
		message: '此变更是复杂需求吗？（是=拆分子能力 c1-<描述>/c2-<描述>…，否=简单需求四件套放根目录）',
		default: true,
	});
	const size: 'large' | 'small' = confirmed ? 'large' : 'small';

	const base = existing ?? { schema: 'spec-driven' };
	writeChangeMetadata(changeDir, { ...base, size }, projectRoot);
	return size;
}

/**
 * Auto-detect change scale from refine.md when non-interactive.
 * Counts functional items under "## 功能细节" section.
 * >= 3 items → 'large', otherwise → 'small'.
 */
function detectScaleFromRefine(changeDir: string): 'large' | 'small' {
	const refinePath = path.join(changeDir, 'refine.md');
	if (!fs.existsSync(refinePath)) return 'small';

	try {
		const content = fs.readFileSync(refinePath, 'utf-8');
		const match = content.match(/##\s*功能细节\s*\n([\s\S]*?)(?=\n##|\n*$)/);
		if (!match) return 'small';

		const section = match[1];
		const items = section.split('\n').filter(line => /^\s*-\s+/.test(line) && line.trim().length > 3);
		return items.length >= 3 ? 'large' : 'small';
	} catch {
		return 'small';
	}
}

/**
 * Auto-detect change scale from proposal.md (for backfill after proposal created).
 * Counts capability items under "### New Capabilities" section.
 */
export function detectScaleFromProposal(changeDir: string): 'large' | 'small' | undefined {
	const proposalPath = path.join(changeDir, 'proposal.md');
	if (!fs.existsSync(proposalPath)) return undefined;

	try {
		const content = fs.readFileSync(proposalPath, 'utf-8');
		if (/推进结论[：:]\s*复杂需求/.test(content)) return 'large';
		if (/推进结论[：:]\s*简单需求/.test(content)) return 'small';

		const match = content.match(/###\s*New\s+Capabilities\s*\n([\s\S]*?)(?=\n###|\n##\s|$)/)
			?? content.match(/##\s*Capabilities\s*\n([\s\S]*?)(?=\n##\s|$)/);
		if (!match) return undefined;

		const section = match[1];
		const items = section.split('\n').filter(line => /^\s*-\s+/.test(line) && line.trim().length > 3);
		return items.length >= 3 ? 'large' : 'small';
	} catch {
		return undefined;
	}
}
