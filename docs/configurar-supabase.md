# Configurar o Supabase

Passo a passo para ligar o login, os papéis e os convites. Faça uma vez só, nesta ordem.

## 1. Criar as tabelas

No Supabase, abra **SQL Editor → New query**, cole todo o conteúdo de
[`supabase/migrations/0001_perfis.sql`](../supabase/migrations/0001_perfis.sql) e clique em **Run**.

## 2. Fechar o cadastro aberto

Em **Authentication → Sign In / Providers**, desligue **Allow new users to sign up**.
Assim só entra quem recebeu convite.

## 3. Endereços do site

Em **Authentication → URL Configuration**:

- **Site URL:** `https://plataforma-exercicios.vercel.app`
- **Redirect URLs:** adicione `https://*-lavnia-gesianes-projects.vercel.app/**` e `http://localhost:3000/**`

## 4. E-mail de convite

Em **Authentication → Emails → Invite user**, troque o corpo do e-mail por:

```html
<h2>Você foi convidado para a Plataforma de Exercícios</h2>
<p>Clique no link abaixo para criar sua senha:</p>
<p><a href="{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=invite">Criar minha senha</a></p>
```

O assunto pode ser "Seu convite para a Plataforma de Exercícios".

## 5. Variáveis na Vercel

Em **Vercel → plataforma-exercicios → Settings → Environment Variables**, adicione para todos os ambientes:

| Nome | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://eafuupcfaemtfahqdnyh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | a secret key (`sb_secret_...`), em Project Settings → API Keys |

A secret key dá acesso total ao banco: cole só na Vercel, nunca em chat, e-mail ou código.
Depois de salvar, faça um **Redeploy** para valer.

## 6. Criar a conta da professora

1. Em **Authentication → Users → Add user → Send invitation**, coloque o e-mail da professora.
2. Ela abre o e-mail, cria a senha e entra (por enquanto como aluna).
3. No **SQL Editor**, rode trocando o e-mail:

```sql
update public.perfil set papel = 'professora' where email = 'email-da-professora@exemplo.com';
```

Pronto: ao entrar de novo, ela vai para o painel e pode convidar os alunos.

## 7. E-mails para os alunos (antes de convidar a turma)

O e-mail embutido do Supabase só envia para quem é membro do projeto no Supabase e poucos por hora.
Para convidar alunos de verdade, crie uma conta grátis no [Resend](https://resend.com) e configure em
**Authentication → Emails → SMTP Settings** com os dados de SMTP que o Resend mostra.
