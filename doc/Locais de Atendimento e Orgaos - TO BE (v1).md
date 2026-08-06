# Locais de Atendimento e Órgãos — TO BE (v1)

Portal Único · CMS de Locais de Atendimento — SETDIG
Rascunho para validação

## 1. Objetivo

Este pacote especifica como devem funcionar os cadastros de **Órgão** e de **Local de Atendimento (Unidade)** no novo CMS do Portal Único. Ele descreve, escopo a escopo, as telas, os campos de cada formulário, as ações disponíveis e as regras de negócio, servindo de especificação para o time de desenvolvimento.

O conteúdo foi levantado a partir de um protótipo navegável construído para exemplificar o comportamento pretendido. O protótipo é material de apoio, não o produto: o que vale como especificação é o que está descrito aqui — os campos visíveis em cada cadastro, na ordem em que aparecem, com sua obrigatoriedade e suas regras. Tudo que ainda não está decidido aparece como pendência na seção 7.

Escopos cobertos:

- **Escopo 1 — Cadastrar Órgãos:** catálogo de órgãos (sigla, nome e situação).
- **Escopo 2 — Gestão do Órgão:** identificação, contato, endereço, horários e associações (setores, gestores, usuários e sites relacionados).
- **Escopo 3 — Local de Atendimento:** cadastro do local, contato, horário de funcionamento e horário de atendimento.

Os horários não têm cadastro próprio: cada horário é informado no momento em que se cadastra o órgão ou o local de atendimento.

## 2. Perfis

Os perfis abaixo são os oferecidos no vínculo entre pessoa e órgão (aba Usuários do órgão). O protótipo não aplica controle de acesso, portanto a descrição de cada perfil e a matriz RBAC do item 4.9 são uma **proposta a validar** (Pendência P2).

| Perfil | O que pode fazer |
| --- | --- |
| Administrador | Acesso completo: cadastra e edita órgãos e locais de atendimento e gerencia as associações do órgão. Referência para os demais perfis. |
| Gerente (Órgão) | Mesmo acesso do Administrador, porém restrito ao seu próprio órgão e aos locais vinculados a ele; não cadastra novos órgãos. |
| Gestor de conteúdo | Mesmo acesso do Gerente, porém não gerencia usuários do órgão nem exclui locais de atendimento. |
| Atendente | Apenas consulta os dados do órgão e dos locais aos quais está vinculado; não edita cadastros. |

## 3. Escopo 1 — Cadastrar Órgãos

Catálogo de órgãos: mantém sigla, nome completo e situação. Cadastro enxuto, sem contato, endereço ou horários — esses ficam no Escopo 2.

### 3.1 Telas

| Tela | Conteúdo |
| --- | --- |
| Listagem de órgãos | Tabela com Sigla, Nome do órgão, Status e ações; contador de órgãos cadastrados. |
| Novo órgão | Formulário de cadastro. |
| Gerenciar órgão | Mesmo formulário, preenchido. |

### 3.2 Campos do formulário

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Sigla | text (até 30 caracteres) | Sim | Sigla do órgão. Gravada sempre em maiúsculas e não pode repetir. | DETRAN |
| Nome do órgão | text | Sim | Nome completo, sem abreviações. | Departamento Estadual de Trânsito |
| Ativo? | checkbox | Não | Situação do órgão. Vem marcado por padrão. | Marcado |

### 3.3 Ações

| Ação | Onde | Resultado |
| --- | --- | --- |
| + Novo Órgão | Listagem | Abre o formulário de cadastro. |
| Editar | Listagem | Abre o formulário preenchido. |
| Excluir | Listagem | Pede confirmação e remove o registro. |
| Cadastrar Órgão / Salvar Alterações | Formulário | Grava e volta para a listagem. |
| Cancelar | Formulário | Descarta e volta para a listagem. |

### 3.4 Regras de negócio

1. A sigla identifica o órgão no catálogo e é única. Ao tentar gravar uma sigla existente, o sistema recusa com a mensagem: *"Já existe um órgão cadastrado com a sigla "X"."*
2. A sigla é convertida para maiúsculas antes de gravar e de checar duplicidade.
3. Sigla e nome são obrigatórios; a ausência de qualquer um deles interrompe a gravação ("Informe a sigla do órgão." / "Informe o nome do órgão.").
4. O órgão nasce ativo quando o checkbox permanece marcado.

