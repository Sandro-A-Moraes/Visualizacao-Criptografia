import type { GeneratedArtifact } from './types';

const compact = (value: string) => value.replace(/\s+/g, ' ').slice(0, 56);

export function createArtifactsForLayer(layerId: string, sequence: number): GeneratedArtifact[] {
  const producedAt = `etapa-${sequence + 1}`;
  const artifacts: Record<string, GeneratedArtifact[]> = {
    edge: [{ name: 'cardiac-payload.json', type: 'JSON', content: '{ "heartRate": 82, "deviceId": "CARD-001" }', producedAt }, { name: 'device-identity.pub', type: 'ECC P-256', content: 'public-key: CARD-001 / P-256', producedAt }],
    transport: [{ name: 'ecdh-shared-secret.bin', type: 'ECDH', content: 'shared-secret: 9f 4c 71 a2 ...', producedAt }, { name: 'session-key.meta', type: 'AES-256', content: 'derived key: 256 bits / ephemeral', producedAt }],
    gateway: [{ name: 'ocsp-response.txt', type: 'OCSP', content: 'serial BC-11D09 → GOOD', producedAt }],
    app: [{ name: 'report.sha256', type: 'SHA-256', content: 'digest: 7b9e...a6f1 (256 bits)', producedAt }, { name: 'report.signature', type: 'ECDSA', content: 'signature: MEUCIQ... (Base64)', producedAt }],
    data: [{ name: 'medical-record.enc', type: 'AES-GCM', content: 'ciphertext + 96-bit IV + 128-bit tag', producedAt }, { name: 'wrapped-aes-key.bin', type: 'RSA-OAEP', content: 'AES session key protected with RSA-OAEP/SHA-256', producedAt }],
  };
  return (artifacts[layerId] ?? []).map((artifact) => ({ ...artifact, content: compact(artifact.content) }));
}
