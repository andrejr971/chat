import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCheck, Info, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { showChatDetail } from '@/http/chats/show'

import { ChatEmtpy } from '../../-components/chat-empty'
import { LoadingChat } from './-components/loading-chat'
import { TitleChat } from './-components/title-chat'

const loadChatDetailOptions = (chatId: string) =>
  queryOptions({
    queryKey: ['chats', chatId],
    queryFn: async () => showChatDetail(chatId),
    refetchOnWindowFocus: true,
  })

export const Route = createFileRoute('/chats/_main/$chatId/')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params: { chatId } }) =>
    queryClient.ensureQueryData(loadChatDetailOptions(chatId)),
  errorComponent: () => <ChatEmtpy title="Chat não encontrado" />,
  pendingComponent: LoadingChat,
})

function RouteComponent() {
  const { chatId } = Route.useParams()
  const { data } = useSuspenseQuery(loadChatDetailOptions(chatId))

  return (
    <>
      <header className="w-full p-4 border-b flex items-baseline justify-between text-2xl">
        <TitleChat chat={data} />
        <div>
          <Button variant={'outline'} size={'icon'}>
            <Info className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-4 max-w-[1216px] w-full">
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <header className="flex items-center gap-2">
              <strong className="font-semibold text-sm">andrejr.dev</strong>
              <span className="text-muted-foreground text-sm">
                há 2 minutos
              </span>
            </header>
            <div className="bg-background min-w-[120px] max-w-md w-fit p-4 text-md flex flex-col gap-2 rounded-md items-end">
              <p className="w-full">Oi</p>
              <CheckCheck className="size-3 text-green-500" />
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <header className="flex items-center gap-2">
              <strong className="font-semibold text-sm">andrejr.dev</strong>
              <span className="text-muted-foreground text-sm">
                há 2 minutos
              </span>
            </header>
            <div className="bg-background min-w-[120px] max-w-md w-fit p-4 text-md flex flex-col gap-2 rounded-md items-end">
              <p className="w-full">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Harum
                culpa, placeat rerum maiores eligendi nihil, quam voluptas vel
                dicta consectetur accusamus esse labore incidunt accusantium? In
                corporis minus omnis cumque.
              </p>
              <CheckCheck className="size-3 text-green-500" />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end">
          <div className="flex flex-col gap-2">
            <header className="flex items-center gap-2">
              <strong className="font-semibold text-sm">Você</strong>
              <span className="text-muted-foreground text-sm">
                há 2 minutos
              </span>
            </header>
            <div className="bg-zinc-200 min-w-[120px] max-w-md w-fit p-4 text-md flex flex-col gap-2 rounded-md items-end">
              <p className="w-full">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Harum
                culpa, placeat rerum maiores eligendi nihil, quam voluptas vel
                dicta consectetur accusamus esse labore incidunt accusantium? In
                corporis minus omnis cumque.
              </p>
              <CheckCheck className="size-3 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-4 max-w-[1216px]">
        <Card className="p-4">
          <CardContent className="p-0">
            <form className="w-full flex gap-2">
              <Input
                placeholder="Escreva a sua mensagem"
                className="bg-transparent border-0 outline-0 focus-visible:border-0 focus-visible:ring-ring/0 shadow-none flex-1"
              />
              <Button size="icon">
                <Send className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
