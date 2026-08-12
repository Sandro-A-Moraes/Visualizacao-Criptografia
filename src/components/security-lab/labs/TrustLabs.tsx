'use client';

import { useMemo, useState } from 'react';
import type { Certificate } from '../types';
import {
  Badge,
  Button,
  Info,
  Notice,
  Process,
  Section,
  TechnicalDetails,
} from '../ui/LabPrimitives';

export function CompareLab() {
  const rows = [
    ['Tipo', 'Assimétrica', 'Assimétrica', 'Simétrica'],
    ['Chave típica', '2048+ bits', 'P-256: 256 bits', '256 bits'],
    ['Uso', 'Encapsular chave', 'ECDH/ECDSA', 'Dados em massa'],
    ['IoT', 'Mais pesado', 'Preferível', 'Protege sessão'],
  ];
  return (
    <Section title="RSA × ECC × AES" kicker="COMPARAÇÃO TÉCNICA">
      <div className="mt-4 overflow-auto rounded-xl border border-white/10">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              {['Característica', 'RSA', 'ECC', 'AES'].map((item) => (
                <th className="p-3 text-left text-teal-100" key={item}>
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-white/10" key={row[0]}>
                {row.map((item) => (
                  <td className="p-3 text-slate-300" key={item}>
                    {item}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Notice tone="success">
        ECC fornece identidade e acordo de chave com menos material de chave.
        AES continua responsável pela cifragem de dados em massa.
      </Notice>
    </Section>
  );
}
export function PkiLab({
  certificates,
  add,
}: {
  certificates: Certificate[];
  add: () => void;
}) {
  const [selected, setSelected] = useState(certificates[0]!);
  return (
    <Section title="Laboratório PKI" kicker="SIMULAÇÃO EDUCACIONAL">
      <p className="mt-3 text-sm text-slate-400">
        Root CA → Intermediate CA → certificados de médico, servidor, clínica e
        IoT.
      </p>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {certificates.map((certificate) => (
          <button
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-left text-xs"
            onClick={() => setSelected(certificate)}
            type="button"
            key={certificate.serial}
          >
            <strong>{certificate.name}</strong>
            <span className="mt-2 block font-mono text-teal-100">
              {certificate.serial}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Button onClick={add}>Emitir certificado simulado</Button>
      </div>
      <dl className="mt-4 grid gap-3 rounded-xl border border-teal-300/20 bg-teal-300/5 p-4 sm:grid-cols-2">
        <Info label="Subject" value={selected.subject} />
        <Info label="Issuer" value={selected.issuer} />
        <Info label="Serial" value={selected.serial} />
        <Info label="Uso" value={selected.usage} />
        <Info label="Validade" value={selected.valid} />
        <Info label="Status" value={selected.status} />
      </dl>
    </Section>
  );
}
export function RevocationLab({
  certificates,
  revoke,
}: {
  certificates: Certificate[];
  revoke: (serial: string) => void;
}) {
  const [serial, setSerial] = useState(certificates[0]!.serial);
  const found = certificates.find((item) => item.serial === serial);
  return (
    <Section title="CRL / OCSP" kicker="DECISÃO DE REVOGAÇÃO">
      <div className="mt-4 grid gap-2">
        {certificates.map((certificate) => (
          <article
            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 text-xs"
            key={certificate.serial}
          >
            <span>
              {certificate.name} · {certificate.serial}
            </span>
            <Badge tone={certificate.status === 'GOOD' ? 'success' : 'danger'}>
              {certificate.status}
            </Badge>
            {certificate.status === 'GOOD' && (
              <Button secondary onClick={() => revoke(certificate.serial)}>
                Revogar
              </Button>
            )}
          </article>
        ))}
      </div>
      <input
        value={serial}
        onChange={(event) => setSerial(event.target.value)}
        className="mt-4 w-full rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-xs"
      />
      <Notice
        tone={
          found?.status === 'REVOKED' ? 'danger' : found ? 'success' : 'warning'
        }
      >
        {found
          ? `OCSP responde ${found.status}; a aplicação ${found.status === 'REVOKED' ? 'rejeita' : 'aceita'} a conexão.`
          : 'Status UNKNOWN.'}
      </Notice>
    </Section>
  );
}
export function IoTLab() {
  const [payload, setPayload] = useState('');
  const create = () =>
    setPayload(
      JSON.stringify(
        {
          heartRate: 82,
          deviceId: 'CARD-001',
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
  return (
    <Section title="IoT cardíaco" kicker="ECC, ECDH E AES-GCM">
      <Button onClick={create}>Gerar payload</Button>
      {payload && (
        <Notice tone="success">
          ECC identifica o dispositivo; ECDH estabelece segredo; AES-GCM cifra
          este JSON: <code>{payload}</code>
        </Notice>
      )}
      <TechnicalDetails
        algorithm="ECDH + AES-GCM"
        input="Identidade e telemetria"
        output="Canal e payload cifrado"
        property="Autenticidade e confidencialidade"
      />
    </Section>
  );
}
export function TlsLab() {
  const [mutual, setMutual] = useState(false);
  const steps = mutual
    ? [
        'ClientHello',
        'Certificado do servidor',
        'Certificado do cliente',
        'Validação mútua',
        'Acordo de chave',
        'Canal cifrado',
      ]
    : [
        'ClientHello',
        'Certificado do servidor',
        'Validação',
        'Acordo de chave',
        'Canal cifrado',
      ];
  return (
    <Section title="TLS / mTLS" kicker="VISUALIZAÇÃO DE PROTOCOLO">
      <div className="mt-3 flex gap-2">
        <Button secondary={!mutual} onClick={() => setMutual(false)}>
          TLS
        </Button>
        <Button secondary={mutual} onClick={() => setMutual(true)}>
          mTLS
        </Button>
      </div>
      <Process
        steps={steps.map((title) => ({
          title,
          detail: `Mensagem do handshake: ${title}.`,
          property: 'Autenticidade ou confidencialidade',
        }))}
        active={steps.length - 1}
        onSelect={() => undefined}
      />
    </Section>
  );
}
export function ScenarioLab({ certificates }: { certificates: Certificate[] }) {
  const steps = useMemo(
    () => [
      'IoT gera dado',
      'PKI valida dispositivo',
      'ECDH deriva segredo',
      'AES cifra payload',
      'Gateway recebe pacote',
      'Servidor decifra',
      'SHA-256 calcula digest',
      'ECDSA assina relatório',
      'AES cifra armazenamento',
      'RSA-OAEP protege chave',
      certificates.some((certificate) => certificate.status === 'REVOKED')
        ? 'Certificado revogado é rejeitado'
        : 'Teste de revogação pendente',
    ],
    [certificates]
  );
  return (
    <Section title="Caso completo" kicker="LINHA DO TEMPO">
      <Process
        steps={steps.map((title) => ({
          title,
          detail: `Processo BioCare: ${title}.`,
          property: 'Proteção aplicada',
        }))}
        active={steps.length - 1}
        onSelect={() => undefined}
      />
    </Section>
  );
}
