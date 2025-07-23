# Configuração do Ambiente de Desenvolvimento

## 1. Criar Novo Projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `Projeto-MAMP-Dev`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: Mesma região do projeto atual
4. Aguarde a criação (2-3 minutos)

## 2. Executar Script SQL

Após a criação do projeto:

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **"New Query"**
3. **OPÇÃO 1**: Copie e cole o conteúdo de `setup-dev-database.sql`
4. **OPÇÃO 2**: Se der erro, use `setup-dev-database-safe.sql`
5. Clique em **"Run"**

## 3. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá para **Settings > API**
2. Copie:
   - **Project URL** 
   - **anon public key**

3. Crie o arquivo `.env.development`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-aqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

## 4. Deploy na Vercel (Ambiente de Desenvolvimento)

### Opção A: Novo Projeto na Vercel
1. No painel da Vercel, clique em **"Add New... > Project"**
2. Selecione o repositório `Projeto-MAMP`
3. Configure:
   - **Project Name**: `projeto-mamp-dev`
   - **Framework**: Next.js
   - **Root Directory**: `.`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Opção B: Branch Preview (Recomendado)
1. A branch `development` já foi criada
2. No painel da Vercel, vá para o projeto existente
3. Em **Settings > Git**, certifique-se que "Automatic deployments" está ativo
4. Qualquer push na branch `development` criará um preview automático

## 5. Configurar Variáveis de Ambiente na Vercel

No painel da Vercel:
1. Vá para **Settings > Environment Variables**
2. Adicione as variáveis do novo banco:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto dev
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave do projeto dev
3. **Environment**: Selecione "Preview" (para branch development)

## 6. Testar o Deploy

1. Faça um pequeno commit na branch development:
```bash
git add .
git commit -m "Setup development environment"
git push origin development
```

2. A Vercel criará automaticamente um deploy de preview
3. Acesse o link fornecido pela Vercel

## Estrutura Final

- **Produção**: 
  - Branch: `main`
  - Banco: Projeto Supabase original
  - Deploy: Domínio principal da Vercel

- **Desenvolvimento**:
  - Branch: `development` 
  - Banco: Novo projeto Supabase (`Projeto-MAMP-Dev`)
  - Deploy: Preview URLs da Vercel

## Vantagens desta Configuração

✅ **Isolamento completo** entre ambientes
✅ **Deploy automático** para cada push na branch development
✅ **URLs únicos** para cada deploy de teste
✅ **Banco separado** sem risco para dados de produção
✅ **Fácil rollback** se algo der errado
