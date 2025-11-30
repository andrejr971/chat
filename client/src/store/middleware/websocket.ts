import type { Middleware } from '@reduxjs/toolkit'

import { chatActions } from '../chat'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3333/ws'

let socket: WebSocket | null = null

export const websocketMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (chatActions.connect.match(action)) {
      const { username } = action.payload

      if (socket) {
        socket.close()
      }

      const separator = WS_URL.includes('?') ? '&' : '?'
      const wsUrl = `${WS_URL}${separator}username=${encodeURIComponent(username)}`

      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        store.dispatch(chatActions.setConnected(true))
        store.dispatch(chatActions.setError(''))
      }

      socket.onclose = () => {
        store.dispatch(chatActions.setConnected(false))
      }

      socket.onerror = () => {
        store.dispatch(
          chatActions.setError('Falha ao conectar. Tentando reconectar...'),
        )
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'ack') {
          store.dispatch(
            chatActions.setMessageStatus({
              id: data.messageId,
              status: data.status,
            }),
          )
          return
        }

        if (data.type === 'message') {
          store.dispatch(
            chatActions.upsertMessage({
              id: data.message.id,
              content: data.message.content,
              from: data.message.from,
              timestamp: data.message.timestamp,
              kind: 'user',
            }),
          )

          const state = store.getState()
          if (data.message.from !== state.chat.username) {
            socket?.send(
              JSON.stringify({ type: 'seen', messageId: data.message.id }),
            )
          }
        }

        if (data.type === 'system') {
          store.dispatch(
            chatActions.upsertMessage({
              id: data.message.id,
              content: data.message.content,
              from: data.message.from,
              timestamp: data.message.timestamp,
              kind: 'system',
            }),
          )
        }
      }
    }

    if (chatActions.disconnect.match(action)) {
      socket?.close()
      socket = null
    }

    if (chatActions.sendMessage.match(action)) {
      const { id, content } = action.payload
      const state = store.getState()

      store.dispatch(
        chatActions.upsertMessage({
          id,
          content,
          from: state.chat.username,
          timestamp: new Date().toISOString(),
          status: 'sent',
        }),
      )

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'message',
            id,
            user: state.chat.username,
            content,
          }),
        )
      } else {
        store.dispatch(chatActions.setError('Sem conexão com o servidor.'))
      }
    }

    if (chatActions.markSeen.match(action)) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({ type: 'seen', messageId: action.payload.id }),
        )
      }
    }

    return next(action)
  }
