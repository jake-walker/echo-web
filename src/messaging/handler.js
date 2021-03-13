
import { Message, UserMessage } from '../messaging/message';
import { multiJsonParse } from '../messaging/util';
import { doHandshake } from '../messaging/handshake';
import Vue from 'vue';

async function handleMessage(socket, state, data) {
    const incoming = await data.data.text();
    const messages = multiJsonParse(incoming);

    for (const message of messages) {
        console.debug("Handling message", message);

        if (state.handshakeState != "done") {
            if (!doHandshake(socket, state, message)) {
                continue;
            }
        }

        const msg = Message.decode(message, state.sessionKey);

        switch (msg.type) {
            case "serverData":
                state.channels = JSON.parse(msg.data[0]);
                state.motd = msg.data[1];
                break;
            case "channelUpdate":
                state.channel.members = msg.data;
                break;
            case "channelHistory":
                state.channel.messages = msg.data.map((item) => UserMessage.fromHistory(item));
                break;
            case "outboundMessage":
                state.channel.messages.push(UserMessage.fromOutboundMessage(msg));
                break;
            // case "additionalHistory":
            //     break;
            case "commandData":
                state.channel.messages.push(UserMessage.fromCommandData(msg));
                break;
            case "connectionTerminated":
                if (msg.subtype == "kick") {
                    state.disconnectReason = `You were kicked for ${msg.data.toLowerCase()}`;
                } else if (msg.subtype == "ban") {
                    state.disconnectReason = `You were banned for ${msg.data.toLowerCase()}`;
                } else {
                    state.disconnectReason = `Connection terminated because '${msg.subtype}' with reason '${msg.data}'`;
                }

                Vue.prototype.$disconnect();
                break;
            case "errorOccured":
                console.warn("Server reported an error", msg);
                break;
            default:
                console.info("Received message", msg);
                break;
        }
    }
}

export default handleMessage;
