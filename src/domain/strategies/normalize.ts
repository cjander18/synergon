// Canonical form for comparing contributed items: whitespace-collapsed,
// case-insensitive. The first-seen original spelling is what gets displayed.
export function normalizeItem(item: string): string {
  return item.trim().replace(/\s+/g, ' ').toLowerCase();
}
