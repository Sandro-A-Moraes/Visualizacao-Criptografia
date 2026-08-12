'use client';

import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react';

type ModuleId =
  | 'overview'
  | 'aes'
  | 'sha'
  | 'signature'
  | 'compare'
  | 'hybrid'
  | 'pki'
  | 'revocation'
  | 'iot'
  | 'tls'
  | 'scenario';

type CertificateStatus = 'GOOD' | 'REVOKED' | 'UNKNOWN';

type Certificate = {
  name: string;
  subject: string;
  issuer: string;
  serial: string;
  usage: string;
  status: CertificateStatus;
  valid: string;
};

const modules: Array<{ id: ModuleId; label: string; icon: string; concept: string }> = [
  { id: 'overview', label: 'Visão geral', icon: '◈', concept: 'A arquitetura BioCare aplica camadas complementares de proteção.' },
  { id: 'aes', label: 'AES-256', icon: '⌁', concept: 'AES-GCM cifra dados em massa com uma chave simétrica efêmera.' },
  { id: 'sha', label: 'SHA-256', icon: '#', concept: 'Um hash é uma impressão digital unidirecional, não uma cifra reversível.' },
  { id: 'signature', label: 'Assinatura digital', icon: '✦', concept: 'ECDSA prova integridade e a posse da chave privada no ato da assinatura.' },
  { id: 'compare', label: 'RSA × ECC', icon: '⇄', concept: 'ECC reduz o tamanho das chaves em cenários com recursos limitados.' },
  { id: 'hybrid', label: 'Criptografia híbrida', icon: '◇', concept: 'AES cifra o prontuário; RSA-OAEP protege somente a chave AES.' },
  { id: 'pki', label: 'Laboratório PKI', icon: '⌘', concept: 'A cadeia de certificados é uma simulação educacional de PKI.' },
  { id: 'revocation', label: 'CRL / OCSP', icon: '!', concept: 'Revogação impede que certificados comprometidos continuem aceitos.' },
  { id: 'iot', label: 'IoT cardíaco', icon: '♥', concept: 'ECC identifica o dispositivo; AES protege sua telemetria.' },
  { id: 'tls', label: 'TLS / mTLS', icon: '↔', concept: 'O handshake é uma visualização didática de negociação segura.' },
  { id: 'scenario', label: 'Caso completo', icon: '▶', concept: 'O cenário conecta todos os mecanismos em uma narrativa auditável.' },
];

const starterCertificates: Certificate[] = [
  { name: 'Dra. Marina Costa', subject: 'CN=Dra. Marina Costa', issuer: 'BioCare Intermediate CA', serial: 'BC-9AA12', usage: 'Digital Signature', status: 'GOOD', valid: '2026–2028' },
  { name: 'API BioCare', subject: 'CN=api.biocare.demo', issuer: 'BioCare Intermediate CA', serial: 'BC-4F761', usage: 'Server Authentication', status: 'GOOD', valid: '2026–2027' },
  { name: 'Monitor Cardíaco 07', subject: 'CN=iot-monitor-07', issuer: 'BioCare Intermediate CA', serial: 'BC-11D09', usage: 'Client Authentication', status: 'GOOD', valid: '2026–2027' },
];

const initialReport = 'Relatório BioCare — Paciente fictícia Ana Lima\nFrequência cardíaca: 76 bpm\nAvaliação: estável.';
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const bytesToBase64 = (value: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(value)));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
const toHex = (value: ArrayBuffer) => [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const truncate = (value: string) => value.length > 70 ? `${value.slice(0, 70)}…` : value;

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const tones = {
    success: 'border-lime-300/30 bg-lime-300/10 text-lime-200',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
    danger: 'border-rose-300/30 bg-rose-300/10 text-rose-200',
    neutral: 'border-teal-300/30 bg-teal-300/10 text-teal-100',
  };

  return <span className={`inline-flex w-fit rounded border px-2 py-1 font-mono text-[10px] tracking-wide ${tones[tone]}`}>{children}</span>;
}

