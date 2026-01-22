export function isStorageVideoPath(value?: string | null) {
  return Boolean(value && !value.startsWith("http") && value.includes("/"));
}

export async function fetchSignedVideoUrl(path: string) {
  const response = await fetch(
    `/api/videos/signed-url?path=${encodeURIComponent(path)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch signed video URL");
  }

  const data = await response.json();
  return data.url as string | undefined;
}
