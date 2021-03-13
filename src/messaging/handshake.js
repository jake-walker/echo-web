import { Message } from '../messaging/message';
import cryptoRandomString from 'crypto-random-string';
import RSA from 'node-rsa';

const CLIENT_VERSION = "3.14";

function doHandshake(socket, state, response=null) {
    console.debug(`Handshake state is ${state.handshakeState}!`);

    if (state.handshakeState == "begin") {
        state.handshakeState = "serverInfo";

        const reqServerInfo = new Message(state.userId, "serverInfoRequest");
        reqServerInfo.encrypted = false;
        socket.send(reqServerInfo.encode());

    } else if (state.handshakeState == "serverInfo") {
        state.handshakeState = "sessionKey";
        const resServerInfo = Message.decode(response);

        // TODO: Use node-forge instead of node-rsa
        state.sessionKey = cryptoRandomString({ length: 16 });
        const key = new RSA(resServerInfo.data);
        const encryptedSessionKey = key.encrypt(Buffer.from(state.sessionKey), "base64");

        const reqSessionKey = new Message(state.userId, "clientSecret", encryptedSessionKey);
        reqSessionKey.encrypted = false;
        socket.send(reqSessionKey.encode());

    } else if (state.handshakeState == "sessionKey") {
        state.handshakeState = "connectionRequest";

        const reqConnection = new Message(state.userId, "connectionRequest", [
            state.username,
            state.password,
            CLIENT_VERSION
        ]);
        socket.send(reqConnection.encode(state.sessionKey));

    } else if (state.handshakeState == "connectionRequest") {
        const resConnection = Message.decode(response, state.sessionKey);

        if (resConnection.type == "CRDenied") {
            console.error("Handshake failed", resConnection.data);
            throw new Error("Handshake failed!");
        } else if (resConnection.type == "CRAccepted") {
            console.info("Handshake connection accepted!");
            state.handshakeState = "done";
        } else if (resConnection.type == "serverData") {
            state.handshakeState = "done";
            return true;
        }
    }
}

export {
    doHandshake
}
