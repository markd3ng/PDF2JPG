export function copyBlobToClipboard(blob: Blob) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    console.error("当前浏览器不支持剪贴板图片写入");
    return Promise.resolve(false);
  }

  const item = new ClipboardItem({ [blob.type]: blob });
  return navigator.clipboard
    .write([item])
    .then(() => true)
    .catch((error) => {
      console.error("复制图片失败", error);
      return false;
    });
}
