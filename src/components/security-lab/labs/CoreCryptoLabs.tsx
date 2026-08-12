'use client';

import { useState } from 'react';
import { decoder, encoder, fromBase64, toBase64, toHex } from '../crypto';
import { initialReport } from '../data';
import type { ProcessStep } from '../types';
import {
  Button,
  BytesViewer,
  Notice,
  Process,
  Section,
  TechnicalDetails,
} from '../ui/LabPrimitives';

export function ShaLab() {
  const [text, setText] = useState(initialReport);
  const [hash, setHash] = useState('');
  const [original, setOriginal] = useState('');
  const digest = async () => {
    const value = toHex(
      await crypto.subtle.digest('SHA-256', encoder.encode(text))
    );
    setHash(value);
    if (!original) setOriginal(value);
  };
  const steps: ProcessStep[] = [
    { title: 'Documento', detail: 'Texto original recebido.', data: text },
    {
      title: 'Bytes UTF-8',
      detail: 'O hash opera sobre bytes.',
      data: toHex(encoder.encode(text)),
    },
    {
      title: 'SHA-256',
      detail: 'Gera digest fixo de 256 bits.',
      algorithm: 'SHA-256',
    },
    {
      title: 'Comparação',
      detail: hash
        ? original === hash
          ? 'Hash A = Hash B: conteúdo inalterado.'
          : 'Hash A ≠ Hash B: conteúdo adulterado.'
        : 'Calcule o hash para comparar.',
      data: hash,
      property: 'Integridade',
    },
  ];
  return (
    <Section title="SHA-256" kicker="OPERAÇÃO REAL">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs"
      />
      <div className="mt-3 flex gap-2">
        <Button onClick={digest}>Calcular hash</Button>
        <Button
          secondary
          onClick={() => setText((value) => value.replace('João', 'Joao'))}
        >
          Alterar texto
        </Button>
      </div>
      <BytesViewer label="Documento" value={text} />
      <Process steps={steps} active={3} onSelect={() => undefined} />
      <TechnicalDetails
        algorithm="SHA-256"
        input="Bytes UTF-8"
        output="Digest de 256 bits"
        property="Integridade"
      />
    </Section>
  );
}

export function AesLab() {
  const [text, setText] = useState('Registro clínico: pressão 120/80 mmHg.');
  const [result, setResult] = useState<{
    key: CryptoKey;
    iv: string;
    encrypted: string;
    recovered?: string;
  }>();
  const encrypt = async () => {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );
    setResult({ key, iv: toBase64(iv), encrypted: toBase64(encrypted) });
  };
  const decrypt = async () => {
    if (!result) return;
    const recovered = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(result.iv) },
      result.key,
      fromBase64(result.encrypted)
    );
    setResult({ ...result, recovered: decoder.decode(recovered) });
  };
  const steps: ProcessStep[] = [
    { title: 'Plaintext', detail: 'Dados legíveis.', data: text },
    {
      title: 'Chave e IV',
      detail: 'Chave AES-256 e IV de 96 bits aleatórios.',
      data: result?.iv,
    },
    {
      title: 'AES-GCM',
      detail: 'Cifra e autentica os bytes.',
      algorithm: 'AES-256-GCM',
    },
    {
      title: 'Pacote',
      detail: result?.recovered
        ? `Texto recuperado: ${result.recovered}`
        : 'Ciphertext, IV e tag são necessários para decifrar.',
      data: result?.encrypted,
      property: 'Confidencialidade + integridade',
    },
  ];
  return (
    <Section title="AES-256-GCM" kicker="OPERAÇÃO REAL">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs"
      />
      <div className="mt-3 flex gap-2">
        <Button onClick={encrypt}>Cifrar</Button>
        <Button secondary disabled={!result} onClick={decrypt}>
          Decifrar
        </Button>
      </div>
      <Process steps={steps} active={3} onSelect={() => undefined} />
      <TechnicalDetails
        algorithm="AES-256-GCM"
        input="Texto, chave de 256 bits e IV"
        output="Ciphertext autenticado"
        property="Confidencialidade"
      />
    </Section>
  );
}

export function SignatureLab() {
  const [text, setText] = useState(initialReport);
  const [state, setState] = useState<{
    pair: CryptoKeyPair;
    signature: string;
  }>();
  const [valid, setValid] = useState<boolean>();
  const sign = async () => {
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
    setState({
      pair,
      signature: toBase64(
        await crypto.subtle.sign(
          { name: 'ECDSA', hash: 'SHA-256' },
          pair.privateKey,
          encoder.encode(text)
        )
      ),
    });
    setValid(undefined);
  };
  const verify = async () => {
    if (state)
      setValid(
        await crypto.subtle.verify(
          { name: 'ECDSA', hash: 'SHA-256' },
          state.pair.publicKey,
          fromBase64(state.signature),
          encoder.encode(text)
        )
      );
  };
  return (
    <Section title="Assinatura digital" kicker="ECDSA P-256 REAL">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs"
      />
      <div className="mt-3 flex gap-2">
        <Button onClick={sign}>Assinar</Button>
        <Button secondary disabled={!state} onClick={verify}>
          Verificar
        </Button>
        <Button
          secondary
          disabled={!state}
          onClick={() => setText((value) => `${value}\nAlterado`)}
        >
          Tamper Test
        </Button>
      </div>
      {state && (
        <Notice
          tone={valid === false ? 'danger' : valid ? 'success' : 'neutral'}
        >
          {valid === undefined
            ? `Assinatura Base64: ${state.signature}`
            : valid
              ? 'VÁLIDA: documento, assinatura e chave pública correspondem.'
              : 'INVÁLIDA: o digest do texto alterado não corresponde à assinatura.'}
        </Notice>
      )}
      <TechnicalDetails
        algorithm="ECDSA P-256 + SHA-256"
        input="Documento e chave privada"
        output="Assinatura Base64"
        property="Autenticidade + integridade"
      />
    </Section>
  );
}

export function HybridLab() {
  const [record, setRecord] = useState('Prontuário: glicemia 96 mg/dL.');
  const [message, setMessage] = useState('');
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
    setMessage(
      `Pacote: IV ${toBase64(iv)} · ciphertext ${toBase64(cipher)} · chave AES protegida ${toBase64(wrapped)}`
    );
  };
  return (
    <Section title="Criptografia híbrida" kicker="AES-GCM + RSA-OAEP REAIS">
      <textarea
        value={record}
        onChange={(event) => setRecord(event.target.value)}
        className="mt-4 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs"
      />
      <div className="mt-3">
        <Button onClick={run}>Gerar pacote cifrado</Button>
      </div>
      {message && <Notice tone="success">{message}</Notice>}
      <TechnicalDetails
        algorithm="AES-GCM + RSA-OAEP"
        input="Registro e chave AES"
        output="Ciphertext e chave AES encapsulada"
        property="Confidencialidade"
      />
    </Section>
  );
}
