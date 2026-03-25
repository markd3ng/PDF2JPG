import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConversionTask, ConvertedImage, DpiPreset } from "@/lib/types";
import { PdfWorkerClient } from "@/lib/conversion/pdf-worker-client";
import { convertTaskFile, createTaskId, flattenImages, pagesToImages, revokeImages } from "@/lib/conversion/convert-service";
import { copyBlobToClipboard } from "@/lib/download/clipboard";
import { downloadImage } from "@/lib/download/file-download";
import { exportAsZip } from "@/lib/download/zip-export";
import { FileDropzone } from "@/components/file-dropzone";
import { DpiSelector } from "@/components/dpi-selector";
import { ProcessingList } from "@/components/processing-list";
import { ResultActions } from "@/components/result-actions";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

type NoticeTone = "info" | "success" | "error";

const NOTICE_STYLES: Record<NoticeTone, string> = {
  info: "border-slate-200 bg-white/80 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700"
};

export function ConverterApp() {
  const workerClientRef = useRef<PdfWorkerClient | null>(null);
  if (typeof window !== "undefined" && !workerClientRef.current) {
    workerClientRef.current = new PdfWorkerClient();
  }
  const workerClient = workerClientRef.current!;
  const [dpi, setDpi] = useState<DpiPreset>("150");
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [notice, setNotice] = useState<{ tone: NoticeTone; message: string } | null>(null);
  const taskRef = useRef<ConversionTask[]>([]);

  const pushNotice = useCallback((message: string, tone: NoticeTone = "info") => {
    setNotice({ tone, message });
  }, []);

  const commitTasks = useCallback((updater: (prev: ConversionTask[]) => ConversionTask[]) => {
    setTasks((prev) => {
      const next = updater(prev);
      taskRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    taskRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => {
      setNotice((current) => (current?.message === notice.message ? null : current));
    }, 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);

  useEffect(() => {
    return () => {
      const allImages = flattenImages(taskRef.current.map((task) => task.images));
      revokeImages(allImages);
      workerClient.terminate();
    };
  }, [workerClient]);

  const onFilesSelected = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE);
      if (validFiles.length !== files.length) {
        pushNotice("存在超过 50MB 的文件，已自动忽略。", "error");
      }
      if (validFiles.length === 0) {
        return;
      }

      const newTasks: ConversionTask[] = validFiles.map((file) => ({
        id: createTaskId(file),
        file,
        status: "pending",
        progress: 0,
        donePages: 0,
        pageCount: 0,
        images: []
      }));

      commitTasks((prev) => [...prev, ...newTasks]);
      pushNotice(`已加入 ${newTasks.length} 个文件，准备转换。`, "success");
    },
    [commitTasks, pushNotice]
  );

  const processTasks = useCallback(async () => {
    const queue = taskRef.current.filter((task) => task.status === "pending" || task.status === "error");
    if (queue.length === 0) {
      pushNotice("当前没有可执行任务。", "info");
      return;
    }

    setIsWorking(true);

    for (const queuedTask of queue) {
      commitTasks((prev) =>
        prev.map((task) =>
          task.id === queuedTask.id
            ? { ...task, status: "processing", progress: 1, donePages: 0, pageCount: task.pageCount || 1, errorMessage: undefined }
            : task
        )
      );

      const result = await convertTaskFile(queuedTask.file, dpi, workerClient, (currentPage, totalPages) => {
        commitTasks((prev) =>
          prev.map((task) =>
            task.id === queuedTask.id
              ? {
                  ...task,
                  donePages: currentPage,
                  pageCount: totalPages,
                  progress: (currentPage / totalPages) * 100
                }
              : task
          )
        );
      })
        .then((pages) => ({ ok: true as const, pages }))
        .catch((error: Error) => ({ ok: false as const, error }));

      if (result.ok) {
        const images = pagesToImages(queuedTask.id, result.pages);
        commitTasks((prev) =>
          prev.map((task) => {
            if (task.id !== queuedTask.id) {
              return task;
            }
            revokeImages(task.images);
            return {
              ...task,
              status: "done",
              donePages: images.length,
              pageCount: images.length,
              progress: 100,
              images,
              errorMessage: undefined
            };
          })
        );
      } else {
        const message = result.error.message || "转换失败，请检查 PDF 是否损坏或加密。";
        commitTasks((prev) =>
          prev.map((task) =>
            task.id === queuedTask.id
              ? {
                  ...task,
                  status: "error",
                  progress: 0,
                  donePages: 0,
                  pageCount: 0,
                  errorMessage: message
                }
              : task
          )
        );
        pushNotice(`${queuedTask.file.name} 转换失败`, "error");
      }
    }

    const allImages = flattenImages(taskRef.current.map((task) => task.images));
    if (allImages.length > 5) {
      exportAsZip(allImages)
        .then((zipName) => {
          pushNotice(`已自动打包并下载：${zipName}`, "success");
        })
        .catch((error) => {
          console.error("ZIP 打包失败", error);
          pushNotice("ZIP 打包失败，请稍后重试。", "error");
        });
    }

    setIsWorking(false);
    pushNotice("所有可执行任务已处理完成。", "success");
  }, [commitTasks, dpi, pushNotice, workerClient]);

  const allImages = useMemo(() => flattenImages(tasks.map((task) => task.images)), [tasks]);

  const handleDownloadAll = useCallback(() => {
    if (allImages.length === 0) {
      return;
    }

    // 单张图片直接下载，2张及以上打包为 ZIP
    if (allImages.length === 1) {
      downloadImage(allImages[0]);
      pushNotice(`已下载 ${allImages[0].fileName}`, "success");
      return;
    }

    exportAsZip(allImages)
      .then((zipName) => pushNotice(`已下载 ${zipName}`, "success"))
      .catch((error) => {
        console.error("ZIP 下载失败", error);
        pushNotice("ZIP 下载失败", "error");
      });
  }, [allImages, pushNotice]);

  const handleCopy = useCallback(
    (image: ConvertedImage) => {
      copyBlobToClipboard(image.blob).then((ok) => {
        if (ok) {
          pushNotice(`已复制：${image.fileName}`, "success");
        } else {
          pushNotice("复制失败，请检查浏览器权限。", "error");
        }
      });
    },
    [pushNotice]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">PDF2JPG</h1>
          <p className="text-sm text-slate-600">完全本地转换 · 无文件上传</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        {notice ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${NOTICE_STYLES[notice.tone]}`} role="status">
            {notice.message}
          </div>
        ) : null}

        {/* Google AdSense 广告框 */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-center text-sm text-slate-500 mb-2">广告</div>
          <div className="flex justify-center">
            {/* 这里是 Google AdSense 广告代码占位符 */}
            <div className="w-full max-w-md h-32 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-sm text-slate-400">Google AdSense 广告位</span>
            </div>
          </div>
        </div>

        <section className="grid gap-5">
          <div className="flex flex-col gap-5">
            <FileDropzone disabled={isWorking} onFiles={onFilesSelected}>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={processTasks}
                  disabled={isWorking || tasks.length === 0}
                  className="inline-flex w-fit items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-sky-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isWorking ? "处理中..." : "开始转换"}
                </button>
              </div>
            </FileDropzone>
            <DpiSelector value={dpi} onChange={setDpi} />
          </div>
          <ProcessingList tasks={tasks} />
        </section>

        <ResultActions
          images={allImages}
          onCopy={handleCopy}
          onDownload={downloadImage}
          onDownloadAll={handleDownloadAll}
        />
      </main>
    </div>
  );
}
