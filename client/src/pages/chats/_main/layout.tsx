import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Sidebar } from '../-components/sidebar'

export const Route = createFileRoute('/chats/_main')({
  component: RouteComponent,
  beforeLoad: ({ context: { store } }) => {
    const state = store.getState()
    const isUser = state.users.user

    if (!isUser) {
      throw redirect({
        to: '/',
      })
    }
  },
})

function RouteComponent() {
  return (
    <div className="w-screen h-screen bg-muted">
      <div className="grid grid-cols-[460px_1fr] h-full">
        <Sidebar />

        <div className="w-full h-full flex flex-col items-center">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
