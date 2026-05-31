import type { ConvertedImage } from "@/lib/types";
import { downloadImage as defaultDownloadImage } from "@/lib/download/file-download";

type ZipExporter = (images: ConvertedImage[]) => Promise<string>;

interface DownloadAllOptions {
  downloadImage?: (image: ConvertedImage) => void;
  loadZipExporter?: () => Promise<ZipExporter>;
}

type DownloadAllResult =
  | { type: "none" }
  | { type: "image"; fileName: string }
  | { type: "zip"; fileName: string };

export async function loadZipExporter(): Promise<ZipExporter> {
  const { exportAsZip } = await import("@/lib/download/zip-export");
  return exportAsZip;
}

export async function downloadAllImages(
  images: ConvertedImage[],
  options: DownloadAllOptions = {}
): Promise<DownloadAllResult> {
  if (images.length === 0) {
    return { type: "none" };
  }

  const downloadImage = options.downloadImage ?? defaultDownloadImage;

  if (images.length === 1) {
    downloadImage(images[0]);
    return { type: "image", fileName: images[0].fileName };
  }

  const exportAsZip = await (options.loadZipExporter ?? loadZipExporter)();
  const fileName = await exportAsZip(images);
  return { type: "zip", fileName };
}
