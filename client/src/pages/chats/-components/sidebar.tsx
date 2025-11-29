import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ChatsList } from './chats-list'
import { ModalCreateChat } from './modal-create-chat'

export function Sidebar() {
  return (
    <div className="border-r w-full h-full bg-card flex flex-col">
      <header className="w-full p-4 border-b flex items-baseline text-2xl justify-between">
        <div>
          <strong className="font-semibold text-primary">Chat</strong>
          <span className="font-normal text-muted-foreground">.dev</span>
        </div>
        <ModalCreateChat>
          <Button variant="outline" type="button">
            Novo chat
            <Plus className="size-4" />
          </Button>
        </ModalCreateChat>
      </header>

      <ChatsList />

      <div className="w-full p-4 border-t">
        <Button variant="outline" className="w-full" asChild>
          <Link to="/chats/search">Encontrar outros chats</Link>
        </Button>
      </div>
    </div>
  )
}
