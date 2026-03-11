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

export interface WorkerConvertRequest {
  type: "convert";
  requestId: string;
  fileName: string;
  arrayBuffer: ArrayBuffer;
  scale: number;
  quality: number;
}

export interface WorkerPageMessage {
  type: "page";
  requestId: string;
  fileName: string;
  page: number;
  pageCount: number;
  imageName: string;
  imageBuffer: ArrayBuffer;
}

export interface WorkerProgressMessage {
  type: "progress";
  requestId: string;
  page: number;
  pageCount: number;
}

export interface WorkerDoneMessage {
  type: "done";
  requestId: string;
  fileName: string;
  pageCount: number;
}

export interface WorkerErrorMessage {
  type: "error";
  requestId: string;
  fileName: string;
  message: string;
}

export type WorkerResponseMessage =
  | WorkerPageMessage
  | WorkerProgressMessage
  | WorkerDoneMessage
  | WorkerErrorMessage;
