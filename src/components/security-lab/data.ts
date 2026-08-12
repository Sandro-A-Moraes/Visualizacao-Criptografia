import type { Certificate, ModuleId, Tone } from './types';

export const initialReport = 'Paciente: Jo\u00e3o Silva\nFrequ\u00eancia card\u00edaca: 76 bpm\nAvalia\u00e7\u00e3o: est\u00e1vel.';

export const modules: Array<{ id: ModuleId; icon: string; label: string; concept: string }> = [
  { id: 'overview', icon: '\u25c8', label: 'Vis\u00e3o geral', concept: 'Cada camada protege confidencialidade, integridade, autenticidade ou confian\u00e7a.' },
  { id: 'architecture', icon: '\u2318', label: 'Arquitetura', concept: 'Canvas din\u00e2mico que mostra dados, PKI e criptografia em cada salto.' },
  { id: 'sha', icon: '#', label: 'SHA-256', concept: 'Hash transforma bytes de qualquer tamanho em um digest fixo de 256 bits.' },
  { id: 'aes', icon: '\u2301', label: 'AES-256-GCM', concept: 'AES-GCM cifra dados e autentica o ciphertext usando chave de sess\u00e3o e IV \u00fanico.' },
  { id: 'signature', icon: '\u2726', label: 'Assinatura digital', concept: 'ECDSA usa a chave privada para assinar e a p\u00fablica para verificar.' },
  { id: 'hybrid', icon: '\u25c7', label: 'Criptografia h\u00edbrida', concept: 'AES cifra os dados; RSA-OAEP protege a chave AES.' },
  { id: 'compare', icon: '\u21c4', label: 'RSA \u00d7 ECC', concept: 'ECC reduz o material de chave para dispositivos restritos.' },
  { id: 'pki', icon: '\u2318', label: 'Laborat\u00f3rio PKI', concept: 'Uma cadeia de confian\u00e7a liga identidades a uma Root CA confi\u00e1vel.' },
  { id: 'revocation', icon: '!', label: 'CRL / OCSP', concept: 'Certificados revogados s\u00e3o rejeitados antes da conex\u00e3o.' },
  { id: 'iot', icon: '\u2665', label: 'IoT card\u00edaco', concept: 'ECDH estabelece segredo; AES-GCM protege a telemetria.' },
  { id: 'tls', icon: '\u2194', label: 'TLS / mTLS', concept: 'TLS negocia canal seguro; mTLS autentica ambos os lados.' },
  { id: 'scenario', icon: '\u25b6', label: 'Caso completo', concept: 'A narrativa conecta identidade, transmiss\u00e3o, assinatura e armazenamento.' },
];

export const initialCertificates: Certificate[] = [
  { name: 'Dra. Marina Costa', serial: 'BC-9AA12', subject: 'CN=Dra. Marina Costa', issuer: 'BioCare Intermediate CA', usage: 'Digital Signature', status: 'GOOD', valid: '2026-01-01 at\u00e9 2028-01-01' },
  { name: 'API BioCare', serial: 'BC-4F761', subject: 'CN=api.biocare.demo', issuer: 'BioCare Intermediate CA', usage: 'Server Authentication', status: 'GOOD', valid: '2026-01-01 at\u00e9 2027-01-01' },
  { name: 'Monitor CARD-001', serial: 'BC-11D09', subject: 'CN=CARD-001', issuer: 'BioCare Intermediate CA', usage: 'Client Authentication', status: 'GOOD', valid: '2026-01-01 at\u00e9 2027-01-01' },
];

export const statusTone = (status: string): Tone => status === 'GOOD' || status === 'VALID' ? 'success' : status === 'REVOKED' || status === 'INVALID' ? 'danger' : 'warning';
