/**
 * 将 Blob 转换为 PNG 格式（剪贴板 API 主要支持 PNG）
 */
async function convertToPng(blob: Blob): Promise<Blob> {
  // 如果已经是 PNG，直接返回
  if (blob.type === "image/png") {
    return blob;
  }

  // 将 Blob 转换为 ImageBitmap，再绘制到 canvas 导出为 PNG
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法创建画布上下文");
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (pngBlob) => {
        if (pngBlob) {
          resolve(pngBlob);
        } else {
          reject(new Error("转换为 PNG 失败"));
        }
      },
      "image/png"
    );
  });
}

export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    console.error("当前浏览器不支持剪贴板图片写入");
    return false;
  }

  try {
    // 剪贴板 API 主要支持 PNG 格式，需要转换
    const pngBlob = await convertToPng(blob);
    const item = new ClipboardItem({ "image/png": pngBlob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (error) {
    console.error("复制图片失败", error);
    return false;
  }
}
