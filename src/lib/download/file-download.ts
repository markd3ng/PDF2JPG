import type { ConvertedImage } from "@/lib/types";

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadImage(image: ConvertedImage) {
  downloadBlob(image.blob, image.fileName);
}

export function revokeImageUrls(images: ConvertedImage[]) {
  images.forEach((image) => URL.revokeObjectURL(image.url));
}
