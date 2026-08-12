# BioCare Security Lab

Laboratório educacional para apresentar criptografia aplicada, PKI e comunicação segura em um cenário fictício de saúde. O sistema não é um prontuário médico real e não armazena chaves privadas de forma persistente.

## Objetivo

O laboratório torna visível o processo por trás de cada mecanismo de segurança: dados de entrada, bytes, chaves, hashes, assinaturas, pacotes cifrados, certificados e decisões de validação.

Operações que usam a Web Crypto API do navegador são reais dentro da demonstração: AES-GCM, SHA-256, ECDSA, RSA-OAEP e ECDH. A camada de certificados, PKI, CRL/OCSP e TLS/mTLS é uma simulação educacional explicitamente identificada na interface.

## Como executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Como navegar

A barra lateral contém os módulos do laboratório. O painel à direita explica o conceito ativo e informa se a tela executa criptografia real no navegador ou se representa uma simulação de protocolo/PKI.

O botão **Reset Demo** retorna o laboratório à visão inicial e restaura os certificados de demonstração.

## Abas do laboratório

### Visão geral

Mostra o mapa de segurança do BioCare: fontes clínicas e IoT, transporte seguro, gateway, aplicação e armazenamento. Use esta aba para apresentar onde AES, SHA, ECDSA, RSA/ECC e PKI se encaixam antes de executar os detalhes.

### Arquitetura

É a visão completa e interativa da aplicação, organizada verticalmente:

1. Clínicas, médicos e dispositivos IoT geram dados e identidades.
2. TLS/mTLS protege o transporte e estabelece uma sessão.
3. API Gateway valida cadeia de certificados, CRL/OCSP e regras de entrada.
4. Application Server autentica payloads, calcula hashes e assina laudos.
5. Database armazena registros cifrados e chaves AES protegidas.

Use os controles:

- **Executar automático**: percorre as camadas em sequência e gera artefatos a cada etapa.
- **Etapa anterior / Próxima etapa**: permite explicar o fluxo no ritmo da apresentação.
- **Reiniciar**: limpa os artefatos e volta para a primeira camada.
- **Simular adulteração**: mostra um hash diferente e a assinatura ECDSA inválida.
- **Simular certificado revogado**: mostra o Gateway rejeitando a conexão com base em CRL/OCSP.

Clique em uma camada para ler sua entrada, processo, saída, algoritmos e propriedade de segurança. Na seção **Arquivos e código gerados**, clique em um artefato para ver o conteúdo demonstrativo e a explicação técnica.

### SHA-256

Digite ou altere um documento e use **Calcular hash**. A interface mostra o texto como bytes e gera um digest de 256 bits. O teste de alteração troca `João` por `Joao`, demonstrando que um único caractere produz outro hash.

Use este módulo para explicar integridade: quando o hash calculado originalmente é igual ao hash calculado do documento recebido, o conteúdo permanece inalterado.

### AES-256-GCM

Informe um texto e use **Cifrar**. O navegador gera uma chave AES-256 e um IV aleatório, produzindo ciphertext autenticado. Use **Decifrar** para recuperar o texto quando chave, IV e dados autenticados correspondem.

AES-GCM protege confidencialidade e também detecta alterações no pacote.

### Assinatura digital

Use **Assinar** para gerar um par ECDSA P-256 temporário e uma assinatura do laudo. Use **Verificar** para conferir a assinatura com a chave pública. O botão de alteração modifica o documento e torna a verificação inválida.

Este fluxo demonstra autenticidade e integridade. A chave privada existe apenas em memória durante a sessão do navegador.

### Criptografia híbrida

Mostra a combinação usada para dados maiores:

1. AES-GCM cifra o registro médico.
2. RSA-OAEP protege a chave AES de sessão.
3. O pacote contém ciphertext, IV e a chave AES encapsulada.

RSA não é usado para cifrar todo o prontuário; sua função é proteger a pequena chave simétrica.

### RSA × ECC × AES

Compara os papéis de cada família:

- **AES**: cifragem simétrica eficiente de dados em massa.
- **RSA**: criptografia assimétrica com ampla compatibilidade, normalmente usada para proteger chaves ou assinar.
- **ECC**: criptografia assimétrica com chaves menores, adequada para identidade e acordo de chaves em IoT.

### Laboratório PKI

Exibe certificados simulados de médica, API e dispositivo. Selecione um certificado para consultar Subject, Issuer, serial, validade, uso e status. É possível emitir um certificado fictício de clínica para demonstrar a cadeia de confiança.

### CRL / OCSP

Use **Revogar** em um certificado e observe o status mudar. A consulta por serial simula a resposta OCSP e explica a decisão da aplicação: aceitar, rejeitar ou tratar como desconhecido.

### IoT cardíaco

Gera um payload de telemetria fictício. A explicação separa os papéis: ECC/ECDH identifica e estabelece um segredo; AES-GCM protege o JSON transmitido.

### TLS / mTLS

Alterna entre TLS e mTLS e apresenta as mensagens do handshake. TLS autentica o servidor; mTLS também apresenta e valida o certificado do cliente. É uma visualização de protocolo, não um servidor de rede real.

### Caso completo

Resume a narrativa do BioCare: geração de telemetria, validação da PKI, acordo ECDH, cifragem AES, criação de laudo, hash, assinatura, armazenamento e verificação. A etapa de revogação reflete os certificados marcados como revogados na aba CRL/OCSP.

## Como ler a visualização

Os diagramas usam sempre a mesma lógica:

- **Entrada**: dado, certificado ou chave recebida pela etapa.
- **Processo**: algoritmo ou decisão aplicada.
- **Saída**: artefato gerado, como hash, assinatura, ciphertext ou resposta OCSP.
- **Propriedade**: benefício de segurança fornecido, como confidencialidade, integridade, autenticidade ou confiança.

Valores em hexadecimal, Base64 ou bytes não são “textos mágicos”: são representações dos bytes processados pelos algoritmos.

## Estrutura relevante

```text
src/components/security-lab/
├── SecurityLabView.tsx       # Composição e estado compartilhado
├── data.ts                   # Módulos, certificados e dados iniciais
├── crypto.ts                 # Conversões usadas pelas demonstrações
├── labs/                     # Cada laboratório de demonstração
├── ui/                       # Componentes visuais reutilizáveis
└── architecture/             # Dados, artefatos e estado da arquitetura
```

## Validação

```bash
npm run check-types
npm run lint
npm run build
```

## Limites da demonstração

- Não use os valores exibidos como credenciais reais.
- Chaves privadas são temporárias e não devem ser interpretadas como mecanismo de armazenamento seguro.
- Certificados, revogação e handshake são recursos didáticos; não substituem uma implementação de PKI ou TLS de produção.
