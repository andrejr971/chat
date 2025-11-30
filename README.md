# Chat.dev (FastAPI + React)

MVP single-room com broadcast e protocolo de ACK (`received`/`delivered`/`seen`). Não há banco de dados: todo estado vive em memória porque o objetivo do case é focar em WebSockets e confirmação de entrega/leitura sem adicionar overhead de persistência.

## Como rodar
- Backend (porta 3333):
  - `cd api`
  - `pdm install`
  - `pdm run dev`
- Frontend (porta 5173):
  - `cd client`
  - `pnpm install`
  - `pnpm dev`
- Abra duas ou mais abas em `http://localhost:5173`, informe nomes diferentes e envie mensagens para ver o broadcast e as confirmações.
- Se precisar apontar para outra origem, defina `VITE_WS_URL` no frontend (ex.: `VITE_WS_URL=ws://localhost:3333/ws pnpm dev`).

## Decisões técnicas e trade-offs
### Backend (FastAPI + WebSocket)
1. **Sem banco (por quê?)**: o escopo do desafio prioriza WebSockets e ACKs; manter tudo em memória reduz complexidade (sem migrations/ORM), elimina I/O de persistência e acelera iteração. Trade-off: estado some em restart, aceitável para o MVP.
2. **ACK**: o servidor responde ao remetente em três momentos: `received` (chegou ao servidor), `delivered` (broadcast enviado a todos os conectados) e `seen` (algum cliente sinalizou leitura). Fluxo simples e idempotente.
3. **Gerência de conexões**: `ConnectionManager` mantém `username -> set[WebSocket]`, `message_id -> owner` e quem já marcou `seen`. Suporta múltiplas abas por usuário.
4. **Broadcast**: envia para todos os sockets conectados, pulando apenas o socket de origem. Conexões quebradas são removidas de forma defensiva.
5. **Desconexões**: remove a conexão e envia mensagem de sistema “entrou/saiu” aos demais. Mensagens não confirmadas se perdem (trade-off do MVP).

### Frontend (React + Redux)
6. **Estado centralizado**: Redux guarda `chat` (mensagens, status, conexão) e `user` (persistido em cookie via nookies).
7. **Middleware WebSocket**: abre o socket com `connect`, envia mensagens com `sendMessage`, marca `seen` e trata ACKs.
8. **UI**: lista de mensagens com status, badge de sistema para eventos de entrada/saída e barra de conexão. Cada mensagem exibida com horário local.
9. **Reconexão simples**: ao fechar o socket, o middleware sinaliza desconexão; o usuário pode recarregar/reenviar. Histórico é local e se perde ao recarregar (coerente com não persistir).
10. **Erros**: feedback curto na UI quando a conexão falha.

## O que faria com mais tempo
- Persistir histórico e estados de entrega para sobreviver a restarts.
- Adicionar autenticação real e múltiplas salas.
- Implementar confirmação de recebimento por usuário (não só leitura).
- Cobrir com testes automatizados (unitários e e2e com Playwright).
