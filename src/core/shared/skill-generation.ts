/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getRefineSkillTemplate,
  getBugSkillTemplate,
  getGrillSkillTemplate,
  getOpscExploreCommandTemplate,
  getOpscNewCommandTemplate,
  getOpscRefineCommandTemplate,
  getOpscBugCommandTemplate,
  getOpscContinueCommandTemplate,
  getOpscApplyCommandTemplate,
  getOpscArchiveCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

/**
 * Skill template with directory name mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpscExploreCommandTemplate>;
  id: string;
}

/**
 * Gets all skill templates with their directory names.
 */
export function getSkillTemplates(): SkillTemplateEntry[] {
  return [
    { template: getExploreSkillTemplate(), dirName: 'opsc-explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'opsc-new' },
    { template: getRefineSkillTemplate(), dirName: 'opsc-refine' },
    { template: getContinueChangeSkillTemplate(), dirName: 'opsc-continue' },
    { template: getApplyChangeSkillTemplate(), dirName: 'opsc-apply' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'opsc-archive' },
    { template: getBugSkillTemplate(), dirName: 'opsc-bug' },
    { template: getGrillSkillTemplate(), dirName: 'opsc-grill' },
  ];
}

/**
 * Gets all command templates with their IDs.
 */
export function getCommandTemplates(): CommandTemplateEntry[] {
  return [
    { template: getOpscExploreCommandTemplate(), id: 'explore' },
    { template: getOpscNewCommandTemplate(), id: 'new' },
    { template: getOpscRefineCommandTemplate(), id: 'refine' },
    { template: getOpscContinueCommandTemplate(), id: 'continue' },
    { template: getOpscApplyCommandTemplate(), id: 'apply' },
    { template: getOpscArchiveCommandTemplate(), id: 'archive' },
    { template: getOpscBugCommandTemplate(), id: 'bug' },
  ];
}

/**
 * Converts command templates to CommandContent array.
 */
export function getCommandContents(): CommandContent[] {
  const commandTemplates = getCommandTemplates();
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The OpenSpec version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author || 'openspec'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
