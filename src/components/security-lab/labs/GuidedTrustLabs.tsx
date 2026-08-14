'use client';

import { useMemo, useState } from 'react';
import { createSha256, createSignature, encryptAesGcm } from '../crypto';
import type { Certificate } from '../types';
import { Badge, Button } from '../ui/LabPrimitives';
import { GuidedTrustLab } from './GuidedTrustLab';
import {
  trustLabContent,
  type TrustLabArtifact,
} from './trustLabContent';

type ArtifactOverrides = Record<string, Partial<TrustLabArtifact>>;

export function PkiLab({
  certificates,
  add,
}: {
  certificates: Certificate[];
  add: () => void;
}) {
  const [selectedSerial, setSelectedSerial] = useState(certificates[0]!.serial);
  const selected =
    certificates.find((certificate) => certificate.serial === selectedSerial) ??
    certificates[0]!;
  const artifacts: ArtifactOverrides = {
    identity: {
      content: `subject=${selected.subject}\npublicKey=P-256:04A91F…\nrequestedUsage=${selected.usage}`,
    },
    issuance: {
      content: `subject=${selected.subject}\nissuer=${selected.issuer}\nserial=${selected.serial}\nvalid=${selected.valid}\nstatus=${selected.status}`,
    },
    chain: {
      content: `[${selected.status}] ${selected.subject}\n[GOOD] ${selected.issuer}\n[TRUSTED] BioCare Root CA`,
    },
  };

  return (
    <GuidedTrustLab
      content={trustLabContent.pki}
      artifactOverrides={artifacts}
      actions={
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="text-sm">Certificado em análise</strong>
              <p className="mt-1 text-xs text-slate-400">
                Troque a identidade para atualizar os artefatos da cadeia.
              </p>
            </div>
            <Button onClick={add}>Emitir certificado simulado</Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <button
                key={certificate.serial}
                type="button"
                onClick={() => setSelectedSerial(certificate.serial)}
                className={`rounded-xl border p-3 text-left ${
                  selected.serial === certificate.serial
                    ? 'border-lime-200 bg-lime-200/10'
                    : 'border-white/10 bg-black/20'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <strong className="text-xs">{certificate.name}</strong>
                  <Badge tone={certificate.status === 'GOOD' ? 'success' : 'danger'}>
                    {certificate.status}
                  </Badge>
                </span>
                <code className="mt-2 block text-[10px] text-teal-100">
                  {certificate.serial}
                </code>
              </button>
            ))}
          </div>
        </div>
      }
    />
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
  const selected = certificates.find((certificate) => certificate.serial === serial);
  const status = selected?.status ?? 'UNKNOWN';
  const decision = status === 'GOOD' ? 'ALLOW' : 'DENY';
  const artifacts: ArtifactOverrides = {
    serial: {
      content: selected
        ? `{ "serial": "${selected.serial}", "issuer": "${selected.issuer}" }`
        : `{ "serial": "${serial}", "issuer": "UNKNOWN" }`,
    },
    request: {
      content: `issuerNameHash=7C4A… | issuerKeyHash=0F91… | serial=${serial} | nonce=91A2…`,
    },
    response: {
      content: `{ "serial": "${serial}", "status": "${status}", "signature": "VALID" }`,
    },
    decision: {
      content: `certificate=${serial} status=${status} decision=${decision} reason=OCSP_${status}`,
    },
  };

  return (
    <GuidedTrustLab
      content={trustLabContent.revocation}
      artifactOverrides={artifacts}
      operationStatus={
        <span className={decision === 'ALLOW' ? 'text-lime-100' : 'text-rose-100'}>
          Decisão atual: <strong>{decision}</strong> — status OCSP {status}.
        </span>
      }
      actions={
        <div>
          <strong className="text-sm">Escolha o certificado consultado</strong>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {certificates.map((certificate) => (
              <article
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${
                  serial === certificate.serial
                    ? 'border-lime-200 bg-lime-200/10'
                    : 'border-white/10 bg-black/20'
                }`}
                key={certificate.serial}
              >
                <button
                  type="button"
                  className="text-left"
                  onClick={() => setSerial(certificate.serial)}
                >
                  <strong className="block text-xs">{certificate.name}</strong>
                  <code className="mt-1 block text-[10px] text-teal-100">
                    {certificate.serial}
                  </code>
                </button>
                <Badge tone={certificate.status === 'GOOD' ? 'success' : 'danger'}>
                  {certificate.status}
                </Badge>
                {certificate.status === 'GOOD' && (
                  <Button
                    secondary
                    onClick={() => {
                      setSerial(certificate.serial);
                      revoke(certificate.serial);
                    }}
                  >
                    Revogar
                  </Button>
                )}
              </article>
            ))}
          </div>
        </div>
      }
    />
  );
}

