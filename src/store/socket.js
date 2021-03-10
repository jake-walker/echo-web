import Vue from 'vue';
import cryptoRandomString from 'crypto-random-string';
import RSA from 'node-rsa';
// import AES from 'crypto-js/aes';
// import CryptoJS from 'crypto-js';
import forge from 'node-forge';

const CLIENT_VERSION = "3.14";

class Message {
    author;
    type;
    subtype;
    data;
    metadata;
    encrypted;

    constructor(author="", type="", data="", subtype="", metadata=[], encrypted=true) {
        this.author = author;
        this.type = type;
        this.subtype = subtype;
        this.data = data;
        this.metadata = metadata;
        this.encrypted = encrypted;
    }

    encode(key) {
        let output = JSON.stringify({
            userid: this.author,
            messagetype: this.type,
            subtype: this.subtype,
            data: (typeof this.data === 'string' || this.data instanceof String) ? this.data : JSON.stringify(this.data),
            metadata: JSON.stringify(this.metadata)
        });

        if (this.encrypted) {
            const iv = forge.random.getBytesSync(16);

            const cipher = forge.cipher.createCipher("AES-CBC", key);
            cipher.start({ iv });
            cipher.update(forge.util.createBuffer(output));
            cipher.finish();

            output = JSON.stringify([
                forge.util.encode64(cipher.output.data),
                forge.util.encode64(iv)
            ]);
        }

        return Buffer.from(output);
    }

    static decode(data, decrypt, key) {
        const msg = new Message();

        if (decrypt) {
            const content = forge.util.createBuffer(forge.util.decode64(data[0]));
            const iv = forge.util.decode64(data[1]);
            const decipher = forge.cipher.createDecipher("AES-CBC", key);
            decipher.start({ iv });
            decipher.update(content);
            decipher.finish();

            data = JSON.parse(decipher.output.data);
        }

        msg.author = data.userid;
        msg.type = data.messagetype;
        msg.subtype = data.subtype;

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

        return msg;
    }
}

function doHandshake(socket, state, response=null) {
    if (state.handshakeState.substr(0, 3) == "req" && !response) {
        console.error("Handshake expected a response!", response);
        throw new Error("Handshake expected a response!");
    }

    console.debug(`Handshake state is ${state.handshakeState}!`);

    if (state.handshakeState == "begin") {
        state.handshakeState = "serverInfo";

        const reqServerInfo = new Message(state.userId, "serverInfoRequest");
        reqServerInfo.encrypted = false;
        socket.send(reqServerInfo.encode());

    } else if (state.handshakeState == "serverInfo") {
        state.handshakeState = "sessionKey";
        const resServerInfo = Message.decode(response, false);

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
        const resConnection = Message.decode(response, true, state.sessionKey);

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
    // } else if (state.handshakeState == "connectionResponse") {
    //     state.handshakeState = "done";

    //     const resServerInfo = Message.decode(response, true, state.sessionKey);
    //     // TODO: recursive message parsing
    //     state.channels = JSON.parse(resServerInfo.data[0])
    //     state.motd = resServerInfo[1]
    // }
}

function multiJsonParse(str) {
    let input = str;
    // Add a comma between two objects
    input = input.replace(/}{(?=([^"]*"[^"]*")*[^"]*$)/g, "},{");
    // Add a comma between two arrays
    input = input.replace(/\]\[(?=([^"]*"[^"]*")*[^"]*$)/g, "],[");
    // Add a comma between an array and object
    input = input.replace(/\]{(?=([^"]*"[^"]*")*[^"]*$)/g, "],{");
    input = input.replace(/}\[(?=([^"]*"[^"]*")*[^"]*$)/g, "},[");
    return JSON.parse("[" + input + "]");
}

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

        const msg = Message.decode(message, true, state.sessionKey);

        console.debug("Received message", msg);
    }
}

export default {
    state: () => ({
        userId: cryptoRandomString({ length: 16, type: 'alphanumeric' }),
        username: "echowebtest",
        password: "mypassword",
        host: "ws://localhost:9000",

        connected: false,
        sessionKey: "",
        handshakeState: "begin",
        channels: [],
        motd: ""
    }),
    mutations: {
        SOCKET_ONOPEN(state, event) {
            console.log("Websocket connected!", state, event);
            Vue.prototype.$socket = event.currentTarget;
            state.connected = false;
            state.handshakeState = "begin";
            doHandshake(event.currentTarget, state);
        },
        SOCKET_ONCLOSE(state, event) {
            console.log("Websocket disconnected!", state, event);
            state.connected = false;
        },
        SOCKET_ONERROR(state, event) {
            console.error(state, event);
        },
        SOCKET_ONMESSAGE(state, data) {
            handleMessage(Vue.prototype.$socket, state, data);
        }
    },
    actions: {
        sendMessage(context, message) {
            Vue.prototype.$socket.send(message);
        },
        connect({ rootState }) {
            const host = rootState.host;
            console.log(`Connecting to '${host}'...`);

            Vue.prototype.$connect(host);
        },
        // disconnect({ state, commit, rootState }) {

        // }
    }
}