function Button({ children, onClick, disabled = false, secondary = false }: { children: ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={secondary ? 'rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:border-teal-300/50 disabled:cursor-not-allowed disabled:opacity-40' : 'rounded-lg border border-lime-200 bg-lime-200 px-3 py-2 text-xs font-extrabold text-[#0a211e] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-300/15 disabled:cursor-not-allowed disabled:opacity-40'}>{children}</button>;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return <button type="button" onClick={copy} className="rounded border border-white/15 px-2 py-1 font-mono text-[9px] text-slate-200 hover:border-teal-300 hover:text-teal-100">{copied ? 'Copiado' : 'Copiar'}</button>;
}

function Value({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  return <div className="grid gap-2 rounded-lg border border-white/10 bg-black/15 p-3 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center"><span className="text-[11px] text-slate-400">{label}</span><code className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] text-teal-100">{secret ? 'Mantida apenas em memória nesta demonstração' : truncate(value)}</code>{!secret && <CopyButton value={value} />}</div>;
}

function FileInput({ onText }: { onText: (text: string) => void }) {
  const readFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) file.text().then(onText);
  };

  return <label className="w-fit cursor-pointer border-b border-dashed border-teal-200 text-[11px] text-teal-100">Importar arquivo .txt<input className="hidden" type="file" accept="text/plain,.txt" onChange={readFile} /></label>;
}

function Lab({ title, kicker, description, children }: { title: string; kicker: string; description: string; children: ReactNode }) {
  return <section className="mx-auto max-w-5xl animate-[fadeIn_250ms_ease-out]"><header className="mb-7 max-w-3xl"><p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-teal-200">{kicker}</p><h1 className="m-0 text-4xl font-extrabold tracking-tight text-white md:text-5xl">{title}</h1><p className="mt-4 text-sm leading-6 text-slate-400">{description}</p></header>{children}</section>;
}

function Overview() {
  const cards = [['AES-256', 'Confidencialidade', 'Dados clínicos em repouso e trânsito'], ['SHA-256', 'Integridade', 'Detecção de alteração'], ['Assinatura', 'Autenticidade', 'Laudos e autoria'], ['RSA / ECC', 'Assimétrica', 'Troca de chaves e identidade'], ['PKI', 'Confiança', 'Certificados e cadeia'], ['ECC', 'IoT restrito', 'Dispositivos com poucos recursos']];
  return <section className="mx-auto max-w-5xl"><div className="mb-8 max-w-3xl"><p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-teal-200">MAPA DE SEGURANÇA APLICADA</p><h1 className="m-0 text-5xl font-extrabold tracking-tight md:text-6xl">BioCare <span className="font-serif font-semibold italic text-lime-200">Security Lab</span></h1><p className="mt-4 text-sm leading-6 text-slate-400">Um laboratório visual para apresentar onde cada mecanismo criptográfico protege um sistema de saúde conectado.</p><Badge tone="success">DEMO MODE ATIVO</Badge></div><div className="mb-7 flex items-stretch gap-2 overflow-x-auto pb-2"><ArchitectureNode title="Clínicas" subtitle="Médicos · IoT" /><Arrow /><ArchitectureNode title="TLS / mTLS" subtitle="canal autenticado" accent /><Arrow /><ArchitectureNode title="Gateway / API" /><Arrow /><ArchitectureNode title="Aplicação" /><Arrow /><ArchitectureNode title="Banco de dados" subtitle="AES-256" /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([name, result, description]) => <article key={name} className="min-h-32 rounded-2xl border border-white/10 bg-[#0c2829]/75 p-4"><strong className="block text-[15px]">{name}</strong><div className="mt-2"><Badge tone="success">{result}</Badge></div><p className="mt-3 text-xs leading-5 text-slate-400">{description}</p></article>)}</div><div className="mt-7 flex items-center justify-start gap-3 overflow-auto rounded-xl border border-white/10 bg-[#0c2829]/60 p-4 text-center"><ChainNode title="Root CA" /><span className="text-lime-200">↓</span><ChainNode title="Intermediate CA" /><span className="text-lime-200">↓</span><ChainNode title="Certificados" /><span className="text-lime-200">↓</span><ChainNode title="CRL / OCSP" /></div></section>;
}

function ArchitectureNode({ title, subtitle, accent = false }: { title: string; subtitle?: string; accent?: boolean }) { return <div className={`min-w-32 flex-1 rounded-lg border p-3 text-center text-xs font-bold ${accent ? 'border-teal-300/70 bg-teal-300/10 shadow-[0_0_24px_rgba(94,234,212,.12)]' : 'border-white/10 bg-[#0c2829]/75'}`}>{title}{subtitle && <small className="mt-1 block text-[10px] font-normal text-slate-400">{subtitle}</small>}</div>; }
function Arrow() { return <span className="self-center text-lg text-lime-200">→</span>; }
function ChainNode({ title }: { title: string }) { return <span className="min-w-28 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs font-bold">{title}</span>; }

function AesLab() {
  const [plaintext, setPlaintext] = useState('Registro fictício: pressão arterial 120/80 mmHg.');
  const [result, setResult] = useState<{ key: CryptoKey; iv: string; ciphertext: string; decrypted?: string }>();
  const [error, setError] = useState('');
  const encrypt = async () => {
    try {
      setError('');
      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));
      setResult({ key, iv: bytesToBase64(iv), ciphertext: bytesToBase64(encrypted) });
    } catch { setError('Não foi possível executar AES-GCM neste navegador.'); }
  };
  const decrypt = async () => {
    if (!result) return;
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(result.iv) }, result.key, fromBase64(result.ciphertext));
    setResult({ ...result, decrypted: decoder.decode(decrypted) });
  };
  return <Lab title="AES-256-GCM" kicker="OPERAÇÃO CRIPTOGRÁFICA REAL" description="Protege grandes volumes de dados com uma chave simétrica aleatória e um nonce único."><textarea aria-label="Texto para criptografar" value={plaintext} onChange={(event) => setPlaintext(event.target.value)} className="block min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-5 text-white outline-none placeholder:text-slate-600 focus:border-teal-300" /><div className="mt-2"><FileInput onText={setPlaintext} /></div><div className="mt-5 flex flex-wrap gap-2"><Button onClick={encrypt}>Gerar chave e criptografar</Button><Button secondary disabled={!result} onClick={decrypt}>Descriptografar</Button></div>{result && <div className="mt-5 grid gap-2"><Value label="Chave" value="AES-256 / 256 bits" secret /><Value label="IV / nonce (96 bits)" value={result.iv} /><Value label="Ciphertext + authentication tag" value={result.ciphertext} />{result.decrypted && <Notice tone="success">✓ Texto recuperado: {result.decrypted}</Notice>}</div>}{error && <Notice tone="danger">{error}</Notice>}</Lab>;
}

