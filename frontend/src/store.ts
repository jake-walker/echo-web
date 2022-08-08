import { configureStore } from '@reduxjs/toolkit';
import chatMiddleware from './middleware/chat';
import chatSlice from './slices/chat';

export const store = configureStore({
  reducer: {
    chat: chatSlice
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat([chatMiddleware])
  }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
