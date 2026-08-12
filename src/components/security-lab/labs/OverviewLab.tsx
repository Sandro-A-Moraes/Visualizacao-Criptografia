const securityLayers = [
  ['AES-256-GCM', 'Confidencialidade e integridade autenticada'],
  ['SHA-256', 'Digest e deteccao de alteracao'],
  ['ECDSA', 'Autenticidade e integridade'],
  ['RSA-OAEP', 'Protecao da chave de sessao'],
  ['ECC / ECDH', 'Acordo de chave para IoT'],
  ['PKI / CRL / OCSP', 'Cadeia de confianca e revogacao'],
];

export function OverviewLab() {
  return (
    <section className="mx-auto max-w-6xl">
      <p className="mb-2 font-mono text-[10px] tracking-[.18em] text-teal-200">
        LABORATORIO DE CRIPTOGRAFIA APLICADA
      </p>
      <h1 className="m-0 text-4xl font-extrabold tracking-tight md:text-5xl">
        BioCare Security Lab
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
        Execute operacoes criptograficas reais e inspecione bytes, algoritmos,
        chaves, assinaturas, certificados e decisoes de validacao.
      </p>
      <div className="my-7 flex items-center gap-2 overflow-auto">
        {[
          'Clinicas / IoT',
          'TLS / mTLS',
          'Gateway / API',
          'Aplicacao',
          'Banco AES-256',
        ].map((node, index, nodes) => (
          <div className="flex items-center gap-2" key={node}>
            <div className="min-w-32 rounded-xl border border-white/10 bg-[#0c2829] p-3 text-center text-xs font-bold">
              {node}
            </div>
            {index < nodes.length - 1 && (
              <span className="text-lg text-lime-200">-&gt;</span>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {securityLayers.map(([title, description]) => (
          <article
            className="rounded-xl border border-white/10 bg-[#0c2829]/80 p-4"
            key={title}
          >
            <strong className="block text-sm">{title}</strong>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {description}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
        PKI, certificados, CRL/OCSP e TLS/mTLS sao visualizacoes educacionais.
        AES, SHA-256, ECDSA, RSA-OAEP e ECDH usam Web Crypto API.
      </p>
    </section>
  );
}
