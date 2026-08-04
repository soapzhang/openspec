/**
 * Command Reference Utilities
 *
 * Utilities for transforming command references to tool-specific formats.
 */

/**
 * Transforms colon-based command references to hyphen-based format.
 * Converts `/opsc:` patterns to `/opsc-` for tools that use hyphen syntax.
 *
 * @param text - The text containing command references
 * @returns Text with command references transformed to hyphen format
 *
 * @example
 * transformToHyphenCommands('/opsc:new') // returns '/opsc-new'
 * transformToHyphenCommands('Use /opsc:apply to implement') // returns 'Use /opsc-apply to implement'
 */
export function transformToHyphenCommands(text: string): string {
  return text.replace(/\/opsc:/g, '/opsc-');
}
