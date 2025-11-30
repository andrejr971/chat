import { MessageCircle } from 'lucide-react'

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface ChatEmptyProps {
  title?: string
}

export function ChatEmtpy({
  title = ' Nenhuma mensagem ainda. Abra outra aba e envie algo!',
}: ChatEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageCircle />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
}