export function IoTLab() {
  const [artifacts, setArtifacts] = useState<ArtifactOverrides>({});
  const [status, setStatus] = useState(
    'Execute para gerar uma telemetria cifrada pelo navegador.'
  );
  const [isBusy, setIsBusy] = useState(false);

  const run = async () => {
    setIsBusy(true);
    setStatus('Gerando chave AES-256, IV e ciphertext com Web Crypto…');
    try {
      const payload = JSON.stringify({
        deviceId: 'CARD-001',
        heartRate: 82,
        timestamp: new Date().toISOString(),
      });
      const encrypted = await encryptAesGcm(payload);
      setArtifacts({
        payload: { content: JSON.stringify(JSON.parse(payload), null, 2) },
        session: {
          content: JSON.stringify(
            { algorithm: 'AES-GCM', keyLength: 256, iv: encrypted.iv },
            null,
            2
          ),
        },
        encryption: {
          content: JSON.stringify(
            { iv: encrypted.iv, ciphertext: encrypted.encrypted },
            null,
            2
          ),
        },
      });
      setStatus(
        'Operação real concluída. A CryptoKey permaneceu somente na memória.'
      );
    } catch {
      setStatus('O navegador não conseguiu executar AES-GCM neste contexto.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <GuidedTrustLab
      content={trustLabContent.iot}
      artifactOverrides={artifacts}
      operationStatus={status}
      actions={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong className="text-sm">Telemetria fictícia: 82 bpm</strong>
            <p className="mt-1 text-xs text-slate-400">
              A cada execução, timestamp, chave e IV são renovados.
            </p>
          </div>
          <Button disabled={isBusy} onClick={run}>
            {isBusy ? 'Cifrando…' : 'Gerar e cifrar telemetria'}
          </Button>
        </div>
      }
    />
  );
}

export function TlsLab() {
  const [mutual, setMutual] = useState(false);
  const artifacts: ArtifactOverrides = {
    certificate: {
      content: mutual
        ? 'server=CN=api.biocare.demo [VALID]\nclient=CN=CARD-001 [VALID]\nmode=mTLS'
        : 'server=CN=api.biocare.demo [VALID]\nclient=not requested\nmode=TLS',
    },
  };

  return (
    <GuidedTrustLab
      content={trustLabContent.tls}
      artifactOverrides={artifacts}
      operationStatus={
        mutual
          ? 'mTLS: servidor e dispositivo apresentam certificado e prova de posse.'
          : 'TLS: somente o servidor apresenta certificado; o cliente pode usar outro login depois.'
      }
      actions={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong className="text-sm">Modo de autenticação</strong>
            <p className="mt-1 text-xs text-slate-400">
              Compare quem apresenta identidade durante o handshake.
            </p>
          </div>
          <div className="flex gap-2">
            <Button secondary={mutual} onClick={() => setMutual(false)}>
              TLS
            </Button>
            <Button secondary={!mutual} onClick={() => setMutual(true)}>
              mTLS
            </Button>
          </div>
        </div>
      }
    />
  );
}

export function ScenarioLab({ certificates }: { certificates: Certificate[] }) {
  const [artifacts, setArtifacts] = useState<ArtifactOverrides>({});
  const [status, setStatus] = useState(
    'Execute para materializar os artefatos criptográficos do caso.'
  );
  const [isBusy, setIsBusy] = useState(false);
  const revoked = useMemo(
    () => certificates.find((certificate) => certificate.status === 'REVOKED'),
    [certificates]
  );

  const run = async () => {
    setIsBusy(true);
    if (revoked) {
      setArtifacts({
        origin: {
          content: `{ "certificate": "${revoked.serial}", "ocsp": "REVOKED", "decision": "DENY" }`,
        },
      });
      setStatus(
        `Fluxo interrompido: o certificado ${revoked.serial} está revogado.`
      );
      setIsBusy(false);
      return;
    }
    setStatus('Executando AES-GCM, SHA-256 e ECDSA no navegador…');
    try {
      const telemetry = JSON.stringify({
        device: 'CARD-001',
        heartRate: 82,
      });
      const report =
        'Paciente fictício | Frequência cardíaca: 82 bpm | Avaliação: estável';
      const [transport, stored, digest, signed] = await Promise.all([
        encryptAesGcm(telemetry),
        encryptAesGcm(report),
        createSha256(report),
        createSignature(report),
      ]);
      setArtifacts({
        origin: {
          content:
            '{ "device": "CARD-001", "heartRate": 82, "certificate": "BC-11D09", "ocsp": "GOOD" }',
        },
        transport: {
          content: JSON.stringify(
            { iv: transport.iv, ciphertext: transport.encrypted },
            null,
            2
          ),
        },
        report: {
          content: JSON.stringify(
            { digest, signature: signed.signature },
            null,
            2
          ),
        },
        storage: {
          content: JSON.stringify(
            {
              iv: stored.iv,
              record: stored.encrypted,
              keyReference: 'memory://demo-cryptokey',
            },
            null,
            2
          ),
        },
      });
      setStatus(
        'Caso executado: os valores exibidos foram gerados nesta sessão do navegador.'
      );
    } catch {
      setStatus('O navegador não conseguiu concluir as operações criptográficas.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <GuidedTrustLab
      content={trustLabContent.scenario}
      artifactOverrides={artifacts}
      operationStatus={status}
      actions={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong className="text-sm">
              {revoked
                ? 'Cenário com bloqueio por revogação'
                : 'Cenário clínico autorizado'}
            </strong>
            <p className="mt-1 text-xs text-slate-400">
              {revoked
                ? `O serial ${revoked.serial} interromperá o fluxo antes da cifra.`
                : 'O navegador gerará ciphertext, digest e assinatura novos.'}
            </p>
          </div>
          <Button disabled={isBusy} onClick={run}>
            {isBusy ? 'Executando…' : 'Executar caso completo'}
          </Button>
        </div>
      }
    />
  );
}
