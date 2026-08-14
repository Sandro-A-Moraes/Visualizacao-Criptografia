# BioCare Security Lab

Laboratório educacional de criptografia aplicada para um cenário clínico fictício. A interface acompanha os dados, as decisões e os artefatos usados entre clínicas, profissionais, dispositivos IoT e a plataforma BioCare.

O projeto não é um prontuário eletrônico, não processa dados de pacientes reais e não substitui uma implementação de segurança de produção.

## Fundamentos de criptografia

### Bytes, UTF-8, hexadecimal e Base64

Algoritmos criptográficos operam sobre bytes. O laboratório converte textos UTF-8 em bytes e mostra representações em hexadecimal ou Base64 quando isso ajuda a inspecionar o processo.

- UTF-8 converte texto em bytes.
- Hexadecimal mostra cada byte com dois dígitos de base 16.
- Base64 transporta bytes como texto. Base64 não cifra nem protege conteúdo.
- Plaintext é o dado legível antes da cifra.
- Ciphertext é o dado cifrado.

### Confidencialidade: AES-256-GCM

AES é uma cifra simétrica: a mesma chave protege e recupera o dado. O sistema usa AES com chaves de 256 bits e modo GCM.

AES-GCM recebe chave, IV e bytes do conteúdo. Ele produz ciphertext e uma tag de autenticação. O IV não é secreto, mas precisa ser único para cada cifra com a mesma chave. A tag faz a decifragem falhar quando alguém altera o pacote, usa outro IV ou apresenta a chave errada.

O navegador executa AES-GCM de verdade nos laboratórios de cifra, IoT e caso completo. As chaves geradas ficam apenas na memória da sessão.

### Integridade: SHA-256

SHA-256 calcula um digest fixo de 256 bits para uma sequência de bytes. O digest não revela o conteúdo original e não permite recuperar o texto.

O laboratório calcula SHA-256 sobre relatórios e mostra que uma pequena mudança, como trocar um caractere, produz outro digest. Comparar o digest esperado com o digest recebido permite detectar alteração de conteúdo.

### Autenticidade: ECDSA P-256

Uma assinatura digital liga uma chave privada a uma sequência exata de bytes. Quem possui a chave pública correspondente verifica essa assinatura.

O laboratório gera pares ECDSA P-256 temporários no navegador, assina relatórios e verifica o resultado. Ao modificar o documento depois da assinatura, a verificação falha. A assinatura protege integridade e comprova posse da chave privada, mas não cifra o relatório.

### ECC e ECDH

ECC usa curvas elípticas para operações assimétricas. O sistema usa a curva P-256 nos exemplos de identidade e assinatura.

ECDH permite que duas partes derivem o mesmo segredo compartilhado a partir de chaves efêmeras. Elas não enviam esse segredo pela rede. Em uma sessão real, HKDF transforma o segredo em chaves de tráfego. O laboratório usa esse fluxo para explicar a sessão entre dispositivo e plataforma.

### Criptografia híbrida: AES-GCM e RSA-OAEP

Dados clínicos exigem uma cifra simétrica eficiente, então AES-GCM protege o conteúdo. RSA-OAEP encapsula uma chave AES pequena para uma chave pública RSA. Essa combinação evita cifrar todo o registro com RSA.

O laboratório usa RSA-OAEP com SHA-256 e gera um pacote com IV, ciphertext e chave AES encapsulada.

### PKI, certificados e cadeia de confiança

Uma PKI associa uma identidade a uma chave pública por meio de certificados assinados por uma autoridade certificadora.

A cadeia usada no cenário contém:

1. Root CA, a âncora de confiança.
2. Intermediate CA, a autoridade que assina certificados operacionais.
3. Certificado de servidor, profissional, clínica ou IoT, com subject, issuer, serial, validade, chave pública e finalidade de uso.

O cliente aceita uma identidade depois de validar a cadeia, as assinaturas, a validade, a finalidade e as regras de confiança. O laboratório mostra CSR, política de emissão, certificado e relatório de validação como artefatos educacionais.

### Revogação: CRL e OCSP

A validade não cobre uma chave comprometida antes do vencimento.

- CRL é uma lista publicada pela CA com certificados revogados.
- OCSP consulta o status de um serial e pode retornar GOOD, REVOKED ou UNKNOWN.

Antes de aceitar uma conexão, o gateway valida a assinatura e a atualidade da resposta. O laboratório mostra a extração do serial, a consulta, a resposta e a decisão de permitir ou negar acesso.

