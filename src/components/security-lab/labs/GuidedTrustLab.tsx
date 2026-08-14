'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Badge, Button } from '../ui/LabPrimitives';
import type {
  TrustLabArtifact,
  TrustLabDefinition,
} from './trustLabContent';

type ArtifactOverrides = Record<string, Partial<TrustLabArtifact>>;

export function GuidedTrustLab({
  content,
  actions,
  artifactOverrides = {},
  operationStatus,
}: {
  content: TrustLabDefinition;
  actions?: ReactNode;
  artifactOverrides?: ArtifactOverrides;
  operationStatus?: ReactNode;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState(
    content.steps[0]!.id
  );
  const current = content.steps[activeStep]!;

  useEffect(() => {
    if (!isRunning) return;
    if (activeStep >= content.steps.length - 1) return;
    const timer = window.setTimeout(() => {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      setSelectedArtifactId(content.steps[nextStep]!.id);
      if (nextStep === content.steps.length - 1) setIsRunning(false);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [activeStep, content.steps, isRunning]);

  const visibleArtifacts = useMemo(
    () =>
      content.steps.slice(0, activeStep + 1).map((step) => ({
        id: step.id,
        producedAt: step.title,
        ...step.artifact,
        ...artifactOverrides[step.id],
      })),
    [activeStep, artifactOverrides, content.steps]
  );
  const selectedArtifact =
    visibleArtifacts.find((artifact) => artifact.id === selectedArtifactId) ??
    visibleArtifacts.at(-1)!;
  const progress = ((activeStep + 1) / content.steps.length) * 100;

  const inspectStep = (index: number) => {
    setIsRunning(false);
    setActiveStep(index);
    setSelectedArtifactId(content.steps[index]!.id);
  };

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <Badge>{content.mode}</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
            {content.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {content.introduction}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (activeStep === content.steps.length - 1) setActiveStep(0);
              setIsRunning(true);
            }}
          >
            {isRunning ? 'Executando…' : 'Executar passo a passo'}
          </Button>
          <Button
            secondary
            disabled={activeStep === 0}
            onClick={() => inspectStep(activeStep - 1)}
          >
            Anterior
          </Button>
          <Button
            secondary
            disabled={activeStep === content.steps.length - 1}
            onClick={() => inspectStep(activeStep + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-300 to-lime-200 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] text-slate-500" aria-live="polite">
        ETAPA {activeStep + 1} DE {content.steps.length} · {current.title}
      </p>

      {actions && (
        <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/5 p-4">
          {actions}
        </div>
      )}
      {operationStatus && (
        <div className="mt-3 text-xs text-slate-300" aria-live="polite">
          {operationStatus}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <nav aria-label={`Etapas de ${content.title}`} className="grid gap-2">
          {content.steps.map((step, index) => {
            const state =
              index < activeStep
                ? 'CONCLUÍDA'
                : index === activeStep
                  ? 'EM FOCO'
                  : 'PRÓXIMA';
            return (
              <button
                key={step.id}
                type="button"
                aria-current={index === activeStep ? 'step' : undefined}
                onClick={() => inspectStep(index)}
                className={`group grid min-h-20 grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-xl border p-3 text-left transition duration-200 motion-reduce:transition-none ${
                  index === activeStep
                    ? 'border-lime-200 bg-lime-200/10 shadow-[0_0_28px_rgba(190,242,100,.08)]'
                    : 'border-white/10 bg-black/20 hover:border-teal-300/50'
                }`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-full border font-mono text-xs ${
                    index <= activeStep
                      ? 'border-lime-200/50 bg-lime-200/10 text-lime-100'
                      : 'border-white/10 text-slate-500'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong className="block text-xs text-slate-100">
                    {step.title}
                  </strong>
                  <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                    {step.summary}
                  </span>
                </span>
                <span className="font-mono text-[8px] text-teal-100">
                  {state}
                </span>
              </button>
            );
          })}
        </nav>

        <article
          key={current.id}
          className="rounded-2xl border border-white/10 bg-[#0c2829] p-5 shadow-[0_24px_70px_rgba(0,0,0,.18)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] tracking-[.16em] text-teal-200">
              O QUE ACONTECE NESTA ETAPA
            </span>
            <Badge>{current.artifact.type}</Badge>
          </div>
          <h2 className="mt-3 text-xl font-bold">{current.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            {current.explanation}
          </p>
          <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {[
              ['Entrada', current.input],
              ['Operação', current.operation],
              ['Saída', current.output],
              ['Propriedade de segurança', current.security],
            ].map(([label, value]) => (
              <div className="bg-[#092224] p-4" key={label}>
                <dt className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  {label}
                </dt>
                <dd className="mt-2 text-xs leading-5 text-slate-200">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[.14em] text-teal-100">
                ARTEFATOS GERADOS
              </p>
              <p className="mt-1 text-xs text-slate-500">
                A coleção cresce conforme você avança.
              </p>
            </div>
            <span className="font-mono text-sm text-lime-100">
              {visibleArtifacts.length}/{content.steps.length}
            </span>
          </div>
          <div className="mt-4 grid gap-2">
            {visibleArtifacts.map((artifact) => (
              <button
                type="button"
                key={artifact.id}
                onClick={() => setSelectedArtifactId(artifact.id)}
                className={`rounded-xl border p-3 text-left transition motion-reduce:transition-none ${
                  selectedArtifact.id === artifact.id
                    ? 'border-teal-300 bg-teal-300/10'
                    : 'border-white/10 bg-black/20 hover:border-white/25'
                }`}
              >
                <span className="font-mono text-[9px] text-teal-100">
                  {artifact.type}
                </span>
                <strong className="mt-1 block text-xs">{artifact.name}</strong>
                <code className="mt-2 block truncate text-[10px] text-slate-500">
                  {artifact.content}
                </code>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-teal-300/20 bg-teal-300/5 p-5">
          <p className="font-mono text-[10px] tracking-[.14em] text-teal-100">
            INSPEÇÃO DO ARTEFATO
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold">{selectedArtifact.name}</h2>
            <Badge>{selectedArtifact.type}</Badge>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-300">
            {selectedArtifact.description}
          </p>
          <code className="mt-4 block max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-[10px] leading-5 text-lime-100">
            {selectedArtifact.content}
          </code>
          <p className="mt-3 text-[10px] text-slate-500">
            Gerado na etapa: {selectedArtifact.producedAt}
          </p>
        </article>
      </div>
    </section>
  );
}
