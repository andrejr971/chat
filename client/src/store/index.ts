import { configureStore } from '@reduxjs/toolkit'

import { chatReducer } from './chat'
import { websocketMiddleware } from './middleware/websocket'
import { usersReducer } from './users'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(websocketMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
