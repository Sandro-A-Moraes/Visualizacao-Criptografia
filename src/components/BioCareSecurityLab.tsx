'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { decoder, encoder, fromBase64 as unbase64, toBase64 as base64, toHex as hex } from './security-lab/crypto';
import type { Certificate, ModuleId, ProcessStep, Tone } from './security-lab/types';
const initialReport =
  'Paciente: João Silva\nFrequência cardíaca: 76 bpm\nAvaliação: estável.';
const modules: Array<{
  id: ModuleId;
  icon: string;
  label: string;
  concept: string;
}> = [
  {
    id: 'overview',
    icon: '◈',
    label: 'Visão geral',
    concept:
      'Cada camada protege uma propriedade diferente: confidencialidade, integridade, autenticidade ou confiança.',
  },
  {
    id: 'sha',
    icon: '#',
    label: 'SHA-256',
    concept:
      'Hash transforma bytes de qualquer tamanho em um digest fixo de 256 bits.',
  },
  {
    id: 'aes',
    icon: '⌁',
    label: 'AES-256-GCM',
    concept:
      'AES-GCM cifra dados e autentica o ciphertext usando uma chave de sessão e IV único.',
  },
  {
    id: 'signature',
    icon: '✦',
    label: 'Assinatura digital',
    concept:
      'ECDSA usa a chave privada para assinar e a pública para verificar a autoria e integridade.',
  },
  {
    id: 'hybrid',
    icon: '◇',
    label: 'Criptografia híbrida',
    concept: 'AES cifra os dados; RSA-OAEP protege apenas a pequena chave AES.',
  },
  {
    id: 'compare',
    icon: '⇄',
    label: 'RSA × ECC',
    concept:
      'RSA e ECC são assimétricos. ECC reduz o material de chave para dispositivos restritos.',
  },
  {
    id: 'pki',
    icon: '⌘',
    label: 'Laboratório PKI',
    concept:
      'Uma cadeia de confiança liga uma identidade a uma Root CA confiável.',
  },
  {
    id: 'revocation',
    icon: '!',
    label: 'CRL / OCSP',
    concept:
      'Certificados revogados devem ser rejeitados mesmo antes de seu vencimento.',
  },
  {
    id: 'iot',
    icon: '♥',
    label: 'IoT cardíaco',
    concept:
      'ECDH estabelece o segredo de sessão; AES-GCM protege a telemetria.',
  },
  {
    id: 'tls',
    icon: '↔',
    label: 'TLS / mTLS',
    concept:
      'TLS negocia um canal seguro; mTLS adiciona a autenticação do cliente.',
  },
  {
    id: 'scenario',
    icon: '▶',
    label: 'Caso completo',
    concept:
      'O fluxo conecta identidade, transmissão, assinatura, armazenamento e validação.',
  },
];
const initialCertificates: Certificate[] = [
  {
    name: 'Dra. Marina Costa',
    serial: 'BC-9AA12',
    subject: 'CN=Dra. Marina Costa',
    issuer: 'BioCare Intermediate CA',
    usage: 'Digital Signature',
    status: 'GOOD',
    valid: '2026-01-01 até 2028-01-01',
  },
  {
    name: 'API BioCare',
    serial: 'BC-4F761',
    subject: 'CN=api.biocare.demo',
    issuer: 'BioCare Intermediate CA',
    usage: 'Server Authentication',
    status: 'GOOD',
    valid: '2026-01-01 até 2027-01-01',
  },
  {
    name: 'Monitor CARD-001',
    serial: 'BC-11D09',
    subject: 'CN=CARD-001',
    issuer: 'BioCare Intermediate CA',
    usage: 'Client Authentication',
    status: 'GOOD',
    valid: '2026-01-01 até 2027-01-01',
  },
];

const statusTone = (status: string): Tone =>
  status === 'GOOD' || status === 'VALID'
    ? 'success'
    : status === 'REVOKED' || status === 'INVALID'
      ? 'danger'
      : 'warning';

