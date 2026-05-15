import { registerAllBuiltinFilters } from "./filters/index.js";

/**
 * Register all built-in filters
 * @param {import("./_renderer.js").TemplateRenderer} renderer
 */
export function registerBuiltinFilters(renderer) {
  registerAllBuiltinFilters(renderer);
}
