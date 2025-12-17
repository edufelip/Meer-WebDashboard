export function toStorageObjectUrl(uploadUrl: string): string {
  try {
    const url = new URL(uploadUrl);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return uploadUrl;
  }
}

