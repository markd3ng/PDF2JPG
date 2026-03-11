import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FileDropzoneProps {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function FileDropzone({ disabled = false, onFiles }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    disabled,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "application/pdf": [".pdf"]
    },
    onDropAccepted: (acceptedFiles) => {
      onFiles(acceptedFiles);
    },
    onDropRejected: (rejections) => {
      const reason = rejections[0]?.errors[0]?.message ?? "文件不符合要求";
      console.error("文件被拒绝", reason);
    }
  });

  return (
    <Card className="shine">
      <CardHeader>
        <CardTitle>批量拖拽上传</CardTitle>
        <CardDescription>支持多个 PDF 文件，单文件建议不超过 50MB。文件仅在浏览器本地处理。</CardDescription>
      </CardHeader>
      <CardContent>
        <section
          {...getRootProps()}
          className={[
            "flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition",
            isDragActive
              ? "border-blue-500 bg-blue-50/80 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              : "border-slate-300 bg-white/60 hover:border-blue-400 hover:bg-blue-50/50"
          ].join(" ")}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mb-3 h-12 w-12 text-blue-600" />
          <p className="text-base font-semibold text-slate-800">将 PDF 文件拖放到这里，或点击选择文件</p>
          <p className="mt-2 text-sm text-slate-500">支持批量处理，自动保持每页顺序并生成 JPG。</p>
        </section>
      </CardContent>
    </Card>
  );
}