### TLS e mTLS

TLS negocia uma sessão protegida entre cliente e servidor. O servidor apresenta certificado e prova que controla a chave privada correspondente. Em mTLS, o cliente também apresenta certificado e prova de posse.

O handshake negocia versão e algoritmos, autentica as partes e deriva chaves de tráfego efêmeras. Depois, os registros da aplicação usam cifra autenticada, como AES-GCM. O laboratório representa as mensagens e decisões do TLS 1.3; ele não abre um servidor TLS real.

## Arquitetura do cenário BioCare

O fluxo principal percorre cinco camadas.

```text
Clínica, profissional ou CARD-001
        │ JSON clínico, certificado e chave pública
        ▼
TLS / mTLS
        │ sessão autenticada e registros AES-GCM
        ▼
API Gateway
        │ valida cadeia, OCSP/CRL e regra de acesso
        ▼
Application Server
        │ autentica payload, calcula SHA-256 e assina relatório
        ▼
Database
        │ registro AES-GCM e referência da chave protegida
```

### 1. Origem: clínicas, profissionais e IoT

O monitor fictício CARD-001 cria telemetria em JSON, como frequência cardíaca e timestamp. O dispositivo usa um certificado e uma chave pública ECC para se identificar. A interface apresenta o payload e a identidade pública como artefatos separados.

### 2. Transporte: TLS/mTLS

A plataforma valida a identidade apresentada e usa o acordo ECDH para ilustrar a derivação de um segredo de sessão. AES-GCM protege os bytes que cruzam a rede. Em mTLS, o certificado do dispositivo participa da autenticação; em TLS comum, o cliente valida somente o servidor no handshake.

### 3. Borda: API Gateway

O gateway valida a cadeia de certificados, consulta a revogação e aplica a regra de acesso antes de encaminhar a requisição. Um certificado com status REVOKED interrompe o fluxo.

### 4. Processamento: Application Server

O servidor valida o pacote AES-GCM, processa a telemetria e cria um relatório fictício. SHA-256 produz o digest do relatório; ECDSA P-256 assina os mesmos bytes. Esses artefatos permitem verificar integridade e autoria da chave.

### 5. Persistência: Database

O banco recebe o registro cifrado. Em produção, um KMS ou HSM gerenciaria a chave de dados e sua política de acesso. O laboratório representa esse limite com uma referência de chave e não persiste material privado.

## Operações reais e simulações

| Recurso                   | Comportamento no laboratório                                       |
| ------------------------- | ------------------------------------------------------------------ |
| SHA-256                   | Operação real via Web Crypto API                                   |
| AES-256-GCM               | Operação real via Web Crypto API                                   |
| ECDSA P-256               | Operação real via Web Crypto API                                   |
| RSA-OAEP                  | Operação real via Web Crypto API                                   |
| ECDH                      | Representação didática do acordo de chaves nos fluxos de protocolo |
| PKI e certificados        | Simulação educacional                                              |
| CRL / OCSP                | Simulação educacional                                              |
| TLS / mTLS                | Simulação educacional de handshake e decisão                       |
| Gateway, servidor e banco | Arquitetura e artefatos ilustrativos                               |

A interface identifica cada laboratório com o seu modo. Ela não exibe nem persiste chaves privadas reais.

## Como executar

Requisitos:

- Node.js compatível com Next.js 16.
- Dependências instaladas no projeto.

```bash
npm.cmd install
npm.cmd run dev
```

Abra http://localhost:3000.

No PowerShell, use npm.cmd quando a política de execução bloquear o comando npm.

## Roteiro dos laboratórios

### Visão geral

Apresenta o mapa do BioCare e posiciona AES, SHA-256, ECDSA, RSA-OAEP, ECC/ECDH, PKI e revogação antes dos experimentos.

### Arquitetura

Mostra as cinco camadas em sequência. Use Executar automático, Etapa anterior, Próxima etapa e Reiniciar para controlar a apresentação.

A cada camada, a tela gera artefatos ilustrativos:

- cardiac-payload.json e identidade pública do dispositivo.
- Metadados de ECDH e chave de sessão.
- Resposta OCSP.
- Digest SHA-256 e assinatura ECDSA.
- Registro AES-GCM e chave AES encapsulada.

Simular adulteração produz outro digest e invalida a assinatura. Simular certificado revogado faz o gateway rejeitar o acesso.

### SHA-256