function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const styles: Record<Tone, string> = {
    success: 'border-lime-300/30 bg-lime-300/10 text-lime-100',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    danger: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
    neutral: 'border-teal-300/30 bg-teal-300/10 text-teal-100',
  };
  return (
    <span
      className={`inline-flex w-fit rounded border px-2 py-1 font-mono text-[10px] tracking-wide ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        secondary
          ? 'rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold transition hover:border-teal-200 disabled:opacity-40'
          : 'rounded-lg bg-lime-200 px-3 py-2 text-xs font-extrabold text-[#062321] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-300/20 disabled:opacity-40'
      }
    >
      {children}
    </button>
  );
}
function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl">
      <p className="mb-2 font-mono text-[10px] tracking-[.18em] text-teal-200">
        {kicker}
      </p>
      <h1 className="m-0 text-4xl font-extrabold tracking-tight md:text-5xl">
        {title}
      </h1>
      {children}
    </section>
  );
}
function Notice({ tone, children }: { tone: Tone; children: ReactNode }) {
  const colors: Record<Tone, string> = {
    success: 'border-lime-300/30 bg-lime-300/10 text-lime-100',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    danger: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
    neutral: 'border-teal-300/30 bg-teal-300/10 text-teal-100',
  };
  return (
    <div className={`rounded-xl border p-3 text-xs leading-5 ${colors[tone]}`}>
      {children}
    </div>
  );
}

function BytesViewer({ label, value }: { label: string; value: string }) {
  const [view, setView] = useState<'Humano' | 'HEX' | 'Base64' | 'Bytes'>(
    'Humano'
  );
  const bytes = encoder.encode(value);
  const output =
    view === 'Humano'
      ? value
      : view === 'HEX'
        ? hex(bytes)
        : view === 'Base64'
          ? base64(bytes)
          : `[${[...bytes].join(', ')}]`;
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <strong className="text-xs">{label}</strong>
        <div className="flex rounded-md bg-white/5 p-0.5">
          {(['Humano', 'HEX', 'Base64', 'Bytes'] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setView(item)}
              className={`rounded px-2 py-1 font-mono text-[9px] ${view === item ? 'bg-teal-200 text-[#062321]' : 'text-slate-400'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <code className="block max-h-28 overflow-auto break-all rounded bg-black/25 p-2 font-mono text-[10px] leading-5 text-teal-100">
        {output}
      </code>
      <small className="mt-2 block text-[10px] text-slate-500">
        {bytes.length} bytes · algoritmos criptográficos operam sobre bytes.
      </small>
    </article>
  );
}
function TechnicalDetails({
  algorithm,
  input,
  output,
  property,
  children,
}: {
  algorithm: string;
  input: string;
  output: string;
  property: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      className="rounded-xl border border-teal-300/20 bg-teal-300/5"
    >
      <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-teal-100">
        Detalhes técnicos {open ? '−' : '+'}
      </summary>
      <div className="grid gap-2 border-t border-teal-300/15 p-4 text-xs sm:grid-cols-2">
        <Info label="Algoritmo" value={algorithm} />
        <Info label="Entrada" value={input} />
        <Info label="Saída" value={output} />
        <Info label="Propriedade" value={property} />
        {children}
      </div>
    </details>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block font-mono text-[9px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-xs text-slate-200">{value}</span>
    </div>
  );
}
function Process({
  steps,
  active,
  onSelect,
}: {
  steps: ProcessStep[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const selected = steps[active]!;
  return (
    <>
      <div className="my-5 flex items-stretch gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div className="flex items-center gap-2" key={step.title}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={`min-h-24 min-w-36 rounded-xl border p-3 text-left transition ${active === index ? 'border-lime-200 bg-lime-200/10 shadow-lg shadow-lime-300/5' : 'border-white/10 bg-[#0c2829]/80 hover:border-teal-200'}`}
            >
              <span className="font-mono text-[9px] text-teal-100">
                {index === 0
                  ? 'INPUT'
                  : index === steps.length - 1
                    ? 'VERIFICAÇÃO'
                    : `STEP ${index}`}
              </span>
              <strong className="mt-1 block text-xs">{step.title}</strong>
            </button>
            {index < steps.length - 1 && (
              <span className="text-lg text-lime-200">→</span>
            )}
          </div>
        ))}
      </div>
      <article className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{selected.title}</Badge>
          {selected.algorithm && <Badge>{selected.algorithm}</Badge>}
        </div>
        <p className="m-0 text-xs leading-5 text-slate-300">
          {selected.detail}
        </p>
        {selected.data && (
          <code className="mt-3 block max-h-24 overflow-auto break-all rounded bg-black/25 p-2 font-mono text-[10px] text-teal-100">
            {selected.data}
          </code>
        )}
        {selected.property && (
          <p className="mt-3 text-[11px] text-lime-100">
            Propriedade fornecida: {selected.property}
          </p>
        )}
      </article>
    </>
  );
}

function ShaLab() {
  const [document, setDocument] = useState(initialReport);
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  const [step, setStep] = useState(0);
  const calculate = async () => {
    const digest = hex(
      await crypto.subtle.digest('SHA-256', encoder.encode(document))
    );
    setHashA(digest);
    setHashB(digest);
    setStep(4);
  };
  const tamper = async () => {
    const changed = document.replace('João', 'Joao');
    setDocument(changed);
    setHashB(
      hex(await crypto.subtle.digest('SHA-256', encoder.encode(changed)))
    );
    setStep(4);
  };
  const steps: ProcessStep[] = [
    {
      title: 'Documento original',
      detail: 'Texto recebido para verificação de integridade.',
      data: document,
    },
    {
      title: 'Codificação UTF-8',
      detail: 'O texto é transformado em bytes antes do hash.',
      data: hex(encoder.encode(document)),
    },
    {
      title: 'SHA-256',
      detail: 'SHA-256 mapeia bytes de qualquer tamanho para um digest fixo.',
      algorithm: 'SHA-256',
    },
    {
      title: 'Digest de 256 bits',
      detail:
        'O resultado possui sempre 256 bits, 32 bytes ou 64 caracteres hexadecimais.',
      data: hashA || 'Clique em Calcular SHA-256',
    },
    {
      title: 'Comparação',
      detail:
        hashA && hashB
          ? hashA === hashB
            ? 'Hash A foi calculado do documento original e Hash B do recebido. A = B, portanto o conteúdo não mudou.'
            : 'Hash A e Hash B foram calculados de bytes diferentes. A ≠ B, portanto o conteúdo recebido foi alterado.'
          : 'Compare hashes após calcular.',
      data: hashA && hashB ? `A: ${hashA}\nB: ${hashB}` : undefined,
      property: 'Integridade',
    },
  ];
  return (
    <Section
      title="SHA-256: bytes até o digest"
      kicker="OPERAÇÃO CRIPTOGRÁFICA REAL"
    >
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
        Veja cada transformação: texto → bytes UTF-8 → digest fixo. Alterar
        apenas o acento em “João” muda totalmente o hash.
      </p>
      <textarea
        value={document}
        aria-label="Documento para hash"
        onChange={(event) => setDocument(event.target.value)}
        className="mt-5 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs outline-none focus:border-teal-200"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={calculate}>Calcular SHA-256</Button>
        <Button secondary onClick={tamper}>
          Tamper Test: João → Joao
        </Button>
      </div>
      <BytesViewer label="Representação do documento" value={document} />
      <Process steps={steps} active={step} onSelect={setStep} />
      <TechnicalDetails
        algorithm="SHA-256"
        input="Bytes UTF-8"
        output="Digest hexadecimal de 64 caracteres"
        property="Integridade"
      >
        <Info label="Tamanho fixo" value="256 bits / 32 bytes" />
        <Info
          label="Observação"
          value="Hash não é criptografia e não pode ser revertido."
        />
      </TechnicalDetails>
    </Section>
  );
}

function AesLab() {
  const [plain, setPlain] = useState(
    'Prontuário fictício: pressão arterial 120/80 mmHg.'
  );
  const [result, setResult] = useState<{
    key: CryptoKey;
    rawKey: string;
    iv: string;
    cipher: string;
    tag: string;
    recovered?: string;
    failure?: string;
  }>();
  const [step, setStep] = useState(0);
  const encrypt = async () => {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const rawKey = base64(await crypto.subtle.exportKey('raw', key));
    const ivBytes = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivBytes },
        key,
        encoder.encode(plain)
      )
    );
    const tag = encrypted.slice(-16);
    setResult({
      key,
      rawKey,
      iv: base64(ivBytes),
      cipher: base64(encrypted.slice(0, -16)),
      tag: base64(tag),
    });
    setStep(6);
  };
  const decrypt = async (wrong = false) => {
    if (!result) return;
    try {
      const key = wrong
        ? await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['decrypt']
          )
        : result.key;
      const recovered = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: unbase64(result.iv) },
        key,
        new Uint8Array([...unbase64(result.cipher), ...unbase64(result.tag)])
      );
      setResult({
        ...result,
        recovered: decoder.decode(recovered),
        failure: undefined,
      });
    } catch {
      setResult({
        ...result,
        failure: wrong
          ? 'A chave AES é diferente; GCM não consegue autenticar nem recuperar o plaintext.'
          : 'O ciphertext ou a tag foi modificado; a autenticação GCM falhou antes de expor dados.',
      });
    }
  };
  const steps: ProcessStep[] = [
    {
      title: 'Plaintext',
      detail: 'Dados legíveis antes da proteção.',
      data: plain,
    },
    {
      title: 'UTF-8 bytes',
      detail: 'O plaintext vira bytes.',
      data: hex(encoder.encode(plain)),
    },
    {
      title: 'Chave AES aleatória',
      detail:
        'Chave única de 256 bits gerada por CSPRNG. Exibida somente nesta demo.',
      data: result?.rawKey || 'Ainda não gerada',
      algorithm: 'AES-256',
    },
    {
      title: 'IV / nonce',
      detail:
        'IV aleatório de 96 bits; nunca deve ser repetido com a mesma chave.',
      data: result?.iv || 'Ainda não gerado',
    },
    {
      title: 'AES-256-GCM',
      detail: 'GCM cifra bytes e produz uma tag de autenticação.',
      algorithm: 'AES-GCM',
    },
    {
      title: 'Ciphertext + tag',
      detail: 'Ciphertext não é legível; a tag detecta alterações.',
      data: result
        ? `Ciphertext: ${result.cipher}\nTag: ${result.tag}`
        : 'Execute a cifra',
    },
    {
      title: 'Verificação',
      detail:
        result?.failure ??
        (result?.recovered
          ? `O texto recuperado é igual ao original porque chave, IV, ciphertext e tag são válidos: “${result.recovered}”.`
          : 'Decifre para verificar autenticidade e recuperar o plaintext.'),
      property: 'Confidencialidade + integridade autenticada',
    },
  ];
  return (
    <Section
      title="AES-256-GCM: pipeline de cifragem"
      kicker="OPERAÇÃO CRIPTOGRÁFICA REAL"
    >
      <p className="mt-3 text-sm text-slate-400">
        AES cifra dados em massa. O pacote contém ciphertext, IV e tag — a chave
        permanece efêmera em memória.
      </p>
      <textarea
        value={plain}
        aria-label="Plaintext AES"
        onChange={(event) => setPlain(event.target.value)}
        className="mt-5 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs outline-none focus:border-teal-200"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={encrypt}>Gerar chave e cifrar</Button>
        <Button secondary disabled={!result} onClick={() => decrypt()}>
          Decifrar pacote
        </Button>
        <Button secondary disabled={!result} onClick={() => decrypt(true)}>
          Teste: chave errada
        </Button>
      </div>
      <BytesViewer label="Plaintext em representações" value={plain} />
      <Process steps={steps} active={step} onSelect={setStep} />
      <TechnicalDetails
        algorithm="AES-256-GCM"
        input="Plaintext UTF-8 + chave de 256 bits + IV de 96 bits"
        output="Ciphertext + tag de 128 bits"
        property="Confidencialidade e integridade autenticada"
      />
    </Section>
  );
}

