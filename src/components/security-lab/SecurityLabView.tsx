'use client';

import { useState } from 'react';
import type { ModuleId } from './types';
import { modules } from './data';
import { useCertificates } from './useCertificates';
import { OverviewLab } from './labs/OverviewLab';
import { ArchitectureLab } from './labs/ArchitectureLab';
import { AesLab, HybridLab, ShaLab, SignatureLab } from './labs/CoreCryptoLabs';
import { CompareLab } from './labs/TrustLabs';
import {
  IoTLab,
  PkiLab,
  RevocationLab,
  ScenarioLab,
  TlsLab,
} from './labs/GuidedTrustLabs';
import { SecurityLabShell } from './ui/SecurityLabShell';

export default function BioCareSecurityLab() {
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const {
    certificates,
    addCertificate,
    resetCertificates,
    revokeCertificate,
  } = useCertificates();
  const currentModule =
    modules.find((module) => module.id === activeModule) ?? modules[0]!;
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
        resetCertificates();
      }}
    >
      {labs[activeModule]}
    </SecurityLabShell>
  );
}