Edite o documento e selecione Calcular hash. O laboratório exibe bytes UTF-8, digest hexadecimal e comparação com o primeiro hash calculado. Use Alterar texto para observar a perda de integridade.

### AES-256-GCM

Informe um texto, selecione Cifrar e inspecione IV e ciphertext. Selecione Decifrar para recuperar o texto enquanto chave, IV e pacote permanecem compatíveis.

### Assinatura digital

Selecione Assinar para gerar uma assinatura ECDSA P-256 temporária. Selecione Verificar para validar a assinatura. Tamper Test altera o conteúdo e demonstra a rejeição.

### Criptografia híbrida

Gera um pacote com ciphertext AES-GCM, IV e chave AES encapsulada por RSA-OAEP. Use este módulo para explicar por que RSA protege a chave e AES protege o conteúdo maior.

### RSA × ECC × AES

Compara os papéis de cada família:

- AES cifra dados em massa com uma chave simétrica.
- RSA encapsula chaves e mantém compatibilidade ampla.
- ECC atende identidade, assinatura e acordo de chaves com material menor.

### Laboratório PKI

Avance pelas quatro etapas:

1. O dispositivo monta uma CSR.
2. A CA avalia identidade, política e prova de posse.
3. A CA emite o certificado.
4. O cliente valida a cadeia até a Root CA.

A tela acumula CSR, decisão de emissão, certificado e relatório de cadeia. Troque o certificado analisado ou selecione Emitir certificado simulado para atualizar o contexto.

### CRL / OCSP

Escolha um certificado para acompanhar extração de serial, consulta OCSP, validação da resposta e decisão de acesso. Use Revogar para alterar o status e observar a transição para DENY.

### IoT cardíaco

Selecione Gerar e cifrar telemetria. O navegador gera payload, chave AES-256, IV e ciphertext. A coleção de artefatos separa o JSON de origem, a identidade do dispositivo, os metadados de sessão e o envelope AES-GCM.

### TLS / mTLS

Alterne entre TLS e mTLS. A etapa de autenticação evidencia se apenas o servidor, ou servidor e cliente, apresentam certificados. O fluxo também detalha negociação, derivação de chaves e proteção dos registros.

### Caso completo

Conecta origem, transporte, assinatura e persistência. Se não houver certificado revogado, o navegador gera ciphertext, digest SHA-256, assinatura ECDSA e registro cifrado. Ao revogar um certificado em CRL/OCSP, o cenário bloqueia a operação antes da cifra.

## Como interpretar a interface

Todos os laboratórios guiados usam a mesma leitura:

- Etapas mostram a ordem do processo e permitem navegar livremente.
- Entrada identifica dados, certificados ou chaves usados na etapa.
- Operação descreve o algoritmo ou validação aplicada.
- Saída informa o artefato produzido.
- Propriedade de segurança explica o ganho obtido.
- Artefatos gerados acumulam arquivos e valores conforme você avança.
- Inspeção do artefato abre conteúdo, tipo, origem e propósito técnico.

Valores em Hex, Base64 ou JSON servem para estudo. Eles não representam credenciais utilizáveis fora da sessão.

## Estrutura do projeto

```text
src/components/security-lab/
├── SecurityLabView.tsx
├── data.ts
├── useCertificates.ts
├── crypto/
│   ├── encoding.ts
│   └── operations.ts
├── labs/
│   ├── ArchitectureLab.tsx
│   ├── CoreCryptoLabs.tsx
│   ├── GuidedTrustLab.tsx
│   ├── GuidedTrustLabs.tsx
│   └── trustLabContent.ts
├── architecture/
│   ├── artifacts.ts
│   ├── data.ts
│   └── useArchitectureSimulation.ts
└── ui/
    ├── LabPrimitives.tsx
    └── SecurityLabShell.tsx
```

## Validação

```bash
npm.cmd test
npm.cmd run check-types -- --incremental false
npm.cmd run lint
npm.cmd run build
```

O comando de tipos aceita a opção --incremental false quando o ambiente não permite gravar o arquivo incremental em out/.

## Limites e cuidados

- Use somente dados fictícios no laboratório.
- Trate certificados, CRL/OCSP e TLS/mTLS como modelos educacionais.
- Não copie valores de demonstração para ambientes reais.
- Não use a memória do navegador como estratégia de custódia de chaves em produção.
- Uma implementação de produção exige CA, armazenamento seguro de chaves, rotação, logs de auditoria, política de falha de revogação, TLS configurado no servidor e revisão de segurança.
