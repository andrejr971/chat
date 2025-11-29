import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listAllChats } from '@/http/chats/list'

import { ChatEmtpy } from './-components/chat-empty'

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
              <li
                key={chat.id}
                className="flex flex-col gap-4 bg-card rounded-md border"
              >
                <div className="flex flex-col gap-2 p-4 pb-0">
                  <strong className="text-lg font-semibold ">
                    {chat.name}
                  </strong>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                      Total de membros
                    </span>
                    <Badge variant="outline">{chat.totalMembers}</Badge>
                  </div>
                </div>
                <div className="w-full p-4 border-t">
                  <Button variant="outline" className="w-full">
                    Entrar no chat
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ChatEmtpy />
        )}
      </div>
    </div>
  )
}
