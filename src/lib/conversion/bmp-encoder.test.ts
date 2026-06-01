import { describe, expect, it } from "vitest";
import { encodeCanvasToBmpBlob } from "@/lib/conversion/bmp-encoder";

describe("encodeCanvasToBmpBlob", () => {
  it("returns an image/bmp blob with a valid BMP header", async () => {
    const canvas = {
      width: 2,
      height: 1,
      getContext: () => ({
        getImageData: () => ({
          data: new Uint8ClampedArray([
            255, 0, 0, 255,
            0, 128, 255, 255
          ])
        })
      })
    } as unknown as HTMLCanvasElement;

    const blob = encodeCanvasToBmpBlob(canvas);
    const bytes = new Uint8Array(await blob.arrayBuffer());

    expect(blob.type).toBe("image/bmp");
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("BM");
    expect(bytes[10]).toBe(54);
    expect(bytes[18]).toBe(2);
    expect(bytes[22]).toBe(1);
  });
});
