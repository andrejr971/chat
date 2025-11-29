import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { listMembersByChat } from '@/http/chats/list-members-by-chat'
import type { ChatSchema } from '@/http/schemas/chats'

interface InfoChatProps {
  chat: ChatSchema
}

export function InfoChat({ chat }: InfoChatProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['chats', chat.id, 'members'],
    queryFn: () => listMembersByChat(chat.id),
    refetchOnWindowFocus: true,
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

  return (
    <div className="w-full h-full bg-card flex flex-col">
      <header className="p-4 w-full border-b">
        <h3 className="font-semibold">Dados do chat</h3>
      </header>

      <div className="w-full flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Total de membros
          </span>
          <Badge variant="outline">{chat.totalMembers}</Badge>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4 gap-2">
        {data ? (
          data.map((member) => (
            <div
              key={member.id}
              className="flex gap-4 p-4 items-start justify-between bg-muted rounded-md"
            >
              <strong className="text-lg font-semibold">
                {member.username}
              </strong>
            </div>
          ))
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Não há membros no grupo</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}
