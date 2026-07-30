import { copyToClipboard } from '../src/clipboard/clipboard.js';

describe('copyToClipboard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete navigator.clipboard;
  });

  test('uses the modern Clipboard API when available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });

    const result = await copyToClipboard('123');
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('123');
  });

  test('falls back to execCommand when the Clipboard API rejects', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
      configurable: true
    });
    document.execCommand = jest.fn().mockReturnValue(true);

    const result = await copyToClipboard('456');
    expect(result).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  test('falls back to execCommand when navigator.clipboard is entirely absent', async () => {
    delete navigator.clipboard;
    document.execCommand = jest.fn().mockReturnValue(true);

    const result = await copyToClipboard('789');
    expect(result).toBe(true);
  });

  test('the fallback textarea is removed from the DOM after copying', async () => {
    delete navigator.clipboard;
    document.execCommand = jest.fn().mockReturnValue(true);

    await copyToClipboard('cleanup-check');
    expect(document.querySelectorAll('textarea').length).toBe(0);
  });

  test('throws CLIPBOARD_ERROR when every method fails', async () => {
    delete navigator.clipboard;
    document.execCommand = jest.fn().mockReturnValue(false);

    await expect(copyToClipboard('fail')).rejects.toMatchObject({ code: 'CLIPBOARD_ERROR' });
  });
});
