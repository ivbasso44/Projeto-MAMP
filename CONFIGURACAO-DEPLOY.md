# Configuração para Deploy de Desenvolvimento

## Problema Identificado
O deploy está usando o projeto Vercel errado, que tem as variáveis do banco antigo.

## Soluções Disponíveis:

### 🎯 SOLUÇÃO 1: Novo Projeto Vercel (RECOMENDADO)
```
1. Criar novo projeto na Vercel: "projeto-mamp-dev"
2. Conectar ao mesmo repositório GitHub
3. Configurar Production Branch = "development"
4. Adicionar variáveis do novo banco
5. Resultado: 2 projetos Vercel separados
```

### 🔧 SOLUÇÃO 2: Configurar Branch Override
```
1. No projeto Vercel existente
2. Settings > Git > Production Branch = "main" 
3. Configurar Branch Override para "development"
4. Resultado: URLs diferentes por branch
```

## Vantagens da Solução 1:
✅ Isolamento completo dos ambientes
✅ URLs mais claras (projeto-mamp.vercel.app vs projeto-mamp-dev.vercel.app)
✅ Configurações independentes
✅ Mais fácil de gerenciar

## Estrutura Final:
```
📦 Projeto-MAMP (produção)
├── vercel.app/projeto-mamp
├── Branch: main
└── Banco: Supabase original

📦 Projeto-MAMP-Dev (desenvolvimento)  
├── vercel.app/projeto-mamp-dev
├── Branch: development
└── Banco: Supabase novo
```