## 4. Escopo 2 — Gestão do Órgão

Reúne a identificação do órgão, o contato, o endereço, os horários e as quatro associações. O horário cadastrado aqui fica disponível para reaproveitamento no cadastro do local de atendimento (Escopo 3).

### 4.1 Telas

| Tela | Conteúdo |
| --- | --- |
| Listagem de órgãos | Sigla, Nome, nº de Setores, nº de Unidades, Status e ações. |
| Novo Órgão | Identificação + Informações de Contato + Endereço + Horários, na mesma página. |
| Informações do Órgão | Leitura dos dados e painel de Associações (abas Setores, Gestores, Usuários e Sites relacionados). |
| Gerenciar Órgão | Mesmo formulário de "Novo Órgão", preenchido. |
| Gerenciar Contato | Somente o bloco de contato, com os campos obrigatórios. |
| Gerenciar Endereço | Blocos de Endereço e de Horários, com os campos obrigatórios. |

### 4.2 Identificação do órgão

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Órgão | select | Sim | Escolha do órgão entre os cadastrados no Escopo 1. O nome completo acompanha a sigla escolhida, sem digitação. | DETRAN |

### 4.3 Informações de Contato

Responsável, telefone e e-mail do órgão, mais os canais de atendimento. No cadastro de um novo órgão a seção é opcional; se qualquer campo for preenchido, telefone e e-mail passam a ser obrigatórios.

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Responsável | text | Não | Nome da pessoa responsável pelo órgão. Não aparece na tela "Novo Órgão"; é informado em "Gerenciar Órgão" ou "Gerenciar Contato" (Pendência P3). | Maria Souza |
| Telefone | text (máscara de telefone) | Condicional | Telefone do órgão. Obrigatório na tela de contato e sempre que a seção for preenchida. | (67) 3318-0000 |
| Email | email | Condicional | Email do órgão. Mesma regra do telefone. | contato@detran.ms.gov.br |
| Canais de atendimento | blocos repetíveis (tipo + valor) | Não | Canais adicionais. Tipos: Telefone, WhatsApp, E-mail, Ouvidoria e Outro. | WhatsApp — (67) 99999-0000 |
| Rótulo do canal | text | Condicional | Só aparece quando o tipo é "Outro"; nos demais, o próprio tipo vira o rótulo. | Instagram |

### 4.4 Endereço

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| CEP | text (máscara 00000-000) | Condicional | CEP do endereço. | 79002-000 |
| Endereço | text | Condicional | Rua, avenida ou rodovia e número, em campo único. | Av. Afonso Pena, 3504 |
| Complemento | text | Não | Bloco, sala ou andar. | Bloco B, 2º andar |
| Bairro | text | Condicional | Bairro do endereço. | Centro |
| UF | select | Condicional | Estado do endereço. Filtra a lista de cidades (Pendência P4). | MS |
| Cidade | select com busca | Condicional | Município do órgão. Só lista cidades da UF escolhida. | Campo Grande |
| Source do maps | textarea | Condicional | Source/embed do maps.google.com correspondente ao endereço. | https://www.google.com/maps/embed?pb=... |

### 4.5 Horários

Bloco próprio, separado do Endereço. O órgão tem **um único conjunto de dias da semana**, válido para os dois horários.

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Dias da Semana | seleção múltipla (Segunda a Domingo) | Condicional | Dias em que o órgão funciona. Ao menos um dia precisa ser escolhido. | Segunda a Sexta |
| Órgão tem intervalo no funcionamento? | checkbox | Não | Marque se o intervalo de almoço estiver ativo. Desmarcado, os campos de fim da manhã e início da tarde ficam desabilitados nos dois horários. | Marcado |
| Horário de funcionamento — Início manhã | time | Condicional | Hora de início do funcionamento pela manhã. | 07:30 |
| Horário de funcionamento — Fim manhã | time | Condicional | Habilitado só quando há intervalo. | 11:30 |
| Horário de funcionamento — Início tarde | time | Condicional | Habilitado só quando há intervalo. | 13:30 |
| Horário de funcionamento — Fim tarde | time | Condicional | Hora de encerramento do funcionamento. | 17:30 |
| Horário de atendimento — Início manhã | time | Condicional | Hora de início do atendimento ao cidadão pela manhã. | 08:00 |
| Horário de atendimento — Fim manhã | time | Condicional | Habilitado só quando há intervalo. | 11:00 |
| Horário de atendimento — Início tarde | time | Condicional | Habilitado só quando há intervalo. | 13:00 |
| Horário de atendimento — Fim tarde | time | Condicional | Hora de encerramento do atendimento. | 17:00 |

