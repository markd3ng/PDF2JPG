import type { DpiPreset } from "@/lib/types";

export interface DpiConfig {
  value: DpiPreset;
  label: string;
  description: string;
  scale: number;
  quality: number;
}

const BASE_DPI = 72;

export const DPI_OPTIONS: DpiConfig[] = [
  {
    value: "72",
    label: "72 DPI",
    description: "Draft · faster",
    scale: 72 / BASE_DPI,
    quality: 0.72
  },
  {
    value: "150",
    label: "150 DPI",
    description: "Standard · balanced",
    scale: 150 / BASE_DPI,
    quality: 0.85
  },
  {
    value: "300",
    label: "300 DPI",
    description: "High · sharper",
    scale: 300 / BASE_DPI,
    quality: 0.94
  }
];

export const DPI_MAP = Object.fromEntries(DPI_OPTIONS.map((item) => [item.value, item]));
