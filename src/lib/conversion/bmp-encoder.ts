export function encodeCanvasToBmpBlob(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to read canvas pixels for BMP export.");
  }

  const width = canvas.width;
  const height = canvas.height;
  const imageData = context.getImageData(0, 0, width, height);
  const rowStride = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowStride * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  writeAscii(bytes, 0, "BM");
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, pixelArraySize, true);

  for (let y = 0; y < height; y += 1) {
    const sourceY = height - 1 - y;
    const targetRow = 54 + y * rowStride;

    for (let x = 0; x < width; x += 1) {
      const sourceOffset = (sourceY * width + x) * 4;
      const targetOffset = targetRow + x * 3;

      bytes[targetOffset] = imageData.data[sourceOffset + 2];
      bytes[targetOffset + 1] = imageData.data[sourceOffset + 1];
      bytes[targetOffset + 2] = imageData.data[sourceOffset];
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}

function writeAscii(bytes: Uint8Array, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    bytes[offset + index] = value.charCodeAt(index);
  }
}
