/// <reference lib="webworker" />

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import type { WorkerConvertRequest } from "@/lib/types";

declare const self: DedicatedWorkerGlobalScope;

const workerScope = globalThis as typeof globalThis & {
  pdfjsWorker?: {
    WorkerMessageHandler: typeof WorkerMessageHandler;
  };
};

interface WorkerCanvasAndContext {
  canvas: OffscreenCanvas | null;
  context: OffscreenCanvasRenderingContext2D | null;
}

class WorkerCanvasFactory {
  constructor(_options?: { ownerDocument?: unknown; enableHWA?: boolean }) {}

  create(width: number, height: number): WorkerCanvasAndContext {
    if (width <= 0 || height <= 0) {
      throw new Error("无效的画布尺寸");
    }
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    if (!context) {
      throw new Error("无法创建离屏画布，请升级浏览器。");
    }
    return { canvas, context };
  }

  reset(target: WorkerCanvasAndContext, width: number, height: number) {
    if (!target.canvas) {
      throw new Error("Canvas is not specified");
    }
    target.canvas.width = width;
    target.canvas.height = height;
  }

  destroy(target: WorkerCanvasAndContext) {
    if (!target.canvas) {
      throw new Error("Canvas is not specified");
    }
    target.canvas.width = 0;
    target.canvas.height = 0;
    target.canvas = null;
    target.context = null;
  }
}

class WorkerFilterFactory {
  constructor(_options?: { docId?: string; ownerDocument?: unknown }) {}

  addFilter() {
    return "none";
  }

  addHCMFilter() {
    return "none";
  }

  addAlphaFilter() {
    return "none";
  }

  addLuminosityFilter() {
    return "none";
  }

  addHighlightHCMFilter() {
    return "none";
  }

  destroy() {}
}

workerScope.pdfjsWorker = { WorkerMessageHandler };

self.onmessage = (event: MessageEvent<WorkerConvertRequest>) => {
  const message = event.data;
  if (message.type !== "convert") {
    return;
  }

  convertPdfToJpg(message).catch((error: Error) => {
    console.error("PDF 渲染失败", error);
    self.postMessage({
      type: "error",
      requestId: message.requestId,
      fileName: message.fileName,
      message: error.message
    });
  });
};

async function convertPdfToJpg(request: WorkerConvertRequest) {
  const loadingTask = getDocument({
    data: request.arrayBuffer,
    disableStream: true,
    disableAutoFetch: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    isOffscreenCanvasSupported: true,
    isImageDecoderSupported: false,
    disableFontFace: true,
    useSystemFonts: false,
    CanvasFactory: WorkerCanvasFactory,
    FilterFactory: WorkerFilterFactory
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: request.scale });
    const canvas = new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error("无法创建离屏画布，请升级浏览器。");
    }

    context.save();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    await page.render({
      canvasContext: context,
      viewport,
      background: "rgb(255,255,255)"
    }).promise;

    const jpgBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: request.quality });
    const imageBuffer = await jpgBlob.arrayBuffer();
    const imageName = buildImageName(request.fileName, pageNumber);

    self.postMessage(
      {
        type: "page",
        requestId: request.requestId,
        fileName: request.fileName,
        page: pageNumber,
        pageCount: totalPages,
        imageName,
        imageBuffer
      },
      [imageBuffer]
    );

    self.postMessage({
      type: "progress",
      requestId: request.requestId,
      page: pageNumber,
      pageCount: totalPages
    });

    page.cleanup();
  }

  pdf.cleanup();
  await pdf.destroy();

  self.postMessage({
    type: "done",
    requestId: request.requestId,
    fileName: request.fileName,
    pageCount: totalPages
  });
}

function buildImageName(fileName: string, pageNumber: number) {
  const base = fileName.replace(/\.pdf$/i, "").replace(/\s+/g, "-");
  return `${base}-p${String(pageNumber).padStart(3, "0")}.jpg`;
}
