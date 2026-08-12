'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { architectureLayers, pkiSteps } from '../architecture/data';
import type { GeneratedArtifact } from '../architecture/types';
import { useArchitectureSimulation } from '../architecture/useArchitectureSimulation';

export function ArchitectureLab() {
  const root = useRef<HTMLDivElement>(null);
  const simulation = useArchitectureSimulation();
  const [selectedArtifact, setSelectedArtifact] = useState<GeneratedArtifact>();
  const layer = architectureLayers[simulation.activeLayer]!;
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.architecture-layer', {
        opacity: 0,
        y: 18,
        stagger: 0.1,
        duration: 0.4,
      });
      gsap.to('.flow-dot', { y: 430, duration: 3.2, repeat: -1, ease: 'none' });
    }, root);
    return () => context.revert();
  }, []);
  const status =
    simulation.mode === 'tamper'
      ? 'INVÁLIDO: a alteração produz outro hash e invalida a assinatura.'
      : simulation.mode === 'revoked'
        ? 'REJEITADO: a CRL/OCSP marcou o certificado do IoT como revogado.'
        : simulation.mode === 'running'
          ? 'Executando: os artefatos são gerados a cada 520 ms.'
          : 'Use os controles para avançar e inspecionar o fluxo.';
  return (
    <section ref={root} className="mx-auto max-w-6xl">
      <p className="font-mono text-[10px] tracking-[.18em] text-teal-200">
        ARQUITETURA INTERATIVA
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-4xl font-extrabold tracking-tight md:text-5xl">
            Fluxo completo do BioCare
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-400">
            Execute cada camada, veja os artefatos gerados e leia como a
            criptografia protege o dado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-lime-200 px-3 py-2 text-xs font-bold text-[#062321]"
            type="button"
            onClick={simulation.run}
          >
            Executar automático
          </button>
          <button
            className="rounded-lg border border-white/15 px-3 py-2 text-xs"
            type="button"
            onClick={simulation.previousStep}
          >
            Etapa anterior
          </button>
          <button
            className="rounded-lg border border-teal-300/40 px-3 py-2 text-xs text-teal-100"
            type="button"
            onClick={simulation.nextStep}
          >
            Próxima etapa
          </button>
          <button
            className="rounded-lg border border-white/15 px-3 py-2 text-xs"
            type="button"
            onClick={simulation.reset}
          >
            Reiniciar
          </button>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className="text-xs text-rose-100 underline"
          onClick={simulation.simulateTamper}
        >
          Simular adulteração
        </button>
        <button
          type="button"
          className="text-xs text-amber-100 underline"
          onClick={simulation.simulateRevocation}
        >
          Simular certificado revogado
        </button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c2829] p-5">
          <div className="flow-dot absolute left-7 top-8 size-3 rounded-full bg-lime-200 shadow-[0_0_20px_#bef264]" />
          <div className="absolute bottom-5 left-[34px] top-5 border-l border-dashed border-teal-300/40" />
          {architectureLayers.map((item, index) => (
            <div
              className="architecture-layer relative mb-4 pl-12"
              key={item.id}
            >
              <button
                type="button"
                onClick={() => simulation.inspectLayer(index)}
                className={`w-full rounded-xl border p-4 text-left ${simulation.activeLayer === index ? 'border-lime-200 bg-lime-200/10' : 'border-white/10 bg-black/20'}`}
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <span className="text-teal-100">{item.icon}</span>
                    <strong className="ml-2 text-sm">{item.title}</strong>
                    <p className="mt-2 text-xs text-slate-400">{item.role}</p>
                  </div>
                  <span className="font-mono text-[9px] text-lime-100">
                    {simulation.activeLayer === index ? 'ATIVA' : 'CAMADA'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.algorithms.map((algorithm) => (
                    <span
                      className="rounded bg-white/5 px-2 py-1 font-mono text-[9px] text-teal-100"
                      key={algorithm}
                    >
                      {algorithm}
                    </span>
                  ))}
                </div>
              </button>
            </div>
          ))}
        </div>
        <aside className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="font-mono text-[10px] text-teal-100">
            EXPLICAÇÃO DA CAMADA
          </p>
          <h2 className="mt-2 text-lg font-bold">{layer.title}</h2>
          <dl className="mt-4 grid gap-3 text-xs leading-5">
            <div>
              <dt className="text-slate-500">ENTRADA</dt>
              <dd>{layer.input}</dd>
            </div>
            <div>
              <dt className="text-slate-500">PROCESSO</dt>
              <dd>{layer.process}</dd>
            </div>
            <div>
              <dt className="text-slate-500">SAÍDA</dt>
              <dd>{layer.output}</dd>
            </div>
            <div>
              <dt className="text-slate-500">PROPRIEDADE</dt>
              <dd className="text-lime-100">{layer.security}</dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[10px] text-teal-100">
            PKI: {pkiSteps.join(' → ')}
          </p>
        </aside>
      </div>
      <article
        className="mt-5 rounded-xl border border-teal-300/20 bg-teal-300/5 p-4"
        aria-live="polite"
      >
        <strong className="font-mono text-[10px] text-teal-100">ESTADO</strong>
        <p className="mt-2 text-xs text-slate-200">{status}</p>
      </article>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <article className="rounded-xl border border-white/10 bg-[#0c2829] p-4">
          <div className="flex justify-between">
            <div>
              <p className="font-mono text-[10px] text-teal-100">
                ARQUIVOS E CÓDIGO GERADOS
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Selecione um item para abrir sua explicação técnica.
              </p>
            </div>
            <span className="font-mono text-xs text-lime-100">
              {simulation.artifacts.length}
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {simulation.artifacts.length ? (
              simulation.artifacts.map((artifact, index) => (
                <button
                  type="button"
                  onClick={() => setSelectedArtifact(artifact)}
                  className="rounded-lg border border-white/10 bg-black/20 p-3 text-left hover:border-teal-300"
                  key={`${artifact.name}-${index}`}
                >
                  <span className="font-mono text-[9px] text-teal-100">
                    {artifact.type}
                  </span>
                  <strong className="ml-2 text-xs">{artifact.name}</strong>
                  <code className="mt-2 block truncate text-[10px] text-slate-400">
                    {artifact.content}
                  </code>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500">
                Avance uma etapa para gerar o primeiro artefato.
              </p>
            )}
          </div>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="font-mono text-[10px] text-teal-100">
            DETALHE DO ARTEFATO
          </p>
          {selectedArtifact ? (
            <>
              <h2 className="mt-2 text-sm font-bold">
                {selectedArtifact.name}
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-300">
                {selectedArtifact.description}
              </p>
              <code className="mt-4 block whitespace-pre-wrap break-all rounded bg-black/30 p-3 font-mono text-[10px] leading-5 text-lime-100">
                {selectedArtifact.content}
              </code>
              <p className="mt-3 text-[10px] text-slate-500">
                Gerado em: {selectedArtifact.producedAt}
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              Clique em um arquivo para ver seu código, origem e finalidade.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
