import type { Middleware } from '@reduxjs/toolkit'
import { uuidv7 } from 'uuidv7'

import {
  chatActions,
  chatListActions,
  type ChatMessage,
} from '@/store/slices/chat'

export const websocketMiddleware: Middleware = (store) => {
  let socket: WebSocket | null = null

  return (next) => (action) => {
    if (chatActions.connect.match(action)) {
      const { chatId, userId, username } = action.payload

      socket = new WebSocket(`ws://localhost:3333/ws/chat/${chatId}`)

      socket.onopen = () => {
        store.dispatch(chatActions.wsConnected({ chatId }))
        socket?.send(
          JSON.stringify({
            type: 'join',
            payload: { user_id: userId, username, chat_id: chatId },
          }),
        )
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const { type } = data

        if (type === 'message') {
          const message = data.payload as ChatMessage
          const { id } = message
          const state = store.getState()
          const currentUserId = state.users.user?.id
          const currentChatId = state.chat.chatId

          store.dispatch(chatActions.messageReceived(message))

          const isMessageMine = message.senderId === currentUserId
          const isChatOpen = message.chatId === currentChatId

          if (!isMessageMine && !isChatOpen) {
            store.dispatch(
              chatListActions.incrementUnread({
                chatId: message.chatId,
              }),
            )
          }

          if (!isMessageMine) {
            store.dispatch(
              chatActions.sendAck({
                messageId: id,
                userId: currentUserId!,
                status: 'delivered',
              }),
            )
          }
        }

        if (data.type === 'status') {
          const {
            message_id,
            delivered_count,
            seen_count,
            total_participants,
            status,
          } = data.payload

          store.dispatch(
            chatActions.messageStatusUpdated({
              messageId: message_id,
              deliveredCount: delivered_count,
              seenCount: seen_count,
              totalParticipants: total_participants,
              status,
            }),
          )
        }
      }

      socket.onclose = () => {
        store.dispatch(chatActions.wsDisconnected())
      }
    }

    if (chatActions.sendMessage.match(action)) {
      const { message } = action.payload

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('socket não está OPEN, readyState=', socket?.readyState)
        return
      }

      socket?.send(
        JSON.stringify({
          type: 'message',
          payload: {
            ...message,
            totalParticipants: 0,
            createdAt: new Date().toISOString(),
            id: uuidv7(),
            deliveredCount: 0,
            seenCount: 0,
          },
        }),
      )
    }

    if (chatActions.sendAck.match(action)) {
      const { messageId, userId, status } = action.payload

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'ack',
            payload: {
              message_id: messageId,
              user_id: userId,
              status,
            },
          }),
        )
      }
    }
    if (chatActions.disconnect.match(action)) {
      socket?.close()
      socket = null
    }

    return next(action)
  }
}
