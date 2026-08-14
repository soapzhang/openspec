/**
 * Template exports for OpenSpec.
 *
 * The old config file templates (AGENTS.md, project.md, claude-template, etc.)
 * have been removed. The skill-based workflow uses skill-templates.ts directly.
 */

// Re-export skill templates for convenience
export {
  getExploreSkillTemplate,
  getRefineSkillTemplate,
  getBugSkillTemplate,
  getGrillSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getOpscExploreCommandTemplate,
  getOpscNewCommandTemplate,
  getOpscRefineCommandTemplate,
  getOpscBugCommandTemplate,
  getOpscContinueCommandTemplate,
  getOpscApplyCommandTemplate,
  getOpscArchiveCommandTemplate,
  getOpscFfCommandTemplate,
  getOpscSyncCommandTemplate,
  getOpscBulkArchiveCommandTemplate,
  getOpscVerifyCommandTemplate,
} from './skill-templates.js';
