import path from "node:path";

// Test-only resolver: the app imports sibling modules without an extension
// ("./content-lists"), which Next's bundler resolves but plain Node does not.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    if (error?.code === "ERR_MODULE_NOT_FOUND" && relative && !path.extname(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    throw error;
  }
}
