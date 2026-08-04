import path from 'path';
import { FileSystemUtils } from './file-system.js';
import { writeChangeMetadata, validateSchemaName } from './change-metadata.js';
import { readProjectConfig } from '../core/project-config.js';
import { OPENSPEC_DIR_NAME } from '../core/config.js';

const DEFAULT_SCHEMA = 'spec-driven';

/**
 * Options for creating a change.
 */
export interface CreateChangeOptions {
  /** The workflow schema to use (default: 'spec-driven') */
  schema?: string;
}

/**
 * Result of creating a change.
 */
export interface CreateChangeResult {
  /** The schema that was actually used (resolved from options, config, or default) */
  schema: string;
}

/**
 * Result of validating a change name.
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that a change name follows kebab-case or tracking-ID conventions.
 *
 * Valid names:
 * - kebab-case: lowercase letters, numbers, hyphens (e.g., 'add-auth')
 * - tracking ID: `f<ID>-<description>` where ID is alphanumeric and
 *   description is non-empty and free of reserved path characters
 *   (e.g., 'f17085-login-refactor', 'f20260803-登录重构')
 *
 * @param name - The change name to validate
 * @returns Validation result with `valid: true` or `valid: false` with an error message
 *
 * @example
 * validateChangeName('add-auth') // { valid: true }
 * validateChangeName('f17085-login') // { valid: true }
 * validateChangeName('f20260803-登录重构') // { valid: true }
 * validateChangeName('Add-Auth') // { valid: false, error: '...' }
 */
export function validateChangeName(name: string): ValidationResult {
  // kebab-case pattern: starts with lowercase letter, followed by lowercase letters/numbers,
  // optionally followed by hyphen + lowercase letters/numbers (repeatable)
  const kebabCasePattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  // Tracking ID pattern: f<alphanumeric ID>-<non-empty description without reserved chars>
  const trackingIdPattern = /^f[A-Za-z0-9]+-.+$/;
  const reservedChars = /[\\/:*?"<>|]/;

  if (!name) {
    return { valid: false, error: 'Change name cannot be empty' };
  }

  if (trackingIdPattern.test(name)) {
    if (reservedChars.test(name)) {
      return { valid: false, error: 'Change name cannot contain reserved characters: \\ / : * ? " < > |' };
    }
    return { valid: true };
  }

  if (!kebabCasePattern.test(name)) {
    // Provide specific error messages for common mistakes
    if (/[A-Z]/.test(name)) {
      return { valid: false, error: 'Change name must be lowercase (use kebab-case)' };
    }
    if (/\s/.test(name)) {
      return { valid: false, error: 'Change name cannot contain spaces (use hyphens instead)' };
    }
    if (/_/.test(name)) {
      return { valid: false, error: 'Change name cannot contain underscores (use hyphens instead)' };
    }
    if (name.startsWith('-')) {
      return { valid: false, error: 'Change name cannot start with a hyphen' };
    }
    if (name.endsWith('-')) {
      return { valid: false, error: 'Change name cannot end with a hyphen' };
    }
    if (/--/.test(name)) {
      return { valid: false, error: 'Change name cannot contain consecutive hyphens' };
    }
    if (/[^a-z0-9-]/.test(name)) {
      return { valid: false, error: 'Change name can only contain lowercase letters, numbers, and hyphens (or use f<ID>-<描述> format)' };
    }
    if (/^[0-9]/.test(name)) {
      return { valid: false, error: 'Change name must start with a letter' };
    }

    return { valid: false, error: 'Change name must follow kebab-case convention (e.g., add-auth, refactor-db) or f<ID>-<描述> format (e.g., f17085-登录重构)' };
  }

  return { valid: true };
}

/**
 * Creates a new change directory with metadata file.
 *
 * @param projectRoot - The root directory of the project (where `openspec/` lives)
 * @param name - The change name (must be valid kebab-case)
 * @param options - Optional settings for the change
 * @throws Error if the change name is invalid
 * @throws Error if the schema name is invalid
 * @throws Error if the change directory already exists
 *
 * @returns Result containing the resolved schema name
 *
 * @example
 * // Creates openspec/changes/add-auth/ with default schema
 * const result = await createChange('/path/to/project', 'add-auth')
 * console.log(result.schema) // 'spec-driven' or value from config
 *
 * @example
 * // Creates openspec/changes/add-auth/ with custom schema
 * const result = await createChange('/path/to/project', 'add-auth', { schema: 'my-workflow' })
 * console.log(result.schema) // 'my-workflow'
 */
export async function createChange(
  projectRoot: string,
  name: string,
  options: CreateChangeOptions = {}
): Promise<CreateChangeResult> {
  // Validate the name first
  const validation = validateChangeName(name);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Determine schema: explicit option → project config → hardcoded default
  let schemaName: string;
  if (options.schema) {
    schemaName = options.schema;
  } else {
    // Try to read from project config
    try {
      const config = readProjectConfig(projectRoot);
      schemaName = config?.schema ?? DEFAULT_SCHEMA;
    } catch {
      // If config read fails, use default
      schemaName = DEFAULT_SCHEMA;
    }
  }

  // Validate the resolved schema
  validateSchemaName(schemaName, projectRoot);

  // Build the change directory path
  const changeDir = path.join(projectRoot, OPENSPEC_DIR_NAME, 'changes', name);

  // Check if change already exists
  if (await FileSystemUtils.directoryExists(changeDir)) {
    throw new Error(`Change '${name}' already exists at ${changeDir}`);
  }

  // Create the directory (including parent directories if needed)
  await FileSystemUtils.createDirectory(changeDir);

  // Initialize bugs/ directory for bug tracking
  await FileSystemUtils.createDirectory(path.join(changeDir, 'bugs'));

  // Write metadata file with schema and creation date
  const today = new Date().toISOString().split('T')[0];
  writeChangeMetadata(changeDir, {
    schema: schemaName,
    created: today,
  }, projectRoot);

  return { schema: schemaName };
}
