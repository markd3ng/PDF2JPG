import type { OutputFormat } from "@/lib/types";
import { OUTPUT_FORMATS } from "@/lib/conversion/output-format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OutputFormatSelectorProps {
  value: OutputFormat;
  onChange: (value: OutputFormat) => void;
}

export function OutputFormatSelector({ value, onChange }: OutputFormatSelectorProps) {
  return (
    <Card className="shine">
      <CardHeader>
        <CardTitle>Output format</CardTitle>
        <CardDescription>Choose the image format for every converted PDF page.</CardDescription>
      </CardHeader>
      <CardContent>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as OutputFormat)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          aria-label="Output format"
        >
          {OUTPUT_FORMATS.map((format) => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
}
