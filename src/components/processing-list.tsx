import { FileText, CircleCheckBig, LoaderCircle, OctagonAlert } from "lucide-react";
import type { ConversionTask } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProcessingListProps {
  tasks: ConversionTask[];
}

const STATUS_TEXT: Record<ConversionTask["status"], string> = {
  pending: "待处理",
  processing: "处理中",
  done: "完成",
  error: "失败"
};

export function ProcessingList({ tasks }: ProcessingListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>任务队列</CardTitle>
        <CardDescription>实时展示每个文件的处理进度与状态。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
            还没有任务。请拖入 PDF 文件开始转换。
          </p>
        ) : null}
        {tasks.map((task) => (
          <article key={task.id} className="rounded-xl border border-slate-200 bg-white/75 p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                <p className="truncate text-sm font-medium text-slate-800">{task.file.name}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold">
                {task.status === "processing" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue-500" /> : null}
                {task.status === "done" ? <CircleCheckBig className="h-3.5 w-3.5 text-emerald-500" /> : null}
                {task.status === "error" ? <OctagonAlert className="h-3.5 w-3.5 text-red-500" /> : null}
                <span>{STATUS_TEXT[task.status]}</span>
              </div>
            </div>
            <Progress value={task.progress} />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                {task.donePages}/{task.pageCount || "?"} 页
              </span>
              <span>{Math.round(task.progress)}%</span>
            </div>
            {task.errorMessage ? <p className="mt-2 text-xs text-red-500">{task.errorMessage}</p> : null}
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
