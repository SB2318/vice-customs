import { LiveryState } from '../types';

/**
 * Encode LiveryState into a URL-safe Base64 string
 */
export function encodeLiveryToUrl(state: LiveryState): string {
  try {
    const json = JSON.stringify(state);
    // Use encodeURIComponent to handle non-ascii chars, then btoa
    const base64 = btoa(encodeURIComponent(json));
    return base64;
  } catch (err) {
    console.error('Failed to encode livery state to URL', err);
    return '';
  }
}

/**
 * Decode URL Base64 string back into LiveryState
 */
export function decodeLiveryFromUrl(encoded: string): LiveryState | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const state = JSON.parse(json) as LiveryState;
    if (state && state.vehicle && state.primaryColor) {
      return state;
    }
    return null;
  } catch (err) {
    console.error('Failed to decode livery state from URL', err);
    return null;
  }
}

/**
 * Generate full shareable link
 */
export function generateShareUrl(state: LiveryState): string {
  const encoded = encodeLiveryToUrl(state);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#share=${encoded}`;
}

/**
 * Download LiveryState as a .json file
 */
export function downloadLiveryJson(state: LiveryState, fileName?: string) {
  const name = fileName || `ViceCustoms_${state.vehicle}_${state.finish}_livery.json`;
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Read LiveryState from an uploaded .json File
 */
export function readLiveryJsonFile(file: File): Promise<LiveryState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const state = JSON.parse(text) as LiveryState;
        if (state && state.vehicle && state.primaryColor) {
          resolve(state);
        } else {
          reject(new Error('Invalid Livery JSON file structure'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
