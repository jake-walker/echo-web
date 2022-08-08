import { Middleware } from "@reduxjs/toolkit";
import chat, { chatActions } from "../slices/chat";

enum MessageType {
  ReqServerInfo = "serverInfoRequest",
	ReqClientSecret = "clientSecret",
	ReqConnection = "connectionRequest",
	ReqDisconnect = "disconnect",
	ReqInfo = "requestInfo",
	ReqUserMessage = "userMessage",
	ReqChangeChannel = "changeChannel",
	ReqHistory = "historyRequest",
	ReqLeaveChannel = "leaveChannel",

	ResServerData = "serverData",
	ResClientSecret = "gotSecret",
	ResConnectionAccepted = "CRAccepted",
	ResConnectionDenied = "CRDenied",
	ResOutboundMessage = "outboundMessage",
	ResConnectionTerminated = "connectionTerminated",
	ResChannelUpdate = "channelUpdate",
	ResCommandData = "commandData",
	ResChannelHistory = "channelHistory",
	ResErrorOccurred = "errorOccured",
	ResAdditionalHistory = "additionalHistory"
}

interface ServerMessage {
  userid?: string
  messagetype: MessageType;
  subtype?: string;
  data: any;
  metadata?: string;
}

export interface ChatMessage {
  content: string;
  author: string;
  color: string;
  date: number;
}

const defaultMetadata = ['Unknown', '#ffffff', '0'];

const chatMiddleware: Middleware = (store) => {
  let socket: WebSocket | null = null;

  return (next) => (action) => {
    if (chatActions.connect.match(action) && socket === null) {
      socket = new WebSocket("ws://127.0.0.1:4000?server=127.0.0.1:16000&username=jake&password=password");

      socket.onopen = () => {
        store.dispatch(chatActions.connected());
        socket?.send(JSON.stringify({
          messagetype: MessageType.ReqInfo
        }));
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const msg: ServerMessage = {
          userid: data.userid || '0',
          messagetype: data.messagetype,
          subtype: data.subtype,
          data: "",
          metadata: "",
        };

        try {
          msg.data = JSON.parse(data.data);
        } catch (SyntaxError) {
          msg.data = data.data;
        }

        try {
          msg.metadata = JSON.parse(data.metadata);
        } catch (SyntaxError) {
          msg.metadata = data.metadata;
        }

        console.log(msg);

        switch (msg.messagetype) {
          case MessageType.ResServerData:
            store.dispatch(chatActions.updateChannels({ channels: JSON.parse(msg.data[0]) }));
            store.dispatch(chatActions.updateMotd({ motd: msg.data[1] }));
            store.dispatch(chatActions.updateUsers({ users: JSON.parse(msg.data[2]).map((user) => {
              return user[0];
            })}));
            break;
          case MessageType.ResOutboundMessage:
            let metadata = msg.metadata || defaultMetadata;
            store.dispatch(chatActions.recieveMessage({ message: {
              author: metadata[0],
              content: msg.data,
              color: metadata[1],
              date: 0
            }}))
            break;
          case MessageType.ResCommandData:
            metadata = msg.metadata || defaultMetadata;
            store.dispatch(chatActions.recieveMessage({ message: {
              author: metadata[0],
              content: msg.data,
              color: metadata[1],
              date: 0
            }}));
            break;
          default:
            store.dispatch(chatActions.recieveMessage({ message: {
              author: 'Server',
              content: JSON.stringify(msg),
              color: '#ff0000',
              date: 0
            }}));
        }
      }

      socket.onclose = () => {
        store.dispatch(chatActions.disconnected());
      }

      socket.onerror = (event) => {
        console.error('ws error', event);
      }
    } else if (chatActions.disconnect.match(action) && socket !== null) {
      socket.close();
      socket = null;
    } else if (chatActions.changeChannel.match(action) && socket !== null) {
      const changeChannelMessage: ServerMessage = {
        messagetype: MessageType.ReqChangeChannel,
        data: action.payload.channel
      }
      socket.send(JSON.stringify(changeChannelMessage));
    } else if (chatActions.sendMessage.match(action) && socket !== null) {
      const sendMessage: ServerMessage = {
        messagetype: MessageType.ReqUserMessage,
        data: action.payload.content
      }
      socket.send(JSON.stringify(sendMessage));
    }

    next(action);
  }
};

export default chatMiddleware;
