import { DPI_MAP } from "@/lib/conversion/dpi";
import type { ConvertedImage, DpiPreset } from "@/lib/types";
import { PdfWorkerClient } from "@/lib/conversion/pdf-worker-client";

export function createTaskId(file: File) {
  return `${file.name}-${file.size}-${crypto.randomUUID()}`;
}

export function convertTaskFile(
  file: File,
  dpiPreset: DpiPreset,
  workerClient: PdfWorkerClient,
  onProgress?: (currentPage: number, totalPages: number) => void
) {
  const dpi = DPI_MAP[dpiPreset];
  return workerClient.convert(file, dpi.scale, dpi.quality, (message) => {
    onProgress?.(message.page, message.pageCount);
  });
}

export function pagesToImages(taskId: string, pages: Array<{ page: number; fileName: string; blob: Blob }>): ConvertedImage[] {
  return pages.map((pageData) => ({
    id: `${taskId}-${pageData.page}`,
    page: pageData.page,
    fileName: pageData.fileName,
    blob: pageData.blob,
    byteLength: pageData.blob.size,
    url: URL.createObjectURL(pageData.blob)
  }));
}

export function revokeImages(images: ConvertedImage[]) {
  images.forEach((image) => URL.revokeObjectURL(image.url));
}

export function flattenImages(taskImages: ConvertedImage[][]) {
  return taskImages.flatMap((images) => images);
}
