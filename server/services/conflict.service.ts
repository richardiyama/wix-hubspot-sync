export function resolveConflict(wix: any, hubspot: any): "wix" | "hubspot" {
  if (!wix?.updatedAt) return "hubspot";
  if (!hubspot?.updatedAt) return "wix";

  return new Date(wix.updatedAt) > new Date(hubspot.updatedAt)
    ? "wix"
    : "hubspot";
}