import JSZip from "jszip";
import type { ConvertedImage } from "@/lib/types";
import { downloadBlob } from "@/lib/download/file-download";

export function buildZipName() {
  const stamp = new Date().toISOString().replace(/[.:]/g, "-");
  return `pdf2jpg-${stamp}.zip`;
}

export async function exportAsZip(images: ConvertedImage[]) {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  images.forEach((image) => {
    zip.file(uniqueZipEntryName(image.fileName, usedNames), image.blob);
  });

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const zipName = buildZipName();
  downloadBlob(blob, zipName);
  return zipName;
}

function uniqueZipEntryName(fileName: string, usedNames: Set<string>) {
  if (!usedNames.has(fileName)) {
    usedNames.add(fileName);
    return fileName;
  }

  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const extension = dotIndex > 0 ? fileName.slice(dotIndex) : "";
  let suffix = 2;
  let candidate = `${baseName} (${suffix})${extension}`;

  while (usedNames.has(candidate)) {
    suffix += 1;
    candidate = `${baseName} (${suffix})${extension}`;
  }

  usedNames.add(candidate);
  return candidate;
}
