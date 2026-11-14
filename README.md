# ContaCerta — Gerenciador de Contas e Tarefas Financeiras

Projeto acadêmico de **Explorando Tecnologias Móveis (TPE)**. Aplicativo com **Ionic 8 + Angular 19 + Capacitor 7**, diferente de React Native.

## Funcionalidades

- Criar, editar, excluir e concluir tarefas financeiras (contas a pagar)
- Categorias: Moradia, Água, Energia, Internet, Cartão, Assinatura e Outros
- Prioridades alta, média e baixa
- Busca por descrição/observação e filtros por situação e categoria
- Dashboard: contas em aberto, pagas, vencidas e vencimento próximo
- Relatório de distribuição por categoria e resumo de pagamentos
- Dados persistidos localmente: **SQLite no Android/iOS** e **localStorage no navegador**
- Sem login, sem API e sem necessidade de conexão com a internet durante o uso

O app vem com **6 registros fictícios de demonstração**, inseridos somente na primeira execução. É possível editar ou excluir todos. Ao excluir todos, o app continuará vazio até o próximo cadastro.

## Como executar no Windows (VS Code)

Pré-requisitos: **Node.js 20 ou superior** e npm. Na pasta extraída, execute:

```powershell
npm install
npm start
```

Abra **http://localhost:4200**. Se o PowerShell bloquear scripts do npm, use `npm.cmd install` e `npm.cmd start`.

## Como gerar APK para Android

Além do Node.js, instale o **Android Studio**, o Android SDK e o JDK compatível com a versão do Android Gradle Plugin escolhida pelo Capacitor.

```powershell
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

No Android Studio, aguarde a sincronização Gradle e use **Build > Build Bundle(s) / APK(s) > Build APK(s)**. O arquivo será criado pelo Android Studio na pasta do projeto Android, tipicamente em `android/app/build/outputs/apk/debug/`.

Nas próximas alterações do código, execute `npm run android:sync` antes de abrir/compilar no Android Studio.

> **Importante:** este ZIP contém o **código-fonte**, não um APK pronto. O projeto Android é gerado no seu computador pelo comando `npx cap add android`. Não inclua `node_modules` nem `android/` no GitHub, a menos que o professor peça o projeto Android nativo.

## Como o armazenamento funciona

O serviço `src/app/services/bills.service.ts` utiliza `@capacitor-community/sqlite` no aplicativo Android/iOS e `localStorage` quando executado no navegador. São armazenamentos **separados** (os dados do navegador não são sincronizados com os do celular). Os dados ficam no próprio dispositivo e não são transmitidos para um servidor.

No modo navegador, apagar os dados do site no navegador também apaga as contas cadastradas. No Android, desinstalar o app pode apagar o banco local. Não use dados financeiros reais sensíveis para demonstração.

## Organização dos arquivos

```text
ContaCerta_TPE/
├── src/
│   ├── app/
│   │   ├── app.component.ts       # Interações, validações, telas e relatórios
│   │   ├── app.component.html     # Interface Ionic
│   │   ├── app.component.scss     # Estilos da interface
│   │   ├── models/bill.model.ts   # Modelo da conta, tipos e dados de exemplo
│   │   └── services/bills.service.ts # SQLite nativo / localStorage web
│   ├── index.html
│   ├── global.scss
│   ├── theme.scss
│   └── main.ts
├── docs/ROTEIRO_APRESENTACAO.md
├── capacitor.config.ts
├── angular.json
└── package.json
```

## Publicar no GitHub

```powershell
git init
git add .
git commit -m "ContaCerta: aplicativo TPE em Ionic e Angular"
```

Crie um repositório vazio na sua conta do GitHub e conecte-o com `git remote add origin URL_DO_REPOSITORIO`, depois `git branch -M main` e `git push -u origin main`.

## Entrega conforme TPE.pdf

- [x] Tecnologia diferente de React Native: Ionic
- [x] Criar / editar / excluir tarefas
- [x] Categorizar tarefas
- [x] Definir prioridades
- [x] Concluir tarefas
- [x] Buscar e filtrar
- [x] Persistência local
- [ ] Instalar dependências e testar no computador do grupo
- [ ] Gerar e testar APK no Android
- [ ] Publicar código no GitHub
- [ ] Criar slides para seminário de 20–30 minutos

**Nota técnica:** o código foi estruturado para execução, mas não foi compilado neste ambiente, que não possui acesso ao registro npm. É necessário rodar `npm install` e `npm run build` no computador para validar dependências, compilação e o SQLite nativo.


## Navegação atualizada (v1.1)

A barra inferior do Android agora exibe **Início**, **Contas**, **Cadastrar**, **Categorias** e **Relatórios**.
O cadastro de contas já existia e podia ser aberto pelo botão "+"; nesta versão ele tem um rótulo visível.
A nova tela de Categorias mostra o resumo por tipo e permite filtrar a lista ao tocar em uma categoria.
Após salvar uma conta, o aplicativo abre a aba Contas.

Para atualizar um APK antigo após substituir os arquivos do projeto: `npm.cmd install`, `npm.cmd run build`, `npx.cmd cap sync android` e `npx.cmd cap open android`; no Android Studio, compile e execute o módulo `app`. **Não execute `cap add android` caso já exista a pasta android.**
