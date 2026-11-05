# Configurar o Supabase

Passo a passo para ligar o cadastro de professores, as turmas e os convites. Faça uma vez só, nesta ordem.

## 0. Ligar o domínio repasa.com.br

1. Na **Vercel → plataforma-exercicios → Settings → Domains**, adicione `repasa.com.br`. Aceite a sugestão de também
   adicionar `www.repasa.com.br` redirecionando para o principal.
2. A Vercel vai mostrar o domínio como "Invalid Configuration". Escolha a opção de **Nameservers** e anote os dois
   endereços (normalmente `ns1.vercel-dns.com` e `ns2.vercel-dns.com`).
3. No **registro.br**, entre em **Domínios → repasa.com.br → DNS → Alterar servidores DNS**, troque pelos dois
   endereços da Vercel e salve.
4. A troca leva de alguns minutos a algumas horas. Quando a Vercel mostrar "Valid Configuration", o site abre em
   `https://repasa.com.br`, já com HTTPS.

## 1. Criar as tabelas

No Supabase, abra **SQL Editor → New query**, cole todo o conteúdo de
[`supabase/migrations/0001_inicial.sql`](../supabase/migrations/0001_inicial.sql) e clique em **Run**.

Isso cria o plano grátis (1 turma, 10 alunos), os perfis, as turmas e as regras de acesso.
Para mudar os limites depois, edite a linha `gratis` na tabela **plano** (Table Editor).

Depois, numa nova query, cole e rode
[`supabase/migrations/0002_atividades.sql`](../supabase/migrations/0002_atividades.sql).
Ela cria as atividades, os exercícios e as respostas dos alunos. Em seguida rode
[`supabase/migrations/0003_tipos_arrastar.sql`](../supabase/migrations/0003_tipos_arrastar.sql),
que libera os exercícios de arrastar, classificar e relacionar, e depois
[`supabase/migrations/0004_corrige_criar_atividade.sql`](../supabase/migrations/0004_corrige_criar_atividade.sql)
e [`supabase/migrations/0005_envio.sql`](../supabase/migrations/0005_envio.sql) (botão "Enviar respostas").
Por fim, [`supabase/migrations/0006_midia.sql`](../supabase/migrations/0006_midia.sql) cria a pasta
"midia" no Storage, onde ficam as imagens e os áudios que o professor envia (até 20 MB cada).
Rode cada arquivo uma vez só, na ordem.

Depois dos arquivos 0010 a 0016 (agenda, aulas, resumos e turmas de qualquer matéria), rode
[`supabase/migrations/0007_atividade_materia.sql`](../supabase/migrations/0007_atividade_materia.sql).
Ela deixa as atividades serem de qualquer matéria, não só de idiomas. O número é menor,
mas ela vem por último. Pode rodar de novo sem erro.
Em seguida rode [`supabase/migrations/0008_producao.sql`](../supabase/migrations/0008_producao.sql):
ela libera a produção escrita e oral (o professor corrige) e o exercício com link do Kahoot,
e cria a pasta privada "producao" no Storage para as gravações dos alunos.

## 2. Endereços do site

Em **Authentication → URL Configuration**:

- **Site URL:** `https://repasa.com.br`
- **Redirect URLs:** adicione `https://www.repasa.com.br/**`, `https://plataforma-exercicios.vercel.app/**`, `https://*-lavnia-gesianes-projects.vercel.app/**` e `http://localhost:3000/**`

## 3. Variáveis na Vercel

Em **Vercel → plataforma-exercicios → Settings → Environment Variables**, adicione para todos os ambientes:

| Nome | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://eafuupcfaemtfahqdnyh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | a secret key (`sb_secret_...`), em Project Settings → API Keys |
| `ANTHROPIC_API_KEY` | chave da Claude API (`sk-ant-...`), em console.anthropic.com → API Keys. Liga o "Gerar atividade" do aluno; sem ela, o botão avisa que ainda não está ligado. |

A secret key dá acesso total ao banco: cole só na Vercel, nunca em chat, e-mail ou código.
Depois de salvar, faça um **Redeploy** para valer.

## 4. Testar

1. Abra o site, clique em **Sou professor** e crie uma conta.
2. Confirme pelo e-mail, entre e crie uma turma.
3. Na turma, convide um aluno com outro e-mail seu.

## 5. E-mails de verdade (antes de abrir para outros professores)

