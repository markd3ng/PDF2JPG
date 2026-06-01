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
        <CardTitle>Quality</CardTitle>
        <CardDescription>Higher DPI improves clarity, but uses more processing time and memory.</CardDescription>
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