function SignatureLab() {
  const [text, setText] = useState(initialReport);
  const [state, setState] = useState<{
    pair: CryptoKeyPair;
    digest: string;
    signature: string;
  }>();
  const [valid, setValid] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const sign = async () => {
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
    const digest = hex(
      await crypto.subtle.digest('SHA-256', encoder.encode(text))
    );
    const signature = base64(
      await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        pair.privateKey,
        encoder.encode(text)
      )
    );
    setState({ pair, digest, signature });
    setValid(null);
    setStep(4);
  };
  const verify = async () => {
    if (state)
      setValid(
        await crypto.subtle.verify(
          { name: 'ECDSA', hash: 'SHA-256' },
          state.pair.publicKey,
          unbase64(state.signature),
          encoder.encode(text)
        )
      );
  };
  const steps: ProcessStep[] = [
    { title: 'Documento', detail: 'Laudo que será assinado.', data: text },
    {
      title: 'SHA-256',
      detail: 'O documento é representado por um digest.',
      data: state?.digest || 'Assine para calcular',
      algorithm: 'SHA-256',
    },
    {
      title: 'Chave privada',
      detail:
        'A chave privada P-256 assina. Nunca é persistida ou compartilhada.',
      algorithm: 'ECDSA P-256',
    },
    {
      title: 'Assinatura',
      detail:
        'ECDSA produz bytes de assinatura para este documento e esta chave.',
      data: state?.signature || 'Assine para gerar',
    },
    {
      title: 'Verificação pública',
      detail:
        valid === null
          ? 'A chave pública, o documento e a assinatura serão verificados.'
          : valid
            ? 'A verificação recalculou o digest do documento recebido. A assinatura corresponde a esse digest: VÁLIDA.'
            : 'O documento atual produz outro digest. A assinatura criada antes não corresponde: INVÁLIDA.',
      property: 'Autenticidade + integridade',
    },
  ];
  return (
    <Section
      title="Assinatura digital: origem verificável"
      kicker="ECDSA P-256 + SHA-256 REAIS"
    >
      <p className="mt-3 text-sm text-slate-400">
        Assine o laudo, verifique-o e depois altere o conteúdo para enxergar
        exatamente o ponto de falha.
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-label="Laudo para assinatura"
        className="mt-5 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs outline-none focus:border-teal-200"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={sign}>Gerar chaves e assinar</Button>
        <Button secondary disabled={!state} onClick={verify}>
          Verificar assinatura
        </Button>
        <Button
          secondary
          disabled={!state}
          onClick={() => {
            setText((value) => `${value}\nObservação alterada.`);
            setValid(null);
          }}
        >
          Tamper Test
        </Button>
      </div>
      <Process steps={steps} active={step} onSelect={setStep} />
      <TechnicalDetails
        algorithm="ECDSA P-256 com SHA-256"
        input="Documento UTF-8 + chave privada"
        output="Assinatura Base64"
        property="Autenticidade e integridade"
      >
        <Info label="Verificador" value="Chave pública P-256" />
        <Info
          label="Limite"
          value="Não repúdio requer controles legais e gestão de chaves."
        />
      </TechnicalDetails>
    </Section>
  );
}

