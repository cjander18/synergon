// Best-effort file download; returns false where Blob URLs are unavailable so
// callers can fall back to showing copyable text.
export function tryDownload(fileName: string, contents: string): boolean {
  try {
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
