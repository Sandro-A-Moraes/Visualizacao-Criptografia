'use client';

import { useState } from 'react';
import type { ModuleId } from './types';
import { initialCertificates, modules } from './data';
import { OverviewLab } from './labs/OverviewLab';
import { ArchitectureLab } from './labs/ArchitectureLab';
import { AesLab, HybridLab, ShaLab, SignatureLab } from './labs/CoreCryptoLabs';
import {
  CompareLab,
  IoTLab,
  PkiLab,
  RevocationLab,
  ScenarioLab,
  TlsLab,
} from './labs/TrustLabs';
import { SecurityLabShell } from './ui/SecurityLabShell';

export default function BioCareSecurityLab() {
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const [certificates, setCertificates] = useState(initialCertificates);
  const currentModule =
    modules.find((module) => module.id === activeModule) ?? modules[0]!;
  const revokeCertificate = (serial: string) =>
    setCertificates((items) =>
      items.map((item) =>
        item.serial === serial ? { ...item, status: 'REVOKED' } : item
      )
    );
  const addCertificate = () =>
    setCertificates((items) => [
      ...items,
      {
        name: 'Clinica Demo',
        serial: `BC-${crypto.getRandomValues(new Uint32Array(1))[0]!.toString(16).toUpperCase()}`,
        subject: 'CN=clinica-demo.biocare',
        issuer: 'BioCare Intermediate CA',
        usage: 'Client Authentication',
        status: 'GOOD',
        valid: '2026-01-01 ate 2027-01-01',
      },
    ]);
  const labs = {
    overview: <OverviewLab />,
    architecture: <ArchitectureLab />,
    sha: <ShaLab />,
    aes: <AesLab />,
    signature: <SignatureLab />,
    hybrid: <HybridLab />,
    compare: <CompareLab />,
    pki: <PkiLab certificates={certificates} add={addCertificate} />,
    revocation: (
      <RevocationLab certificates={certificates} revoke={revokeCertificate} />
    ),
    iot: <IoTLab />,
    tls: <TlsLab />,
    scenario: <ScenarioLab certificates={certificates} />,
  };
  return (
    <SecurityLabShell
      activeModule={activeModule}
      currentModule={currentModule}
      modules={modules}
      onModuleChange={setActiveModule}
      onReset={() => {
        setActiveModule('overview');
        setCertificates(initialCertificates);
      }}
    >
      {labs[activeModule]}
    </SecurityLabShell>
  );
}
