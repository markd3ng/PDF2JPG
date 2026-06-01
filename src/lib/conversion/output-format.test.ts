import { describe, expect, it } from "vitest";
import { DEFAULT_OUTPUT_FORMAT, OUTPUT_FORMATS, buildImageName, getOutputFormatConfig } from "@/lib/conversion/output-format";

describe("output format metadata", () => {
  it("defaults to JPG", () => {
    expect(DEFAULT_OUTPUT_FORMAT).toBe("jpg");
  });

  it("includes JPG, PNG, WebP, and BMP options", () => {
    expect(OUTPUT_FORMATS.map((format) => format.value)).toEqual(["jpg", "png", "webp", "bmp"]);
    expect(OUTPUT_FORMATS.map((format) => format.label)).toEqual(["JPG", "PNG", "WebP", "BMP"]);
  });

  it("maps each option to an export MIME type and extension", () => {
    expect(getOutputFormatConfig("jpg")).toMatchObject({ mimeType: "image/jpeg", extension: "jpg", supportsQuality: true });
    expect(getOutputFormatConfig("png")).toMatchObject({ mimeType: "image/png", extension: "png", supportsQuality: false });
    expect(getOutputFormatConfig("webp")).toMatchObject({ mimeType: "image/webp", extension: "webp", supportsQuality: true });
    expect(getOutputFormatConfig("bmp")).toMatchObject({ mimeType: "image/bmp", extension: "bmp", supportsQuality: false });
  });
});

describe("buildImageName", () => {
  it("uses the selected output extension", () => {
    expect(buildImageName("Quarterly Report.pdf", 1, "jpg")).toBe("Quarterly-Report-p001.jpg");
    expect(buildImageName("Quarterly Report.pdf", 12, "png")).toBe("Quarterly-Report-p012.png");
    expect(buildImageName("Quarterly Report.pdf", 123, "webp")).toBe("Quarterly-Report-p123.webp");
    expect(buildImageName("Quarterly Report.pdf", 2, "bmp")).toBe("Quarterly-Report-p002.bmp");
  });
});
