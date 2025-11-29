/* eslint-disable react-hooks/set-state-in-effect */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { updateNameChat } from '@/http/chats/update'
import type { ChatSchema } from '@/http/schemas/chats'

interface TitleChatProps {
  chat: ChatSchema
}

export function TitleChat({ chat }: TitleChatProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(chat.name)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chat.name) {
      setName(chat.name)
    }
  }, [chat.name])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const queryClient = useQueryClient()

  const { mutate: mutationUpdateNameChat, isPending } = useMutation({
    mutationKey: ['chats'],
    mutationFn: updateNameChat,
  })

  const handleSave = async () => {
    if (name === chat.name) {
      setIsEditing(false)
      return
    }

    mutationUpdateNameChat(
      {
        name,
        chatId: chat.id,
      },
      {
        onError: (error) => {
          setName(chat.name)
          toast.error(error.message)
          setIsEditing(false)
        },
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['chats'],
            type: 'all',
          })
          setIsEditing(false)
          toast.success('Chat atualizado com sucesso')
        },
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setName(chat.name)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        disabled={isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-[100px] px-2"
      />
    )
  }

  return (
    <h1
      className="font-semibold text-primary"
      onClick={() => setIsEditing(true)}
    >
      {chat.name}
    </h1>
  )
}
