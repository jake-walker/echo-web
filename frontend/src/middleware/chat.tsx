import { showNotification } from "@mantine/notifications";
import { Middleware } from "@reduxjs/toolkit";
import chat, { chatActions } from "../slices/chat";
import { RootState } from "../store";

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
	ResAdditionalHistory = "additionalHistory",
  ResUserlistUpdate = "userlistUpdate"
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
  date: string;
}

const defaultMetadata = ['Unknown', '#ffffff', '0'];

const chatMiddleware: Middleware = (store) => {
  let socket: WebSocket | null = null;

  return (next) => (action) => {
    if (chatActions.connect.match(action) && socket === null) {
      const nextState: RootState = store.getState();

      let connectionString = `${nextState.chat.bridgeAddress}?server=${nextState.chat.serverId}&username=${nextState.chat.username}`;
      connectionString = connectionString.replace("http://", "ws://").replace("https://", "wss://");
      if (nextState.chat.password && nextState.chat.password !== "") {
        connectionString += `&password=${nextState.chat.password}`;
      }

      console.log(`Connecting to ${connectionString}...`);

      socket = new WebSocket(connectionString);

      socket.onopen = () => {
        store.dispatch(chatActions.connected());
        socket?.send(JSON.stringify({
          messagetype: MessageType.ReqInfo
        }));
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          showNotification({
            title: "Bridge Error",
            message: `The bridge reported an error: ${data.error}`,
            color: "orange"
          });
          console.warn("Bridge error", data.error);
          return;
        }

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
            store.dispatch(chatActions.setUsers({ users: JSON.parse(msg.data[2]).map((user: any) => {
              return user[0];
            })}));
            break;
          case MessageType.ResOutboundMessage:
            let outboundMessageMetadata = msg.metadata || defaultMetadata;
            store.dispatch(chatActions.recieveMessage({ message: {
              author: outboundMessageMetadata[0],
              content: msg.data,
              color: outboundMessageMetadata[1],
              date: (new Date(parseInt(outboundMessageMetadata[2]) * 1000)).toLocaleString()
            }}))
            break;
          case MessageType.ResCommandData:
            let commandDataMetadata = msg.metadata || defaultMetadata;
            store.dispatch(chatActions.recieveMessage({ message: {
              author: commandDataMetadata[0],
              content: msg.data.join("\n"),
              color: commandDataMetadata[1],
              date: (new Date(parseInt(commandDataMetadata[2]) * 1000)).toLocaleString()
            }}));
            break;
          case MessageType.ResChannelHistory:
            store.dispatch(chatActions.addMessages({
              messages: msg.data.map((message: any) => ({
                author: message[0],
                content: message[3],
                color: message[4],
                date: (new Date(parseInt(message[5]) * 1000)).toLocaleString()
              }))
            }))
            break;
          case MessageType.ResChannelUpdate:
            const [user, fromChannel, toChannel] = msg.data;
            store.dispatch(chatActions.updateUsers({
              user,
              fromChannel,
              toChannel
            }));
            break;
          case MessageType.ResConnectionTerminated:
            store.dispatch(chatActions.recieveMessage({ message: {
              author: "Server",
              content: msg.data,
              color: '#ff0000',
              date: (new Date()).toLocaleString()
            }}));
            socket?.close();
            break;
          case MessageType.ResUserlistUpdate:
            break;
          default:
            store.dispatch(chatActions.recieveMessage({ message: {
              author: 'Server',
              content: JSON.stringify(msg),
              color: '#ff0000',
              date: (new Date()).toLocaleString()
            }}));
        }
      }

      socket.onclose = () => {
        store.dispatch(chatActions.disconnected());
        socket = null;
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
