import forge from 'node-forge';

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
            if (!key) {
                throw new Error("No key is defined for encrypting the message!");
            }

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

    static decode(data, key) {
        const msg = new Message();

        msg.encrypted = false;

        if (key) {
            const content = forge.util.createBuffer(forge.util.decode64(data[0]));
            const iv = forge.util.decode64(data[1]);
            const decipher = forge.cipher.createDecipher("AES-CBC", key);
            decipher.start({ iv });
            decipher.update(content);
            decipher.finish();

            data = JSON.parse(decipher.output.data);

            msg.encrypted = true;
        }

        msg.author = data.userid;
        msg.type = data.messagetype;
        msg.subtype = data.subtype;

        // TODO: Recursively parse data
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

function parseContent(content) {
    let output = content;

    if (Array.isArray(content)) {
        output = content.join("<br>");
    }

    return output;
}

class UserMessage {
    author;
    sent;
    content;
    color;

    constructor(author = "", sent = new Date(), content = "", color = "#000000") {
        this.author = author;
        this.sent = sent;
        this.content = content;
        this.color = color;
    }

    static fromHistory(item) {
        const msg = new UserMessage();

        msg.author = item[0];
        msg.sent = new Date(item[2]);
        msg.content = parseContent(item[3]);
        msg.color = item[4];

        return msg;
    }

    static fromOutboundMessage(item) {
        const msg = new UserMessage();

        msg.author = item.metadata[0];
        msg.sent = new Date(item.metadata[2]);
        msg.content = parseContent(item.data);
        msg.color = item.metadata[1];

        return msg;
    }

    static fromCommandData(item) {
        const msg = new UserMessage();

        msg.author = item.metadata[0];
        msg.sent = new Date(item.metadata[2]);
        msg.content = parseContent(item.data);
        msg.color = item.metadata[1];

        return msg;
    }
}

export {
    Message,
    UserMessage
}
