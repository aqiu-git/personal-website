export const getDownloadHref = (url: string | null | undefined, filename: string) => {
  if (!url) {
    return undefined;
  }

  const safeFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const params = new URLSearchParams({
    url,
    filename: `${safeFilename || "download"}.jpg`
  });

  return `/api/download?${params.toString()}`;
};
