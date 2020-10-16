class Message {
    channel;
    type;
    data;
    success;
    error;
    uuid;

    constructor(channel, type, data, success, error, uuid) {
        this.channel = channel;
        this.type = type;
        this.data = data;
        this.success = success;
        this.error = error;
        this.uuid = uuid;
    }
}
module.exports = Message;