function ShaLab() {
  const [text, setText] = useState('Laudo fictício: amostra processada sem alterações.');
  const [originalHash, setOriginalHash] = useState('');
  const [hash, setHash] = useState('');
  const digest = async () => { const next = toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text))); setHash(next); if (!originalHash) setOriginalHash(next); };
  return <Lab title="Integridade SHA-256" kicker="OPERAÇÃO CRIPTOGRÁFICA REAL" description="Uma alteração mínima na entrada produz uma impressão digital completamente diferente."><textarea aria-label="Texto para gerar hash" value={text} onChange={(event) => setText(event.target.value)} className="block min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-5 text-white outline-none focus:border-teal-300" /><div className="mt-2"><FileInput onText={setText} /></div><div className="mt-5 flex flex-wrap gap-2"><Button onClick={digest}>Calcular SHA-256</Button><Button secondary onClick={() => { setText('Laudo fictício: amostra processada sem alterações.'); setOriginalHash(''); setHash(''); }}>Reiniciar</Button></div>{hash && <div className="mt-5 grid gap-2"><Value label="Hash SHA-256 atual" value={hash} />{originalHash && <Notice tone={originalHash === hash ? 'success' : 'danger'}>{originalHash === hash ? '✓ Integridade preservada: hashes idênticos.' : '⚠ Dados alterados: hashes diferentes.'}</Notice>}</div>}</Lab>;
}

