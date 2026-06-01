/**
 * Converts image blobs to PNG because the Clipboard API primarily supports PNG images.
 */
async function convertToPng(blob: Blob): Promise<Blob> {
  if (blob.type === "image/png") {
    return blob;
  }

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create a canvas rendering context.");
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (pngBlob) => {
        if (pngBlob) {
          resolve(pngBlob);
        } else {
          reject(new Error("PNG conversion failed."));
        }
      },
      "image/png"
    );
  });
}

export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    console.error("This browser does not support writing images to the clipboard.");
    return false;
  }

  try {
    const pngBlob = await convertToPng(blob);
    const item = new ClipboardItem({ "image/png": pngBlob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (error) {
    console.error("Image copy failed", error);
    return false;
  }
}