Os quatro campos de cada horário ficam lado a lado, em uma única linha.

### 4.6 Associações — Setores

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Sigla | text | Sim | Sigla do setor. Não pode repetir dentro do mesmo órgão. | CNH |
| Nome | text | Sim | Nome do setor. | Setor de Habilitação |
| Status (Ativo/Inativo) | ação na listagem | — | O setor nasce ativo; a listagem permite ativar, inativar e excluir. | Ativo |

### 4.7 Associações — Gestores

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Foto do gestor | url | Não | Endereço da foto do gestor, com pré-visualização (Pendência P5). | https://.../foto.jpg |
| Nome | text | Sim | Nome do gestor. | João da Silva |
| Biografia | textarea | Sim | Biografia do gestor. Aceita HTML. | Diretor-presidente desde 2023. |
| Ativo? | checkbox | Não | Situação do gestor. Vem marcado por padrão. | Marcado |

### 4.8 Associações — Usuários e Sites relacionados

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Usuário (CPF/nome) | select com busca | Sim | Pessoa a ser vinculada. A mesma pessoa não pode ser vinculada duas vezes ao mesmo órgão. | 000.000.000-00 — Maria Souza |
| Perfil | select | Sim | Perfil no órgão: Gerente, Administrador, Atendente ou Gestor de conteúdo. | Gerente |
| Site — Título | text | Sim | Título do site relacionado. | Portal do DETRAN |
| Site — Link | url | Sim | Endereço do site. | https://www.detran.ms.gov.br |
| Site — Ativo? | checkbox | Não | Situação do site. | Marcado |

### 4.9 Matriz RBAC (proposta — ver Pendência P2)

| Ação | Administrador | Gerente | Gestor de conteúdo | Atendente |
| --- | --- | --- | --- | --- |
| Cadastrar órgão | Sim | Não | Não | Não |
| Editar dados do órgão | Sim | Sim | Sim | Não |
| Excluir órgão | Sim | Não | Não | Não |
| Gerenciar setores, gestores e sites | Sim | Sim | Sim | Não |
| Gerenciar usuários do órgão | Sim | Sim | Não | Não |
| Cadastrar/editar local de atendimento | Sim | Sim | Sim | Não |
| Excluir local de atendimento | Sim | Sim | Não | Não |
| Consultar cadastros | Sim | Sim | Sim | Sim |

### 4.10 Regras de negócio do Escopo 2

1. O nome do órgão não é digitado: acompanha a sigla escolhida na lista de órgãos cadastrados.
2. Contato e endereço são opcionais no cadastro de um novo órgão, mas funcionam como "tudo ou nada": preencheu qualquer campo da seção, os demais campos marcados passam a ser exigidos.
3. Ao salvar o contato, os canais adicionais gravados são exatamente os que estão na tela — remover um canal da tela o remove do cadastro.
4. Ao salvar o endereço, exige-se endereço, source do maps, cidade, ao menos um dia da semana e as quatro pontas de horário (início da manhã e fim da tarde de cada tipo).
5. Sem intervalo, os campos de fim da manhã e início da tarde ficam desabilitados e são gravados vazios, mesmo que tenham sido preenchidos antes de desmarcar.
6. Um órgão com locais de atendimento vinculados não pode ser excluído: *"Este órgão possui N unidade(s) vinculada(s). Remova ou realoque as unidades antes de excluir."*
7. Excluir o órgão remove junto o contato, os canais, o endereço, os horários e as quatro associações.

## 5. Escopo 3 — Local de Atendimento (Unidade)

O formulário tem quatro blocos e é o mesmo no cadastro de um novo local e na edição de um local existente.

### 5.1 Bloco 1 — Cadastro do local de atendimento

