import { describe, expect, it, vi } from "vitest";
import type { ConvertedImage } from "@/lib/types";
import { downloadAllImages } from "@/lib/download/download-all";

function createImage(id: string): ConvertedImage {
  return {
    id,
    fileName: `${id}.jpg`,
    page: 1,
    blob: new Blob(["jpg"], { type: "image/jpeg" }),
    url: `blob:${id}`,
    byteLength: 3
  };
}

describe("downloadAllImages", () => {
  it("downloads a single image without loading the zip exporter", async () => {
    const downloadImage = vi.fn();
    const loadZipExporter = vi.fn();

    const result = await downloadAllImages([createImage("one")], {
      downloadImage,
      loadZipExporter
    });

    expect(result).toEqual({ type: "image", fileName: "one.jpg" });
    expect(downloadImage).toHaveBeenCalledTimes(1);
    expect(loadZipExporter).not.toHaveBeenCalled();
  });

  it("loads the zip exporter only when multiple images are downloaded", async () => {
    const downloadImage = vi.fn();
    const exportAsZip = vi.fn().mockResolvedValue("pdf2jpg.zip");
    const loadZipExporter = vi.fn().mockResolvedValue(exportAsZip);

    const result = await downloadAllImages([createImage("one"), createImage("two")], {
      downloadImage,
      loadZipExporter
    });

    expect(result).toEqual({ type: "zip", fileName: "pdf2jpg.zip" });
    expect(downloadImage).not.toHaveBeenCalled();
    expect(loadZipExporter).toHaveBeenCalledTimes(1);
    expect(exportAsZip).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: "one" })]));
  });
});
