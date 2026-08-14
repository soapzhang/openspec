import * as fs from 'node:fs';
import * as path from 'node:path';
import fg from 'fast-glob';
import type { CompletedSet } from './types.js';
import type { ArtifactGraph } from './graph.js';
import { FileSystemUtils } from '../utils/file-system.js';
import { readChangeMetadata } from '../utils/change-metadata.js';

/**
 * Parsed row from proposal.md's ## 子能力进度 table.
 */
export interface ProgressRow {
  cN: string;
  spec: boolean;
  design: boolean;
  tasks: boolean;
}

/**
 * Parse the ## 子能力进度 table from proposal.md.
 * Returns null if no table found (simple mode or not yet created).
 */
export function parseProgressTable(changeDir: string): ProgressRow[] | null {
  const proposalPath = path.join(changeDir, 'proposal.md');
  if (!fs.existsSync(proposalPath)) return null;

  try {
    const content = fs.readFileSync(proposalPath, 'utf-8');
    const tableMatch = content.match(/## 子能力进度\s*\n[\s\S]*?\n\| c\d+/);
    if (!tableMatch) return null;

    // Find all table rows after "## 子能力进度"
    const afterHeader = content.split('## 子能力进度')[1];
    if (!afterHeader) return null;

    const rows: ProgressRow[] = [];
    const lines = afterHeader.split('\n');
    for (const line of lines) {
      const match = line.match(/^\|\s*(c\d+)\s*\|\s*([✅⬜])\s*\|\s*([✅⬜])\s*\|\s*([✅⬜])\s*\|/);
      if (match) {
        rows.push({
          cN: match[1],
          spec: match[2] === '✅',
          design: match[3] === '✅',
          tasks: match[4] === '✅',
        });
      }
    }
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

/**
 * Large-mode path mapping: root-level generates → sub-capability glob pattern.
 */
const LARGE_MODE_GENERATES: Record<string, string> = {
  'specs/**/*.md': 'c[0-9]-*/spec.md',
  'design.md': 'c[0-9]-*/design.md',
  'tasks.md': 'c[0-9]-*/tasks.md',
};

/**
 * Detects which artifacts are completed by checking file existence in the change directory.
 * Returns a Set of completed artifact IDs.
 *
 * @param graph - The artifact graph to check
 * @param changeDir - The change directory to scan for files
 * @returns Set of artifact IDs whose generated files exist
 */
export function detectCompleted(graph: ArtifactGraph, changeDir: string): CompletedSet {
  const completed = new Set<string>();

  // Handle missing change directory gracefully
  if (!fs.existsSync(changeDir)) {
    return completed;
  }

  // Check if large mode
  const metadata = readChangeMetadata(changeDir);
  const isLarge = metadata?.size === 'large';

  for (const artifact of graph.getAllArtifacts()) {
    const generates = isLarge
      ? (LARGE_MODE_GENERATES[artifact.generates] ?? artifact.generates)
      : artifact.generates;

    // File existence check
    if (!isArtifactComplete(generates, changeDir)) continue;

    // Large mode: also check progress table
    if (isLarge) {
      const rows = parseProgressTable(changeDir);
      if (!rows) continue;

      const colMap: Record<string, keyof ProgressRow> = {
        'specs/**/*.md': 'spec',
        'design.md': 'design',
        'tasks.md': 'tasks',
      };
      const col = colMap[artifact.generates] as keyof ProgressRow | undefined;
      if (col && !rows.every(r => r[col])) continue;
    }

    completed.add(artifact.id);
  }

  return completed;
}

/**
 * Checks if an artifact is complete by checking if its generated file(s) exist.
 * Supports both simple paths and glob patterns.
 */
function isArtifactComplete(generates: string, changeDir: string): boolean {
  const fullPattern = path.join(changeDir, generates);

  // Check if it's a glob pattern
  if (isGlobPattern(generates)) {
    return hasGlobMatches(fullPattern);
  }

  // Simple file path - check if file exists
  return fs.existsSync(fullPattern);
}

/**
 * Checks if a path contains glob pattern characters.
 */
function isGlobPattern(pattern: string): boolean {
  return pattern.includes('*') || pattern.includes('?') || pattern.includes('[');
}

/**
 * Checks if a glob pattern has any matches.
 * Normalizes Windows backslashes to forward slashes for cross-platform glob compatibility.
 */
function hasGlobMatches(pattern: string): boolean {
  const normalizedPattern = FileSystemUtils.toPosixPath(pattern);
  const matches = fg.sync(normalizedPattern, { onlyFiles: true });
  return matches.length > 0;
}
