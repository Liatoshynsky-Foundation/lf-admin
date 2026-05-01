export const isImageUploadFile = (file: File): boolean => {
  if (file.type) return file.type.startsWith('image/');
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name);
};