function HybridLab() {
  const [record, setRecord] = useState(
    'Registro médico fictício: glicemia 96 mg/dL.'
  );
  const [data, setData] = useState<{
    iv: string;
    cipher: string;
    wrapped: string;
    recovered: string;
  }>();
  const [step, setStep] = useState(0);
  const run = async () => {
    const aes = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const rsa = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['wrapKey', 'unwrapKey']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aes,
      encoder.encode(record)
    );
    const wrapped = await crypto.subtle.wrapKey('raw', aes, rsa.publicKey, {
      name: 'RSA-OAEP',
    });
    const restored = await crypto.subtle.unwrapKey(
      'raw',
      wrapped,
      rsa.privateKey,
      { name: 'RSA-OAEP' },
      { name: 'AES-GCM', length: 256 },
      true,
      ['decrypt']
    );
    const recovered = decoder.decode(
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, restored, cipher)
    );
    setData({
      iv: base64(iv),
      cipher: base64(cipher),
      wrapped: base64(wrapped),
      recovered,
    });
    setStep(6);
  };
  const steps: ProcessStep[] = [
    { title: 'Registro médico', detail: 'Dados em plaintext.', data: record },
    {
      title: 'Chave AES de sessão',
      detail: 'Chave aleatória eficiente para grandes dados.',
      algorithm: 'AES-256',
    },
    {
      title: 'AES-GCM',
      detail: 'Cifra o registro e adiciona autenticação.',
      data: data?.cipher || 'Execute o pipeline',
    },
    {
      title: 'IV + dados autenticados',
      detail: 'O IV acompanha ciphertext para permitir a decifragem.',
      data: data?.iv || 'Pendente',
    },
    {
      title: 'RSA-OAEP encapsula chave',
      detail: 'RSA não cifra o registro: protege somente a chave AES.',
      data: data?.wrapped || 'Pendente',
      algorithm: 'RSA-OAEP SHA-256',
    },
    {
      title: 'Pacote final',
      detail:
        'Ciphertext + IV + chave AES encapsulada podem ser armazenados juntos.',
    },
    {
      title: 'Recuperação',
      detail: data
        ? `RSA recuperou a chave AES; AES-GCM autenticou e decifrou. Texto recuperado: “${data.recovered}”.`
        : 'A recuperação será exibida após executar.',
      property: 'Confidencialidade + integridade',
    },
  ];
  return (
    <Section title="Criptografia híbrida" kicker="AES-256-GCM + RSA-OAEP REAIS">
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
        AES é eficiente para dados grandes. RSA é usado apenas para
        proteger/estabelecer a chave AES. Essa combinação é a criptografia
        híbrida.
      </p>
      <textarea
        value={record}
        onChange={(event) => setRecord(event.target.value)}
        aria-label="Registro médico"
        className="mt-5 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs outline-none focus:border-teal-200"
      />
      <div className="mt-3">
        <Button onClick={run}>Executar cifragem e recuperação</Button>
      </div>
      <Process steps={steps} active={step} onSelect={setStep} />
      <Notice tone="neutral">
        ECC não cifra o prontuário diretamente: em IoT, ECDH combina chave
        privada do dispositivo e chave pública do servidor para derivar um
        segredo compartilhado, então AES cifra os dados.
      </Notice>
      <div className="mt-4">
        <TechnicalDetails
          algorithm="AES-GCM + RSA-OAEP/SHA-256"
          input="Registro UTF-8"
          output="Pacote cifrado + chave AES encapsulada"
          property="Confidencialidade e integridade"
        />
      </div>
    </Section>
  );
}

