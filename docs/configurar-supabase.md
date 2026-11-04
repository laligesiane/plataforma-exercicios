# Configurar o Supabase

Passo a passo para ligar o cadastro de professores, as turmas e os convites. Faça uma vez só, nesta ordem.

## 1. Criar as tabelas

No Supabase, abra **SQL Editor → New query**, cole todo o conteúdo de
[`supabase/migrations/0001_inicial.sql`](../supabase/migrations/0001_inicial.sql) e clique em **Run**.

Isso cria o plano grátis (1 turma, 10 alunos), os perfis, as turmas e as regras de acesso.
Para mudar os limites depois, edite a linha `gratis` na tabela **plano** (Table Editor).

## 2. Endereços do site

Em **Authentication → URL Configuration**:

- **Site URL:** `https://plataforma-exercicios.vercel.app`
- **Redirect URLs:** adicione `https://*-lavnia-gesianes-projects.vercel.app/**` e `http://localhost:3000/**`

## 3. Modelos de e-mail

Em **Authentication → Emails**, troque o corpo destes dois modelos.

**Confirm signup** (professor confirmando o cadastro):

```html
<h2>Confirme sua conta na Plataforma de Exercícios</h2>
<p><a href="{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email">Confirmar meu e-mail</a></p>
```

**Invite user** (aluno convidado para uma turma):

```html
<h2>Você foi convidado para uma turma na Plataforma de Exercícios</h2>
<p><a href="{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=invite">Criar minha senha</a></p>
```

## 4. Variáveis na Vercel

Em **Vercel → plataforma-exercicios → Settings → Environment Variables**, adicione para todos os ambientes:

| Nome | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://eafuupcfaemtfahqdnyh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | a secret key (`sb_secret_...`), em Project Settings → API Keys |

A secret key dá acesso total ao banco: cole só na Vercel, nunca em chat, e-mail ou código.
Depois de salvar, faça um **Redeploy** para valer.

## 5. Testar

1. Abra o site, clique em **Sou professor** e crie uma conta.
2. Confirme pelo e-mail, entre e crie uma turma.
3. Na turma, convide um aluno com outro e-mail seu.

## 6. E-mails de verdade (antes de abrir para outros professores)

O e-mail embutido do Supabase só envia para membros do projeto no Supabase e poucos por hora.
Para professores e alunos reais, crie uma conta grátis no [Resend](https://resend.com) e configure em
**Authentication → Emails → SMTP Settings** com os dados de SMTP que o Resend mostra.
