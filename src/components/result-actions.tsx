import { Download, Copy, Archive, Image as ImageIcon } from "lucide-react";
import type { ConvertedImage } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultActionsProps {
  images: ConvertedImage[];
  onCopy: (image: ConvertedImage) => void;
  onDownload: (image: ConvertedImage) => void;
  onDownloadAll: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function ResultActions({ images, onCopy, onDownload, onDownloadAll }: ResultActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>转换结果</CardTitle>
        <CardDescription>
          单页可直接复制或下载。2张及以上点击"下载全部"将打包为 ZIP 压缩包。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {images.length > 0 ? (
          <button
            type="button"
            onClick={onDownloadAll}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
          >
            <Archive className="h-4 w-4" />
            下载全部
          </button>
        ) : null}

        {images.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
            转换完成后，这里会展示每一页的 JPG 操作项。
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <article key={image.id} className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                <img src={image.url} alt={image.fileName} className="max-h-full max-w-full object-contain" loading="lazy" />
              </div>
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="truncate">{image.fileName}</span>
              </div>
              <p className="mb-3 text-xs text-slate-400">{formatSize(image.byteLength)}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onCopy(image)}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  复制
                </button>
                <button
                  type="button"
                  onClick={() => onDownload(image)}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  下载
                </button>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
