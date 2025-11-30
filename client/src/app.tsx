import { createRouter } from '@tanstack/react-router'
import { RouterProvider } from '@tanstack/react-router'
import { Provider } from 'react-redux'

import { Toaster } from './components/ui/sonner'
import { routeTree } from './routeTree.gen'
import { store } from './store'

const router = createRouter({
  routeTree,
  context: {
    store,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster />
    </Provider>
  )
}
