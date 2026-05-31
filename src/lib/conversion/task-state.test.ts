import { describe, expect, it, vi } from "vitest";
import type { ConversionTask } from "@/lib/types";
import { clearCompletedTasks } from "@/lib/conversion/task-state";

function createTask(status: ConversionTask["status"], id: string): ConversionTask {
  return {
    id,
    file: new File(["pdf"], `${id}.pdf`, { type: "application/pdf" }),
    status,
    progress: status === "done" ? 100 : 0,
    pageCount: status === "done" ? 1 : 0,
    donePages: status === "done" ? 1 : 0,
    images:
      status === "done"
        ? [
            {
              id: `${id}-1`,
              fileName: `${id}-p001.jpg`,
              page: 1,
              blob: new Blob(["jpg"], { type: "image/jpeg" }),
              url: `blob:${id}`,
              byteLength: 3
            }
          ]
        : []
  };
}

describe("clearCompletedTasks", () => {
  it("removes done tasks, keeps unfinished and error tasks, and revokes completed images", () => {
    const revokeImages = vi.fn();
    const tasks = [
      createTask("pending", "pending"),
      createTask("processing", "processing"),
      createTask("error", "error"),
      createTask("done", "done")
    ];

    const result = clearCompletedTasks(tasks, revokeImages);

    expect(result.tasks.map((task) => task.status)).toEqual(["pending", "processing", "error"]);
    expect(result.clearedCount).toBe(1);
    expect(revokeImages).toHaveBeenCalledTimes(1);
    expect(revokeImages).toHaveBeenCalledWith(tasks[3].images);
  });

  it("does not revoke images when there are no completed tasks", () => {
    const revokeImages = vi.fn();
    const tasks = [createTask("pending", "pending")];

    const result = clearCompletedTasks(tasks, revokeImages);

    expect(result.tasks).toEqual(tasks);
    expect(result.clearedCount).toBe(0);
    expect(revokeImages).not.toHaveBeenCalled();
  });
});
