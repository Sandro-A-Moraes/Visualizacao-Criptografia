import type { GeneratedArtifact } from './types';

export function createArtifactsForLayer(
  layerId: string,
  step: number
): GeneratedArtifact[] {
  const producedAt = `Etapa ${step + 1}`;
  const items: Record<string, Omit<GeneratedArtifact, 'producedAt'>[]> = {
    edge: [
      {
        name: 'cardiac-payload.json',
        type: 'JSON',
        content: '{\n  "heartRate": 82,\n  "deviceId": "CARD-001"\n}',
        description:
          'Payload clínico criado pelo monitor antes da transmissão.',
      },
      {
        name: 'device-identity.pub',
        type: 'ECC P-256',
        content: 'public-key: CARD-001 / curve P-256',
        description: 'Chave pública vinculada à identidade do dispositivo.',
      },
    ],
    transport: [
      {
        name: 'ecdh-shared-secret.bin',
        type: 'ECDH',
        content: 'shared-secret: 9f 4c 71 a2 ...',
        description:
          'Segredo derivado pelas duas partes sem transmitir uma chave AES em claro.',
      },
      {
        name: 'session-key.meta',
        type: 'AES-256',
        content: 'derived-key: 256 bits / ephemeral',
        description: 'Metadados da chave simétrica efêmera da sessão.',
      },
    ],
    gateway: [
      {
        name: 'ocsp-response.txt',
        type: 'OCSP',
        content: 'serial BC-11D09 -> GOOD',
        description:
          'Consulta que confirma que o certificado ainda pode ser aceito.',
      },
    ],
    app: [
      {
        name: 'report.sha256',
        type: 'SHA-256',
        content: 'digest: 7b9e...a6f1 (256 bits)',
        description: 'Digest fixo usado para detectar alteração no relatório.',
      },
      {
        name: 'report.signature',
        type: 'ECDSA',
        content: 'signature: MEUCIQ... (Base64)',
        description: 'Assinatura criada pela chave privada da médica.',
      },
    ],
    data: [
      {
        name: 'medical-record.enc',
        type: 'AES-GCM',
        content: 'ciphertext + 96-bit IV + 128-bit tag',
        description: 'Registro cifrado e autenticado para armazenamento.',
      },
      {
        name: 'wrapped-aes-key.bin',
        type: 'RSA-OAEP',
        content: 'AES key protected with RSA-OAEP/SHA-256',
        description: 'Chave AES encapsulada para não ser armazenada em claro.',
      },
    ],
  };
  return (items[layerId] ?? []).map((item) => ({ ...item, producedAt }));
}
