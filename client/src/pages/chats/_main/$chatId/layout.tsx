import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Info, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { showChatDetail } from '@/http/chats/show'

import { ChatEmtpy } from '../../-components/chat-empty'
import { InfoChat } from './-components/info'
import { LoadingChat } from './-components/loading-chat'
import { TitleChat } from './-components/title-chat'

export const loadChatDetailOptions = (chatId: string) =>
  queryOptions({
    queryKey: ['chats', chatId],
    queryFn: async () => showChatDetail(chatId),
    refetchOnWindowFocus: true,
  })

export const Route = createFileRoute('/chats/_main/$chatId')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params: { chatId } }) =>
    queryClient.ensureQueryData(loadChatDetailOptions(chatId)),
  errorComponent: () => <ChatEmtpy title="Chat não encontrado" />,
  pendingComponent: LoadingChat,
})

function RouteComponent() {
  const { chatId } = Route.useParams()
  const { data } = useSuspenseQuery(loadChatDetailOptions(chatId))

  const [openDetail, setOpenDetail] = useState(false)

  const handleOpenDetail = () => {
    setOpenDetail((state) => !state)
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
      <ResizablePanel className="h-full flex flex-col items-center">
        <header className="w-full p-4 border-b flex items-baseline justify-between text-2xl">
          <TitleChat chat={data} />
          <Button variant={'outline'} size={'icon'} onClick={handleOpenDetail}>
            {openDetail ? (
              <X className="size-4" />
            ) : (
              <Info className="size-4" />
            )}
          </Button>
        </header>

        <Outlet />
      </ResizablePanel>
      {openDetail && (
        <>
          <ResizableHandle />
          <ResizablePanel maxSize={40} minSize={20} defaultSize={25}>
            <InfoChat chat={data} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
