/** Escapes user input so it can be used safely inside a RegExp. */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Builds a case-insensitive "contains" regex from a search query. */
export function buildSearchRegex(query: string): RegExp {
  return new RegExp(escapeRegExp(query.trim()), 'i');
}
