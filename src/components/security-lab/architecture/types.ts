export type ArchitectureLayer = {
  id: string;
  icon: string;
  title: string;
  role: string;
  input: string;
  process: string;
  output: string;
  security: string;
  algorithms: string[];
};

export type SimulationMode = 'idle' | 'running' | 'tamper' | 'revoked';

export type GeneratedArtifact = {
  name: string;
  type: string;
  content: string;
  producedAt: string;
};
