import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { listMessagesByChat } from '@/http/chats/list-messages'

export type MessageStatus =
  | 'pending'
  | 'sent'
  | 'delivered_partial'
  | 'delivered_all'
  | 'seen_partial'
  | 'seen_all'

export type ChatMessage = {
  id: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  status: MessageStatus
  deliveredCount: number
  seenCount: number
  totalParticipants: number
}

export type PayloadChatMessage = {
  chatId: string
  senderId: string
  senderName: string
  content: string
  status: MessageStatus
}

export type WebSocketStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'closed'
  | 'error'

type ChatState = {
  messages: ChatMessage[]
  connected: boolean
  chatId?: string
}

const initialState: ChatState = {
  messages: [],
  connected: false,
}

export const fetchMessages = createAsyncThunk<
  ChatMessage[],
  { chatId: string }
>('chat/fetchMessages', async ({ chatId }) => {
  const res = await listMessagesByChat(chatId)
  return res as ChatMessage[]
})

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    wsConnected(state, action: PayloadAction<{ chatId: string }>) {
      state.connected = true
      state.chatId = action.payload.chatId
    },
    wsDisconnected(state) {
      state.connected = false
      state.chatId = undefined
    },
    messageSent(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload)
    },
    messageReceived(state, action: PayloadAction<ChatMessage>) {
      const incoming = action.payload
      const existing = state.messages.find(
        (message) => message.id === incoming.id,
      )

      if (existing) {
        Object.assign(existing, incoming)
      } else {
        state.messages.push(incoming)
      }
    },
    messageStatusUpdated(
      state,
      action: PayloadAction<{
        messageId: string
        status: MessageStatus
        deliveredCount: number
        seenCount: number
        totalParticipants: number
      }>,
    ) {
      const message = state.messages.find(
        (m) => m.id === action.payload.messageId,
      )
      if (!message) return

      message.status = action.payload.status
      message.deliveredCount = action.payload.deliveredCount
      message.seenCount = action.payload.seenCount
      message.totalParticipants = action.payload.totalParticipants
    },
    connect(
      _state,
      _action: PayloadAction<{
        chatId: string
        userId: string
        username: string
      }>,
    ) {},
    disconnect() {},

    sendMessage(
      _state,
      _action: PayloadAction<{ message: PayloadChatMessage }>,
    ) {},

    sendAck(
      _state,
      _action: PayloadAction<{
        messageId: string
        userId: string
        status: 'delivered' | 'seen'
      }>,
    ) {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload
    })
  },
})

export const chatReducer = chatSlice.reducer
export const chatActions = chatSlice.actions

interface ChatSummary {
  id: string
  name: string
  avatar?: string | null

  lastMessage?: {
    id: string
    content: string
    senderId: string
    createdAt: string
    status: MessageStatus
  }

  unreadCount: number
}

interface ChatListState {
  chats: ChatSummary[]
  selectedChatId: string | null
  loading: boolean
  error: string | null
}

export const chatListSlice = createSlice({
  name: 'chatList',
  initialState: {
    chats: [],
    selectedChatId: null,
    loading: false,
    error: null,
  } as ChatListState,
  reducers: {
    setChats(state, action: PayloadAction<ChatSummary[]>) {
      state.chats = action.payload
    },

    selectChat(state, action: PayloadAction<string>) {
      state.selectedChatId = action.payload
    },

    incrementUnread(state, action: PayloadAction<{ chatId: string }>) {
      const chat = state.chats.find((chat) => chat.id === action.payload.chatId)
      if (chat) chat.unreadCount += 1
    },

    resetUnread(state, action: PayloadAction<{ chatId: string }>) {
      const chat = state.chats.find((chat) => chat.id === action.payload.chatId)
      if (chat) chat.unreadCount = 0
    },

    updateLastMessage(
      state,
      action: PayloadAction<{
        chatId: string
        message: ChatSummary['lastMessage']
      }>,
    ) {
      const chat = state.chats.find((chat) => chat.id === action.payload.chatId)
      if (chat) chat.lastMessage = action.payload.message
    },
  },
})

export const chatListReducer = chatListSlice.reducer
export const chatListActions = chatListSlice.actions
