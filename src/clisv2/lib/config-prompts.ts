import { stringify } from 'yaml';
import type { ProjectConfig } from './project-config.js';

/**
 * Serialize config to YAML string.
 *
 * @param config - Partial config object (schema required, context/rules optional)
 * @returns YAML string ready to write to file
 */
export function serializeConfig(config: Partial<ProjectConfig>): string {
  const out: Record<string, unknown> = {};

  if (config.schema) {
    out.schema = config.schema;
  }
  if (config.context !== undefined) {
    out.context = config.context;
  }
  if (config.rules !== undefined && Object.keys(config.rules).length > 0) {
    out.rules = config.rules;
  }

  const yaml = stringify(out);

  // Append helpful comments when schema is the only field present (fresh init).
  if (out.context === undefined && out.rules === undefined) {
    return (
      yaml +
      '\n' +
      [
        '# Project context (optional)',
        '# This is shown to AI when creating artifacts.',
        '# Add your tech stack, conventions, style guides, domain knowledge, etc.',
        '# Example:',
        '#   context: |',
        '#     Tech stack: TypeScript, React, Node.js',
        '#     We use conventional commits',
        '#     Domain: e-commerce platform',
        '',
        '# Per-artifact rules (optional)',
        '# Add custom rules for specific artifacts.',
        '# Example:',
        '#   rules:',
        '#     proposal:',
        '#       - Keep proposals under 500 words',
        '#       - Always include a "Non-goals" section',
        '#     tasks:',
        '#       - Break tasks into chunks of max 2 hours',
      ].join('\n') +
      '\n'
    );
  }

  return yaml;
}