function CompareLab() {
  const rows = [
    ['Tipo', 'Assimétrica', 'Assimétrica', 'Simétrica'],
    ['Tamanho típico', '2048–3072 bits', 'P-256: 256 bits', '256 bits'],
    [
      'Uso principal',
      'Encapsular chave / assinatura',
      'ECDH / ECDSA / identidade',
      'Dados em massa',
    ],
    [
      'Recursos',
      'Mais CPU, banda e armazenamento',
      'Menor material de chave',
      'Muito eficiente',
    ],
    ['IoT', 'Menos indicado', 'Muito indicado', 'Sessão protegida'],
  ];
  return (
    <Section
      title="RSA, ECC e AES: papéis diferentes"
      kicker="COMPARAÇÃO TÉCNICA"
    >
      <div className="mt-5 overflow-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-teal-300/10 text-teal-100">
            <tr>
              {['Característica', 'RSA', 'ECC', 'AES'].map((item) => (
                <th key={item} className="p-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-white/10">
                {row.map((item, index) => (
                  <td
                    key={item}
                    className={`p-3 ${index === 0 ? 'font-bold text-slate-300' : 'text-slate-400'}`}
                  >
                    {item}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Notice tone="warning">
          RSA possui material de chave maior; é útil pela ampla compatibilidade,
          mas custa mais recursos.
        </Notice>
        <Notice tone="success">
          ECC entrega segurança comparável com chaves menores, reduzindo banda e
          armazenamento em dispositivos IoT.
        </Notice>
      </div>
      <TechnicalDetails
        algorithm="RSA-OAEP / ECDH / ECDSA / AES-GCM"
        input="Chaves assimétricas ou chave simétrica"
        output="Segredo compartilhado, assinatura ou ciphertext"
        property="Confiança, autenticidade ou confidencialidade"
      />
    </Section>
  );
}

function PkiLab({
  certificates,
  add,
}: {
  certificates: Certificate[];
  add: () => void;
}) {
  const [selected, setSelected] = useState(certificates[0]!);
  return (
    <Section
      title="PKI: cadeia explícita de confiança"
      kicker="PKI SIMULADA · CRIPTOGRAFIA DE CHAVE REAL EM OUTROS MÓDULOS"
    >
      <p className="mt-3 text-sm text-slate-400">
        A Intermediate CA é assinada pela Root CA; os certificados de médico,
        servidor, clínica e IoT são assinados pela Intermediate. Assim a
        aplicação chega à raiz confiável.
      </p>
      <div className="my-5 flex items-center gap-2 overflow-auto pb-2">
        {[
          'ROOT CA',
          'Root certificate',
          'INTERMEDIATE CA',
          'Intermediate certificate',
          'DOCTOR CERTIFICATE',
          'Public key',
          'Doctor identity',
        ].map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSelected(certificates[Math.min(2, Math.floor(index / 2))]!)
              }
              className="min-w-32 rounded-xl border border-white/10 bg-[#0c2829] p-3 text-xs font-bold hover:border-teal-200"
            >
              {item}
            </button>
            {index < 6 && <span className="text-lime-200">→</span>}
          </div>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {certificates.map((certificate) => (
          <button
            type="button"
            key={certificate.serial}
            onClick={() => setSelected(certificate)}
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-left text-xs hover:border-teal-200"
          >
            <strong>{certificate.name}</strong>
            <span className="mt-2 block font-mono text-[10px] text-teal-100">
              {certificate.serial}
            </span>
          </button>
        ))}
      </div>
      <div className="my-4">
        <Button onClick={add}>Emitir certificado de clínica simulado</Button>
      </div>
      <article className="rounded-xl border border-teal-300/20 bg-teal-300/5 p-4">
        <div className="mb-3 flex justify-between">
          <strong>{selected.name}</strong>
          <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Subject" value={selected.subject} />
          <Info
            label="Issuer / assinatura"
            value={`${selected.issuer} assina este certificado`}
          />
          <Info label="Serial Number" value={selected.serial} />
          <Info label="Public Key" value="ECC P-256 (metadado de simulação)" />
          <Info label="Validade" value={selected.valid} />
          <Info label="Key Usage" value={selected.usage} />
        </div>
      </article>
    </Section>
  );
}

function RevocationLab({
  certificates,
  revoke,
}: {
  certificates: Certificate[];
  revoke: (serial: string) => void;
}) {
  const [serial, setSerial] = useState(certificates[0]!.serial);
  const certificate = certificates.find((item) => item.serial === serial);
  const rejected = certificate?.status === 'REVOKED';
  const steps: ProcessStep[] = [
    {
      title: 'Serial do certificado',
      detail: 'A aplicação lê o serial apresentado pelo cliente.',
      data: serial,
    },
    {
      title: 'Pesquisa na CRL',
      detail: 'A CRL simulada contém os serials revogados.',
    },
    {
      title: rejected ? 'Encontrado: SIM' : 'Encontrado: NÃO',
      detail: rejected
        ? 'O serial aparece na lista de revogação.'
        : 'O serial não aparece na CRL.',
    },
    {
      title: 'Decisão da aplicação',
      detail: rejected
        ? 'REJEITAR conexão: o certificado foi revogado.'
        : 'Continuar para a próxima validação.',
      property: 'Confiança e revogação',
    },
  ];
  return (
    <Section
      title="CRL e OCSP: decisão de aceitação"
      kicker="REVOGAÇÃO SIMULADA"
    >
      <div className="mt-5 grid gap-2">
        {certificates.map((item) => (
          <article
            key={item.serial}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs"
          >
            <span>
              {item.name}{' '}
              <code className="ml-2 font-mono text-teal-100">
                {item.serial}
              </code>
            </span>
            <Badge tone={statusTone(item.status)}>{item.status}</Badge>
            {item.status === 'GOOD' && (
              <Button secondary onClick={() => revoke(item.serial)}>
                Revogar agora
              </Button>
            )}
          </article>
        ))}
      </div>
      <label className="mt-5 block text-xs text-slate-400">
        OCSP-like: serial consultado
        <input
          value={serial}
          onChange={(event) => setSerial(event.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-xs text-white outline-none focus:border-teal-200"
        />
      </label>
      <Process steps={steps} active={3} onSelect={() => undefined} />
      <Notice tone={rejected ? 'danger' : certificate ? 'success' : 'warning'}>
        {certificate
          ? `OCSP responder → ${certificate.status}. A aplicação ${rejected ? 'rejeita' : 'aceita'} o certificado.`
          : 'OCSP responder → UNKNOWN. A aplicação não possui status confiável para este serial.'}
      </Notice>
    </Section>
  );
}

function IoTLab() {
  const [payload, setPayload] = useState('');
  const [step, setStep] = useState(0);
  const make = async () => {
    const value = JSON.stringify({
      heartRate: 82,
      timestamp: new Date().toISOString(),
      deviceId: 'CARD-001',
    });
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = base64(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(value)
      )
    );
    setPayload(`${value}\n\nIV: ${base64(iv)}\nCiphertext: ${cipher}`);
    setStep(7);
  };
  const steps: ProcessStep[] = [
    'Sensor cardíaco',
    'Par de chaves ECC',
    'Certificado do dispositivo',
    'Validação de certificado',
    'ECDH: segredo compartilhado',
    'Chave AES derivada',
    'AES-GCM: payload cifrado',
    'Gateway → BioCare',
  ].map((title, index) => ({
    title,
    detail:
      index < 4
        ? 'Identidade e autorização do dispositivo (simulação de certificado).'
        : index === 4
          ? 'ECDH não cifra dados; cria material secreto compartilhado.'
          : index === 5
            ? 'Um segredo simétrico de sessão é derivado.'
            : index === 6
              ? 'AES-GCM cifra os bytes do JSON.'
              : payload || 'Gere a transmissão para visualizar os bytes.',
    property:
      index >= 6
        ? 'Confidencialidade + integridade'
        : 'Identidade / estabelecimento de chave',
  }));
  return (
    <Section title="IoT: ECC termina, AES começa" kicker="ECDH + AES-GCM REAIS">
      <p className="mt-3 text-sm text-slate-400">
        O sensor envia JSON. ECC autentica e estabelece o segredo; AES-GCM
        protege a carga de telemetria.
      </p>
      <div className="mt-4">
        <Button onClick={make}>Gerar e proteger payload cardíaco</Button>
      </div>
      {payload && (
        <div className="mt-4">
          <BytesViewer label="JSON, IV e ciphertext" value={payload} />
        </div>
      )}
      <Process steps={steps} active={step} onSelect={setStep} />
    </Section>
  );
}

function TlsLab() {
  const [mutual, setMutual] = useState(false);
  const [step, setStep] = useState(0);
  const messages = mutual
    ? [
        'ClientHello',
        'ServerHello + certificado do servidor',
        'Cliente valida certificado',
        'Cliente envia certificado',
        'Servidor valida cliente',
        'Acordo de chaves',
        'Canal cifrado + dados',
      ]
    : [
        'ClientHello',
        'ServerHello + certificado',
        'Cliente valida certificado',
        'Acordo de chaves',
        'Canal cifrado + dados',
      ];
  const steps = messages.map((title, index) => ({
    title,
    detail:
      index === 0
        ? 'O cliente anuncia versões TLS e capacidades.'
        : title.includes('certificado')
          ? 'O certificado liga uma chave pública à identidade; a cadeia e a revogação são verificadas.'
          : title.includes('Acordo')
            ? 'As partes estabelecem segredo de sessão sem transmitir a chave AES em claro.'
            : title.includes('cifrado')
              ? 'Dados da aplicação passam em AES-GCM após o handshake.'
              : 'Etapa de validação da identidade apresentada.',
    property: title.includes('cifrado')
      ? 'Confidencialidade + integridade'
      : 'Autenticidade / estabelecimento de chave',
  }));
  return (
    <Section
      title="TLS / mTLS: mensagens do handshake"
      kicker="VISUALIZAÇÃO DE PROTOCOLO SIMULADA"
    >
      <div className="mt-4 flex gap-2">
        <Button
          secondary={!mutual}
          onClick={() => {
            setMutual(false);
            setStep(0);
          }}
        >
          TLS
        </Button>
        <Button
          secondary={mutual}
          onClick={() => {
            setMutual(true);
            setStep(0);
          }}
        >
          mTLS
        </Button>
      </div>
      <Process steps={steps} active={step} onSelect={setStep} />
      <Notice tone="neutral">
        Clique em cada mensagem.{' '}
        {mutual
          ? 'No mTLS, cliente e servidor validam certificados mutuamente.'
          : 'No TLS, o cliente autentica o servidor antes de estabelecer o canal.'}
      </Notice>
    </Section>
  );
}

function ScenarioLab({ certificates }: { certificates: Certificate[] }) {
  const [current, setCurrent] = useState(0);
  const titles = [
    'IoT cria dados cardíacos',
    'Certificado do dispositivo é checado',
    'Cadeia da CA é validada',
    'ECDH estabelece segredo compartilhado',
    'Chave simétrica é derivada',
    'AES-256-GCM cifra o payload',
    'Gateway recebe ciphertext',
    'Servidor decifra payload',
    'Médica cria relatório',
    'SHA-256 calcula digest',
    'ECDSA assina o digest',
    'Certificado da médica valida identidade',
    'Relatório assinado é armazenado',
    'AES cifra dados armazenados',
    'RSA-OAEP protege chave AES',
    'Sistema decifra posteriormente',
    'Assinatura é verificada',
    'Tampering modifica relatório',
    'Verificação falha',
    'Revogação rejeita dispositivo',
  ];
  const steps = useMemo<ProcessStep[]>(
    () =>
      titles.map((title, index) => ({
        title,
        detail:
          index === 18
            ? 'O digest adulterado difere do digest assinado; ECDSA retorna INVALID.'
            : index === 19
              ? certificates.some((item) => item.status === 'REVOKED')
                ? 'Serial revogado encontrado na CRL; conexão rejeitada.'
                : 'Revogue um certificado em CRL/OCSP para concluir o teste.'
              : `Etapa ${index + 1}: dados e decisão ficam inspecionáveis para a apresentação.`,
        algorithm:
          index === 3
            ? 'ECDH P-256'
            : index === 5 || index === 13
              ? 'AES-256-GCM'
              : index === 9
                ? 'SHA-256'
                : index === 10 || index === 16
                  ? 'ECDSA P-256'
                  : index === 14
                    ? 'RSA-OAEP'
                    : undefined,
        property: index >= 18 ? 'Detecção e bloqueio' : 'Proteção aplicada',
      })),
    [certificates]
  );
  const selected = steps[current]!;
  return (
    <Section
      title="Caso completo: 20 passos explicáveis"
      kicker="LINHA DO TEMPO DE APRESENTAÇÃO"
    >
      <p className="mt-3 text-sm text-slate-400">
        Clique em cada etapa para exibir o que aconteceu, por quê, algoritmo,
        dados intermediários e propriedade de segurança.
      </p>
      <Process steps={steps} active={current} onSelect={setCurrent} />
      <TechnicalDetails
        algorithm={selected.algorithm || 'Fluxo de segurança'}
        input="Dados da etapa selecionada"
        output="Decisão ou artefato criptográfico"
        property={selected.property || 'Proteção aplicada'}
      />
    </Section>
  );
}

function Overview() {
  return (
    <Section
      title="BioCare Security Lab"
      kicker="LABORATÓRIO DE CRIPTOGRAFIA APLICADA"
    >
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
        Use a navegação para executar operações criptográficas reais no
        navegador e inspecionar cada byte, algoritmo, chave, assinatura,
        certificado e decisão de validação.
      </p>
      <div className="my-7 flex items-center gap-2 overflow-auto">
        <Node text="Clínicas / IoT" />
        <Arrow />
        <Node text="TLS / mTLS" />
        <Arrow />
        <Node text="Gateway / API" />
        <Arrow />
        <Node text="Aplicação" />
        <Arrow />
        <Node text="Banco AES-256" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ['AES-256-GCM', 'Confidencialidade + integridade autenticada'],
          ['SHA-256', 'Digest e detecção de alteração'],
          ['ECDSA', 'Autenticidade e integridade'],
          ['RSA-OAEP', 'Proteção de chave de sessão'],
          ['ECC / ECDH', 'Acordo de chave para IoT'],
          ['PKI / CRL / OCSP', 'Cadeia de confiança e revogação'],
        ].map(([title, text]) => (
          <article
            key={title}
            className="rounded-xl border border-white/10 bg-[#0c2829]/80 p-4"
          >
            <strong className="block text-sm">{title}</strong>
            <p className="mt-2 text-xs leading-5 text-slate-400">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-5">
        <Notice tone="warning">
          PKI, certificados, CRL/OCSP e TLS/mTLS são visualizações educacionais.
          AES, SHA-256, ECDSA, RSA-OAEP e ECDH usam Web Crypto API.
        </Notice>
      </div>
    </Section>
  );
}
function Node({ text }: { text: string }) {
  return (
    <div className="min-w-32 rounded-xl border border-white/10 bg-[#0c2829] p-3 text-center text-xs font-bold">
      {text}
    </div>
  );
}
function Arrow() {
  return <span className="text-lg text-lime-200">→</span>;
}

export default function BioCareSecurityLab() {
  const [active, setActive] = useState<ModuleId>('overview');
  const [certificates, setCertificates] = useState(initialCertificates);
  const current = modules.find((item) => item.id === active) ?? modules[0]!;
  const revoke = (serial: string) =>
    setCertificates((items) =>
      items.map((item) =>
        item.serial === serial ? { ...item, status: 'REVOKED' } : item
      )
    );
  const add = () =>
    setCertificates((items) => [
      ...items,
      {
        name: 'Clínica Demo',
        serial: `BC-${crypto.getRandomValues(new Uint32Array(1))[0]!.toString(16).toUpperCase()}`,
        subject: 'CN=clinica-demo.biocare',
        issuer: 'BioCare Intermediate CA',
        usage: 'Client Authentication',
        status: 'GOOD',
        valid: '2026-01-01 até 2027-01-01',
      },
    ]);
  const content: Record<ModuleId, ReactNode> = {
    overview: <Overview />,
    sha: <ShaLab />,
    aes: <AesLab />,
    signature: <SignatureLab />,
    hybrid: <HybridLab />,
    compare: <CompareLab />,
    pki: <PkiLab certificates={certificates} add={add} />,
    revocation: <RevocationLab certificates={certificates} revoke={revoke} />,
    iot: <IoTLab />,
    tls: <TlsLab />,
    scenario: <ScenarioLab certificates={certificates} />,
  };
  return (
    <main className="min-h-screen bg-[#071a1c] text-white">
      <div className="grid min-h-screen lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#061719]/90 p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-9 place-items-center bg-lime-200 font-bold text-[#062321]">
              ✦
            </span>
            <div className="text-xl font-extrabold">
              BioCare
              <small className="block font-mono text-[9px] tracking-[.18em] text-teal-200">
                SECURITY LAB
              </small>
            </div>
          </div>
          <nav
            className="flex gap-1 overflow-auto lg:flex-col"
            aria-label="Módulos do laboratório"
          >
            {modules.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-xs ${active === item.id ? 'border-l-2 border-lime-200 bg-teal-200/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span className="w-4 text-teal-200">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-6 hidden lg:block">
            <Badge tone="success">Web Crypto · chaves efêmeras</Badge>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="flex h-14 items-center justify-between border-b border-white/10 px-5 font-mono text-[10px] text-slate-400">
            <span>● Ambiente educacional · dados fictícios</span>
            <button
              type="button"
              onClick={() => {
                setActive('overview');
                setCertificates(initialCertificates);
              }}
              className="rounded border border-white/15 px-2 py-1 text-white"
            >
              Reset Demo
            </button>
          </header>
          <div className="grid xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0 px-5 py-9 sm:px-10 lg:px-14">
              {content[active]}
            </div>
            <aside className="hidden border-l border-white/10 bg-[#061719]/60 p-6 xl:flex xl:flex-col">
              <p className="font-mono text-[10px] tracking-[.16em] text-teal-200">
                CONCEITO ATUAL
              </p>
              <h2 className="mt-2 text-xl font-bold">{current.label}</h2>
              <p className="text-xs leading-5 text-slate-400">
                {current.concept}
              </p>
              <div className="mt-4">
                <Badge
                  tone={
                    ['pki', 'revocation', 'tls'].includes(active)
                      ? 'warning'
                      : 'success'
                  }
                >
                  {['pki', 'revocation', 'tls'].includes(active)
                    ? 'SIMULAÇÃO EDUCACIONAL'
                    : 'CRIPTOGRAFIA REAL'}
                </Badge>
              </div>
              <p className="mt-auto text-[10px] leading-5 text-slate-500">
                Glossário: plaintext = dado legível · ciphertext = dado cifrado
                · IV = valor único de inicialização · digest = resultado do hash
                · CA = autoridade certificadora.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
