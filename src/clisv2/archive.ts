import { ArchiveCommand } from './lib/archive.js';

export interface ArchiveOptions {
  yes?: boolean;
  skipSpecs?: boolean;
  noValidate?: boolean;
  validate?: boolean;
}

export async function archiveCommand(changeName: string | undefined, options: ArchiveOptions = {}): Promise<void> {
  const cmd = new ArchiveCommand();
  await cmd.execute(changeName, options);
}
