export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export const toBase64 = (value: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(value)));

export const fromBase64 = (value: string) =>
  Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

export const toHex = (value: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(value)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
