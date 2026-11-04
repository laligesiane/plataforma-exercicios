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
[`supabase/migrations/0004_corrige_criar_atividade.sql`](../supabase/migrations/0004_corrige_criar_atividade.sql).
Rode cada arquivo uma vez só, na ordem.

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

Os modelos usam o link padrão `{{ .ConfirmationURL }}`, que é o que o site espera: não troque esse trecho.
Magic link e Change email não são usados pelo site por enquanto, então podem ficar como estão.
O modelo de senha fica pronto para quando o site ganhar a opção "Esqueci minha senha".
