import { useCallback, useEffect, useRef, useState } from 'react';
import { createArtifactsForLayer } from './artifacts';
import { architectureLayers } from './data';
import type { GeneratedArtifact, SimulationMode } from './types';

const STEP_DURATION = 520;
export function useArchitectureSimulation() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [mode, setMode] = useState<SimulationMode>('idle');
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const stop = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = undefined;
  }, []);
  const addArtifacts = useCallback(
    (index: number) =>
      setArtifacts((current) => [
        ...current,
        ...createArtifactsForLayer(architectureLayers[index]!.id, index),
      ]),
    []
  );
  const inspectLayer = useCallback(
    (index: number) => {
      stop();
      setMode('idle');
      setActiveLayer(index);
    },
    [stop]
  );
  const nextStep = useCallback(() => {
    stop();
    setMode('idle');
    setActiveLayer((current) => {
      const next = Math.min(current + 1, architectureLayers.length - 1);
      addArtifacts(next);
      return next;
    });
  }, [addArtifacts, stop]);
  const previousStep = useCallback(() => {
    stop();
    setMode('idle');
    setActiveLayer((current) => Math.max(current - 1, 0));
  }, [stop]);
  const reset = useCallback(() => {
    stop();
    setMode('idle');
    setActiveLayer(0);
    setArtifacts([]);
  }, [stop]);
  const run = useCallback(() => {
    reset();
    setMode('running');
    addArtifacts(0);
    let current = 0;
    timer.current = window.setInterval(() => {
      current += 1;
      if (current === architectureLayers.length) {
        stop();
        setMode('idle');
        return;
      }
      setActiveLayer(current);
      addArtifacts(current);
    }, STEP_DURATION);
  }, [addArtifacts, reset, stop]);
  const simulateTamper = useCallback(() => {
    stop();
    setMode('tamper');
    setActiveLayer(3);
    setArtifacts([
      {
        name: 'report.sha256',
        type: 'SHA-256',
        content: 'digest original != digest adulterado',
        producedAt: 'Adulteração',
        description: 'Uma alteração muda completamente o hash.',
      },
      {
        name: 'verification.txt',
        type: 'ECDSA',
        content: 'INVALID: signature does not match digest',
        producedAt: 'Adulteração',
        description:
          'A assinatura não corresponde ao digest do relatório alterado.',
      },
    ]);
  }, [stop]);
  const simulateRevocation = useCallback(() => {
    stop();
    setMode('revoked');
    setActiveLayer(2);
    setArtifacts([
      {
        name: 'crl-entry.txt',
        type: 'CRL / OCSP',
        content: 'BC-11D09 -> REVOKED',
        producedAt: 'Revogação',
        description: 'O gateway bloqueia a conexão por certificado revogado.',
      },
    ]);
  }, [stop]);
  useEffect(() => stop, [stop]);
  return {
    activeLayer,
    artifacts,
    inspectLayer,
    mode,
    nextStep,
    previousStep,
    reset,
    run,
    simulateRevocation,
    simulateTamper,
  };
}