function SignatureLab() {
  const [report, setReport] = useState(initialReport);
  const [state, setState] = useState<{ pair: CryptoKeyPair; signature: string }>();
  const [valid, setValid] = useState<boolean | null>(null);
  const sign = async () => { const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']); const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, encoder.encode(report)); setState({ pair, signature: bytesToBase64(signature) }); setValid(null); };
  const verify = async () => { if (!state) return; setValid(await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, state.pair.publicKey, fromBase64(state.signature), encoder.encode(report))); };
  return <Lab title="Assinatura digital" kicker="OPERAÇÃO CRIPTOGRÁFICA REAL · ECDSA P-256" description="Assine um laudo e altere uma palavra: a verificação ficará obviamente inválida."><Flow labels={['Documento', 'SHA-256', 'Chave privada', 'Assinatura']} /><textarea aria-label="Laudo médico" value={report} onChange={(event) => setReport(event.target.value)} className="block min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-5 text-white outline-none focus:border-teal-300" /><div className="mt-5 flex flex-wrap gap-2"><Button onClick={sign}>Gerar par e assinar</Button><Button secondary disabled={!state} onClick={verify}>Verificar assinatura</Button></div>{state && <div className="mt-5 grid gap-2"><Value label="Chave pública" value="ECDSA P-256 · verificadora" /><Value label="Chave privada" value="ECDSA P-256" secret /><Value label="Assinatura" value={state.signature} />{valid !== null && <Notice tone={valid ? 'success' : 'danger'}>{valid ? '✓ VÁLIDA — integridade e autoria verificadas.' : '✕ INVÁLIDA — o documento foi alterado ou a assinatura não corresponde.'}</Notice>}</div>}<p className="mt-5 border-l-2 border-amber-200 pl-3 text-xs leading-5 text-slate-400">Não repúdio também depende de identidade, controles legais e guarda adequada de chaves.</p></Lab>;
}

function Flow({ labels }: { labels: string[] }) { return <div className="mb-5 flex items-center gap-2 overflow-auto rounded-xl border border-dashed border-teal-300/30 bg-teal-300/5 p-3">{labels.map((label, index) => <div className="flex items-center gap-2" key={label}><span className="min-w-25 rounded-md border border-white/10 bg-[#0c2829] px-3 py-2 text-center text-[10px] font-bold">{label}</span>{index < labels.length - 1 && <span className="text-lime-200">→</span>}</div>)}</div>; }

function CompareLab() {
  const [generated, setGenerated] = useState('');
  const generate = async (kind: 'RSA' | 'ECC') => {
    if (kind === 'RSA') await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, false, ['encrypt', 'decrypt']);
    else await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey']);
    setGenerated(`Par ${kind} gerado em memória para demonstração.`);
  };
  return <Lab title="RSA × ECC" kicker="COMPARAÇÃO APLICADA" description="Criptografia assimétrica resolve identidade, troca de chaves e assinaturas — não cifra arquivos grandes."><div className="grid gap-3 md:grid-cols-2"><ComparisonCard title="RSA" value="2048 bits (mínimo comum)" description="Ampla compatibilidade. RSA-OAEP pode encapsular uma chave AES." badge="Mais pesado para IoT" tone="warning" action={() => generate('RSA')} actionText="Gerar RSA" /><ComparisonCard title="ECC" value="256 bits (P-256)" description="Alta segurança com chaves menores. Ideal para identidade e acordo de chaves ECDH." badge="Preferido em IoT" tone="success" action={() => generate('ECC')} actionText="Gerar ECC" highlight /></div>{generated && <div className="mt-4"><Notice tone="success">✓ {generated}</Notice></div>}<div className="mt-5 grid gap-3 md:grid-cols-2"><InfoCard title="Simétrica" text="AES: a mesma chave cifra e decifra dados em massa." /><InfoCard title="Assimétrica" text="RSA/ECC: par de chaves para confiança e estabelecimento de segredo." /></div></Lab>;
}

function ComparisonCard({ title, value, description, badge, tone, action, actionText, highlight = false }: { title: string; value: string; description: string; badge: string; tone: 'success' | 'warning'; action: () => void; actionText: string; highlight?: boolean }) { return <article className={`flex min-h-60 flex-col items-start gap-3 rounded-2xl border p-5 ${highlight ? 'border-lime-200/40 bg-lime-200/5' : 'border-white/10 bg-[#0c2829]/75'}`}><h3 className="m-0 text-2xl">{title}</h3><strong className="font-mono text-[11px] text-teal-100">{value}</strong><p className="text-xs leading-5 text-slate-400">{description}</p><Badge tone={tone}>{badge}</Badge><div className="mt-auto"><Button secondary={!highlight} onClick={action}>{actionText}</Button></div></article>; }
function InfoCard({ title, text }: { title: string; text: string }) { return <article className="rounded-2xl border border-white/10 bg-[#0c2829]/75 p-4"><strong>{title}</strong><p className="mt-2 text-xs leading-5 text-slate-400">{text}</p></article>; }

