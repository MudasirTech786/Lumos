export function createMetadata(title, description = "") {
  return {
    title,
    ...(description ? { description } : {}),
  };
}
