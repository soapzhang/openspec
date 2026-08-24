import path from 'path';
import { promises as fs } from 'fs';
import { OPENSPEC_DIR_NAME } from './lib/config.js';
import { readChangeMetadata } from './lib/utils/change-metadata.js';
import { getTaskProgressForChange, formatTaskStatus } from './lib/utils/task-progress.js';

export interface ListOptions {
  json?: boolean;
}

export interface ChangeListItem {
  name: string;
  schema: string;
  status: string;
  taskStatus: string;
  lastModified: string;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const projectRoot = process.cwd();
  const changesPath = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes');

  let dirs: string[] = [];
  try {
    const entries = await fs.readdir(changesPath, { withFileTypes: true });
    dirs = entries
      .filter((e) => e.isDirectory() && e.name !== 'archive' && !e.name.startsWith('.'))
      .map((e) => e.name);
  } catch {
    // No changes directory yet
  }

  const items: ChangeListItem[] = [];

  for (const name of dirs) {
    const changeDir = path.join(changesPath, name);
    const metadata = readChangeMetadata(changeDir, projectRoot);
    let taskStatus = 'No tasks';
    try {
      const progress = await getTaskProgressForChange(changesPath, name);
      taskStatus = formatTaskStatus(progress);
    } catch {
      // ignore task read errors
    }

    let lastModified = '';
    try {
      const stat = await fs.stat(changeDir);
      lastModified = stat.mtime.toISOString();
    } catch {
      // ignore
    }

    items.push({
      name,
      schema: metadata?.schema ?? 'spec-driven',
      status: metadata?.status ?? 'unknown',
      taskStatus,
      lastModified,
    });
  }

  items.sort((a, b) => {
    if (!a.lastModified && !b.lastModified) return 0;
    if (!a.lastModified) return 1;
    if (!b.lastModified) return -1;
    return b.lastModified.localeCompare(a.lastModified);
  });

  if (options.json) {
    console.log(JSON.stringify(items, null, 2));
    return;
  }

  for (const item of items) {
    const mod = item.lastModified ? ` (${item.lastModified.slice(0, 19).replace('T', ' ')})` : '';
    console.log(`${item.name}  [${item.schema}]  status=${item.status}  ${item.taskStatus}${mod}`);
  }

  if (items.length === 0) {
    console.log('No changes found.');
  }
}
