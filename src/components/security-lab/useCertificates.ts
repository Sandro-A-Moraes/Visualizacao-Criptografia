'use client';

import { useState } from 'react';
import { initialCertificates } from './data';
import type { Certificate } from './types';

function revokeCertificate(items: Certificate[], serial: string) {
  return items.map((item) =>
    item.serial === serial ? { ...item, status: 'REVOKED' as const } : item
  );
}

function createCertificate(): Certificate {
  return {
    name: 'Clinica Demo',
    serial: `BC-${crypto.getRandomValues(new Uint32Array(1))[0]!.toString(16).toUpperCase()}`,
    subject: 'CN=clinica-demo.biocare',
    issuer: 'BioCare Intermediate CA',
    usage: 'Client Authentication',
    status: 'GOOD',
    valid: '2026-01-01 ate 2027-01-01',
  };
}

export function useCertificates() {
  const [certificates, setCertificates] = useState(initialCertificates);

  return {
    certificates,
    addCertificate: () => setCertificates((items) => [...items, createCertificate()]),
    revokeCertificate: (serial: string) =>
      setCertificates((items) => revokeCertificate(items, serial)),
    resetCertificates: () => setCertificates(initialCertificates),
  };
}
