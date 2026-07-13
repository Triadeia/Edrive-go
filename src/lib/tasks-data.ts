/**
 * Compatibility entry point for older panel modules.
 * New code should import from `@/lib/tasks/workspace-*` directly.
 */
export { launchWorkspaceSeed as seedTasks } from "./tasks/workspace-seed";
export type { LaunchTask as EdriveTask, TaskPriority, TaskStatus } from "./tasks/workspace-schema";
