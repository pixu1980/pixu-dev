import { registerCollectionFilters } from "./_collections.js";
import { registerDateFilters } from "./_date.js";
import { registerHtmlFilters } from "./_html.js";
import { registerTextFilters } from "./_text.js";

function registerAllBuiltinFilters(renderer) {
  registerTextFilters(renderer);
  registerHtmlFilters(renderer);
  registerDateFilters(renderer);
  registerCollectionFilters(renderer);
}

export { registerAllBuiltinFilters };
