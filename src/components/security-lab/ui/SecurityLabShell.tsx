import type { ReactNode } from 'react';
import type { ModuleId, Tone } from '../types';

type NavigationModule = {
  id: ModuleId;
  icon: string;
  label: string;
  concept: string;
};

export function SecurityLabShell({
  activeModule,
  children,
  currentModule,
  modules,
  onModuleChange,
  onReset,
}: {
  activeModule: ModuleId;
  children: ReactNode;
  currentModule: NavigationModule;
  modules: NavigationModule[];
  onModuleChange: (module: ModuleId) => void;
  onReset: () => void;
}) {
  const isEducationalSimulation = ['pki', 'revocation', 'tls'].includes(
    activeModule
  );
  const badgeClass: Record<Tone, string> = {
    success: 'border-lime-300/30 bg-lime-300/10 text-lime-100',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    danger: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
    neutral: 'border-teal-300/30 bg-teal-300/10 text-teal-100',
  };
  return (
    <main className="min-h-screen bg-[#071a1c] text-white">
      <div className="grid min-h-screen min-w-0 overflow-x-hidden lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-white/10 bg-[#061719]/90 p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
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
            className="flex max-w-full gap-1 overflow-auto lg:flex-col"
            aria-label="Módulos do laboratório"
          >
            {modules.map((module) => (
              <button
                type="button"
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-xs ${activeModule === module.id ? 'border-l-2 border-lime-200 bg-teal-200/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span className="w-4 text-teal-200">{module.icon}</span>
                {module.label}
              </button>
            ))}
          </nav>
          <div className="mt-6 hidden lg:block">
            <span
              className={`inline-flex rounded border px-2 py-1 font-mono text-[10px] ${badgeClass.success}`}
            >
              Web Crypto · chaves efêmeras
            </span>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="flex h-14 items-center justify-between border-b border-white/10 px-5 font-mono text-[10px] text-slate-400">
            <span>● Ambiente educacional · dados fictícios</span>
            <button
              type="button"
              onClick={onReset}
              className="rounded border border-white/15 px-2 py-1 text-white"
            >
              Reset Demo
            </button>
          </header>
          <div className="grid xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0 px-5 py-9 sm:px-10 lg:px-14">
              {children}
            </div>
            <aside className="hidden border-l border-white/10 bg-[#061719]/60 p-6 xl:flex xl:flex-col">
              <p className="font-mono text-[10px] tracking-[.16em] text-teal-200">
                CONCEITO ATUAL
              </p>
              <h2 className="mt-2 text-xl font-bold">{currentModule.label}</h2>
              <p className="text-xs leading-5 text-slate-400">
                {currentModule.concept}
              </p>
              <div className="mt-4">
                <span
                  className={`inline-flex rounded border px-2 py-1 font-mono text-[10px] ${badgeClass[isEducationalSimulation ? 'warning' : 'success']}`}
                >
                  {isEducationalSimulation
                    ? 'SIMULAÇÃO EDUCACIONAL'
                    : 'CRIPTOGRAFIA REAL'}
                </span>
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
