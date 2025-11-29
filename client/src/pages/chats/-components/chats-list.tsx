import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { useAppSelector } from '@/hooks/store'
import { listMyChats } from '@/http/users/list-my-chats'
import { cn } from '@/lib/utils'

import { ChatEmtpy } from './chat-empty'

export function ChatsList() {
  const state = useAppSelector((state) => state.users)
  const user = state.user!

  const { data, isLoading } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: () => listMyChats(user?.id),
    refetchOnWindowFocus: true,
  })

  const { chatId } = useParams({
    strict: false,
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <ChatEmtpy />
  }

  return (
    <div className="flex-1 flex flex-col">
      {data?.map((chat) => (
        <Link
          key={chat.id}
          to="/chats/$chatId"
          params={{
            chatId: chat.id,
          }}
          className={cn(
            'flex gap-4 p-4 items-start justify-between hover:bg-muted transition-colors cursor-pointer border-b',
            chatId && chatId === chat.id && 'bg-muted',
          )}
        >
          <strong className="text-lg font-semibold">{chat.name}</strong>
          <span className="text-muted-foreground text-sm">
            {chat.updatedAt}
          </span>
        </Link>
      ))}
    </div>
  )
}
