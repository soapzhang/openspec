import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { serializeConfig } from './lib/config-prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'template', 'claude-code');
const SKILLS_DIR = '.claude/skills';
const DEFAULT_SCHEMA = 'spec-driven';

export async function initCommand(targetPath: string): Promise<void> {
  const projectPath = path.resolve(targetPath);
  const openspecPath = path.join(projectPath, 'openspec++');

  // 1. Create project and openspec++ directory structure
  await fs.mkdir(projectPath, { recursive: true });
  for (const dir of [
    openspecPath,
    path.join(openspecPath, 'specs'),
    path.join(openspecPath, 'changes'),
    path.join(openspecPath, 'changes', 'archive'),
  ]) {
    await fs.mkdir(dir, { recursive: true });
  }

  // 2. Copy skill templates to .claude/skills
  const entries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
  const skillDirs = entries.filter((e) => e.isDirectory());
  const skillsRoot = path.join(projectPath, SKILLS_DIR);

  for (const dir of skillDirs) {
    const src = path.join(TEMPLATES_DIR, dir.name);
    const dest = path.join(skillsRoot, dir.name);
    await fs.cp(src, dest, { recursive: true });
  }

  // 3. Write config.yaml (skip if config already exists)
  const configPath = path.join(openspecPath, 'config.yaml');
  const configYmlPath = path.join(openspecPath, 'config.yml');
  const configExists = (await fileExists(configPath)) || (await fileExists(configYmlPath));
  if (!configExists) {
    await fs.writeFile(configPath, serializeConfig({ schema: DEFAULT_SCHEMA }));
  }

  // 4. Report
  console.log();
  console.log('OpenSpec 设置完成');
  console.log(`${skillDirs.length} 个技能写入 ${SKILLS_DIR}/`);
  console.log(`目录：${openspecPath}`);
  console.log();
  console.log('快速开始：');
  console.log('  /opsc:new       开始新的变更');
  console.log('  /opsc:continue  创建下一个产物');
  console.log('  /opsc:apply     实施任务');
  console.log();
  console.log('重启 IDE 以使斜杠命令生效。');
  console.log();
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
