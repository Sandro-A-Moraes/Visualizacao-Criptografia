import type { ArchitectureLayer } from './types';

export const architectureLayers: ArchitectureLayer[] = [
  {
    id: 'edge',
    icon: '♥',
    title: '1. Clínicas, médicos e IoT',
    role: 'Origem dos dados clínicos e das identidades.',
    input: 'Telemetria cardíaca JSON, laudos e credenciais.',
    process:
      'O monitor CARD-001 apresenta identidade ECC e certificado de dispositivo.',
    output: 'Payload clínico e prova de identidade.',
    security: 'Autenticidade na origem.',
    algorithms: ['ECC P-256', 'X.509 simulado'],
  },
  {
    id: 'transport',
    icon: '↕',
    title: '2. TLS / mTLS',
    role: 'Camada de transporte protegido entre cliente e plataforma.',
    input: 'Certificados e capacidades de handshake.',
    process:
      'PKI valida certificados; ECDH estabelece segredo compartilhado; a sessão usa chave simétrica.',
    output: 'Canal autenticado e chave de sessão efêmera.',
    security: 'Autenticidade, confidencialidade e integridade.',
    algorithms: ['TLS/mTLS', 'ECDH', 'AES-GCM'],
  },
  {
    id: 'gateway',
    icon: '⌘',
    title: '3. API Gateway',
    role: 'Borda de entrada e aplicação de políticas.',
    input: 'Pacote AES-GCM e certificado do cliente.',
    process: 'Verifica cadeia, CRL/OCSP e regra de acesso antes de rotear.',
    output: 'Requisição aceita ou rejeitada.',
    security: 'Controle de acesso e bloqueio de certificados revogados.',
    algorithms: ['PKI', 'CRL / OCSP'],
  },
  {
    id: 'app',
    icon: '◈',
    title: '4. Application Server',
    role: 'Camada de regras clínicas e operações criptográficas.',
    input: 'Payload autenticado e relatório médico.',
    process:
      'Autentica AES-GCM, calcula SHA-256 e assina o relatório com ECDSA.',
    output: 'Dados validados e laudo assinado.',
    security: 'Integridade e autenticidade do conteúdo.',
    algorithms: ['AES-GCM', 'SHA-256', 'ECDSA P-256'],
  },
  {
    id: 'data',
    icon: '▣',
    title: '5. Database',
    role: 'Persistência protegida dos registros médicos.',
    input: 'Registro e chave AES de sessão.',
    process:
      'AES-GCM cifra o registro; RSA-OAEP encapsula a chave AES para armazenamento.',
    output: 'Ciphertext, IV, tag e chave AES protegida.',
    security: 'Confidencialidade em repouso.',
    algorithms: ['AES-256-GCM', 'RSA-OAEP'],
  },
];

export const pkiSteps = [
  'Root CA: ancora de confiança',
  'Intermediate CA: assina certificados operacionais',
  'Certificados: médico, servidor, clínica e IoT',
  'CRL / OCSP: consulta de revogação',
];
