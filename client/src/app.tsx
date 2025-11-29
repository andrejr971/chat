import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { RouterProvider } from '@tanstack/react-router'
import { Provider } from 'react-redux'

import { Toaster } from './components/ui/sonner'
import { queryClient } from './lib/queryClient'
import { routeTree } from './routeTree.gen'
import { store } from './store'

const router = createRouter({
  routeTree,
  context: {
    queryClient,
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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </Provider>
  )
}
