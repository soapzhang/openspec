/**
 * Status Command
 *
 * Displays artifact completion status for a change.
 */

import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import {
  loadChangeContext,
  formatChangeStatus,
  parseProgressTable,
  type ChangeStatus,
} from '../../core/artifact-graph/index.js';
import {
  validateChangeExists,
  validateSchemaExists,
  getStatusIndicator,
  getStatusColor,
} from './shared.js';
import { readChangeMetadata } from '../../utils/change-metadata.js';
import { OPENSPEC_DIR_NAME } from '../../core/config.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface StatusOptions {
  change?: string;
  schema?: string;
  json?: boolean;
}

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

export async function statusCommand(options: StatusOptions): Promise<void> {
  const spinner = ora('Loading change status...').start();

  try {
    const projectRoot = process.cwd();
    const changeName = await validateChangeExists(options.change, projectRoot);

    // Validate schema if explicitly provided
    if (options.schema) {
      validateSchemaExists(options.schema, projectRoot);
    }

    // loadChangeContext will auto-detect schema from metadata if not provided
    const context = loadChangeContext(projectRoot, changeName, options.schema);
    const status = formatChangeStatus(context);

    spinner.stop();

    // JSON output
    if (options.json) {
      // Large mode: inject progress table into JSON
      const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
      const metadata = readChangeMetadata(changeDir, projectRoot);
      if (metadata?.size === 'large') {
        const rows = parseProgressTable(changeDir);
        if (rows) {
          const output = {
            ...status,
            scale: 'large',
            progressTable: rows.map(r => ({
              id: r.cN,
              spec: r.spec,
              design: r.design,
              tasks: r.tasks,
            })),
          };
          console.log(JSON.stringify(output, null, 2));
          return;
        }
      }
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    // Large mode: display progress table
    const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', changeName);
    const metadata = readChangeMetadata(changeDir, projectRoot);
    if (metadata?.size === 'large') {
      const rows = parseProgressTable(changeDir);
      if (rows) {
        console.log(`Change: ${changeName} (复杂需求)`);
        console.log();
        printProgressTable(rows);
        return;
      }
    }

    printStatusText(status);
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

export function printStatusText(status: ChangeStatus): void {
  const doneCount = status.artifacts.filter((a) => a.status === 'done').length;
  const total = status.artifacts.length;

  console.log(`Change: ${status.changeName}`);
  console.log(`Schema: ${status.schemaName}`);
  console.log(`Progress: ${doneCount}/${total} artifacts complete`);
  console.log();

  for (const artifact of status.artifacts) {
    const indicator = getStatusIndicator(artifact.status);
    const color = getStatusColor(artifact.status);
    let line = `${indicator} ${artifact.id}`;

    if (artifact.status === 'blocked' && artifact.missingDeps && artifact.missingDeps.length > 0) {
      line += color(` (blocked by: ${artifact.missingDeps.join(', ')})`);
    }

    console.log(line);
  }

  if (status.isComplete) {
    console.log();
    console.log(chalk.green('All artifacts complete!'));
  }
}

function printProgressTable(rows: { cN: string; spec: boolean; design: boolean; tasks: boolean }[]): void {
  const check = (v: boolean) => v ? '✅' : '⬜';
  console.log('| 编号 | spec | design | tasks |');
  console.log('|------|------|--------|-------|');
  for (const r of rows) {
    console.log(`| ${r.cN} | ${check(r.spec)} | ${check(r.design)} | ${check(r.tasks)} |`);
  }
}
