type ParsedImage = {
  sourceUrl: string;
  bucket: string;
  path: string;
};

export function parseSupabaseUrls(urls: string[]): {
  images: ParsedImage[];
  invalids: string[];
} {
  const images: ParsedImage[] = [];
  const invalids: string[] = [];

  for (const sourceUrl of urls) {
    const match = sourceUrl.match(
      /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/,
    );
    if (!match) {
      invalids.push(sourceUrl);
      continue;
    }

    images.push({
      sourceUrl,
      bucket: match[1],
      path: match[2],
    });
  }

  return { images, invalids };
}
