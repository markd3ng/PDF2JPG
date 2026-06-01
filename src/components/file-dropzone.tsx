import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FileDropzoneProps {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  children?: React.ReactNode;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function FileDropzone({ disabled = false, onFiles, children }: FileDropzoneProps) {
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
      const reason = rejections[0]?.errors[0]?.message ?? "The file does not meet the upload requirements.";
      console.error("File rejected", reason);
    }
  });

  return (
    <Card className="shine">
      <CardHeader>
        <CardTitle>Upload PDFs</CardTitle>
        <CardDescription>Drop multiple PDF files at once. Each file should be 50MB or smaller.</CardDescription>
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
          <p className="text-base font-semibold text-slate-800">Drop PDF files here, or click to choose files</p>
          <p className="mt-2 text-sm text-slate-500">Files are processed locally and exported page by page.</p>
        </section>
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
