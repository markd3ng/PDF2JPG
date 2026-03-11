import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import type { WorkerProgressMessage } from "@/lib/types";

export interface WorkerConvertedPage {
  page: number;
  fileName: string;
  blob: Blob;
}

export class PdfWorkerClient {
  private destroyed = false;
  private initialized = false;

  private ensureInitialized() {
    if (this.initialized || typeof window === "undefined") {
      return;
    }
    GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    this.initialized = true;
  }

  async convert(file: File, scale: number, quality: number, onProgress?: (message: WorkerProgressMessage) => void) {
    if (this.destroyed) {
      throw new Error("Renderer terminated");
    }

    this.ensureInitialized();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({
      data: arrayBuffer,
      disableStream: true,
      disableAutoFetch: true,
      useWorkerFetch: false,
      isEvalSupported: false
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const pages: WorkerConvertedPage[] = [];

    try {
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        if (this.destroyed) {
          throw new Error("Renderer terminated");
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) {
          throw new Error("无法创建画布上下文。");
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

        const blob = await canvasToJpegBlob(canvas, quality);
        pages.push({
          page: pageNumber,
          fileName: buildImageName(file.name, pageNumber),
          blob
        });

        onProgress?.({
          type: "progress",
          requestId: file.name,
          page: pageNumber,
          pageCount: totalPages
        });

        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      }

      return pages;
    } finally {
      pdf.cleanup();
      await pdf.destroy();
      await loadingTask.destroy();
    }
  }

  terminate() {
    this.destroyed = true;
  }
}

function buildImageName(fileName: string, pageNumber: number) {
  const base = fileName.replace(/\.pdf$/i, "").replace(/\s+/g, "-");
  return `${base}-p${String(pageNumber).padStart(3, "0")}.jpg`;
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("JPG 导出失败。"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}
