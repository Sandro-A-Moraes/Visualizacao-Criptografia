export type TrustLabArtifact = {
  name: string;
  type: string;
  content: string;
  description: string;
};

export type TrustLabStep = {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  input: string;
  operation: string;
  output: string;
  security: string;
  artifact: TrustLabArtifact;
};

export type TrustLabDefinition = {
  title: string;
  mode: string;
  introduction: string;
  steps: TrustLabStep[];
};

export const trustLabContent: Record<
  'pki' | 'revocation' | 'iot' | 'tls' | 'scenario',
  TrustLabDefinition
> = {
  pki: {
    title: 'Laboratório PKI',
    mode: 'SIMULAÇÃO EDUCACIONAL',
    introduction:
      'A PKI não cifra o prontuário diretamente. Ela cria uma cadeia verificável entre uma identidade, uma chave pública e uma autoridade confiável. Avance para acompanhar a emissão e a validação de um certificado do monitor cardíaco.',
    steps: [
      {
        id: 'identity',
        title: 'Identidade solicita certificado',
        summary: 'O dispositivo prepara sua identidade e sua chave pública.',
        explanation:
          'O monitor gera seu par de chaves localmente e envia apenas a chave pública com seus atributos de identidade. A chave privada nunca deve sair do dispositivo; ela será usada depois para provar que o monitor controla a identidade descrita no certificado.',
        input: 'Identificador CARD-001, modelo do dispositivo e chave pública ECC P-256',
        operation: 'Montagem e envio de uma Certificate Signing Request (CSR)',
        output: 'Pedido de certificado pronto para validação pela autoridade',
        security: 'Posse da chave privada e vínculo inicial com a identidade',
        artifact: {
          name: 'card-001.csr.pem',
          type: 'PKCS #10 CSR',
          content: '-----BEGIN CERTIFICATE REQUEST-----\nMIIB...CARD-001...P256...\n-----END CERTIFICATE REQUEST-----',
          description:
            'Pedido ilustrativo que contém a identidade declarada, a chave pública do dispositivo e a assinatura de prova de posse da chave privada.',
        },
      },
      {
        id: 'validation',
        title: 'CA valida o pedido',
        summary: 'A autoridade verifica cadastro, política e prova de posse.',
        explanation:
          'A CA intermediária não assina qualquer pedido automaticamente. Ela confere se o dispositivo está cadastrado, se o nome solicitado pertence ao ambiente BioCare e se a CSR foi assinada pela chave privada correspondente à chave pública enviada.',
        input: 'CSR, inventário de dispositivos e política de emissão BioCare IoT',
        operation: 'Validação de identidade, autorização e assinatura da CSR',
        output: 'Pedido aprovado com perfil Client Authentication',
        security: 'Impede que uma chave arbitrária receba uma identidade confiável',
        artifact: {
          name: 'issuance-policy.json',
          type: 'CA decision',
          content: '{\n  "subject": "CN=CARD-001",\n  "profile": "iot-client",\n  "decision": "approved"\n}',
          description:
            'Registro educacional da decisão de emissão, mostrando qual identidade foi aprovada e qual perfil limita o uso do certificado.',
        },
      },
      {
        id: 'issuance',
        title: 'CA emite e assina',
        summary: 'A CA intermediária assina o certificado do dispositivo.',
        explanation:
          'A autoridade constrói o certificado com subject, issuer, serial, validade, chave pública e extensões de uso. Em seguida calcula o hash desses campos e o assina com sua chave privada, tornando qualquer alteração posterior detectável.',
        input: 'Pedido aprovado, serial único, validade e extensões X.509',
        operation: 'Codificação X.509, SHA-256 e assinatura da CA intermediária',
        output: 'Certificado final ligado à chave pública de CARD-001',
        security: 'Autenticidade do emissor e integridade dos campos certificados',
        artifact: {
          name: 'card-001.crt.pem',
          type: 'X.509 certificate',
          content: '-----BEGIN CERTIFICATE-----\nMIIC...BC-11D09...CLIENT_AUTH...\n-----END CERTIFICATE-----',
          description:
            'Certificado ilustrativo assinado pela CA intermediária. Ele pode ser distribuído publicamente, ao contrário da chave privada do dispositivo.',
        },
      },
      {
        id: 'chain',
        title: 'Cliente valida a cadeia',
        summary: 'As assinaturas são verificadas até uma raiz confiável.',
        explanation:
          'O servidor verifica validade, hostname ou identidade, finalidade, assinatura do certificado e assinatura da CA intermediária. A cadeia só termina com sucesso quando alcança uma Root CA já presente no repositório de confiança do servidor.',
        input: 'Certificado do dispositivo, certificado intermediário e Root CA confiável',
        operation: 'Construção da cadeia e verificação de cada assinatura e restrição',
        output: 'Cadeia CARD-001 → Intermediate CA → Root CA aceita',
        security: 'Confiança transitiva ancorada em uma raiz controlada',
        artifact: {
          name: 'chain-validation.txt',
          type: 'Validation report',
          content: '[GOOD] CARD-001\n[GOOD] BioCare Intermediate CA\n[TRUSTED] BioCare Root CA',
          description:
            'Relatório que torna explícitos os elos percorridos e o ponto de confiança usado para aceitar a identidade do dispositivo.',
        },
      },
    ],
  },
  revocation: {
    title: 'CRL / OCSP',
    mode: 'SIMULAÇÃO EDUCACIONAL',
    introduction:
      'Validade de data não é suficiente: um certificado pode ter sido comprometido antes de expirar. Este fluxo mostra como o serial é consultado, como a resposta é autenticada e por que a aplicação precisa decidir antes de aceitar a conexão.',
    steps: [
      {
        id: 'serial',
        title: 'Extrair o serial',
        summary: 'O verificador identifica exatamente qual certificado consultar.',
        explanation:
          'A consulta de revogação usa o serial emitido pela CA e a identidade do emissor. Usar apenas o nome do certificado seria ambíguo: o mesmo subject pode receber vários certificados ao longo do tempo, cada um com um serial diferente.',
        input: 'Certificado X.509 apresentado durante a conexão',
        operation: 'Leitura do serial, issuer e endereço do respondedor OCSP',
        output: 'Identificador único do certificado e da CA emissora',
        security: 'Evita consultar ou aplicar o status ao certificado errado',
        artifact: {
          name: 'certificate-identity.json',
          type: 'X.509 fields',
          content: '{ "serial": "BC-11D09", "issuer": "BioCare Intermediate CA" }',
          description:
            'Campos mínimos usados para localizar o status correto sem confundir certificados que compartilham o mesmo nome de sujeito.',
        },
      },
      {
        id: 'request',
        title: 'Montar consulta OCSP',
        summary: 'O cliente envia um identificador derivado do certificado.',
        explanation:
          'A requisição OCSP combina hashes do nome e da chave do emissor com o serial consultado. Um nonce pode ser incluído para reduzir reutilização indevida de respostas antigas quando o respondedor e o cliente suportam esse mecanismo.',
        input: 'Serial, hashes do emissor e nonce opcional',
        operation: 'Codificação ASN.1 de uma OCSPRequest direcionada ao respondedor',
        output: 'Consulta compacta pronta para transporte HTTP',
        security: 'Associa a consulta ao emissor correto e reduz ambiguidades',
        artifact: {
          name: 'ocsp-request.der',
          type: 'OCSPRequest',
          content: 'issuerNameHash=7C4A… | issuerKeyHash=0F91… | serial=BC-11D09 | nonce=91A2…',
          description:
            'Representação legível da requisição binária que seria enviada ao serviço responsável pelo status de revogação.',
        },
      },
      {
        id: 'response',
        title: 'Validar a resposta',
        summary: 'O status só é confiável quando a resposta também é autenticada.',
        explanation:
          'O respondedor retorna GOOD, REVOKED ou UNKNOWN com horários de produção e próxima atualização. O cliente valida a assinatura da resposta, sua autorização e sua janela de frescor antes de confiar no status informado.',
        input: 'OCSPResponse assinada, certificado do respondedor e horário atual',
        operation: 'Verificação da assinatura, autorização e validade temporal da resposta',
        output: 'Status autenticado e suficientemente recente',
        security: 'Impede que uma resposta forjada ou expirada libere um certificado',
        artifact: {
          name: 'ocsp-response.json',
          type: 'OCSPResponse',
          content: '{ "serial": "BC-11D09", "status": "GOOD", "thisUpdate": "2026-08-14T12:00:00Z" }',
          description:
            'Resposta educacional com o status do serial e o instante de referência que o cliente precisa validar antes da decisão.',
        },
      },
      {
        id: 'decision',
        title: 'Aplicar a decisão',
        summary: 'A política converte o status em aceitar, rejeitar ou interromper.',
        explanation:
          'GOOD permite continuar, REVOKED encerra imediatamente a conexão e UNKNOWN exige uma política explícita. Sistemas clínicos não devem transformar falha de consulta em sucesso silencioso, pois isso esconde indisponibilidade do controle de revogação.',
        input: 'Status OCSP validado e política de falha do serviço',
        operation: 'Avaliação da regra de acesso antes de estabelecer a sessão',
        output: 'Conexão aceita ou rejeitada com uma razão auditável',
        security: 'Bloqueio de credenciais comprometidas antes do acesso ao sistema',
        artifact: {
          name: 'access-decision.log',
          type: 'Audit event',
          content: 'certificate=BC-11D09 status=GOOD decision=ALLOW reason=OCSP_VALID',
          description:
            'Evento de auditoria que registra o certificado, o status recebido e a regra que determinou o resultado da conexão.',
        },
      },
    ],
  },
  iot: {
    title: 'IoT cardíaco',
    mode: 'OPERAÇÃO REAL + CONTEXTO SIMULADO',
    introduction:
      'O navegador executa AES-256-GCM de verdade para proteger uma telemetria fictícia. Identidade do dispositivo, certificado e acordo ECDH são representações educacionais, pois o laboratório não opera uma CA nem um hardware IoT real.',
    steps: [
      {
        id: 'payload',
        title: 'Capturar telemetria',
        summary: 'O sensor transforma uma leitura física em uma mensagem estruturada.',
        explanation:
          'A frequência cardíaca recebe um timestamp e o identificador do dispositivo para que o servidor reconheça origem e ordem. Esses metadados não provam autenticidade sozinhos, mas entram no conteúdo protegido e ajudam a detectar repetição.',
        input: 'Leitura de 82 bpm obtida pelo sensor cardíaco',
        operation: 'Serialização UTF-8 de um documento JSON com identidade e tempo',
        output: 'Payload determinístico pronto para proteção criptográfica',
        security: 'Contexto para rastreabilidade, ordenação e prevenção de replay',
        artifact: {
          name: 'telemetry.json',
          type: 'UTF-8 JSON',
          content: '{\n  "deviceId": "CARD-001",\n  "heartRate": 82,\n  "timestamp": "aguardando execução"\n}',
          description:
            'Mensagem clínica fictícia antes da cifra. Ela é legível neste ponto e por isso ainda não oferece confidencialidade.',
        },
      },
      {
        id: 'identity',
        title: 'Autenticar o dispositivo',
        summary: 'A chave pública é ligada ao certificado de CARD-001.',
        explanation:
          'O gateway valida a cadeia do certificado e exige prova de posse da chave privada durante o canal autenticado. Isso evita tratar apenas o campo deviceId do JSON como identidade, pois esse texto pode ser copiado por qualquer emissor.',
        input: 'Certificado CARD-001, cadeia BioCare e prova criptográfica',
        operation: 'Validação PKI e autenticação simulada da chave privada ECC',
        output: 'Sessão associada ao dispositivo autorizado CARD-001',
        security: 'Autenticidade do dispositivo antes de aceitar sua telemetria',
        artifact: {
          name: 'device-identity.txt',
          type: 'mTLS identity',
          content: 'subject=CN=CARD-001\ncurve=P-256\nchain=VALID\nusage=CLIENT_AUTH',
          description:
            'Resumo da identidade validada que mostra a curva, a finalidade permitida e o resultado da cadeia de confiança.',
        },
      },
      {
        id: 'session',
        title: 'Preparar a sessão',
        summary: 'A sessão recebe uma chave simétrica e um IV exclusivo.',
        explanation:
          'Em uma conexão real, ECDH contribui para derivar segredos efêmeros. Neste laboratório o navegador gera diretamente uma chave AES de 256 bits e um IV aleatório de 96 bits; reutilizar o mesmo IV com a mesma chave quebraria garantias do GCM.',
        input: 'Contexto autenticado da sessão e gerador aleatório do navegador',
        operation: 'Geração Web Crypto de chave AES-256 e IV de 12 bytes',
        output: 'Material de sessão mantido somente em memória',
        security: 'Chave efêmera e nonce exclusivo para a operação AES-GCM',
        artifact: {
          name: 'session-metadata.json',
          type: 'AES-GCM parameters',
          content: '{ "algorithm": "AES-GCM", "keyLength": 256, "iv": "aguardando execução" }',
          description:
            'Metadados públicos necessários para decifrar. A chave não é mostrada nem persistida; permanece como CryptoKey na memória.',
        },
      },
      {
        id: 'encryption',
        title: 'Cifrar e autenticar',
        summary: 'AES-GCM produz ciphertext e tag de autenticação em uma operação.',
        explanation:
          'O Web Crypto transforma os bytes do JSON em ciphertext e acrescenta uma tag que será verificada na decifragem. Alterar um bit do pacote, usar outro IV ou outra chave faz a operação falhar em vez de entregar um dado silenciosamente corrompido.',
        input: 'Bytes UTF-8 da telemetria, CryptoKey AES-256 e IV de 96 bits',
        operation: 'crypto.subtle.encrypt com o algoritmo AES-GCM',
        output: 'Pacote Base64 com IV e ciphertext autenticado',
        security: 'Confidencialidade, integridade e autenticação do payload',
        artifact: {
          name: 'telemetry.enc.json',
          type: 'AES-GCM envelope',
          content: '{ "iv": "aguardando execução", "ciphertext": "aguardando execução" }',
          description:
            'Envelope transportável gerado pelo navegador. Sem a CryptoKey correta, o conteúdo não pode ser recuperado ou alterado validamente.',
        },
      },
    ],
  },
  tls: {
    title: 'TLS / mTLS',
    mode: 'SIMULAÇÃO EDUCACIONAL',
    introduction:
      'O handshake não cifra os dados diretamente com o certificado. Ele autentica participantes, negocia algoritmos e deriva chaves efêmeras que protegem a sessão. Alterne entre TLS e mTLS para observar quem precisa apresentar identidade.',
    steps: [
      {
        id: 'hello',
        title: 'Negociar capacidades',
        summary: 'Cliente e servidor escolhem versão, algoritmos e parâmetros.',
        explanation:
          'ClientHello oferece versões, cipher suites, extensões, nome do servidor e um compartilhamento de chave efêmero. ServerHello seleciona uma combinação compatível. Esse acordo define como o restante do handshake será autenticado e protegido.',
        input: 'TLS 1.3, suites suportadas, SNI e chave pública efêmera do cliente',
        operation: 'Negociação de versão e TLS_AES_256_GCM_SHA384',
        output: 'Parâmetros aceitos e chave pública efêmera do servidor',
        security: 'Negociação explícita com proteção posterior contra downgrade',
        artifact: {
          name: 'client-hello.json',
          type: 'TLS handshake message',
          content: '{ "version": "TLS 1.3", "sni": "api.biocare.demo", "keyShare": "X25519:A91F…" }',
          description:
            'Visão legível da primeira mensagem do cliente com o destino e as capacidades oferecidas para a conexão segura.',
        },
      },
      {
        id: 'certificate',
        title: 'Autenticar identidades',
        summary: 'O servidor sempre se identifica; no mTLS o cliente também.',
        explanation:
          'O servidor envia sua cadeia e prova que controla a chave privada do certificado. No mTLS, solicita também o certificado do cliente e sua prova de posse. A validação inclui cadeia, nome, finalidade, validade e revogação.',
        input: 'Cadeias X.509, transcript do handshake e provas de posse',
        operation: 'CertificateVerify e validações PKI para cada participante exigido',
        output: 'Servidor autenticado e, no mTLS, cliente também autenticado',
        security: 'Bloqueio de impersonação e associação da sessão às identidades',
        artifact: {
          name: 'peer-certificates.txt',
          type: 'X.509 chains',
          content: 'server=CN=api.biocare.demo [VALID]\nclient=CN=CARD-001 [TLS: not requested | mTLS: VALID]',
          description:
            'Resumo comparativo que evidencia a principal diferença de identidade entre uma sessão TLS comum e uma sessão mTLS.',
        },
      },
      {
        id: 'keys',
        title: 'Derivar chaves da sessão',
        summary: 'O segredo ECDH é transformado em chaves independentes.',
        explanation:
          'Cada lado combina sua chave efêmera privada com a pública recebida para obter o mesmo segredo ECDH. O HKDF mistura esse segredo com o transcript e deriva chaves separadas por direção, sem transmitir as chaves de tráfego pela rede.',
        input: 'Segredo ECDH efêmero e hash de todas as mensagens do handshake',
        operation: 'HKDF-Extract e HKDF-Expand conforme o key schedule do TLS 1.3',
        output: 'Chaves de tráfego distintas para cliente e servidor',
        security: 'Sigilo futuro e separação criptográfica das direções do canal',
        artifact: {
          name: 'key-schedule.txt',
          type: 'TLS 1.3 secrets',
          content: 'handshake_secret=HKDF(ECDH)\nclient_traffic_secret=DERIVED\nserver_traffic_secret=DERIVED',
          description:
            'Mapa conceitual da derivação; os valores secretos reais não são exibidos, armazenados ou transmitidos neste laboratório.',
        },
      },
      {
        id: 'channel',
        title: 'Proteger o canal',
        summary: 'Registros da aplicação passam a usar cifra autenticada.',
        explanation:
          'Após validar as mensagens Finished, cada lado cifra registros com sua chave de tráfego e um nonce derivado do contador. O cabeçalho necessário ao transporte fica visível, enquanto conteúdo e tag são protegidos contra leitura e alteração.',
        input: 'Requisição HTTP, chave de tráfego, contador e dados associados',
        operation: 'Proteção de TLS records com AES-256-GCM',
        output: 'Registros cifrados e autenticados enviados pela conexão',
        security: 'Confidencialidade, integridade e ordenação do tráfego',
        artifact: {
          name: 'application-record.tls',
          type: 'TLSCiphertext',
          content: 'type=application_data | sequence=0001 | ciphertext=98D4A3… | tag=71BC…',
          description:
            'Representação de um registro de aplicação protegido, com sequência e conteúdo cifrado vinculados à sessão negociada.',
        },
      },
    ],
  },
  scenario: {
    title: 'Caso completo',
    mode: 'OPERAÇÕES REAIS + FLUXO SIMULADO',
    introduction:
      'Este caso conecta identidade, transmissão, processamento clínico e armazenamento. As operações SHA-256, ECDSA e AES-GCM são executadas pelo navegador; a infraestrutura PKI, o gateway, o servidor e o transporte são encenados para estudo.',
    steps: [
      {
        id: 'origin',
        title: 'Dispositivo prepara o dado',
        summary: 'A telemetria nasce com identidade, horário e contexto clínico.',
        explanation:
          'CARD-001 serializa a leitura e a associa à sessão autenticada. A identidade não depende apenas de um campo do JSON: ela vem do certificado e da prova de posse da chave privada durante o mTLS simulado.',
        input: 'Leitura de 82 bpm e certificado cliente de CARD-001',
        operation: 'Serialização do JSON e validação PKI/OCSP do dispositivo',
        output: 'Telemetria atribuída a uma identidade autorizada',
        security: 'Origem autenticada e bloqueio de certificado revogado',
        artifact: {
          name: 'ingestion-context.json',
          type: 'Authenticated telemetry',
          content: '{ "device": "CARD-001", "heartRate": 82, "certificate": "BC-11D09", "ocsp": "GOOD" }',
          description:
            'Contexto de ingestão que une o dado clínico ao serial validado em vez de confiar somente em uma identificação textual.',
        },
      },
      {
        id: 'transport',
        title: 'Canal transporta o pacote',
        summary: 'A sessão protege o dado durante o salto até o gateway.',
        explanation:
          'O payload é cifrado com AES-GCM dentro do canal autenticado. O IV segue com o pacote porque não é secreto, mas deve ser único para aquela chave. A tag permite ao gateway rejeitar alterações antes de interpretar o JSON.',
        input: 'Telemetria UTF-8, chave de sessão AES-256 e IV aleatório',
        operation: 'Cifra autenticada AES-GCM executada pelo Web Crypto',
        output: 'Envelope com IV e ciphertext para o gateway',
        security: 'Confidencialidade e integridade em trânsito',
        artifact: {
          name: 'gateway-envelope.json',
          type: 'AES-GCM envelope',
          content: '{ "iv": "aguardando execução", "ciphertext": "aguardando execução" }',
          description:
            'Pacote cifrado que pode atravessar uma rede não confiável sem expor a leitura cardíaca nem aceitar alterações silenciosas.',
        },
      },
      {
        id: 'report',
        title: 'Servidor produz evidência',
        summary: 'O relatório recebe digest e assinatura digital verificável.',
        explanation:
          'Depois de validar e processar o dado, o servidor calcula SHA-256 sobre o relatório canônico e assina os mesmos bytes com ECDSA P-256. Quem tiver a chave pública pode detectar mudança e verificar qual chave produziu a assinatura.',
        input: 'Relatório clínico canônico em UTF-8 e chave privada ECDSA efêmera',
        operation: 'SHA-256 seguido de assinatura ECDSA P-256 com SHA-256',
        output: 'Digest hexadecimal e assinatura Base64 anexados ao relatório',
        security: 'Integridade verificável, autenticidade e evidência de autoria da chave',
        artifact: {
          name: 'signed-report.json',
          type: 'SHA-256 + ECDSA',
          content: '{ "digest": "aguardando execução", "signature": "aguardando execução" }',
          description:
            'Relatório com duas evidências distintas: o digest identifica o conteúdo e a assinatura permite verificar a chave que o aprovou.',
        },
      },
      {
        id: 'storage',
        title: 'Armazenar com proteção',
        summary: 'Dados e chaves seguem ciclos de vida separados.',
        explanation:
          'O relatório é cifrado com uma chave AES exclusiva ou rotacionável. Em uma arquitetura real, um KMS protegeria essa chave e aplicaria política de acesso; aqui a CryptoKey permanece somente na memória da demonstração e não é persistida.',
        input: 'Relatório assinado, chave de dados AES e política de acesso clínico',
        operation: 'AES-GCM para o conteúdo e encapsulamento conceitual da chave',
        output: 'Registro cifrado, metadados de integridade e referência da chave',
        security: 'Confidencialidade em repouso e separação entre dado e chave',
        artifact: {
          name: 'stored-record.json',
          type: 'Encrypted record',
          content: '{ "record": "AES-GCM ciphertext", "keyReference": "kms://biocare/reports/demo" }',
          description:
            'Representação do registro persistido sem a chave em texto aberto, deixando explícita a separação entre o banco e o serviço de chaves.',
        },
      },
    ],
  },
};