O e-mail embutido do Supabase só envia para membros do projeto no Supabase e poucos por hora.
Para professores e alunos reais, crie uma conta grátis no [Resend](https://resend.com) e configure em
**Authentication → Emails → SMTP Settings** com os dados de SMTP que o Resend mostra.

## 6. E-mails com a cara da Repasa

Com o SMTP ligado, em **Authentication → Emails → Templates**, abra cada modelo, troque o **Subject** e cole o
conteúdo do arquivo no **Message body**:

| Modelo no Supabase | Assunto | Arquivo |
| --- | --- | --- |
| Confirm sign up | Confirme sua conta na Repasa | [`emails/confirmar-cadastro.html`](emails/confirmar-cadastro.html) |
| Invite user | Você foi convidado para uma turma na Repasa | [`emails/convite.html`](emails/convite.html) |
| Reset password | Redefina sua senha da Repasa | [`emails/redefinir-senha.html`](emails/redefinir-senha.html) |
| Magic link | Seu código para entrar na Repasa | [`emails/codigo-entrar.html`](emails/codigo-entrar.html) |

Os modelos usam o link padrão `{{ .ConfirmationURL }}`, que é o que o site espera: não troque esse trecho.
O modelo Magic link é o do "Código por e-mail" na tela de entrar: ele usa `{{ .Token }}` (o código de 6 números)
no lugar do link. Change email não é usado pelo site por enquanto.
O modelo de senha fica pronto para quando o site ganhar a opção "Esqueci minha senha".

## 7. Entrar sem senha, com Google e verificação em duas etapas

Rode [`supabase/migrations/0019_login_perfil.sql`](../supabase/migrations/0019_login_perfil.sql) no SQL Editor.
Ela pega o nome de quem entra pelo Google e faz a pessoa escolher "Sou professor" ou "Sou aluno" no primeiro acesso.

### Código por e-mail

1. Em **Authentication → Emails → Templates → Magic link**, troque o assunto para `Seu código para entrar na Repasa`
   e cole o conteúdo de [`emails/codigo-entrar.html`](emails/codigo-entrar.html). O que faz o código aparecer no e-mail
   é o trecho `{{ .Token }}`.
2. Em **Authentication → Sign In / Providers → Email**, confira que **Email OTP Length** está em `6` e
   **Email OTP Expiration** em `3600` (1 hora).

### Google

No Google Cloud (https://console.cloud.google.com), entrando com a conta Google que vai cuidar da Repasa:

1. No topo, clique no seletor de projetos → **Novo projeto** → nome `Repasa` → **Criar**. Deixe ele selecionado.
2. Menu → **APIs e serviços → Tela de consentimento OAuth** (ou **Google Auth Platform**) → **Começar**.
   - Nome do app: `Repasa`; e-mail de suporte: o seu.
   - Público: **Externo**.
   - Dados de contato: o seu e-mail. Aceite os termos e **Criar**.
3. Em **Branding** (Marca), em **Domínios autorizados**, adicione `repasa.com.br` e salve.
4. Em **Clientes** → **Criar cliente**:
   - Tipo: **Aplicativo da Web**; nome: `Repasa site`.
   - **Origens JavaScript autorizadas:** `https://repasa.com.br`
   - **URIs de redirecionamento autorizados:** `https://eafuupcfaemtfahqdnyh.supabase.co/auth/v1/callback`
   - **Criar**. Aparece o **ID do cliente** e a **Chave secreta do cliente**. Deixe essa janela aberta.
5. Em **Público** (Audience), clique em **Publicar app** → confirmar. Sem isso, só e-mails de teste conseguem entrar.
   Como a Repasa só pede nome, e-mail e foto, o Google não exige revisão.
6. No Supabase, **Authentication → Sign In / Providers → Google**: ligue **Enable Sign in with Google**, cole o
   **Client ID** e o **Client Secret** e salve. A chave secreta vai só aqui: nunca em chat, e-mail ou código.

7. Na **Vercel → plataforma-exercicios → Settings → Environment Variables**, adicione `NEXT_PUBLIC_LOGIN_GOOGLE`
   com o valor `1` (todos os ambientes) e faça um **Redeploy**. Só então o botão "Continuar com Google" aparece
   nas telas de entrar e de cadastro. Antes disso ele fica escondido, para ninguém cair no erro "provider is not enabled".

Quem já tem conta com o mesmo e-mail cai na mesma conta ao entrar pelo Google.

### Verificação em duas etapas

Em **Authentication → Multi-Factor**, confira que **TOTP (App Authenticator)** está **Enabled** (já vem ligado
nos projetos novos). Cada pessoa liga a sua em **Perfil → Verificação em duas etapas**.
Se alguém perder o celular: **Authentication → Users**, abra a pessoa e apague o fator em **MFA factors**
(ou, no SQL Editor, `delete from auth.mfa_factors where user_id = '<id da pessoa>';`).
