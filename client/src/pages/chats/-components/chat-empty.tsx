import { Link } from '@tanstack/react-router'
import { MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

import { ModalCreateChat } from './modal-create-chat'

interface ChatEmptyProps {
  title?: string
}

export function ChatEmtpy({
  title = 'Não foi encontrado nenhum chat que você participa',
}: ChatEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageCircle />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          Você pode criar um novo chat ou procurar por um já existente para
          participar
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <ModalCreateChat>
            <Button>Criar chat</Button>
          </ModalCreateChat>
          <Button variant="outline" asChild>
            <Link to="/chats/search">Procurar chat</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
