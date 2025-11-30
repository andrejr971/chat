import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { listAllChats } from '@/http/chats/list'

import { ChatEmtpy } from './-components/chat-empty'
import { ChatItem } from './-components/chat-item'

export const Route = createFileRoute('/chats/search')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ['chats'],
    queryFn: listAllChats,
    refetchOnWindowFocus: true,
  })

  return (
    <div className="w-full h-screen bg-muted flex flex-col gap-4 items-center">
      <header className="w-full p-4 border-b flex items-baseline gap-4 text-2xl bg-card">
        <Button size="icon" asChild variant="ghost">
          <Link to="/chats">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <strong className="font-semibold text-primary">Chat</strong>
          <span className="font-normal text-muted-foreground">.dev</span>
        </div>
      </header>

      <div className="max-w-[1216px] w-full p-4">
        {data ? (
          <ul className="list-none grid grid-cols-3 gap-4">
            {data.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </ul>
        ) : (
          <ChatEmtpy />
        )}
      </div>
    </div>
  )
}
