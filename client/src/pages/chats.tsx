import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { ChatEmtpy } from '@/components/chat-empty'
import { FormMessage } from '@/components/form-message'
import { Message } from '@/components/message'
import { useAppDispatch, useAppSelector } from '@/hooks/store'

import { chatActions } from '../store/chat'

export const Route = createFileRoute('/chats')({
  component: RouteComponent,
  beforeLoad: ({ context: { store } }) => {
    const state = store.getState()
    const isUser = state.user.currentUser

    if (!isUser) {
      throw redirect({
        to: '/',
      })
    }
  },
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  const { connected, messages, error } = useAppSelector((state) => state.chat)
  const { currentUser } = useAppSelector((state) => state.user)

  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    dispatch(
      chatActions.connect({
        username: currentUser!.username,
      }),
    )

    return () => {
      dispatch(chatActions.disconnect())
    }
  }, [currentUser, dispatch])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [messages.length])

  if (!currentUser) return <ChatEmtpy title="Usuário não encontrado" />

  const connectionStatus = connected ? 'Conectado' : 'Desconectado'

  return (
    <div className="bg-muted w-screen h-screen">
      <div className="max-w-[800px] mx-auto w-full h-full p-4 flex flex-col gap-4">
        <header className="flex items-center justify-between py-4 border-b">
          <div>
            <p className="text-sm text-muted-foreground">Chat.dev</p>
            <p className="text-lg font-semibold">Olá, {currentUser.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-500'}`}
            />
            <span className="text-sm text-muted-foreground">
              {connectionStatus}
            </span>
          </div>
        </header>

        <div
          className="flex-1 flex flex-col gap-4 w-full overflow-y-auto"
          ref={messagesContainerRef}
        >
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {messages.length === 0 ? (
            <ChatEmtpy />
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                currentUserId={currentUser.username}
                message={message}
              />
            ))
          )}
        </div>

        <FormMessage />
      </div>
    </div>
  )
}
