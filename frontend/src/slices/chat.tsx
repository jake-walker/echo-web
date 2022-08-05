import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatState {
  messages: any[];
  isEstablishingConnection: boolean;
  isConnected: boolean;
}

const initialState: ChatState = {
  messages: [],
  isEstablishingConnection: false,
  isConnected: false
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    startConnecting: (state) => {
      state.isEstablishingConnection = true;
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.isEstablishingConnection = true;
    },
    recieveMessage: (state, action: PayloadAction<{
      message: any
    }>) => {
      state.messages.push(action.payload.message);
    }
  }
});

export const chatActions = chatSlice.actions;

export default chatSlice;
