import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';

const TASK_PATTERN = /^[-*]\s+\[[\sx]\]/i;
const COMPLETED_TASK_PATTERN = /^[-*]\s+\[x\]/i;

export interface TaskProgress {
  total: number;
  completed: number;
}

export function countTasksFromContent(content: string): TaskProgress {
  const lines = content.split('\n');
  let total = 0;
  let completed = 0;
  for (const line of lines) {
    if (line.match(TASK_PATTERN)) {
      total++;
      if (line.match(COMPLETED_TASK_PATTERN)) {
        completed++;
      }
    }
  }
  return { total, completed };
}

export async function getTaskProgressForChange(changesDir: string, changeName: string): Promise<TaskProgress> {
  const changeDir = path.join(changesDir, changeName);
  const taskFiles = new Set<string>();

  // Root-level tasks.md (small mode)
  taskFiles.add(path.join(changeDir, 'tasks.md'));

  // Sub-capability tasks (large mode): cN-<capability>/tasks.md
  try {
    const matches = await fg('c[0-9]-*/tasks.md', { cwd: changeDir, onlyFiles: true });
    for (const m of matches) {
      taskFiles.add(path.join(changeDir, m));
    }
  } catch {
    // ignore glob errors
  }

  let total = 0;
  let completed = 0;
  for (const taskFile of taskFiles) {
    try {
      const content = await fs.readFile(taskFile, 'utf-8');
      const progress = countTasksFromContent(content);
      total += progress.total;
      completed += progress.completed;
    } catch {
      // file missing — skip
    }
  }
  return { total, completed };
}

export function formatTaskStatus(progress: TaskProgress): string {
  if (progress.total === 0) return 'No tasks';
  if (progress.completed === progress.total) return '✓ Complete';
  return `${progress.completed}/${progress.total} tasks`;
}


