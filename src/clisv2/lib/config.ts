export const OPENSPEC_DIR_NAME = 'openspec++';

export const OPENSPEC_MARKERS = {
  start: '<!-- OPENSPEC:START -->',
  end: '<!-- OPENSPEC:END -->'
};

export interface OpenSpecConfig {
  aiTools: string[];
}

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  successLabel?: string;
  skillsDir?: string; // e.g., '.claude' - /skills suffix per Agent Skills spec
}

export const AI_TOOLS: AIToolOption[] = [
  { name: 'Amazon Q Developer', value: 'amazon-q', available: false, successLabel: 'Amazon Q Developer', skillsDir: '.amazonq' },
  { name: 'Antigravity', value: 'antigravity', available: false, successLabel: 'Antigravity', skillsDir: '.agent' },
  { name: 'Auggie (Augment CLI)', value: 'auggie', available: false, successLabel: 'Auggie', skillsDir: '.augment' },
  { name: 'Claude Code', value: 'claude', available: true, successLabel: 'Claude Code', skillsDir: '.claude' },
  { name: 'Cline', value: 'cline', available: false, successLabel: 'Cline', skillsDir: '.cline' },
  { name: 'Codex', value: 'codex', available: false, successLabel: 'Codex', skillsDir: '.codex' },
  { name: 'CodeBuddy Code (CLI)', value: 'codebuddy', available: false, successLabel: 'CodeBuddy Code', skillsDir: '.codebuddy' },
  { name: 'Continue', value: 'continue', available: false, successLabel: 'Continue (VS Code / JetBrains / Cli)', skillsDir: '.continue' },
  { name: 'CoStrict', value: 'costrict', available: false, successLabel: 'CoStrict', skillsDir: '.cospec' },
  { name: 'Crush', value: 'crush', available: false, successLabel: 'Crush', skillsDir: '.crush' },
  { name: 'Cursor', value: 'cursor', available: false, successLabel: 'Cursor', skillsDir: '.cursor' },
  { name: 'Factory Droid', value: 'factory', available: false, successLabel: 'Factory Droid', skillsDir: '.factory' },
  { name: 'Gemini CLI', value: 'gemini', available: false, successLabel: 'Gemini CLI', skillsDir: '.gemini' },
  { name: 'GitHub Copilot', value: 'github-copilot', available: false, successLabel: 'GitHub Copilot', skillsDir: '.github' },
  { name: 'iFlow', value: 'iflow', available: false, successLabel: 'iFlow', skillsDir: '.iflow' },
  { name: 'Kilo Code', value: 'kilocode', available: false, successLabel: 'Kilo Code', skillsDir: '.kilocode' },
  { name: 'OpenCode', value: 'opencode', available: false, successLabel: 'OpenCode', skillsDir: '.opencode' },
  { name: 'Qoder', value: 'qoder', available: false, successLabel: 'Qoder', skillsDir: '.qoder' },
  { name: 'Qwen Code', value: 'qwen', available: false, successLabel: 'Qwen Code', skillsDir: '.qwen' },
  { name: 'RooCode', value: 'roocode', available: false, successLabel: 'RooCode', skillsDir: '.roo' },
  { name: 'Trae', value: 'trae', available: false, successLabel: 'Trae', skillsDir: '.trae' },
  { name: 'Windsurf', value: 'windsurf', available: false, successLabel: 'Windsurf', skillsDir: '.windsurf' },
  { name: 'AGENTS.md (works with Amp, VS Code, …)', value: 'agents', available: false, successLabel: 'your AGENTS.md-compatible assistant' }
];
