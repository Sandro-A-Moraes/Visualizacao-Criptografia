import { decoder, encoder, fromBase64, toBase64, toHex } from './encoding';

export async function createSha256(text: string) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
}

export async function encryptAesGcm(text: string) {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));
  return { key, iv: toBase64(iv), encrypted: toBase64(encrypted) };
}

export async function decryptAesGcm(key: CryptoKey, iv: string, encrypted: string) {
  const recovered = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(encrypted));
  return decoder.decode(recovered);
}

export async function createSignature(text: string) {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const signature = toBase64(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, encoder.encode(text)));
  return { pair, signature };
}

export async function verifySignature(pair: CryptoKeyPair, signature: string, text: string) {
  return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pair.publicKey, fromBase64(signature), encoder.encode(text));
}

export async function createHybridPackage(record: string) {
  const aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const rsa = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['wrapKey', 'unwrapKey']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, encoder.encode(record));
  const wrapped = await crypto.subtle.wrapKey('raw', aes, rsa.publicKey, { name: 'RSA-OAEP' });
  return `Pacote: IV ${toBase64(iv)} · ciphertext ${toBase64(cipher)} · chave AES protegida ${toBase64(wrapped)}`;
}
