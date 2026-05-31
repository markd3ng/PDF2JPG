// @vitest-environment jsdom

import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConvertedImage } from "@/lib/types";
import { exportAsZip } from "./zip-export";

function createImage(fileName: string, body: string): ConvertedImage {
  return {
    id: `${fileName}-${body}`,
    fileName,
    page: 1,
    blob: new Blob([body], { type: "image/jpeg" }),
    byteLength: body.length,
    url: `blob:${fileName}`
  };
}

describe("exportAsZip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps duplicate image names as separate zip entries", async () => {
    const downloadedBlobs: Blob[] = [];
    const originalUrl = globalThis.URL;

    vi.stubGlobal("URL", {
      ...originalUrl,
      createObjectURL: vi.fn((blob: Blob) => {
        downloadedBlobs.push(blob);
        return "blob:download";
      }),
      revokeObjectURL: vi.fn()
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    await exportAsZip([createImage("same-name-p001.jpg", "first"), createImage("same-name-p001.jpg", "second")]);

    const zip = await JSZip.loadAsync(downloadedBlobs[0]);
    expect(Object.keys(zip.files).sort()).toEqual(["same-name-p001 (2).jpg", "same-name-p001.jpg"]);
  });
});
