import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/chats/_main/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <h3 className="text-lg font-semibold text-primary">
          Nenhum chat selecionado
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Selecione um chat para começar uma conversa
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/chats/search">Procurar chat</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
