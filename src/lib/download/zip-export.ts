import JSZip from "jszip";
import type { ConvertedImage } from "@/lib/types";
import { downloadBlob } from "@/lib/download/file-download";

export function buildZipName() {
  const stamp = new Date().toISOString().replace(/[.:]/g, "-");
  return `pdf2jpg-${stamp}.zip`;
}

export function exportAsZip(images: ConvertedImage[]) {
  const zip = new JSZip();
  images.forEach((image) => {
    zip.file(image.fileName, image.blob);
  });

  return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }).then((blob) => {
    const zipName = buildZipName();
    downloadBlob(blob, zipName);
    return zipName;
  });
}
