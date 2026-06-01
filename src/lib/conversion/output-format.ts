import type { OutputFormat } from "@/lib/types";

export interface OutputFormatConfig {
  value: OutputFormat;
  label: string;
  mimeType: string;
  extension: string;
  supportsQuality: boolean;
}

export const DEFAULT_OUTPUT_FORMAT: OutputFormat = "jpg";

export const OUTPUT_FORMATS: OutputFormatConfig[] = [
  {
    value: "jpg",
    label: "JPG",
    mimeType: "image/jpeg",
    extension: "jpg",
    supportsQuality: true
  },
  {
    value: "png",
    label: "PNG",
    mimeType: "image/png",
    extension: "png",
    supportsQuality: false
  },
  {
    value: "webp",
    label: "WebP",
    mimeType: "image/webp",
    extension: "webp",
    supportsQuality: true
  },
  {
    value: "bmp",
    label: "BMP",
    mimeType: "image/bmp",
    extension: "bmp",
    supportsQuality: false
  }
];

const OUTPUT_FORMAT_MAP = Object.fromEntries(OUTPUT_FORMATS.map((format) => [format.value, format])) as Record<
  OutputFormat,
  OutputFormatConfig
>;

export function getOutputFormatConfig(format: OutputFormat) {
  return OUTPUT_FORMAT_MAP[format];
}

export function buildImageName(fileName: string, pageNumber: number, format: OutputFormat) {
  const base = fileName.replace(/\.pdf$/i, "").replace(/\s+/g, "-");
  const extension = getOutputFormatConfig(format).extension;
  return `${base}-p${String(pageNumber).padStart(3, "0")}.${extension}`;
}
