'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { architectureLayers, pkiSteps } from '../architecture/data';
import { useArchitectureSimulation } from '../architecture/useArchitectureSimulation';

export function ArchitectureLab() {
  const root = useRef<HTMLDivElement>(null);
  const simulation = useArchitectureSimulation();
  const selected = architectureLayers[simulation.activeLayer]!;
  const isFailure = simulation.mode === 'tamper' || simulation.mode === 'revoked';

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.architecture-layer', { y: 20, opacity: 0, stagger: 0.1, duration: 0.45, ease: 'power2.out' });
      gsap.to('.flow-dot', { y: 432, repeat: -1, duration: 3.2, ease: 'none' });
    }, root);
    return () => context.revert();
  }, []);

  const status = simulation.mode === 'tamper'
    ? 'REJEITADO NO APPLICATION SERVER: o relatório alterado gera outro SHA-256 e a assinatura ECDSA não verifica.'
    : simulation.mode === 'revoked'
      ? 'REJEITADO NO API GATEWAY: CRL/OCSP encontrou o serial do IoT como revogado.'
      : simulation.mode === 'running'
        ? 'Pacote em movimento: cada camada gera e expõe seus artefatos criptográficos.'
        : 'Execute o fluxo ou selecione uma camada para inspecionar a arquitetura.';

  return (
    <section ref={root} className="mx-auto max-w-6xl">
      <p className="font-mono text-[10px] tracking-[.18em] text-teal-200">ARQUITETURA COMPLETA DA APLICAÇÃO · SIMULAÇÃO INTERATIVA</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-4xl font-extrabold tracking-tight md:text-5xl">Como o BioCare protege dados</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">A trilha vertical mostra por onde a informação passa, como a confiança é validada e quais arquivos/artefatos são gerados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={simulation.run} className="rounded-lg bg-lime-200 px-3 py-2 text-xs font-extrabold text-[#062321]">Executar fluxo rápido</button>
          <button type="button" onClick={simulation.simulateTamper} className="rounded-lg border border-rose-300/40 px-3 py-2 text-xs text-rose-100">Simular adulteração</button>
          <button type="button" onClick={simulation.simulateRevocation} className="rounded-lg border border-amber-300/40 px-3 py-2 text-xs text-amber-100">Revogar certificado IoT</button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,.15),transparent_32%)] p-5">
          <div className="flow-dot pointer-events-none absolute left-7 top-8 z-10 size-3 rounded-full bg-lime-200 shadow-[0_0_22px_#bef264]" />
          <div className="absolute bottom-5 left-[34px] top-5 border-l border-dashed border-teal-300/40" />
          {architectureLayers.map((layer, index) => (
            <div className="architecture-layer relative mb-5 pl-12 last:mb-0" key={layer.id}>
              <button type="button" onClick={() => simulation.setActiveLayer(index)} className={`w-full rounded-xl border p-4 text-left transition ${simulation.activeLayer === index ? 'border-lime-200 bg-lime-200/10 shadow-lg shadow-lime-300/10' : 'border-white/10 bg-[#0c2829]/85 hover:border-teal-200'}`}>
                <div className="flex flex-wrap justify-between gap-3"><div className="flex gap-3"><span className="grid size-9 place-items-center rounded-lg bg-teal-300/10 text-lg text-teal-100">{layer.icon}</span><div><h2 className="m-0 text-sm font-bold">{layer.title}</h2><p className="mt-1 text-xs text-slate-400">{layer.role}</p></div></div><span className={`font-mono text-[10px] ${simulation.activeLayer === index ? 'text-lime-100' : 'text-slate-500'}`}>{simulation.activeLayer === index ? 'INSPECIONANDO' : 'CAMADA'}</span></div>
                <div className="mt-3 flex flex-wrap gap-1">{layer.algorithms.map((algorithm) => <span key={algorithm} className="rounded bg-black/20 px-2 py-1 font-mono text-[9px] text-teal-100">{algorithm}</span>)}</div>
              </button>
            </div>
          ))}
        </div>
        <aside className="rounded-2xl border border-white/10 bg-[#0c2829]/80 p-5">
          <p className="font-mono text-[10px] tracking-wide text-teal-100">PKI EM PARALELO</p>
          <ol className="mt-4 grid gap-3">{pkiSteps.map((item, index) => <li className="flex gap-3 text-xs leading-5 text-slate-300" key={item}><span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal-300/10 font-mono text-[9px] text-teal-100">{index + 1}</span>{item}</li>)}</ol>
          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">A PKI acompanha todo o fluxo: prova identidades e bloqueia certificados revogados antes da transmissão.</p>
        </aside>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <article className={`rounded-xl border p-4 ${isFailure ? 'border-rose-300/30 bg-rose-300/10' : 'border-teal-300/25 bg-teal-300/5'}`} aria-live="polite"><p className="font-mono text-[10px] text-teal-100">ESTADO DA SIMULAÇÃO</p><p className="mt-2 text-xs leading-5 text-slate-200">{status}</p></article>
        <article className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-mono text-[10px] text-teal-100">CAMADA ATIVA · O QUE ACONTECE</p><h2 className="mt-2 text-base font-bold">{selected.title}</h2><dl className="mt-3 grid gap-3 text-xs leading-5 sm:grid-cols-2"><div><dt className="text-slate-500">ENTRADA</dt><dd>{selected.input}</dd></div><div><dt className="text-slate-500">PROCESSO</dt><dd>{selected.process}</dd></div><div><dt className="text-slate-500">SAÍDA</dt><dd>{selected.output}</dd></div><div><dt className="text-slate-500">PROPRIEDADE</dt><dd className="text-lime-100">{selected.security}</dd></div></dl></article>
      </div>

      <article className="mt-4 rounded-xl border border-white/10 bg-[#0c2829]/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-mono text-[10px] text-teal-100">ARTEFATOS GERADOS</p><p className="mt-1 text-xs text-slate-400">Cada execução expõe os arquivos e resultados intermediários da camada ativa.</p></div><span className="rounded bg-lime-200/10 px-2 py-1 font-mono text-[10px] text-lime-100">{simulation.artifacts.length} itens</span></div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">{simulation.artifacts.length ? simulation.artifacts.map((artifact, index) => <details className="rounded-lg border border-white/10 bg-black/20 p-3" key={`${artifact.name}-${index}`}><summary className="cursor-pointer text-xs font-bold"><span className="mr-2 text-teal-100">{artifact.type}</span>{artifact.name}</summary><code className="mt-3 block break-all rounded bg-black/30 p-2 font-mono text-[10px] leading-5 text-lime-100">{artifact.content}</code><small className="mt-2 block text-[10px] text-slate-500">Gerado em {artifact.producedAt}</small></details>) : <p className="text-xs text-slate-500">Execute o fluxo para gerar payload, segredo ECDH, hash, assinatura, ciphertext e chave AES protegida.</p>}</div>
      </article>
    </section>
  );
}
