# Engecap · Controle de M.O.

Mesmos acessos do Diário de Obra (`admin` / `engenheiro` / `apontador`).
Banco **separado** no Supabase. CSV de funcionários sobe pela tela Admin.

## 1. Git + domínio

```bash
cd engecap-mo
git init
git add .
git commit -m "primeiro commit mo"
git branch -M main
git remote add origin https://github.com/SEU_USER/engecap-mo.git
git push -u origin main
```

No Vercel: Import Project → esse repo → Add domain (ex: `mo.engecap.com.br`).

## 2. Supabase (projeto NOVO, não o do Diário)

1. supabase.com → New project → nome `engecap-mo`
2. SQL Editor → cola `supabase/schema.sql` → Run
3. Authentication → Providers → Email ligado
4. Authentication → Users → Add user (3 vezes):

| email | senha | role |
|---|---|---|
| admin@obra.local | admin123 | no metadata: `{"role":"admin"}` |
| engenheiro@obra.local | 123456 | `{"role":"engenheiro"}` |
| apontador@obra.local | 123456 | `{"role":"apontador"}` |

Se o profile nascer como apontador, no SQL:

```sql
update profiles set role = 'admin' where email = 'admin@obra.local';
update profiles set role = 'engenheiro' where email = 'engenheiro@obra.local';
```

5. Project Settings → API:
   - Project URL
   - anon public key

## 3. Variáveis no Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service_role — só no servidor, nunca no browser
```

Admin:
- `/admin` painel
- `/admin/usuarios` criar / editar perfil / ativar / excluir
- `/admin/csv` planilha + log de uploads


Redeploy.

## 4. CSV de funcionários

Formato (igual o Diário):

```
chapa;nome;funcao
18432;CARLOS ALBERTO SILVA;Carpinteiro
19201;MARCOS PAULO FERREIRA;Armador
```

Aceita `;` ou `,`.

Quem sobe: **admin** ou **engenheiro**, na rota `/admin/csv`.

Chapa repetida **atualiza** nome e função (não duplica).

## Acessos

- admin → tudo + CSV
- engenheiro → cadastro, liberação, resumo, saldo + CSV
- apontador → só lançar medição

O HTML das telas de medição continua o protótipo (`public/app.html`) enquanto a gente troca tela a tela pelo Next.
