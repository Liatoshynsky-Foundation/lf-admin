jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));

import toast from 'react-hot-toast';

import { downloadFile } from './downloadFile';

describe('downloadFile', () => {
  const originalFetch = global.fetch;
  const originalCreate = globalThis.URL.createObjectURL;
  const originalRevoke = globalThis.URL.revokeObjectURL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    globalThis.URL.createObjectURL = originalCreate;
    globalThis.URL.revokeObjectURL = originalRevoke;
  });

  it('downloads file successfully and shows success toast', async () => {
    const blob = new Blob(['ok'], { type: 'text/plain' });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: jest.fn().mockResolvedValue(blob) });
    globalThis.URL.createObjectURL = jest.fn().mockReturnValue('blob-url');
    globalThis.URL.revokeObjectURL = jest.fn();

    const anchor = document.createElement('a');
    const clickMock = jest.fn();
    anchor.click = clickMock;

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(HTMLElement.prototype, 'remove');

    await downloadFile('http://file', 'name.txt');

    expect(global.fetch).toHaveBeenCalledWith('http://file', { cache: 'no-store' });
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
    expect(toast.success).toHaveBeenCalledWith('Файл завантажено');
  });

  it('shows error toast when response not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await downloadFile('http://file', 'name.txt');

    expect(toast.error).toHaveBeenCalledWith('Не вдалося завантажити файл');
  });

  it('shows error toast when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network'));

    await downloadFile('http://file', 'name.txt');

    expect(toast.error).toHaveBeenCalledWith('Не вдалося завантажити файл');
  });
});