Dados exibidos na seção "Onde solicitar" da Carta de Serviço.

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Órgão | select com busca | Sim | Órgão responsável pelo local. Define qual horário fica disponível para reaproveitamento nos blocos 3 e 4. | DETRAN |
| Nome do local de atendimento | text | Sim | Nome do local. | Agência DETRAN Centro |
| CEP | text (máscara 00000-000) | Sim | CEP do logradouro. | 79002-000 |
| Endereço | text | Sim | Logradouro e número do local. | Rua Engenheiro Luthero Lopes, 36 |
| Complemento | text | Não | Complemento do endereço, se houver. | Sala 12 |
| Bairro | text | Sim | Bairro onde o local está situado. | Centro |
| UF | select | Sim | Estado do local. Filtra a lista de cidades (Pendência P4). | MS |
| Cidade | select com busca | Sim | Município do local. Só lista cidades da UF escolhida. | Campo Grande |
| Source do maps | textarea | Sim | Link de referência do endereço no Google Maps (embed). | https://www.google.com/maps/embed?pb=... |
| Ativo (apto para atendimento) | checkbox | Não | Indica se o local está apto para atendimento. Vem marcado por padrão. | Marcado |

### 5.2 Bloco 2 — Adicionar contato

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Responsável da Unidade | text | Sim | Nome da pessoa responsável pela unidade. | Maria Souza |
| Telefone da unidade | text (máscara de telefone) | Sim | Telefone de contato do local. | (67) 3318-0000 |
| E-mail da unidade | email | Sim | E-mail de contato do local. | contato@orgao.ms.gov.br |
| Canais de atendimento | blocos repetíveis (tipo + valor) | Não | Canais adicionais. Tipos: Telefone, WhatsApp, E-mail, Ouvidoria e Outro. | WhatsApp — (67) 99999-0000 |
| Rótulo do canal | text | Condicional | Só aparece quando o tipo é "Outro". | WhatsApp da Glória |

### 5.3 Bloco 3 — Horário de funcionamento

Período em que o local está aberto — informação interna, não exibida ao cidadão. Os campos de período se repetem: é possível cadastrar vários períodos (ex.: segunda a sexta em um horário e sábado em outro).

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| Usar um horário já cadastrado | select | Não | Preenche os períodos com o horário cadastrado no órgão escolhido no bloco 1. Os valores continuam editáveis. A opção só aparece quando aquele órgão tem horário cadastrado. | Horário do órgão — Segunda a Sexta, 07:30–17:30 |
| Dias da semana | checkboxes (Segunda a Domingo) | Sim | Dias em que o local funciona naquele período. | Segunda a Sexta |
| Há intervalo (almoço)? | checkbox | Não | Desmarcado, o horário é corrido e os campos da tarde ficam desabilitados. | Marcado |
| Início da manhã | time | Sim | Horário de abertura no período da manhã. | 07:30 |
| Fim da manhã | time | Condicional | Habilitado só quando há intervalo. | 11:30 |
| Início da tarde | time | Condicional | Habilitado só quando há intervalo. | 13:30 |
| Fim da tarde | time | Sim | Horário de encerramento do período. | 17:30 |
| + adicionar outro período | ação | — | Cria um novo bloco de período, com dias e horários próprios. | — |

### 5.4 Bloco 4 — Horário de atendimento

Período em que o cidadão é atendido — **é o horário exibido na Carta de Serviço**. Traz os mesmos recursos do bloco 3, preenchidos de forma independente, e acrescenta o modo dia a dia.

| Campo | Tipo | Obrigatório | Descrição | Exemplo de preenchimento |
| --- | --- | --- | --- | --- |
| O horário muda de acordo com o dia da semana? | checkbox | Não | Desmarcado, vale o formato do bloco 3 (dias da semana + um horário para todos eles). Marcado, cada dia recebe seu próprio horário. | Marcado |
| Dia da semana (linha) | checkbox | Sim | No modo dia a dia, liga o dia e habilita os quatro campos de horário da linha. | Segunda |
| Início manhã / Fim manhã / Início tarde / Fim tarde | time (4 campos por linha) | Sim | Horário daquele dia. Deixar os campos da tarde em branco significa atendimento corrido. | 08:00 / 11:00 / 13:00 / 17:00 |

### 5.5 Ações

