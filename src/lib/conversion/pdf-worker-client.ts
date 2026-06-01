import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import { encodeCanvasToBmpBlob } from "@/lib/conversion/bmp-encoder";
import { buildImageName, getOutputFormatConfig } from "@/lib/conversion/output-format";
import type { OutputFormat, WorkerProgressMessage } from "@/lib/types";

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

  async convert(
    file: File,
    scale: number,
    quality: number,
    outputFormat: OutputFormat,
    onProgress?: (message: WorkerProgressMessage) => void
  ) {
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
          throw new Error("Unable to create a canvas rendering context.");
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

        const blob = await canvasToImageBlob(canvas, quality, outputFormat);
        pages.push({
          page: pageNumber,
          fileName: buildImageName(file.name, pageNumber, outputFormat),
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

function canvasToImageBlob(canvas: HTMLCanvasElement, quality: number, outputFormat: OutputFormat) {
  const format = getOutputFormatConfig(outputFormat);
  if (outputFormat === "bmp") {
    return Promise.resolve(encodeCanvasToBmpBlob(canvas));
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`${format.label} export is not supported by this browser.`));
          return;
        }
        if (blob.type !== format.mimeType) {
          reject(new Error(`${format.label} export is not supported by this browser.`));
          return;
        }
        resolve(blob);
      },
      format.mimeType,
      format.supportsQuality ? quality : undefined
    );
  });
}
