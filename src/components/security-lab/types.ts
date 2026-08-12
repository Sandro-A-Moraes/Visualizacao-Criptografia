export type ModuleId =
  | 'overview'
  | 'architecture'
  | 'sha'
  | 'aes'
  | 'signature'
  | 'hybrid'
  | 'compare'
  | 'pki'
  | 'revocation'
  | 'iot'
  | 'tls'
  | 'scenario';

export type Tone = 'success' | 'warning' | 'danger' | 'neutral';

export type Certificate = {
  name: string;
  serial: string;
  subject: string;
  issuer: string;
  usage: string;
  status: 'GOOD' | 'REVOKED';
  valid: string;
};

export type ProcessStep = {
  title: string;
  detail: string;
  data?: string;
  algorithm?: string;
  property?: string;
};
