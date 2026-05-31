export type TaskStatus = "pending" | "processing" | "done" | "error";

export type DpiPreset = "72" | "150" | "300";

export interface ConvertedImage {
  id: string;
  fileName: string;
  page: number;
  blob: Blob;
  url: string;
  byteLength: number;
}

export interface ConversionTask {
  id: string;
  file: File;
  status: TaskStatus;
  progress: number;
  pageCount: number;
  donePages: number;
  images: ConvertedImage[];
  errorMessage?: string;
}

export interface WorkerProgressMessage {
  type: "progress";
  requestId: string;
  page: number;
  pageCount: number;
}
