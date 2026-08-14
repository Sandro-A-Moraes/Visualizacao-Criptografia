import assert from 'node:assert/strict';
import test from 'node:test';
// eslint-disable-next-line import/extensions -- Node type stripping requires the explicit TypeScript extension.
import { trustLabContent } from '../src/components/security-lab/labs/trustLabContent.ts';

const expectedLabs = ['pki', 'revocation', 'iot', 'tls', 'scenario'] as const;

test('provides a complete guided flow for every trust laboratory', () => {
  assert.deepEqual(Object.keys(trustLabContent), expectedLabs);

  for (const labId of expectedLabs) {
    const lab = trustLabContent[labId];

    assert.ok(lab.introduction.length >= 120, `${labId} needs a useful introduction`);
    assert.ok(lab.steps.length >= 4, `${labId} needs at least four observable steps`);

    for (const step of lab.steps) {
      assert.ok(step.explanation.length >= 100, `${labId}/${step.id} needs a detailed explanation`);
      assert.ok(step.input, `${labId}/${step.id} needs an input`);
      assert.ok(step.operation, `${labId}/${step.id} needs an operation`);
      assert.ok(step.output, `${labId}/${step.id} needs an output`);
      assert.ok(step.security, `${labId}/${step.id} needs a security property`);
      assert.ok(step.artifact.name, `${labId}/${step.id} needs an artifact`);
      assert.ok(step.artifact.content, `${labId}/${step.id} needs inspectable artifact content`);
      assert.ok(step.artifact.description.length >= 60, `${labId}/${step.id} needs artifact context`);
    }
  }
});

test('labels simulated protocols and real browser cryptography explicitly', () => {
  assert.equal(trustLabContent.pki.mode, 'SIMULAÇÃO EDUCACIONAL');
  assert.equal(trustLabContent.revocation.mode, 'SIMULAÇÃO EDUCACIONAL');
  assert.equal(trustLabContent.tls.mode, 'SIMULAÇÃO EDUCACIONAL');
  assert.equal(trustLabContent.iot.mode, 'OPERAÇÃO REAL + CONTEXTO SIMULADO');
  assert.equal(trustLabContent.scenario.mode, 'OPERAÇÕES REAIS + FLUXO SIMULADO');
});
