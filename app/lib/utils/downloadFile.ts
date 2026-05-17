import toast from 'react-hot-toast';

export const downloadFile = async (fileUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(fileUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Помилка завантаження');

    const blob = await response.blob();
    const blobUrl = globalThis.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    link.remove();
    globalThis.URL.revokeObjectURL(blobUrl);
    toast.success('Файл завантажено');
  } catch {
    toast.error('Не вдалося завантажити файл');
  }
};
