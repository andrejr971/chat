import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import type { AppStore } from '@/store'

export type RouterContext = {
  queryClient: QueryClient
  store: AppStore
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
