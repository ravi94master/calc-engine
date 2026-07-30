import { CalculatorException } from '../errors/CalculatorError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

/**
 * Copies `text` to the system clipboard.
 *
 * Tries the modern async Clipboard API first (requires a secure context —
 * HTTPS or localhost). Falls back to the legacy `document.execCommand('copy')`
 * technique via a hidden, off-screen textarea for older browsers or
 * non-secure contexts where `navigator.clipboard` is unavailable.
 *
 * @param {string} text
 * @returns {Promise<boolean>} resolves true on success
 * @throws {CalculatorException} with code CLIPBOARD_ERROR if both methods fail
 */
export async function copyToClipboard(text) {
  const value = String(text);

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (err) {
      // Fall through to the legacy fallback below (e.g. insecure context, permission denied).
    }
  }

  if (typeof document === 'undefined') {
    throw new CalculatorException(
      ErrorCodes.CLIPBOARD_ERROR,
      'Clipboard API is unavailable in this environment.'
    );
  }

  let textarea;
  try {
    textarea = document.createElement('textarea');
    textarea.value = value;
    // Keep it out of the visible viewport and out of the tab order.
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    const successful = document.execCommand && document.execCommand('copy');
    if (!successful) {
      throw new Error('execCommand("copy") returned false.');
    }
    return true;
  } catch (err) {
    throw new CalculatorException(
      ErrorCodes.CLIPBOARD_ERROR,
      `Unable to copy to clipboard: ${err.message}`
    );
  } finally {
    if (textarea && textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
  }
}
