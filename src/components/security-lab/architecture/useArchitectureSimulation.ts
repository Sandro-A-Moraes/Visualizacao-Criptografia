import { useCallback, useEffect, useRef, useState } from 'react';
import { architectureLayers } from './data';
import { createArtifactsForLayer } from './artifacts';
import type { GeneratedArtifact, SimulationMode } from './types';

const STEP_DURATION_MS = 520;

export function useArchitectureSimulation() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [mode, setMode] = useState<SimulationMode>('idle');
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const timerRef = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const generateArtifacts = useCallback((index: number) => {
    const layer = architectureLayers[index]!;
    setArtifacts((current) => [...current, ...createArtifactsForLayer(layer.id, index)]);
  }, []);

  const run = useCallback(() => {
    stop();
    setMode('running');
    setArtifacts([]);
    setActiveLayer(0);
    generateArtifacts(0);
    let next = 0;
    timerRef.current = window.setInterval(() => {
      next += 1;
      if (next >= architectureLayers.length) {
        stop();
        setMode('idle');
        return;
      }
      setActiveLayer(next);
      generateArtifacts(next);
    }, STEP_DURATION_MS);
  }, [generateArtifacts, stop]);

  const simulateTamper = useCallback(() => {
    stop();
    setMode('tamper');
    setActiveLayer(3);
    setArtifacts([{ name: 'report.sha256', type: 'SHA-256', content: 'digest original ≠ digest adulterado', producedAt: 'tampering' }, { name: 'verification.txt', type: 'ECDSA', content: 'INVALID: signature does not match altered digest', producedAt: 'tampering' }]);
  }, [stop]);

  const simulateRevocation = useCallback(() => {
    stop();
    setMode('revoked');
    setActiveLayer(2);
    setArtifacts([{ name: 'crl-entry.txt', type: 'CRL / OCSP', content: 'BC-11D09 → REVOKED; gateway rejects the connection', producedAt: 'revocation' }]);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { activeLayer, artifacts, mode, run, setActiveLayer, simulateRevocation, simulateTamper };
}
