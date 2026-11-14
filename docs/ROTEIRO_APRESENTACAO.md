# Roteiro de apresentação — ContaCerta (20–30 min)

## A. Introdução à tecnologia (5 minutos)

- O que é Ionic: framework para aplicações móveis com tecnologias web.
- Angular: componentes, data binding, formulários e injeção de dependências.
- Capacitor: empacotamento Android/iOS e acesso a funções nativas.
- Vantagens: reaproveitamento do código web, produtividade, componentes de UI.
- Desvantagens: depende de WebView; alguns recursos exigem plugins; performance pode variar.

## B. Demonstração do desenvolvimento (10 minutos)

1. Mostrar `package.json`, `angular.json`, `capacitor.config.ts`.
2. Mostrar `src/app/models/bill.model.ts` — tipos e prioridades.
3. Mostrar `src/app/services/bills.service.ts` — CRUD SQLite/localStorage.
4. Mostrar `src/app/app.component.ts` — estado, filtros, totais, validação e eventos.
5. Mostrar `src/app/app.component.html` / `.scss` — interface.
6. Executar `npm start` e demonstrar o hot reload editando um texto ou estilo.
7. Criar uma conta, pesquisar, filtrar, editar, marcar como paga e excluir.
8. Fechar/reabrir o app para demonstrar persistência local.

## C. Build e deploy (5 minutos)

- `npm run build` gera os arquivos web em `www/browser`.
- `npx cap add android` cria o projeto Android nativo.
- `npx cap sync android` copia os arquivos e instala plugins.
- `npx cap open android` abre Android Studio para gerar o APK.
- Falar sobre build de iOS no macOS com Xcode (não precisa gerar IPA para demonstração Android).
- Questões de desempenho: poucos recursos, banco local, sem tráfego de rede obrigatório.

## D. Comparativo com React Native (5 minutos)

| Aspecto | Ionic/Angular | React Native |
|---|---|---|
| Interface | Componentes web dentro de WebView | Componentes nativos via React Native |
| Linguagem | TypeScript, HTML e SCSS | JavaScript/TypeScript e JSX/TSX |
| Componentização | Angular | React |
| Acesso ao nativo | Plugins Capacitor | APIs/bibliotecas React Native/Expo |
| Web + mobile | Compartilhamento de projeto web | Possível via React Native Web, com diferenças |

## Checklist antes da apresentação

- Concluir `npm install`, `npm run build` e testar no Android.
- Verificar criação, edição, exclusão, conclusão, filtros e salvamento.
- Publicar o repositório no GitHub.
- Preparar slides e dividir partes entre integrantes do grupo.