function HybridLab() {
  const [record, setRecord] = useState('Prontuário fictício #BC-2026: glicemia 96 mg/dL.');
  const [state, setState] = useState<{ iv: string; data: string; wrapped: string; recovered: string }>();
  const run = async () => {
    const aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const rsa = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['wrapKey', 'unwrapKey']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, encoder.encode(record));
    const wrapped = await crypto.subtle.wrapKey('raw', aes, rsa.publicKey, { name: 'RSA-OAEP' });
    const restored = await crypto.subtle.unwrapKey('raw', wrapped, rsa.privateKey, { name: 'RSA-OAEP' }, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
    const recovered = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, restored, data);
    setState({ iv: bytesToBase64(iv), data: bytesToBase64(data), wrapped: bytesToBase64(wrapped), recovered: decoder.decode(recovered) });
  };
  return <Lab title="Criptografia híbrida" kicker="OPERAÇÃO CRIPTOGRÁFICA REAL" description="AES-GCM cifra o registro; RSA-OAEP protege exclusivamente a chave AES."><textarea aria-label="Prontuário" value={record} onChange={(event) => setRecord(event.target.value)} className="block min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-5 text-white outline-none focus:border-teal-300" /><div className="my-5"><Flow labels={['Registro', 'AES-256-GCM', 'Pacote cifrado', 'RSA-OAEP', 'Recuperação']} /></div><Button onClick={run}>Executar pipeline completo</Button>{state && <div className="mt-5 grid gap-2"><Value label="IV" value={state.iv} /><Value label="Registro cifrado + tag" value={state.data} /><Value label="Chave AES protegida com RSA-OAEP" value={state.wrapped} /><Notice tone="success">✓ Chave AES recuperada e prontuário decifrado: {state.recovered}</Notice></div>}</Lab>;
}

function PkiLab({ certificates, onAdd }: { certificates: Certificate[]; onAdd: () => void }) {
  const [selected, setSelected] = useState<Certificate>(certificates[0]!);
  return <Lab title="PKI Lab" kicker="SIMULAÇÃO EDUCACIONAL DE PKI" description="Os registros de certificados e a cadeia de confiança são simulados; as operações de chaves do laboratório continuam reais."><div className="flex flex-col items-center text-center"><ChainNode title="Root CA · BioCare Root" /><span className="my-2 text-teal-100">↓</span><ChainNode title="Intermediate CA · BioCare Issuing" /><span className="my-2 text-teal-100">↓</span><div className="flex flex-wrap justify-center gap-2">{certificates.map((certificate) => <button type="button" key={certificate.serial} onClick={() => setSelected(certificate)} className="grid gap-2 rounded-lg border border-white/10 bg-[#0c2829]/75 p-3 text-left text-xs hover:border-teal-300"><span>{certificate.name}</span><Badge tone={certificate.status === 'GOOD' ? 'success' : 'danger'}>{certificate.status}</Badge></button>)}</div></div><div className="my-5 flex flex-wrap gap-2"><Button onClick={onAdd}>Emitir certificado simulado</Button><Button secondary onClick={() => setSelected(certificates[0]!)}>Validar cadeia</Button></div><article className="rounded-2xl border border-white/10 bg-[#0c2829]/75 p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="m-0 text-base">{selected.name}</h3><Badge tone={selected.status === 'GOOD' ? 'success' : 'danger'}>{selected.status}</Badge></div><div className="grid gap-2"><Value label="Subject" value={selected.subject} /><Value label="Issuer" value={selected.issuer} /><Value label="Serial Number" value={selected.serial} /><Value label="Public Key" value="ECC P-256 (metadado demonstrativo)" /><Value label="Valid From / To" value={selected.valid} /><Value label="Key Usage" value={selected.usage} /></div></article><p className="mt-5 text-xs leading-5 text-slate-400">X.509 define o formato de certificado; a CA assina identidades; a Root CA ancora a confiança; a Intermediate CA reduz a exposição da raiz.</p></Lab>;
}

