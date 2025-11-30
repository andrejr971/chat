import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import type { AppStore } from '@/store'

export type RouterContext = {
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