| Ação | Onde | Resultado |
| --- | --- | --- |
| + Novo Local de Atendimento | Listagem | Abre o formulário em branco. |
| Editar | Listagem | Abre o formulário preenchido. |
| Excluir | Listagem | Pede confirmação e remove o local, seus horários, canais e vínculos. |
| Salvar Local de Atendimento / Salvar Alterações | Formulário | Grava e volta para a listagem. |

### 5.6 Regras de negócio do Escopo 3

1. São obrigatórios: órgão, nome do local, CEP, endereço, bairro, UF, cidade, source do maps, responsável da unidade, telefone e e-mail.
2. A cada salvamento, os canais e os horários gravados são exatamente os que estão na tela.
3. Um período só vira horário gravado quando tem início da manhã e fim da tarde preenchidos; períodos sem nenhum dia selecionado são ignorados.
4. Com intervalo, o dia tem duas faixas (manhã e tarde); sem intervalo, uma faixa corrida do início da manhã ao fim da tarde.
5. No modo dia a dia, o intervalo é deduzido: preencher fim da manhã e início da tarde marca aquele dia como tendo intervalo.
6. Ao alternar entre os dois modos, nada digitado se perde: ao ligar, o horário é distribuído por dia; ao desligar, dias com horário idêntico voltam agrupados em um único período.
7. O horário do órgão serve apenas como ponto de partida: depois de trazido pelo select, ele pertence ao local e pode ser ajustado sem afetar o órgão.

## 6. Notificações

Não há notificações (e-mail, push ou aviso interno) previstas para estes cadastros. A comunicação com o usuário se limita a mensagens na própria tela: confirmação antes de excluir, mensagem de erro quando uma regra de negócio bloqueia a gravação e indicação de progresso nos botões durante a gravação. Se o módulo precisar notificar alguém — por exemplo, avisar o órgão quando um local for inativado —, isso ainda precisa ser definido (Pendência P6).

## 7. Pendências para Fechamento

| # | Pendência | Situação |
| --- | --- | --- |
| P1 | Confirmar que o select "Órgão" do Escopo 2 lê o catálogo do Escopo 1. No protótipo ele usa uma lista fixa de siglas (AGEPEN, DETRAN, SEJUSP, SES), o que impede cadastrar um órgão fora dessa lista. | Em aberto |
| P2 | A descrição dos perfis (seção 2) e a matriz RBAC (4.9) são proposta: o protótipo não tem controle de acesso. Precisam de validação antes do desenvolvimento. | Proposta a validar |
| P3 | O campo "Responsável" do órgão não aparece na tela "Novo Órgão", mas continua em "Gerenciar Órgão" e "Gerenciar Contato". Definir se ele sai de todas as telas ou se a diferença é intencional. | Em aberto |
| P4 | Definir o comportamento da UF: se continua sendo escolhida pelo usuário apenas para filtrar a cidade, ou se passa a ser preenchida automaticamente a partir do CEP. | Em aberto |
| P5 | A foto do gestor é informada por endereço (URL); confirmar se o CMS deve permitir o upload do arquivo. | Em aberto |
| P6 | Não há notificações definidas para o módulo (seção 6). | Em aberto |
| P7 | Não há links de protótipo Figma registrados neste pacote — as referências visuais disponíveis são os prints do protótipo navegável (seção 8). | Em aberto |

## 8. Anexos — Protótipo de Referência

Prints do protótipo navegável usado como base para este documento:

| Arquivo | Tela |
| --- | --- |
| all.png | Informações do Órgão — visão completa |
| contato.png | Gerenciar Contato do órgão |
| endereco.png | Gerenciar Endereço do órgão |
| add-setor.png | Associações — novo setor |
| gestor.png | Associações — gestor do órgão |
| add-usuario.png | Associações — vincular usuário |
| site.png | Associações — site relacionado |

Documentação anterior herdada: **"Locais de Atendimento — PESQUISA (atualizado)"**, de 02/08/2026 — origem das tabelas campo a campo dos Escopos 2 e 3 e da decisão de separar horário de funcionamento e horário de atendimento, destacando o de atendimento como o horário público da Carta de Serviço.

## 9. Validação

| Item | Registro |
| --- | --- |
| Versão | v1 (rascunho) |
| Autoria | Daniele Lins Ichiy — SETDIG |
| Validado por | *pendente* |
| Data de fechamento | *pendente* |