function RevocationLab({ certificates, onRevoke }: { certificates: Certificate[]; onRevoke: (serial: string) => void }) {
  const [query, setQuery] = useState(certificates[0]!.serial);
  const found = certificates.find((certificate) => certificate.serial === query);
  return <Lab title="CRL / OCSP" kicker="SIMULAÇÃO EDUCACIONAL DE REVOGAÇÃO" description="A CRL lista certificados revogados. A consulta OCSP-like consulta o status de um serial individual."><div className="grid gap-2">{certificates.map((certificate) => <article key={certificate.serial} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-white/10 bg-[#0c2829]/75 p-3 sm:grid-cols-[1fr_auto_auto_auto]"><strong className="text-xs">{certificate.name}</strong><code className="font-mono text-[10px] text-teal-100">{certificate.serial}</code><Badge tone={certificate.status === 'GOOD' ? 'success' : 'danger'}>{certificate.status}</Badge>{certificate.status === 'GOOD' && <Button secondary onClick={() => onRevoke(certificate.serial)}>Revogar</Button>}</article>)}</div><label className="mt-6 grid gap-2 text-[11px] text-slate-400">Consulta OCSP-like por serial<input value={query} onChange={(event) => setQuery(event.target.value)} className="rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-xs text-white outline-none focus:border-teal-300" /></label><div className="mt-3"><Notice tone={found?.status === 'REVOKED' ? 'danger' : found ? 'success' : 'warning'}>{found ? `Status ${found.status}: ${found.status === 'REVOKED' ? 'a aplicação deve rejeitar este certificado.' : 'certificado aceito.'}` : 'Status UNKNOWN: serial não encontrado.'}</Notice></div><p className="mt-5 text-xs leading-5 text-slate-400">CRL é uma lista publicada de certificados revogados. OCSP permite verificar o status de um certificado específico sob demanda.</p></Lab>;
}

function IoTLab() {
  const [rate, setRate] = useState<number>();
  const [transmitted, setTransmitted] = useState(false);
  const transmit = async () => {
    await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey']);
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) }, key, encoder.encode(`heart-rate:${rate ?? 74}`));
    setTransmitted(true);
  };
  return <Lab title="Monitor cardíaco IoT" kicker="ECC + AES: OPERAÇÃO CRIPTOGRÁFICA REAL" description="A identidade usa ECC P-256; uma chave AES efêmera protege a telemetria da sessão."><Flow labels={['Sensor ♥', 'Identidade ECC', 'Canal AES-GCM', 'Gateway', 'BioCare API']} /><div className="my-5 flex items-end justify-between rounded-2xl border border-white/10 bg-[#0c2829]/75 p-5"><span className="text-xs text-slate-400">Frequência cardíaca simulada</span><strong className="text-4xl tracking-tight text-rose-300">{rate ?? '--'} <small className="font-mono text-[11px] text-slate-400">bpm</small></strong></div><div className="flex flex-wrap gap-2"><Button onClick={() => { setRate(62 + crypto.getRandomValues(new Uint8Array(1))[0]! % 40); setTransmitted(false); }}>Gerar telemetria</Button><Button secondary disabled={!rate} onClick={transmit}>Proteger e transmitir</Button></div>{transmitted && <div className="mt-5"><Notice tone="success">✓ Telemetria cifrada com AES-GCM; identidade ECC validada na simulação.</Notice></div>}<p className="mt-5 border-l-2 border-amber-200 pl-3 text-xs leading-5 text-slate-400">ECC P-256 usa chaves muito menores que RSA-2048 em dispositivos com recursos limitados.</p></Lab>;
}

