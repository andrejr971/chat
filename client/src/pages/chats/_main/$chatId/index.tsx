import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useEffectEvent, useRef } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { usePageVisibility } from '@/hooks/usePageVisibility'
import {
  chatActions,
  chatListActions,
  fetchMessages,
} from '@/store/slices/chat'

import { FormMessage } from './-components/form-message'
import { Message } from './-components/message'
import { loadChatDetailOptions } from './layout'

export const Route = createFileRoute('/chats/_main/$chatId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { chatId } = Route.useParams()
  const { data } = useSuspenseQuery(loadChatDetailOptions(chatId))

  const dispatch = useAppDispatch()
  const { messages } = useAppSelector((state) => state.chat)
  const user = useAppSelector((state) => state.users.user)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const isPageVisible = usePageVisibility()

  useEffect(() => {
    dispatch(
      chatActions.connect({
        userId: user!.id,
        username: user!.username,
        chatId: data.id,
      }),
    )

    dispatch(fetchMessages({ chatId }))

    return () => {
      dispatch(chatActions.disconnect())
    }
  }, [chatId, user, dispatch, data.id])

  const handleConfirmRead = useEffectEvent(() => {
    if (!user) return

    if (isPageVisible) {
      dispatch(chatListActions.resetUnread({ chatId }))

      const unreadMessages = messages.filter(
        (message) =>
          message.senderId !== user.id && !message.status.startsWith('seen'),
      )

      if (!unreadMessages.length) return

      unreadMessages.forEach((message) => {
        dispatch(
          chatActions.sendAck({
            userId: user.id,
            messageId: message.id,
            status: 'seen',
          }),
        )
      })
    }
  })

  useEffect(() => {
    handleConfirmRead()
  }, [messages, isPageVisible, user, dispatch, chatId])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [messages.length])

  return (
    <>
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 flex flex-col gap-4 max-w-[1216px] w-full overflow-y-auto"
      >
        {messages.map((message) => (
          <Message
            key={message.id}
            currentUserId={user!.id}
            message={message}
          />
        ))}
      </div>
      <FormMessage chatId={chatId} />
    </>
  )
}
