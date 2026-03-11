import type { DpiPreset } from "@/lib/types";
import { DPI_OPTIONS } from "@/lib/conversion/dpi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DpiSelectorProps {
  value: DpiPreset;
  onChange: (value: DpiPreset) => void;
}

export function DpiSelector({ value, onChange }: DpiSelectorProps) {
  return (
    <Card className="shine">
      <CardHeader>
        <CardTitle>DPI 画质预设</CardTitle>
        <CardDescription>更高 DPI 会提升清晰度，也会增加处理时间和内存占用。</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={value} onValueChange={(next) => onChange(next as DpiPreset)}>
          <TabsList className="w-full">
            {DPI_OPTIONS.map((option) => (
              <TabsTrigger key={option.value} value={option.value} className="flex-1">
                <span className="flex flex-col items-center gap-0.5">
                  <span>{option.label}</span>
                  <span className="text-[11px] opacity-80">{option.description}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}