function TlsLab() {
  const [mutual, setMutual] = useState(false);
  const [step, setStep] = useState(0);
  const sequence = mutual ? ['ClientHello + certificado do cliente', 'ServerHello + certificado do servidor', 'Validação mútua de certificados', 'Acordo de chaves', 'Canal cifrado'] : ['ClientHello', 'ServerHello + certificado', 'Validação do certificado', 'Acordo de chaves', 'Canal cifrado'];
  return <Lab title="TLS / mTLS Visualizer" kicker="VISUALIZAÇÃO DE PROTOCOLO — SIMULADA" description="Representação didática do handshake; esta tela não abre uma conexão de rede real."><div className="mb-5 flex w-fit gap-1 rounded-lg bg-black/20 p-1"><button type="button" onClick={() => { setMutual(false); setStep(0); }} className={`rounded-md px-4 py-2 text-xs ${!mutual ? 'bg-teal-200 font-bold text-[#062321]' : 'text-slate-400'}`}>TLS</button><button type="button" onClick={() => { setMutual(true); setStep(0); }} className={`rounded-md px-4 py-2 text-xs ${mutual ? 'bg-teal-200 font-bold text-[#062321]' : 'text-slate-400'}`}>mTLS</button></div><ol className="grid gap-2">{sequence.map((item, index) => <li key={item} className={`flex items-center gap-3 border-l-2 p-3 text-xs ${index <= step ? 'border-lime-200 bg-lime-200/5 text-white' : 'border-slate-700 bg-black/10 text-slate-500'}`}><b className="grid size-6 place-items-center rounded-full bg-[#183839] font-mono text-[10px]">{index + 1}</b>{item}{index === step && <span className="ml-auto"><Badge tone="warning">ATUAL</Badge></span>}</li>)}</ol><div className="mt-5"><Button onClick={() => setStep((current) => current === sequence.length - 1 ? 0 : current + 1)}>{step === sequence.length - 1 ? 'Reiniciar handshake' : 'Avançar etapa'}</Button></div>{step === sequence.length - 1 && <div className="mt-5"><Notice tone="success">✓ Canal seguro estabelecido {mutual && 'com autenticação mútua'}.</Notice></div>}</Lab>;
}

function ScenarioLab({ certificates }: { certificates: Certificate[] }) {
  const [current, setCurrent] = useState(-1);
  const steps = useMemo(() => ['IoT gera telemetria', 'Identidade/certificado validado', 'Canal seguro estabelecido', 'Médica cria o laudo', 'SHA-256 calculado', 'Laudo assinado com ECDSA', 'Cadeia PKI validada', 'Prontuário cifrado com AES-256', 'Chave AES protegida com RSA-OAEP', 'Armazenamento do pacote', 'Decifragem posterior', 'Assinatura verificada', 'Teste de adulteração: rejeitado', `Certificado revogado: ${certificates.some((certificate) => certificate.status === 'REVOKED') ? 'rejeitado' : 'pendente de revogação'}`], [certificates]);
  const run = async () => {
    await crypto.subtle.digest('SHA-256', encoder.encode(initialReport));
    setCurrent(0);
    const interval = window.setInterval(() => setCurrent((value) => { if (value >= steps.length - 1) { window.clearInterval(interval); return value; } return value + 1; }), 430);
  };
  return <Lab title="Caso completo BioCare" kicker="CENÁRIO DE APRESENTAÇÃO" description="Execute a narrativa ponta a ponta e clique em uma etapa concluída para destacá-la."><Button onClick={run}>▶ Executar cenário completo</Button><ol className="mt-6 grid gap-2 border-l border-white/10 pl-5">{steps.map((step, index) => <li key={step} className="relative before:absolute before:-left-[26px] before:top-3 before:size-2.5 before:rounded-full before:bg-[#385453] has-[button:not(:disabled)]:before:bg-lime-200"><button type="button" disabled={index > current} onClick={() => setCurrent(index)} className={`flex w-full items-center gap-3 text-left text-xs disabled:cursor-default ${index <= current ? 'text-white' : 'text-slate-600'}`}><b className="font-mono text-[10px] text-teal-100">{String(index + 1).padStart(2, '0')}</b><span>{step}</span>{index <= current && <span className="ml-auto"><Badge tone={step.includes('rejeitado') ? 'danger' : 'success'}>{step.includes('rejeitado') ? 'BLOQUEADO' : 'OK'}</Badge></span>}</button></li>)}</ol>{current >= 0 && <div className="mt-5"><Notice tone="success">Etapa {current + 1}: {steps[current]}</Notice></div>}</Lab>;
}

function Notice({ children, tone }: { children: ReactNode; tone: 'success' | 'warning' | 'danger' }) {
  const tones = { success: 'border-lime-300/25 bg-lime-300/10 text-lime-100', warning: 'border-amber-300/25 bg-amber-300/10 text-amber-100', danger: 'border-rose-300/25 bg-rose-300/10 text-rose-100' };
  return <div className={`rounded-lg border p-3 text-xs leading-5 ${tones[tone]}`}>{children}</div>;
}

