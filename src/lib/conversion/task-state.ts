import type { ConversionTask, ConvertedImage } from "@/lib/types";

export interface ClearCompletedResult {
  tasks: ConversionTask[];
  clearedCount: number;
}

export function clearCompletedTasks(
  tasks: ConversionTask[],
  revokeImages: (images: ConvertedImage[]) => void
): ClearCompletedResult {
  const completedTasks = tasks.filter((task) => task.status === "done");

  if (completedTasks.length === 0) {
    return { tasks, clearedCount: 0 };
  }

  completedTasks.forEach((task) => revokeImages(task.images));

  return {
    tasks: tasks.filter((task) => task.status !== "done"),
    clearedCount: completedTasks.length
  };
}
