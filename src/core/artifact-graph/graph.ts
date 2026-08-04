import type { Artifact, SchemaYaml, CompletedSet, BlockedArtifacts } from './types.js';
import { loadSchema, parseSchema } from './schema.js';

/**
 * Represents an artifact dependency graph.
 * Provides methods for querying build order, ready artifacts, and completion status.
 */
export class ArtifactGraph {
  private artifacts: Map<string, Artifact>;
  private schema: SchemaYaml;

  private constructor(schema: SchemaYaml) {
    this.schema = schema;
    this.artifacts = new Map(schema.artifacts.map(a => [a.id, a]));
  }

  /**
   * Creates an ArtifactGraph from a YAML file path.
   */
  static fromYaml(filePath: string): ArtifactGraph {
    const schema = loadSchema(filePath);
    return new ArtifactGraph(schema);
  }

  /**
   * Creates an ArtifactGraph from YAML content string.
   */
  static fromYamlContent(yamlContent: string): ArtifactGraph {
    const schema = parseSchema(yamlContent);
    return new ArtifactGraph(schema);
  }

  /**
   * Creates an ArtifactGraph from a pre-validated schema object.
   */
  static fromSchema(schema: SchemaYaml): ArtifactGraph {
    return new ArtifactGraph(schema);
  }

  /**
   * Gets a single artifact by ID.
   */
  getArtifact(id: string): Artifact | undefined {
    return this.artifacts.get(id);
  }

  /**
   * Gets all artifacts in the graph.
   */
  getAllArtifacts(): Artifact[] {
    return Array.from(this.artifacts.values());
  }

  /**
   * Gets the schema name.
   */
  getName(): string {
    return this.schema.name;
  }

  /**
   * Gets the schema version.
   */
  getVersion(): number {
    return this.schema.version;
  }

  /**
   * Computes the topological build order using Kahn's algorithm.
   * Returns artifact IDs in the order they should be built (schema declaration order for ties).
   */
  getBuildOrder(): string[] {
    const order = this.schema.artifacts.map((a) => a.id);
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    // Initialize all artifacts
    for (const artifact of this.artifacts.values()) {
      inDegree.set(artifact.id, artifact.requires.length);
      dependents.set(artifact.id, []);
    }

    // Build reverse adjacency (who depends on whom)
    for (const artifact of this.artifacts.values()) {
      for (const req of artifact.requires) {
        dependents.get(req)!.push(artifact.id);
      }
    }

    // Start with roots (in-degree 0), sorted by schema declaration order
    const queue = [...this.artifacts.keys()]
      .filter(id => inDegree.get(id) === 0)
      .sort((a, b) => order.indexOf(a) - order.indexOf(b));

    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      // Collect newly ready artifacts, then sort by schema declaration order before adding
      const newlyReady: string[] = [];
      for (const dep of dependents.get(current)!) {
        const newDegree = inDegree.get(dep)! - 1;
        inDegree.set(dep, newDegree);
        if (newDegree === 0) {
          newlyReady.push(dep);
        }
      }
      queue.push(...newlyReady.sort((a, b) => order.indexOf(a) - order.indexOf(b)));
    }

    return result;
  }

  /**
   * Gets artifacts that are ready to be created (all dependencies completed).
   * Ordered by schema declaration order (not alphabetical).
   */
  getNextArtifacts(completed: CompletedSet): string[] {
    const order = this.schema.artifacts.map((a) => a.id);
    const ready: string[] = [];

    for (const artifact of this.artifacts.values()) {
      if (completed.has(artifact.id)) {
        continue; // Already completed
      }

      const allDepsCompleted = artifact.requires.every(req => completed.has(req));
      if (allDepsCompleted) {
        ready.push(artifact.id);
      }
    }

    // Sort by schema declaration order for deterministic, meaningful ordering
    return ready.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }

  /**
   * Checks if all artifacts in the graph are completed.
   */
  isComplete(completed: CompletedSet): boolean {
    for (const artifact of this.artifacts.values()) {
      if (!completed.has(artifact.id)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets blocked artifacts and their unmet dependencies.
   */
  getBlocked(completed: CompletedSet): BlockedArtifacts {
    const blocked: BlockedArtifacts = {};

    for (const artifact of this.artifacts.values()) {
      if (completed.has(artifact.id)) {
        continue; // Already completed
      }

      const unmetDeps = artifact.requires.filter(req => !completed.has(req));
      if (unmetDeps.length > 0) {
        blocked[artifact.id] = unmetDeps.sort();
      }
    }

    return blocked;
  }
}