export default function BioCareSecurityLab() {
  const [active, setActive] = useState<ModuleId>('overview');
  const [certificates, setCertificates] = useState(starterCertificates);
  const selected = modules.find((module) => module.id === active) ?? modules[0]!;
  const revoke = (serial: string) => setCertificates((items) => items.map((item) => item.serial === serial ? { ...item, status: 'REVOKED' } : item));
  const addCertificate = () => setCertificates((items) => [...items, { name: 'Nova Clínica Demo', subject: 'CN=clinica-demo.biocare', issuer: 'BioCare Intermediate CA', serial: `BC-${crypto.getRandomValues(new Uint32Array(1))[0]!.toString(16).toUpperCase()}`, usage: 'Client Authentication', status: 'GOOD', valid: '2026–2027' }]);
  const reset = () => { setActive('overview'); setCertificates(starterCertificates); };
  const content: Record<ModuleId, ReactNode> = { overview: <Overview />, aes: <AesLab />, sha: <ShaLab />, signature: <SignatureLab />, compare: <CompareLab />, hybrid: <HybridLab />, pki: <PkiLab certificates={certificates} onAdd={addCertificate} />, revocation: <RevocationLab certificates={certificates} onRevoke={revoke} />, iot: <IoTLab />, tls: <TlsLab />, scenario: <ScenarioLab certificates={certificates} /> };
  return <main className="min-h-screen bg-[#071a1c] text-white selection:bg-lime-200 selection:text-[#071a1c]"><a href="#workspace" className="fixed -top-20 left-3 z-50 bg-white p-3 text-black focus:top-3">Pular navegação</a><div className="grid min-h-screen lg:grid-cols-[245px_minmax(0,1fr)]"><aside className="border-b border-white/10 bg-[#061719]/85 p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r"><div className="flex items-center gap-3 px-2 pb-4"><span className="grid size-8 place-items-center bg-lime-200 text-lg text-[#062321] [clip-path:polygon(50%_0,61%_38%,100%_50%,61%_61%,50%_100%,39%_61%,0_50%,39%_38%)]">✦</span><div className="text-xl font-extrabold tracking-tight">BioCare<small className="block font-mono text-[10px] tracking-[0.16em] text-teal-200">SECURITY LAB</small></div></div><nav aria-label="Módulos do laboratório" className="flex gap-1 overflow-x-auto lg:flex-col">{modules.map((module) => <button type="button" onClick={() => setActive(module.id)} key={module.id} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition ${active === module.id ? 'border-l-2 border-lime-200 bg-teal-200/10 text-white' : 'text-slate-400 hover:bg-teal-200/10 hover:text-white'}`}><i className="w-4 text-center not-italic text-teal-200">{module.icon}</i>{module.label}</button>)}</nav><div className="mt-auto hidden gap-3 px-2 pt-5 lg:grid"><Badge tone="success">Web Crypto</Badge><span className="text-[11px] leading-5 text-slate-500">Chaves privadas nunca são persistidas.</span></div></aside><div className="min-w-0"><header className="flex h-14 items-center justify-between border-b border-white/10 px-5 font-mono text-[10px] text-slate-400 sm:px-8"><span><i className="mr-2 inline-block size-2 rounded-full bg-lime-200 shadow-[0_0_10px_#d9f99d]" />Ambiente educacional · dados fictícios</span><button type="button" onClick={reset} className="rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] text-white hover:border-teal-300 hover:text-teal-100">↻ Reset Demo</button></header><div className="grid xl:grid-cols-[minmax(0,1fr)_270px]"><div id="workspace" className="min-w-0 px-5 py-9 sm:px-9 lg:px-14">{content[active]}</div><aside className="hidden border-l border-white/10 bg-[#061719]/60 p-6 xl:flex xl:min-h-[calc(100vh-56px)] xl:flex-col"><p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-teal-200">CONCEITO ATUAL</p><h2 className="m-0 text-xl font-bold">{selected.label}</h2><p className="mt-3 text-xs leading-5 text-slate-400">{selected.concept}</p><div className="mt-3"><Badge tone={['pki', 'revocation', 'tls'].includes(active) ? 'warning' : 'success'}>{['pki', 'revocation', 'tls'].includes(active) ? 'SIMULAÇÃO EDUCACIONAL' : 'CRIPTOGRAFIA REAL NO NAVEGADOR'}</Badge></div><small className="mt-auto text-[10px] leading-5 text-slate-500">Glossário: AES = cifra simétrica · PKI = infraestrutura de chaves públicas · CA = autoridade certificadora.</small></aside></div></div></div></main>;
}
